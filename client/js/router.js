const routes = {};
let currentRoute = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return currentRoute;
}

function parseHash() {
  const hash = window.location.hash.slice(1) || 'home';
  const parts = hash.split('/');
  return { path: parts[0], param: parts[1] || null };
}

function handleRoute() {
  const { path, param } = parseHash();
  currentRoute = path;

  document.querySelectorAll('.header__nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.route === path);
  });

  if (routes[path]) {
    routes[path](param);
  } else if (routes['home']) {
    routes['home']();
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
