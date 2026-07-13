const API_BASE = 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  let res;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch (err) {
    throw new Error(`Failed to connect to server at ${API_BASE}. Is the backend running? (${err.message})`);
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `API error: ${res.status}`);
  }
  return data;
}

export async function fetchLibrary(steamId) {
  return request(`/library/${steamId}`);
}

export async function refreshLibrary(steamId) {
  return request(`/library/${steamId}/refresh`, { method: 'POST' });
}

export async function fetchDiff(steamId) {
  return request(`/library/${steamId}/diff`);
}

export async function fetchRecommendations(steamId, count = 10, genre = '') {
  const params = new URLSearchParams({ count });
  if (genre) params.set('genre', genre);
  return request(`/recommendations/${steamId}?${params}`);
}

export async function fetchStats(steamId) {
  return request(`/stats/${steamId}`);
}

export async function fetchHistory(steamId, limit = 5) {
  return request(`/history/${steamId}?limit=${limit}`);
}

export async function healthCheck() {
  return request('/health');
}

export async function fetchAchievements(steamId) {
  return request(`/achievements/${steamId}`);
}

export async function fetchAchievementSummary(steamId) {
  return request(`/achievements/${steamId}/summary`);
}

export async function fetchGameAchievements(steamId, appId) {
  return request(`/achievements/${steamId}/${appId}`);
}
