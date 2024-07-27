/******/ (() => { // webpackBootstrap
/*!************************!*\
  !*** ./src/content.js ***!
  \************************/
// Conjunto para manter o controle das lobbies processadas
const processedLobbies = new Set();

// Mapa para armazenar elementos processados e seus IDs
const processedElementsMap = new Map();

// Mapa para armazenar riscos calculados
const calculatedRisksMap = new Map();

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
  const nodesToAnalyze = [];
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      nodesToAnalyze.push(...Array.from(mutation.addedNodes));
    }
  });

  if (nodesToAnalyze.length > 0) {
    analyzeLobbies(nodesToAnalyze);
  }
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

      if (challengeElements.length > 0) {
        const titleElement = challengeElements[0].querySelector('.sidebar-item-name');
        if (!titleElement) {
          return []; // Retorna um array vazio se não houver título
        }

        const lobbyId = titleElement.textContent
          .toLowerCase()
          .replace(/[\W_]+/g, ' ')
          .replaceAll(' ', '_');

        // Adicionar ID único ao elemento HTML
        titleElement.id = `gcblobby-${lobbyId}`;
        console.log("O id foi adicionado no elemento", titleElement.id);

        const playersInfo = getPlayersInfo(lineupElements);

        // Verificar se a lobby já foi processada e adicionar risco, se necessário
        if (processedLobbies.has(lobbyId)) {
          const risk = calculatedRisksMap.get(lobbyId);
          if (risk) {
            addRiskToElement(titleElement, risk);
          }
          return []; // Já processada, não precisa adicionar novamente
        }

        // Marca a lobby como processada
        processedLobbies.add(lobbyId);
        processedElementsMap.set(lobbyId, titleElement); // Armazena o elemento processado no mapa

        return [{
          playersInfo,
          lobbyId,
          titleElement
        }];
      }
    }
    return [];
  });

  return results;
};

// Função para analisar os nós adicionados e extrair informações das lobbies
const analyzeLobbies = (nodes) => {
  const challenges = infoChallenge(nodes);

  if (challenges.length === 0) return;

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
        if (challenge.titleElement) {
          const risk = response.risk || 'Desconhecido';

          // Armazena o risco calculado
          calculatedRisksMap.set(challenge.lobbyId, risk);

          // Adiciona o risco ao elemento
          addRiskToElement(challenge.titleElement, risk);
          console.log(`Lobby risk added for: ${challenge.titleElement.id}`);
        } else {
          console.log(`Lobby element not found for ID: ${challenge.lobbyId}`);
        }
      }
    });
  });
};

// Função para adicionar risco ao elemento
const addRiskToElement = (element, risk) => {
  let riskElement = element.querySelector('.risk-element');
  if (!riskElement) {
    riskElement = document.createElement('div');
    riskElement.className = 'risk-element';
    element.appendChild(riskElement);
  }
  riskElement.textContent = `Risco: ${risk}`;
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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHOztBQUVILGlDQUFpQyxnQ0FBZ0M7QUFDakU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNDQUFzQyxRQUFRO0FBQzlDOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjs7QUFFQTtBQUNBO0FBQ0EseURBQXlEOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsK0NBQStDLDBCQUEwQjtBQUN6RSxVQUFVO0FBQ1YseURBQXlELGtCQUFrQjtBQUMzRTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLEtBQUs7QUFDM0M7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsWUFBWTtBQUN6QyxzQ0FBc0MsdUJBQXVCO0FBQzdELEtBQUs7QUFDTDtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9nYm9vc3QvLi9zcmMvY29udGVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb25qdW50byBwYXJhIG1hbnRlciBvIGNvbnRyb2xlIGRhcyBsb2JiaWVzIHByb2Nlc3NhZGFzXG5jb25zdCBwcm9jZXNzZWRMb2JiaWVzID0gbmV3IFNldCgpO1xuXG4vLyBNYXBhIHBhcmEgYXJtYXplbmFyIGVsZW1lbnRvcyBwcm9jZXNzYWRvcyBlIHNldXMgSURzXG5jb25zdCBwcm9jZXNzZWRFbGVtZW50c01hcCA9IG5ldyBNYXAoKTtcblxuLy8gTWFwYSBwYXJhIGFybWF6ZW5hciByaXNjb3MgY2FsY3VsYWRvc1xuY29uc3QgY2FsY3VsYXRlZFJpc2tzTWFwID0gbmV3IE1hcCgpO1xuXG4vLyBGdW7Dp8OjbyBwYXJhIGluaWNpYWxpemFyIG8gb2JzZXJ2YWRvciBkZSBtdXRhw6fDtWVzIGRvIERPTVxuY29uc3QgaW5pdE9ic2VydmVyID0gKCkgPT4ge1xuICBjcmVhdGVPYnNlcnZlcihcIiNjaGFsbGVuZ2VMaXN0XCIsIGhhbmRsZU11dGF0aW9ucyk7XG59O1xuXG4vLyBGdW7Dp8OjbyBwYXJhIGNyaWFyIGUgY29uZmlndXJhciBvIG9ic2VydmFkb3IgZGUgbXV0YcOnw7Vlc1xuY29uc3QgY3JlYXRlT2JzZXJ2ZXIgPSAodGFyZ2V0LCBjYWxsYmFjaykgPT4ge1xuICBjb25zdCB0YXJnZXROb2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xuICBpZiAoIXRhcmdldE5vZGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIk5vIHRhcmdldCBub2RlIGZvdW5kIGZvclwiLCB0YXJnZXQpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9uc0xpc3QpID0+IHtcbiAgICBjYWxsYmFjayhtdXRhdGlvbnNMaXN0KTtcbiAgfSk7XG5cbiAgb2JzZXJ2ZXIub2JzZXJ2ZSh0YXJnZXROb2RlLCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcbn07XG5cbi8vIEZ1bsOnw6NvIHBhcmEgcHJvY2Vzc2FyIG11dGHDp8O1ZXMgb2JzZXJ2YWRhcyBubyBET01cbmNvbnN0IGhhbmRsZU11dGF0aW9ucyA9IChtdXRhdGlvbnNMaXN0KSA9PiB7XG4gIGNvbnN0IG5vZGVzVG9BbmFseXplID0gW107XG4gIG11dGF0aW9uc0xpc3QuZm9yRWFjaCgobXV0YXRpb24pID0+IHtcbiAgICBpZiAobXV0YXRpb24udHlwZSA9PT0gXCJjaGlsZExpc3RcIiAmJiBtdXRhdGlvbi5hZGRlZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIG5vZGVzVG9BbmFseXplLnB1c2goLi4uQXJyYXkuZnJvbShtdXRhdGlvbi5hZGRlZE5vZGVzKSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAobm9kZXNUb0FuYWx5emUubGVuZ3RoID4gMCkge1xuICAgIGFuYWx5emVMb2JiaWVzKG5vZGVzVG9BbmFseXplKTtcbiAgfVxufTtcblxuLy8gRnVuw6fDo28gcGFyYSBvYnRlciBvcyBJRHMgZG9zIGpvZ2Fkb3JlcyBhIHBhcnRpciBkZSB1bSBlbGVtZW50b1xuY29uc3QgZ2V0UGxheWVyc0lkcyA9IChlbGVtZW50KSA9PiB7XG4gIGNvbnN0IHBsYXllckxpbmtzID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2FsYS1saW5ldXAtcGxheWVyOm5vdCgucGxheWVyLXBsYWNlaG9sZGVyKSBhJyk7XG4gIGlmIChwbGF5ZXJMaW5rcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20ocGxheWVyTGlua3MpLm1hcChlID0+IGUuaHJlZi5zcGxpdCgnLycpLnBvcCgpKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcIk5vIHBsYXllciBsaW5rcyBmb3VuZCBpbiBlbGVtZW50OlwiLCBlbGVtZW50KTtcbiAgICByZXR1cm4gW107XG4gIH1cbn07XG5cbi8vIEZ1bsOnw6NvIHBhcmEgcHJvY2Vzc2FyIGFzIGluZm9ybWHDp8O1ZXMgZG9zIGRlc2FmaW9zXG5jb25zdCBpbmZvQ2hhbGxlbmdlID0gKG5vZGVzKSA9PiB7XG4gIGNvbnN0IHJlc3VsdHMgPSBub2Rlcy5mbGF0TWFwKChub2RlLCBpbmRleCkgPT4ge1xuICAgIGlmIChub2RlIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgY29uc3QgY2hhbGxlbmdlRWxlbWVudHMgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zaWRlYmFyLWl0ZW0tY29udGVudC5zaWRlYmFyLWl0ZW0tcGVuZGluZycpO1xuICAgICAgY29uc3QgbGluZXVwRWxlbWVudHMgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zYWxhLWxpbmV1cCA+IC5zYWxhLWxpbmV1cC1wbGF5ZXJzJyk7XG5cbiAgICAgIGlmIChjaGFsbGVuZ2VFbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHRpdGxlRWxlbWVudCA9IGNoYWxsZW5nZUVsZW1lbnRzWzBdLnF1ZXJ5U2VsZWN0b3IoJy5zaWRlYmFyLWl0ZW0tbmFtZScpO1xuICAgICAgICBpZiAoIXRpdGxlRWxlbWVudCkge1xuICAgICAgICAgIHJldHVybiBbXTsgLy8gUmV0b3JuYSB1bSBhcnJheSB2YXppbyBzZSBuw6NvIGhvdXZlciB0w610dWxvXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsb2JieUlkID0gdGl0bGVFbGVtZW50LnRleHRDb250ZW50XG4gICAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAucmVwbGFjZSgvW1xcV19dKy9nLCAnICcpXG4gICAgICAgICAgLnJlcGxhY2VBbGwoJyAnLCAnXycpO1xuXG4gICAgICAgIC8vIEFkaWNpb25hciBJRCDDum5pY28gYW8gZWxlbWVudG8gSFRNTFxuICAgICAgICB0aXRsZUVsZW1lbnQuaWQgPSBgZ2NibG9iYnktJHtsb2JieUlkfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTyBpZCBmb2kgYWRpY2lvbmFkbyBubyBlbGVtZW50b1wiLCB0aXRsZUVsZW1lbnQuaWQpO1xuXG4gICAgICAgIGNvbnN0IHBsYXllcnNJbmZvID0gZ2V0UGxheWVyc0luZm8obGluZXVwRWxlbWVudHMpO1xuXG4gICAgICAgIC8vIFZlcmlmaWNhciBzZSBhIGxvYmJ5IGrDoSBmb2kgcHJvY2Vzc2FkYSBlIGFkaWNpb25hciByaXNjbywgc2UgbmVjZXNzw6FyaW9cbiAgICAgICAgaWYgKHByb2Nlc3NlZExvYmJpZXMuaGFzKGxvYmJ5SWQpKSB7XG4gICAgICAgICAgY29uc3QgcmlzayA9IGNhbGN1bGF0ZWRSaXNrc01hcC5nZXQobG9iYnlJZCk7XG4gICAgICAgICAgaWYgKHJpc2spIHtcbiAgICAgICAgICAgIGFkZFJpc2tUb0VsZW1lbnQodGl0bGVFbGVtZW50LCByaXNrKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFtdOyAvLyBKw6EgcHJvY2Vzc2FkYSwgbsOjbyBwcmVjaXNhIGFkaWNpb25hciBub3ZhbWVudGVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1hcmNhIGEgbG9iYnkgY29tbyBwcm9jZXNzYWRhXG4gICAgICAgIHByb2Nlc3NlZExvYmJpZXMuYWRkKGxvYmJ5SWQpO1xuICAgICAgICBwcm9jZXNzZWRFbGVtZW50c01hcC5zZXQobG9iYnlJZCwgdGl0bGVFbGVtZW50KTsgLy8gQXJtYXplbmEgbyBlbGVtZW50byBwcm9jZXNzYWRvIG5vIG1hcGFcblxuICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICBwbGF5ZXJzSW5mbyxcbiAgICAgICAgICBsb2JieUlkLFxuICAgICAgICAgIHRpdGxlRWxlbWVudFxuICAgICAgICB9XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9KTtcblxuICByZXR1cm4gcmVzdWx0cztcbn07XG5cbi8vIEZ1bsOnw6NvIHBhcmEgYW5hbGlzYXIgb3MgbsOzcyBhZGljaW9uYWRvcyBlIGV4dHJhaXIgaW5mb3JtYcOnw7VlcyBkYXMgbG9iYmllc1xuY29uc3QgYW5hbHl6ZUxvYmJpZXMgPSAobm9kZXMpID0+IHtcbiAgY29uc3QgY2hhbGxlbmdlcyA9IGluZm9DaGFsbGVuZ2Uobm9kZXMpO1xuXG4gIGlmIChjaGFsbGVuZ2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gIHNlbmRUb0JhY2tncm91bmQoY2hhbGxlbmdlcyk7XG59O1xuXG4vLyBGdW7Dp8OjbyBwYXJhIG9idGVyIGluZm9ybWHDp8O1ZXMgZG9zIGpvZ2Fkb3JlcyBuYSBsb2JieVxuY29uc3QgZ2V0UGxheWVyc0luZm8gPSAobG9iYnlOb2RlcykgPT4ge1xuICBjb25zdCBwbGF5ZXJzID0gW107XG4gIGxvYmJ5Tm9kZXMuZm9yRWFjaChsb2JieU5vZGUgPT4ge1xuICAgIGNvbnN0IHBsYXllckVsZW1lbnRzID0gbG9iYnlOb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zYWxhLWxpbmV1cC1wbGF5ZXI6bm90KC5wbGF5ZXItcGxhY2Vob2xkZXIpIGEnKTtcbiAgICBwbGF5ZXJFbGVtZW50cy5mb3JFYWNoKChwbGF5ZXJFbGVtZW50KSA9PiB7XG4gICAgICBjb25zdCBwbGF5ZXJOYW1lID0gcGxheWVyRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJyk7XG4gICAgICBjb25zdCBwbGF5ZXJQcm9maWxlVXJsID0gcGxheWVyRWxlbWVudC5ocmVmO1xuICAgICAgY29uc3QgcGxheWVySWQgPSBwbGF5ZXJQcm9maWxlVXJsLnNwbGl0KFwiL1wiKS5wb3AoKTtcblxuICAgICAgcGxheWVycy5wdXNoKHtcbiAgICAgICAgbmFtZTogcGxheWVyTmFtZSxcbiAgICAgICAgcHJvZmlsZVVybDogcGxheWVyUHJvZmlsZVVybCxcbiAgICAgICAgaWQ6IHBsYXllcklkLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gcGxheWVycztcbn07XG5cbi8vIEZ1bsOnw6NvIHBhcmEgZW52aWFyIGRhZG9zIHBhcmEgbyBiYWNrZ3JvdW5kLmpzXG5jb25zdCBzZW5kVG9CYWNrZ3JvdW5kID0gKGNoYWxsZW5nZXMpID0+IHtcbiAgY2hhbGxlbmdlcy5mb3JFYWNoKChjaGFsbGVuZ2UpID0+IHtcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICB0eXBlOiBcImZldGNoTG9iYnlJbmZvXCIsXG4gICAgICBsb2JieUlkOiBjaGFsbGVuZ2UubG9iYnlJZCxcbiAgICAgIHBsYXllcnM6IGNoYWxsZW5nZS5wbGF5ZXJzSW5mbyxcbiAgICB9LCAocmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICBpZiAoY2hhbGxlbmdlLnRpdGxlRWxlbWVudCkge1xuICAgICAgICAgIGNvbnN0IHJpc2sgPSByZXNwb25zZS5yaXNrIHx8ICdEZXNjb25oZWNpZG8nO1xuXG4gICAgICAgICAgLy8gQXJtYXplbmEgbyByaXNjbyBjYWxjdWxhZG9cbiAgICAgICAgICBjYWxjdWxhdGVkUmlza3NNYXAuc2V0KGNoYWxsZW5nZS5sb2JieUlkLCByaXNrKTtcblxuICAgICAgICAgIC8vIEFkaWNpb25hIG8gcmlzY28gYW8gZWxlbWVudG9cbiAgICAgICAgICBhZGRSaXNrVG9FbGVtZW50KGNoYWxsZW5nZS50aXRsZUVsZW1lbnQsIHJpc2spO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBMb2JieSByaXNrIGFkZGVkIGZvcjogJHtjaGFsbGVuZ2UudGl0bGVFbGVtZW50LmlkfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBMb2JieSBlbGVtZW50IG5vdCBmb3VuZCBmb3IgSUQ6ICR7Y2hhbGxlbmdlLmxvYmJ5SWR9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59O1xuXG4vLyBGdW7Dp8OjbyBwYXJhIGFkaWNpb25hciByaXNjbyBhbyBlbGVtZW50b1xuY29uc3QgYWRkUmlza1RvRWxlbWVudCA9IChlbGVtZW50LCByaXNrKSA9PiB7XG4gIGxldCByaXNrRWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnJpc2stZWxlbWVudCcpO1xuICBpZiAoIXJpc2tFbGVtZW50KSB7XG4gICAgcmlza0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByaXNrRWxlbWVudC5jbGFzc05hbWUgPSAncmlzay1lbGVtZW50JztcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKHJpc2tFbGVtZW50KTtcbiAgfVxuICByaXNrRWxlbWVudC50ZXh0Q29udGVudCA9IGBSaXNjbzogJHtyaXNrfWA7XG59O1xuXG4vLyBMaXN0ZW5lciBwYXJhIHJlY2ViZXIgbWVuc2FnZW5zIGRlIG91dHJvcyBzY3JpcHRzIG91IGJhY2tncm91bmQuanNcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJsb2dQbGF5ZXJzXCIpIHtcbiAgICBtZXNzYWdlLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhgUGxheWVyOiAke3BsYXllci5uYW1lfWApO1xuICAgICAgY29uc29sZS5sb2coYFByb2ZpbGUgRGV0YWlsczogJHtKU09OLnN0cmluZ2lmeShwbGF5ZXIpfWApO1xuICAgIH0pO1xuICB9XG59KTtcblxuLy8gRnVuw6fDo28gcGFyYSBpbmljaWFsaXphciBvIHNjcmlwdCBxdWFuZG8gbyBkb2N1bWVudG8gZXN0aXZlciBwcm9udG9cbmNvbnN0IGluaXRpYWxpemVTY3JpcHQgPSAoKSA9PiB7XG4gIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJpbnRlcmFjdGl2ZVwiKSB7XG4gICAgaW5pdE9ic2VydmVyKCk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xuICAgICAgaW5pdE9ic2VydmVyKCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbndpbmRvdy5vbmxvYWQgPSBpbml0aWFsaXplU2NyaXB0O1xuaW5pdGlhbGl6ZVNjcmlwdCgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9