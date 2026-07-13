const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  appId: { type: Number, required: true },
  name: { type: String, required: true },
  playtimeForever: { type: Number, default: 0 },
  playtime2Weeks: { type: Number, default: 0 },
  imgIconUrl: { type: String, default: '' },
  headerImage: { type: String, default: '' },
  genres: [{ type: String }],
  tags: [{ type: String }]
}, { _id: false });

const LibrarySchema = new mongoose.Schema({
  steamId: { type: String, required: true, index: true },
  playerName: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  games: [GameSchema],
  totalGames: { type: Number, default: 0 },
  totalPlaytimeMinutes: { type: Number, default: 0 },
  fetchedAt: { type: Date, default: Date.now }
}, { timestamps: true });

LibrarySchema.index({ steamId: 1, fetchedAt: -1 });

module.exports = mongoose.model('Library', LibrarySchema);
