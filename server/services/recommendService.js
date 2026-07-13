const Library = require('../models/Library');

class RecommendService {
  async getRecommendations(steamId, count = 10, genreFilter = null) {
    const library = await Library.findOne({ steamId }).sort({ fetchedAt: -1 });
    console.log(`[Recommend] Library found: ${library ? 'yes' : 'no'}, games: ${library?.games?.length || 0}`);
    if (!library || !library.games || !library.games.length) {
      return { recommendations: [], algorithm: 'genre-affinity-v1', message: 'No library data found' };
    }

    const games = library.games;

    const unplayed = games
      .filter(g => g.playtimeForever === 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    const lowPlaytime = games
      .filter(g => g.playtimeForever > 0 && g.playtimeForever < 60)
      .sort((a, b) => a.playtimeForever - b.playtimeForever);

    const unplayedRecs = unplayed
      .slice(0, count)
      .map(game => ({
        appId: game.appId,
        name: game.name,
        headerImage: game.headerImage,
        genres: game.genres,
        matchScore: 95,
        reason: 'You own this game but haven\'t played it yet.',
        status: 'pending',
        recommendedAt: new Date(),
        type: 'suggested'
      }));

    const lowPlaytimeRecs = lowPlaytime
      .slice(0, Math.max(0, count - unplayedRecs.length))
      .map(game => ({
        appId: game.appId,
        name: game.name,
        headerImage: game.headerImage,
        genres: game.genres,
        matchScore: Math.max(90 - Math.floor(game.playtimeForever / 5), 50),
        reason: `You've only played for ${this._formatHours(game.playtimeForever)}. Give it another try!`,
        status: 'pending',
        recommendedAt: new Date(),
        type: 'suggested'
      }));

    const recommendations = [...unplayedRecs, ...lowPlaytimeRecs];
    console.log(`[Recommend] Total: ${recommendations.length} (unplayed: ${unplayedRecs.length}, low-playtime: ${lowPlaytimeRecs.length})`);

    return {
      steamId,
      playerName: library.playerName,
      recommendations,
      algorithm: 'least-playtime-v1',
      generatedAt: new Date()
    };
  }

  _formatHours(minutes) {
    const hrs = Math.round(minutes / 60);
    return `${hrs}h`;
  }

  async getStats(steamId) {
    const library = await Library.findOne({ steamId }).sort({ fetchedAt: -1 });
    if (!library || !library.games || !library.games.length) return null;

    const games = library.games;
    const totalMinutes = games.reduce((s, g) => s + g.playtimeForever, 0);
    const genreTotals = {};
    const topGames = [];

    for (const game of games) {
      if (game.playtimeForever > 0) {
        topGames.push({ name: game.name, playtime: game.playtimeForever, appId: game.appId });
      }
      const genres = (game.genres && game.genres.length) ? game.genres : ['Unknown'];
      for (const genre of genres) {
        genreTotals[genre] = (genreTotals[genre] || 0) + game.playtimeForever;
      }
    }

    topGames.sort((a, b) => b.playtime - a.playtime);

    const genres = Object.entries(genreTotals)
      .map(([name, minutes]) => ({ name, minutes, percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0 }))
      .sort((a, b) => b.minutes - a.minutes);

    return {
      totalGames: games.length,
      playedGames: games.filter(g => g.playtimeForever > 0).length,
      unplayedGames: games.filter(g => g.playtimeForever === 0).length,
      totalHours: Math.round(totalMinutes / 60),
      avgHoursPerGame: games.length > 0 ? Math.round(totalMinutes / 60 / games.length * 10) / 10 : 0,
      genres,
      topGames: topGames.slice(0, 10)
    };
  }
}

module.exports = new RecommendService();
