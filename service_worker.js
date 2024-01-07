chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        // 새 탭이 열리거나 페이지가 로드될 때 content.js에 메시지를 보냅니다.
        chrome.tabs.sendMessage(tabId, { action: "init" });
    }
});