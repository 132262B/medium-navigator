import { logger } from './utils/logger';

interface StorageResult {
  navigatorEnabled?: boolean;
}

interface ToggleMessage {
  action: string;
  enabled: boolean;
}

document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('navigatorToggle') as HTMLInputElement;
  const statusText = document.getElementById('statusText') as HTMLSpanElement;

  function updateStatusText(isEnabled: boolean): void {
    statusText.textContent = isEnabled ? 'Navigation is enabled' : 'Navigation is disabled';
    logger.log('Status text updated:', isEnabled ? 'Navigation is enabled' : 'Navigation is disabled');
  }

  // 초기 상태 로드
  chrome.storage.local.get(['navigatorEnabled'], function(result: StorageResult) {
    const isEnabled = result.navigatorEnabled !== false;
    logger.log('Initial state loaded:', isEnabled);
    toggle.checked = isEnabled;
    updateStatusText(isEnabled);
  });

  // 토글 변경 이벤트 처리
  toggle.addEventListener('change', function() {
    const isEnabled = toggle.checked;
    logger.log('Toggle changed to:', isEnabled);
    
    // 스토리지에 상태 저장
    chrome.storage.local.set({ navigatorEnabled: isEnabled }, function() {
      logger.log('State saved to storage:', isEnabled);
      updateStatusText(isEnabled);
      
      // 백그라운드 스크립트에 상태 변경 알림
      chrome.runtime.sendMessage({
        action: 'navigatorStateChanged',
        enabled: isEnabled
      } as ToggleMessage, function(response) {
        logger.log('State change message sent to background, response:', response);
      });
      
      // 현재 활성 탭에만 상태 적용
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('medium.com')) {
          try {
            logger.log('Sending message to current tab:', tabs[0].id);
            chrome.tabs.sendMessage(tabs[0].id!, {
              action: 'toggleNavigator',
              enabled: isEnabled
            } as ToggleMessage);
          } catch (error) {
            logger.error('Error sending message to tab:', error);
          }
        }
      });
    });
  });
});
