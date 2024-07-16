const cheerio = require("cheerio");

chrome.runtime.onInstalled.addListener(() => {
  console.log("GamersClub Booster Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "fetchLobbyInfo") {
    processLobbyInfo(message.lobbyId, message.players, sendResponse);
    return true; // Indica que vamos enviar uma resposta de forma assíncrona
  }
});

const processedLobbies = new Set();

const processLobbyInfo = async (lobbyId, players, sendResponse) => {
  if (processedLobbies.has(lobbyId)) {
    console.log(`Lobby already processed: ${lobbyId}`);
    return;
  }

  processedLobbies.add(lobbyId);

  const playerProfiles = await Promise.all(
    players.map((player) => processPlayerProfile(player))
  );

  sendResponse({ lobbyId, players: playerProfiles });
};

const processPlayerProfile = async (player) => {
  try {
    const response = await fetch(player.profileUrl);

    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);
      const steamProfileUrl = $(".Button--steam").attr("href");

      if (steamProfileUrl) {
        const steamId = extractSteamId(steamProfileUrl);
        const playerProfile = await fetchSteamProfile(steamId);
        return { ...player, steamProfileUrl, ...playerProfile };
      } else {
        console.error(`Steam profile URL not found for ${player.name}`);
        return { ...player, error: "Steam profile URL not found" };
      }
    } else {
      console.error(
        `Failed to fetch profile for ${player.name}: ${response.statusText}`
      );
      return {
        ...player,
        error: `Failed to fetch profile: ${response.statusText}`,
      };
    }
  } catch (error) {
    console.error(`Failed to fetch profile for ${player.name}:`, error);
    return { ...player, error: error.message };
  }
};

const extractSteamId = (steamProfileUrl) => {
  const urlParts = steamProfileUrl.split("/");
  return urlParts[urlParts.length - 1];
};

const fetchSteamProfile = async (steamId) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "insomnia/9.2.0",
    },
    body: JSON.stringify({ username: steamId }),
  };

  try {
    const response = await fetch(
      "https://devlingo.up.railway.app/getUserProfile",
      options
    );
    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error(`Failed to fetch Steam profile for ID ${steamId}:`, error);
    return { error: error.message };
  }
};
