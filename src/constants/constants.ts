export const space = ' ';

export const classField = {
  navigationClassName: 'medium-navigator-navigation-box',
  hiddenClassName: 'medium-navigator-hidden',
  activeTagClassName: 'medium-navigator-active-tag'
};

export const valueAdjuster = {
  adjustmentTagLocation: 150
}

export const icons = {
  translate: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
            <path d="m5 8 6 6"></path>
            <path d="m4 14 6-6 2-3"></path>
            <path d="M2 5h12"></path>
            <path d="M7 2h1"></path>
            <path d="m22 22-5-10-5 10"></path>
            <path d="M14 18h6"></path>
          </svg>`,
  resetTranslation: `<svg fill="#ffffff" width="12" height="12" viewBox="0 0 512 512" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg">
            <path d="M64,256H34A222,222,0,0,1,430,118.15V85h30V190H355V160h67.27A192.21,192.21,0,0,0,256,64C150.13,64,64,150.13,64,256Zm384,0c0,105.87-86.13,192-192,192A192.21,192.21,0,0,1,89.73,352H157V322H52V427H82V393.85A222,222,0,0,0,478,256Z"/>
          </svg>
  `
}

export type LanguageCode = 'ko' | 'en' | 'ja' | 'zh-CN' | 'fr' | 'de' | 'es';

export const languages = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'zh-CN', name: '中文' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' }
];

// 번역 관련 상수
export const translationConstants = {
  // CSS 클래스
  classNames: {
    noTranslate: 'notranslate',
  },
  
  // 데이터 속성
  attributes: {
    translated: 'data-translated',
    originalHtml: 'data-original-html',
    valueTrue: 'true',
  },
  
  // 버튼 텍스트
  buttonText: {
    translate: 'Translate',
    translating: 'Translating...',
    failed: 'Failed',
    original: 'Original',
  },
  
  // 번역 제외할 태그 (속성은 번역하지 않음)
  excludedTags: ['a', 'script', 'style', 'code', 'pre'],
  
  // 이모지 정규식 패턴 (복합 이모지도 하나의 단위로 처리)
  emojiRegex: /([\u{1F300}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|\u{200D}|[\u{2700}-\u{27BF}]|\u{FE0F}|\u{20E3}|[\u{1F000}-\u{1F3FF}])/gu,

  // 번역 API 설정
  api: {
    baseUrl: 'https://translate.googleapis.com/translate_a/single',
    batchSize: 5,
    delayMs: 500, // ms
  },

  // 번역 요소 선택자
  selectors: {
    translatable: 'h1, h2, p, li',
    navigation: '.medium-navigator-navigation-link',
  },
  
  // 언어 목록 (중복 제거)
  languages: languages
};