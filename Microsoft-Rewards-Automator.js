// ==UserScript==
// @name         Microsoft-Rewards-Automator
// @version      1.1.0
// @description  Automate your daily Bing searches and maximize your Microsoft Rewards with ease! This powerful userscript handles random searches for you, ensuring you never miss out on your points.
// @author       @ImKKingshuk
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      random-word-api.herokuapp.com
// @connect      api.quotable.io
// @connect      bing.com
// ==/UserScript==

(function () {
  "use strict";

  const MAX_SEARCHES = 30;
  const SEARCH_INTERVAL_MIN = 5000;
  const SEARCH_INTERVAL_MAX = 7000;
  const PAGE_CLOSE_DELAY = 20000;
  let searchCount = 0;
  let useRandomWords = false;
  let useRandomSentences = false;

  function getRandomDelay() {
    return (
      SEARCH_INTERVAL_MIN +
      Math.random() * (SEARCH_INTERVAL_MAX - SEARCH_INTERVAL_MIN)
    );
  }

  async function getRandomWords(count) {
    try {
      const response = await fetch(
        `https://random-word-api.herokuapp.com/word?number=${count}`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching random words:", error);
      return [];
    }
  }

  async function getRandomSentences(count) {
    const sentences = [];
    for (let i = 0; i < count; i++) {
      try {
        const response = await fetch(
          `https://api.quotable.io/random?minLength=5&maxLength=50`
        );
        const sentence = await response.json();
        sentences.push(sentence.content);
      } catch (error) {
        console.error("Error fetching random sentences:", error);
        sentences.push("fallback sentence");
      }
    }
    return sentences;
  }

  function performSearch(query) {
    const searchUrl = `https://bing.com/search?q=${encodeURIComponent(query)}`;
    const searchWindow = window.open(searchUrl);

    setTimeout(() => {
      searchWindow.close();
    }, PAGE_CLOSE_DELAY);
  }

  async function startSearchAutomation() {
    const wordsOrSentences = useRandomWords
      ? await getRandomWords(MAX_SEARCHES)
      : await getRandomSentences(MAX_SEARCHES);
    if (wordsOrSentences.length === 0) {
      console.error("Failed to fetch search terms.");
      return;
    }

    for (let i = 0; i < wordsOrSentences.length; i++) {
      performSearch(wordsOrSentences[i]);
      searchCount++;
      updateProgress(searchCount);

      if (searchCount >= MAX_SEARCHES) break;

      await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));
    }
  }

  function updateProgress(count) {
    const progressText = `Search ${count}/${MAX_SEARCHES}`;
    progressBar.value = count;
    progressBar.innerText = progressText;
  }

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "50px";
  container.style.left = "20px";
  container.style.width = "300px";
  container.style.padding = "20px";
  container.style.backgroundColor = "#f8f9fa";
  container.style.borderRadius = "8px";
  container.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
  container.style.zIndex = "10000";
  container.style.fontFamily = "Arial, sans-serif";

  const title = document.createElement("h2");
  title.textContent = "Microsoft Rewards Automator";
  title.style.marginBottom = "20px";
  title.style.fontSize = "18px";
  title.style.color = "#333";

  const startButton = document.createElement("button");
  startButton.textContent = "Start Automation";
  startButton.style.width = "100%";
  startButton.style.padding = "10px";
  startButton.style.marginBottom = "10px";
  startButton.style.backgroundColor = "#4CAF50";
  startButton.style.color = "white";
  startButton.style.border = "none";
  startButton.style.cursor = "pointer";
  startButton.style.borderRadius = "5px";

  const progressBar = document.createElement("progress");
  progressBar.value = 0;
  progressBar.max = MAX_SEARCHES;
  progressBar.style.width = "100%";
  progressBar.style.marginBottom = "10px";

  const toggleWordsButton = document.createElement("button");
  toggleWordsButton.textContent = "Use Random Words";
  toggleWordsButton.style.width = "49%";
  toggleWordsButton.style.padding = "10px";
  toggleWordsButton.style.backgroundColor = "#007BFF";
  toggleWordsButton.style.color = "white";
  toggleWordsButton.style.border = "none";
  toggleWordsButton.style.cursor = "pointer";
  toggleWordsButton.style.borderRadius = "5px";
  toggleWordsButton.style.marginRight = "2%";

  const toggleSentencesButton = document.createElement("button");
  toggleSentencesButton.textContent = "Use Random Sentences";
  toggleSentencesButton.style.width = "49%";
  toggleSentencesButton.style.padding = "10px";
  toggleSentencesButton.style.backgroundColor = "#007BFF";
  toggleSentencesButton.style.color = "white";
  toggleSentencesButton.style.border = "none";
  toggleSentencesButton.style.cursor = "pointer";
  toggleSentencesButton.style.borderRadius = "5px";

  const statusText = document.createElement("p");
  statusText.textContent = "Idle";
  statusText.style.fontSize = "14px";
  statusText.style.color = "#555";

  container.appendChild(title);
  container.appendChild(startButton);
  container.appendChild(progressBar);
  container.appendChild(toggleWordsButton);
  container.appendChild(toggleSentencesButton);
  container.appendChild(statusText);
  document.body.appendChild(container);

  startButton.addEventListener("click", () => {
    startButton.disabled = true;
    startButton.textContent = "Running...";
    statusText.textContent = "Running...";
    startSearchAutomation().then(() => {
      statusText.textContent = "Completed!";
      startButton.textContent = "Start Automation";
      startButton.disabled = false;
    });
  });

  toggleWordsButton.addEventListener("click", () => {
    useRandomWords = !useRandomWords;
    toggleWordsButton.style.backgroundColor = useRandomWords
      ? "#28a745"
      : "#007BFF";
    useRandomSentences = false;
    toggleSentencesButton.style.backgroundColor = "#007BFF";
  });

  toggleSentencesButton.addEventListener("click", () => {
    useRandomSentences = !useRandomSentences;
    toggleSentencesButton.style.backgroundColor = useRandomSentences
      ? "#28a745"
      : "#007BFF";
    useRandomWords = false;
    toggleWordsButton.style.backgroundColor = "#007BFF";
  });
})();
