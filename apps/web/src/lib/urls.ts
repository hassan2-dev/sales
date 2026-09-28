export const STORE_URL =
  import.meta.env.VITE_STORE_URL || 'https://store.energy-horizon.net';

export const ADMIN_URL =
  import.meta.env.VITE_ADMIN_URL || 'https://admin.energy-horizon.net';

export const SITE_URL =
  import.meta.env.VITE_SITE_URL || 'https://www.energy-horizon.net';

export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function getAppSurface(): 'site' | 'store' | 'admin' {
  const host = window.location.hostname.toLowerCase();
  if (host.startsWith('store.') || host === 'store.localhost') return 'store';
  if (host.startsWith('admin.') || host === 'admin.localhost') return 'admin';
  return 'site';
}

function joinBase(base: string, path = '') {
  const clean = path.replace(/^\/+/, '');
  if (!clean) return base || '/';
  return `${base}/${clean}`.replace(/\/{2,}/g, '/');
}

/** Store-relative path — `/products` on store subdomain, `/store/products` on main site */
export function storePath(path = '') {
  return getAppSurface() === 'store' ? joinBase('/', path) : joinBase('/store', path);
}

/** Admin-relative path */
export function adminPath(path = '') {
  return getAppSurface() === 'admin' ? joinBase('/', path) : joinBase('/admin', path);
}
