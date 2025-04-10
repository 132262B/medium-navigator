export type LanguageCode = 'ko' | 'en' | 'ja' | 'zh-CN' | 'fr' | 'de' | 'es';

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
    console.error('Translation error:', error);
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
    const originalText = element.innerText;
    const translatedText = await translateText(originalText, targetLang, sourceLang);
    
    // 번역된 텍스트로 업데이트
    if (translatedText && translatedText !== originalText) {
      element.innerText = translatedText;
      
      // 번역되었음을 표시하는 속성 추가
      element.setAttribute('data-translated', 'true');
      element.setAttribute('data-original-text', originalText);
    }
  } catch (error) {
    console.error('Element translation error:', error);
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