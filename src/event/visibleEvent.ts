import { classField, valueAdjuster } from '@/constants/constants';
import { NavigatorContent, state } from '@/constants/state';
import { findFooterElement } from '@/utils/findUtil';

export const footerDetectEvent = () => {
  if (state.hiddenFlag) {
    state.hiddenFlag = false;

    const footer = findFooterElement();
    if (footer !== null) {

      window.addEventListener('scroll', () => {
        const footerRect = footer.getBoundingClientRect();
        const navigationElement = document.querySelector(`.${classField.navigationClassName}`);
        if (navigationElement !== null) {

          const shouldHide = footerRect.top <= 0;
          const isHidden = navigationElement.classList.contains(classField.hiddenClassName);

          if (shouldHide && !isHidden) {
            navigationElement.classList.add(classField.hiddenClassName);
          } else if (!shouldHide && isHidden) {
            navigationElement.classList.remove(classField.hiddenClassName);
          }
        }
      });
    }
  }
};

export const findTagLocationEvent = () => {
  let currentActiveTag: Element | null = null; // 현재 활성화된 태그를 추적하기 위한 변수

  window.addEventListener('scroll', () => {
    let currentScrollPosition = window.scrollY;

    state.contents.forEach((section: NavigatorContent) => {
      const sectionElement: Element | null = document.querySelector(`#n-${section.tagId}`);

      if (currentScrollPosition >= (section.scrollPosition - valueAdjuster.adjustmentTagLocation)) {
        if (sectionElement !== null) sectionElement.classList.add(classField.activeTagClassName);

        if (currentActiveTag && (currentActiveTag !== sectionElement)) {
          currentActiveTag.classList.remove(classField.activeTagClassName);
        }
        currentActiveTag = sectionElement; // 현재 활성화된 태그 업데이트
      } else {
        if (sectionElement !== null) sectionElement.classList.remove(classField.activeTagClassName);
      }
    });
  });
};
