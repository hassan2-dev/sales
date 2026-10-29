import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Headphones,
  Percent,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Seo } from '@/lib/seo';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { ProductCard } from '@/components/ProductCard';
import { SectionHead } from '@/components/store/StoreUI';
import { CategoryHomeShowcase } from '@/components/store/CategoryDirectory';
import { catalogApi } from '@/services/endpoints';
import { useI18n } from '@/i18n/i18n-context';
import { storePath } from '@/lib/urls';

/** Industrial sunset / refinery — matches mockup energy */
const HERO_BG =
  'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=2400&q=80';

export function StoreHomePage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const [q, setQ] = useState('');

  const categories = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => (await catalogApi.categories()).data,
  });
  const brands = useQuery({
    queryKey: ['store-brands'],
    queryFn: async () => (await catalogApi.brands()).data,
  });
  const featured = useQuery({
    queryKey: ['store-home-featured'],
    queryFn: async () =>
      (await catalogApi.products({ featured: true, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }))
        .data,
  });
  const newest = useQuery({
    queryKey: ['store-home-newest'],
    queryFn: async () =>
      (await catalogApi.products({ sortBy: 'createdAt', sortOrder: 'desc', limit: 10 })).data,
  });
  const bestsellers = useQuery({
    queryKey: ['store-home-bestsellers'],
    queryFn: async () =>
      (await catalogApi.products({ sortBy: 'bestsellers', sortOrder: 'desc', limit: 10 })).data,
  });

  const cats = categories.data ?? [];
  const brandList = brands.data ?? [];
  const featuredList = featured.data?.data ?? [];

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    navigate(
      term
        ? `${storePath('products')}?q=${encodeURIComponent(term)}`
        : storePath('products'),
    );
  }

  const trust = [
    {
      icon: ShieldCheck,
      title: locale === 'ar' ? 'منتجات أصلية' : 'Original products',
      text: locale === 'ar' ? 'علامات صناعية موثوقة' : 'Trusted industrial brands',
    },
    {
      icon: Headphones,
      title: locale === 'ar' ? 'دعم فني متخصص' : 'Technical support',
      text: locale === 'ar' ? 'لفرق المشاريع والمقاولات' : 'For project & contractor teams',
    },
    {
      icon: Truck,
      title: locale === 'ar' ? 'توريد سريع' : 'Fast supply',
      text: locale === 'ar' ? 'تغطية داخل العراق' : 'Nationwide Iraq coverage',
    },
    {
      icon: Percent,
      title: locale === 'ar' ? 'عروض للمشاريع' : 'Project offers',
      text: locale === 'ar' ? 'أسعار وكميات خاصة' : 'Volume & project pricing',
    },
  ];

  const stats = [
    { value: '500+', label: locale === 'ar' ? 'مشروع مكتمل' : 'Completed projects' },
    { value: '50+', label: locale === 'ar' ? 'علامة عالمية' : 'Global brands' },
    { value: '10+', label: locale === 'ar' ? 'سنوات خبرة' : 'Years experience' },
    { value: '24/7', label: locale === 'ar' ? 'دعم فني' : 'Technical support' },
  ];

  return (
    <>
      <Seo title={locale === 'ar' ? 'متجر افاق الطاقة' : 'Energy Horizon Store'} path={storePath()} />

      {/* Hero — mockup: full-bleed industrial + dual CTA */}
      <section className="relative isolate min-h-[72vh] overflow-hidden bg-navy text-white sm:min-h-[78vh]">
        <img
          src={HERO_BG}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-navy/55" />
        <div className="absolute inset-0 bg-linear-to-t from-navy via-navy/40 to-navy/25" />
        <div className="absolute inset-0 bg-linear-to-l from-transparent via-navy/30 to-navy/75" />

        <div className="relative mx-auto flex min-h-[72vh] max-w-[90rem] flex-col justify-end px-4 pb-14 pt-20 sm:min-h-[78vh] sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <div className="max-w-3xl reveal">
            <p className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-white/90 backdrop-blur-sm">
              {locale === 'ar' ? 'افاق الطاقة · العراق' : 'Energy Horizon · Iraq'}
            </p>
            <h1 className="text-[1.85rem] font-extrabold leading-[1.2] tracking-tight sm:text-4xl lg:text-5xl xl:text-[3.25rem]">
              {locale === 'ar'
                ? 'حلول متكاملة لقطاع النفط والغاز في العراق'
                : 'Integrated solutions for oil & gas in Iraq'}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              {locale === 'ar'
                ? 'كتالوج صناعي حي — أضف للسلة واشترِ مباشرة، وللطلبات الكبيرة اطلب عرض سعر من السلة.'
                : 'Live industrial catalog — add to cart and buy directly; for large orders, request a quote from the cart.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={storePath('products')}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-extrabold text-white shadow-[0_12px_32px_-12px_rgb(0_112_192/0.7)] transition hover:bg-accent-soft"
              >
                {locale === 'ar' ? 'تصفح المنتجات' : 'Browse products'}
                <Arrow className="h-4 w-4" />
              </Link>
              <Link
                to={storePath('cart')}
                className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-white/55 bg-white/5 px-6 text-sm font-extrabold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/15"
              >
                {locale === 'ar' ? 'السلة' : 'Cart'}
              </Link>
            </div>

            {/* Compact search under CTAs — keeps header clean like mockup */}
            <form onSubmit={onSearch} className="mt-8 max-w-xl">
              <div className="store-search h-12 border-0 shadow-[0_20px_50px_-24px_rgb(0_0_0/0.55)]">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-3.5">
                  <Search className="h-4 w-4 shrink-0 text-muted" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={
                      locale === 'ar'
                        ? 'ابحث عن منتج أو SKU...'
                        : 'Search product or SKU...'
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-slate-500 placeholder:opacity-100 dark:placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-full shrink-0 items-center bg-navy px-4 text-sm font-bold text-white hover:bg-accent"
                >
                  {locale === 'ar' ? 'بحث' : 'Search'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Trust strip — mockup dark blue value cards */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-[90rem] gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-4 lg:px-10 lg:py-6">
          {trust.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm transition hover:bg-white/10"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold">{f.title}</p>
                <p className="mt-0.5 text-xs text-white/60">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[90rem] space-y-16 px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <section>
          <SectionHead
            title={locale === 'ar' ? 'كتالوج الأقسام' : 'Category catalog'}
            subtitle={
              locale === 'ar'
                ? 'مجموعات صناعية مرتّبة — اختر المجموعة ثم القسم المناسب'
                : 'Industrial groups, organized — pick a group, then the right section'
            }
            action={
              <Link
                to={storePath('categories')}
                className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:text-accent-soft"
              >
                {locale === 'ar' ? 'الدليل الكامل' : 'Full directory'}
                <Arrow className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {categories.isLoading ? <LoadingState variant="cards" /> : null}
          {!categories.isLoading && cats.length ? (
            <CategoryHomeShowcase categories={cats} locale={locale} />
          ) : null}
          {!categories.isLoading && !cats.length ? (
            <EmptyState title={locale === 'ar' ? 'لا توجد أقسام' : 'No categories'} />
          ) : null}
        </section>
      </div>

      {/* Stats band — mockup industrial proof */}
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <img
          src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=2000&q=70"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-navy/80" />
        <div className="relative mx-auto grid max-w-[90rem] gap-8 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10 lg:py-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center lg:text-start">
              <p className="text-3xl font-extrabold tracking-tight text-accent-soft sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[90rem] space-y-16 px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        {featuredList.length > 0 ? (
          <section>
            <SectionHead
              title={locale === 'ar' ? 'منتجات مميزة' : 'Featured products'}
              subtitle={
                locale === 'ar'
                  ? 'اختيارات تقنية لمشاريع الطاقة'
                  : 'Curated picks for energy projects'
              }
              action={
                <Link
                  to={storePath('products')}
                  className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:text-accent-soft"
                >
                  {locale === 'ar' ? 'عرض الكل' : 'View all'}
                  <Arrow className="h-3.5 w-3.5" />
                </Link>
              }
            />
            {featured.isLoading ? <LoadingState variant="products" /> : null}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {featuredList.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  badge={locale === 'ar' ? 'مميز' : 'Featured'}
                />
              ))}
            </div>
          </section>
        ) : null}

        {brandList.length > 0 ? (
          <section>
            <SectionHead
              title={locale === 'ar' ? 'العلامات التجارية' : 'Trusted brands'}
              subtitle={
                locale === 'ar' ? 'شركاء توريد صناعي موثوقون' : 'Trusted industrial supply partners'
              }
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {brandList.map((b) => (
                <Link
                  key={b.id}
                  to={storePath(`brands/${b.slug}`)}
                  title={
                    locale === 'ar' ? `عرض منتجات ${b.name}` : `View ${b.name} products`
                  }
                  aria-label={
                    locale === 'ar' ? `فتح صفحة ${b.name}` : `Open ${b.name} brand page`
                  }
                  className="group flex flex-col items-center justify-center gap-2 border border-border bg-card px-3 py-4 transition duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md sm:px-4 sm:py-5"
                >
                  <span className="flex h-12 w-full items-center justify-center sm:h-14">
                    {b.logo ? (
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="max-h-10 max-w-full object-contain transition duration-300 group-hover:scale-[1.04] sm:max-h-11"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-center text-sm font-extrabold text-fg">{b.name}</span>
                    )}
                  </span>
                  <span className="line-clamp-1 text-center text-[11px] font-bold tracking-wide text-muted transition group-hover:text-accent sm:text-xs">
                    {b.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <SectionHead
            title={locale === 'ar' ? 'وصل حديثاً' : 'New arrivals'}
            subtitle={
              locale === 'ar' ? 'آخر ما أُضيف للكتالوج' : 'Latest additions to the catalog'
            }
            action={
              <Link
                to={storePath('products') + '?sort=newest'}
                className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:text-accent-soft"
              >
                {locale === 'ar' ? 'عرض الكل' : 'View all'}
                <Arrow className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {newest.isLoading ? <LoadingState variant="products" /> : null}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {(newest.data?.data ?? []).map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                badge={locale === 'ar' ? 'جديد' : 'New'}
              />
            ))}
          </div>
          {!newest.isLoading && !(newest.data?.data ?? []).length ? (
            <EmptyState title={locale === 'ar' ? 'لا توجد منتجات' : 'No products'} />
          ) : null}
        </section>

        <section>
          <SectionHead
            title={locale === 'ar' ? 'الأكثر مبيعاً' : 'Best sellers'}
            subtitle={
              locale === 'ar' ? 'الأكثر طلباً من المشاريع' : 'Most ordered by project teams'
            }
            action={
              <Link
                to={storePath('products') + '?sort=bestsellers'}
                className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:text-accent-soft"
              >
                {locale === 'ar' ? 'عرض الكل' : 'View all'}
                <Arrow className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {bestsellers.isLoading ? <LoadingState variant="products" /> : null}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {(bestsellers.data?.data ?? []).map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                badge={locale === 'ar' ? 'مبيعات' : 'Top'}
              />
            ))}
          </div>
        </section>

        {/* Projects CTA — mockup large project band */}
        <section className="relative overflow-hidden rounded-3xl bg-navy text-white">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=70"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-l from-navy/95 via-navy/80 to-navy/55" />
          <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-12">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-soft">
                {locale === 'ar' ? 'مشاريع خاصة' : 'Special projects'}
              </p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {locale === 'ar'
                  ? 'طلبات كبيرة وعروض للمشاريع'
                  : 'Large orders & project quotes'}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {locale === 'ar'
                  ? 'أضف 10 قطع أو أكثر للسلة (أو 10 من منتج واحد) — يظهر خيار عرض السعر من ملخص السلة.'
                  : 'Add 10+ units to the cart (or 10 of one product) — the quote option appears in the cart summary.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={storePath('products')}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-extrabold text-white hover:bg-accent-soft"
              >
                {locale === 'ar' ? 'تصفح المنتجات' : 'Browse products'}
              </Link>
              <Link
                to={storePath('cart')}
                className="inline-flex h-12 items-center rounded-xl border border-white/35 px-6 text-sm font-bold text-white hover:bg-white/10"
              >
                {locale === 'ar' ? 'السلة' : 'Cart'}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
