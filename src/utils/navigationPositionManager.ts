/**
 * 네비게이션 위치 관리 모듈
 */

/**
 * medium-criteria 요소 위치를 추적하여 네비게이션 위치 업데이트
 */
export const updateNavigationPosition = (navigationElement: HTMLElement) => {
  const mediumCriteria = document.getElementById('medium-criteria');
  if (!mediumCriteria) return;

  const rect = mediumCriteria.getBoundingClientRect();
  const rightPosition = rect.right + 20;

  navigationElement.style.left = `${rightPosition}px`;
};

/**
 * 특정 XPath 요소의 변화를 감지하여 네비게이션 위치를 업데이트하는 Observer 설정
 */
export const setupPositionObservers = (
  navigationElement: HTMLElement,
  targetXPath: string = '//*[@id="root"]/div/div[3]/div[2]/div[1]'
) => {
  // throttle을 위한 변수
  let ticking = false;
  const handleUpdate = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNavigationPosition(navigationElement);
        ticking = false;
      });
      ticking = true;
    }
  };

  // 스크롤과 리사이즈 이벤트 리스너
  window.addEventListener('scroll', handleUpdate);
  window.addEventListener('resize', handleUpdate);

  // XPath로 특정 요소 찾기
  const targetElement = document.evaluate(
    targetXPath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue as HTMLElement;

  if (targetElement) {
    // ResizeObserver로 요소 크기 변화 감지
    const resizeObserver = new ResizeObserver(() => {
      handleUpdate();
    });
    resizeObserver.observe(targetElement);

    // MutationObserver로 style 속성 변화 감지
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'style'
        ) {
          handleUpdate();
        }
      });
    });

    mutationObserver.observe(targetElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    // 정리 함수 반환
    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }

  // 기본 이벤트 리스너만 정리하는 함수
  return () => {
    window.removeEventListener('scroll', handleUpdate);
    window.removeEventListener('resize', handleUpdate);
  };
};
