export interface State {
  hiddenFlag: boolean;
  contents: NavigatorContent[];
}

export const state: State = {
  hiddenFlag: true,
  contents: [],
};

export interface NavigatorContent {
  tagId: string;
  tagType: string;
  textContent: string | null;
  scrollPosition: number;
}

/**
 * NavigatorContent 객체를 생성하는 팩토리 함수
 */
export const createNavigatorContent = (
  tagId: string, 
  tagType: string, 
  textContent: string | null, 
  scrollPosition: number
): NavigatorContent => ({
  tagId,
  tagType,
  textContent,
  scrollPosition
});

export const stateReset = (): void => {
  state.hiddenFlag = true;
  state.contents = [];
};
