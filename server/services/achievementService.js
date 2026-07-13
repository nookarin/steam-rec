const SteamService = require('../config/steam');
const Achievement = require('../models/Achievement');
const Library = require('../models/Library');

class AchievementService {
  constructor() {
    this.steam = new SteamService(process.env.STEAM_API_KEY);
    this.CACHE_TTL_MS = 60 * 60 * 1000;
    this.PARALLEL_LIMIT = 5;
  }

  async fetchAchievements(steamId, appId, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = await Achievement.findOne({ steamId, appId });
      if (cached && (Date.now() - cached.fetchedAt.getTime()) < this.CACHE_TTL_MS) {
        return cached;
      }
    }

    const achievements = await this.steam.getPlayerAchievements(steamId, appId);
    if (!achievements) return null;

    const earned = achievements.filter(a => a.achieved);

    const saved = await Achievement.findOneAndUpdate(
      { steamId, appId },
      {
        steamId,
        appId,
        achievements: achievements.map(a => ({
          apiName: a.apiname || '',
          name: a.name || '',
          description: a.description || '',
          icon: a.icon || '',
          iconGray: a.icongray || '',
          achieved: a.achieved || false,
          unlockTime: a.unlocktime ? new Date(a.unlocktime * 1000) : null
        })),
        totalAchievements: achievements.length,
        earnedCount: earned.length,
        fetchedAt: new Date()
      },
      { new: true, upsert: true }
    );

    return saved;
  }

  async fetchAllAchievements(steamId, forceRefresh = false, limit = 15) {
    const library = await Library.findOne({ steamId }).sort({ fetchedAt: -1 });
    if (!library) return [];

    const playedGames = library.games
      .filter(g => g.playtimeForever > 0)
      .sort((a, b) => b.playtimeForever - a.playtimeForever)
      .slice(0, limit);

    const results = [];
    for (let i = 0; i < playedGames.length; i += this.PARALLEL_LIMIT) {
      const batch = playedGames.slice(i, i + this.PARALLEL_LIMIT);
      const batchResults = await Promise.allSettled(
        batch.map(game => this.fetchAchievements(steamId, game.appId, forceRefresh))
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const game = batch[j];
        if (result.status === 'fulfilled' && result.value) {
          const achievement = result.value;
          results.push({
            appId: game.appId,
            gameName: game.name,
            headerImage: game.headerImage,
            totalAchievements: achievement.totalAchievements,
            earnedCount: achievement.earnedCount,
            percentage: achievement.totalAchievements > 0
              ? Math.round((achievement.earnedCount / achievement.totalAchievements) * 100)
              : 0,
            achievements: achievement.achievements
          });
        }
      }
    }

    return results;
  }

  async getAchievementSummary(steamId) {
    const allAchievements = await Achievement.find({ steamId });
    let totalEarned = 0;
    let totalPossible = 0;
    let gamesWithAchievements = 0;
    let completedGames = 0;

    for (const doc of allAchievements) {
      if (doc.totalAchievements > 0) {
        gamesWithAchievements++;
        totalEarned += doc.earnedCount;
        totalPossible += doc.totalAchievements;
        if (doc.earnedCount === doc.totalAchievements) {
          completedGames++;
        }
      }
    }

    return {
      totalEarned,
      totalPossible,
      overallPercentage: totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0,
      gamesTracked: gamesWithAchievements,
      completedGames
    };
  }
}

module.exports = new AchievementService();
