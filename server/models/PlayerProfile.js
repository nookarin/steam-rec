const mongoose = require('mongoose');

const PlayerProfileSchema = new mongoose.Schema({
  steamId: { type: String, required: true, unique: true },
  playerName: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  profileUrl: { type: String, default: '' },
  lastSyncedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PlayerProfile', PlayerProfileSchema);
