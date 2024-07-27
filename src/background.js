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

  if (!players || !Array.isArray(players)) {
    console.error("Invalid players data:", players);
    sendResponse({ error: "Invalid players data" });
    return;
  }

  try {
    const playerProfiles = await fetchPlayerProfiles(players);
    const lobbyRisk = playerProfiles.lobbyRisk;
    const profilesWithRisk = playerProfiles.profiles.map((profile, index) => ({
      ...players[index],
      steamId: profile.steamId,
      risk: profile.risk
    }));

    console.log(profilesWithRisk);
    sendResponse({ lobbyId, players: profilesWithRisk, risk: lobbyRisk });
  } catch (error) {
    console.error("Error processing player profiles:", error);
    sendResponse({ error: error.message });
  }
};

const fetchPlayerProfiles = async (players) => {
  const playerUrls = players.map(player => player.profileUrl);

  // Obter Steam IDs a partir dos perfis Steam
  const steamIds = await Promise.all(
    playerUrls.map(async (profileUrl) => {
      try {
        const response = await fetch(profileUrl);
        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);
          const steamIdUrl = $(".Button--steam").attr("href");
          return extractSteamId(steamIdUrl);
        } else {
          console.error(`Failed to fetch profile for ${profileUrl}: ${response.statusText}`);
          return null;
        }
      } catch (error) {
        console.error(`Failed to fetch profile for ${profileUrl}:`, error);
        return null;
      }
    })
  );

  // Filtrar IDs válidos
  const validSteamIds = steamIds.filter(id => id);
  const steamProfiles = await fetchSteamProfiles(validSteamIds);

  // Associar steamId e risco aos jogadores
  const profiles = players.map((player, index) => {
    const steamId = steamIds[index];
    const risk = steamProfiles.profiles[steamId] || 0; // Usa 0 como risco padrão se o ID não for encontrado
    return { ...player, steamId, risk };
  });

  console.log(steamProfiles)

  return { profiles, lobbyRisk: steamProfiles.lobbyRisk };
};

const extractSteamId = (steamProfileUrl) => {
  const urlParts = steamProfileUrl.split("/");
  return urlParts[urlParts.length - 1];
};

const fetchSteamProfiles = async (steamIds) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "insomnia/9.2.0",
    },
    body: JSON.stringify({ usernames: steamIds }),
  };

  try {
    const response = await fetch(
      "https://devlingo.up.railway.app/getUserProfiles",
      options
    );
    const { profiles, lobbyRisk } = await response.json();
    return { profiles, lobbyRisk };
  } catch (error) {
    console.error(`Failed to fetch Steam profiles:`, error);
    return { profiles: {}, lobbyRisk: 0 };
  }
};
