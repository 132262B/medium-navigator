'use strict';

import {isNavigation, findSectionElement} from '/src/utils/findUtil'
import {createNavigation} from "/src/utils/manipulationUtil";
import {footerDetectEvent} from "/src/event/visibleEvent.js";

const init = () => {
  // 네비게이션이 이미 존재하면 더이상 생성되지 않습니다.
  if (isNavigation()) return;

  footerDetectEvent();

  const sectionElement = findSectionElement();
  if (sectionElement === null) return;

  createNavigation(sectionElement);
}

// MutationObserver를 사용해 페이지를 감지합니다.
(() => {
  let timeout = null;
  const observer = new MutationObserver(mutations => {
    // 이미 타이머가 설정된 경우, 새로운 변경사항 무시
    if (timeout) return;

    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        init();
      }
    });

    // medium 사이트의 dom 변화가 너무 많아 부하가 발생하여 딜레이를 "1초" 추가함.
    timeout = setTimeout(() => {
      timeout = null;
    }, 1000);
  });

  const config = {childList: true, subtree: true};
  observer.observe(document.body, config);
})();
