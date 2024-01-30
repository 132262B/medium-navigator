import { classField } from '/src/constants/constants';

export const isNavigation = () => {
  return document.getElementsByClassName(classField.navigationClassName).length !== 0;
};

export const findSectionElement = () => {
  return document.querySelector('section');
};

export const findFooterElement = () => {
  return document.querySelector('footer');
};
