const SteamService = require('../config/steam');
const Achievement = require('../models/Achievement');
const Library = require('../models/Library');

class AchievementService {
  constructor() {
    this.steam = new SteamService(process.env.STEAM_API_KEY);
    this.CACHE_TTL_MS = 60 * 60 * 1000;
  }

  async fetchAchievements(steamId, appId, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = await Achievement.findOne({ steamId, appId });
      if (cached && (Date.now() - cached.fetchedAt.getTime()) < this.CACHE_TTL_MS) {
        return cached;
      }
    }

    console.log(`[Achievement] Fetching achievements for steamId=${steamId}, appId=${appId}`);
    const achievements = await this.steam.getPlayerAchievements(steamId, appId);

    if (!achievements) {
      console.log(`[Achievement] No achievements found for appId=${appId}`);
      return null;
    }

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

    console.log(`[Achievement] Saved: ${earned.length}/${achievements.length} for appId=${appId}`);
    return saved;
  }

  async fetchAllAchievements(steamId, forceRefresh = false) {
    const library = await Library.findOne({ steamId }).sort({ fetchedAt: -1 });
    if (!library) return [];

    const playedGames = library.games
      .filter(g => g.playtimeForever > 0)
      .sort((a, b) => b.playtimeForever - a.playtimeForever)
      .slice(0, 30);

    const results = [];
    for (const game of playedGames) {
      try {
        const achievement = await this.fetchAchievements(steamId, game.appId, forceRefresh);
        if (achievement) {
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
      } catch (err) {
        console.log(`[Achievement] Failed for appId=${game.appId}: ${err.message}`);
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
