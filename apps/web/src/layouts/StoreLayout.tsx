import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  Globe,
  Menu,
  Moon,
  ShoppingCart,
  Sun,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/stores/cart-context';
import { useTheme } from '@/stores/theme-context';
import { useAuth } from '@/stores/auth-context';
import { useI18n } from '@/i18n/i18n-context';
import { SITE_URL } from '@/lib/urls';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/cn';

export function StoreLayout() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { locale, toggleLocale, dir, t } = useI18n();

  const nav = [
    { to: '/', label: locale === 'ar' ? 'الرئيسية' : 'Home', end: true },
    { to: '/products', label: locale === 'ar' ? 'المنتجات' : 'Catalog' },
    { to: '/categories', label: locale === 'ar' ? 'الأقسام' : 'Categories' },
    {
      to: '/products?sort=bestsellers',
      label: locale === 'ar' ? 'الأكثر مبيعاً' : 'Best sellers',
    },
    { to: '/favorites', label: locale === 'ar' ? 'المفضلة' : 'Favorites' },
  ];

  const accountTo = isAuthenticated ? '/account/orders' : '/account/login';
  const accountLabel = locale === 'ar' ? 'حسابي' : 'My account';
  const accountName =
    isAuthenticated && user?.firstName && user.firstName !== 'Customer'
      ? user.firstName
      : accountLabel;

  const iconBtn =
    'inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:border-white/25 hover:bg-white/5 hover:text-white';

  return (
    <div className="flex min-h-screen flex-col bg-page text-fg" dir={dir}>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-8">
            <Logo to="/" />
            <nav className="hidden items-center gap-0.5 lg:flex">
              {nav.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    cn(
                      'relative rounded-lg px-3.5 py-2 text-[13px] font-semibold tracking-wide text-white/55 transition hover:bg-white/5 hover:text-white',
                      isActive &&
                        'bg-white/10 text-white after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-accent',
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
              className={cn(iconBtn, 'min-w-10 text-[11px] font-bold tracking-wider')}
              aria-label={locale === 'en' ? 'العربية' : 'English'}
            >
              {locale === 'en' ? 'ع' : 'EN'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className={iconBtn}
              aria-label={theme === 'light' ? t.theme.dark : t.theme.light}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <a
              href={SITE_URL}
              className={iconBtn}
              aria-label={locale === 'ar' ? 'الموقع الرئيسي' : 'Corporate site'}
              title={locale === 'ar' ? 'الموقع الرئيسي' : 'Corporate site'}
            >
              <Globe className="h-4 w-4" />
            </a>

            <Link
              to={accountTo}
              className="hidden h-10 items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-3.5 text-[13px] font-bold text-white transition hover:border-accent hover:bg-accent sm:inline-flex"
            >
              <UserRound className="h-4 w-4" />
              <span className="max-w-[7rem] truncate">{accountName}</span>
            </Link>

            <div className="relative">
              <Link
                to="/cart"
                className="btn-shine inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-[13px] font-bold text-white shadow-[0_8px_24px_-10px_rgb(0_112_192/0.7)] transition hover:bg-accent-soft"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === 'ar' ? 'السلة' : 'Cart'}</span>
              </Link>
              {itemCount > 0 ? (
                <span className="pointer-events-none absolute -end-1.5 -top-1.5 z-20 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold leading-none text-black shadow-sm ring-2 ring-black">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              className={cn(iconBtn, 'lg:hidden')}
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-white/10 bg-black px-4 py-5 lg:hidden">
            <div className="flex flex-col gap-1">
              {nav.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-white/85 hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
              <a
                href={SITE_URL}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-white/85 hover:bg-white/5"
              >
                {locale === 'ar' ? 'الموقع الرئيسي' : 'Corporate site'}
              </a>
              <Link
                to={accountTo}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-bold text-accent"
              >
                <UserRound className="h-4 w-4" />
                {accountLabel}
              </Link>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    void logout();
                    setOpen(false);
                  }}
                  className="rounded-lg px-3 py-3 text-start text-sm font-semibold text-white/55"
                >
                  {locale === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-black text-white">
        <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-5">
            <Logo to="/" imgClassName="h-9 sm:h-10 max-w-[200px]" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">
              {locale === 'ar'
                ? 'متجر احترافي للمعدات الصناعية — حسابي موثّق بالاسم ورقم الهاتف وOTP قبل كل طلب.'
                : 'Professional industrial store — My account verified with name, phone, and OTP before every order.'}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                {locale === 'ar' ? 'تسوّق' : 'Shop'}
              </p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/65">
                <Link to="/products" className="w-fit hover:text-white">
                  {locale === 'ar' ? 'المنتجات' : 'Products'}
                </Link>
                <Link to="/categories" className="w-fit hover:text-white">
                  {locale === 'ar' ? 'الأقسام' : 'Categories'}
                </Link>
                <Link to="/favorites" className="w-fit hover:text-white">
                  {locale === 'ar' ? 'المفضلة' : 'Favorites'}
                </Link>
                <Link to="/cart" className="w-fit hover:text-white">
                  {locale === 'ar' ? 'السلة' : 'Cart'}
                </Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                {accountLabel}
              </p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/65">
                <Link to={accountTo} className="w-fit hover:text-white">
                  {isAuthenticated
                    ? locale === 'ar'
                      ? 'طلباتي'
                      : 'My orders'
                    : locale === 'ar'
                      ? 'تسجيل / دخول'
                      : 'Register / sign in'}
                </Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                {locale === 'ar' ? 'الشركة' : 'Company'}
              </p>
              <a href={SITE_URL} className="mt-4 inline-block text-sm text-white/65 hover:text-white">
                {locale === 'ar' ? 'الموقع الرئيسي' : 'Main website'}
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[90rem] justify-between gap-2 px-4 py-5 text-xs text-white/25 sm:px-6 lg:px-10">
            <span>© {new Date().getFullYear()} AT Store · Energy Horizon</span>
            <span>{locale === 'ar' ? 'حسابي موثّق · OTP' : 'Verified My account · OTP'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
