const SteamService = require('../config/steam');
const Library = require('../models/Library');
const PlayerProfile = require('../models/PlayerProfile');

class LibraryService {
  constructor() {
    this.steam = new SteamService(process.env.STEAM_API_KEY);
    this.CACHE_TTL_MS = 60 * 60 * 1000;
  }

  parseSteamInput(input) {
    if (!input) throw new Error('No Steam input provided');
    const trimmed = input.trim();

    const urlPatterns = [
      /steamcommunity\.com\/id\/([a-zA-Z0-9_-]+)/,
      /steamcommunity\.com\/profiles\/(\d{17})/,
    ];

    for (const pattern of urlPatterns) {
      const match = trimmed.match(pattern);
      if (match) return match[1];
    }

    if (/^\d{17}$/.test(trimmed)) return trimmed;

    if (/^[a-zA-Z0-9_-]{3,32}$/.test(trimmed)) return trimmed;

    throw new Error('Invalid Steam ID or URL. Use a 17-digit Steam ID, a vanity name, or a full steamcommunity.com profile URL.');
  }

  async resolveSteamId(input) {
    const parsed = this.parseSteamInput(input);

    if (/^\d{17}$/.test(parsed)) return parsed;

    const result = await this.steam.resolveVanityUrl(parsed);
    if (result?.success === 1) return result.steamid;
    throw new Error(`Could not resolve vanity URL "${parsed}". Make sure the profile URL is correct and public.`);
  }

  async fetchAndCacheLibrary(steamId, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = await Library.findOne({ steamId }).sort({ fetchedAt: -1 });
      if (cached && (Date.now() - cached.fetchedAt.getTime()) < this.CACHE_TTL_MS) {
        return cached;
      }
    }

    console.log(`[SteamService] Fetching games for steamId: ${steamId}`);

    const [gamesResponse, profile] = await Promise.all([
      this.steam.getOwnedGames(steamId),
      this.steam.getPlayerSummary(steamId)
    ]);

    console.log(`[SteamService] Steam API returned ${(gamesResponse.games || []).length} games`);

    if (!gamesResponse.games || gamesResponse.games.length === 0) {
      throw new Error('No games found. Make sure your Steam profile and game details are set to Public.');
    }

    const games = (gamesResponse.games || []).map(g => ({
      appId: g.appid,
      name: g.name,
      playtimeForever: g.playtime_forever || 0,
      playtime2Weeks: g.playtime_2weeks || 0,
      imgIconUrl: g.img_icon_url
        ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
        : '',
      headerImage: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      genres: [],
      tags: []
    }));

    const totalPlaytime = games.reduce((sum, g) => sum + g.playtimeForever, 0);

    const library = await Library.findOneAndUpdate(
      { steamId },
      {
        steamId,
        playerName: profile?.personaname || 'Unknown',
        avatarUrl: profile?.avatarfull || '',
        games,
        totalGames: games.length,
        totalPlaytimeMinutes: totalPlaytime,
        fetchedAt: new Date()
      },
      { new: true, upsert: true }
    );

    console.log(`[SteamService] Saved library to MongoDB: ${games.length} games for ${library.playerName}`);

    await PlayerProfile.findOneAndUpdate(
      { steamId },
      {
        steamId,
        playerName: profile?.personaname || 'Unknown',
        avatarUrl: profile?.avatarfull || '',
        profileUrl: profile?.profileurl || '',
        lastSyncedAt: new Date()
      },
      { upsert: true }
    );

    return library;
  }

  async getLibrary(steamId) {
    const resolved = await this.resolveSteamId(steamId);
    return this.fetchAndCacheLibrary(resolved);
  }

  async refreshLibrary(steamId) {
    const resolved = await this.resolveSteamId(steamId);
    return this.fetchAndCacheLibrary(resolved, true);
  }
}

module.exports = new LibraryService();
