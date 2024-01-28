import { navigation } from '/src/constants/constants';
import { state } from '/src/constants/state';

import { findFooterElement } from '/src/utils/findUtil';

export const footerDetectEvent = () => {

  if (state.hiddenFlag) {
    state.hiddenFlag = false;
    const footer = findFooterElement();
    if (footer !== null) {

      window.addEventListener('scroll', () => {
        const footerRect = footer.getBoundingClientRect();

        const navigationElement = document.querySelector(`.${navigation.className}`);
        if (navigationElement !== null) {
          if (footerRect.top < 0) {
            navigationElement.classList.add('hidden');
          } else {
            navigationElement.classList.remove('hidden');
          }
        }
      });
    }
  }
};
