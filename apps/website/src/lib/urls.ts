export const STORE_URL =
  import.meta.env.VITE_STORE_URL || 'https://store.energy-horizon.net';

export const ADMIN_URL =
  import.meta.env.VITE_ADMIN_URL || 'https://admin.energy-horizon.net';

export const SITE_URL =
  import.meta.env.VITE_SITE_URL || 'https://www.energy-horizon.net';

export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/** Corporate website surface */
export function getAppSurface(): 'site' {
  return 'site';
}

function joinPath(path = '') {
  const clean = path.replace(/^\/+/, '');
  return clean ? `/${clean}` : '/';
}

/** Absolute store URL (website never hosts store routes) */
export function storePath(path = '') {
  const base = STORE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\/+/, '');
  return clean ? `${base}/${clean}` : base;
}

/** Absolute admin URL */
export function adminPath(path = '') {
  const base = ADMIN_URL.replace(/\/$/, '');
  const clean = path.replace(/^\/+/, '');
  return clean ? `${base}/${clean}` : base;
}

export function sitePath(path = '') {
  return joinPath(path);
}
