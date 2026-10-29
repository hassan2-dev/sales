import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { appToast } from '@/lib/toast';
import { useAuth } from '@/stores/auth-context';

const KEY = 'eh_store_favorites';

type FavoritesContextValue = {
  ids: string[];
  count: number;
  isFavorite: (productId: string) => boolean;
  /** Returns false when auth is required / blocked */
  toggle: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [ids, setIds] = useState<string[]>(() =>
    typeof window === 'undefined' ? [] : readIds(),
  );

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  // Clear wishlist when signed out (after auth has resolved)
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setIds([]);
      localStorage.removeItem(KEY);
    }
  }, [isAuthenticated, authLoading]);

  const isFavorite = useCallback((productId: string) => ids.includes(productId), [ids]);

  const toggle = useCallback(
    (productId: string) => {
      if (!isAuthenticated) {
        appToast.error('loginRequiredForFavorites');
        return false;
      }
      setIds((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          appToast.success('removedFromFavorites');
          return prev.filter((id) => id !== productId);
        }
        appToast.success('addedToFavorites');
        return [productId, ...prev];
      });
      return true;
    },
    [isAuthenticated],
  );

  const remove = useCallback((productId: string) => {
    setIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      isFavorite,
      toggle,
      remove,
      clear,
    }),
    [ids, isFavorite, toggle, remove, clear],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
