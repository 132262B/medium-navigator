'use strict';

import { isNavigation, findSectionElement, isMedium } from '@/utils/findUtil';
import { createNavigation } from '@/utils/manipulationUtil';
import { findTagLocationEvent, footerDetectEvent, } from '@/event/visibleEvent';
import { stateReset } from '@/constants/state';

const init = () => {
  // Medium 블로그가 아닌 경우 실행하지 않습니다.
  if (!isMedium()) return;

  // 네비게이션이 이미 존재하면 더이상 생성되지 않습니다.
  if (isNavigation()) return;
  footerDetectEvent();

  stateReset();

  findTagLocationEvent();

  const sectionElement : HTMLElement | null = findSectionElement();
  if (sectionElement === null) return;

  createNavigation(sectionElement);
};

// MutationObserver를 사용해 페이지를 감지합니다.
(() => {
  let timeout : NodeJS.Timeout | null = null;
  const observer = new MutationObserver(mutations => {
    //console.log(timeout)
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

  const config = { childList: true, subtree: true };
  observer.observe(document.body, config);
})();
