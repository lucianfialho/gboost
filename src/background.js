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
    console.log("Players ", players)
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

  // Obter Steam IDs a partir dos perfis Steam
  const steamIds = await Promise.all(
    players.map(async ({profileUrl, id}) => {
      
      try {
        const response = await fetch(profileUrl);
        
        
        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);
          const steamIdUrl = $(".Button--steam").attr("href");

          const metrics = await fetch(`https://gamersclub.com.br/api/leaderboard/${id}?key=season_three&page=1&pageSize=20&withTopPlayers=true`)
          const metricsData = await metrics.json()

          return {
            steamId: extractSteamId(steamIdUrl),
            metrics: metricsData.data
          }
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
  const validProfiles = steamIds.filter(item => {
    if(item.steamId) {
      return {
        ...item
      }
    }
  });
  console.log(JSON.stringify(validProfiles))
  const steamProfiles = await fetchSteamProfiles(validProfiles);

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

const fetchSteamProfiles = async (profiles) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "insomnia/9.2.0",
    },
    body: JSON.stringify({ profiles  }),
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
