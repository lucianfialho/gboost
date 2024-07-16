const cheerio = require("cheerio");

chrome.runtime.onInstalled.addListener(() => {
  console.log("GamersClub Booster Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "logPlayers") {
    console.log("Players in lobby:", message.players);
    message.players.forEach((player) => {
      fetchSteamProfile(player.profileUrl, player.name);
    });
  }
});

const fetchSteamProfile = async (profileUrl, playerName) => {
  try {
    const response = await fetch(profileUrl, {
      method: "GET",
      credentials: "include",
    });
    const text = await response.text();
    const steamProfileUrl = extractSteamProfileUrl(text);
    if (steamProfileUrl) {
      console.log(`Steam profile for ${playerName}:`, steamProfileUrl);
    } else {
      console.log(`Steam profile not found for ${playerName}`);
    }
  } catch (error) {
    console.error(`Failed to fetch profile for ${playerName}:`, error);
  }
};

const extractSteamProfileUrl = (html) => {
  const $ = cheerio.load(html);
  const steamButton = $(".Button--steam");
  return steamButton.length ? steamButton.attr("href") : null;
};
