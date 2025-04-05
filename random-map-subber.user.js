// ==UserScript==
// @name         Sub X random community maps!
// @namespace    vite-plugin-monkey
// @version      1.3
// @author       justaloli
// @description  [RELEASE NOTE] rewrite in typescript for easier future maintenance, AND a ui toggle button!
// @match        https://steamcommunity.com/workshop/browse/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const mymain = async () => {
    var _a;
    const MAP_NEEDED = parseInt(xInput.value);
    const pagingInfo = document.querySelector(".workshopBrowsePagingInfo").textContent;
    const matches = ((_a = pagingInfo.replace(/,/g, "").match(/\d+/g)) == null ? void 0 : _a.map(Number)) ?? [0];
    const totalMapCount = Math.max(...matches);
    console.log({ totalMapCount });
    const totalPageCount = Math.min(Math.ceil(totalMapCount / 30), 1667);
    console.log({ totalPageCount });
    const workshopItems = [];
    const parser = new DOMParser();
    const url = new URL(window.location.href);
    url.searchParams.set("numperpage", "30");
    const getIdsFromPage = async (page) => {
      url.searchParams.set("p", String(page));
      console.log(`trying to fetch page ${page}`);
      message.textContent = `trying to fetch page ${page} ...`;
      console.log(`request url: ${url.href}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("response not ok");
      }
      const responseText = await response.text();
      console.log("success!");
      const doc = parser.parseFromString(responseText, "text/html");
      const itemDivList = doc.querySelectorAll(".workshopItem");
      const fileIds = Array.from(itemDivList).map((divElement) => {
        const n = divElement.querySelector(".workshopItemPreviewHolder");
        return n.id.replace("sharedfile_", "");
      });
      return fileIds;
    };
    while (workshopItems.length < 10 * MAP_NEEDED) {
      const randomPage = Math.floor(Math.random() * totalPageCount) + 1;
      try {
        console.log(`Fetching maps from random page ${randomPage}...`);
        const fileIds = await getIdsFromPage(randomPage);
        workshopItems.push(...fileIds);
      } catch (error) {
        console.error(`Failed to fetch page ${randomPage}:`, error);
        message.textContent = `Failed to fetch page ${randomPage}: ${error}`;
      }
    }
    console.log(`got maps!`);
    console.log(workshopItems);
    const shuffle = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    const shuffledWorkshopItems = shuffle(workshopItems);
    console.log(`shuffled maps!`);
    console.log(shuffledWorkshopItems);
    const selectedItems = shuffledWorkshopItems.slice(0, MAP_NEEDED);
    console.log(selectedItems);
    message.textContent = "fetching done.";
    return selectedItems;
  };
  function addUI() {
    const searchedTermsContainer = document.querySelector(".searchedTermsContainer");
    if (searchedTermsContainer) {
      searchedTermsContainer.appendChild(toggleUIButtonSpan);
    } else {
      toggleUIButtonSpan.style.position = "fixed";
      toggleUIButtonSpan.style.top = "20px";
      toggleUIButtonSpan.style.left = "20px";
      document.body.appendChild(toggleUIButtonSpan);
    }
  }
  let containerShown = false;
  const toggleContainerDisplay = () => {
    containerShown = !containerShown;
    updateContainerDisplay();
  };
  const updateContainerDisplay = () => {
    if (containerShown) {
      container.style.display = "unset";
    } else {
      container.style.display = "none";
    }
  };
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "50%";
  container.style.left = "50%";
  container.style.transform = "translate(-50%, -50%)";
  container.style.color = "black";
  container.style.display = "none";
  container.style.backgroundColor = "#fafafa";
  container.style.padding = "10px";
  container.style.zIndex = "1000";
  document.body.appendChild(container);
  const toggleUIButtonSpan = document.createElement("span");
  toggleUIButtonSpan.classList = "btn_blue_steamui btn_medium";
  toggleUIButtonSpan.innerHTML = "<span>Open Workshop Tool</span>";
  toggleUIButtonSpan.onclick = toggleContainerDisplay;
  const closeUIButton = document.createElement("button");
  closeUIButton.style.position = "absolute";
  closeUIButton.style.top = "10px";
  closeUIButton.style.right = "10px";
  closeUIButton.textContent = "Close";
  closeUIButton.onclick = toggleContainerDisplay;
  container.appendChild(closeUIButton);
  const form = document.createElement("form");
  form.id = "X-form";
  container.appendChild(form);
  const xInput = document.createElement("input");
  xInput.type = "number";
  xInput.id = "X-input";
  xInput.name = "X-input";
  xInput.placeholder = "# of maps needed";
  xInput.style.color = "black";
  xInput.style.backgroundColor = "white";
  xInput.required = true;
  form.appendChild(xInput);
  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.style.margin = "10px";
  submitButton.onclick = async (e) => {
    e.preventDefault();
    const x = parseInt(xInput.value);
    console.log("submitButton clicked");
    if (!isNaN(x)) {
      const selectedItems = await mymain();
      textOutput.value = JSON.stringify(selectedItems, null, 2);
    } else {
      message.textContent = "Please enter a valid number.";
    }
  };
  form.appendChild(submitButton);
  const loadButton = document.createElement("button");
  loadButton.textContent = "Load from Clipboard";
  loadButton.onclick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      textOutput.value = text;
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      message.textContent = "Failed to read clipboard contents.";
    }
  };
  container.appendChild(loadButton);
  const message = document.createElement("p");
  message.innerText = ":)";
  message.style.marginTop = "10px";
  message.style.marginBottom = "10px";
  container.appendChild(message);
  const textOutput = document.createElement("textarea");
  textOutput.readOnly = true;
  textOutput.rows = 10;
  textOutput.cols = 50;
  textOutput.style.backgroundColor = "white";
  textOutput.style.color = "black";
  container.appendChild(textOutput);
  const loadMapListToGame = async (mapList) => {
    const url = new URL(window.location.href);
    const appid = url.searchParams.get("appid");
    const sessionid = g_sessionID;
    const makePostRequest = (url2, data) => {
      return new Promise((resolve, reject) => {
        $J.post(url2, data).done(resolve).fail(reject);
      });
    };
    const params = mapList.map((x) => {
      return { id: x, appid, sessionid };
    });
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    for (const p of params) {
      message.textContent = `subbing map ${p.id}`;
      await makePostRequest("https://steamcommunity.com/sharedfiles/subscribe", p);
      await delay(1e3);
    }
  };
  const loadToGameButton = document.createElement("button");
  loadToGameButton.style.marginLeft = "10px";
  loadToGameButton.textContent = "Load to Game";
  loadToGameButton.onclick = async (e) => {
    e.preventDefault();
    console.log("Loading to game:", textOutput.value);
    message.textContent = "loading to game";
    const text = textOutput.value;
    const mapList = JSON.parse(text);
    console.log(mapList);
    await loadMapListToGame(mapList);
    message.textContent = `subbing done.`;
  };
  container.appendChild(loadToGameButton);
  addUI();

})();