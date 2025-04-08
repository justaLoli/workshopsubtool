// ==UserScript==
// @name         Sub X random community maps!
// @namespace    vite-plugin-monkey
// @version      1.4
// @author       justaloli
// @description  [RELEASE NOTE] full code refactor!
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

})();