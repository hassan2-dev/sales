import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bolt,
  Box,
  Cable,
  CircuitBoard,
  Cog,
  Factory,
  FileText,
  Flame,
  Gauge,
  HardHat,
  Headphones,
  Layers,
  Package,
  Search,
  ShieldCheck,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { Seo } from '@/lib/seo';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { ProductCard } from '@/components/ProductCard';
import { SectionHead } from '@/components/store/StoreUI';
import { catalogApi } from '@/services/endpoints';
import { useI18n } from '@/i18n/i18n-context';
import { storePath } from '@/lib/urls';
import { cn } from '@/lib/cn';

const HERO_BG =
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=2400&q=80';

const CAT_ICONS: LucideIcon[] = [
  Wrench,
  Bolt,
  Gauge,
  Cable,
  CircuitBoard,
  Cog,
  Flame,
  HardHat,
  Factory,
  Layers,
  Box,
  Package,
];

const CAT_TONES = [
  'bg-[#e8f3fb] text-[#0070c0]',
  'bg-[#eef2f7] text-[#0b1f3a]',
  'bg-[#e8f6f2] text-[#0f766e]',
  'bg-[#f0f4f8] text-[#334155]',
  'bg-[#eef6ff] text-[#0369a1]',
  'bg-[#f5f7fa] text-[#475569]',
];

function pickIcon(slug: string, index: number): LucideIcon {
  const s = slug.toLowerCase();
  if (s.includes('cable') || s.includes('wire')) return Cable;
  if (s.includes('pump') || s.includes('valve')) return Gauge;
  if (s.includes('electr') || s.includes('power')) return Bolt;
  if (s.includes('tool') || s.includes('wrench')) return Wrench;
  if (s.includes('safe') || s.includes('ppe')) return HardHat;
  if (s.includes('fire')) return Flame;
  if (s.includes('indust') || s.includes('factory')) return Factory;
  return CAT_ICONS[index % CAT_ICONS.length];
}

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

  return (
    <>
      <Seo title={locale === 'ar' ? 'متجر افاق الطاقة' : 'Energy Horizon Store'} path={storePath()} />

      <section className="relative isolate overflow-hidden bg-navy text-white">
        <img
          src={HERO_BG}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-r from-navy via-navy/88 to-navy/55 rtl:bg-linear-to-l" />
        <div className="absolute inset-0 bg-linear-to-t from-navy/70 via-transparent to-navy/20" />

        <div className="relative mx-auto max-w-[90rem] px-4 py-12 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
          <div className="max-w-3xl reveal">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent-soft">
              {locale === 'ar' ? 'افاق الطاقة · Energy Horizon' : 'Energy Horizon · افاق الطاقة'}
            </p>
            <h1 className="mt-4 text-[1.75rem] font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
              {locale === 'ar' ? (
                <>
                  سوق صناعي موثوق لـ{' '}
                  <span className="text-accent-soft">معدات الطاقة</span>
                </>
              ) : (
                <>
                  Premium industrial marketplace for{' '}
                  <span className="text-accent-soft">energy equipment</span>
                </>
              )}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              {locale === 'ar'
                ? 'اكتشف منتجات النفط والغاز والصناعة، قارن المواصفات، اشترِ مباشرة أو اطلب عرض سعر لمشروعك.'
                : 'Discover oil & gas and industrial products, compare specs, buy directly or request a project quote.'}
            </p>

            <form onSubmit={onSearch} className="mt-8">
              <div className="store-search h-12 max-w-2xl border-0 shadow-[0_20px_50px_-24px_rgb(0_0_0/0.55)] sm:h-14">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-3 sm:gap-2.5 sm:px-4">
                  <Search className="h-4 w-4 shrink-0 text-muted sm:h-5 sm:w-5" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={
                      locale === 'ar'
                        ? 'ابحث عن مضخة، كابل، SKU...'
                        : 'Search pumps, cables, SKU...'
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-muted sm:text-[15px]"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-full shrink-0 items-center gap-1.5 bg-accent px-4 text-sm font-extrabold text-white transition hover:bg-accent-soft sm:gap-2 sm:px-6"
                >
                  {locale === 'ar' ? 'بحث' : 'Search'}
                  <Arrow className="hidden h-4 w-4 sm:block" />
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={storePath('products')}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-navy transition hover:bg-mist"
              >
                {locale === 'ar' ? 'تصفح الكتالوج' : 'Browse catalog'}
              </Link>
              <Link
                to={storePath('quote')}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/30 px-5 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
              >
                <FileText className="h-4 w-4" />
                {locale === 'ar' ? 'طلب عرض سعر' : 'Request quote'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-[90rem] gap-5 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
          {[
            {
              icon: Truck,
              title: locale === 'ar' ? 'توريد مشاريع' : 'Project supply',
              text: locale === 'ar' ? 'طلب منظم للمقاولات' : 'Contractor-ready ordering',
            },
            {
              icon: ShieldCheck,
              title: locale === 'ar' ? 'حساب موثّق' : 'Verified account',
              text: locale === 'ar' ? 'OTP بالهاتف' : 'Phone OTP checkout',
            },
            {
              icon: Package,
              title: locale === 'ar' ? 'كتالوج حي' : 'Live catalog',
              text: locale === 'ar' ? 'مخزون ومواصفات محدّثة' : 'Updated stock & specs',
            },
            {
              icon: Headphones,
              title: locale === 'ar' ? 'دعم فني' : 'Technical support',
              text: locale === 'ar' ? 'لفرق المشاريع' : 'For project teams',
            },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-fg">{f.title}</p>
                <p className="mt-0.5 text-xs text-muted">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[90rem] space-y-16 px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <section>
          <SectionHead
            title={locale === 'ar' ? 'تسوق حسب القسم' : 'Shop by category'}
            subtitle={
              locale === 'ar'
                ? 'اختر القسم المناسب لمعدات مشروعك'
                : 'Find the right equipment category for your project'
            }
            action={
              <Link
                to={storePath('categories')}
                className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:text-accent-soft"
              >
                {locale === 'ar' ? 'عرض الكل' : 'View all'}
                <Arrow className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {categories.isLoading ? <LoadingState variant="cards" /> : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cats.map((c, i) => {
              const Icon = pickIcon(c.slug, i);
              const tone = CAT_TONES[i % CAT_TONES.length];
              return (
                <Link
                  key={c.id}
                  to={storePath(`categories/${c.slug}`)}
                  className="store-cat store-surface group overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md"
                  style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
                >
                  <div
                    className={cn(
                      'relative aspect-4/3 overflow-hidden',
                      !c.imageUrl && tone,
                    )}
                  >
                    {c.imageUrl ? (
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Icon className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-navy/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-base font-extrabold text-white">{c.name}</p>
                      {c.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-white/75">
                          {c.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {!categories.isLoading && !cats.length ? (
            <EmptyState title={locale === 'ar' ? 'لا توجد أقسام' : 'No categories'} />
          ) : null}
        </section>

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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
              title={locale === 'ar' ? 'العلامات التجارية' : 'Popular brands'}
              subtitle={
                locale === 'ar' ? 'شركاء توريد صناعي موثوقون' : 'Trusted industrial supply partners'
              }
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {brandList.map((b) => (
                <Link
                  key={b.id}
                  to={storePath(`brands/${b.slug}`)}
                  className="store-surface flex h-24 items-center justify-center px-4 transition hover:border-accent/40 hover:shadow-md"
                >
                  {b.logo ? (
                    <img src={b.logo} alt={b.name} className="max-h-10 max-w-full object-contain" />
                  ) : (
                    <span className="text-center text-sm font-bold text-fg">{b.name}</span>
                  )}
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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

        <section className="store-surface overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <BadgeCheck className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-fg">
                  {locale === 'ar' ? 'هل تحتاج عرض سعر لمشروع؟' : 'Need a quote for your project?'}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                  {locale === 'ar'
                    ? 'أرسل المنتجات والكميات وبيانات شركتك — يرد فريق المبيعات بعرض فني واضح.'
                    : 'Send products, quantities, and company details — our commercial team responds with a clear technical quote.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={storePath('quote')}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-white hover:bg-accent-soft"
              >
                <FileText className="h-4 w-4" />
                {locale === 'ar' ? 'طلب عرض سعر' : 'Request quote'}
              </Link>
              <Link
                to={storePath('products')}
                className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold hover:border-accent hover:text-accent"
              >
                {locale === 'ar' ? 'تصفح المنتجات' : 'Browse products'}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
