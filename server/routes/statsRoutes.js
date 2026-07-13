const express = require('express');
const router = express.Router();
const recommendService = require('../services/recommendService');

router.get('/:steamId', async (req, res, next) => {
  try {
    const stats = await recommendService.getStats(req.params.steamId);
    if (!stats) {
      return res.status(404).json({ error: { message: 'No library data found for this Steam ID' } });
    }
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
