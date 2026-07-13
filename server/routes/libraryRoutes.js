const express = require('express');
const router = express.Router();
const libraryService = require('../services/steamService');
const snapshotService = require('../services/snapshotService');

router.get('/:steamId', async (req, res, next) => {
  try {
    const library = await libraryService.getLibrary(req.params.steamId);
    res.json({
      steamId: library.steamId,
      playerName: library.playerName,
      avatarUrl: library.avatarUrl,
      games: library.games,
      totalGames: library.totalGames,
      totalPlaytimeMinutes: library.totalPlaytimeMinutes,
      fetchedAt: library.fetchedAt
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:steamId/diff', async (req, res, next) => {
  try {
    const diff = await snapshotService.getLatestDiff(req.params.steamId);
    res.json(diff);
  } catch (err) {
    next(err);
  }
});

router.post('/:steamId/refresh', async (req, res, next) => {
  try {
    const result = await snapshotService.createSnapshot(req.params.steamId);
    res.json({
      message: 'Library refreshed and snapshot saved',
      addedCount: result.addedCount,
      removedCount: result.removedCount,
      snapshotId: result.snapshot._id
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
