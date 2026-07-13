const express = require('express');
const router = express.Router();
const achievementService = require('../services/achievementService');

router.get('/:steamId', async (req, res, next) => {
  try {
    const result = await achievementService.fetchAllAchievements(req.params.steamId);
    res.json({ achievements: result });
  } catch (err) {
    next(err);
  }
});

router.get('/:steamId/summary', async (req, res, next) => {
  try {
    const summary = await achievementService.getAchievementSummary(req.params.steamId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

router.get('/:steamId/:appId', async (req, res, next) => {
  try {
    const appId = parseInt(req.params.appId);
    const achievement = await achievementService.fetchAchievements(req.params.steamId, appId);
    if (!achievement) {
      return res.status(404).json({ error: { message: 'No achievements found for this game' } });
    }
    res.json(achievement);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
