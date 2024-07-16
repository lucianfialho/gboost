console.log("Content script loaded");

// Função para inicializar o observador de mutações do DOM
const initObserver = () => {
  console.log("Initializing observer");
  createObserver("[data-component='Lobby']", handleMutations);
};

// Função para criar e configurar o observador de mutações
const createObserver = (target, callback) => {
  const targetNode = document.querySelector(target);
  if (!targetNode) {
    console.log("No target node found for", target);
    return;
  }

  const observer = new MutationObserver((mutationsList) => {
    callback(mutationsList);
  });

  observer.observe(targetNode, { childList: true, subtree: true });
  console.log(`Observer created for ${target}`);
};

// Função para processar mutações observadas no DOM
const handleMutations = (mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      analyzeLobbies(Array.from(mutation.addedNodes));
    }
  });
};

// Função para analisar os nós adicionados e extrair informações das lobbies
const analyzeLobbies = (nodes) => {
  console.log("Analyzing lobbies");
  nodes.forEach((node) => {
    if (node.nodeType === 1 && node.matches(".Lobby__MainContainer")) {
      const lobbyId = node
        .querySelector(".MyRoomHeader__title")
        .textContent.trim()
        .replace(/[\W_]+/g, " ")
        .replaceAll(" ", "_");
      console.log(`Lobby found: ${lobbyId}`);

      // Enviar dados da lobby para o background.js
      chrome.runtime.sendMessage({
        type: "fetchLobbyInfo",
        lobbyId: lobbyId,
        players: getPlayersInfo(node),
      });
    }
  });
};

// Função para obter informações dos jogadores na lobby
const getPlayersInfo = (lobbyNode) => {
  const players = [];
  const playerElements = lobbyNode.querySelectorAll(".LobbyPlayerHorizontal");

  playerElements.forEach((playerElement) => {
    const playerName = playerElement
      .querySelector(".LobbyPlayerHorizontal__nickname a")
      .textContent.trim();
    const playerProfileUrl = playerElement.querySelector(
      ".LobbyPlayerHorizontal__nickname a"
    ).href;
    const playerId = playerProfileUrl.split("/").pop();

    players.push({
      name: playerName,
      profileUrl: playerProfileUrl,
      id: playerId,
    });
  });

  return players;
};

// Listener para receber mensagens de outros scripts ou background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "logPlayers") {
    console.log("Player Data:", message.players);
    message.players.forEach((player) => {
      console.log(`Player: ${player.playerName}`);
      console.log(`Profile Details: ${JSON.stringify(player.userProfile)}`);
    });
  }
});

// Função para inicializar o script quando o documento estiver pronto
const initializeScript = () => {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    console.log("Document is ready. Initializing script.");
    initObserver();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      console.log("DOMContentLoaded event fired. Initializing script.");
      initObserver();
    });
  }
};

window.onload = initializeScript;
initializeScript();
