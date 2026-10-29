export const STORE_URL =
  import.meta.env.VITE_STORE_URL || 'https://store.energy-horizon.net';

export const ADMIN_URL =
  import.meta.env.VITE_ADMIN_URL || 'https://admin.energy-horizon.net';

export const SITE_URL =
  import.meta.env.VITE_SITE_URL || 'https://www.energy-horizon.net';

export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/** Store surface */
export function getAppSurface(): 'store' {
  return 'store';
}

function joinPath(path = '') {
  const clean = path.replace(/^\/+/, '');
  return clean ? `/${clean}` : '/';
}

/** Store-relative path */
export function storePath(path = '') {
  return joinPath(path);
}

export function adminPath(path = '') {
  const base = ADMIN_URL.replace(/\/$/, '');
  const clean = path.replace(/^\/+/, '');
  return clean ? `${base}/${clean}` : base;
}

export function sitePath(path = '') {
  const base = SITE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\/+/, '');
  return clean ? `${base}/${clean}` : base;
}
