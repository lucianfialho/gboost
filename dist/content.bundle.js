/******/ (() => { // webpackBootstrap
/*!************************!*\
  !*** ./src/content.js ***!
  \************************/
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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUgsaUNBQWlDLGdDQUFnQztBQUNqRSxzQ0FBc0MsT0FBTztBQUM3Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsUUFBUTs7QUFFMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7O0FBRUg7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLGtCQUFrQjtBQUMvQyxzQ0FBc0MsbUNBQW1DO0FBQ3pFLEtBQUs7QUFDTDtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ2Jvb3N0Ly4vc3JjL2NvbnRlbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc29sZS5sb2coXCJDb250ZW50IHNjcmlwdCBsb2FkZWRcIik7XG5cbi8vIEZ1bsOnw6NvIHBhcmEgaW5pY2lhbGl6YXIgbyBvYnNlcnZhZG9yIGRlIG11dGHDp8O1ZXMgZG8gRE9NXG5jb25zdCBpbml0T2JzZXJ2ZXIgPSAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiSW5pdGlhbGl6aW5nIG9ic2VydmVyXCIpO1xuICBjcmVhdGVPYnNlcnZlcihcIltkYXRhLWNvbXBvbmVudD0nTG9iYnknXVwiLCBoYW5kbGVNdXRhdGlvbnMpO1xufTtcblxuLy8gRnVuw6fDo28gcGFyYSBjcmlhciBlIGNvbmZpZ3VyYXIgbyBvYnNlcnZhZG9yIGRlIG11dGHDp8O1ZXNcbmNvbnN0IGNyZWF0ZU9ic2VydmVyID0gKHRhcmdldCwgY2FsbGJhY2spID0+IHtcbiAgY29uc3QgdGFyZ2V0Tm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcbiAgaWYgKCF0YXJnZXROb2RlKSB7XG4gICAgY29uc29sZS5sb2coXCJObyB0YXJnZXQgbm9kZSBmb3VuZCBmb3JcIiwgdGFyZ2V0KTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnNMaXN0KSA9PiB7XG4gICAgY2FsbGJhY2sobXV0YXRpb25zTGlzdCk7XG4gIH0pO1xuXG4gIG9ic2VydmVyLm9ic2VydmUodGFyZ2V0Tm9kZSwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XG4gIGNvbnNvbGUubG9nKGBPYnNlcnZlciBjcmVhdGVkIGZvciAke3RhcmdldH1gKTtcbn07XG5cbi8vIEZ1bsOnw6NvIHBhcmEgcHJvY2Vzc2FyIG11dGHDp8O1ZXMgb2JzZXJ2YWRhcyBubyBET01cbmNvbnN0IGhhbmRsZU11dGF0aW9ucyA9IChtdXRhdGlvbnNMaXN0KSA9PiB7XG4gIG11dGF0aW9uc0xpc3QuZm9yRWFjaCgobXV0YXRpb24pID0+IHtcbiAgICBpZiAobXV0YXRpb24udHlwZSA9PT0gXCJjaGlsZExpc3RcIiAmJiBtdXRhdGlvbi5hZGRlZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGFuYWx5emVMb2JiaWVzKEFycmF5LmZyb20obXV0YXRpb24uYWRkZWROb2RlcykpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vLyBGdW7Dp8OjbyBwYXJhIGFuYWxpc2FyIG9zIG7Ds3MgYWRpY2lvbmFkb3MgZSBleHRyYWlyIGluZm9ybWHDp8O1ZXMgZGFzIGxvYmJpZXNcbmNvbnN0IGFuYWx5emVMb2JiaWVzID0gKG5vZGVzKSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiQW5hbHl6aW5nIGxvYmJpZXNcIik7XG4gIG5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSAmJiBub2RlLm1hdGNoZXMoXCIuTG9iYnlfX01haW5Db250YWluZXJcIikpIHtcbiAgICAgIGNvbnN0IGxvYmJ5SWQgPSBub2RlXG4gICAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLk15Um9vbUhlYWRlcl9fdGl0bGVcIilcbiAgICAgICAgLnRleHRDb250ZW50LnRyaW0oKVxuICAgICAgICAucmVwbGFjZSgvW1xcV19dKy9nLCBcIiBcIilcbiAgICAgICAgLnJlcGxhY2VBbGwoXCIgXCIsIFwiX1wiKTtcbiAgICAgIGNvbnNvbGUubG9nKGBMb2JieSBmb3VuZDogJHtsb2JieUlkfWApO1xuXG4gICAgICAvLyBFbnZpYXIgZGFkb3MgZGEgbG9iYnkgcGFyYSBvIGJhY2tncm91bmQuanNcbiAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgdHlwZTogXCJmZXRjaExvYmJ5SW5mb1wiLFxuICAgICAgICBsb2JieUlkOiBsb2JieUlkLFxuICAgICAgICBwbGF5ZXJzOiBnZXRQbGF5ZXJzSW5mbyhub2RlKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vLyBGdW7Dp8OjbyBwYXJhIG9idGVyIGluZm9ybWHDp8O1ZXMgZG9zIGpvZ2Fkb3JlcyBuYSBsb2JieVxuY29uc3QgZ2V0UGxheWVyc0luZm8gPSAobG9iYnlOb2RlKSA9PiB7XG4gIGNvbnN0IHBsYXllcnMgPSBbXTtcbiAgY29uc3QgcGxheWVyRWxlbWVudHMgPSBsb2JieU5vZGUucXVlcnlTZWxlY3RvckFsbChcIi5Mb2JieVBsYXllckhvcml6b250YWxcIik7XG5cbiAgcGxheWVyRWxlbWVudHMuZm9yRWFjaCgocGxheWVyRWxlbWVudCkgPT4ge1xuICAgIGNvbnN0IHBsYXllck5hbWUgPSBwbGF5ZXJFbGVtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcihcIi5Mb2JieVBsYXllckhvcml6b250YWxfX25pY2tuYW1lIGFcIilcbiAgICAgIC50ZXh0Q29udGVudC50cmltKCk7XG4gICAgY29uc3QgcGxheWVyUHJvZmlsZVVybCA9IHBsYXllckVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIFwiLkxvYmJ5UGxheWVySG9yaXpvbnRhbF9fbmlja25hbWUgYVwiXG4gICAgKS5ocmVmO1xuICAgIGNvbnN0IHBsYXllcklkID0gcGxheWVyUHJvZmlsZVVybC5zcGxpdChcIi9cIikucG9wKCk7XG5cbiAgICBwbGF5ZXJzLnB1c2goe1xuICAgICAgbmFtZTogcGxheWVyTmFtZSxcbiAgICAgIHByb2ZpbGVVcmw6IHBsYXllclByb2ZpbGVVcmwsXG4gICAgICBpZDogcGxheWVySWQsXG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBwbGF5ZXJzO1xufTtcblxuLy8gTGlzdGVuZXIgcGFyYSByZWNlYmVyIG1lbnNhZ2VucyBkZSBvdXRyb3Mgc2NyaXB0cyBvdSBiYWNrZ3JvdW5kLmpzXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gIGlmIChtZXNzYWdlLnR5cGUgPT09IFwibG9nUGxheWVyc1wiKSB7XG4gICAgY29uc29sZS5sb2coXCJQbGF5ZXIgRGF0YTpcIiwgbWVzc2FnZS5wbGF5ZXJzKTtcbiAgICBtZXNzYWdlLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhgUGxheWVyOiAke3BsYXllci5wbGF5ZXJOYW1lfWApO1xuICAgICAgY29uc29sZS5sb2coYFByb2ZpbGUgRGV0YWlsczogJHtKU09OLnN0cmluZ2lmeShwbGF5ZXIudXNlclByb2ZpbGUpfWApO1xuICAgIH0pO1xuICB9XG59KTtcblxuLy8gRnVuw6fDo28gcGFyYSBpbmljaWFsaXphciBvIHNjcmlwdCBxdWFuZG8gbyBkb2N1bWVudG8gZXN0aXZlciBwcm9udG9cbmNvbnN0IGluaXRpYWxpemVTY3JpcHQgPSAoKSA9PiB7XG4gIGlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImludGVyYWN0aXZlXCJcbiAgKSB7XG4gICAgY29uc29sZS5sb2coXCJEb2N1bWVudCBpcyByZWFkeS4gSW5pdGlhbGl6aW5nIHNjcmlwdC5cIik7XG4gICAgaW5pdE9ic2VydmVyKCk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJET01Db250ZW50TG9hZGVkIGV2ZW50IGZpcmVkLiBJbml0aWFsaXppbmcgc2NyaXB0LlwiKTtcbiAgICAgIGluaXRPYnNlcnZlcigpO1xuICAgIH0pO1xuICB9XG59O1xuXG53aW5kb3cub25sb2FkID0gaW5pdGlhbGl6ZVNjcmlwdDtcbmluaXRpYWxpemVTY3JpcHQoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==