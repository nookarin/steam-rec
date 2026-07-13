const libraryService = require('./steamService');
const Library = require('../models/Library');

class SnapshotService {
  async createSnapshot(steamId) {
    const library = await libraryService.fetchAndCacheLibrary(steamId, true);
    const previousSnapshot = await require('../models/Snapshot')
      .findOne({ steamId })
      .sort({ snapshotDate: -1 });

    const currentGameIds = new Set(library.games.map(g => g.appId));
    const previousGameIds = previousSnapshot
      ? new Set(previousSnapshot.games.map(g => g.appId))
      : new Set();

    const addedGames = library.games
      .filter(g => !previousGameIds.has(g.appId))
      .map(g => ({ appId: g.appId, name: g.name }));

    const removedGames = previousSnapshot
      ? previousSnapshot.games
          .filter(g => !currentGameIds.has(g.appId))
          .map(g => ({ appId: g.appId, name: g.name }))
      : [];

    const Snapshot = require('../models/Snapshot');
    const snapshot = await Snapshot.create({
      steamId,
      snapshotDate: new Date(),
      games: library.games.map(g => ({
        appId: g.appId,
        name: g.name,
        playtimeForever: g.playtimeForever
      })),
      addedGames,
      removedGames,
      previousSnapshotId: previousSnapshot?._id || null
    });

    return { snapshot, addedCount: addedGames.length, removedCount: removedGames.length };
  }

  async getHistory(steamId, limit = 5) {
    const Snapshot = require('../models/Snapshot');
    return Snapshot.find({ steamId })
      .sort({ snapshotDate: -1 })
      .limit(limit);
  }

  async getLatestDiff(steamId) {
    const Snapshot = require('../models/Snapshot');
    const latest = await Snapshot.findOne({ steamId }).sort({ snapshotDate: -1 });
    return latest || { addedGames: [], removedGames: [], snapshotDate: null };
  }
}

module.exports = new SnapshotService();
