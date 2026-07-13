import { formatHours } from '../utils/format.js';

const GENRE_COLORS = [
  '#66c0f4', '#f44242', '#4caf50', '#ff9800', '#9c27b0',
  '#00bcd4', '#e91e63', '#8bc34a', '#ff5722', '#607d8b',
  '#3f51b5', '#cddc39', '#009688', '#ff6f00', '#795548'
];

function getGenreColor(index) {
  return GENRE_COLORS[index % GENRE_COLORS.length];
}

export function renderStatsDashboard(container, stats) {
  if (!container) return;
  if (!stats) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📊</div>
        <div class="empty-state__title">No stats available</div>
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  const summaryGrid = document.createElement('div');
  summaryGrid.className = 'grid grid--4 mb-xl';
  summaryGrid.innerHTML = `
    <div class="stat-card animate-fade-in">
      <div class="stat-card__value">${stats.totalGames}</div>
      <div class="stat-card__label">Total Games</div>
    </div>
    <div class="stat-card animate-fade-in">
      <div class="stat-card__value">${stats.playedGames}</div>
      <div class="stat-card__label">Played</div>
    </div>
    <div class="stat-card animate-fade-in">
      <div class="stat-card__value">${stats.totalHours}h</div>
      <div class="stat-card__label">Total Playtime</div>
    </div>
    <div class="stat-card animate-fade-in">
      <div class="stat-card__value">${stats.avgHoursPerGame}h</div>
      <div class="stat-card__label">Avg per Game</div>
    </div>
  `;
  container.appendChild(summaryGrid);

  const chartsGrid = document.createElement('div');
  chartsGrid.className = 'grid grid--2';
  chartsGrid.style.gap = 'var(--space-xl)';

  const genreSection = document.createElement('div');
  genreSection.innerHTML = `
    <h3 class="section__title mb-md">Genre Distribution</h3>
    <div class="donut-chart" id="genre-donut"></div>
    <div class="legend" id="genre-legend"></div>
  `;
  chartsGrid.appendChild(genreSection);

  const topGamesSection = document.createElement('div');
  topGamesSection.innerHTML = `
    <h3 class="section__title mb-md">Most Played Games</h3>
    <div class="bar-chart" id="top-games-chart"></div>
  `;
  chartsGrid.appendChild(topGamesSection);

  container.appendChild(chartsGrid);

  renderDonutChart(stats.genres);
  renderBarChart(stats.topGames);
}

function renderDonutChart(genres) {
  const container = document.getElementById('genre-donut');
  const legend = document.getElementById('genre-legend');
  if (!container || !genres || genres.length === 0) return;

  const topGenres = genres.slice(0, 8);
  let cumulativePercent = 0;
  const gradientParts = [];

  topGenres.forEach((genre, i) => {
    const start = cumulativePercent;
    cumulativePercent += genre.percentage;
    gradientParts.push(`${getGenreColor(i)} ${start}% ${cumulativePercent}%`);
  });

  if (cumulativePercent < 100) {
    gradientParts.push(`#2a475e ${cumulativePercent}% 100%`);
  }

  container.innerHTML = `
    <div class="donut-chart__ring" style="background: conic-gradient(${gradientParts.join(', ')})"></div>
    <div class="donut-chart__center">
      <div class="donut-chart__center-value">${genres.length}</div>
      <div class="donut-chart__center-label">Genres</div>
    </div>
  `;

  legend.innerHTML = topGenres.map((genre, i) => `
    <div class="legend__item">
      <div class="legend__color" style="background:${getGenreColor(i)}"></div>
      <span>${genre.name} (${genre.percentage}%)</span>
    </div>
  `).join('');
}

function renderBarChart(topGames) {
  const container = document.getElementById('top-games-chart');
  if (!container || !topGames || topGames.length === 0) {
    if (container) container.innerHTML = '<div class="text-muted text-center">No playtime data</div>';
    return;
  }

  const maxMinutes = Math.max(...topGames.map(g => g.playtime));

  container.innerHTML = topGames.map(game => {
    const widthPct = maxMinutes > 0 ? (game.playtime / maxMinutes) * 100 : 0;
    return `
      <div class="bar-chart__item">
        <div class="bar-chart__label" title="${game.name}">${game.name}</div>
        <div class="bar-chart__track">
          <div class="bar-chart__fill" style="width:${widthPct}%">${formatHours(game.playtime)}</div>
        </div>
      </div>
    `;
  }).join('');
}
