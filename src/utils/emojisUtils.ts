import { space, translationConstants as TC } from "@/constants/constants";

/**
 * 특정 문자가 이모지인지 확인합니다.
 * @param char 확인할 문자
 * @returns 이모지 여부
 */
export const isEmojiChar = (char: string): boolean => {
  return new RegExp(TC.emojiRegex).test(char);
};

/**
 * 결합 문자인지 확인합니다 (영향을 주는 문자, 변형 선택자 등).
 * @param char 확인할 문자
 * @returns 결합 문자 여부
 */
export const isCombiningChar = (char: string): boolean => {
  const code = char.codePointAt(0) || 0;
  return (
    // 이모지 표현 방식 선택자 (Variation Selectors)
    (code >= 0xFE00 && code <= 0xFE0F) ||
    // 이모지 수식어 (Emoji Modifiers)
    (code >= 0x1F3FB && code <= 0x1F3FF) ||
    // 결합 문자 (Combining Characters)
    (code >= 0x20D0 && code <= 0x20FF) ||
    // keycap 시퀀스 종료자
    code === 0x20E3 ||
    // Zero Width Joiner
    code === 0x200D
  );
};

/**
 * 이모지 시퀀스를 찾습니다 (예: 1️⃣과 같은 복합 이모지).
 * @param str 검사할 문자열
 * @param startIndex 검사 시작 위치
 * @returns 이모지 시퀀스 정보 또는 null
 */
export const findEmojiSequence = (str: string, startIndex: number): { emoji: string; endIndex: number } | null => {
  // 현재 위치에 이모지가 없으면 null 반환
  const firstChar = str.charAt(startIndex);
  if (!isEmojiChar(firstChar)) {
    return null;
  }
  
  // 연속된 이모지 문자를 찾아서 하나의 시퀀스로 처리
  let endIndex = startIndex;
  let currentEmoji = firstChar;
  
  // 다음 문자가 이모지 또는 조합 문자인 경우 계속 진행
  for (let i = startIndex + 1; i < str.length; i++) {
    const char = str.charAt(i);
    if (isEmojiChar(char) || isCombiningChar(char)) {
      currentEmoji += char;
      endIndex = i;
    } else {
      break;
    }
  }
  
  return { emoji: currentEmoji, endIndex };
};

/**
 * 텍스트에서 이모지를 감지하여 보호 태그로 감싸줍니다.
 * @param text 처리할 텍스트
 * @returns 이모지가 보호된 HTML 문자열
 */
export const protectEmojis = (text: string): string => {
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    // 현재 위치에서 이모지 시퀀스 찾기
    const emojiSequence = findEmojiSequence(text, i);
    
    if (emojiSequence) {
      // 이모지 시퀀스를 notranslate로 감싸기
      result += `<span class="${TC.classNames.noTranslate}">${emojiSequence.emoji}${space}</span>`;
      i = emojiSequence.endIndex + 1;
    } else {
      // 일반 텍스트 그대로 추가
      result += text.charAt(i);
      i++;
    }
  }
  
  return result;
}; 