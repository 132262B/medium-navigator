class Navigator {

    static _createFloatingDiv(navigation) {
        const floatingDiv = document.createElement('div');
        floatingDiv.className = 'navigation-box';
        floatingDiv.innerHTML = navigation;
        return floatingDiv;
    }

    static _getElementXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    static _selectXpath() {
        for (let i1 = 1; i1 <= 5; i1++) {
            for (let i2 = 1; i2 <= 5; i2++) {
                for (let i3 = 1; i3 <= 5; i3++) {
                    const xpath = `//*[@id="root"]/div/div[${i1}]/div[${i2}]/div[${i3}]/article/div/div/section`;
                    const element = this._getElementXpath(xpath);

                    if (element) {
                        return element;
                    }
                }
            }
        }
    }

    static _createNavigationLinkElement(tag) {
        return `
                <a href="#${tag.id}" class="navigation-link navigation-link-${tag.tagName.toLowerCase()}">${tag.textContent}</a><br>
        `;
    }

    static init() {
        const element = this._selectXpath();

        if (!element) return;

        let navigation = '';
        const hTags = element.querySelectorAll('h1, h2');
        hTags.forEach(tag => {
            if (tag.id) {
                navigation += this._createNavigationLinkElement(tag);
            }
        });

        const newDiv = this._createFloatingDiv(navigation);
        element.parentElement.appendChild(newDiv);
    }

}

//Navigator.init();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "init") {
        setTimeout(()=> {
            Navigator.init();
        }, 1000);
    }
});