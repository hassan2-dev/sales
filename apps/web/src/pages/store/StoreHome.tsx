import { Link } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Heart, Package, ShieldCheck, Truck } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { ProductCard } from '@/components/ProductCard';
import { ProductSection } from '@/components/ProductSection';
import { Reveal } from '@/components/Reveal';
import { catalogApi } from '@/services/endpoints';
import { useFavorites } from '@/stores/favorites-context';
import { useI18n } from '@/i18n/i18n-context';
import { storePath } from '@/lib/urls';
import type { Product } from '@/types';

const BANNER_IMG =
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=2400&q=80';

export function StoreHomePage() {
  const { locale, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const { ids: favIds } = useFavorites();

  const bestsellers = useQuery({
    queryKey: ['store-bestsellers'],
    queryFn: async () =>
      (await catalogApi.products({ sortBy: 'bestsellers', limit: 8 })).data,
  });
  const newest = useQuery({
    queryKey: ['store-newest'],
    queryFn: async () =>
      (await catalogApi.products({ sortBy: 'createdAt', sortOrder: 'desc', limit: 8 })).data,
  });
  const featured = useQuery({
    queryKey: ['store-featured'],
    queryFn: async () => (await catalogApi.products({ featured: true, limit: 8 })).data,
  });
  const categories = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => (await catalogApi.categories()).data,
  });

  const favQueries = useQueries({
    queries: favIds.slice(0, 8).map((id) => ({
      queryKey: ['store-fav-product', id],
      queryFn: async () => (await catalogApi.productById(id)).data as Product,
      staleTime: 60_000,
    })),
  });
  const favoriteProducts = favQueries
    .map((q) => q.data)
    .filter((p): p is Product => Boolean(p));

  const copy = {
    eyebrow: locale === 'ar' ? 'متجر افاق الطاقة' : 'Energy Horizon Store',
    title:
      locale === 'ar'
        ? 'معدات صناعية جاهزة للموقع'
        : 'Field-ready industrial equipment',
    sub:
      locale === 'ar'
        ? 'كتالوج حيّ — أقسام، الأكثر مبيعاً، والجديد. للطلب عبر حسابي الموثّق.'
        : 'Live catalog — categories, bestsellers, and new arrivals. Order via verified My account.',
    shop: locale === 'ar' ? 'تصفح المنتجات' : 'Shop products',
    account: locale === 'ar' ? 'حسابي' : 'My account',
    favorites: locale === 'ar' ? 'المفضلة' : 'Favorites',
    cats: locale === 'ar' ? 'الأقسام' : 'Categories',
    catsSub:
      locale === 'ar'
        ? 'اختر التصنيف المناسب لمشروعك'
        : 'Pick the right category for your project',
    all: locale === 'ar' ? 'عرض الكل' : 'View all',
    favTitle: locale === 'ar' ? 'مفضلتك' : 'Your favorites',
    favSub:
      locale === 'ar'
        ? 'احفظ ما تحتاجه وارجع له بسرعة'
        : 'Save what you need and come back fast',
    trust1: locale === 'ar' ? 'مخزون حيّ' : 'Live stock',
    trust1s: locale === 'ar' ? 'أسعار وكميات من الخادم' : 'Server-side prices & qty',
    trust2: locale === 'ar' ? 'توريد ميداني' : 'Field supply',
    trust2s: locale === 'ar' ? 'دعم مواقع النفط والغاز' : 'Oil & gas site support',
    trust3: locale === 'ar' ? 'حسابي موثّق' : 'Verified My account',
    trust3s: locale === 'ar' ? 'اسم + هاتف + OTP' : 'Name + phone + OTP',
  };

  return (
    <>
      <Seo title={locale === 'ar' ? 'المتجر' : 'Store'} path={storePath()} />

      <section className="relative min-h-[min(78svh,42rem)] overflow-hidden text-white">
        <img src={BANNER_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/35 rtl:bg-gradient-to-l" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgb(0_112_192/0.35),transparent_55%)]" />

        <div className="relative mx-auto flex min-h-[min(78svh,42rem)] max-w-[90rem] flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-10">
          <Reveal>
            <Badge className="w-fit rounded-md border-0 bg-accent/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent hover:bg-accent/20">
              {copy.eyebrow}
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-white/70 sm:text-lg">
              {copy.sub}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={storePath('products')} className="btn-cta btn-cta-primary btn-shine">
                {copy.shop}
                <Arrow className="h-4 w-4" />
              </Link>
              <Link
                to={`${storePath('products')}?sort=bestsellers`}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-accent/50 bg-accent/20 px-5 text-sm font-extrabold text-white backdrop-blur-sm transition hover:bg-accent"
              >
                {locale === 'ar' ? 'الأكثر مبيعاً' : 'Best sellers'}
              </Link>
              <Link
                to={storePath('account/login')}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-accent hover:bg-accent"
              >
                {copy.account}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-line bg-elevated">
        <div className="mx-auto grid max-w-[90rem] gap-px bg-[var(--border)] sm:grid-cols-3">
          {[
            { icon: Package, t: copy.trust1, s: copy.trust1s },
            { icon: Truck, t: copy.trust2, s: copy.trust2s },
            { icon: ShieldCheck, t: copy.trust3, s: copy.trust3s },
          ].map((item) => (
            <div key={item.t} className="flex items-start gap-4 bg-page px-5 py-6 sm:px-8">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-fg">{item.t}</p>
                <p className="mt-1 text-sm text-muted">{item.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-[90rem] space-y-20 px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <section>
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                {copy.cats}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {copy.catsSub}
              </h2>
            </div>
            <Link
              to={storePath('categories')}
              className="group inline-flex items-center gap-2 text-sm font-bold text-accent transition hover:gap-3"
            >
              {locale === 'ar' ? 'كل الأقسام' : 'All categories'}
              <Arrow className="h-4 w-4" />
            </Link>
          </Reveal>

          {categories.isLoading ? <LoadingState variant="cards" /> : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(categories.data ?? []).slice(0, 8).map((c, i) => (
              <Reveal key={c.id} delay={i % 4}>
                <Link
                  to={storePath(`categories/${c.slug}`)}
                  className="group relative flex min-h-[9.5rem] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card p-5 transition duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_20px_40px_-28px_rgb(0_112_192/0.5)]"
                >
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-20"
                    />
                  ) : (
                    <div
                      className="pointer-events-none absolute -end-8 -top-8 h-28 w-28 rounded-full bg-accent/10 blur-2xl transition group-hover:bg-accent/25"
                      aria-hidden
                    />
                  )}
                  <span className="relative font-kpi text-3xl text-accent/30 transition group-hover:text-accent/60">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="relative mt-3 text-lg font-extrabold tracking-tight text-fg">
                    {c.name}
                  </p>
                  {c.description ? (
                    <p className="relative mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
                  ) : null}
                </Link>
              </Reveal>
            ))}
          </div>
          {!categories.isLoading && !(categories.data ?? []).length ? (
            <EmptyState title={locale === 'ar' ? 'لا توجد تصنيفات' : 'No categories yet'} />
          ) : null}
        </section>

        <ProductSection
          eyebrow={locale === 'ar' ? 'الأكثر مبيعاً' : 'Best sellers'}
          title={
            locale === 'ar' ? 'المنتجات الأعلى طلباً' : 'Most ordered products'
          }
          products={bestsellers.data?.data}
          loading={bestsellers.isLoading}
          error={bestsellers.isError}
          onRetry={() => void bestsellers.refetch()}
          emptyTitle={locale === 'ar' ? 'لا توجد مبيعات بعد' : 'No sales yet'}
          viewAllTo={`${storePath('products')}?sort=bestsellers`}
          viewAllLabel={copy.all}
          badge={locale === 'ar' ? 'مبيعات' : 'Top'}
        />

        <ProductSection
          eyebrow={locale === 'ar' ? 'وصل حديثاً' : 'New arrivals'}
          title={locale === 'ar' ? 'المنتجات الجديدة' : 'Newest products'}
          products={newest.data?.data}
          loading={newest.isLoading}
          error={newest.isError}
          onRetry={() => void newest.refetch()}
          emptyTitle={locale === 'ar' ? 'لا توجد منتجات جديدة' : 'No new products'}
          viewAllTo={`${storePath('products')}?sort=newest`}
          viewAllLabel={copy.all}
          badge={locale === 'ar' ? 'جديد' : 'New'}
        />

        {(featured.data?.data?.length ?? 0) > 0 ? (
          <ProductSection
            eyebrow={locale === 'ar' ? 'مميز' : 'Featured'}
            title={locale === 'ar' ? 'منتجات مميزة' : 'Featured picks'}
            products={featured.data?.data}
            loading={featured.isLoading}
            viewAllTo={storePath('products')}
            viewAllLabel={copy.all}
            badge={locale === 'ar' ? 'مميز' : 'Featured'}
          />
        ) : null}

        <section className="rounded-3xl border border-border bg-elevated p-6 sm:p-8 lg:p-10">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                {copy.favTitle}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {copy.favSub}
              </h2>
            </div>
            <Link
              to={storePath('favorites')}
              className="group inline-flex items-center gap-2 text-sm font-bold text-accent transition hover:gap-3"
            >
              {copy.favorites}
              <Arrow className="h-4 w-4" />
            </Link>
          </Reveal>

          {favIds.length === 0 ? (
            <EmptyState
              title={locale === 'ar' ? 'المفضلة فارغة' : 'No favorites yet'}
              description={
                locale === 'ar'
                  ? 'اضغط القلب على أي منتج لحفظه هنا'
                  : 'Tap the heart on any product to save it here'
              }
              action={{
                label: copy.shop,
                onClick: () => {
                  window.location.assign(storePath('products'));
                },
              }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {favoriteProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-center">
          <Link to={storePath('products')}>
            <Button size="lg" className="rounded-xl px-8">
              <Heart className="h-4 w-4" />
              {copy.all}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
