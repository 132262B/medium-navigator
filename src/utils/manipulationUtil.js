import { navigation } from '/src/constants/constants';

const createNavigationElement = (navigationContentElement) => {
  const floatingDiv = document.createElement('div');
  floatingDiv.className = navigation.className;
  floatingDiv.innerHTML = navigationContentElement;
  return floatingDiv;
};

const createNavigationLinkElement = (tag) => {
  return `
        <a href="#${tag.id}" class="navigation-link navigation-link-${tag.tagName.toLowerCase()}">${tag.textContent}</a>
        <br>
        `;
};

export const createNavigation = (sectionElement) => {
  let navigationContentElement = '';
  const hTags = sectionElement.querySelectorAll('h1, h2');
  hTags.forEach(tag => {
    if (tag.id) {
      navigationContentElement += createNavigationLinkElement(tag);
    }
  });

  const newDiv = createNavigationElement(navigationContentElement);
  sectionElement.parentElement.appendChild(newDiv);
};
