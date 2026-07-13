const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  steamId: { type: String, required: true },
  appId: { type: Number, required: true },
  achievements: [{
    apiName: { type: String },
    name: { type: String },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    iconGray: { type: String, default: '' },
    achieved: { type: Boolean, default: false },
    unlockTime: { type: Date, default: null }
  }],
  totalAchievements: { type: Number, default: 0 },
  earnedCount: { type: Number, default: 0 },
  fetchedAt: { type: Date, default: Date.now }
}, { timestamps: true });

AchievementSchema.index({ steamId: 1, appId: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
