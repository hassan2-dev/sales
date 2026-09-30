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

function withCounts(cart: Cart): Cart {
  const items = cart.items ?? [];
  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const subtotal = items.reduce((sum, i) => {
    const price = Number(i.unitPrice ?? i.product?.price ?? 0);
    return sum + price * (i.quantity || 0);
  }, 0);
  return { ...cart, items, itemCount, subtotal };
}

function emptyCart(): Cart {
  return { items: [], itemCount: 0, subtotal: 0 };
}

function isOptimisticId(id: string) {
  return id.startsWith('optimistic:');
}

function optimisticId(productId: string) {
  return `optimistic:${productId}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const qtyTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const qtySnapshots = useRef(new Map<string, Cart>());
  /** Desired qty while an add is still in flight (keyed by productId). */
  const pendingQty = useRef(new Map<string, number>());
  /** Product ids cancelled (removed) before add finished. */
  const cancelledAdds = useRef(new Set<string>());
  /** In-flight add promises so we don't double-post. */
  const inflightAdds = useRef(new Map<string, Promise<void>>());

  const query = useQuery({
    queryKey: CART_KEY,
    queryFn: async () => {
      const { data } = await cartApi.get();
      return data;
    },
  });

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: CART_KEY });
  }, [qc]);

  const patchLocalQty = useCallback(
    (itemId: string, quantity: number) => {
      const previous = qc.getQueryData<Cart>(CART_KEY);
      if (!previous) return;
      qc.setQueryData(
        CART_KEY,
        withCounts({
          ...previous,
          items: (previous.items ?? []).map((i) =>
            i.id === itemId ? { ...i, quantity } : i,
          ),
        }),
      );
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
              qc.setQueryData(CART_KEY, data);
            })
            .catch(() => {
              if (snap) qc.setQueryData(CART_KEY, snap);
              appToast.error('cartUpdateFailed');
            });
        }, 150),
      );
    },
    [qc],
  );

  const addItem = useCallback(
    async (productId: string, quantity = 1, product?: Product) => {
      const previous = qc.getQueryData<Cart>(CART_KEY) ?? emptyCart();
      const existing = previous.items?.find(
        (i) => i.productId === productId || i.product?.id === productId,
      );

      // Already in cart → bump UI instantly
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

      // New line → show counter immediately with temp id
      const tempId = optimisticId(productId);
      const optimisticLine: CartItem = {
        id: tempId,
        productId,
        quantity,
        unitPrice: product?.price,
        product,
      };
      qc.setQueryData(
        CART_KEY,
        withCounts({
          ...previous,
          items: [...(previous.items ?? []), optimisticLine],
        }),
      );
      pendingQty.current.set(productId, quantity);
      cancelledAdds.current.delete(productId);
      appToast.success('addedToCart');

      const existingInflight = inflightAdds.current.get(productId);
      if (existingInflight) return;

      const job = (async () => {
        try {
          // Always POST quantity 1 first; then sync to desired qty if needed
          const { data } = await cartApi.addItem(productId, quantity);
          if (cancelledAdds.current.has(productId)) {
            cancelledAdds.current.delete(productId);
            pendingQty.current.delete(productId);
            const real = data.items?.find(
              (i) => i.productId === productId || i.product?.id === productId,
            );
            if (real) {
              const { data: cleared } = await cartApi.removeItem(real.id);
              qc.setQueryData(CART_KEY, cleared);
            } else {
              qc.setQueryData(CART_KEY, data);
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
            qc.setQueryData(CART_KEY, synced);
          } else {
            qc.setQueryData(CART_KEY, data);
          }
        } catch {
          pendingQty.current.delete(productId);
          cancelledAdds.current.delete(productId);
          qc.setQueryData(CART_KEY, previous);
          appToast.error('addToCartFailed');
        } finally {
          inflightAdds.current.delete(productId);
        }
      })();

      inflightAdds.current.set(productId, job);
    },
    [qc, patchLocalQty, syncQty],
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      const previous = qc.getQueryData<Cart>(CART_KEY);
      if (!qtySnapshots.current.has(itemId) && previous) {
        qtySnapshots.current.set(itemId, previous);
      }
      patchLocalQty(itemId, quantity);

      if (isOptimisticId(itemId)) {
        const productId = itemId.slice('optimistic:'.length);
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

      const previous = qc.getQueryData<Cart>(CART_KEY);

      if (isOptimisticId(itemId)) {
        const productId = itemId.slice('optimistic:'.length);
        cancelledAdds.current.add(productId);
        pendingQty.current.delete(productId);
        if (previous) {
          qc.setQueryData(
            CART_KEY,
            withCounts({
              ...previous,
              items: (previous.items ?? []).filter((i) => i.id !== itemId),
            }),
          );
        }
        appToast.success('removedFromCart');
        return;
      }

      if (previous) {
        qc.setQueryData(
          CART_KEY,
          withCounts({
            ...previous,
            items: (previous.items ?? []).filter((i) => i.id !== itemId),
          }),
        );
      }
      appToast.success('removedFromCart');
      try {
        const { data } = await cartApi.removeItem(itemId);
        qc.setQueryData(CART_KEY, data);
      } catch {
        if (previous) qc.setQueryData(CART_KEY, previous);
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
      if (previous) {
        qc.setQueryData(CART_KEY, withCounts({ ...previous, items: [] }));
      }
      if (!opts?.silent) appToast.success('cartCleared');
      try {
        const { data } = await cartApi.clear();
        qc.setQueryData(CART_KEY, data);
      } catch {
        if (previous) qc.setQueryData(CART_KEY, previous);
      }
    },
    [qc],
  );

  const cart = query.data ?? null;
  const itemCount =
    cart?.itemCount ??
    cart?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ??
    0;

  const value = useMemo(
    () => ({
      cart,
      loading: query.isLoading,
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
