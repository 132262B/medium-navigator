import {
  classField,
  icons,
  LanguageCode,
  navigatorConstants,
  translationConstants as TC,
} from '@/constants/constants';
import {
  createNavigatorContent,
  NavigatorContent,
  state,
} from '@/constants/state';
import { translateElements } from './translationUtil';
import { logger } from './logger';
import {
  setupPositionObservers,
  updateNavigationPosition,
} from './navigationPositionManager';


/**
 * 네비게이션 DOM 요소를 생성합니다.
 */
const createNavigationElement = (navigationContentElement: string) => {
  const floatingDiv = document.createElement('div');
  floatingDiv.className = classField.navigationClassName;
  floatingDiv.innerHTML = navigationContentElement;
  return floatingDiv;
};

/**
 * 태그들로부터 네비게이션 컨텐츠를 추출하여 state에 저장합니다.
 */
const pushNavigationContent = (tags: NodeListOf<Element>) => {
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

/**
 * 네비게이션 링크 목록을 생성합니다.
 */
const createNavigationList = (): string => {
  let contents: string = '';

  state.contents.forEach((content: NavigatorContent) => {
    contents += `
        <a id="n-${content.tagId}" href="#${content.tagId}" class="medium-navigator-navigation-link medium-navigator-navigation-link-${content.tagType.toLowerCase()}">${content.textContent}</a>
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
      const tags: NodeListOf<Element> = sectionElement.querySelectorAll(navigatorConstants.headingTags);
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
    const tags: NodeListOf<Element> = sectionElement.querySelectorAll(navigatorConstants.headingTags);
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

/**
 * 네비게이션을 생성하고 설정합니다.
 */
export const createNavigation = (contentElement: HTMLElement, criteriaElement: HTMLElement) => {
  // 콘텐츠 요소에 ID 부여
  contentElement.id = 'medium-content';

  // 기준 요소에 ID 부여 (positioning 용)
  criteriaElement.id = 'medium-criteria';

  // 콘텐츠 요소의 태그들로부터 네비게이션 컨텐츠 추출
  const tags = contentElement.querySelectorAll(navigatorConstants.headingTags);
  pushNavigationContent(tags);

  // 네비게이션 HTML 생성
  const navigationList = createNavigationList();
  const translationControls = createTranslationControls();
  const navigationElement = createNavigationElement(translationControls + navigationList);

  // DOM에 추가
  document.body.appendChild(navigationElement);

  // 위치 초기화 및 추적 설정 (기준 요소 기반)
  updateNavigationPosition(navigationElement);
  setupPositionObservers(navigationElement);

  // 번역 이벤트 설정 (콘텐츠 요소 기반)
  setupTranslationEvents(contentElement);
};
