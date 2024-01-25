'use strict';

class Navigator {

  static _createFloatingDiv(navigation) {
    const floatingDiv = document.createElement('div');
    floatingDiv.className = 'navigation-box';
    floatingDiv.innerHTML = navigation;
    return floatingDiv;
  }

  static _getElementXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }

  static _selectXpath() {
    for (let i1 = 1; i1 <= 5; i1++) {
      for (let i2 = 1; i2 <= 5; i2++) {
        for (let i3 = 1; i3 <= 5; i3++) {
          const xpath = `//*[@id="root"]/div/div[${i1}]/div[${i2}]/div[${i3}]/article/div/div/section`;
          const element = this._getElementXpath(xpath);

          if (element) {
            return element;
          }
        }
      }
    }
  }

  static _createNavigationLinkElement(tag) {
    return `
                <a href="#${tag.id}" class="navigation-link navigation-link-${tag.tagName.toLowerCase()}">${tag.textContent}</a><br>
        `;
  }

  static init() {
    console.log('로그 출력 확인용')

    // 네비게이션이 이미 존재하면 더이상 생성되지 않습니다.
    const navigationDomLength = document.getElementsByClassName('navigation-box').length;
    if (navigationDomLength !== 0) {
      return;
    }

    const element = this._selectXpath();
    if (!element) return;

    let navigation = '';
    const hTags = element.querySelectorAll('h1, h2');
    hTags.forEach(tag => {
      if (tag.id) {
        navigation += this._createNavigationLinkElement(tag);
      }
    });

    const newDiv = this._createFloatingDiv(navigation);
    element.parentElement.appendChild(newDiv);
  }
}

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "init") {
//     setTimeout(()=> {
//       Navigator.init();
//     }, 1000);
//   }
// });


let timeout = null;

const observer = new MutationObserver(mutations => {
  // 이미 타이머가 설정된 경우, 새로운 변경사항 무시
  if (timeout) return;

  mutations.forEach(mutation => {
    if (mutation.addedNodes.length > 0) {
      Navigator.init();
    }
  });

  // medium 사이트의 dom 변화가 너무 많아 부하가 발생하여 딜레이를 "1초" 추가함.
  timeout = setTimeout(() => {
    timeout = null;
  }, 1000);
});

const config = { childList: true, subtree: true };
observer.observe(document.body, config);
