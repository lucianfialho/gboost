// Conjunto para manter o controle das lobbies processadas
const processedLobbies = new Set();

// Função para inicializar o observador de mutações do DOM
const initObserver = () => {
  createObserver("#challengeList", handleMutations);
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
};

// Função para processar mutações observadas no DOM
const handleMutations = (mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      analyzeLobbies(Array.from(mutation.addedNodes));
    }
  });
};

// Função para obter os IDs dos jogadores a partir de um elemento
const getPlayersIds = (element) => {
  const playerLinks = element.querySelectorAll('.sala-lineup-player:not(.player-placeholder) a');
  if (playerLinks.length > 0) {
    return Array.from(playerLinks).map(e => e.href.split('/').pop());
  } else {
    console.log("No player links found in element:", element);
    return [];
  }
};

// Função para processar as informações dos desafios
const infoChallenge = (nodes) => {
  const results = nodes.flatMap((node, index) => {
    
    if (node instanceof Element) {
      
      const challengeElements = node.querySelectorAll('.sidebar-item-content.sidebar-item-pending');
      const lineupElements = node.querySelectorAll('.sala-lineup > .sala-lineup-players');
      
      if(challengeElements.length > 0) {
        
        const titleElement = challengeElements[0].querySelector('.sidebar-item-name');
        if (!titleElement) {
          // console.warn("No title element found for element:", element);
          return []; // Retorna um array vazio se não houver título
        }

        const lobbyId = titleElement.textContent
          .toLowerCase()
          .replace(/[\W_]+/g, ' ')
          .replaceAll(' ', '_');

        if (processedLobbies.has(lobbyId)) {
          return []; // Se a lobby já foi processada, retorna um array vazio
        }

        // Adicionar ID único ao elemento HTML
        titleElement.id = `gcblobby-${lobbyId}`;
        console.log("o id foi adicionado no elemento",titleElement.id)

        const playersInfo = getPlayersInfo(lineupElements);

        // Marca a lobby como processada
        processedLobbies.add(lobbyId);

        return [{
          playersInfo,
          lobbyId,
          titleElement
        }];
      }
    }
    return []
  });

  return results;
};

// Função para analisar os nós adicionados e extrair informações das lobbies
const analyzeLobbies = (nodes) => {
  const challenges = infoChallenge(nodes);
  
  if(challenges.length === 0) return;
  
  sendToBackground(challenges);
};

// Função para obter informações dos jogadores na lobby
const getPlayersInfo = (lobbyNodes) => {
  const players = [];
  lobbyNodes.forEach(lobbyNode => {
    const playerElements = lobbyNode.querySelectorAll('.sala-lineup-player:not(.player-placeholder) a');
    playerElements.forEach((playerElement) => {
      const playerName = playerElement.getAttribute('title');
      const playerProfileUrl = playerElement.href;
      const playerId = playerProfileUrl.split("/").pop();

      players.push({
        name: playerName,
        profileUrl: playerProfileUrl,
        id: playerId,
      });
    });
  });
  return players;
};

// Função para enviar dados para o background.js
const sendToBackground = (challenges) => {
  challenges.forEach((challenge) => {
    chrome.runtime.sendMessage({
      type: "fetchLobbyInfo",
      lobbyId: challenge.lobbyId,
      players: challenge.playersInfo,
    }, (response) => {
      if (response) {
        const lobbyElement = document.getElementById(`gcblobby-${response.lobbyId}`);
        if (lobbyElement) {
          const riskElement = document.createElement('div');
          riskElement.textContent = `Risco: ${response.risk || 'Desconhecido'}`;
          lobbyElement.appendChild(riskElement);
          console.log(`Lobby risk added for: gcblobby-${response.lobbyId}`)
        } else {
          console.log(`Lobby element not found for ID: gcblobby-${response.lobbyId}`);
        }
      }
    });
  });
};

// Listener para receber mensagens de outros scripts ou background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "logPlayers") {
    message.players.forEach((player) => {
      console.log(`Player: ${player.name}`);
      console.log(`Profile Details: ${JSON.stringify(player)}`);
    });
  }
});

// Função para inicializar o script quando o documento estiver pronto
const initializeScript = () => {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    initObserver();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      initObserver();
    });
  }
};

window.onload = initializeScript;
initializeScript();
