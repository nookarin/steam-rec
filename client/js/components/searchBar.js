import { debounce } from '../utils/format.js';

export function initSearchBar(container, onSearch) {
  const searchInput = container.querySelector('#search-input');
  if (!searchInput) return;

  const debouncedSearch = debounce((value) => {
    onSearch(value);
  }, 250);

  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value.trim().toLowerCase());
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      onSearch('');
    }
  });
}

export function filterGames(games, query, genre = '') {
  let filtered = games;

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(g => g.name.toLowerCase().includes(q));
  }

  if (genre) {
    const g = genre.toLowerCase();
    filtered = filtered.filter(g2 =>
      (g2.genres || []).some(gen => gen.toLowerCase().includes(g))
    );
  }

  return filtered;
}
