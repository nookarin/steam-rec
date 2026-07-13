const express = require('express');
const router = express.Router();
const snapshotService = require('../services/snapshotService');

router.get('/:steamId', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const snapshots = await snapshotService.getHistory(req.params.steamId, limit);
    res.json({ snapshots });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
