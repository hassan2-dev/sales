import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getOrCreateSessionId } from '@/lib/cn';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ACCESS_KEY = 'eh_access_token';
const REFRESH_KEY = 'eh_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Session-Id'] = getOrCreateSessionId();
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken as string;
  } catch {
    clearTokens();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      if (typeof window !== 'undefined') {
        const surfaceAdmin =
          window.location.hostname.startsWith('admin.') ||
          window.location.hostname === 'admin.localhost' ||
          window.location.pathname.startsWith('/admin');
        const onLogin = window.location.pathname.includes('/login');
        if (surfaceAdmin && !onLogin) {
          const login =
            window.location.hostname.startsWith('admin.') ||
            window.location.hostname === 'admin.localhost'
              ? '/login'
              : '/admin/login';
          window.location.assign(login);
        }
      }
    }
    return Promise.reject(error);
  },
);
