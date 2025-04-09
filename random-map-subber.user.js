// ==UserScript==
// @name         Sub X random community maps!
// @namespace    vite-plugin-monkey
// @version      2.0
// @author       justaloli
// @description  [RELEASE NOTE] TRUE RANDOM AND P2 NSRCC% SUPPORT!
// @downloadURL  https://raw.githubusercontent.com/justaLoli/workshopsubtool/main/random-map-subber.user.js
// @updateURL    https://raw.githubusercontent.com/justaLoli/workshopsubtool/main/random-map-subber.user.js
// @match        https://steamcommunity.com/workshop/browse/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  (() => {
    const config = {
      ITEMS_PER_PAGE: 30,
      MAX_FETCH_PAGES: 1667,
      FETCH_MULTIPLIER: 10,
      API_DELAY_MS: 1e3,
      UI_CONTAINER_ID: "my-userscript-ui",
      BASE_URL: new URL(window.location.href)
    };
    const UIManager = {
      elements: {
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
      init(containerId = config.UI_CONTAINER_ID) {
        if (document.getElementById(containerId)) {
          console.warn(`UIManager: UI container with ID "${containerId}" already exists. Skipping initialization.`);
          return;
        }
        this.elements.container = document.createElement("div");
        this.elements.container.style.position = "fixed";
        this.elements.container.style.top = "50%";
        this.elements.container.style.left = "50%";
        this.elements.container.style.transform = "translate(-50%, -50%)";
        this.elements.container.style.color = "black";
        this.elements.container.style.display = "none";
        this.elements.container.style.backgroundColor = "#fafafa";
        this.elements.container.style.padding = "10px";
        this.elements.container.style.zIndex = "1000";
        document.body.appendChild(this.elements.container);
        this.elements.loadFromCurrentPageButton = document.createElement("button");
        this.elements.loadFromCurrentPageButton.textContent = "Fetch from current page";
        this.elements.loadFromCurrentPageButton.style.marginTop = "0px";
        this.elements.container.appendChild(this.elements.loadFromCurrentPageButton);
        this.elements.form = document.createElement("form");
        this.elements.form.id = "map-selector-form";
        this.elements.container.appendChild(this.elements.form);
        this.elements.mapCountInput = document.createElement("input");
        this.elements.mapCountInput.type = "number";
        this.elements.mapCountInput.id = "map-count-input";
        this.elements.mapCountInput.name = "map-count-input";
        this.elements.mapCountInput.placeholder = "# of maps needed";
        this.elements.mapCountInput.style.color = "black";
        this.elements.mapCountInput.style.backgroundColor = "white";
        this.elements.mapCountInput.required = true;
        this.elements.submitButton = document.createElement("button");
        this.elements.submitButton.textContent = "Fetch from random (page 1~1667)";
        this.elements.submitButton.style.marginTop = "10px";
        this.elements.submitButton.style.marginRight = "10px";
        this.elements.form.appendChild(this.elements.submitButton);
        this.elements.form.appendChild(this.elements.mapCountInput);
        this.elements.loadFromClipboardButton = document.createElement("button");
        this.elements.loadFromClipboardButton.textContent = "Fetch from clipboard";
        this.elements.loadFromClipboardButton.style.marginTop = "10px";
        this.elements.container.appendChild(this.elements.loadFromClipboardButton);
        this.elements.messageArea = document.createElement("p");
        this.elements.messageArea.innerText = "Workshop tool: Casual, more general. Speedrun tool in progress.";
        this.elements.messageArea.style.marginTop = "10px";
        this.elements.messageArea.style.marginBottom = "10px";
        this.elements.container.appendChild(this.elements.messageArea);
        this.elements.outputTextArea = document.createElement("textarea");
        this.elements.outputTextArea.readOnly = true;
        this.elements.outputTextArea.rows = 10;
        this.elements.outputTextArea.cols = 50;
        this.elements.outputTextArea.style.backgroundColor = "white";
        this.elements.outputTextArea.style.color = "black";
        this.elements.container.appendChild(this.elements.outputTextArea);
        this.elements.loadToGameButton = document.createElement("button");
        this.elements.loadToGameButton.style.marginLeft = "10px";
        this.elements.loadToGameButton.textContent = "Load to Game";
        this.elements.container.appendChild(this.elements.loadToGameButton);
        console.log(`UIManager: UI ${containerId} Initialized.`);
        this.addOpenCloseButton();
      },
      toggleContainerDisplay() {
        UIManager.containerShown = !UIManager.containerShown;
        if (UIManager.containerShown) {
          UIManager.elements.container.style.display = "unset";
        } else {
          UIManager.elements.container.style.display = "none";
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
        this.elements.container.appendChild(closeUIButton);
      },
      bindEvents(eventConfigs) {
        eventConfigs.forEach((config2) => {
          const element = this.elements[config2.elementName];
          if (!element) {
            console.error(`UIManager: Element with name '${config2.elementName}' not found.`);
            return;
          }
          element.addEventListener(config2.eventName, (e) => {
            e.preventDefault();
            config2.handler();
          });
        });
        console.log("UIManager: Events Bound.");
      },
      getMapCountInput() {
        if (!UIManager.elements.mapCountInput) return NaN;
        const value = parseInt(UIManager.elements.mapCountInput.value, 10);
        return isNaN(value) ? NaN : value;
      },
      setOutput(text) {
        if (UIManager.elements.outputTextArea) {
          UIManager.elements.outputTextArea.value = text;
        }
      },
      getOutput() {
        if (!UIManager.elements.outputTextArea) return "";
        return UIManager.elements.outputTextArea.value;
      },
      showMessage(text, isError = false) {
        if (isError) {
          console.error(text);
        } else {
          console.log(text);
        }
        if (UIManager.elements.messageArea) {
          UIManager.elements.messageArea.textContent = text;
          UIManager.elements.messageArea.style.color = isError ? "red" : "black";
          UIManager.elements.messageArea.style.fontWeight = isError ? "bold" : "normal";
        }
      },
      showLoading(message = "Loading...") {
        UIManager.showMessage(message);
        if (UIManager.elements.submitButton) UIManager.elements.submitButton.disabled = true;
        if (UIManager.elements.loadFromClipboardButton) UIManager.elements.loadFromClipboardButton.disabled = true;
        if (UIManager.elements.loadToGameButton) UIManager.elements.loadToGameButton.disabled = true;
        if (UIManager.elements.loadFromCurrentPageButton) UIManager.elements.loadFromCurrentPageButton.disabled = true;
      },
      hideLoading() {
        if (UIManager.elements.submitButton) UIManager.elements.submitButton.disabled = false;
        if (UIManager.elements.loadFromClipboardButton) UIManager.elements.loadFromClipboardButton.disabled = false;
        if (UIManager.elements.loadToGameButton) UIManager.elements.loadToGameButton.disabled = false;
        if (UIManager.elements.loadFromCurrentPageButton) UIManager.elements.loadFromCurrentPageButton.disabled = false;
      }
    };
    const WorkShopFetcher = {
      parser: new DOMParser(),
      getTotalMapCount: () => {
        var _a;
        const pagingInfo = document.querySelector(".workshopBrowsePagingInfo").textContent;
        const matches = ((_a = pagingInfo.replace(/,/g, "").match(/\d+/g)) == null ? void 0 : _a.map(Number)) ?? [0];
        const totalMapCount = Math.max(...matches);
        return totalMapCount;
      },
      calculateTotalPages: (totalMapCount) => {
        const totalPageCount = Math.min(Math.ceil(totalMapCount / config.ITEMS_PER_PAGE), config.MAX_FETCH_PAGES);
        return totalPageCount;
      },
      filterMapIdsFromPageDocument: (doc) => {
        const itemDivList = doc.querySelectorAll(".workshopItem");
        const fileIds = Array.from(itemDivList).map((divElement) => {
          const n = divElement.querySelector(".workshopItemPreviewHolder");
          return n.id.replace("sharedfile_", "");
        });
        return fileIds;
      },
      fetchMapIdsFromPage: async (url, page) => {
        const parser = WorkShopFetcher.parser;
        url.searchParams.set("p", String(page));
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("response not ok");
        }
        const responseText = await response.text();
        const doc = parser.parseFromString(responseText, "text/html");
        return WorkShopFetcher.filterMapIdsFromPageDocument(doc);
      },
      getRandomMaps: async (url, neededCount, progressCallback) => {
        try {
          progressCallback("Start Loading...");
          const totalMapCount = WorkShopFetcher.getTotalMapCount();
          const totalPageCount = WorkShopFetcher.calculateTotalPages(totalMapCount);
          const allFetchedIds = [];
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
          const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
          };
          const uniqueIds = [...new Set(allFetchedIds)];
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
    };
    const MapSubber = {
      subscribeList: async (appid, sessionid, mapList, progressCallback) => {
        const makePostRequest = (url, data) => {
          return new Promise((resolve, reject) => {
            $J.post(url, data).done(resolve).fail(reject);
          });
        };
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const params = mapList.map((x) => {
          return { id: x, appid, sessionid };
        });
        for (const p of params) {
          progressCallback(`subbing map ${p.id}`);
          await makePostRequest("https://steamcommunity.com/sharedfiles/subscribe", p);
          await delay(config.API_DELAY_MS);
        }
        progressCallback(`subbing done.`);
      }
    };
    const App = {
      init: () => {
        UIManager.init();
        UIManager.bindEvents([
          { elementName: "form", eventName: "submit", handler: App.handleSubmit },
          { elementName: "loadFromClipboardButton", eventName: "click", handler: App.handleLoadFromClipboard },
          { elementName: "loadToGameButton", eventName: "click", handler: App.handleLoadToGame },
          { elementName: "loadFromCurrentPageButton", eventName: "click", handler: App.handleLoadFromCurrentPage }
        ]);
      },
      handleLoadFromCurrentPage: () => {
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
          console.error("load from clipboard failed", err);
          UIManager.showMessage("load from clipboard failed");
        }
      },
      handleLoadToGame: async () => {
        const text = UIManager.getOutput();
        let mapList;
        try {
          mapList = JSON.parse(text);
          if (!Array.isArray(mapList)) {
            throw new Error("mapList format wrong");
          }
        } catch (error) {
          UIManager.showMessage(`mapList invalid`);
          return;
        }
        UIManager.showLoading();
        try {
          const appid = config.BASE_URL.searchParams.get("appid");
          await MapSubber.subscribeList(appid, g_sessionID, mapList, UIManager.showMessage);
        } catch (error) {
          UIManager.showMessage(`Error during subbing`);
        } finally {
          UIManager.hideLoading();
        }
      }
    };
    App.init();
  })();
  (() => {
    const config = {
      ITEMS_PER_PAGE: 30,
      MAX_FETCH_PAGES: 1667,
      FETCH_MULTIPLIER: 10,
      API_DELAY_MS: 0,
      UI_CONTAINER_ID: "my-userscript-sr-ui",
      BASE_URL: new URL("https://steamcommunity.com/workshop/browse/?appid=620&searchtext=&childpublishedfileid=0&browsesort=mostrecent&requiredtags%5B%5D=Singleplayer&created_date_range_filter_start=0&created_date_range_filter_end=0&updated_date_range_filter_start=0&updated_date_range_filter_end=0&itemperpage=30"),
      START_TIME_STAMP: 1325376e3,
      END_TIME_STAMP: 1798761600,
      APPID: "620"
    };
    const UIManager = {
      elements: {
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
      init(containerId = config.UI_CONTAINER_ID) {
        if (document.getElementById(containerId)) {
          console.warn(`UIManager: UI container with ID "${containerId}" already exists. Skipping initialization.`);
          return;
        }
        this.elements.container = document.createElement("div");
        this.elements.container.style.position = "fixed";
        this.elements.container.style.top = "50%";
        this.elements.container.style.left = "50%";
        this.elements.container.style.transform = "translate(-50%, -50%)";
        this.elements.container.style.color = "black";
        this.elements.container.style.display = "none";
        this.elements.container.style.backgroundColor = "#fafafa";
        this.elements.container.style.padding = "10px";
        this.elements.container.style.zIndex = "1000";
        document.body.appendChild(this.elements.container);
        const description = document.createElement("p");
        description.innerHTML = this.textHints.topdescription;
        this.elements.container.appendChild(description);
        this.elements.form = document.createElement("form");
        this.elements.form.id = "map-selector-form";
        this.elements.container.appendChild(this.elements.form);
        this.elements.mapCountInput = document.createElement("input");
        this.elements.mapCountInput.type = "number";
        this.elements.mapCountInput.id = "map-count-input";
        this.elements.mapCountInput.name = "map-count-input";
        this.elements.mapCountInput.placeholder = this.textHints.mapCountInputPlaceholder;
        this.elements.mapCountInput.style.color = "black";
        this.elements.mapCountInput.style.backgroundColor = "white";
        this.elements.mapCountInput.required = true;
        this.elements.submitAndSubButton = document.createElement("button");
        this.elements.submitAndSubButton.textContent = this.textHints.submitAndSubButton;
        this.elements.submitAndSubButton.style.marginTop = "10px";
        this.elements.submitAndSubButton.style.marginRight = "10px";
        this.elements.form.appendChild(this.elements.submitAndSubButton);
        this.elements.form.appendChild(this.elements.mapCountInput);
        this.elements.messageArea = document.createElement("p");
        this.elements.messageArea.innerText = this.textHints.innerTextDefault;
        this.elements.messageArea.style.marginTop = "10px";
        this.elements.messageArea.style.marginBottom = "10px";
        this.elements.container.appendChild(this.elements.messageArea);
        this.elements.outputTextArea = document.createElement("textarea");
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
          UIManager.elements.container.style.display = "unset";
        } else {
          UIManager.elements.container.style.display = "none";
        }
      },
      addOpenCloseButton() {
        const toggleUIButtonSpan = document.createElement("span");
        toggleUIButtonSpan.classList = "btn_blue_steamui btn_medium";
        toggleUIButtonSpan.innerHTML = `<span>${this.textHints.toggleUIButton}</span>`;
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
        closeUIButton.textContent = this.textHints.closeUIButton;
        closeUIButton.onclick = this.toggleContainerDisplay;
        this.elements.container.appendChild(closeUIButton);
      },
      bindEvents(eventConfigs) {
        eventConfigs.forEach((config2) => {
          const element = this.elements[config2.elementName];
          if (!element) {
            console.error(`UIManager: Element with name '${config2.elementName}' not found.`);
            return;
          }
          element.addEventListener(config2.eventName, (e) => {
            e.preventDefault();
            config2.handler();
          });
        });
        console.log("UIManager: Events Bound.");
      },
      getMapCountInput() {
        if (!UIManager.elements.mapCountInput) return NaN;
        const value = parseInt(UIManager.elements.mapCountInput.value, 10);
        return isNaN(value) ? NaN : value;
      },
      showMessage(text, isError = false) {
        if (isError) {
          console.error(text);
        } else {
          console.log(text);
        }
        if (UIManager.elements.messageArea) {
          UIManager.elements.messageArea.textContent = text;
          UIManager.elements.messageArea.style.color = isError ? "red" : "black";
          UIManager.elements.messageArea.style.fontWeight = isError ? "bold" : "normal";
        }
      },
      showLog(text, consolecmd = console.log) {
        consolecmd(text);
        if (!UIManager.elements.outputTextArea) {
          return;
        }
        UIManager.elements.outputTextArea.value += text + "\n";
        UIManager.elements.outputTextArea.scrollTop = UIManager.elements.outputTextArea.scrollHeight;
      },
      showLoading(message = "Loading...") {
        UIManager.showMessage(message);
        if (UIManager.elements.submitAndSubButton) UIManager.elements.submitAndSubButton.disabled = true;
      },
      hideLoading() {
        if (UIManager.elements.submitAndSubButton) UIManager.elements.submitAndSubButton.disabled = false;
      }
    };
    const WorkShopFetcher = {
      parser: new DOMParser(),
      getTotalMapCount: (doc = document) => {
        var _a;
        const info = doc.querySelector(".workshopBrowsePagingInfo");
        const noItems = doc.getElementById("no_items");
        if (!info && !noItems) {
          throw new Error("cant find map Count by any mean :(");
        }
        if (!info && noItems) {
          return 0;
        }
        const pagingInfo = info.textContent;
        const matches = ((_a = pagingInfo.replace(/,/g, "").match(/\d+/g)) == null ? void 0 : _a.map(Number)) ?? [0];
        const totalMapCount = Math.max(...matches);
        return totalMapCount;
      },
      calculateTotalPages: (totalMapCount) => {
        const totalPageCount = Math.ceil(totalMapCount / config.ITEMS_PER_PAGE);
        return totalPageCount;
      },
      filterMapIdsFromPageDocument: (doc) => {
        const itemDivList = doc.querySelectorAll(".workshopItem");
        const fileIds = Array.from(itemDivList).map((divElement) => {
          const n = divElement.querySelector(".workshopItemPreviewHolder");
          return n.id.replace("sharedfile_", "");
        });
        return fileIds;
      },
      parseURLToDocument: async (url) => {
        const parser = WorkShopFetcher.parser;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`url ${url.href} response not ok`);
        }
        const responseText = await response.text();
        const doc = parser.parseFromString(responseText, "text/html");
        return doc;
      },
      fetchMapIdsFromPage: async (url, page) => {
        url.searchParams.set("p", String(page));
        const doc = await WorkShopFetcher.parseURLToDocument(url);
        return WorkShopFetcher.filterMapIdsFromPageDocument(doc);
      },
      getRandomMaps: async (url, neededCount, progressCallback) => {
        try {
          progressCallback("Start Loading...");
          const totalMapCount = WorkShopFetcher.getTotalMapCount();
          const totalPageCount = Math.min(WorkShopFetcher.calculateTotalPages(totalMapCount), config.MAX_FETCH_PAGES);
          const allFetchedIds = [];
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
          const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
          };
          const uniqueIds = [...new Set(allFetchedIds)];
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
    };
    const MapSubber = {
      makePostRequest: (url, data) => {
        return new Promise((resolve, reject) => {
          $J.post(url, data).done(resolve).fail(reject);
        });
      },
      delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
      subscribeMap: async (data) => {
        await MapSubber.makePostRequest("https://steamcommunity.com/sharedfiles/subscribe", data);
        await MapSubber.delay(config.API_DELAY_MS);
      },
      subscribeList: async (appid, sessionid, mapList, progressCallback) => {
        const params = mapList.map((x) => {
          return { id: x, appid, sessionid };
        });
        for (const p of params) {
          progressCallback(`subbing map ${p.id}`);
          await MapSubber.subscribeMap(p);
        }
        progressCallback(`subbing done.`);
      }
    };
    const App = {
      init: () => {
        UIManager.init();
        UIManager.bindEvents([
          { elementName: "form", eventName: "submit", handler: App.handleSubmit }
        ]);
      },
      calcCache: /* @__PURE__ */ new Map(),
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
          UIManager.showLoading(`Finished ${i + 1} / ${neededCount}.`);
        }
        UIManager.showMessage(`All finished.`);
        UIManager.hideLoading();
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1e3;
        UIManager.showLog(`
Total time cost: ${elapsedTime.toFixed(2)}s`);
      },
      getAndSubTrulyRandomMap: async () => {
        const startTime = performance.now();
        const log = UIManager.showLog;
        const result = await App.biSelectForNarrowRange(
          config.START_TIME_STAMP,
          config.END_TIME_STAMP,
          WorkShopFetcher.getTotalMapCount(await WorkShopFetcher.parseURLToDocument(config.BASE_URL)),
          log
        );
        console.log(result);
        log(`
Getting random map from range ${App.formatTimeStampRange(result.start, result.end)}`);
        const map = await App.getRandomMapInNarrowRange(result);
        log(`
Subbing the random map: ${map}`);
        await MapSubber.subscribeMap({ id: map, appid: config.APPID, sessionid: g_sessionID });
        log(`Subbing done.`);
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1e3;
        log(`Time cost for this map: ${elapsedTime.toFixed(2)}s`);
      },
      getRandomMapInNarrowRange: async (mapRange) => {
        const { mapCount, pageCount, start, end } = mapRange;
        const url = new URL(config.BASE_URL);
        url.searchParams.set("created_date_range_filter_start", start.toString());
        url.searchParams.set("created_date_range_filter_end", end.toString());
        const mapCountInLastPage = mapCount - (pageCount - 1) * config.ITEMS_PER_PAGE;
        if (mapCountInLastPage < 0) {
          throw new Error("idk why but the calculated mapcount in last page is less than 0");
        }
        const lastPageProbability = mapCountInLastPage / mapCount;
        const isLastPage = App.randomChoose([lastPageProbability, 1 - lastPageProbability]) === 0;
        if (isLastPage) {
          const mapList = await WorkShopFetcher.fetchMapIdsFromPage(url, pageCount);
          return mapList[Math.floor(Math.random() * mapList.length)];
        } else {
          const randomPage = Math.floor(Math.random() * (pageCount - 1)) + 1;
          const mapList = await WorkShopFetcher.fetchMapIdsFromPage(url, randomPage);
          return mapList[Math.floor(Math.random() * mapList.length)];
        }
      },
      formatTimeStampRange: (start, end) => {
        return `${start} ~ ${end} (${new Date(start * 1e3).toISOString()} ~ ${new Date(end * 1e3).toISOString()})`;
      },
      fetchCountInRange: async (start, end, log) => {
        log(`Fetching range: ${App.formatTimeStampRange(start, end)}`);
        if (App.calcCache.has(`${start},${end}`)) {
          log(`This range has calculated before! Return cache.`);
          const [mapCount2, pageCount2] = App.calcCache.get(`${start},${end}`);
          log(`Fetched result: ${start} ~ ${end}: mapCount: ${mapCount2}, pageCount: ${pageCount2}`);
          return { mapCount: mapCount2, pageCount: pageCount2, start, end };
        }
        const url = new URL(config.BASE_URL);
        url.searchParams.set("created_date_range_filter_start", start.toString());
        url.searchParams.set("created_date_range_filter_end", end.toString());
        const mapCount = WorkShopFetcher.getTotalMapCount(await WorkShopFetcher.parseURLToDocument(url));
        const pageCount = WorkShopFetcher.calculateTotalPages(mapCount);
        log(`Fetched result: ${start} ~ ${end}: mapCount: ${mapCount}, pageCount: ${pageCount}`);
        App.calcCache.set(`${start},${end}`, [mapCount, pageCount]);
        return { mapCount, pageCount, start, end };
      },
      randomChoose: (probs) => {
        if (Math.random() < probs[0]) {
          return 0;
        }
        return 1;
      },
      // 传入上一级的totalCount以做验证
      biSelectForNarrowRange: async (start, end, totalCount, log) => {
        log(`
Trying to get random map in range ${App.formatTimeStampRange(start, end)}`);
        const middle = Math.floor((start + end) / 2);
        log("Fetching counts for the two halves...");
        const [result1, result2] = await Promise.all([
          App.fetchCountInRange(start, middle, log),
          App.fetchCountInRange(middle + 1, end, log)
          /* should check if this +1 is needed or not */
        ]);
        const sumMapCount = result1.mapCount + result2.mapCount;
        if (result1.mapCount + result2.mapCount !== totalCount) {
          log("WARNING: Two halves cant add up to total. It's either someone added a map during the process or wrong code logic.");
          log(`Sum of two parts: ${result1.mapCount + result2.mapCount}; total: ${totalCount}; difference: ${result1.mapCount + result2.mapCount - totalCount}`);
        }
        const prob1 = result1.mapCount / sumMapCount;
        log(`Choosing older half and newer half with probability ${prob1} and ${1 - prob1}`);
        const chooseResult = App.randomChoose([prob1, 1 - prob1]) === 0 ? (() => {
          log(`Selected the older half.`);
          return result1;
        })() : (() => {
          log(`Selected the newer half.`);
          return result2;
        })();
        if (chooseResult.pageCount < config.MAX_FETCH_PAGES) {
          log("Result range is narrow enough for next phase. Existing.");
          return chooseResult;
        } else {
          log("Range too wide, continue.");
          return await App.biSelectForNarrowRange(chooseResult.start, chooseResult.end, chooseResult.mapCount, log);
        }
      }
    };
    App.init();
  })();

})();