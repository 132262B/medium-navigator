export type State = {
  hiddenFlag: Boolean,
  contents: NavigatorContent[],
};

export const state: State = {
  hiddenFlag: true,
  contents: [],
};

export class NavigatorContent {
  tagId : string;
  tagType: string;
  textContent : string | null;
  scrollPosition : number;

  constructor(tagId: string, tagType: string, textContent: string | null, scrollPosition: number) {
    this.tagId = tagId;
    this.tagType = tagType;
    this.textContent = textContent;
    this.scrollPosition = scrollPosition;
  }
}

export const stateReset = (): void => {
  state.hiddenFlag = true;
  state.contents = [];
};
