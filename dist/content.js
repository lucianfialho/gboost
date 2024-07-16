console.log("Content script loaded");

const initObserver = () => {
  console.log("Initializing observer");
  createObserver("#lobbies-wrapper", analyzePlayers);
};

const createObserver = (target, callback) => {
  const targetNode = document.querySelector(target);
  if (!targetNode) {
    console.log("No target node found for", target);
    return;
  }

  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        console.log("Mutation detected", mutation);
        callback();
      }
    });
  });

  observer.observe(targetNode, { childList: true, subtree: true });
  console.log(`Observer created for ${target}`);
};

const analyzePlayers = () => {
  console.log("Analyzing players");
  const playerData = [];
  const players = document.querySelectorAll(".LobbyPlayerVertical");

  players.forEach((player) => {
    console.log("Player node:", player);
    const playerName = player.getAttribute("title").split(" | ")[0];
    const steamProfileUrl = player.href;
    playerData.push({ name: playerName, profileUrl: steamProfileUrl });
  });

  if (playerData.length > 0) {
    console.log("Players found:", playerData);
    chrome.runtime.sendMessage({ type: "logPlayers", players: playerData });
  } else {
    console.log("No players found");
  }
};

// Usar setTimeout para garantir que o DOM esteja completamente carregado
setTimeout(() => {
  console.log("Running initObserver after timeout");
  initObserver();
}, 3000);
