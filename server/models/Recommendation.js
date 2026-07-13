const mongoose = require('mongoose');

const RecommendedGameSchema = new mongoose.Schema({
  appId: { type: Number, required: true },
  name: { type: String, required: true },
  headerImage: { type: String, default: '' },
  genres: [{ type: String }],
  matchScore: { type: Number, default: 0 },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'played', 'skipped'], default: 'pending' },
  recommendedAt: { type: Date, default: Date.now }
}, { _id: false });

const RecommendationSchema = new mongoose.Schema({
  steamId: { type: String, required: true, index: true },
  recommendedGames: [RecommendedGameSchema],
  algorithmVersion: { type: String, default: 'genre-affinity-v1' },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

RecommendationSchema.index({ steamId: 1, generatedAt: -1 });

module.exports = mongoose.model('Recommendation', RecommendationSchema);
