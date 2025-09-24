import { classField, navigatorConstants } from '@/constants/constants';

export const isMedium = () => {
  // URL 패턴 체크
  const currentUrl = window.location.href;
  const hasExcludedPattern = navigatorConstants.urls.excludePatterns.some(
    (pattern) => currentUrl.includes(pattern)
  );

  if (
    hasExcludedPattern &&
    currentUrl.includes('/p/') &&
    currentUrl.includes('/edit')
  ) {
    return false;
  }

  // 여러 메타 태그를 체크하여 Medium 블로그 여부 확인
  const { mediumMetaTags } = navigatorConstants.selectors;

  // 모든 메타 태그가 Medium을 가리키는지 확인
  return mediumMetaTags.every((selector) => {
    const metaTag = document.querySelector(selector);
    return metaTag?.getAttribute('content') === 'Medium';
  });
};

export const isNavigation = () => {
  return (
    document.getElementsByClassName(classField.navigationClassName).length !== 0
  );
};

export const findCriteriaElement = (): HTMLElement | null => {
  return (
    (document.querySelector(navigatorConstants.selectors.mediumTitle)
      ?.parentElement?.parentElement as HTMLElement) ?? null
  );
};

export const findContentElement = (): HTMLElement | null => {
  return (
    (document.querySelector(
      navigatorConstants.selectors.section
    ) as HTMLElement) ?? null
  );
};

export const findFooterElement = () => {
  return document.querySelector(navigatorConstants.selectors.footer);
};
