import { formatHours } from '../utils/format.js';

export function createGameCard(game) {
  const card = document.createElement('div');
  card.className = 'card game-card';
  card.dataset.appId = game.appId;

  const playtimeTag = game.playtimeForever > 0
    ? `<span class="tag tag--playtime">${formatHours(game.playtimeForever)}</span>`
    : '<span class="tag tag--status">Unplayed</span>';

  const genres = (game.genres || []).slice(0, 2).map(g =>
    `<span class="tag tag--genre">${g}</span>`
  ).join('');

  card.innerHTML = `
    <img class="card__image" src="${game.headerImage}" alt="${game.name}" loading="lazy"
         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 460 215%22><rect fill=%22%232a475e%22 width=%22460%22 height=%22215%22/><text x=%2250%%22 y=%2250%%22 fill=%22%2366c0f4%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22>No Image</text></svg>'">
    <div class="card__body">
      <div class="card__title" title="${game.name}">${game.name}</div>
      <div class="card__meta">
        ${playtimeTag}
        ${genres}
      </div>
    </div>
  `;

  return card;
}

export function renderGameGrid(container, games, emptyMessage = 'No games found') {
  container.innerHTML = '';
  if (!games || games.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🎮</div>
        <div class="empty-state__title">${emptyMessage}</div>
      </div>
    `;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'grid grid--auto stagger-children';

  games.forEach(game => {
    grid.appendChild(createGameCard(game));
  });

  container.appendChild(grid);
}
