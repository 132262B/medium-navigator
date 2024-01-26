import {navigation, status} from '/src/constants/constants'

export const footerDetectEvent = () => {

  if (status.hiddenFlag) {
    status.hiddenFlag = false
    const footer = document.querySelector('footer');
    if (footer !== null) {
      const footerRect = footer.getBoundingClientRect();

      window.addEventListener('scroll', () => {
        const viewPort = window.scrollY
        const navigationElement = document.querySelector(`.${navigation.className}`);

        if (viewPort > (footerRect.top - 500)) {
          navigationElement.classList.add('hidden');
        } else {
          navigationElement.classList.remove('hidden');
        }
      });
    }
  }


};
