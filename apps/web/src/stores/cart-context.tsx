import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cartApi } from '@/services/endpoints';
import type { Cart } from '@/types';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await cartApi.get();
      return data;
    },
  });

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ['cart'] });
  }, [qc]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      setBusy(true);
      try {
        await cartApi.addItem(productId, quantity);
        await refresh();
        toast.success('Added to cart');
      } catch {
        toast.error('Could not add to cart');
        throw new Error('add failed');
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      setBusy(true);
      try {
        await cartApi.updateItem(itemId, quantity);
        await refresh();
      } catch {
        toast.error('Could not update cart');
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      setBusy(true);
      try {
        await cartApi.removeItem(itemId);
        await refresh();
        toast.success('Removed from cart');
      } catch {
        toast.error('Could not remove item');
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const clear = useCallback(async () => {
    setBusy(true);
    try {
      await cartApi.clear();
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  useEffect(() => {
    // ensure session cart loads on mount via query
  }, []);

  const cart = query.data ?? null;
  const itemCount =
    cart?.itemCount ??
    cart?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ??
    0;

  const value = useMemo(
    () => ({
      cart,
      loading: query.isLoading || busy,
      itemCount,
      refresh,
      addItem,
      updateItem,
      removeItem,
      clear,
    }),
    [cart, query.isLoading, busy, itemCount, refresh, addItem, updateItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
