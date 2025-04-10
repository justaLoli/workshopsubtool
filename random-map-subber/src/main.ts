// @ts-ignore isolatedModules

declare const g_sessionID: any;
declare const $J: any;

const sidebar = document.querySelector(".sidebar");
const hasSteamUI = (sidebar != null);
const myContainer = document.createElement("div");
if (hasSteamUI) {
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = `<div class="rightSectionTopTitle">Tools</div>`;
    myContainer.className = "rightDetailsBlock";
    panel.appendChild(myContainer);
    sidebar.prepend(panel);
} else {
    myContainer.style.position = "fixed";
    myContainer.style.top = "20px";
    myContainer.style.left = "20px";
    myContainer.style.zIndex = "1000";
    document.body.appendChild(myContainer);
}

const createSteamUIButton = (buttonText:string) => {
    if(hasSteamUI) {
        const b = document.createElement("div");
        b.classList = "browseOption notSelected";
        b.innerHTML = `<a>${buttonText}</a>`
        return b;
    }
    else {
        const b = document.createElement("button");
        b.innerText = buttonText;
        return b;
    }
}


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
        this.elements.messageArea.innerText = "Workshop tool: Casual, more general.";
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
        this.elements.loadToGameButton.textContent = 'Subscribe Items';
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
        const toggleUIButtonSpan = createSteamUIButton("Open Workshop Tool");
        toggleUIButtonSpan.onclick = this.toggleContainerDisplay;
        myContainer.appendChild(toggleUIButtonSpan);
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

(()=>{

const config = {
    ITEMS_PER_PAGE: 30,
    MAX_FETCH_PAGES: 1667,
    FETCH_MULTIPLIER: 10,
    API_DELAY_MS: 0,
    UI_CONTAINER_ID: 'my-userscript-sr-ui',
    BASE_URL: new URL("https://steamcommunity.com/workshop/browse/?appid=620&searchtext=&childpublishedfileid=0&browsesort=mostrecent&requiredtags%5B%5D=Singleplayer&created_date_range_filter_start=0&created_date_range_filter_end=0&updated_date_range_filter_start=0&updated_date_range_filter_end=0&itemperpage=30"),
    START_TIME_STAMP: 1325376000,
    END_TIME_STAMP: 1798761600,
    APPID: "620"
}

interface UIElements {
    container: HTMLDivElement | null;
    form: HTMLFormElement | null;
    mapCountInput: HTMLInputElement | null;
    submitAndSubButton: HTMLButtonElement | null;
    messageArea: HTMLParagraphElement | null;
    outputTextArea: HTMLTextAreaElement | null;
}

const UIManager = {
    elements: <UIElements>{
        container: null,
        form: null,
        mapCountInput: null,
        submitAndSubButton: null,
        messageArea: null,
        outputTextArea: null
    },
    textHints: {
        topdescription: "Portal 2 NSRCC% tool: <br>Pick truly randomized singleplayer map from entire workshop!",
        mapCountInputPlaceholder: "# of maps needed",
        submitAndSubButton: "Fetch and subscribe",
        innerTextDefault: "Speedrun tool: true random, slower, and p2 singleplayer only.",
        toggleUIButton: "Open NSRCC% Tool",
        closeUIButton: "Close"
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

        const description = document.createElement("p");
        description.innerHTML = this.textHints.topdescription;
        this.elements.container.appendChild(description);

        this.elements.form = document.createElement('form');
        this.elements.form.id = 'map-selector-form';
        this.elements.container.appendChild(this.elements.form);
        this.elements.mapCountInput = document.createElement('input');
        this.elements.mapCountInput.type = 'number';
        this.elements.mapCountInput.id = 'map-count-input';
        this.elements.mapCountInput.name = 'map-count-input';
        this.elements.mapCountInput.placeholder = this.textHints.mapCountInputPlaceholder;
        this.elements.mapCountInput.style.color = "black";
        this.elements.mapCountInput.style.backgroundColor = "white";
        this.elements.mapCountInput.required = true;

        this.elements.submitAndSubButton = document.createElement('button');
        this.elements.submitAndSubButton.textContent = this.textHints.submitAndSubButton;
        this.elements.submitAndSubButton.style.marginTop = "10px";
        this.elements.submitAndSubButton.style.marginRight = "10px";
        this.elements.form.appendChild(this.elements.submitAndSubButton);
        this.elements.form.appendChild(this.elements.mapCountInput);

        this.elements.messageArea = document.createElement('p');
        this.elements.messageArea.innerText = this.textHints.innerTextDefault;
        this.elements.messageArea.style.marginTop = "10px";
        this.elements.messageArea.style.marginBottom = "10px";
        this.elements.container.appendChild(this.elements.messageArea);

        this.elements.outputTextArea = document.createElement('textarea');
        this.elements.outputTextArea.readOnly = true;
        this.elements.outputTextArea.rows = 10;
        this.elements.outputTextArea.cols = 50;
        this.elements.outputTextArea.style.backgroundColor = "#fafafa";
        this.elements.outputTextArea.style.color = "black";
        this.elements.container.appendChild(this.elements.outputTextArea);

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
        const toggleUIButtonSpan = createSteamUIButton(this.textHints.toggleUIButton);
        toggleUIButtonSpan.onclick = this.toggleContainerDisplay;
        myContainer.appendChild(toggleUIButtonSpan);
        const closeUIButton = document.createElement("button");
        closeUIButton.style.position = "absolute";
        closeUIButton.style.top = "10px";
        closeUIButton.style.right = "10px";
        closeUIButton.textContent = this.textHints.closeUIButton;
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
    showMessage(text: string, isError: boolean = false): void {
        if (isError) { console.error(text) }
        else { console.log(text) }
        if (UIManager.elements.messageArea) { // Check if element exists
            UIManager.elements.messageArea.textContent = text;
            UIManager.elements.messageArea.style.color = isError ? 'red' : 'black';
            UIManager.elements.messageArea.style.fontWeight = isError ? 'bold' : 'normal';
        }
    },
    showLog(text: string, consolecmd:typeof console.log=console.log): void{
        consolecmd(text);
        if(!UIManager.elements.outputTextArea){return;}
        UIManager.elements.outputTextArea.value += text + '\n';
        UIManager.elements.outputTextArea.scrollTop = UIManager.elements.outputTextArea.scrollHeight;
    },
    showLoading(message: string = "Loading..."): void {
        UIManager.showMessage(message);
        // Optional: Disable buttons during loading
        if (UIManager.elements.submitAndSubButton) UIManager.elements.submitAndSubButton.disabled = true;
    },
    hideLoading(): void {
        // Re-enable buttons
        if (UIManager.elements.submitAndSubButton) UIManager.elements.submitAndSubButton.disabled = false;
    }
};

const WorkShopFetcher = {
    parser: new DOMParser(),
    getTotalMapCount: (doc: Document = document) => {
        const info = doc.querySelector(".workshopBrowsePagingInfo");
        const noItems = doc.getElementById("no_items");
        if(!info && !noItems){throw new Error("cant find map Count by any mean :(");}
        if(!info && noItems){return 0;}
        const pagingInfo = info!.textContent;
        const matches = pagingInfo!.replace(/,/g, "").match(/\d+/g)?.map(Number) ?? [0];
        const totalMapCount = Math.max(...matches);
        return totalMapCount;
    },
    calculateTotalPages: (totalMapCount: number) => {
        // get total page count needed to display total map count
        const totalPageCount = Math.ceil(totalMapCount / config.ITEMS_PER_PAGE);
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
    parseURLToDocument: async(url: URL) => {
        const parser = WorkShopFetcher.parser;
        const response = await fetch(url);
        if (!response.ok) { throw new Error(`url ${url.href} response not ok`) };
        const responseText = await response.text();
        const doc = parser.parseFromString(responseText, "text/html");
        return doc;
    },
    fetchMapIdsFromPage: async (url: URL, page: number) => {
        url.searchParams.set("p", String(page));
        // parse the page and get file list
        const doc = await WorkShopFetcher.parseURLToDocument(url);
        return WorkShopFetcher.filterMapIdsFromPageDocument(doc);
    },
    getRandomMaps: async (url: URL, neededCount: number, progressCallback: (msg: string) => void) => {
        //deprecated
        try {
            progressCallback("Start Loading...");
            const totalMapCount = WorkShopFetcher.getTotalMapCount();
            const totalPageCount = Math.min(WorkShopFetcher.calculateTotalPages(totalMapCount),config.MAX_FETCH_PAGES);
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
    makePostRequest: (url: string, data: { id: string, appid: string, sessionid: string }) => {
        return new Promise((resolve, reject) => {
            $J.post(url, data)
                .done(resolve) // Resolve the Promise with the jQuery's done callback
                .fail(reject);  // Reject the Promise with the jQuery's fail callback
        });
    },
    delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
    subscribeMap: async(data: { id: string, appid: string, sessionid: string })=>{
        await MapSubber.makePostRequest("https://steamcommunity.com/sharedfiles/subscribe", data );
        await MapSubber.delay(config.API_DELAY_MS);
    },
    subscribeList: async (appid: string, sessionid: string, mapList: string[], progressCallback: (msg: string) => void) => {
        const params = mapList.map(x => { return { id: x, appid: appid, sessionid: sessionid } });
        for (const p of params) {
            progressCallback(`subbing map ${p.id}`);
            await MapSubber.subscribeMap(p);
        }
        progressCallback(`subbing done.`);
    }
}

interface MapRange {
    mapCount: number,
    pageCount: number,
    start: number,
    end: number
};

const App = {
    init: () => {
        UIManager.init();
        UIManager.bindEvents([
            { elementName: "form", eventName: 'submit', handler: App.handleSubmit },
        ]);
    },
    calcCache: new Map<string,[mapCount:number,pageCount:number]>(),
    handleSubmit: async () => {
        const startTime = performance.now();
        const neededCount = UIManager.getMapCountInput();
        if (isNaN(neededCount) || neededCount <= 0) {
            UIManager.showMessage(`Please enter a valid number`);
            return;
        }
        UIManager.showLoading(`Submit clicked! ${neededCount}`);
        UIManager.showLog(`Start`);
        for (let i = 0; i < neededCount; i++) {
            await App.getAndSubTrulyRandomMap();
            UIManager.showLoading(`Finished ${i+1} / ${neededCount}.`);
        }
        UIManager.showMessage(`All finished.`);
        UIManager.hideLoading();
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000; // 计算经过的时间
        UIManager.showLog(`\nTotal time cost: ${elapsedTime.toFixed(2)}s`);
    },
    getAndSubTrulyRandomMap: async () => {
        const startTime = performance.now();
        const log = UIManager.showLog;
        const result = await App.biSelectForNarrowRange(
            config.START_TIME_STAMP, config.END_TIME_STAMP, 
            WorkShopFetcher.getTotalMapCount(await WorkShopFetcher.parseURLToDocument(config.BASE_URL)),
            log
            );
        console.log(result);
        log(`\nGetting random map from range ${App.formatTimeStampRange(result.start, result.end)}`);
        const map = await App.getRandomMapInNarrowRange(result);
        log(`\nSubbing the random map: ${map}`);
        await MapSubber.subscribeMap({id:map, appid: config.APPID, sessionid: g_sessionID});
        log(`Subbing done.`);

        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000; // 计算经过的时间
        log(`Time cost for this map: ${elapsedTime.toFixed(2)}s`);
    },
    getRandomMapInNarrowRange: async (mapRange: MapRange) => {
        const {mapCount, pageCount, start, end} = mapRange;
        const url = new URL(config.BASE_URL);
        url.searchParams.set("created_date_range_filter_start", start.toString());
        url.searchParams.set("created_date_range_filter_end", end.toString());

        const mapCountInLastPage = mapCount - (pageCount-1) * config.ITEMS_PER_PAGE;
        if(mapCountInLastPage < 0) {throw new Error("idk why but the calculated mapcount in last page is less than 0");}
        const lastPageProbability = mapCountInLastPage / mapCount;
        const isLastPage = App.randomChoose([lastPageProbability, 1 - lastPageProbability]) === 0;
        if(isLastPage){
            const mapList = await WorkShopFetcher.fetchMapIdsFromPage(url,pageCount)!;
            return mapList[Math.floor(Math.random() * mapList.length)];
        } else {
            const randomPage = Math.floor(Math.random() * (pageCount-1)) + 1; // 1 ～ pageCount - 1;
            const mapList = await WorkShopFetcher.fetchMapIdsFromPage(url, randomPage)!;
            return mapList[Math.floor(Math.random() * mapList.length)];
        }
    },
    formatTimeStampRange: (start:number, end:number) => {
        return `${start} ~ ${end} (${new Date(start * 1000).toISOString()} ~ ${new Date(end * 1000).toISOString()})`;
    },
    fetchCountInRange: async (start:number,end:number, log: typeof UIManager.showLog):Promise<MapRange> => {
        log(`Fetching range: ${App.formatTimeStampRange(start, end)}`);
        
        if(App.calcCache.has(`${start},${end}`)){
            log(`This range has calculated before! Return cache.`);
            const [mapCount, pageCount] = App.calcCache.get(`${start},${end}`)!;
            log(`Fetched result: ${start} ~ ${end}: mapCount: ${mapCount}, pageCount: ${pageCount}`);
            return {mapCount, pageCount, start, end};
        }

        const url = new URL(config.BASE_URL);
        url.searchParams.set("created_date_range_filter_start", start.toString());
        url.searchParams.set("created_date_range_filter_end", end.toString());
        const mapCount = WorkShopFetcher.getTotalMapCount(await WorkShopFetcher.parseURLToDocument(url));
        const pageCount = WorkShopFetcher.calculateTotalPages(mapCount);
        log(`Fetched result: ${start} ~ ${end}: mapCount: ${mapCount}, pageCount: ${pageCount}`);

        App.calcCache.set(`${start},${end}`,[mapCount, pageCount]);
        return {mapCount, pageCount, start, end};
    },
    randomChoose: (probs: number[]) => {
        // now only supports 2 
        if (Math.random() < probs[0]){return 0;}
        return 1;
    },
    // 传入上一级的totalCount以做验证
    biSelectForNarrowRange: async (start:number, end:number, totalCount: number, log: typeof UIManager.showLog):Promise<MapRange> => {
        log(`\nTrying to get random map in range ${App.formatTimeStampRange(start, end)}`);
        const middle = Math.floor((start + end) / 2);
        log("Fetching counts for the two halves...");
        const [result1, result2] = await Promise.all([
            App.fetchCountInRange(start, middle, (_)=>{}),
            App.fetchCountInRange(middle + 1, end, (_)=>{}) /* should check if this +1 is needed or not */
        ]);
        const sumMapCount = result1.mapCount + result2.mapCount;
        if (result1.mapCount + result2.mapCount !== totalCount) {
            log("WARNING: Two halves cant add up to total. It's either someone added a map during the process or wrong code logic.");
            log(`Sum of two parts: ${result1.mapCount + result2.mapCount}; total: ${totalCount}; difference: ${result1.mapCount + result2.mapCount - totalCount}`);
        }
        const prob1 = result1.mapCount / sumMapCount;
        log(`Choosing older half and newer half with probability ${prob1} and ${1 - prob1}`);
        // unnecessary type of code lol
        const chooseResult = App.randomChoose([prob1, 1 - prob1]) === 0
            ? (()=>{log(`Selected the older half.`);return result1})()
            : (()=>{log(`Selected the newer half.`);return result2})();
        if (chooseResult.pageCount < config.MAX_FETCH_PAGES){
            log("Result range is narrow enough for next phase. Existing.")
            return chooseResult;
        } else {
            log("Range too wide, continue.");
            return await App.biSelectForNarrowRange(chooseResult.start, chooseResult.end, chooseResult.mapCount, log);
        }
    },

}

App.init();

})();