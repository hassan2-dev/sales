import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/services/endpoints';
import { formatMoney } from '@/lib/cn';

export type DisplayCurrency = 'USD' | 'IQD';

export type CommerceSettings = {
  usdToIqdRate: number;
  enableIqdDisplay: boolean;
  displayCurrency: DisplayCurrency;
  toggleDisplayCurrency: () => void;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  /** Format a catalog/cart amount for the active display currency. */
  formatDisplayPrice: (
    amount: number | string | null | undefined,
    sourceCurrency?: string | null,
    locale?: string,
  ) => string;
  /** Secondary line in the opposite currency (when IQD display is enabled). */
  formatSecondaryPrice: (
    amount: number | string | null | undefined,
    sourceCurrency?: string | null,
    locale?: string,
  ) => string | null;
};

const defaults = {
  usdToIqdRate: 1310,
  enableIqdDisplay: true,
};

const DISPLAY_KEY = 'eh_display_currency';

const CommerceSettingsContext = createContext<CommerceSettings | null>(null);

function readStoredCurrency(): DisplayCurrency {
  try {
    const v = localStorage.getItem(DISPLAY_KEY);
    if (v === 'IQD' || v === 'USD') return v;
  } catch {
    /* ignore */
  }
  return 'USD';
}

export function usdToIqd(usd: number, rate: number) {
  return usd * rate;
}

export function iqdToUsd(iqd: number, rate: number) {
  if (!rate) return 0;
  return iqd / rate;
}

export function CommerceSettingsProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ['commerce-settings'],
    queryFn: async () => (await settingsApi.commerce()).data,
    staleTime: 60_000,
  });

  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>(() =>
    typeof window !== 'undefined' ? readStoredCurrency() : 'USD',
  );

  useEffect(() => {
    try {
      localStorage.setItem(DISPLAY_KEY, displayCurrency);
    } catch {
      /* ignore */
    }
  }, [displayCurrency]);

  const rate = Number(query.data?.usdToIqdRate ?? defaults.usdToIqdRate) || defaults.usdToIqdRate;
  const enableIqdDisplay = query.data?.enableIqdDisplay ?? defaults.enableIqdDisplay;

  // If admin disabled IQD display, force USD
  useEffect(() => {
    if (!enableIqdDisplay && displayCurrency === 'IQD') {
      setDisplayCurrencyState('USD');
    }
  }, [enableIqdDisplay, displayCurrency]);

  const setDisplayCurrency = useCallback((c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
  }, []);

  const toggleDisplayCurrency = useCallback(() => {
    setDisplayCurrencyState((prev) => (prev === 'USD' ? 'IQD' : 'USD'));
  }, []);

  const formatDisplayPrice = useCallback(
    (
      amount: number | string | null | undefined,
      sourceCurrency?: string | null,
      locale = 'en-US',
    ) => {
      const n = typeof amount === 'string' ? Number(amount) : Number(amount ?? 0);
      const src = (sourceCurrency ?? 'USD').toUpperCase();
      const safe = Number.isFinite(n) ? n : 0;

      if (!enableIqdDisplay || displayCurrency === 'USD') {
        return formatMoney(safe, src === 'IQD' ? 'IQD' : 'USD', locale);
      }

      // Prefer IQD display
      if (src === 'IQD') return formatMoney(safe, 'IQD', locale);
      return formatMoney(usdToIqd(safe, rate), 'IQD', locale);
    },
    [displayCurrency, enableIqdDisplay, rate],
  );

  const formatSecondaryPrice = useCallback(
    (
      amount: number | string | null | undefined,
      sourceCurrency?: string | null,
      locale = 'en-US',
    ) => {
      if (!enableIqdDisplay) return null;
      const n = typeof amount === 'string' ? Number(amount) : Number(amount ?? 0);
      const src = (sourceCurrency ?? 'USD').toUpperCase();
      if (!Number.isFinite(n)) return null;

      if (displayCurrency === 'USD') {
        if (src !== 'USD') return null;
        return formatMoney(usdToIqd(n, rate), 'IQD', locale);
      }

      // Primary is IQD → secondary USD
      if (src === 'IQD') return formatMoney(iqdToUsd(n, rate), 'USD', locale);
      return formatMoney(n, 'USD', locale);
    },
    [displayCurrency, enableIqdDisplay, rate],
  );

  const value = useMemo<CommerceSettings>(
    () => ({
      usdToIqdRate: rate,
      enableIqdDisplay,
      displayCurrency: enableIqdDisplay ? displayCurrency : 'USD',
      toggleDisplayCurrency,
      setDisplayCurrency,
      formatDisplayPrice,
      formatSecondaryPrice,
    }),
    [
      rate,
      enableIqdDisplay,
      displayCurrency,
      toggleDisplayCurrency,
      setDisplayCurrency,
      formatDisplayPrice,
      formatSecondaryPrice,
    ],
  );

  return (
    <CommerceSettingsContext.Provider value={value}>{children}</CommerceSettingsContext.Provider>
  );
}

export function useCommerceSettings() {
  const ctx = useContext(CommerceSettingsContext);
  if (!ctx) {
    throw new Error('useCommerceSettings must be used within CommerceSettingsProvider');
  }
  return ctx;
}
