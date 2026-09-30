import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Headphones,
  Package,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Seo } from '@/lib/seo';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { ProductCard } from '@/components/ProductCard';
import { catalogApi } from '@/services/endpoints';
import { useI18n } from '@/i18n/i18n-context';
import { storePath } from '@/lib/urls';
import { cn } from '@/lib/cn';

function SectionHead({
  title,
  subtitle,
  to,
  linkLabel,
}: {
  title: string;
  subtitle?: string;
  to?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {to ? (
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-soft"
        >
          {linkLabel}
          <ArrowLeft className="h-3.5 w-3.5 rtl:hidden" />
          <ArrowRight className="hidden h-3.5 w-3.5 rtl:inline" />
        </Link>
      ) : null}
    </div>
  );
}

export function StoreHomePage() {
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const categories = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => (await catalogApi.categories()).data,
  });
  const brands = useQuery({
    queryKey: ['store-brands'],
    queryFn: async () => (await catalogApi.brands()).data,
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

  return (
    <>
      <Seo title={locale === 'ar' ? 'متجر افاق الطاقة' : 'Energy Horizon Store'} path={storePath()} />

      {/* Hero banner — full bleed store style */}
      <section className="relative overflow-hidden border-b border-border bg-[#05080c] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 70% 40%, rgb(0 112 192 / 0.45), transparent 55%), linear-gradient(135deg, #05080c 0%, #0a1520 45%, #071018 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgb(255 255 255 / 0.08) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto grid max-w-[90rem] gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:py-20">
          <div className="reveal">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
              Energy Horizon Store
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {locale === 'ar' ? 'متجر المعدات الصناعية' : 'Industrial equipment store'}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65 sm:text-base">
              {locale === 'ar'
                ? 'تصفّح الأقسام، أضف للسلة، واطلب بحساب موثّق — كتالوج حي لمشاريع الطاقة والمقاولات.'
                : 'Browse categories, add to cart, and order with a verified account — live catalog for energy and contracting projects.'}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to={storePath('products')}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-bold text-white hover:bg-accent-soft"
              >
                {locale === 'ar' ? 'تسوق المنتجات' : 'Shop products'}
                <Arrow className="h-4 w-4" />
              </Link>
              <Link
                to={storePath('categories')}
                className="inline-flex h-11 items-center rounded-lg border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10"
              >
                {locale === 'ar' ? 'تصفح الأقسام' : 'Browse categories'}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 reveal reveal-delay-1">
            {[
              {
                to: storePath('products') + '?sort=newest',
                title: locale === 'ar' ? 'منتجات جديدة' : 'New arrivals',
                sub: locale === 'ar' ? 'أحدث الإضافات' : 'Latest stock',
              },
              {
                to: storePath('products') + '?sort=bestsellers',
                title: locale === 'ar' ? 'الأكثر مبيعاً' : 'Best sellers',
                sub: locale === 'ar' ? 'طلب المشاريع' : 'Project picks',
              },
              {
                to: storePath('categories'),
                title: locale === 'ar' ? 'الأقسام' : 'Categories',
                sub: locale === 'ar' ? `${cats.length || '—'} قسم` : `${cats.length || '—'} groups`,
              },
              {
                to: storePath('account/login'),
                title: locale === 'ar' ? 'حسابي' : 'My account',
                sub: locale === 'ar' ? 'OTP سريع' : 'Fast OTP',
              },
            ].map((tile) => (
              <Link
                key={tile.to + tile.title}
                to={tile.to}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:border-accent/50 hover:bg-accent/10"
              >
                <p className="text-sm font-bold text-white">{tile.title}</p>
                <p className="mt-1 text-xs text-white/45">{tile.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Wide promo strip under hero */}
      <section className="border-b border-border bg-accent">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white sm:px-6 lg:px-10">
          <span>
            {locale === 'ar'
              ? 'عروض المشاريع: اطلب عبر السلة بعد توثيق الحساب'
              : 'Project orders: checkout from cart after account verification'}
          </span>
          <Link
            to={storePath('products')}
            className="inline-flex items-center gap-1 rounded-md bg-black/20 px-3 py-1.5 text-xs font-bold hover:bg-black/30"
          >
            {locale === 'ar' ? 'ابدأ التسوق' : 'Start shopping'}
            <Arrow className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[90rem] space-y-14 px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        {/* Categories */}
        <section>
          <SectionHead
            title={locale === 'ar' ? 'الأقسام' : 'Categories'}
            subtitle={
              locale === 'ar'
                ? 'اختر القسم المناسب لمعدات مشروعك'
                : 'Pick the right category for your project gear'
            }
            to={storePath('categories')}
            linkLabel={locale === 'ar' ? 'كل الأقسام' : 'All categories'}
          />
          {categories.isLoading ? <LoadingState variant="cards" /> : null}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cats.map((c, i) => (
              <Link
                key={c.id}
                to={storePath(`categories/${c.slug}`)}
                className={cn(
                  'group relative flex min-h-[9.5rem] flex-col justify-end overflow-hidden rounded-xl border border-border bg-card p-4 transition hover:border-accent',
                )}
              >
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-25 transition duration-500 group-hover:scale-105 group-hover:opacity-40"
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-transparent"
                    aria-hidden
                  />
                )}
                <span className="relative text-[11px] font-bold tabular-nums text-accent/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="relative mt-1 text-base font-bold text-fg group-hover:text-accent">
                  {c.name}
                </p>
                {c.description ? (
                  <p className="relative mt-0.5 line-clamp-2 text-xs text-muted">{c.description}</p>
                ) : null}
              </Link>
            ))}
          </div>
          {!categories.isLoading && !cats.length ? (
            <EmptyState title={locale === 'ar' ? 'لا توجد أقسام' : 'No categories'} />
          ) : null}
        </section>

        {/* Brands */}
        {brandList.length > 0 ? (
          <section>
            <SectionHead
              title={locale === 'ar' ? 'البراندات' : 'Brands'}
              subtitle={
                locale === 'ar' ? 'علامات صناعية موثوقة' : 'Trusted industrial brands'
              }
            />
            <div className="flex gap-3 overflow-x-auto pb-1">
              {brandList.map((b) => (
                <Link
                  key={b.id}
                  to={storePath(`brands/${b.slug}`)}
                  className="flex h-20 w-36 shrink-0 items-center justify-center rounded-xl border border-border bg-card px-3 text-center transition hover:border-accent"
                >
                  {b.logo ? (
                    <img src={b.logo} alt={b.name} className="max-h-10 max-w-full object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-fg">{b.name}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* New products */}
        <section>
          <SectionHead
            title={locale === 'ar' ? 'منتجات جديدة' : 'New arrivals'}
            subtitle={
              locale === 'ar' ? 'آخر ما أُضيف للكتالوج' : 'Latest additions to the catalog'
            }
            to={storePath('products') + '?sort=newest'}
            linkLabel={locale === 'ar' ? 'عرض الكل' : 'View all'}
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

        {/* Bestsellers */}
        <section>
          <SectionHead
            title={locale === 'ar' ? 'الأكثر مبيعاً' : 'Best sellers'}
            subtitle={
              locale === 'ar' ? 'الأكثر طلباً من المشاريع' : 'Most ordered by projects'
            }
            to={storePath('products') + '?sort=bestsellers'}
            linkLabel={locale === 'ar' ? 'عرض الكل' : 'View all'}
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

        {/* Trust strip */}
        <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
          {[
            {
              icon: Truck,
              title: locale === 'ar' ? 'توريد للمشاريع' : 'Project supply',
              text: locale === 'ar' ? 'طلب منظم من السلة' : 'Organized cart checkout',
            },
            {
              icon: ShieldCheck,
              title: locale === 'ar' ? 'حساب موثّق' : 'Verified account',
              text: locale === 'ar' ? 'OTP بالهاتف' : 'Phone OTP',
            },
            {
              icon: Package,
              title: locale === 'ar' ? 'كتالوج حي' : 'Live catalog',
              text: locale === 'ar' ? 'مخزون محدّث' : 'Updated stock',
            },
            {
              icon: Headphones,
              title: locale === 'ar' ? 'دعم فني' : 'Support',
              text: locale === 'ar' ? 'للاستفسارات الصناعية' : 'For industrial inquiries',
            },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3 rounded-xl p-2">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-fg">{f.title}</p>
                <p className="mt-0.5 text-xs text-muted">{f.text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* CTA band */}
        <section className="overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/15 via-card to-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-6 w-6 text-accent" />
              <div>
                <h3 className="text-lg font-bold text-fg">
                  {locale === 'ar' ? 'جاهز للطلب؟' : 'Ready to order?'}
                </h3>
                <p className="mt-1 max-w-md text-sm text-muted">
                  {locale === 'ar'
                    ? 'أضف المنتجات للسلة وسجّل حسابك بالاسم ورقم الهاتف لإتمام الطلب.'
                    : 'Add products to cart and register with name + phone to complete the order.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={storePath('cart')}
                className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white hover:bg-accent-soft"
              >
                {locale === 'ar' ? 'السلة' : 'Cart'}
              </Link>
              <Link
                to={storePath('account/login')}
                className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-semibold hover:border-accent hover:text-accent"
              >
                {locale === 'ar' ? 'حسابي' : 'Account'}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
