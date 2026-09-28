import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  HardHat,
  Handshake,
  Leaf,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { Seo } from '@/lib/seo';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { catalogApi, cmsApi } from '@/services/endpoints';
import { useI18n } from '@/i18n/i18n-context';
import { storePath } from '@/lib/urls';
import type { Brand } from '@/types';
import { FeaturedProductsCarousel } from '@/components/FeaturedProductsCarousel';
import { CountUpStat } from '@/components/CountUpStat';
import { Reveal } from '@/components/Reveal';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const HERO_IMG =
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=2400&q=80';
const ABOUT_IMG =
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80';
const STATS_IMG =
  'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=2000&q=80';

const MARQUEE = [
  'AT',
  'ENERGY HORIZON',
  'افاق الطاقة',
  'HSE',
  'SAFETY FIRST',
  'OIL & GAS',
  'IRAQ',
  'FIELD READY',
];

function PartnersSection({
  brands,
  clients,
  labels,
}: {
  brands: Brand[];
  clients: string[];
  labels: {
    partners: string;
    partnersSub: string;
    clients: string;
    brands: string;
  };
}) {
  return (
    <section className="border-b border-line bg-page py-20 text-fg sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center rounded-full bg-[#0a0a0a] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white">
              {labels.partners}
            </div>
            <p className="mt-5 text-lg font-medium text-muted">{labels.partnersSub}</p>
          </div>
        </Reveal>

        {brands.length ? (
          <div className="mt-12">
            <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
              {labels.brands}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {brands.map((b, i) => (
                <Reveal key={b.id} delay={i % 6}>
                  <Link to={storePath(`brands/${b.slug}`)} className="block">
                    <Card className="card-lift h-full min-h-[110px] items-center justify-center gap-2 py-5 text-center">
                      <CardContent className="flex flex-col items-center gap-2 px-4">
                        {b.logo ? (
                          <img
                            src={b.logo}
                            alt={b.name}
                            className="max-h-10 max-w-[120px] object-contain opacity-80 grayscale transition group-hover/card:grayscale-0 dark:brightness-0 dark:invert"
                          />
                        ) : (
                          <span className="text-sm font-bold tracking-tight">{b.name}</span>
                        )}
                        {b.logo ? (
                          <span className="text-[11px] font-medium text-muted">{b.name}</span>
                        ) : null}
                      </CardContent>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}

        {clients.length ? (
          <div className="mt-14">
            <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
              {labels.clients}
            </p>
            <div className="flex flex-wrap gap-3">
              {clients.map((name, i) => (
                <Reveal key={name} delay={i % 8}>
                  <Card className="card-lift gap-0 py-3 shadow-none">
                    <CardContent className="px-4 py-0 text-sm font-semibold">{name}</CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function HomePage() {
  const { t, locale, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const services = useQuery({
    queryKey: ['home-services'],
    queryFn: async () => (await cmsApi.services()).data,
  });
  const news = useQuery({
    queryKey: ['home-news'],
    queryFn: async () => {
      const res = await cmsApi.news({ limit: 3 });
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });
  const offices = useQuery({
    queryKey: ['home-offices'],
    queryFn: async () => (await cmsApi.offices()).data,
  });
  const featuredProducts = useQuery({
    queryKey: ['home-featured-products'],
    queryFn: async () => {
      const featured = await catalogApi.products({ featured: true, limit: 12 });
      const list = featured.data.data ?? [];
      if (list.length) return list;
      const fallback = await catalogApi.products({ limit: 12 });
      return fallback.data.data ?? [];
    },
  });
  const brands = useQuery({
    queryKey: ['home-brands'],
    queryFn: async () => (await cmsApi.brands()).data,
  });
  const projects = useQuery({
    queryKey: ['home-projects'],
    queryFn: async () => (await cmsApi.projects()).data,
  });

  const newsItems = news.data ?? [];
  const marquee = [...MARQUEE, ...MARQUEE];
  const clientNames = useMemo(() => {
    const names = (projects.data ?? [])
      .map((p) => p.client?.trim())
      .filter((n): n is string => Boolean(n));
    return [...new Set(names)];
  }, [projects.data]);

  const values = [
    {
      icon: ShieldCheck,
      title: t.home.valueSafety,
      sub: t.home.valueSafetySub,
    },
    {
      icon: Wrench,
      title: t.home.valueOps,
      sub: t.home.valueOpsSub,
    },
    {
      icon: Leaf,
      title: t.home.valueGrowth,
      sub: t.home.valueGrowthSub,
    },
    {
      icon: Handshake,
      title: t.home.valuePeople,
      sub: t.home.valuePeopleSub,
    },
  ];

  const stats = [
    { end: 47, suffix: 'K+', label: t.home.statsProjects },
    { end: 35, suffix: '+', label: t.home.statsPartners },
    { end: 60, suffix: '+', label: t.home.statsSites },
  ];

  return (
    <>
      <Seo
        title={locale === 'ar' ? 'افاق الطاقة' : 'Energy Horizon'}
        description={t.tagline}
        path="/"
      />

      {/* Hero — industrial / safety */}
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden text-white">
        <img
          src={HERO_IMG}
          alt=""
          className="hero-ken absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/35 dark:from-black/95 dark:via-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_20%_50%,rgb(0_112_192/0.35),transparent_65%)]" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-[90rem] flex-col justify-center px-4 py-20 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="reveal text-xs font-bold uppercase tracking-[0.28em] text-accent">
              {t.hero.eyebrow}
            </p>
            <h1 className="reveal reveal-delay-1 mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              {t.hero.title}
            </h1>
            <p className="reveal reveal-delay-2 mt-6 max-w-xl text-base font-medium leading-relaxed text-white/70 sm:text-lg">
              {t.hero.subtitle}
            </p>
            <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-3">
              <Link
                to={storePath('products')}
                className="btn-cta btn-cta-primary btn-shine group"
              >
                {t.hero.ctaStore}
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link to="/services" className="btn-cta btn-cta-ghost">
                {t.hero.ctaContact}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Safety values strip */}
      <section className="border-b border-white/10 bg-[#0a0a0a] text-white">
        <div className="mx-auto grid max-w-[90rem] gap-px sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i} className="value-cell flex gap-4 px-6 py-8 sm:px-8">
              <v.icon className="value-icon mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.12em]">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{v.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="overflow-hidden border-y border-line bg-accent py-3 text-white">
        <div className="marquee-track gap-10 whitespace-nowrap px-4">
          {marquee.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center gap-10 text-sm font-bold tracking-[0.2em]"
            >
              {item}
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" aria-hidden />
            </span>
          ))}
        </div>
      </div>

      {/* About / capabilities */}
      <section className="border-b border-line bg-page py-20 text-fg sm:py-28">
        <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <Reveal variant="left" className="relative">
            <img
              src={ABOUT_IMG}
              alt=""
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg"
            />
            <div className="absolute -bottom-5 start-5 flex items-center gap-3 rounded-xl bg-accent px-5 py-4 text-white shadow-lg sm:start-8">
              <HardHat className="h-8 w-8 shrink-0" aria-hidden />
              <div>
                <p className="font-kpi text-3xl font-extrabold leading-none">
                  {t.home.experience}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/85">
                  {t.home.experienceLabel}
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal variant="right" delay={1} className="lg:ps-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {t.home.valuesTitle}
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {t.home.capabilities}
            </h2>
            <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-muted sm:text-lg">
              {t.home.capabilitiesSub}
            </p>
            <Link to="/about" className="btn-cta btn-cta-dark btn-shine mt-8">
              {t.home.learnMore}
              <Arrow className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Services — shadcn cards */}
      <section className="border-b border-line bg-page py-20 text-fg sm:py-28">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                {t.home.services}
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {t.home.servicesSub}
              </h2>
            </div>
            <Link
              to="/services"
              className="group inline-flex items-center gap-2 text-sm font-bold text-accent transition hover:gap-3"
            >
              {t.home.allServices}
              <Arrow className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </Reveal>

          {services.isLoading ? <LoadingState /> : null}
          {services.isError ? <ErrorState onRetry={() => void services.refetch()} /> : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(services.data ?? []).map((s, i) => (
              <Reveal key={s.id} delay={i % 6}>
                <Card className="card-lift h-full">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-kpi text-sm text-accent">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <HardHat className="h-5 w-5 text-accent" aria-hidden />
                    </div>
                    <CardTitle className="text-xl">{s.name}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {s.shortDescription || s.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="border-0 bg-transparent">
                    <Link
                      to={`/services/${s.slug}`}
                      className="group inline-flex items-center gap-1.5 text-sm font-bold text-accent"
                    >
                      {t.home.learnMore}
                      <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </CardFooter>
                </Card>
              </Reveal>
            ))}
          </div>

          {!services.isLoading && !(services.data ?? []).length ? (
            <EmptyState
              title={locale === 'ar' ? 'لا توجد خدمات منشورة' : 'No published services'}
              description={
                locale === 'ar'
                  ? 'أضف الخدمات من لوحة التحكم'
                  : 'Publish services from the admin dashboard'
              }
            />
          ) : null}
        </div>
      </section>

      {featuredProducts.isLoading ? (
        <div className="border-b border-line bg-page py-20">
          <LoadingState />
        </div>
      ) : null}
      {featuredProducts.isError ? (
        <div className="border-b border-line bg-page px-4 py-16">
          <ErrorState onRetry={() => void featuredProducts.refetch()} />
        </div>
      ) : null}
      {(featuredProducts.data ?? []).length ? (
        <FeaturedProductsCarousel
          products={featuredProducts.data!}
          labels={{
            mostRequested: t.home.mostRequested,
            featured: t.home.featured,
            featuredSub: t.home.featuredSub,
            viewCatalog: t.home.viewCatalog,
            from: t.home.from,
            openProduct: t.home.openProduct,
            prev: t.home.prev,
            next: t.home.next,
          }}
        />
      ) : !featuredProducts.isLoading ? (
        <section className="border-b border-line bg-page px-4 py-16 text-fg">
          <EmptyState
            title={locale === 'ar' ? 'لا توجد منتجات مميزة' : 'No featured products'}
            description={
              locale === 'ar'
                ? 'فعّل Featured على المنتجات من الأدمن'
                : 'Mark products as featured in admin'
            }
          />
        </section>
      ) : null}

      {/* Stats band */}
      <section className="relative overflow-hidden border-b border-line text-white">
        <img
          src={STATS_IMG}
          alt=""
          className="hero-ken absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/85" />
        <div className="relative mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
          <Reveal>
            <h2 className="max-w-lg text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t.home.statsTitle}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i} variant="scale">
                <CountUpStat
                  end={s.end}
                  suffix={s.suffix}
                  label={s.label}
                  durationMs={1400 + i * 200}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {!brands.isLoading && !projects.isLoading && (brands.data?.length || clientNames.length) ? (
        <PartnersSection
          brands={brands.data ?? []}
          clients={clientNames}
          labels={{
            partners: t.home.partners,
            partnersSub: t.home.partnersSub,
            clients: t.home.clients,
            brands: t.home.brands,
          }}
        />
      ) : null}
      {!brands.isLoading &&
      !projects.isLoading &&
      !(brands.data?.length || clientNames.length) ? (
        <section className="border-b border-line bg-page px-4 py-16 text-fg">
          <div className="mx-auto max-w-[90rem]">
            <h2 className="text-3xl font-extrabold tracking-tight">{t.home.partners}</h2>
            <EmptyState
              title={locale === 'ar' ? 'لا يوجد شركاء بعد' : 'No partners yet'}
              description={
                locale === 'ar'
                  ? 'أضف العلامات والمشاريع من لوحة التحكم'
                  : 'Add brands and project clients in admin'
              }
            />
          </div>
        </section>
      ) : null}

      <section className="border-b border-line bg-page px-4 py-20 text-fg sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[90rem]">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">{t.home.news}</p>
          </Reveal>
          {news.isLoading ? <LoadingState /> : null}
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {newsItems.map((n, i) => (
              <Reveal key={n.id} delay={i}>
                <Link to={`/news/${n.slug}`} className="block">
                  <Card className="card-lift h-full">
                    <CardHeader>
                      <p className="font-kpi text-xs uppercase tracking-[0.16em] text-muted">
                        {n.publishedAt
                          ? new Date(n.publishedAt).toLocaleDateString(
                              locale === 'ar' ? 'ar-IQ' : 'en-GB',
                              { year: 'numeric', month: 'short', day: 'numeric' },
                            )
                          : '—'}
                      </p>
                      <CardTitle className="text-lg leading-snug">{n.title}</CardTitle>
                      {n.excerpt ? (
                        <CardDescription className="line-clamp-2">{n.excerpt}</CardDescription>
                      ) : null}
                    </CardHeader>
                    <CardFooter className="border-0 bg-transparent">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-accent">
                        {t.home.learnMore}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
          {!news.isLoading && !newsItems.length ? (
            <EmptyState
              title={locale === 'ar' ? 'لا توجد أخبار بعد' : 'No news yet'}
              description={
                locale === 'ar' ? 'انشر المقالات من لوحة التحكم' : 'Publish articles from admin'
              }
            />
          ) : null}
        </div>
      </section>

      <section className="bg-page text-fg">
        <div className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
          <Reveal className="flex items-end justify-between gap-6">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.home.offices}</h2>
            <span className="font-kpi text-5xl text-accent/30 sm:text-6xl">IQ</span>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(offices.data ?? []).map((o, i) => (
              <Reveal key={o.id} delay={i}>
                <Card className="card-lift">
                  <CardHeader>
                    <CardTitle className="text-xl">{o.name}</CardTitle>
                    <CardDescription>
                      {[o.city, o.country].filter(Boolean).join(', ')}
                    </CardDescription>
                  </CardHeader>
                  {o.phone ? (
                    <CardFooter className="border-0 bg-transparent">
                      <a
                        href={`tel:${o.phone.replace(/\s/g, '')}`}
                        className="text-sm font-bold text-accent"
                      >
                        {o.phone}
                      </a>
                    </CardFooter>
                  ) : null}
                </Card>
              </Reveal>
            ))}
          </div>
          {!offices.isLoading && !(offices.data ?? []).length ? (
            <EmptyState title={locale === 'ar' ? 'لا توجد مكاتب' : 'No offices listed'} />
          ) : null}
        </div>
      </section>
    </>
  );
}
