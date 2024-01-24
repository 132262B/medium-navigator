//'use strict';

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'GREETINGS') {
//     const message = `Hi ${
//       sender.tab ? 'Con' : 'Pop'
//     }, my name is Bac. I am from Background. It's great to hear from you. ㅇㅇ`;
//
//     // Log message coming from the `request` parameter
//     sendResponse({
//       message,
//     });
//   }
// });

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    // 새 탭이 열리거나 페이지가 로드될 때 content.js에 메시지를 보냅니다.
    chrome.tabs.sendMessage(tabId, { action: "init" });
  }
});
