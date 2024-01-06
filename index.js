function createFloatingDiv(navigation) {
    const floatingDiv = document.createElement('div');
    floatingDiv.style.width='250px'
    floatingDiv.style.position = 'fixed';
    floatingDiv.style.left = '80%'; // 요소의 오른쪽에 위치
    floatingDiv.style.top = '50%';
    //floatingDiv.style.backgroundColor = 'yellow';
    floatingDiv.style.padding = '10px';
    floatingDiv.style.border = '1px solid black';
    floatingDiv.innerHTML = navigation;
    return floatingDiv;
}

function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function checkAndLogElement() {
    for (let i1 = 1; i1 <= 5; i1++) {
        for (let i2 = 1; i2 <= 5; i2++) {
            for (let i3 = 1; i3 <= 5; i3++) {
                for (let i4 = 1; i4 <= 5; i4++) {
                    // 다른 인덱스에 대해 추가 반복문을 여기에 삽입할 수 있습니다.
                    const xpath = `//*[@id="root"]/div/div[${i1}]/div[${i2}]/div[${i3}]/article/div/div/section`;
                    const element = getElementByXpath(xpath);

                    if (element) {
                        //alert(element.textContent);
                        let navigation = ''
                        let hTags = element.querySelectorAll('h1, h2, h3, h4');
                        hTags.forEach(tag => {
                            if (tag.id) {
                                navigation += `<a href="#${tag.id}">${tag.textContent}</a><br>`;
                            } else {
                                // id 속성이 없는 경우, 단순히 텍스트만 추가합니다.
                                navigation += `${tag.textContent}<br>`;
                            }
                            //alert(tag.tagName + " content: " + tag.textContent);
                        });

                        // 새로운 floating div를 생성하고 요소 옆에 추가합니다.
                        const newDiv = createFloatingDiv(navigation);
                        element.parentElement.appendChild(newDiv);
                        //observer.disconnect();
                        break; // 요소를 찾았으면 더 이상의 탐색을 중지합니다.
                    }
                }
            }
        }
    }
}

//
// // MutationObserver를 설정합니다.
// const observer = new MutationObserver(checkAndLogElement);
//
// // Observer 구성 옵션
// const config = {childList: true, subtree: true};
//
// // Observer를 문서의 바디에 연결합니다.
// observer.observe(document.body, config);

checkAndLogElement()