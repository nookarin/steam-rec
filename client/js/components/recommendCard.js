export function createRecommendCard(recommendation) {
  const card = document.createElement('div');
  card.className = 'card recommend-card';
  card.dataset.appId = recommendation.appId;

  const genres = (recommendation.genres || []).slice(0, 3).map(g =>
    `<span class="tag tag--genre">${g}</span>`
  ).join('');

  card.innerHTML = `
    <div class="tooltip-wrapper">
      <img class="card__image" src="${recommendation.headerImage}" alt="${recommendation.name}" loading="lazy"
           onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 460 215%22><rect fill=%22%232a475e%22 width=%22460%22 height=%22215%22/><text x=%2250%%22 y=%2250%%22 fill=%22%2366c0f4%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22>No Image</text></svg>'">
      <span class="tag tag--match" style="position:absolute;top:8px;right:8px;">
        ${recommendation.matchScore}% Match
      </span>
    </div>
    <div class="card__body">
      <div class="card__title" title="${recommendation.name}">${recommendation.name}</div>
      <div class="card__meta">${genres}</div>
      <div class="score-bar">
        <div class="score-bar__fill" style="width:${recommendation.matchScore}%"></div>
      </div>
      <div class="recommend-card__reason">${recommendation.reason}</div>
      <div class="recommend-card__actions">
        <button class="btn btn--sm btn--primary" data-action="played" data-id="${recommendation.appId}">
          Played It
        </button>
        <button class="btn btn--sm btn--secondary" data-action="skip" data-id="${recommendation.appId}">
          Skip
        </button>
      </div>
    </div>
  `;

  return card;
}

export function renderRecommendations(container, recommendations, emptyMessage = 'No recommendations yet') {
  container.innerHTML = '';

  if (!recommendations || recommendations.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">💡</div>
        <div class="empty-state__title">${emptyMessage}</div>
      </div>
    `;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'grid grid--auto stagger-children';

  recommendations.forEach(rec => {
    grid.appendChild(createRecommendCard(rec));
  });

  container.appendChild(grid);

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const appId = btn.dataset.id;
    const card = btn.closest('.recommend-card');
    if (action === 'played') {
      card.style.opacity = '0.5';
      card.querySelector('.recommend-card__actions').innerHTML = '<span class="tag tag--playtime">Played!</span>';
    } else if (action === 'skip') {
      card.style.opacity = '0.3';
      card.querySelector('.recommend-card__actions').innerHTML = '<span class="tag tag--status">Skipped</span>';
    }
  });
}
