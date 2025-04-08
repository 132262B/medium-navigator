import { classField } from '@/constants/constants';

export const isMedium = () => {
  // URL 패턴 체크
  const currentUrl = window.location.href;
  if (currentUrl.includes('/new-story') || currentUrl.includes('/p/') && currentUrl.includes('/edit')) {
    return false;
  }

  // 여러 메타 태그를 체크하여 Medium 블로그 여부 확인
  const mediumMetaTags = [
    'meta[property="og:site_name"]',
    'meta[name="twitter:app:name:iphone"]',
    'meta[property="al:ios:app_name"]',
    'meta[property="al:android:app_name"]'
  ];

  // 모든 메타 태그가 Medium을 가리키는지 확인
  return mediumMetaTags.every(selector => {
    const metaTag = document.querySelector(selector);
    return metaTag?.getAttribute('content') === 'Medium';
  });
};

export const isNavigation = () => {
  return document.getElementsByClassName(classField.navigationClassName).length !== 0;
};

export const findSectionElement = () => {
  return document.querySelector('section');
};

export const findFooterElement = () => {
  return document.querySelector('footer');
};
