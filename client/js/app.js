import { getState, setState, resetState, subscribe } from './state.js';
import { fetchLibrary, fetchRecommendations, fetchStats, fetchHistory, refreshLibrary, fetchAchievements, fetchAchievementSummary } from './api.js';
import { getSteamId, setSteamId, addRecentSearch, getRecentSearches } from './utils/storage.js';
import { parseSteamInput, isValidSteamInput } from './utils/validate.js';
import { renderGameGrid } from './components/gameCard.js';
import { renderStatsDashboard } from './components/statsChart.js';
import { renderRecommendations } from './components/recommendCard.js';
import { initSearchBar, filterGames } from './components/searchBar.js';
import { initThemeToggle } from './components/themeToggle.js';
import { registerRoute, initRouter, navigate } from './router.js';
import { formatRelativeTime } from './utils/format.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showLoading(container) {
  container.innerHTML = `
    <div class="flex flex--center" style="padding:var(--space-3xl) 0;">
      <div class="spinner spinner--lg"></div>
    </div>
  `;
}

function showError(container, message) {
  container.innerHTML = `
    <div class="error-message animate-fade-in">
      <strong>Error:</strong> ${message}
    </div>
  `;
}

async function loadUserData(rawInput, forceRefresh = false) {
  const heroSection = $('#hero-section');
  const appContent = $('#app-content');

  const parsed = parseSteamInput(rawInput);
  if (!parsed) {
    showError(appContent, 'Invalid input. Enter a Steam ID, vanity name, or profile URL.');
    heroSection.classList.remove('hidden');
    return;
  }

  const steamId = parsed.value;

  setState({ isLoading: true, error: null, steamId });
  heroSection.classList.add('hidden');
  appContent.classList.remove('hidden');
  showLoading(appContent);

  try {
    if (forceRefresh) {
      await refreshLibrary(steamId);
    }

    const library = await fetchLibrary(steamId);
    const resolvedId = library.steamId;

    setState({
      playerName: library.playerName,
      avatarUrl: library.avatarUrl,
      games: library.games || [],
      recommendations: [],
      stats: null,
      history: [],
      isLoading: false
    });

    addRecentSearch(rawInput);
    setSteamId(rawInput);
    navigate('library');

    fetchRecommendations(resolvedId, 15).then((recs) => {
      setState({ recommendations: recs?.recommendations || [] });
      renderRecommendations($('#recs-grid'), getState().recommendations);
    }).catch((err) => {
      console.error('[SteamRec] Recommendations failed:', err);
      const container = $('#recs-grid');
      if (container) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">💡</div><div class="empty-state__title">No recommendations available</div></div>';
      }
    });

    fetchStats(resolvedId).then((stats) => {
      setState({ stats: stats || null });
    }).catch((err) => {
      console.error('[SteamRec] Stats failed:', err);
    });

    fetchHistory(resolvedId, 5).then((history) => {
      setState({ history: history?.snapshots || [] });
    }).catch(() => {});

  } catch (err) {
    setState({ isLoading: false, error: err.message });
    showError(appContent, err.message);
    heroSection.classList.remove('hidden');
  }
}

function renderHome() {
  const heroSection = $('#hero-section');
  const appContent = $('#app-content');
  heroSection.classList.remove('hidden');
  appContent.classList.add('hidden');
}

function renderLibrary() {
  const state = getState();
  const appContent = $('#app-content');
  if (!state.games || !state.games.length) { renderHome(); return; }

  const heroSection = $('#hero-section');
  heroSection.classList.add('hidden');
  appContent.classList.remove('hidden');

  const hasRecs = state.recommendations && state.recommendations.length > 0;

  appContent.innerHTML = `
    <section id="recs-section">
      <h2 class="section__title">💡 Recommendations</h2>
      <div id="recs-grid">
        ${hasRecs ? '' : `
          <div class="flex flex--center" style="padding:var(--space-xl) 0;">
            <div class="spinner"></div>
            <span class="text-muted ml-sm">Loading recommendations...</span>
          </div>
        `}
      </div>
    </section>

    <section id="library-section">
      <div class="flex flex--between mb-md">
        <h2 class="section__title">
          🎮 Library
          <span class="tag tag--status">${state.games.length} games</span>
        </h2>
        <div class="flex gap-sm">
          <button class="btn btn--secondary btn--sm" id="refresh-btn">↻ Refresh</button>
        </div>
      </div>
      <div id="search-bar-container" class="mb-md">
        <div class="input-group" style="max-width:400px;">
          <input type="text" id="search-input" class="input" placeholder="Search games..." aria-label="Search games">
          <select id="genre-filter" class="input" style="max-width:180px;" aria-label="Filter by genre">
            <option value="">All Genres</option>
          </select>
        </div>
      </div>
      <div id="game-grid"></div>
    </section>
  `;

  const genreSelect = $('#genre-filter');
  const allGenres = [...new Set(state.games.flatMap(g => g.genres || []))].sort();
  allGenres.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    genreSelect.appendChild(opt);
  });

  const gameGrid = $('#game-grid');
  renderGameGrid(gameGrid, state.games.slice(0, 10));

  if (hasRecs) {
    renderRecommendations($('#recs-grid'), state.recommendations);
  }

  initSearchBar($('#search-bar-container'), (query) => {
    const genre = genreSelect.value;
    const filtered = filterGames(state.games, query, genre);
    renderGameGrid(gameGrid, filtered.slice(0, 10), 'No games match your search');
  });

  genreSelect.addEventListener('change', () => {
    const query = $('#search-input').value.trim().toLowerCase();
    const filtered = filterGames(state.games, query, genreSelect.value);
    renderGameGrid(gameGrid, filtered.slice(0, 10), 'No games match this filter');
  });

  $('#refresh-btn').addEventListener('click', () => loadUserData(state.steamId, true));
}

function renderStats() {
  const state = getState();
  const appContent = $('#app-content');
  const heroSection = $('#hero-section');
  if (!state.stats) {
    if (!state.steamId) {
      renderHome();
      return;
    }
    if (!state.games || !state.games.length) {
      loadUserData(state.steamId);
      return;
    }
    heroSection.classList.add('hidden');
    appContent.classList.remove('hidden');
    appContent.innerHTML = `
      <h2 class="section__title mb-lg">📊 Statistics</h2>
      <div class="empty-state">
        <div class="empty-state__icon">📊</div>
        <div class="empty-state__title">No stats available</div>
        <p class="text-muted">Stats could not be loaded for your library.</p>
      </div>
    `;
    return;
  }

  heroSection.classList.add('hidden');
  appContent.classList.remove('hidden');

  appContent.innerHTML = `
    <h2 class="section__title mb-lg">📊 Statistics</h2>
    <div id="stats-dashboard"></div>
  `;

  renderStatsDashboard($('#stats-dashboard'), state.stats);
}

function renderHistoryView() {
  const state = getState();
  const appContent = $('#app-content');
  const heroSection = $('#hero-section');
  if (!state.steamId) { renderHome(); return; }

  heroSection.classList.add('hidden');
  appContent.classList.remove('hidden');

  if (!state.history || state.history.length === 0) {
    appContent.innerHTML = `
      <h2 class="section__title mb-lg">📜 History</h2>
      <div class="empty-state">
        <div class="empty-state__icon">📜</div>
        <div class="empty-state__title">No history yet</div>
        <p class="text-muted">Refresh your library to create a snapshot.</p>
      </div>
    `;
    return;
  }

  appContent.innerHTML = `
    <h2 class="section__title mb-lg">📜 Library History</h2>
    <div id="history-list"></div>
  `;

  const list = $('#history-list');
  if (!list) return;
  state.history.forEach((snap, i) => {
    const games = snap.games || [];
    const added = snap.addedGames || [];
    const removed = snap.removedGames || [];
    const item = document.createElement('div');
    item.className = 'card mb-md animate-fade-in';
    item.style.animationDelay = `${i * 0.05}s`;
    item.innerHTML = `
      <div class="card__body">
        <div class="flex flex--between mb-sm">
          <strong class="text-heading">${formatRelativeTime(snap.snapshotDate)}</strong>
          <span class="tag tag--status">${games.length} games</span>
        </div>
        <div class="flex gap-md" style="flex-wrap:wrap;">
          ${added.length > 0 ? `
            <div>
              <span class="tag tag--playtime">+${added.length} added</span>
              <div class="text-muted mt-xs" style="font-size:var(--font-size-xs);">
                ${added.slice(0, 3).map(g => g.name).join(', ')}${added.length > 3 ? '...' : ''}
              </div>
            </div>
          ` : ''}
          ${removed.length > 0 ? `
            <div>
              <span class="tag" style="background:rgba(244,67,54,0.15);color:var(--color-danger);">-${removed.length} removed</span>
              <div class="text-muted mt-xs" style="font-size:var(--font-size-xs);">
                ${removed.slice(0, 3).map(g => g.name).join(', ')}${removed.length > 3 ? '...' : ''}
              </div>
            </div>
          ` : ''}
          ${added.length === 0 && removed.length === 0 ? '<span class="text-muted">No changes</span>' : ''}
        </div>
      </div>
    `;
    list.appendChild(item);
  });
}

async function renderAchievements() {
  const state = getState();
  const appContent = $('#app-content');
  const heroSection = $('#hero-section');
  if (!state.steamId) { renderHome(); return; }

  heroSection.classList.add('hidden');
  appContent.classList.remove('hidden');
  appContent.innerHTML = `
    <h2 class="section__title mb-lg">🏆 Achievements</h2>
    <div class="flex flex--center" style="padding:var(--space-3xl) 0;">
      <div class="text-center">
        <div class="spinner spinner--lg mb-md"></div>
        <div class="text-muted">Loading achievements...</div>
      </div>
    </div>
  `;

  try {
    const result = await fetchAchievements(state.steamId);
    const games = result.achievements || [];

    if (games.length === 0) {
      appContent.innerHTML = `
        <h2 class="section__title mb-lg">🏆 Achievements</h2>
        <div class="empty-state">
          <div class="empty-state__icon">🏆</div>
          <div class="empty-state__title">No achievements found</div>
          <p class="text-muted">Play some games with achievements to track them here.</p>
        </div>
      `;
      return;
    }

    const totalEarned = games.reduce((s, g) => s + g.earnedCount, 0);
    const totalPossible = games.reduce((s, g) => s + g.totalAchievements, 0);

    appContent.innerHTML = `
      <h2 class="section__title mb-lg">🏆 Achievements</h2>
      <div class="achievement-summary mb-lg">
        <div class="achievement-summary__item">
          <div class="achievement-summary__value">${totalEarned}</div>
          <div class="achievement-summary__label">Earned</div>
        </div>
        <div class="achievement-summary__item">
          <div class="achievement-summary__value">${totalPossible}</div>
          <div class="achievement-summary__label">Total</div>
        </div>
        <div class="achievement-summary__item">
          <div class="achievement-summary__value">${totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0}%</div>
          <div class="achievement-summary__label">Overall</div>
        </div>
        <div class="achievement-summary__item">
          <div class="achievement-summary__value">${games.length}</div>
          <div class="achievement-summary__label">Games</div>
        </div>
      </div>
      <div id="achievement-games-list"></div>
    `;

    const list = $('#achievement-games-list');
    games.forEach((game, i) => {
      const pct = game.totalAchievements > 0 ? Math.round((game.earnedCount / game.totalAchievements) * 100) : 0;
      const item = document.createElement('div');
      item.className = 'card mb-md animate-fade-in';
      item.style.animationDelay = `${i * 0.03}s`;
      item.innerHTML = `
        <div class="card__body">
          <details class="achievement-game">
            <summary class="achievement-game__header">
              <div class="achievement-game__header-top">
                <div class="flex gap-sm" style="align-items:center;">
                  <img src="${game.headerImage}" alt="" style="width:120px;height:56px;object-fit:cover;border-radius:4px;">
                  <div>
                    <div class="card__title">${game.gameName}</div>
                    <div class="card__meta">
                      <span class="tag tag--playtime">${game.earnedCount}/${game.totalAchievements}</span>
                      <span class="tag tag--match">${pct}%</span>
                    </div>
                  </div>
                </div>
                <span class="achievement-game__chevron"></span>
              </div>
              <div class="score-bar">
                <div class="score-bar__fill" style="width:${pct}%"></div>
              </div>
            </summary>
            <div class="achievement-list">
              ${game.achievements.map(a => `
                <div class="achievement-item ${a.achieved ? 'earned' : 'locked'}">
                  <img class="achievement-item__icon" src="${a.achieved ? a.icon : a.iconGray}" alt="" onerror="this.style.display='none'">
                  <div class="achievement-item__info">
                    <div class="achievement-item__name">${a.name}</div>
                    <div class="achievement-item__desc">${a.description || ''}</div>
                  </div>
                  <div class="achievement-item__status ${a.achieved ? 'earned' : ''}">
                    ${a.achieved ? '✓ Earned' : '🔒'}
                  </div>
                </div>
              `).join('')}
            </div>
          </details>
        </div>
      `;
      list.appendChild(item);
    });
  } catch (err) {
    showError(appContent, 'Failed to load achievements: ' + err.message);
  }
}

function setupHeroForm() {
  const form = $('#hero-form');
  const input = $('#steam-id-input');

  const saved = getSteamId();
  if (saved) input.value = saved;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = input.value.trim();
    if (!isValidSteamInput(id)) {
      input.style.borderColor = 'var(--color-danger)';
      setTimeout(() => { input.style.borderColor = ''; }, 2000);
      return;
    }
    loadUserData(id);
  });

  renderRecentSearches();
}

function renderRecentSearches() {
  const recentList = $('#recent-searches');
  const searches = getRecentSearches();
  if (searches.length === 0) { recentList.classList.add('hidden'); return; }
  recentList.classList.remove('hidden');
  recentList.innerHTML = `
    <div class="text-muted mb-sm" style="font-size:var(--font-size-sm);">Recent:</div>
    <div class="flex gap-sm flex--wrap">
      ${searches.map(id => `<button class="btn btn--ghost btn--sm recent-search-btn" data-id="${id}">${id.length > 30 ? '...' + id.slice(-27) : id}</button>`).join('')}
    </div>
  `;
  recentList.querySelectorAll('.recent-search-btn').forEach(btn => {
    btn.addEventListener('click', () => loadUserData(btn.dataset.id));
  });
}

function setupNavigation() {
  registerRoute('home', renderHome);
  registerRoute('library', renderLibrary);
  registerRoute('stats', renderStats);
  registerRoute('history', renderHistoryView);
  registerRoute('achievements', renderAchievements);

  $$('.header__nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(link.dataset.route);
    });
  });

  initRouter();
}

let heroSection;

document.addEventListener('DOMContentLoaded', () => {
  heroSection = $('#hero-section');
  initThemeToggle();
  setupNavigation();
  setupHeroForm();
});
