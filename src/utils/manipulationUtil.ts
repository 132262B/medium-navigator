import { classField, icons, LanguageCode, languages } from '@/constants/constants';
import { NavigatorContent, state, createNavigatorContent } from '@/constants/state';
import { translateElements } from './translationUtil';
import { logger } from './logger';
import { translationConstants as TC } from '@/constants/constants';

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
        createNavigatorContent(
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
        <a id="n-${content.tagId}" href="?#${content.tagId}" class="medium-navigator-navigation-link medium-navigator-navigation-link-${content.tagType.toLowerCase()}">${content.textContent}</a>
        <br>
        `;
  });

  return contents;
};

/**
 * 번역 버튼을 생성합니다.
 */
const createTranslationControls = (): string => {
  let optionsHtml = '';
  
  TC.languages.forEach(lang => {
    optionsHtml += `<option value="${lang.code}">${lang.name}</option>`;
  });

  return `
    <div class="medium-navigator-translation-controls">
      <select id="target-language">
        ${optionsHtml}
      </select>
      <div class="medium-navigator-btn-group">
        <button id="translate-content">
          ${icons.translate}
          ${TC.buttonText.translate}
        </button>
        <button id="reset-translation" style="display:none;">
          ${icons.resetTranslation}
          ${TC.buttonText.original}
        </button>
      </div>
    </div>
  `;
};

/**
 * href 속성에서 ID를 추출합니다.
 * @param href href 속성 값 (예: "?#tagId" 또는 "#tagId")
 * @returns 추출된 ID
 */
const extractIdFromHref = (href: string | null): string => {
  if (!href) return '';
  const hashIndex = href.indexOf('#');
  return hashIndex !== -1 ? href.substring(hashIndex + 1) : '';
};

/**
 * 번역 동작을 위한 이벤트 리스너를 설정합니다.
 */
const setupTranslationEvents = (sectionElement: HTMLElement) => {
  const translateButton = document.getElementById('translate-content') as HTMLButtonElement;
  const resetButton = document.getElementById('reset-translation') as HTMLButtonElement;
  const languageSelect = document.getElementById('target-language') as HTMLSelectElement;
  
  if (!translateButton || !resetButton || !languageSelect) return;
  
  // 번역 버튼 클릭 이벤트
  translateButton.addEventListener('click', async () => {
    const targetLang = languageSelect.value as LanguageCode;
    
    // 로딩 상태 표시
    translateButton.textContent = TC.buttonText.translating;
    translateButton.disabled = true;
    
    try {
      // 번역 수행
      await translateElements(sectionElement, TC.selectors.translatable, targetLang);
      
      // 번역된 태그에서 정보 다시 가져와서 네비게이션 항목 업데이트
      const tags: NodeListOf<Element> = sectionElement.querySelectorAll('h1, h2');
      state.contents.forEach((content, index) => {
        const tag = Array.from(tags).find(t => t.id === content.tagId);
        if (tag && tag.hasAttribute(TC.attributes.translated)) {
          // 번역된 텍스트로 상태 업데이트
          content.textContent = tag.textContent || content.textContent;
        }
      });
      
      // 네비게이션 항목 업데이트
      const navLinks = document.querySelectorAll<HTMLElement>(TC.selectors.navigation);
      navLinks.forEach(link => {
        const elementId = extractIdFromHref(link.getAttribute('href'));
        if (elementId) {
          const contentItem = state.contents.find(content => content.tagId === elementId);
          if (contentItem) {
            link.innerText = contentItem.textContent || '';
          }
        }
      });
      
      // 상태 변경
      translateButton.style.display = 'none';
      resetButton.style.display = 'inline-block';
    } catch (error) {
      logger.error('Translation failed:', error);
      translateButton.textContent = TC.buttonText.failed;
    } finally {
      translateButton.disabled = false;
    }
  });
  
  // 원문 보기 버튼 클릭 이벤트
  resetButton.addEventListener('click', () => {
    // 번역된 요소 복원
    const translatedElements = sectionElement.querySelectorAll(`[${TC.attributes.translated}="${TC.attributes.valueTrue}"]`);
    translatedElements.forEach(element => {
      const originalHtml = element.getAttribute(TC.attributes.originalHtml);
      if (originalHtml) {
        (element as HTMLElement).innerHTML = originalHtml;
        element.removeAttribute(TC.attributes.translated);
        element.removeAttribute(TC.attributes.originalHtml);
      }
    });
    
    // 원본 태그에서 정보 다시 가져와서 네비게이션 항목 업데이트
    const tags: NodeListOf<Element> = sectionElement.querySelectorAll('h1, h2');
    state.contents.forEach((content, index) => {
      const tag = Array.from(tags).find(t => t.id === content.tagId);
      if (tag) {
        // 원본 텍스트로 상태 업데이트
        content.textContent = tag.textContent || content.textContent;
      }
    });
    
    // 네비게이션 항목 복원
    const navLinks = document.querySelectorAll<HTMLElement>(TC.selectors.navigation);
    navLinks.forEach(link => {
      const elementId = extractIdFromHref(link.getAttribute('href'));
      if (elementId) {
        const contentItem = state.contents.find(content => content.tagId === elementId);
        if (contentItem) {
          link.innerText = contentItem.textContent || '';
        }
      }
    });
    
    // 상태 변경
    resetButton.style.display = 'none';
    translateButton.style.display = 'inline-block';
    translateButton.innerHTML = icons.translate + TC.buttonText.translate;
  });
};

export const createNavigation = (sectionElement: HTMLElement) => {
  const tags: NodeListOf<Element> = sectionElement.querySelectorAll('h1, h2');

  // tag에서 정보 추출후 state에 추가.
  pushNavigationContent(tags);

  // state에서 정보를 가져와 element 생성.
  let contents = createNavigationList();

  // 번역 컨트롤 추가
  contents = createTranslationControls() + contents;

  const newDiv: HTMLDivElement = createNavigationElement(contents);
  sectionElement.parentElement?.appendChild(newDiv);

  // 번역 이벤트 설정
  setupTranslationEvents(sectionElement);
};
