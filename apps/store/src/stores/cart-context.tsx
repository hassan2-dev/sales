import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/services/endpoints';
import { appToast } from '@/lib/toast';
import {
  clearCachedCart,
  emptyCart,
  getOrCreateSessionId,
  normalizeCart,
  readCachedCart,
  writeCachedCart,
} from '@/lib/cart-storage';
import type { Cart, CartItem, Product } from '@/types';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number, product?: Product) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: (opts?: { silent?: boolean }) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = ['cart'] as const;

function isOptimisticId(id: string) {
  return id.startsWith('optimistic:');
}

function optimisticId(productId: string) {
  return `optimistic:${productId}`;
}

function setCartCache(qc: ReturnType<typeof useQueryClient>, cart: Cart) {
  const next = normalizeCart(cart);
  qc.setQueryData(CART_KEY, next);
  writeCachedCart(next);
  return next;
}

/** Re-push local lines to server when session cart was empty but cache had items. */
async function restoreLocalToServer(local: Cart): Promise<Cart> {
  const items = (local.items ?? []).filter((i) => i.productId && (i.quantity || 0) > 0);
  if (!items.length) return emptyCart();

  // Deduplicate by productId (keep highest qty)
  const byProduct = new Map<string, number>();
  for (const item of items) {
    const id = item.productId;
    byProduct.set(id, Math.max(byProduct.get(id) ?? 0, Math.max(1, item.quantity || 1)));
  }

  let cart = emptyCart();
  for (const [productId, quantity] of byProduct) {
    try {
      const { data } = await cartApi.addItem(productId, quantity);
      cart = normalizeCart(data);
    } catch {
      // Skip unavailable products; keep going
    }
  }
  return cart;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const qtyTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const qtySnapshots = useRef(new Map<string, Cart>());
  const pendingQty = useRef(new Map<string, number>());
  const cancelledAdds = useRef(new Set<string>());
  const inflightAdds = useRef(new Map<string, Promise<void>>());
  const restoring = useRef(false);

  // Ensure session id exists before first cart request
  getOrCreateSessionId();

  const cached = readCachedCart();

  const query = useQuery({
    queryKey: CART_KEY,
    queryFn: async () => {
      getOrCreateSessionId();
      try {
        const { data } = await cartApi.get();
        const server = normalizeCart(data);
        const local = readCachedCart();

        // Server empty but we still have a local snapshot → restore
        if (!(server.items?.length) && local?.items?.length && !restoring.current) {
          restoring.current = true;
          try {
            const restored = await restoreLocalToServer(local);
            writeCachedCart(restored);
            return restored;
          } catch {
            writeCachedCart(local);
            return normalizeCart(local);
          } finally {
            restoring.current = false;
          }
        }

        // Push unsynced local-only lines (failed earlier network adds)
        const pendingLocal = (local?.items ?? []).filter(
          (i) =>
            String(i.id).startsWith('local:') &&
            Boolean(i.productId) &&
            !(server.items ?? []).some((s) => s.productId === i.productId),
        );
        if (pendingLocal.length && !restoring.current) {
          restoring.current = true;
          try {
            let merged = server;
            for (const item of pendingLocal) {
              try {
                const { data: added } = await cartApi.addItem(
                  item.productId,
                  Math.max(1, item.quantity || 1),
                );
                merged = normalizeCart(added);
              } catch {
                /* skip unavailable */
              }
            }
            writeCachedCart(merged);
            return merged;
          } finally {
            restoring.current = false;
          }
        }

        writeCachedCart(server);
        return server;
      } catch {
        const fallback = readCachedCart();
        if (fallback) return normalizeCart(fallback);
        return emptyCart();
      }
    },
    initialData: cached ? normalizeCart(cached) : undefined,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: CART_KEY });
  }, [qc]);

  const patchLocalQty = useCallback(
    (itemId: string, quantity: number) => {
      const previous = qc.getQueryData<Cart>(CART_KEY) ?? emptyCart();
      setCartCache(qc, {
        ...previous,
        items: (previous.items ?? []).map((i) =>
          i.id === itemId ? { ...i, quantity } : i,
        ),
      });
    },
    [qc],
  );

  const syncQty = useCallback(
    (itemId: string, quantity: number, snapshot?: Cart) => {
      const existing = qtyTimers.current.get(itemId);
      if (existing) clearTimeout(existing);

      qtyTimers.current.set(
        itemId,
        setTimeout(() => {
          qtyTimers.current.delete(itemId);
          const snap = snapshot ?? qtySnapshots.current.get(itemId);
          qtySnapshots.current.delete(itemId);
          void cartApi
            .updateItem(itemId, quantity)
            .then(({ data }) => {
              setCartCache(qc, data);
            })
            .catch(() => {
              // Keep local qty; try again later via refresh
              if (snap) {
                // Prefer keeping the user's intended qty already patched locally
                writeCachedCart(qc.getQueryData<Cart>(CART_KEY) ?? snap);
              }
              appToast.error('cartUpdateFailed');
            });
        }, 180),
      );
    },
    [qc],
  );

  const addItem = useCallback(
    async (productId: string, quantity = 1, product?: Product) => {
      if (!productId || quantity < 1) return;
      getOrCreateSessionId();

      const previous = qc.getQueryData<Cart>(CART_KEY) ?? readCachedCart() ?? emptyCart();
      const existing = previous.items?.find(
        (i) => i.productId === productId || i.product?.id === productId,
      );

      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (!qtySnapshots.current.has(existing.id)) {
          qtySnapshots.current.set(existing.id, previous);
        }
        patchLocalQty(existing.id, nextQty);
        appToast.success('addedToCart');

        if (isOptimisticId(existing.id)) {
          pendingQty.current.set(productId, nextQty);
          return;
        }
        syncQty(existing.id, nextQty);
        return;
      }

      const tempId = optimisticId(productId);
      const optimisticLine: CartItem = {
        id: tempId,
        productId,
        quantity,
        unitPrice: product?.price,
        product,
      };
      setCartCache(qc, {
        ...previous,
        items: [...(previous.items ?? []), optimisticLine],
      });
      pendingQty.current.set(productId, quantity);
      cancelledAdds.current.delete(productId);
      appToast.success('addedToCart');

      const existingInflight = inflightAdds.current.get(productId);
      if (existingInflight) return existingInflight;

      const job = (async () => {
        try {
          const { data } = await cartApi.addItem(productId, quantity);
          if (cancelledAdds.current.has(productId)) {
            cancelledAdds.current.delete(productId);
            pendingQty.current.delete(productId);
            const real = data.items?.find(
              (i) => i.productId === productId || i.product?.id === productId,
            );
            if (real) {
              const { data: cleared } = await cartApi.removeItem(real.id);
              setCartCache(qc, cleared);
            } else {
              setCartCache(qc, data);
            }
            return;
          }

          const desired = pendingQty.current.get(productId) ?? quantity;
          pendingQty.current.delete(productId);
          const real = data.items?.find(
            (i) => i.productId === productId || i.product?.id === productId,
          );

          if (real && real.quantity !== desired) {
            const { data: synced } = await cartApi.updateItem(real.id, desired);
            setCartCache(qc, synced);
          } else {
            setCartCache(qc, data);
          }
        } catch (err: unknown) {
          pendingQty.current.delete(productId);
          cancelledAdds.current.delete(productId);
          const status =
            err &&
            typeof err === 'object' &&
            'response' in err &&
            err.response &&
            typeof err.response === 'object' &&
            'status' in err.response
              ? Number((err.response as { status?: number }).status)
              : 0;

          // Not found / validation → drop the line
          if (status === 400 || status === 404) {
            setCartCache(qc, previous);
            appToast.error('addToCartFailed');
            return;
          }

          // Network / server blip → keep item locally so leaving & returning still shows it
          const kept = qc.getQueryData<Cart>(CART_KEY) ?? previous;
          setCartCache(qc, {
            ...kept,
            items: (kept.items ?? []).map((i) =>
              i.id === tempId ? { ...i, id: `local:${productId}` } : i,
            ),
          });
        } finally {
          inflightAdds.current.delete(productId);
        }
      })();

      inflightAdds.current.set(productId, job);
      return job;
    },
    [qc, patchLocalQty, syncQty],
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;
      const previous = qc.getQueryData<Cart>(CART_KEY) ?? emptyCart();
      if (!qtySnapshots.current.has(itemId) && previous) {
        qtySnapshots.current.set(itemId, previous);
      }
      patchLocalQty(itemId, quantity);

      if (isOptimisticId(itemId) || itemId.startsWith('local:')) {
        const productId = itemId.includes(':') ? itemId.slice(itemId.indexOf(':') + 1) : itemId;
        pendingQty.current.set(productId, quantity);
        return;
      }

      syncQty(itemId, quantity, previous);
    },
    [patchLocalQty, syncQty],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const timer = qtyTimers.current.get(itemId);
      if (timer) {
        clearTimeout(timer);
        qtyTimers.current.delete(itemId);
      }
      qtySnapshots.current.delete(itemId);

      const previous = qc.getQueryData<Cart>(CART_KEY) ?? emptyCart();

      if (isOptimisticId(itemId) || itemId.startsWith('local:')) {
        const productId = itemId.includes(':') ? itemId.slice(itemId.indexOf(':') + 1) : itemId;
        cancelledAdds.current.add(productId);
        pendingQty.current.delete(productId);
        setCartCache(qc, {
          ...previous,
          items: (previous.items ?? []).filter((i) => i.id !== itemId),
        });
        appToast.success('removedFromCart');
        return;
      }

      setCartCache(qc, {
        ...previous,
        items: (previous.items ?? []).filter((i) => i.id !== itemId),
      });
      appToast.success('removedFromCart');
      try {
        const { data } = await cartApi.removeItem(itemId);
        setCartCache(qc, data);
      } catch {
        setCartCache(qc, previous);
        appToast.error('removeFromCartFailed');
      }
    },
    [qc],
  );

  const clear = useCallback(
    async (opts?: { silent?: boolean }) => {
      qtyTimers.current.forEach((t) => clearTimeout(t));
      qtyTimers.current.clear();
      qtySnapshots.current.clear();
      pendingQty.current.clear();
      cancelledAdds.current.clear();

      const previous = qc.getQueryData<Cart>(CART_KEY);
      setCartCache(qc, emptyCart());
      clearCachedCart();
      if (!opts?.silent) appToast.success('cartCleared');
      try {
        const { data } = await cartApi.clear();
        setCartCache(qc, data);
      } catch {
        if (previous) setCartCache(qc, previous);
      }
    },
    [qc],
  );

  const cart = query.data ?? cached ?? null;
  const itemCount =
    cart?.itemCount ??
    cart?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ??
    0;

  const value = useMemo(
    () => ({
      cart,
      loading: query.isLoading && !cart,
      itemCount,
      refresh,
      addItem,
      updateItem,
      removeItem,
      clear,
    }),
    [cart, query.isLoading, itemCount, refresh, addItem, updateItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
