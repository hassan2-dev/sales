import { api } from '@/services/api';

const VISITOR_KEY = 'eh_visitor_id';

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function ensureVisitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing && existing.length >= 8) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Track one unique visit per surface per browser per day. */
export function trackSiteVisit(surface: 'store' | 'corporate') {
  if (typeof window === 'undefined') return;

  const stampKey = `eh_visit_${surface}_${dayKey()}`;
  try {
    if (sessionStorage.getItem(stampKey)) return;
    sessionStorage.setItem(stampKey, '1');
  } catch {
    // continue — server still dedupes by visitorId + day
  }

  const visitorId = ensureVisitorId();
  void api.post('/analytics/visit', { surface, visitorId, path: window.location.pathname }).catch(() => {
    try {
      sessionStorage.removeItem(stampKey);
    } catch {
      /* ignore */
    }
  });
}
