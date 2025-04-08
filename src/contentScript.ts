'use strict';

import { isNavigation, findSectionElement, isMedium } from '@/utils/findUtil';
import { createNavigation } from '@/utils/manipulationUtil';
import { findTagLocationEvent, footerDetectEvent, } from '@/event/visibleEvent';
import { stateReset } from '@/constants/state';

let isEnabled = true;
let isInitialized = false; // 초기화 상태를 추적하는 플래그
let isInitializing = false; // 초기화 진행 중 상태를 추적하는 플래그

// 네비게이션 요소 제거 함수
function removeExistingNavigation() {
  console.log('네비게이션 요소 제거 시도');
  const navigations = document.querySelectorAll('.navigation-box');
  if (navigations.length > 0) {
    console.log(`${navigations.length}개의 네비게이션 요소 제거`);
    navigations.forEach(nav => {
      if (nav && nav.parentNode) {
        nav.parentNode.removeChild(nav);
      }
    });
    console.log('네비게이션 요소 제거 완료');
  } else {
    console.log('제거할 네비게이션 요소 없음');
  }
}

const init = () => {
  // 이미 초기화 중이거나 초기화된 상태면 중복 실행 방지
  if (isInitializing || isInitialized) {
    console.log('이미 초기화 중이거나 초기화된 상태입니다.');
    return;
  }

  isInitializing = true;
  console.log('네비게이터 초기화 시작');
  
  // Medium 블로그가 아닌 경우 실행하지 않습니다.
  if (!isMedium()) {
    console.log('Medium 블로그가 아님, 초기화 취소');
    isInitializing = false;
    return;
  }

  // 기존 네비게이션을 모두 제거
  removeExistingNavigation();
  
  // 토글 상태가 꺼져 있으면 네비게이션을 생성하지 않습니다
  if (!isEnabled) {
    console.log('네비게이터가 비활성화됨, 네비게이션 생성 취소');
    isInitializing = false;
    return;
  }
  
  console.log('이벤트 리스너 및 상태 초기화');
  footerDetectEvent();
  stateReset();
  findTagLocationEvent();

  console.log('섹션 요소 찾는 중');
  const sectionElement : HTMLElement | null = findSectionElement();
  if (sectionElement === null) {
    console.log('섹션 요소를 찾을 수 없음, 네비게이션 생성 취소');
    isInitializing = false;
    return;
  }

  console.log('네비게이션 생성 시작');
  createNavigation(sectionElement);
  console.log('네비게이션 생성 완료');
  isInitialized = true;
  isInitializing = false;
};

interface ToggleMessage {
  action: string;
  enabled: boolean;
}

// 토글 상태 변경 메시지 수신
chrome.runtime.onMessage.addListener((message: ToggleMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log('메시지 수신:', message);
  
  if (message.action === 'toggleNavigator') {
    console.log('토글 메시지 받음, 새 상태:', message.enabled);
    isEnabled = message.enabled;
    isInitialized = false;
    isInitializing = false;
    
    // 즉시 네비게이션 상태 업데이트
    if (!isEnabled) {
      console.log('네비게이터 비활성화 중');
      removeExistingNavigation();
    } else {
      console.log('네비게이터 활성화 중');
      init();
    }
    
    // 메시지 응답
    if (sendResponse) {
      console.log('메시지에 응답 전송');
      sendResponse({ success: true });
    }
  }
});

interface StorageResult {
  navigatorEnabled?: boolean;
}

// 페이지 로드시 초기 상태 로드
chrome.storage.local.get(['navigatorEnabled'], function(result: StorageResult) {
  isEnabled = result.navigatorEnabled !== false; // Default to true if not set
  isInitialized = false;
  isInitializing = false;
  
  console.log('초기 상태 로드됨:', isEnabled);
  
  if (isEnabled) {
    console.log('네비게이터 초기화 중');
    init();
  } else {
    console.log('네비게이터 비활성화됨, 네비게이션 제거 중');
    removeExistingNavigation();
  }
});

// MutationObserver를 사용해 페이지를 감지합니다.
(() => {
  let timeout : NodeJS.Timeout | null = null;
  const observer = new MutationObserver(mutations => {
    if (timeout || isInitializing || isInitialized) return; // 이미 타이머가 있거나 초기화 중이면 무시

    let shouldInit = false;
    mutations.forEach(mutation => {
      // article 요소가 추가된 경우에만 초기화 수행
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLElement && 
            (node.tagName === 'ARTICLE' || node.querySelector('article'))) {
          shouldInit = true;
        }
      });
    });

    if (shouldInit && isEnabled && !isInitialized && !isInitializing) {
      console.log('페이지 변경 감지됨, 네비게이터 초기화 예정');
      timeout = setTimeout(() => {
        console.log('네비게이터 활성화됨, 네비게이션 초기화 중');
        init();
        timeout = null;
      }, 1000);
    }
  });

  const config = { childList: true, subtree: true };
  observer.observe(document.body, config);
  console.log('MutationObserver 실행 중');
})();
