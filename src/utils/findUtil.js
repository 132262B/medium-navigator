import {navigation} from '/src/constants/constants'

export const isNavigation = () => {
  return document.getElementsByClassName(navigation.className).length !== 0
}

export const findContentElement = () => {
  for (let i1 = 1; i1 <= 5; i1++) {
    for (let i2 = 1; i2 <= 5; i2++) {
      for (let i3 = 1; i3 <= 5; i3++) {
        const xpath = `//*[@id="root"]/div/div[${i1}]/div[${i2}]/div[${i3}]/article/div/div/section`;
        const element = findElementXpath(xpath);

        if (element) {
          return element;
        }
      }
    }
  }
}

const findElementXpath = (path) => {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
