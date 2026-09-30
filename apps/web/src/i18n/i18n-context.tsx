import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getDictionary, type Dictionary, type Locale } from './dictionaries';

type I18nValue = {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nValue | null>(null);

function readLocale(): Locale {
  const saved = localStorage.getItem('eh_locale');
  if (saved === 'ar' || saved === 'en') return saved;
  return navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem('eh_locale', next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  }, [locale, setLocale]);

  const dir: 'ltr' | 'rtl' = 'rtl';

  useEffect(() => {
    document.documentElement.lang = locale;
    // Keep layout RTL always so language toggle only changes text (no left/right jump).
    document.documentElement.dir = 'rtl';
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      dir,
      t: getDictionary(locale),
      setLocale,
      toggleLocale,
    }),
    [locale, dir, setLocale, toggleLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
