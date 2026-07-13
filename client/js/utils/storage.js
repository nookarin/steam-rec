const STORAGE_PREFIX = 'steamrec_';

export function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function set(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    console.warn('localStorage write failed');
  }
}

export function remove(key) {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

export function getSteamId() {
  return get('steamId', '');
}

export function setSteamId(id) {
  set('steamId', id);
}

export function getTheme() {
  return get('theme', 'dark');
}

export function setTheme(theme) {
  set('theme', theme);
}

export function getRecentSearches() {
  return get('recentSearches', []);
}

export function addRecentSearch(steamId) {
  const recent = getRecentSearches().filter(s => s !== steamId);
  recent.unshift(steamId);
  set('recentSearches', recent.slice(0, 10));
}
