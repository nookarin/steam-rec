const state = {
  steamId: '',
  playerName: '',
  avatarUrl: '',
  games: [],
  recommendations: [],
  stats: null,
  history: [],
  isLoading: false,
  error: null,
  currentView: 'home',
  searchQuery: '',
  genreFilter: ''
};

const listeners = new Map();

export function getState() {
  return { ...state };
}

export function setState(partial) {
  Object.assign(state, partial);
  notify();
}

export function subscribe(key, callback) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(callback);
  return () => listeners.get(key).delete(callback);
}

function notify() {
  for (const [key, cbs] of listeners) {
    if (key in state || key === '*') {
      for (const cb of cbs) cb(state);
    }
  }
  if (listeners.has('*')) {
    for (const cb of listeners.get('*')) cb(state);
  }
}

export function resetState() {
  state.steamId = '';
  state.playerName = '';
  state.avatarUrl = '';
  state.games = [];
  state.recommendations = [];
  state.stats = null;
  state.history = [];
  state.error = null;
  notify();
}
