import { navigation } from '/src/constants/constants';

export const isNavigation = () => {
  return document.getElementsByClassName(navigation.className).length !== 0;
};

export const findSectionElement = () => {
  return document.querySelector('section');
};

export const findFooterElement = () => {
  return document.querySelector('footer');
};
