import { getState, setState, resetState, subscribe } from './state.js';
import { fetchLibrary, fetchRecommendations, fetchStats, fetchHistory, refreshLibrary } from './api.js';
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

    const [library, recs, stats, history] = await Promise.all([
      fetchLibrary(steamId),
      fetchRecommendations(steamId, 15),
      fetchStats(steamId),
      fetchHistory(steamId, 5)
    ]);

    setState({
      playerName: library.playerName,
      avatarUrl: library.avatarUrl,
      games: library.games,
      recommendations: recs.recommendations,
      stats,
      history: history.snapshots,
      isLoading: false
    });

    addRecentSearch(rawInput);
    setSteamId(rawInput);
    navigate('library');
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
  if (!state.games.length) { renderHome(); return; }

  const heroSection = $('#hero-section');
  heroSection.classList.add('hidden');
  appContent.classList.remove('hidden');

  appContent.innerHTML = `
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

    <section id="recs-section">
      <h2 class="section__title">💡 Recommendations</h2>
      <div id="recs-grid"></div>
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
  renderGameGrid(gameGrid, state.games);

  renderRecommendations($('#recs-grid'), state.recommendations);

  initSearchBar($('#search-bar-container'), (query) => {
    const genre = genreSelect.value;
    const filtered = filterGames(state.games, query, genre);
    renderGameGrid(gameGrid, filtered, 'No games match your search');
  });

  genreSelect.addEventListener('change', () => {
    const query = $('#search-input').value.trim().toLowerCase();
    const filtered = filterGames(state.games, query, genreSelect.value);
    renderGameGrid(gameGrid, filtered, 'No games match this filter');
  });

  $('#refresh-btn').addEventListener('click', () => loadUserData(state.steamId, true));
}

function renderStats() {
  const state = getState();
  const appContent = $('#app-content');
  const heroSection = $('#hero-section');
  if (!state.stats) {
    if (state.steamId) {
      loadUserData(state.steamId);
    } else {
      renderHome();
    }
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
  state.history.forEach((snap, i) => {
    const item = document.createElement('div');
    item.className = 'card mb-md animate-fade-in';
    item.style.animationDelay = `${i * 0.05}s`;
    item.innerHTML = `
      <div class="card__body">
        <div class="flex flex--between mb-sm">
          <strong class="text-heading">${formatRelativeTime(snap.snapshotDate)}</strong>
          <span class="tag tag--status">${snap.games.length} games</span>
        </div>
        <div class="flex gap-md" style="flex-wrap:wrap;">
          ${snap.addedGames.length > 0 ? `
            <div>
              <span class="tag tag--playtime">+${snap.addedGames.length} added</span>
              <div class="text-muted mt-xs" style="font-size:var(--font-size-xs);">
                ${snap.addedGames.slice(0, 3).map(g => g.name).join(', ')}${snap.addedGames.length > 3 ? '...' : ''}
              </div>
            </div>
          ` : ''}
          ${snap.removedGames.length > 0 ? `
            <div>
              <span class="tag" style="background:rgba(244,67,54,0.15);color:var(--color-danger);">-${snap.removedGames.length} removed</span>
              <div class="text-muted mt-xs" style="font-size:var(--font-size-xs);">
                ${snap.removedGames.slice(0, 3).map(g => g.name).join(', ')}${snap.removedGames.length > 3 ? '...' : ''}
              </div>
            </div>
          ` : ''}
          ${snap.addedGames.length === 0 && snap.removedGames.length === 0 ? '<span class="text-muted">No changes</span>' : ''}
        </div>
      </div>
    `;
    list.appendChild(item);
  });
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
