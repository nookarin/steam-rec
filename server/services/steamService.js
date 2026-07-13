const SteamService = require('../config/steam');
const Library = require('../models/Library');
const PlayerProfile = require('../models/PlayerProfile');
const GameDetails = require('../models/GameDetails');

class LibraryService {
  constructor() {
    this.steam = new SteamService(process.env.STEAM_API_KEY);
    this.CACHE_TTL_MS = 60 * 60 * 1000;
    this.GENRE_BATCH_SIZE = 10;
    this.GENRE_DELAY_MS = 500;
    this._genrePending = new Set();
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

    const baseGames = (gamesResponse.games || []).map(g => ({
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

    const games = baseGames;

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

    if (!this._genrePending.has(steamId)) {
      this._fetchGenresInBackground(steamId, games);
    }

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

  async fetchGenresForGames(games) {
    const appIds = games.map(g => g.appId);
    const cached = await GameDetails.find({ appId: { $in: appIds } });
    const cachedMap = new Map(cached.map(d => [d.appId, d]));

    const toFetch = appIds.filter(id => !cachedMap.has(id));
    console.log(`[SteamService] Genres: ${cachedMap.size} cached, ${toFetch.length} to fetch`);

    for (let i = 0; i < toFetch.length; i += this.GENRE_BATCH_SIZE) {
      const batch = toFetch.slice(i, i + this.GENRE_BATCH_SIZE);
      await Promise.all(batch.map(async (appId) => {
        try {
          const details = await this.steam.getAppDetails(appId);
          if (details) {
            const genres = (details.genres || []).map(g => g.description);
            const tags = Object.values(details.categories || {}).map(c => c.description);
            await GameDetails.findOneAndUpdate(
              { appId },
              { appId, name: details.name || '', genres, tags, type: details.type || '', fetchedAt: new Date() },
              { upsert: true, new: true }
            );
            cachedMap.set(appId, { appId, genres, tags });
          }
        } catch (err) {
          console.error(`[SteamService] Failed to fetch details for appId ${appId}: ${err.message}`);
        }
      }));

      if (i + this.GENRE_BATCH_SIZE < toFetch.length) {
        await new Promise(r => setTimeout(r, this.GENRE_DELAY_MS));
      }
    }

    return games.map(game => {
      const details = cachedMap.get(game.appId);
      return {
        ...game,
        genres: details?.genres || game.genres || [],
        tags: details?.tags || game.tags || []
      };
    });
  }

  async _fetchGenresInBackground(steamId, games) {
    this._genrePending.add(steamId);
    console.log(`[SteamService] Background genre fetch started for ${steamId} (${games.length} games)`);

    try {
      const appIds = games.map(g => g.appId);
      const cached = await GameDetails.find({ appId: { $in: appIds } });
      const cachedMap = new Map(cached.map(d => [d.appId, d]));

      const toFetch = appIds.filter(id => !cachedMap.has(id));
      if (toFetch.length === 0) {
        console.log(`[SteamService] All genres already cached for ${steamId}`);
        return;
      }

      console.log(`[SteamService] Background: ${toFetch.length} genres to fetch for ${steamId}`);

      for (let i = 0; i < toFetch.length; i += this.GENRE_BATCH_SIZE) {
        const batch = toFetch.slice(i, i + this.GENRE_BATCH_SIZE);
        await Promise.all(batch.map(async (appId) => {
          try {
            const details = await this.steam.getAppDetails(appId);
            if (details) {
              const genres = (details.genres || []).map(g => g.description);
              const tags = Object.values(details.categories || {}).map(c => c.description);
              await GameDetails.findOneAndUpdate(
                { appId },
                { appId, name: details.name || '', genres, tags, type: details.type || '', fetchedAt: new Date() },
                { upsert: true, new: true }
              );
            }
          } catch (err) {
            console.error(`[SteamService] Background genre fetch failed for appId ${appId}: ${err.message}`);
          }
        }));

        if (i + this.GENRE_BATCH_SIZE < toFetch.length) {
          await new Promise(r => setTimeout(r, this.GENRE_DELAY_MS));
        }
      }

      // Update library with newly fetched genres
      const updatedCached = await GameDetails.find({ appId: { $in: appIds } });
      const updatedMap = new Map(updatedCached.map(d => [d.appId, d]));
      const updatedGames = games.map(game => {
        const details = updatedMap.get(game.appId);
        return {
          ...game,
          genres: details?.genres || game.genres || [],
          tags: details?.tags || game.tags || []
        };
      });

      await Library.findOneAndUpdate(
        { steamId },
        { $set: { games: updatedGames } }
      );

      console.log(`[SteamService] Background genre fetch completed for ${steamId}: ${toFetch.length} games updated`);
    } catch (err) {
      console.error(`[SteamService] Background genre fetch error for ${steamId}: ${err.message}`);
    } finally {
      this._genrePending.delete(steamId);
    }
  }
}

module.exports = new LibraryService();
