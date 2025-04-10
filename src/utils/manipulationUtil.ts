import { classField } from '@/constants/constants';
import { NavigatorContent, state, createNavigatorContent } from '@/constants/state';
import { translateElements, LanguageCode } from './translationUtil';

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
        <a id="n-${content.tagId}" href="#${content.tagId}" class="navigation-link navigation-link-${content.tagType.toLowerCase()}">${content.textContent}</a>
        <br>
        `;
  });

  return contents;
};

/**
 * 번역 버튼을 생성합니다.
 */
const createTranslationControls = (): string => {
  return `
    <div class="translation-controls">
      <select id="target-language">
        <option value="ko">한국어</option>
        <option value="en">English</option>
        <option value="ja">日本語</option>
        <option value="zh-CN">中文</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="es">Español</option>
      </select>
      <div class="btn-group">
        <button id="translate-content">번역하기</button>
        <button id="reset-translation" style="display:none;">원문 보기</button>
      </div>
    </div>
  `;
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
    translateButton.textContent = '번역 중...';
    translateButton.disabled = true;
    
    try {
      // 제목(h1, h2), 본문(p), 리스트(li) 번역
      await translateElements(sectionElement, 'h1, h2, p, li', targetLang);
      
      // 네비게이션 아이템도 번역
      const navLinks = document.querySelectorAll<HTMLElement>('.navigation-link');
      for (const link of Array.from(navLinks)) {
        const elementId = link.getAttribute('href')?.substring(1) || '';
        if (elementId) {
          const originalElement = document.getElementById(elementId);
          if (originalElement && originalElement.hasAttribute('data-translated')) {
            link.innerText = originalElement.innerText;
          }
        }
      }
      
      // 상태 변경
      translateButton.style.display = 'none';
      resetButton.style.display = 'inline-block';
    } catch (error) {
      console.error('Translation failed:', error);
      translateButton.textContent = '번역 실패';
    } finally {
      translateButton.disabled = false;
    }
  });
  
  // 원문 보기 버튼 클릭 이벤트
  resetButton.addEventListener('click', () => {
    // 번역된 요소 복원
    const translatedElements = sectionElement.querySelectorAll('[data-translated="true"]');
    translatedElements.forEach(element => {
      const originalText = element.getAttribute('data-original-text');
      if (originalText) {
        (element as HTMLElement).innerText = originalText;
        element.removeAttribute('data-translated');
        element.removeAttribute('data-original-text');
      }
    });
    
    // 네비게이션 아이템 복원
    const navLinks = document.querySelectorAll<HTMLElement>('.navigation-link');
    for (const link of Array.from(navLinks)) {
      const elementId = link.getAttribute('href')?.substring(1) || '';
      if (elementId) {
        const targetTag = state.contents.find(content => content.tagId === elementId);
        if (targetTag) {
          link.innerText = targetTag.textContent || '';
        }
      }
    }
    
    // 상태 변경
    resetButton.style.display = 'none';
    translateButton.style.display = 'inline-block';
    translateButton.textContent = '번역하기';
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
