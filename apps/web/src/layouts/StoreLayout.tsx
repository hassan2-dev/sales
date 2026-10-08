import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Globe,
  Heart,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  UserRound,
} from 'lucide-react';
import { useCart } from '@/stores/cart-context';
import { useTheme } from '@/stores/theme-context';
import { useAuth } from '@/stores/auth-context';
import { useFavorites } from '@/stores/favorites-context';
import { useI18n } from '@/i18n/i18n-context';
import { SITE_URL, storePath } from '@/lib/urls';
import { Logo } from '@/components/Logo';
import { MobileNavPanel } from '@/components/MobileNavPanel';
import { catalogApi } from '@/services/endpoints';
import { CompareBar } from '@/components/store/CompareBar';
import { useCompare } from '@/stores/compare-context';
import { cn } from '@/lib/cn';
import { trackSiteVisit } from '@/lib/visitor';

export function StoreLayout() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { ids: favIds } = useFavorites();
  const { count: compareCount } = useCompare();
  const { locale, toggleLocale, dir, t } = useI18n();

  const location = useLocation();

  useEffect(() => {
    trackSiteVisit('store');
  }, []);
  const categories = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => (await catalogApi.categories()).data,
  });

  const productsPath = storePath('products');
  const nav = [
    { to: storePath(), label: locale === 'ar' ? 'الرئيسية' : 'Home', end: true as boolean | undefined },
    {
      to: productsPath,
      label: locale === 'ar' ? 'المنتجات' : 'Products',
      match: 'products-all' as const,
    },
    {
      to: `${productsPath}?sort=bestsellers`,
      label: locale === 'ar' ? 'الأكثر مبيعاً' : 'Best sellers',
      match: 'bestsellers' as const,
    },
    {
      to: `${productsPath}?sort=newest`,
      label: locale === 'ar' ? 'وصل حديثاً' : 'New arrivals',
      match: 'newest' as const,
    },
    { to: storePath('categories'), label: locale === 'ar' ? 'الأقسام' : 'Categories' },
  ];

  function isNavActive(match?: 'products-all' | 'bestsellers' | 'newest') {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    const productsBase = productsPath.replace(/\/+$/, '') || '/products';
    const onProducts = path === productsBase;
    const sort = new URLSearchParams(location.search).get('sort');

    if (match === 'bestsellers') return onProducts && sort === 'bestsellers';
    if (match === 'newest') return onProducts && sort === 'newest';
    if (match === 'products-all') {
      return onProducts && sort !== 'bestsellers' && sort !== 'newest';
    }
    return false;
  }

  const accountTo = isAuthenticated ? storePath('account') : storePath('account/login');
  const accountLabel = locale === 'ar' ? 'حسابي' : 'Account';
  const accountName =
    isAuthenticated && user?.firstName && user.firstName !== 'Customer'
      ? user.firstName
      : accountLabel;

  const iconBtn =
    'inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-secondary hover:text-fg';

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

  const storeActions = [
    {
      label: locale === 'ar' ? 'السلة' : 'Cart',
      to: storePath('cart'),
      variant: 'primary' as const,
    },
    {
      label: accountLabel,
      to: accountTo,
      variant: 'secondary' as const,
    },
    ...(isAuthenticated
      ? [
          {
            label: locale === 'ar' ? 'خروج' : 'Sign out',
            variant: 'ghost' as const,
            onClick: () => {
              void logout();
            },
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-page text-fg" dir={dir}>
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 min-w-0 max-w-[90rem] items-center gap-1 px-2.5 sm:h-[4.25rem] sm:gap-3 sm:px-6 lg:px-10">
          <Logo
            to={storePath()}
            imgClassName="h-7 max-w-[110px] sm:h-10 sm:max-w-none"
            className="min-w-0 shrink"
          />

          <form onSubmit={onSearch} className="mx-2 hidden min-w-0 flex-1 md:flex">
            <div className="store-search w-full max-w-2xl">
              <div className="flex min-w-0 flex-1 items-center gap-2 px-3.5">
                <Search className="h-4 w-4 shrink-0 text-muted" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={
                    locale === 'ar'
                      ? 'ابحث بالمنتج أو SKU أو المواصفات...'
                      : 'Search products, SKU, or specs...'
                  }
                  className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-slate-500 placeholder:opacity-100 dark:placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-full shrink-0 items-center gap-1.5 bg-accent px-4 text-sm font-bold text-white transition hover:bg-accent-soft sm:px-5"
              >
                {locale === 'ar' ? 'بحث' : 'Search'}
              </button>
            </div>
          </form>

          <div className="ms-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={toggleLocale}
              className={cn(iconBtn, 'h-9 w-9 text-[11px] font-extrabold sm:h-10 sm:w-10')}
            >
              {locale === 'en' ? 'ع' : 'EN'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(iconBtn, 'hidden sm:inline-flex')}
              aria-label={theme === 'light' ? t.theme.dark : t.theme.light}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <a
              href={SITE_URL}
              className={cn(iconBtn, 'hidden lg:inline-flex')}
              aria-label={locale === 'ar' ? 'الموقع' : 'Site'}
            >
              <Globe className="h-4 w-4" />
            </a>
            <Link
              to={storePath('favorites')}
              className={cn(iconBtn, 'relative hidden sm:inline-flex')}
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
              {favIds.length > 0 ? (
                <span className="absolute end-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                  {favIds.length > 9 ? '9+' : favIds.length}
                </span>
              ) : null}
            </Link>
            <Link
              to={accountTo}
              className={cn(iconBtn, 'md:hidden')}
              aria-label={accountLabel}
            >
              <UserRound className="h-4 w-4" />
            </Link>
            <Link
              to={accountTo}
              className="hidden h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold text-muted transition hover:bg-secondary hover:text-fg md:inline-flex"
            >
              <UserRound className="h-4 w-4" />
              <span className="max-w-[6.5rem] truncate">{accountName}</span>
            </Link>
            <div className="relative">
              <Link
                to={storePath('cart')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-sm font-bold text-white transition hover:bg-accent sm:h-10 sm:w-auto sm:gap-1.5 sm:px-3"
                aria-label={locale === 'ar' ? 'السلة' : 'Cart'}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === 'ar' ? 'السلة' : 'Cart'}</span>
              </Link>
              {itemCount > 0 ? (
                <span className="absolute -end-1.5 -top-1.5 z-20 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white ring-2 ring-card">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              className={cn(iconBtn, 'h-9 w-9 md:hidden sm:h-10 sm:w-10')}
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="hidden border-t border-border md:block">
          <div className="mx-auto flex max-w-[90rem] items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-10">
            {nav.map((l) => {
              const active =
                'match' in l && l.match
                  ? isNavActive(l.match)
                  : undefined;
              return (
              <NavLink
                key={l.to}
                to={l.to}
                end={'end' in l ? l.end : undefined}
                className={({ isActive }) =>
                  cn(
                    'relative whitespace-nowrap px-3 py-3 text-sm font-semibold text-muted transition hover:text-fg',
                    (active ?? isActive) && 'text-fg',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {(active ?? isActive) ? (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent" />
                    ) : null}
                  </>
                )}
              </NavLink>
              );
            })}
          </div>
        </nav>
      </header>

      <MobileNavPanel
        open={open}
        onClose={() => setOpen(false)}
        logoTo={storePath()}
        hideFrom="md"
        links={nav.map(({ to, label }) => ({ to, label }))}
        middle={
          <>
            <form onSubmit={onSearch} className="px-5 pt-2">
              <div className="store-search h-12">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-3.5">
                  <Search className="h-4 w-4 shrink-0 text-muted" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={locale === 'ar' ? 'ابحث...' : 'Search...'}
                    className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-slate-500 placeholder:opacity-100 dark:placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-full shrink-0 items-center bg-accent px-4 text-sm font-bold text-white"
                >
                  {locale === 'ar' ? 'بحث' : 'Go'}
                </button>
              </div>
            </form>
            {(categories.data ?? []).length > 0 ? (
              <div className="mt-3 flex flex-wrap justify-center gap-2 px-5">
                {(categories.data ?? []).slice(0, 6).map((c) => (
                  <Link
                    key={c.id}
                    to={storePath(`categories/${c.slug}`)}
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-muted dark:bg-white/5"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </>
        }
        extraTools={
          <Link
            to={storePath('favorites')}
            onClick={() => setOpen(false)}
            className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-bold text-muted hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Heart className="h-4 w-4" />
            {favIds.length || ''}
          </Link>
        }
        actions={storeActions}
      />

      <main
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          compareCount > 0 && 'pb-24',
        )}
      >
        <Outlet />
      </main>

      <CompareBar />

      <footer className="mt-auto border-t border-line bg-card pb-[env(safe-area-inset-bottom)] text-fg">
        <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-4">
            <Logo
              to={storePath()}
              imgClassName="h-12 max-w-[180px] sm:h-14 sm:max-w-[200px]"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {locale === 'ar'
                ? 'متجر افاق الطاقة — منصة B2B لمعدات النفط والغاز والصناعة في العراق.'
                : 'Energy Horizon Store — B2B marketplace for oil, gas & industrial equipment in Iraq.'}
            </p>
            <Link
              to={storePath('cart')}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-white hover:bg-accent-soft"
            >
              <ShoppingCart className="h-4 w-4" />
              {locale === 'ar' ? 'عرض السلة' : 'View cart'}
            </Link>
          </div>
          <div className="lg:col-span-2">
            <p className="text-sm font-bold">{locale === 'ar' ? 'المنتجات' : 'Products'}</p>
            <div className="mt-3 flex flex-col gap-2.5 text-sm text-muted [&_a]:transition [&_a:hover]:text-fg">
              <Link to={storePath('products')}>
                {locale === 'ar' ? 'كل المنتجات' : 'All products'}
              </Link>
              <Link to={storePath('categories')}>
                {locale === 'ar' ? 'الأقسام' : 'Categories'}
              </Link>
              <Link to={storePath('products') + '?sort=bestsellers'}>
                {locale === 'ar' ? 'الأكثر مبيعاً' : 'Best sellers'}
              </Link>
              <Link to={storePath('products') + '?sort=newest'}>
                {locale === 'ar' ? 'وصل حديثاً' : 'New arrivals'}
              </Link>
            </div>
          </div>
          <div className="lg:col-span-2">
            <p className="text-sm font-bold">{locale === 'ar' ? 'الدعم' : 'Support'}</p>
            <div className="mt-3 flex flex-col gap-2.5 text-sm text-muted [&_a]:transition [&_a:hover]:text-fg">
              <Link to={storePath('cart')}>
                {locale === 'ar' ? 'السلة وعروض المشاريع' : 'Cart & project quotes'}
              </Link>
              <Link to={storePath('favorites')}>
                {locale === 'ar' ? 'المفضلة' : 'Wishlist'}
              </Link>
              <Link to={storePath('cart')}>
                {locale === 'ar' ? 'السلة' : 'Cart'}
              </Link>
              <a href={SITE_URL}>
                {locale === 'ar' ? 'الموقع الرئيسي' : 'Corporate site'}
              </a>
            </div>
          </div>
          <div className="lg:col-span-2">
            <p className="text-sm font-bold">{locale === 'ar' ? 'الشركة' : 'Company'}</p>
            <div className="mt-3 flex flex-col gap-2.5 text-sm text-muted [&_a]:transition [&_a:hover]:text-fg">
              <Link to={accountTo}>
                {accountLabel}
              </Link>
              <a href={SITE_URL}>
                {locale === 'ar' ? 'عن افاق الطاقة' : 'About Energy Horizon'}
              </a>
              <span>{locale === 'ar' ? 'تغطية العراق' : 'Iraq coverage'}</span>
              <span>{locale === 'ar' ? 'دعم مشاريع B2B' : 'B2B project support'}</span>
            </div>
          </div>
          <div className="lg:col-span-2">
            <p className="text-sm font-bold">{locale === 'ar' ? 'تواصل سريع' : 'Quick contact'}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {locale === 'ar'
                ? 'للكميات الكبيرة والمشاريع الخاصة تواصل مع فريق المبيعات.'
                : 'For volume orders and special projects, contact our sales team.'}
            </p>
            <Link
              to={storePath('products')}
              className="mt-4 inline-flex text-sm font-bold text-accent hover:text-accent-soft"
            >
              {locale === 'ar' ? 'تصفح الكتالوج ←' : 'Browse catalog →'}
            </Link>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-muted/80 sm:px-6 lg:px-10">
            <span>© {new Date().getFullYear()} Energy Horizon · افاق الطاقة</span>
            <span>{locale === 'ar' ? 'سوق صناعي B2B' : 'Industrial B2B marketplace'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
