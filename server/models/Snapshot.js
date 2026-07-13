const mongoose = require('mongoose');

const SnapshotGameSchema = new mongoose.Schema({
  appId: { type: Number, required: true },
  name: { type: String, required: true },
  playtimeForever: { type: Number, default: 0 }
}, { _id: false });

const SnapshotDiffSchema = new mongoose.Schema({
  appId: { type: Number, required: true },
  name: { type: String, required: true }
}, { _id: false });

const SnapshotSchema = new mongoose.Schema({
  steamId: { type: String, required: true, index: true },
  snapshotDate: { type: Date, default: Date.now },
  games: [SnapshotGameSchema],
  addedGames: [SnapshotDiffSchema],
  removedGames: [SnapshotDiffSchema],
  previousSnapshotId: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true });

SnapshotSchema.index({ steamId: 1, snapshotDate: -1 });

module.exports = mongoose.model('Snapshot', SnapshotSchema);
