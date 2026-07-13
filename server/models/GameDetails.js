const mongoose = require('mongoose');

const GameDetailsSchema = new mongoose.Schema({
  appId: { type: Number, required: true, unique: true },
  name: { type: String, default: '' },
  genres: [{ type: String }],
  tags: [{ type: String }],
  type: { type: String, default: '' },
  fetchedAt: { type: Date, default: Date.now }
});

GameDetailsSchema.index({ appId: 1 });

module.exports = mongoose.model('GameDetails', GameDetailsSchema);
