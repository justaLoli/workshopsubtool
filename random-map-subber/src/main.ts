// @ts-ignore isolatedModules

declare const g_sessionID: any;
declare const $J: any;

(()=>{

const config = {
    ITEMS_PER_PAGE: 30,
    MAX_FETCH_PAGES: 1667,
    FETCH_MULTIPLIER: 10,
    API_DELAY_MS: 1000,
    UI_CONTAINER_ID: 'my-userscript-ui',
    BASE_URL: new URL(window.location.href)
}

interface UIElements {
    container: HTMLDivElement | null;
    form: HTMLFormElement | null;
    mapCountInput: HTMLInputElement | null;
    submitButton: HTMLButtonElement | null;
    loadFromClipboardButton: HTMLButtonElement | null;
    loadFromCurrentPageButton: HTMLButtonElement | null;
    messageArea: HTMLParagraphElement | null;
    outputTextArea: HTMLTextAreaElement | null;
    loadToGameButton: HTMLButtonElement | null;
}

const UIManager = {
    elements: <UIElements>{
        container: null,
        form: null,
        mapCountInput: null,
        submitButton: null,
        loadFromClipboardButton: null,
        loadFromCurrentPageButton: null,
        messageArea: null,
        outputTextArea: null,
        loadToGameButton: null
    },
    containerShown: false,
    init(containerId: string = config.UI_CONTAINER_ID) {
        if (document.getElementById(containerId)) {
            console.warn(`UIManager: UI container with ID "${containerId}" already exists. Skipping initialization.`);
            return;
        }
        this.elements.container = document.createElement('div');
        this.elements.container.style.position = 'fixed';
        this.elements.container.style.top = '50%';
        this.elements.container.style.left = '50%';
        this.elements.container.style.transform = 'translate(-50%, -50%)';
        this.elements.container.style.color = "black";
        this.elements.container.style.display = "none";
        this.elements.container.style.backgroundColor = '#fafafa';
        this.elements.container.style.padding = '10px';
        this.elements.container.style.zIndex = '1000'; // 确保 UI 在背景之上
        document.body.appendChild(this.elements.container);

        this.elements.loadFromCurrentPageButton = document.createElement("button");
        this.elements.loadFromCurrentPageButton.textContent = "Fetch from current page";
        this.elements.loadFromCurrentPageButton.style.marginTop = "0px";
        this.elements.container.appendChild(this.elements.loadFromCurrentPageButton);

        this.elements.form = document.createElement('form');
        this.elements.form.id = 'map-selector-form';
        this.elements.container.appendChild(this.elements.form);
        this.elements.mapCountInput = document.createElement('input');
        this.elements.mapCountInput.type = 'number';
        this.elements.mapCountInput.id = 'map-count-input';
        this.elements.mapCountInput.name = 'map-count-input';
        this.elements.mapCountInput.placeholder = "# of maps needed"
        this.elements.mapCountInput.style.color = "black";
        this.elements.mapCountInput.style.backgroundColor = "white";
        this.elements.mapCountInput.required = true;

        this.elements.submitButton = document.createElement('button');
        this.elements.submitButton.textContent = 'Fetch from random (page 1~1667)';
        this.elements.submitButton.style.marginTop = "10px";
        this.elements.submitButton.style.marginRight = "10px";
        this.elements.form.appendChild(this.elements.submitButton);
        this.elements.form.appendChild(this.elements.mapCountInput);

        this.elements.loadFromClipboardButton = document.createElement('button');
        this.elements.loadFromClipboardButton.textContent = 'Fetch from clipboard';
        this.elements.loadFromClipboardButton.style.marginTop = '10px';
        this.elements.container.appendChild(this.elements.loadFromClipboardButton);

        this.elements.messageArea = document.createElement('p');
        this.elements.messageArea.innerText = "Workshop tool: Casual, more general. Speedrun tool in progress.";
        this.elements.messageArea.style.marginTop = "10px";
        this.elements.messageArea.style.marginBottom = "10px";
        this.elements.container.appendChild(this.elements.messageArea);

        this.elements.outputTextArea = document.createElement('textarea');
        this.elements.outputTextArea.readOnly = true;
        this.elements.outputTextArea.rows = 10;
        this.elements.outputTextArea.cols = 50;
        this.elements.outputTextArea.style.backgroundColor = "white";
        this.elements.outputTextArea.style.color = "black";
        this.elements.container.appendChild(this.elements.outputTextArea);


        this.elements.loadToGameButton = document.createElement('button');
        this.elements.loadToGameButton.style.marginLeft = "10px";
        this.elements.loadToGameButton.textContent = 'Load to Game';
        this.elements.container.appendChild(this.elements.loadToGameButton);
        console.log(`UIManager: UI ${containerId} Initialized.`);
        this.addOpenCloseButton();
    },
    toggleContainerDisplay() {
        UIManager.containerShown = !UIManager.containerShown;
        if (UIManager.containerShown) {
            UIManager.elements.container!.style.display = "unset";
        } else {
            UIManager.elements.container!.style.display = "none";
        }
    },
    addOpenCloseButton() {
        const toggleUIButtonSpan = document.createElement("span");
        toggleUIButtonSpan.classList = "btn_blue_steamui btn_medium";
        toggleUIButtonSpan.innerHTML = "<span>Open Workshop Tool</span>";
        toggleUIButtonSpan.onclick = this.toggleContainerDisplay;
        const searchedTermsContainer = document.querySelector(".searchedTermsContainer");
        if (searchedTermsContainer) {
            searchedTermsContainer.appendChild(toggleUIButtonSpan);
        } else {
            toggleUIButtonSpan.style.position = "fixed";
            toggleUIButtonSpan.style.top = "20px";
            toggleUIButtonSpan.style.left = "20px";
            document.body.appendChild(toggleUIButtonSpan);
        }
        const closeUIButton = document.createElement("button");
        closeUIButton.style.position = "absolute";
        closeUIButton.style.top = "10px";
        closeUIButton.style.right = "10px";
        closeUIButton.textContent = "Close";
        closeUIButton.onclick = this.toggleContainerDisplay;
        this.elements.container!.appendChild(closeUIButton);
    },
    bindEvents(eventConfigs: {
        elementName: keyof UIElements;
        eventName: string;
        handler: () => void;
    }[]) {
        eventConfigs.forEach(config => {
            const element = this.elements[config.elementName];
            if(!element){console.error(`UIManager: Element with name '${config.elementName}' not found.`);return;}
            element.addEventListener(config.eventName, e=>{e.preventDefault();config.handler()});
        });
        console.log("UIManager: Events Bound.");
    },
    getMapCountInput(): number {
        if (!UIManager.elements.mapCountInput) return NaN; // Check if element exists
        const value = parseInt(UIManager.elements.mapCountInput.value, 10);
        return isNaN(value) ? NaN : value;
    },
    setOutput(text: string): void {
        if (UIManager.elements.outputTextArea) { // Check if element exists
            UIManager.elements.outputTextArea.value = text;
        }
    },
    getOutput(): string {
        if (!UIManager.elements.outputTextArea) return ""; // Check if element exists
        return UIManager.elements.outputTextArea.value;
    },
    showMessage(text: string, isError: boolean = false): void {
        if (isError) { console.error(text) }
        else { console.log(text) }
        if (UIManager.elements.messageArea) { // Check if element exists
            UIManager.elements.messageArea.textContent = text;
            UIManager.elements.messageArea.style.color = isError ? 'red' : 'black';
            UIManager.elements.messageArea.style.fontWeight = isError ? 'bold' : 'normal';
        }
    },
    showLoading(message: string = "Loading..."): void {
        UIManager.showMessage(message);
        // Optional: Disable buttons during loading
        if (UIManager.elements.submitButton) UIManager.elements.submitButton.disabled = true;
        if (UIManager.elements.loadFromClipboardButton) UIManager.elements.loadFromClipboardButton.disabled = true;
        if (UIManager.elements.loadToGameButton) UIManager.elements.loadToGameButton.disabled = true;
        if (UIManager.elements.loadFromCurrentPageButton) UIManager.elements.loadFromCurrentPageButton.disabled = true;
    },
    hideLoading(): void {
        // Re-enable buttons
        if (UIManager.elements.submitButton) UIManager.elements.submitButton.disabled = false;
        if (UIManager.elements.loadFromClipboardButton) UIManager.elements.loadFromClipboardButton.disabled = false;
        if (UIManager.elements.loadToGameButton) UIManager.elements.loadToGameButton.disabled = false;
        if (UIManager.elements.loadFromCurrentPageButton) UIManager.elements.loadFromCurrentPageButton.disabled = false;
    }
};

const WorkShopFetcher = {
    parser: new DOMParser(),
    getTotalMapCount: () => {
        const pagingInfo = document.querySelector(".workshopBrowsePagingInfo")!.textContent;
        const matches = pagingInfo!.replace(/,/g, "").match(/\d+/g)?.map(Number) ?? [0];
        const totalMapCount = Math.max(...matches);
        return totalMapCount;
    },
    calculateTotalPages: (totalMapCount: number) => {
        // get total possible page count
        const totalPageCount = Math.min(Math.ceil(totalMapCount / config.ITEMS_PER_PAGE), config.MAX_FETCH_PAGES); // cant fetch more then 1667 page
        return totalPageCount;
    },
    filterMapIdsFromPageDocument: (doc: Document) => {
        const itemDivList = doc.querySelectorAll(".workshopItem");
        const fileIds = Array.from(itemDivList).map(divElement => {
            const n = divElement.querySelector(".workshopItemPreviewHolder")!;
            return n.id.replace("sharedfile_", "");
        })
        return fileIds;
    },
    fetchMapIdsFromPage: async (url: URL, page: number) => {
        const parser = WorkShopFetcher.parser;
        url.searchParams.set("p", String(page));
        const response = await fetch(url);
        if (!response.ok) { throw new Error("response not ok") };
        const responseText = await response.text();
        // parse the page and get file list
        const doc = parser.parseFromString(responseText, "text/html");
        return WorkShopFetcher.filterMapIdsFromPageDocument(doc);
    },
    getRandomMaps: async (url: URL, neededCount: number, progressCallback: (msg: string) => void) => {
        try {
            progressCallback("Start Loading...");
            const totalMapCount = WorkShopFetcher.getTotalMapCount();
            const totalPageCount = WorkShopFetcher.calculateTotalPages(totalMapCount);
            const allFetchedIds: string[] = [];
            const targetFetchCount = neededCount * config.FETCH_MULTIPLIER;
            while (allFetchedIds.length < targetFetchCount && allFetchedIds.length < totalMapCount) {
                const randomPage = Math.floor(Math.random() * totalPageCount) + 1;
                progressCallback(`Fetching maps from random page ${randomPage}...`);
                try {
                    const ids = await WorkShopFetcher.fetchMapIdsFromPage(url, randomPage);
                    allFetchedIds.push(...ids);
                } catch (pageError) {
                    progressCallback(`Failed to fetch page ${randomPage}: ${pageError}`);
                    throw pageError;
                }
            }
            const shuffle = (array: any[]) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }
            const uniqueIds = [...new Set(allFetchedIds)]; // 简单去重
            const shuffledIds = shuffle(uniqueIds);
            const selectedItems = shuffledIds.slice(0, neededCount);
            progressCallback(`fetching done.`);
            return selectedItems;
        } catch (error) {
            console.error(`error in getRandomMaps`, error);
            progressCallback(`get random maps failed :(`);
            throw error;
        }
    }
}


const MapSubber = {
    subscribeList: async (appid: string, sessionid: string, mapList: string[], progressCallback: (msg: string) => void) => {
        const makePostRequest = (url: string, data: { id: string, appid: string, sessionid: string }) => {
            return new Promise((resolve, reject) => {
                $J.post(url, data)
                    .done(resolve) // Resolve the Promise with the jQuery's done callback
                    .fail(reject);  // Reject the Promise with the jQuery's fail callback
            });
        };
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const params = mapList.map(x => { return { id: x, appid: appid, sessionid: sessionid } });
        for (const p of params) {
            progressCallback(`subbing map ${p.id}`);
            await makePostRequest("https://steamcommunity.com/sharedfiles/subscribe", p);
            await delay(config.API_DELAY_MS);
        }
        progressCallback(`subbing done.`);
    }
}

const App = {
    init: () => {
        UIManager.init();
        UIManager.bindEvents([
            { elementName: "form", eventName: 'submit', handler: App.handleSubmit },
            { elementName: "loadFromClipboardButton", eventName: 'click', handler: App.handleLoadFromClipboard },
            { elementName: "loadToGameButton", eventName: 'click', handler: App.handleLoadToGame },
            { elementName: "loadFromCurrentPageButton", eventName: 'click', handler: App.handleLoadFromCurrentPage}
        ]);
    },
    handleLoadFromCurrentPage:() => {
        const mapList = WorkShopFetcher.filterMapIdsFromPageDocument(document);
        UIManager.setOutput(JSON.stringify(mapList, null, 2));
        UIManager.hideLoading();
    },
    handleSubmit: async () => {
        const neededCount = UIManager.getMapCountInput();
        if (isNaN(neededCount) || neededCount <= 0) {
            UIManager.showMessage(`Please enter a valid number`);
            return;
        }
        UIManager.showLoading(`fetching`);
        UIManager.setOutput("");
        try {
            const selectedItems = await WorkShopFetcher.getRandomMaps(config.BASE_URL, neededCount, UIManager.showMessage);
            UIManager.setOutput(JSON.stringify(selectedItems, null, 2));
            UIManager.hideLoading();
        } catch (error) {
            UIManager.hideLoading();
        }
    },
    handleLoadFromClipboard: async () => {
        try {
            const text = await navigator.clipboard.readText();
            UIManager.setOutput(text);
            UIManager.showMessage("loaded from clipboard");
        } catch (err) {
            console.error('load from clipboard failed', err);
            UIManager.showMessage("load from clipboard failed");
        }
    },
    handleLoadToGame: async () => {
        const text = UIManager.getOutput();
        let mapList;
        try {
            mapList = JSON.parse(text);
            if (!Array.isArray(mapList)) { throw new Error("mapList format wrong"); }
        } catch (error) {
            UIManager.showMessage(`mapList invalid`); return;
        }
        UIManager.showLoading();
        try {
            const appid = config.BASE_URL.searchParams.get("appid")!;
            await MapSubber.subscribeList(appid, g_sessionID, mapList, UIManager.showMessage);
        } catch (error) {
            UIManager.showMessage(`Error during subbing`)
        } finally {
            UIManager.hideLoading();
        }
    }
}

App.init();

})();

/*

EXPERIMENTAL!!!





*/

