const Library = require('../models/Library');

class RecommendService {
  async getRecommendations(steamId, count = 10, genreFilter = null) {
    const library = await Library.findOne({ steamId }).sort({ fetchedAt: -1 });
    if (!library || !library.games.length) {
      return { recommendations: [], algorithm: 'genre-affinity-v1', message: 'No library data found' };
    }

    const games = library.games;
    const played = games.filter(g => g.playtimeForever > 0);
    const unplayed = games.filter(g => g.playtimeForever === 0);

    const genreAffinity = this._computeGenreAffinity(played, games);
    const scored = this._scoreGames(unplayed, genreAffinity, genreFilter);
    scored.sort((a, b) => b.matchScore - a.matchScore);

    const top = scored.slice(0, count);
    const recommendations = top.map(game => ({
      appId: game.appId,
      name: game.name,
      headerImage: game.headerImage,
      genres: game.genres,
      matchScore: game.matchScore,
      reason: this._generateReason(game, genreAffinity),
      status: 'pending',
      recommendedAt: new Date()
    }));

    return {
      steamId,
      playerName: library.playerName,
      recommendations,
      algorithm: 'genre-affinity-v1',
      generatedAt: new Date()
    };
  }

  _computeGenreAffinity(played, allGames) {
    const affinity = {};
    let totalMinutes = 0;

    for (const game of played) {
      totalMinutes += game.playtimeForever;
      const genres = game.genres.length ? game.genres : ['Unknown'];
      for (const genre of genres) {
        affinity[genre] = (affinity[genre] || 0) + game.playtimeForever;
      }
    }

    if (totalMinutes > 0) {
      for (const genre in affinity) {
        affinity[genre] = affinity[genre] / totalMinutes;
      }
    }

    return affinity;
  }

  _scoreGames(unplayed, genreAffinity, genreFilter) {
    return unplayed.map(game => {
      const genres = game.genres.length ? game.genres : ['Unknown'];
      let genreScore = 0;
      for (const genre of genres) {
        genreScore += (genreAffinity[genre] || 0);
      }
      genreScore = genres.length ? genreScore / genres.length : 0;

      if (genreFilter && !genres.some(g => g.toLowerCase() === genreFilter.toLowerCase())) {
        return { ...game, matchScore: 0 };
      }

      const matchScore = Math.min(Math.round(genreScore * 100 * 2.5 + Math.random() * 10), 99);
      return { ...game, matchScore };
    });
  }

  _generateReason(game, genreAffinity) {
    const genres = game.genres.length ? game.genres : ['Unknown'];
    const topGenre = genres.reduce((best, g) =>
      (genreAffinity[g] || 0) > (genreAffinity[best] || 0) ? g : best, genres[0]);
    const affinityPct = Math.round((genreAffinity[topGenre] || 0) * 100);

    if (affinityPct > 20) {
      return `You spend ${affinityPct}% of your playtime in ${topGenre} games. You might enjoy this title.`;
    }
    return `This ${genres.join('/')} game matches your gaming taste profile.`;
  }

  async getStats(steamId) {
    const library = await Library.findOne({ steamId }).sort({ fetchedAt: -1 });
    if (!library) return null;

    const games = library.games;
    const totalMinutes = games.reduce((s, g) => s + g.playtimeForever, 0);
    const genreTotals = {};
    const topGames = [];

    for (const game of games) {
      if (game.playtimeForever > 0) {
        topGames.push({ name: game.name, playtime: game.playtimeForever, appId: game.appId });
      }
      const genres = game.genres.length ? game.genres : ['Unknown'];
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
