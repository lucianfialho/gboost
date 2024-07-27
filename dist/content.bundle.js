/******/ (() => { // webpackBootstrap
/*!************************!*\
  !*** ./src/content.js ***!
  \************************/
// Conjunto para manter o controle das lobbies processadas
const processedLobbies = new Set();

// Mapa para armazenar elementos processados e seus IDs
const processedElementsMap = new Map();

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
          return []; // Retorna um array vazio se não houver título
        }

        const lobbyId = titleElement.textContent
          .toLowerCase()
          .replace(/[\W_]+/g, ' ')
          .replaceAll(' ', '_');

        if (processedLobbies.has(lobbyId)) {
          // Atualiza o elemento armazenado no mapa
          const storedElement = processedElementsMap.get(lobbyId);
          if (storedElement) {
            return [{
              playersInfo: getPlayersInfo(lineupElements),
              lobbyId,
              titleElement: storedElement
            }];
          }
          return []; // Se a lobby já foi processada, retorna um array vazio
        }

        // Adicionar ID único ao elemento HTML
        titleElement.id = `gcblobby-${lobbyId}`;
        console.log("O id foi adicionado no elemento", titleElement.id);

        const playersInfo = getPlayersInfo(lineupElements);

        // Marca a lobby como processada
        processedLobbies.add(lobbyId);
        processedElementsMap.set(lobbyId, titleElement); // Armazena o elemento processado no mapa

        return [{
          playersInfo,
          lobbyId,
          titleElementId: titleElement.id
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
        const element = document.getElementById(challenge.titleElementId);
        if (element) {
          
          const riskElement = document.createElement('div');
          riskElement.textContent = `Risco: ${response.risk || 'Desconhecido'}`;
          element.appendChild(riskElement);
          console.log(`Lobby risk added for: ${element.id}`);
        } else {
          console.log(`Lobby element not found for ID: ${challenge.lobbyId}`);
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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSCxpQ0FBaUMsZ0NBQWdDO0FBQ2pFOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxxQkFBcUI7QUFDckI7O0FBRUE7QUFDQSxzQ0FBc0MsUUFBUTtBQUM5Qzs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EseURBQXlEOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsZ0NBQWdDO0FBQzlFO0FBQ0EsK0NBQStDLFdBQVc7QUFDMUQsVUFBVTtBQUNWLHlEQUF5RCxrQkFBa0I7QUFDM0U7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsWUFBWTtBQUN6QyxzQ0FBc0MsdUJBQXVCO0FBQzdELEtBQUs7QUFDTDtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9nYm9vc3QvLi9zcmMvY29udGVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb25qdW50byBwYXJhIG1hbnRlciBvIGNvbnRyb2xlIGRhcyBsb2JiaWVzIHByb2Nlc3NhZGFzXG5jb25zdCBwcm9jZXNzZWRMb2JiaWVzID0gbmV3IFNldCgpO1xuXG4vLyBNYXBhIHBhcmEgYXJtYXplbmFyIGVsZW1lbnRvcyBwcm9jZXNzYWRvcyBlIHNldXMgSURzXG5jb25zdCBwcm9jZXNzZWRFbGVtZW50c01hcCA9IG5ldyBNYXAoKTtcblxuLy8gRnVuw6fDo28gcGFyYSBpbmljaWFsaXphciBvIG9ic2VydmFkb3IgZGUgbXV0YcOnw7VlcyBkbyBET01cbmNvbnN0IGluaXRPYnNlcnZlciA9ICgpID0+IHtcbiAgY3JlYXRlT2JzZXJ2ZXIoXCIjY2hhbGxlbmdlTGlzdFwiLCBoYW5kbGVNdXRhdGlvbnMpO1xufTtcblxuLy8gRnVuw6fDo28gcGFyYSBjcmlhciBlIGNvbmZpZ3VyYXIgbyBvYnNlcnZhZG9yIGRlIG11dGHDp8O1ZXNcbmNvbnN0IGNyZWF0ZU9ic2VydmVyID0gKHRhcmdldCwgY2FsbGJhY2spID0+IHtcbiAgY29uc3QgdGFyZ2V0Tm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcbiAgaWYgKCF0YXJnZXROb2RlKSB7XG4gICAgY29uc29sZS5sb2coXCJObyB0YXJnZXQgbm9kZSBmb3VuZCBmb3JcIiwgdGFyZ2V0KTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnNMaXN0KSA9PiB7XG4gICAgY2FsbGJhY2sobXV0YXRpb25zTGlzdCk7XG4gIH0pO1xuXG4gIG9ic2VydmVyLm9ic2VydmUodGFyZ2V0Tm9kZSwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XG59O1xuXG4vLyBGdW7Dp8OjbyBwYXJhIHByb2Nlc3NhciBtdXRhw6fDtWVzIG9ic2VydmFkYXMgbm8gRE9NXG5jb25zdCBoYW5kbGVNdXRhdGlvbnMgPSAobXV0YXRpb25zTGlzdCkgPT4ge1xuICBtdXRhdGlvbnNMaXN0LmZvckVhY2goKG11dGF0aW9uKSA9PiB7XG4gICAgaWYgKG11dGF0aW9uLnR5cGUgPT09IFwiY2hpbGRMaXN0XCIgJiYgbXV0YXRpb24uYWRkZWROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICBhbmFseXplTG9iYmllcyhBcnJheS5mcm9tKG11dGF0aW9uLmFkZGVkTm9kZXMpKTtcbiAgICB9XG4gIH0pO1xufTtcblxuLy8gRnVuw6fDo28gcGFyYSBvYnRlciBvcyBJRHMgZG9zIGpvZ2Fkb3JlcyBhIHBhcnRpciBkZSB1bSBlbGVtZW50b1xuY29uc3QgZ2V0UGxheWVyc0lkcyA9IChlbGVtZW50KSA9PiB7XG4gIGNvbnN0IHBsYXllckxpbmtzID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2FsYS1saW5ldXAtcGxheWVyOm5vdCgucGxheWVyLXBsYWNlaG9sZGVyKSBhJyk7XG4gIGlmIChwbGF5ZXJMaW5rcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20ocGxheWVyTGlua3MpLm1hcChlID0+IGUuaHJlZi5zcGxpdCgnLycpLnBvcCgpKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcIk5vIHBsYXllciBsaW5rcyBmb3VuZCBpbiBlbGVtZW50OlwiLCBlbGVtZW50KTtcbiAgICByZXR1cm4gW107XG4gIH1cbn07XG5cbi8vIEZ1bsOnw6NvIHBhcmEgcHJvY2Vzc2FyIGFzIGluZm9ybWHDp8O1ZXMgZG9zIGRlc2FmaW9zXG5jb25zdCBpbmZvQ2hhbGxlbmdlID0gKG5vZGVzKSA9PiB7XG4gIGNvbnN0IHJlc3VsdHMgPSBub2Rlcy5mbGF0TWFwKChub2RlLCBpbmRleCkgPT4ge1xuICAgIFxuICAgIGlmIChub2RlIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgXG4gICAgICBjb25zdCBjaGFsbGVuZ2VFbGVtZW50cyA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgnLnNpZGViYXItaXRlbS1jb250ZW50LnNpZGViYXItaXRlbS1wZW5kaW5nJyk7XG4gICAgICBjb25zdCBsaW5ldXBFbGVtZW50cyA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgnLnNhbGEtbGluZXVwID4gLnNhbGEtbGluZXVwLXBsYXllcnMnKTtcbiAgICAgIFxuICAgICAgaWYoY2hhbGxlbmdlRWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdGl0bGVFbGVtZW50ID0gY2hhbGxlbmdlRWxlbWVudHNbMF0ucXVlcnlTZWxlY3RvcignLnNpZGViYXItaXRlbS1uYW1lJyk7XG4gICAgICAgIGlmICghdGl0bGVFbGVtZW50KSB7XG4gICAgICAgICAgcmV0dXJuIFtdOyAvLyBSZXRvcm5hIHVtIGFycmF5IHZhemlvIHNlIG7Do28gaG91dmVyIHTDrXR1bG9cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxvYmJ5SWQgPSB0aXRsZUVsZW1lbnQudGV4dENvbnRlbnRcbiAgICAgICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIC5yZXBsYWNlKC9bXFxXX10rL2csICcgJylcbiAgICAgICAgICAucmVwbGFjZUFsbCgnICcsICdfJyk7XG5cbiAgICAgICAgaWYgKHByb2Nlc3NlZExvYmJpZXMuaGFzKGxvYmJ5SWQpKSB7XG4gICAgICAgICAgLy8gQXR1YWxpemEgbyBlbGVtZW50byBhcm1hemVuYWRvIG5vIG1hcGFcbiAgICAgICAgICBjb25zdCBzdG9yZWRFbGVtZW50ID0gcHJvY2Vzc2VkRWxlbWVudHNNYXAuZ2V0KGxvYmJ5SWQpO1xuICAgICAgICAgIGlmIChzdG9yZWRFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgcGxheWVyc0luZm86IGdldFBsYXllcnNJbmZvKGxpbmV1cEVsZW1lbnRzKSxcbiAgICAgICAgICAgICAgbG9iYnlJZCxcbiAgICAgICAgICAgICAgdGl0bGVFbGVtZW50OiBzdG9yZWRFbGVtZW50XG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFtdOyAvLyBTZSBhIGxvYmJ5IGrDoSBmb2kgcHJvY2Vzc2FkYSwgcmV0b3JuYSB1bSBhcnJheSB2YXppb1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRpY2lvbmFyIElEIMO6bmljbyBhbyBlbGVtZW50byBIVE1MXG4gICAgICAgIHRpdGxlRWxlbWVudC5pZCA9IGBnY2Jsb2JieS0ke2xvYmJ5SWR9YDtcbiAgICAgICAgY29uc29sZS5sb2coXCJPIGlkIGZvaSBhZGljaW9uYWRvIG5vIGVsZW1lbnRvXCIsIHRpdGxlRWxlbWVudC5pZCk7XG5cbiAgICAgICAgY29uc3QgcGxheWVyc0luZm8gPSBnZXRQbGF5ZXJzSW5mbyhsaW5ldXBFbGVtZW50cyk7XG5cbiAgICAgICAgLy8gTWFyY2EgYSBsb2JieSBjb21vIHByb2Nlc3NhZGFcbiAgICAgICAgcHJvY2Vzc2VkTG9iYmllcy5hZGQobG9iYnlJZCk7XG4gICAgICAgIHByb2Nlc3NlZEVsZW1lbnRzTWFwLnNldChsb2JieUlkLCB0aXRsZUVsZW1lbnQpOyAvLyBBcm1hemVuYSBvIGVsZW1lbnRvIHByb2Nlc3NhZG8gbm8gbWFwYVxuXG4gICAgICAgIHJldHVybiBbe1xuICAgICAgICAgIHBsYXllcnNJbmZvLFxuICAgICAgICAgIGxvYmJ5SWQsXG4gICAgICAgICAgdGl0bGVFbGVtZW50SWQ6IHRpdGxlRWxlbWVudC5pZFxuICAgICAgICB9XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9KTtcblxuICByZXR1cm4gcmVzdWx0cztcbn07XG5cbi8vIEZ1bsOnw6NvIHBhcmEgYW5hbGlzYXIgb3MgbsOzcyBhZGljaW9uYWRvcyBlIGV4dHJhaXIgaW5mb3JtYcOnw7VlcyBkYXMgbG9iYmllc1xuY29uc3QgYW5hbHl6ZUxvYmJpZXMgPSAobm9kZXMpID0+IHtcbiAgY29uc3QgY2hhbGxlbmdlcyA9IGluZm9DaGFsbGVuZ2Uobm9kZXMpO1xuICBcbiAgaWYgKGNoYWxsZW5nZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gIFxuICBzZW5kVG9CYWNrZ3JvdW5kKGNoYWxsZW5nZXMpO1xufTtcblxuLy8gRnVuw6fDo28gcGFyYSBvYnRlciBpbmZvcm1hw6fDtWVzIGRvcyBqb2dhZG9yZXMgbmEgbG9iYnlcbmNvbnN0IGdldFBsYXllcnNJbmZvID0gKGxvYmJ5Tm9kZXMpID0+IHtcbiAgY29uc3QgcGxheWVycyA9IFtdO1xuICBsb2JieU5vZGVzLmZvckVhY2gobG9iYnlOb2RlID0+IHtcbiAgICBjb25zdCBwbGF5ZXJFbGVtZW50cyA9IGxvYmJ5Tm9kZS5xdWVyeVNlbGVjdG9yQWxsKCcuc2FsYS1saW5ldXAtcGxheWVyOm5vdCgucGxheWVyLXBsYWNlaG9sZGVyKSBhJyk7XG4gICAgcGxheWVyRWxlbWVudHMuZm9yRWFjaCgocGxheWVyRWxlbWVudCkgPT4ge1xuICAgICAgY29uc3QgcGxheWVyTmFtZSA9IHBsYXllckVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0aXRsZScpO1xuICAgICAgY29uc3QgcGxheWVyUHJvZmlsZVVybCA9IHBsYXllckVsZW1lbnQuaHJlZjtcbiAgICAgIGNvbnN0IHBsYXllcklkID0gcGxheWVyUHJvZmlsZVVybC5zcGxpdChcIi9cIikucG9wKCk7XG5cbiAgICAgIHBsYXllcnMucHVzaCh7XG4gICAgICAgIG5hbWU6IHBsYXllck5hbWUsXG4gICAgICAgIHByb2ZpbGVVcmw6IHBsYXllclByb2ZpbGVVcmwsXG4gICAgICAgIGlkOiBwbGF5ZXJJZCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHBsYXllcnM7XG59O1xuXG4vLyBGdW7Dp8OjbyBwYXJhIGVudmlhciBkYWRvcyBwYXJhIG8gYmFja2dyb3VuZC5qc1xuY29uc3Qgc2VuZFRvQmFja2dyb3VuZCA9IChjaGFsbGVuZ2VzKSA9PiB7XG4gIGNoYWxsZW5nZXMuZm9yRWFjaCgoY2hhbGxlbmdlKSA9PiB7XG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogXCJmZXRjaExvYmJ5SW5mb1wiLFxuICAgICAgbG9iYnlJZDogY2hhbGxlbmdlLmxvYmJ5SWQsXG4gICAgICBwbGF5ZXJzOiBjaGFsbGVuZ2UucGxheWVyc0luZm8sXG4gICAgfSwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNoYWxsZW5nZS50aXRsZUVsZW1lbnRJZCk7XG4gICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3Qgcmlza0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICByaXNrRWxlbWVudC50ZXh0Q29udGVudCA9IGBSaXNjbzogJHtyZXNwb25zZS5yaXNrIHx8ICdEZXNjb25oZWNpZG8nfWA7XG4gICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChyaXNrRWxlbWVudCk7XG4gICAgICAgICAgY29uc29sZS5sb2coYExvYmJ5IHJpc2sgYWRkZWQgZm9yOiAke2VsZW1lbnQuaWR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYExvYmJ5IGVsZW1lbnQgbm90IGZvdW5kIGZvciBJRDogJHtjaGFsbGVuZ2UubG9iYnlJZH1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn07XG5cbi8vIExpc3RlbmVyIHBhcmEgcmVjZWJlciBtZW5zYWdlbnMgZGUgb3V0cm9zIHNjcmlwdHMgb3UgYmFja2dyb3VuZC5qc1xuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICBpZiAobWVzc2FnZS50eXBlID09PSBcImxvZ1BsYXllcnNcIikge1xuICAgIG1lc3NhZ2UucGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGBQbGF5ZXI6ICR7cGxheWVyLm5hbWV9YCk7XG4gICAgICBjb25zb2xlLmxvZyhgUHJvZmlsZSBEZXRhaWxzOiAke0pTT04uc3RyaW5naWZ5KHBsYXllcil9YCk7XG4gICAgfSk7XG4gIH1cbn0pO1xuXG4vLyBGdW7Dp8OjbyBwYXJhIGluaWNpYWxpemFyIG8gc2NyaXB0IHF1YW5kbyBvIGRvY3VtZW50byBlc3RpdmVyIHByb250b1xuY29uc3QgaW5pdGlhbGl6ZVNjcmlwdCA9ICgpID0+IHtcbiAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImludGVyYWN0aXZlXCIpIHtcbiAgICBpbml0T2JzZXJ2ZXIoKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgICBpbml0T2JzZXJ2ZXIoKTtcbiAgICB9KTtcbiAgfVxufTtcblxud2luZG93Lm9ubG9hZCA9IGluaXRpYWxpemVTY3JpcHQ7XG5pbml0aWFsaXplU2NyaXB0KCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=