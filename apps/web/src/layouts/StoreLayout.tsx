import { useEffect, useState, type FormEvent } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Globe,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  Truck,
  UserRound,
  X,
} from 'lucide-react';
import { useCart } from '@/stores/cart-context';
import { useTheme } from '@/stores/theme-context';
import { useAuth } from '@/stores/auth-context';
import { useI18n } from '@/i18n/i18n-context';
import { SITE_URL, storePath } from '@/lib/urls';
import { Logo } from '@/components/Logo';
import { catalogApi } from '@/services/endpoints';
import { cn } from '@/lib/cn';

const PROMO_KEY = 'eh_store_promo_dismissed';

export function StoreLayout() {
  const [open, setOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(true);
  const [q, setQ] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { locale, toggleLocale, dir, t } = useI18n();

  const categories = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => (await catalogApi.categories()).data,
  });

  useEffect(() => {
    if (sessionStorage.getItem(PROMO_KEY) === '1') setPromoOpen(false);
  }, []);

  const nav = [
    { to: '/', label: locale === 'ar' ? 'الرئيسية' : 'Home', end: true },
    { to: '/products', label: locale === 'ar' ? 'كل المنتجات' : 'All products' },
    {
      to: '/products?sort=bestsellers',
      label: locale === 'ar' ? 'الأكثر مبيعاً' : 'Best sellers',
    },
    {
      to: '/products?sort=newest',
      label: locale === 'ar' ? 'منتجات جديدة' : 'New arrivals',
    },
    { to: '/categories', label: locale === 'ar' ? 'الأقسام' : 'Categories' },
    { to: '/favorites', label: locale === 'ar' ? 'المفضلة' : 'Favorites' },
  ];

  const accountTo = isAuthenticated ? '/account/orders' : '/account/login';
  const accountLabel = locale === 'ar' ? 'حسابي' : 'Account';
  const accountName =
    isAuthenticated && user?.firstName && user.firstName !== 'Customer'
      ? user.firstName
      : accountLabel;

  const iconBtn =
    'inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white';

  function dismissPromo() {
    sessionStorage.setItem(PROMO_KEY, '1');
    setPromoOpen(false);
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    navigate(
      term
        ? `${storePath('products')}?q=${encodeURIComponent(term)}`
        : storePath('products'),
    );
    setOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-page text-fg" dir={dir}>
      {promoOpen ? (
        <div className="relative z-[60] bg-accent text-white">
          <div className="mx-auto flex max-w-[90rem] items-center justify-center gap-3 px-4 py-2 text-center text-xs font-semibold sm:text-sm lg:px-10">
            <Truck className="hidden h-4 w-4 shrink-0 sm:block" />
            <p>
              {locale === 'ar'
                ? 'طلب صناعي موثّق — سجّل حسابك بالهاتف وأكّد OTP لإتمام الطلب بسرعة'
                : 'Verified industrial orders — register with phone OTP and checkout fast'}
            </p>
            <Link
              to={storePath('products')}
              className="hidden underline underline-offset-2 hover:text-white/90 sm:inline"
            >
              {locale === 'ar' ? 'تسوق الآن' : 'Shop now'}
            </Link>
            <button
              type="button"
              onClick={dismissPromo}
              className="absolute end-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md hover:bg-white/15"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-10">
          <Logo to="/" imgClassName="h-9 sm:h-10" />

          <form onSubmit={onSearch} className="mx-2 hidden min-w-0 flex-1 md:flex">
            <div className="flex h-11 w-full max-w-xl overflow-hidden rounded-lg border border-white/15 bg-white/5 focus-within:border-accent">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  locale === 'ar' ? 'ابحث عن منتج أو SKU...' : 'Search product or SKU...'
                }
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                className="inline-flex h-full items-center gap-1.5 bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-soft"
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline">{locale === 'ar' ? 'بحث' : 'Search'}</span>
              </button>
            </div>
          </form>

          <div className="ms-auto flex items-center gap-1">
            <button type="button" onClick={toggleLocale} className={cn(iconBtn, 'text-[11px] font-bold')}>
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
            <a href={SITE_URL} className={iconBtn} aria-label={locale === 'ar' ? 'الموقع' : 'Site'}>
              <Globe className="h-4 w-4" />
            </a>
            <Link
              to={accountTo}
              className="hidden h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-white hover:bg-white/10 sm:inline-flex"
            >
              <UserRound className="h-4 w-4" />
              <span className="max-w-[6.5rem] truncate">{accountName}</span>
            </Link>
            <div className="relative">
              <Link
                to="/cart"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-soft"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === 'ar' ? 'السلة' : 'Cart'}</span>
              </Link>
              {itemCount > 0 ? (
                <span className="absolute -end-1.5 -top-1.5 z-20 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black ring-2 ring-black">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              className={cn(iconBtn, 'md:hidden')}
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-white/10 bg-black px-4 py-3 md:hidden">
            <form onSubmit={onSearch} className="mb-3 flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={locale === 'ar' ? 'ابحث...' : 'Search...'}
                className="h-10 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-lg bg-accent px-3 text-white"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
            <div className="flex flex-col gap-1">
              {nav.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'rounded-md px-3 py-2.5 text-sm font-medium text-white/80',
                    location.pathname === l.to.split('?')[0] && 'bg-white/10 text-white',
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-2 border-t border-white/10 pt-2">
                <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/35">
                  {locale === 'ar' ? 'الأقسام' : 'Categories'}
                </p>
                {(categories.data ?? []).slice(0, 8).map((c) => (
                  <Link
                    key={c.id}
                    to={storePath(`categories/${c.slug}`)}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-white/70"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              <Link
                to={accountTo}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-semibold text-accent"
              >
                {accountLabel}
              </Link>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    void logout();
                    setOpen(false);
                  }}
                  className="rounded-md px-3 py-2.5 text-start text-sm text-white/50"
                >
                  {locale === 'ar' ? 'خروج' : 'Sign out'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-black text-white">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
          <div>
            <Logo to="/" imgClassName="h-9 brightness-0 invert" />
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              {locale === 'ar'
                ? 'متجر افاق الطاقة — معدات ومنتجات صناعية للمشاريع والمقاولات.'
                : 'Energy Horizon Store — industrial equipment for projects and contractors.'}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold">{locale === 'ar' ? 'التسوق' : 'Shop'}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-white/55">
              <Link to={storePath('products')} className="hover:text-white">
                {locale === 'ar' ? 'كل المنتجات' : 'All products'}
              </Link>
              <Link to={storePath('categories')} className="hover:text-white">
                {locale === 'ar' ? 'الأقسام' : 'Categories'}
              </Link>
              <Link to={storePath('products') + '?sort=bestsellers'} className="hover:text-white">
                {locale === 'ar' ? 'الأكثر مبيعاً' : 'Best sellers'}
              </Link>
              <Link to={storePath('favorites')} className="hover:text-white">
                {locale === 'ar' ? 'المفضلة' : 'Favorites'}
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold">{locale === 'ar' ? 'الحساب' : 'Account'}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-white/55">
              <Link to={accountTo} className="hover:text-white">
                {accountLabel}
              </Link>
              <Link to={storePath('cart')} className="hover:text-white">
                {locale === 'ar' ? 'السلة' : 'Cart'}
              </Link>
              <a href={SITE_URL} className="hover:text-white">
                {locale === 'ar' ? 'الموقع الرئيسي' : 'Main website'}
              </a>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold">{locale === 'ar' ? 'لماذا المتجر؟' : 'Why us?'}</p>
            <ul className="mt-3 space-y-2 text-sm text-white/55">
              <li>{locale === 'ar' ? 'طلب بحساب موثّق OTP' : 'OTP-verified checkout'}</li>
              <li>{locale === 'ar' ? 'كتالوج صناعي محدّث' : 'Live industrial catalog'}</li>
              <li>{locale === 'ar' ? 'دعم مشاريع ومقاولات' : 'Project & contractor support'}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-white/35 sm:px-6 lg:px-10">
            <span>© {new Date().getFullYear()} Energy Horizon Store</span>
            <span>{locale === 'ar' ? 'متجر صناعي' : 'Industrial store'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
