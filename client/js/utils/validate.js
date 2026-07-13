export function parseSteamInput(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  const urlPatterns = [
    /steamcommunity\.com\/id\/([a-zA-Z0-9_-]+)/,
    /steamcommunity\.com\/profiles\/(\d{17})/,
  ];

  for (const pattern of urlPatterns) {
    const match = trimmed.match(pattern);
    if (match) return { type: match[1].match(/^\d{17}$/) ? 'steamid' : 'vanity', value: match[1] };
  }

  if (/^\d{17}$/.test(trimmed)) return { type: 'steamid', value: trimmed };
  if (/^[a-zA-Z0-9_-]{3,32}$/.test(trimmed)) return { type: 'vanity', value: trimmed };

  return null;
}

export function isValidSteamInput(input) {
  return parseSteamInput(input) !== null;
}

export function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

export function validateCount(count) {
  const n = parseInt(count);
  if (isNaN(n) || n < 1) return 10;
  return Math.min(n, 50);
}
