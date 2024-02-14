import { classField } from '@/constants/constants';
import { NavigatorContent, state } from '@/constants/state';

const createNavigationElement = (navigationContentElement: string) => {
  const floatingDiv = document.createElement('div');
  floatingDiv.className = classField.navigationClassName;
  floatingDiv.innerHTML = navigationContentElement;
  return floatingDiv;
};

const pushNavigationContent = (tags: NodeListOf<Element>) => {
  // 빈배열로 초기화
  state.contents = [];

  tags.forEach(tag => {
    if (tag.id) {
      state.contents.push(
        new NavigatorContent(
          tag.id,
          tag.tagName.toLowerCase(),
          tag.textContent,
          tag.getBoundingClientRect().top + window.scrollY,
        ),
      );
    }
  });
};

const createNavigationList = (): string => {
  let contents: string = '';

  state.contents.forEach((content: NavigatorContent) => {
    contents += `
        <a id="n-${content.tagId}" href="#${content.tagId}" class="navigation-link navigation-link-${content.tagType.toLowerCase()}">${content.textContent}</a>
        <br>
        `;
  });

  return contents;
};

export const createNavigation = (sectionElement: HTMLElement) => {
  const tags: NodeListOf<Element> = sectionElement.querySelectorAll('h1, h2');

  // tag에서 정보 추출후 state에 추가.
  pushNavigationContent(tags);

  // state에서 정보를 가져와 element 생성.
  let contents = createNavigationList();

  const newDiv: HTMLDivElement = createNavigationElement(contents);
  sectionElement.parentElement?.appendChild(newDiv);
};
