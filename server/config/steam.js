const STEAM_API_BASE = 'https://api.steampowered.com';

class SteamService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getOwnedGames(steamId) {
    const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`;
    console.log(`[SteamAPI] GET GetOwnedGames for ${steamId}`);
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error(`[SteamAPI] GetOwnedGames failed: ${res.status} - ${text}`);
      throw new Error(`Steam API error: ${res.status}`);
    }
    const data = await res.json();
    console.log(`[SteamAPI] GetOwnedGames response: ${JSON.stringify(data.response).substring(0, 200)}`);
    return data.response || { games: [] };
  }

  async getRecentlyPlayedGames(steamId, count = 10) {
    const url = `${STEAM_API_BASE}/IPlayerService/GetRecentlyPlayedGames/v1/?key=${this.apiKey}&steamid=${steamId}&count=${count}&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
    const data = await res.json();
    return data.response || { games: [] };
  }

  async getPlayerSummary(steamId) {
    const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${this.apiKey}&steamids=${steamId}&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
    const data = await res.json();
    const players = data.response?.players || [];
    return players[0] || null;
  }

  async resolveVanityUrl(vanityUrl) {
    const url = `${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v1/?key=${this.apiKey}&vanityurl=${vanityUrl}&format=json`;
    console.log(`[SteamAPI] GET ResolveVanityURL for "${vanityUrl}"`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
    const data = await res.json();
    console.log(`[SteamAPI] ResolveVanityURL response: ${JSON.stringify(data.response)}`);
    return data.response;
  }

  async getPlayerAchievements(steamId, appId) {
    const url = `${STEAM_API_BASE}/ISteamUserStats/GetPlayerAchievements/v1/?key=${this.apiKey}&steamid=${steamId}&appid=${appId}&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.playerstats?.success) {
      return data.playerstats.achievements || [];
    }
    return null;
  }

  async getGameSchema(appId) {
    const url = `${STEAM_API_BASE}/ISteamUserStats/GetSchemaForGame/v2/?key=${this.apiKey}&appid=${appId}&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.game?.achievements || [];
  }

  async getAppDetails(appId) {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const appData = data?.[String(appId)];
    if (!appData?.success) return null;
    return appData.data || null;
  }
}

module.exports = SteamService;
