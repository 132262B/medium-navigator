'use strict';

import { isNavigation, findSectionElement, isMedium } from '@/utils/findUtil';
import { createNavigation } from '@/utils/manipulationUtil';
import { findTagLocationEvent, footerDetectEvent } from '@/event/visibleEvent';
import { stateReset } from '@/constants/state';
import { logger } from './utils/logger';
import { classField } from './constants/constants';

/**
 * 네비게이터 상태 관리 모듈
 */
const navigatorState = (() => {
  // 상태 변수들을 클로저 내에 보관
  let _isEnabled = true;
  let _isInitialized = false;
  let _isInitializing = false;

  return {
    /**
     * 활성화 상태 getter
     */
    get isEnabled() {
      return _isEnabled;
    },
    
    /**
     * 활성화 상태 setter
     */
    set isEnabled(value) {
      _isEnabled = value;
    },
    
    /**
     * 초기화 완료 상태 getter
     */
    get isInitialized() {
      return _isInitialized;
    },
    
    /**
     * 초기화 완료 상태 setter
     */
    set isInitialized(value) {
      _isInitialized = value;
    },
    
    /**
     * 초기화 진행 중 상태 getter
     */
    get isInitializing() {
      return _isInitializing;
    },
    
    /**
     * 초기화 진행 중 상태 setter
     */
    set isInitializing(value) {
      _isInitializing = value;
    },
    
    /**
     * 상태 초기화 함수
     */
    reset() {
      _isInitialized = false;
      _isInitializing = false;
    }
  };
})();

/**
 * 네비게이션 UI 관련 유틸리티 함수들
 */
const navigatorUI = (() => {
  /**
   * 기존 네비게이션 요소를 제거합니다.
   */
  const removeExistingNavigation = () => {
    logger.log('네비게이션 요소 제거 시도');
    const navigations = document.querySelectorAll(`.${classField.navigationClassName}`);
    
    if (navigations.length === 0) {
      logger.log('제거할 네비게이션 요소 없음');
      return;
    }

    logger.log(`${navigations.length}개의 네비게이션 요소 제거`);
    navigations.forEach(nav => {
      if (nav?.parentNode) {
        nav.parentNode.removeChild(nav);
      }
    });
    logger.log('네비게이션 요소 제거 완료');
  };
  
  return {
    removeExistingNavigation
  };
})();

/**
 * 네비게이터 관리 함수들
 */
const navigatorManager = (() => {
  /**
   * 초기화를 건너뛰어야 하는지 확인합니다.
   */
  const shouldSkipInitialization = () => {
    if (navigatorState.isInitializing || navigatorState.isInitialized) {
      logger.log('이미 초기화 중이거나 초기화된 상태입니다.');
      return true;
    }

    if (!isMedium()) {
      logger.log('Medium 블로그가 아님, 초기화 취소');
      return true;
    }

    return false;
  };

  /**
   * 필요한 이벤트들을 설정합니다.
   */
  const setupEvents = () => {
    logger.log('이벤트 리스너 및 상태 초기화');
    footerDetectEvent();
    stateReset();
    findTagLocationEvent();
  };

  /**
   * 가능한 경우 네비게이션을 생성합니다.
   */
  const createNavigationIfPossible = async () => {
    logger.log('섹션 요소 찾는 중');
    const sectionElement = findSectionElement();
    
    if (!sectionElement) {
      logger.log('섹션 요소를 찾을 수 없음, 네비게이션 생성 취소');
      return;
    }

    logger.log('네비게이션 생성 시작');
    createNavigation(sectionElement);
    logger.log('네비게이션 생성 완료');
  };

  /**
   * 네비게이션을 초기화하고 필요한 이벤트를 설정합니다.
   */
  const initializeNavigation = async () => {
    navigatorUI.removeExistingNavigation();

    if (!navigatorState.isEnabled) {
      logger.log('네비게이터가 비활성화됨, 네비게이션 생성 취소');
      return;
    }

    setupEvents();
    await createNavigationIfPossible();
    
    navigatorState.isInitialized = true;
  };

  /**
   * 네비게이션을 초기화합니다.
   */
  const initialize = async () => {
    if (shouldSkipInitialization()) {
      return;
    }

    navigatorState.isInitializing = true;
    logger.log('네비게이터 초기화 시작');

    try {
      await initializeNavigation();
    } catch (error) {
      logger.error('네비게이터 초기화 중 오류 발생:', error);
    } finally {
      navigatorState.isInitializing = false;
    }
  };

  /**
   * 네비게이터의 활성화 상태를 토글합니다.
   */
  const toggleNavigator = (enabled: boolean) => {
    navigatorState.isEnabled = enabled;
    navigatorState.reset();

    if (!enabled) {
      logger.log('네비게이터 비활성화 중');
      navigatorUI.removeExistingNavigation();
    } else {
      logger.log('네비게이터 활성화 중');
      initialize();
    }
  };

  return {
    initialize,
    toggleNavigator
  };
})();

// 타입 정의
interface ToggleMessage {
  action: string;
  enabled: boolean;
}

interface StorageResult {
  navigatorEnabled?: boolean;
}

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener((message: ToggleMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  logger.log('메시지 수신:', message);
  
  if (message.action === 'toggleNavigator') {
    navigatorManager.toggleNavigator(message.enabled);
    sendResponse?.({ success: true });
  }
});

// 초기 상태 로드 및 설정
chrome.storage.local.get(['navigatorEnabled'], (result: StorageResult) => {
  navigatorState.isEnabled = result.navigatorEnabled !== false;
  navigatorState.reset();
  
  logger.log('초기 상태 로드됨:', navigatorState.isEnabled);
  
  if (navigatorState.isEnabled) {
    navigatorManager.initialize();
  } else {
    navigatorUI.removeExistingNavigation();
  }
});

// 페이지 변경 감지 및 자동 초기화
(() => {
  let timeout: NodeJS.Timeout | null = null;
  let lastUrl = window.location.origin + window.location.pathname;

  // URL 변경 감지 함수
  const checkUrlChange = () => {
    const currentUrl = window.location.origin + window.location.pathname;
    if (currentUrl !== lastUrl) {
      logger.log('URL 변경 감지됨:', lastUrl, '->', currentUrl);
      lastUrl = currentUrl;
      
      // Medium 블로그가 아니면 무시
      if (!isMedium()) {
        logger.log('Medium 블로그가 아님, 네비게이션 초기화 취소');
        return;
      }
      
      // URL 변경 시 상태 초기화 및 네비게이션 재초기화
      navigatorState.reset();
      
      if (navigatorState.isEnabled) {
        logger.log('URL 변경으로 인한 네비게이터 초기화 예정');
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
          navigatorManager.initialize();
          timeout = null;
        }, 1000);
      }
    }
  };

  // 주기적으로 URL 변경 확인
  setInterval(checkUrlChange, 1000);

  // DOM 변경 감지
  const observer = new MutationObserver(mutations => {
    if (timeout || navigatorState.isInitializing || navigatorState.isInitialized) return;

    // Medium 블로그가 아니면 무시
    if (!isMedium()) return;

    const shouldInit = mutations.some(mutation => 
      Array.from(mutation.addedNodes).some(node => 
        node instanceof HTMLElement && 
        (node.tagName === 'ARTICLE' || node.querySelector('article'))
      )
    );

    if (shouldInit && navigatorState.isEnabled) {
      logger.log('페이지 변경 감지됨, 네비게이터 초기화 예정');
      timeout = setTimeout(() => {
        navigatorManager.initialize();
        timeout = null;
      }, 1000);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  logger.log('MutationObserver 실행 중');
})();
