const express = require('express');
const router = express.Router();
const recommendService = require('../services/recommendService');

router.get('/:steamId', async (req, res, next) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const genre = req.query.genre || null;
    const result = await recommendService.getRecommendations(req.params.steamId, count, genre);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
