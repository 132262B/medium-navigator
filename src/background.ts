'use strict';

import { logger } from './utils/logger';

// 초기 상태 설정
chrome.runtime.onInstalled.addListener(() => {
  logger.log('Extension installed or updated');
  
  // 확장 프로그램 설치/업데이트 시 초기 상태 설정
  chrome.storage.local.set({ navigatorEnabled: true }, () => {
    logger.log('Initial state set to true on installation');
  });
});

// 탭 업데이트 이벤트 - Medium 페이지가 로드될 때 현재 상태 적용
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('medium.com')) {
    // 페이지 로드 완료 시 상태 확인
    chrome.storage.local.get(['navigatorEnabled'], function(result) {
      const isEnabled = result.navigatorEnabled !== false;
      logger.log('Tab updated, current state:', isEnabled);
      
      // 약간의 지연 후 메시지 전송 (콘텐츠 스크립트가 로드될 시간 확보)
      setTimeout(() => {
        try {
          logger.log('Sending state to tab:', tabId);
          chrome.tabs.sendMessage(tabId, {
            action: 'toggleNavigator',
            enabled: isEnabled
          });
        } catch (error) {
          logger.error('Error sending message to tab:', error);
        }
      }, 500);
    });
  }
});

// 메시지 리스너 추가
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 상태 조회 요청
  if (message.action === 'getNavigatorState') {
    chrome.storage.local.get(['navigatorEnabled'], function(result) {
      const isEnabled = result.navigatorEnabled !== false;
      logger.log('State requested, current state:', isEnabled);
      sendResponse({ enabled: isEnabled });
    });
    return true; // 비동기 응답을 위해 true 반환
  }
  
  // 상태 변경 알림 처리
  if (message.action === 'navigatorStateChanged') {
    logger.log('State change notification received:', message.enabled);
    // 현재 활성 탭에만 상태 변경 적용 (다른 탭은 필요할 때 자체적으로 상태를 로드)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].id) {
        try {
          logger.log('Applying state change to active tab:', tabs[0].id);
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleNavigator',
            enabled: message.enabled
          });
        } catch (error) {
          logger.error('Error applying state change:', error);
        }
      }
    });
  }
});
