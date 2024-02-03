import { classField, valueAdjuster } from '/src/constants/constants';
import { state } from '/src/constants/state';
import { findFooterElement } from '/src/utils/findUtil';

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
  let currentActiveTag = null; // 현재 활성화된 태그를 추적하기 위한 변수

  window.addEventListener('scroll', () => {
    let currentScrollPosition = window.scrollY;

    state.contents.forEach(section => {
      const sectionElement = document.querySelector(`#n-${section.tagId}`);

      if (currentScrollPosition >= (section.scrollPosition - valueAdjuster.adjustmentTagLocation)) {
        sectionElement.classList.add(classField.activeTagClassName);
        if (currentActiveTag && (currentActiveTag !== sectionElement)) {
          currentActiveTag.classList.remove(classField.activeTagClassName);
        }
        currentActiveTag = sectionElement; // 현재 활성화된 태그 업데이트
      } else {
        sectionElement.classList.remove(classField.activeTagClassName);
      }
    });
  });
};
