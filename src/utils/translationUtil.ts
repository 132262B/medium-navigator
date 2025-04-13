import { LanguageCode, space, translationConstants as TC } from "@/constants/constants";
import { logger } from "./logger";
import { protectEmojis } from "./emojisUtils";

/**
 * 텍스트를 번역합니다.
 * @param text 번역할 텍스트
 * @param targetLang 대상 언어 코드
 * @param sourceLang 원본 언어 코드 (기본값: 자동 감지)
 * @returns 번역된 텍스트 Promise
 */
export const translateText = async (
  text: string,
  targetLang: LanguageCode,
  sourceLang: LanguageCode | 'auto' = 'auto'
): Promise<string> => {
  try {
    // 빈 텍스트는 번역하지 않음
    if (!text || text.trim() === '') {
      return text;
    }


    // URL 인코딩 및 요청 URL 생성
    const encodedText = encodeURIComponent(text);

    logger.log('translateText', encodedText);
    const url = `${TC.api.baseUrl}?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;

    // 번역 API 호출
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Translation failed with status: ${response.status}`);
    }

    // 응답 데이터 처리
    const data = await response.json();
    let translatedText = '';

    if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      translatedText = data[0]
        .filter(item => item && Array.isArray(item) && item[0])
        .map(item => item[0])
        .join('');
    }

    return translatedText || text;
  } catch (error) {
    logger.error('Translation error:', error);
    return text; // 오류 발생 시 원본 텍스트 반환
  }
};

/**
 * 노드가 번역에서 제외되어야 하는지 확인합니다.
 * @param node 확인할 노드
 * @returns 제외 여부 (true: 제외, false: 번역 대상)
 */
const shouldSkipTranslation = (node: Node): boolean => {
  // 요소 노드가 아니면 건너뛰지 않음
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  const element = node as Element;
  
  // notranslate 클래스가 있으면 건너뜀
  if (element.classList && element.classList.contains(TC.classNames.noTranslate)) {
    return true;
  }
  
  // 제외 태그 목록에 있으면 건너뜀
  const tagName = element.nodeName.toLowerCase();
  return TC.excludedTags.includes(tagName);
};

/**
 * 텍스트 노드를 처리하여 번역합니다.
 * @param node 처리할 텍스트 노드
 * @param targetLang 대상 언어 코드
 * @param sourceLang 원본 언어 코드
 */
const processTextNode = async (
  node: Node,
  targetLang: LanguageCode,
  sourceLang: LanguageCode | 'auto'
): Promise<void> => {
  if (!node.textContent || !node.textContent.trim()) {
    return;
  }
  
  // 이모지 보호를 위한 임시 요소 생성
  const tempSpan = document.createElement('span');
  tempSpan.innerHTML = protectEmojis(node.textContent);
  
  // 번역 대상 노드 선별
  const textNodes = Array.from(tempSpan.childNodes).filter(
    childNode => 
      childNode.nodeType === Node.TEXT_NODE || 
      (childNode.nodeType === Node.ELEMENT_NODE && 
       !(childNode as Element).classList.contains(TC.classNames.noTranslate))
  );
  
  // 텍스트 노드만 번역
  for (const textNode of textNodes) {
    if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent && textNode.textContent.trim()) {
      const translatedText = await translateText(textNode.textContent, targetLang, sourceLang);
      if (translatedText && translatedText !== textNode.textContent) {
        textNode.textContent = `${translatedText}${space}`;
      }
    }
  }
  
  // 원래 노드 대체
  const fragment = document.createDocumentFragment();
  while (tempSpan.firstChild) {
    fragment.appendChild(tempSpan.firstChild);
  }
  node.parentNode?.replaceChild(fragment, node);
};

/**
 * HTML 요소의 내용을 번역합니다.
 * @param element 번역할 HTML 요소
 * @param targetLang 대상 언어 코드
 * @param sourceLang 원본 언어 코드 (기본값: 자동 감지)
 * @returns Promise<void>
 */
export const translateElement = async (
  element: HTMLElement,
  targetLang: LanguageCode,
  sourceLang: LanguageCode | 'auto' = 'auto'
): Promise<void> => {
  try {
    // 원본 HTML 콘텐츠 저장
    const originalHtml = element.innerHTML;
    
    // HTML 구조 복제
    const tempElement = document.createElement('div');
    tempElement.innerHTML = originalHtml;
    
    // HTML 구조를 순회하면서 번역 처리
    const processNode = async (node: Node): Promise<void> => {
      // 번역 제외 대상인지 확인
      if (shouldSkipTranslation(node)) {
        return;
      }
      
      // 노드 타입에 따른 처리
      if (node.nodeType === Node.ELEMENT_NODE) {
        // 요소 노드: 자식 노드들을 재귀적으로 처리
        const children = Array.from(node.childNodes);
        for (const child of children) {
          await processNode(child);
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        // 텍스트 노드: 번역 처리
        await processTextNode(node, targetLang, sourceLang);
      }
    };

    // 최상위 노드부터 처리 시작
    const rootNodes = Array.from(tempElement.childNodes);
    for (const node of rootNodes) {
      await processNode(node);
    }

    // 번역된 HTML로 업데이트
    const translatedHtml = tempElement.innerHTML;
    if (translatedHtml !== originalHtml) {
      element.innerHTML = translatedHtml;
      element.setAttribute(TC.attributes.translated, TC.attributes.valueTrue);
      element.setAttribute(TC.attributes.originalHtml, originalHtml);
    }
  } catch (error) {
    logger.error('Element translation error:', error);
  }
};

/**
 * 선택된 요소들을 번역합니다.
 * @param container 번역할 요소들을 포함하는 컨테이너
 * @param selector 번역할 요소들의 CSS 선택자
 * @param targetLang 대상 언어 코드
 * @param sourceLang 원본 언어 코드 (기본값: 자동 감지)
 * @returns Promise<void>
 */
export const translateElements = async (
  container: HTMLElement,
  selector: string = TC.selectors.translatable,
  targetLang: LanguageCode,
  sourceLang: LanguageCode | 'auto' = 'auto'
): Promise<void> => {
  // 번역할 요소들 선택
  const elements = container.querySelectorAll<HTMLElement>(selector);
  
  // 배치 처리 설정
  const { batchSize, delayMs } = TC.api;
  
  // 배치 단위로 처리하여 API 부하 분산
  for (let i = 0; i < elements.length; i += batchSize) {
    // 현재 배치 추출
    const batch = Array.from(elements).slice(i, i + batchSize);
    
    // 현재 배치 병렬 처리
    await Promise.all(
      batch.map(element => translateElement(element, targetLang, sourceLang))
    );
    
    // 다음 배치 전 지연 (API 제한 방지)
    if (i + batchSize < elements.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};

export { LanguageCode };

