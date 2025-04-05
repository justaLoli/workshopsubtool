// ==UserScript==
// @name         Sub X random community maps!
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Sub X random community maps to play!
// @author       justaloli
// @match        https://steamcommunity.com/workshop/browse/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const mymain = async () => {

        const MAP_NEEDED = parseInt(xInput.value);
        // firstly, get total map count
        const pagingInfo = document.querySelector(".workshopBrowsePagingInfo").textContent;
        const matches = pagingInfo.replace(/,/g, "").match(/\d+/g)?.map(Number) ?? [0];
        const totalMapCount = Math.max(...matches);
        console.log({totalMapCount});

        // get total possible page count
        const totalPageCount = Math.min(Math.ceil(totalMapCount / 30), 1667); // cant fetch more then 1667 page
        console.log({totalPageCount});

        // preparing to get bunch of maps
        const workshopItems = [];

        // pick random page, fetch map from that page
        const parser = new DOMParser();
        const url = new URL(window.location.href);
        url.searchParams.set("numperpage","30");
        const getIdsFromPage = async (page) => {
            url.searchParams.set("p", String(page));
            console.log(`trying to fetch page ${page}`)
            message.textContent = (`trying to fetch page ${page} ...`);
            const response = await fetch(url);
            if (!response.ok) {throw new Error("response not ok")};
            const responseText = await response.text();
            console.log("success!")
            //console.log(responseText);
            // parse the page and get file list
            const doc = parser.parseFromString(responseText, "text/html");
            const itemDivList = doc.querySelectorAll(".workshopItem");
            const fileIds = Array.from(itemDivList).map(divElement => {
                const n = divElement.querySelector(".workshopItemPreviewHolder");
                return n.id.replace("sharedfile_", "");
            })
            //console.log(`map ids in page ${page}: ${fileIds}`);
            return fileIds;
        }
        // continue to fetch maps from random page until workshopItems is grator then 3 * X
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
        console.log(`got maps!`)
        console.log(workshopItems);
        // shuffle the items to get needed
        // why tf i need to write a shuffle function myself :/
        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i+1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        const shuffledWorkshopItems = shuffle(workshopItems);
        console.log(`shuffled maps!`)
        console.log(shuffledWorkshopItems);
        const selectedItems = shuffledWorkshopItems.slice(0, MAP_NEEDED);
        console.log(selectedItems);
        message.textContent = "fetching done.";
        return selectedItems;
    };

    function addUI() {
        // popup container
        document.body.appendChild(container);
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.left = '20px';
    container.style.color = "black";
    container.style.backgroundColor = 'white';
    container.style.padding = '10px';
    container.style.zIndex = '1000'; // 确保 UI 在背景之上

    // form
    const form = document.createElement('form');
    form.id = 'X-form';
    container.appendChild(form);

    // Min Time 输入框
    const xInput = document.createElement('input');
    xInput.type = 'number';
    xInput.id = 'X-input';
    xInput.name = 'X-input';
    xInput.placeholder = "# of maps needed"
    xInput.style.color = "black";
    xInput.style.backgroundColor = "white";
    xInput.required = true;
    form.appendChild(xInput);

    // 提交按钮
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.style.margin = "10px";
    submitButton.onclick = async (e) => {
        e.preventDefault();
        const x = parseInt(xInput.value);
        console.log("submitButton clicked");
        if (!isNaN(x)) {
            const selectedItems = await mymain(); // 调用 mymain 函数，传递 X 值
            textOutput.value = JSON.stringify(selectedItems, null, 2);

        } else {
            message.textContent = "Please enter a valid number.";
        }
    };
    form.appendChild(submitButton);

    // 从剪贴板加载按钮
    const loadButton = document.createElement('button');
    loadButton.textContent = 'Load from Clipboard';
    loadButton.onclick = async () => {
        try {
            const text = await navigator.clipboard.readText();
            textOutput.value = text;
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            message.textContent = "Failed to read clipboard contents.";
        }
    };
    container.appendChild(loadButton);

    // 提示信息区域
    const message = document.createElement('p');
    message.innerText = "disable this script in tampermonkey if you want this popup gone :)";
    message.style.marginTop = "10px";
    message.style.marginBottom = "10px";
    container.appendChild(message);

    // 文本输出区域
    const textOutput = document.createElement('textarea');
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
        const makePostRequest = (url, data) => {
            return new Promise((resolve, reject) => {
                $J.post(url, data)
                    .done(resolve) // Resolve the Promise with the jQuery's done callback
                    .fail(reject);  // Reject the Promise with the jQuery's fail callback
            });
        };

        const params = mapList.map( x => {return {id: x, appid: appid, sessionid: sessionid}});
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        for (const p of params) {
            message.textContent = `subbing map ${p.id}`;
            await makePostRequest("https://steamcommunity.com/sharedfiles/subscribe", p);
            await delay(1000);
        }
    }

    // 加载到游戏按钮
    const loadToGameButton = document.createElement('button');
    loadToGameButton.style.marginLeft = "10px";
    loadToGameButton.textContent = 'Load to Game';
    loadToGameButton.onclick = async (e) => {
        e.preventDefault();
        // 在这里添加将 textOutput.value 加载到游戏中的逻辑
        console.log("Loading to game:", textOutput.value);
        message.textContent = "loading to game";
        const text = textOutput.value;
        const mapList = JSON.parse(text);
        console.log(mapList);
        await loadMapListToGame(mapList);
        message.textContent = `subbing done.`;
    };
    container.appendChild(loadToGameButton);

    window.addEventListener('load', () => {
        addUI(); // Add the button to the page
    });
})();
