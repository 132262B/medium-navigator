export const state = {
  hiddenFlag: true,
  contents: [],
};

export class NavigatorContent {
  tagId;
  tagType;
  textContent;
  scrollPosition;

  constructor(tagId, tagType, textContent, scrollPosition) {
    this.tagId = tagId;
    this.tagType = tagType;
    this.textContent = textContent;
    this.scrollPosition = scrollPosition;
  }
}
