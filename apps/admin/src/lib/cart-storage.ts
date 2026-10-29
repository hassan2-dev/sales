import type { Cart, CartItem } from '@/types';

const SESSION_KEY = 'eh_session_id';
const CART_KEY = 'eh_cart_v1';

function makeId() {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

/** Stable browser cart session — persists across reloads until cleared. */
export function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY)?.trim();
    if (existing && existing.length >= 8) return existing;
    const id = makeId();
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return makeId();
  }
}

function withCounts(cart: Cart): Cart {
  const items = cart.items ?? [];
  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const subtotal = items.reduce((sum, i) => {
    const price = Number(i.unitPrice ?? i.product?.price ?? 0);
    return sum + price * (i.quantity || 0);
  }, 0);
  return {
    ...cart,
    items,
    itemCount,
    subtotal,
    sessionId: cart.sessionId || getOrCreateSessionId(),
  };
}

export function emptyCart(): Cart {
  return withCounts({ items: [], itemCount: 0, subtotal: 0 });
}

export function readCachedCart(): Cart | null {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return withCounts(parsed);
  } catch {
    return null;
  }
}

export function writeCachedCart(cart: Cart | null | undefined) {
  try {
    if (!cart) {
      localStorage.removeItem(CART_KEY);
      return;
    }
    const clean: Cart = withCounts({
      ...cart,
      items: (cart.items ?? []).filter(
        (i) => i && i.productId && !String(i.id).startsWith('optimistic:'),
      ),
    });
    localStorage.setItem(CART_KEY, JSON.stringify(clean));
  } catch {
    /* private mode / quota */
  }
}

export function clearCachedCart() {
  try {
    localStorage.removeItem(CART_KEY);
  } catch {
    /* ignore */
  }
}

/** Normalize API / cache cart for UI. */
export function normalizeCart(cart: Cart | null | undefined): Cart {
  if (!cart) return emptyCart();
  return withCounts(cart);
}

export function mergeCartItems(a: CartItem[], b: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of [...a, ...b]) {
    const key = item.productId || item.product?.id;
    if (!key) continue;
    const prev = map.get(key);
    if (!prev || (item.quantity || 0) >= (prev.quantity || 0)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}
