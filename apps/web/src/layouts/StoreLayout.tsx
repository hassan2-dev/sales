import { Link, NavLink, Outlet } from 'react-router-dom';
import { Moon, ShoppingCart, Sun } from 'lucide-react';
import { useCart } from '@/stores/cart-context';
import { useTheme } from '@/stores/theme-context';
import { useI18n } from '@/i18n/i18n-context';
import { SITE_URL } from '@/lib/urls';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/cn';

export function StoreLayout() {
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale, dir, t } = useI18n();

  const links = [
    { to: '/', label: locale === 'ar' ? 'الرئيسية' : 'Home', end: true },
    { to: '/products', label: locale === 'ar' ? 'المنتجات' : 'Products' },
    { to: '/cart', label: locale === 'ar' ? 'السلة' : 'Cart' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-page text-fg" dir={dir}>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Logo to="/" />
            <nav className="hidden items-center gap-0.5 sm:flex">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-2 text-[13px] font-medium tracking-wide text-white/60 transition hover:text-white',
                      isActive && 'text-white',
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLocale}
              className="hidden h-8 min-w-8 items-center justify-center text-[11px] font-semibold tracking-wider text-white/70 transition hover:text-white sm:inline-flex"
            >
              {locale === 'en' ? 'AR' : 'EN'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-8 w-8 items-center justify-center text-white/70 transition hover:text-white"
              aria-label={theme === 'light' ? t.theme.dark : t.theme.light}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <a
              href={SITE_URL}
              className="hidden text-[13px] text-white/45 transition hover:text-white md:inline"
            >
              {locale === 'ar' ? 'الموقع' : 'Website'}
            </a>
            <Link
              to="/cart"
              className="relative inline-flex h-8 items-center gap-2 bg-accent px-3 text-[13px] font-semibold text-white transition hover:bg-accent-soft"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'السلة' : 'Cart'}</span>
              {itemCount > 0 ? (
                <span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line bg-elevated">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>AT Store · Energy Horizon · افاق الطاقة</span>
          <span>
            {locale === 'ar' ? 'الأسعار تُحسب من الخادم' : 'Prices confirmed server-side'}
          </span>
        </div>
      </footer>
    </div>
  );
}
