import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
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
import { FeaturedProductsCarousel } from '@/components/FeaturedProductsCarousel';
import { PartnersSection } from '@/components/PartnersSection';
import { NationwideCoverage } from '@/components/NationwideCoverage';
import { IraqOfficesMap } from '@/components/IraqOfficesMap';
import { CountUpStat } from '@/components/CountUpStat';
import { Reveal } from '@/components/Reveal';
import { HeroSlideshow } from '@/components/HeroSlideshow';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/** Drop your real PDF at apps/web/public/company-profile.pdf */
const COMPANY_PROFILE_PDF = '/company-profile.pdf';

const ABOUT_IMG = '/company/p01-1.jpg';
const STATS_IMG = '/company/p07-1.jpg';

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

const SERVICE_ICONS = [HardHat, Wrench, ShieldCheck, Handshake] as const;

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
  const newsItems = news.data ?? [];
  const marquee = [...MARQUEE, ...MARQUEE];

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
      <section className="relative min-h-[min(100svh,52rem)] overflow-x-clip overflow-y-hidden text-white sm:min-h-[calc(100svh-4rem)]">
        <HeroSlideshow />

        <div className="relative z-10 mx-auto flex min-h-[min(100svh,52rem)] max-w-[90rem] flex-col justify-center px-4 py-14 sm:min-h-[calc(100svh-4rem)] sm:px-6 sm:py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="reveal text-[11px] font-bold uppercase tracking-[0.22em] text-accent sm:text-xs sm:tracking-[0.28em]">
              {t.hero.eyebrow}
            </p>
            <h1 className="reveal reveal-delay-1 mt-4 text-[1.85rem] font-extrabold leading-[1.15] tracking-tight sm:mt-5 sm:text-5xl sm:leading-[1.05] lg:text-6xl xl:text-7xl">
              {t.hero.title}
            </h1>
            <p className="reveal reveal-delay-2 mt-4 max-w-xl text-sm font-medium leading-relaxed text-white/70 sm:mt-6 sm:text-lg">
              {t.hero.subtitle}
            </p>
            <div className="reveal reveal-delay-3 mt-7 flex w-full flex-col gap-2.5 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                to={storePath('products')}
                className="btn-cta btn-cta-primary btn-shine group w-full sm:w-auto"
              >
                {t.hero.ctaStore}
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href={COMPANY_PROFILE_PDF}
                download="AT-Energy-Horizon-Company-Profile.pdf"
                className="btn-cta btn-cta-ghost group w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                {t.hero.ctaProfile}
              </a>
              <Link to="/services" className="btn-cta btn-cta-ghost w-full sm:w-auto">
                {t.hero.ctaContact}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Safety values strip */}
      <section className="overflow-x-clip border-b border-white/10 bg-[#0a0a0a] text-white">
        <div className="mx-auto grid max-w-[90rem] gap-px sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i} className="value-cell flex gap-3 px-4 py-6 sm:gap-4 sm:px-8 sm:py-8">
              <v.icon className="value-icon mt-0.5 h-5 w-5 shrink-0 text-accent sm:h-6 sm:w-6" aria-hidden />
              <div className="min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] sm:text-sm">{v.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/55 sm:mt-2 sm:text-sm">{v.sub}</p>
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
      <section className="border-b border-line bg-page py-16 text-fg sm:py-28">
        <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-4 sm:gap-12 sm:px-6 sm:py-0 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <Reveal variant="left" className="relative mb-10 pb-12 sm:mb-0 sm:pb-8">
            <img
              src={ABOUT_IMG}
              alt=""
              className="aspect-4/3 w-full rounded-2xl object-cover shadow-lg"
            />
            <div className="absolute inset-x-3 -bottom-5 flex items-center gap-3 rounded-xl bg-accent px-4 py-3 text-white shadow-lg sm:inset-x-auto sm:start-8 sm:px-5 sm:py-4">
              <HardHat className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" aria-hidden />
              <div className="min-w-0">
                <p className="font-kpi text-2xl font-extrabold leading-none sm:text-3xl">
                  {t.home.experience}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/85 sm:text-xs">
                  {t.home.experienceLabel}
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal variant="right" delay={1} className="min-w-0 lg:ps-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {t.home.valuesTitle}
            </p>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
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

      {/* Services — top 4 */}
      <section className="border-b border-line bg-page py-14 text-fg sm:py-28">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <Reveal className="mb-8 flex flex-col items-start gap-4 sm:mb-12 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
            <div className="max-w-2xl min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                {t.home.services}
              </p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
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

          {services.isLoading ? <LoadingState variant="cards" /> : null}
          {services.isError ? <ErrorState onRetry={() => void services.refetch()} /> : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(services.data ?? []).slice(0, 4).map((s, i) => {
              const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
              return (
                <Reveal key={s.id} delay={i}>
                  <Link
                    to={`/services/${s.slug}`}
                    className="service-card group relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-xl border border-border/80 bg-card p-5 sm:min-h-[340px] sm:p-7"
                  >
                    {s.imageUrl || s.image ? (
                      <img
                        src={s.imageUrl || s.image || ''}
                        alt=""
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-[0.18]"
                      />
                    ) : (
                      <div
                        className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-2xl transition duration-500 group-hover:bg-white/20"
                        aria-hidden
                      />
                    )}
                    <div className="relative z-10 flex items-start justify-between gap-3">
                      <span className="service-card-num font-kpi text-4xl leading-none text-accent/35 sm:text-5xl">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="service-card-icon flex h-11 w-11 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent transition duration-300">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto pt-10">
                      <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">{s.name}</h3>
                      <p className="service-card-muted mt-3 line-clamp-3 text-sm font-medium leading-relaxed text-muted">
                        {s.shortDescription || s.description}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-accent transition group-hover:gap-2.5 group-hover:text-white">
                        {t.home.learnMore}
                        <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
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

      <NationwideCoverage
        locale={locale}
        labels={{
          coverage: t.home.coverage,
          coverageTitle: t.home.coverageTitle,
          coverageSub: t.home.coverageSub,
          coverageCount: t.home.coverageCount,
          coverageFrom: t.home.coverageFrom,
          coverageTo: t.home.coverageTo,
          coverageBadge: t.home.coverageBadge,
        }}
      />

      {featuredProducts.isLoading ? (
        <div className="border-b border-line bg-page px-4 py-20 sm:px-6 lg:px-10">
          <LoadingState variant="carousel" />
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
            <h2 className="max-w-lg text-2xl font-extrabold tracking-tight sm:text-4xl">
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

      <PartnersSection
        labels={{
          partners: t.home.partners,
          partnersSub: t.home.partnersSub,
          clients: t.home.clients,
          brands: t.home.brands,
        }}
      />

      <section className="border-b border-line bg-page px-4 py-14 text-fg sm:px-6 sm:py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[90rem]">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">{t.home.news}</p>
          </Reveal>
          {news.isLoading ? <LoadingState variant="cards" /> : null}
          <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3">
            {newsItems.map((n, i) => (
              <Reveal key={n.id} delay={i}>
                <Link
                  to={`/news/${n.slug}`}
                  className="card-lift group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card"
                >
                  {n.coverImage ? (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={n.coverImage}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                  ) : null}
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
                  <CardFooter className="mt-auto border-0 bg-transparent">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-accent transition group-hover:gap-2">
                      {t.home.learnMore}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </CardFooter>
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

      <section className="relative overflow-hidden border-t border-line bg-page text-fg">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            color: 'rgb(0 112 192 / 0.08)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,rgb(0_112_192/0.14),transparent_60%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,rgb(0_112_192/0.28),transparent_60%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <Reveal className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
            <div className="max-w-xl min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                {t.home.offices}
              </p>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                {t.home.officesSub}
              </h2>
            </div>
            <div className="flex items-end gap-3">
              <span className="font-kpi text-5xl leading-none text-accent/40 sm:text-7xl dark:text-accent/35">
                {String((offices.data ?? []).length || 0).padStart(2, '0')}
              </span>
              <span className="pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
                IQ
              </span>
            </div>
          </Reveal>

          {(offices.data ?? []).length ? (
            <Reveal delay={1}>
              <IraqOfficesMap
                offices={offices.data ?? []}
                locale={locale}
                labels={{
                  offices: t.home.offices,
                  officesSub: t.home.officesSub,
                  selectGov: t.home.selectGov,
                  selectGovHint: t.home.selectGovHint,
                  noBranch: t.home.noBranch,
                  hasBranch: t.home.hasBranch,
                  callOffice: t.home.callOffice,
                  contactName: t.home.contactName,
                  contactPhone: t.home.contactPhone,
                  contactSubject: t.home.contactSubject,
                  contactSendWhatsApp: t.home.contactSendWhatsApp,
                  contactNeedPhone: t.home.contactNeedPhone,
                }}
              />
            </Reveal>
          ) : null}

          {!offices.isLoading && !(offices.data ?? []).length ? (
            <div className="mt-12">
              <EmptyState title={locale === 'ar' ? 'لا توجد مكاتب' : 'No offices listed'} />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
