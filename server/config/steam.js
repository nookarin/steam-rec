const STEAM_API_BASE = 'https://api.steampowered.com';

class SteamService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getOwnedGames(steamId) {
    const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
    const data = await res.json();
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
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
    const data = await res.json();
    return data.response;
  }
}

module.exports = SteamService;
