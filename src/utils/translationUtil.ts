import { LanguageCode } from "@/constants/constants";
import { logger } from "./logger";

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
    if (!text || text.trim() === '') {
      return text;
    }

    const encodedText = encodeURIComponent(text);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation failed with status: ${response.status}`);
    }

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
    
    // 태그 및 속성을 보호하는 방식으로 처리
    const tempElement = document.createElement('div');
    tempElement.innerHTML = originalHtml;
    
    // 이모지만 태그로 감싸서 보호
    const processTextForEmoji = (text: string): string => {
      return text.replace(
        /(\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier}|\p{Emoji_Modifier_Base}|\p{Emoji_Component}|[\u{1F000}-\u{1FFFF}])/gu, 
        (match) => `<span class="notranslate">${match}${' '}</span>`
      );
    };

    // HTML 태그를 보존하기 위한 처리
    const processNode = async (node: Node): Promise<void> => {
      // 요소 노드인 경우 (태그)
      if (node.nodeType === Node.ELEMENT_NODE) {
        // notranslate 클래스가 있는 요소는 번역하지 않음
        if (
          (node as Element).classList && 
          (node as Element).classList.contains('notranslate')
        ) {
          return;
        }
        
        // 자식 노드 처리 - 순차적으로 처리
        const children = Array.from(node.childNodes);
        for (let i = 0; i < children.length; i++) {
          await processNode(children[i]);
        }
      }

      // 텍스트 노드인 경우
      if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim()) {
        // 이모지 태그로 감싸기
        const tempSpan = document.createElement('span');
        tempSpan.innerHTML = processTextForEmoji(node.textContent);
        
        // 모든 텍스트 노드 및 이모지가 아닌 노드 찾기
        const textNodes = Array.from(tempSpan.childNodes).filter(
          childNode => 
            childNode.nodeType === Node.TEXT_NODE || 
            (childNode.nodeType === Node.ELEMENT_NODE && 
             !(childNode as Element).classList.contains('notranslate'))
        );
        
        // 텍스트 노드만 번역
        for (const textNode of textNodes) {
          if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent && textNode.textContent.trim()) {
            const translatedText = await translateText(textNode.textContent, targetLang, sourceLang);
            if (translatedText && translatedText !== textNode.textContent) {
              textNode.textContent = translatedText;
            }
          }
        }
        
        // 원래 노드 대체
        const fragment = document.createDocumentFragment();
        while (tempSpan.firstChild) {
          fragment.appendChild(tempSpan.firstChild);
        }
        node.parentNode?.replaceChild(fragment, node);
      }
    };

    // 루트 레벨 노드들 처리
    const rootNodes = Array.from(tempElement.childNodes);
    for (let i = 0; i < rootNodes.length; i++) {
      await processNode(rootNodes[i]);
    }

    // 번역된 HTML로 업데이트
    const translatedHtml = tempElement.innerHTML;

    if (translatedHtml !== originalHtml) {
      element.innerHTML = translatedHtml;
      element.setAttribute('data-translated', 'true');
      element.setAttribute('data-original-html', originalHtml);
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
  selector: string,
  targetLang: LanguageCode,
  sourceLang: LanguageCode | 'auto' = 'auto'
): Promise<void> => {
  const elements = container.querySelectorAll<HTMLElement>(selector);

  // 번역 요청을 일괄적으로 처리하면 속도와 안정성이 향상됨
  // 하지만 과도한 요청은 차단될 수 있으므로 배치 크기 제한
  const batchSize = 5;
  const delay = 500; // ms

  for (let i = 0; i < elements.length; i += batchSize) {
    const batch = Array.from(elements).slice(i, i + batchSize);

    // 배치 내 요소들 병렬 번역
    await Promise.all(
      batch.map(element => translateElement(element, targetLang, sourceLang))
    );

    // API 요청 제한을 피하기 위한 지연
    if (i + batchSize < elements.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}; 

export { LanguageCode };
