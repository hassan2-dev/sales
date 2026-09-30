import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { appToast } from '@/lib/toast';

const KEY = 'eh_store_compare';
const MAX = 4;

export type CompareItem = {
  id: string;
  categoryId: string;
};

type CompareContextValue = {
  ids: string[];
  items: CompareItem[];
  categoryId: string | null;
  isCompared: (productId: string) => boolean;
  toggle: (productId: string, categoryId?: string | null) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
};

const CompareContext = createContext<CompareContextValue | null>(null);

function readItems(): CompareItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // Legacy: plain string ids — drop them (no category to enforce)
    if (parsed.every((x) => typeof x === 'string')) return [];
    return parsed.filter(
      (x): x is CompareItem =>
        Boolean(x) &&
        typeof x === 'object' &&
        typeof (x as CompareItem).id === 'string' &&
        typeof (x as CompareItem).categoryId === 'string' &&
        Boolean((x as CompareItem).categoryId),
    );
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>(() =>
    typeof window === 'undefined' ? [] : readItems(),
  );

  const persist = useCallback((next: CompareItem[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const categoryId = items[0]?.categoryId ?? null;

  const isCompared = useCallback(
    (productId: string) => items.some((i) => i.id === productId),
    [items],
  );

  const toggle = useCallback(
    (productId: string, nextCategoryId?: string | null) => {
      if (items.some((i) => i.id === productId)) {
        persist(items.filter((i) => i.id !== productId));
        appToast.message('removedFromCompare');
        return;
      }

      const cat = (nextCategoryId || '').trim();
      if (!cat) {
        appToast.error('compareSameCategory');
        return;
      }

      if (items.length > 0 && items[0].categoryId !== cat) {
        appToast.error('compareSameCategory');
        return;
      }

      if (items.length >= MAX) {
        appToast.error('compareLimit');
        return;
      }

      persist([...items, { id: productId, categoryId: cat }]);
      appToast.success('addedToCompare');
    },
    [items, persist],
  );

  const remove = useCallback(
    (productId: string) => persist(items.filter((i) => i.id !== productId)),
    [items, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo(
    () => ({
      ids,
      items,
      categoryId,
      isCompared,
      toggle,
      remove,
      clear,
      count: items.length,
    }),
    [ids, items, categoryId, isCompared, toggle, remove, clear],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
