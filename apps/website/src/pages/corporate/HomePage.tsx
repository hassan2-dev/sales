import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
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
import { localizeService } from '@/lib/localize-cms';
import { storePath } from '@/lib/urls';
import { FeaturedProductsCarousel } from '@/components/FeaturedProductsCarousel';
import { PartnersSection } from '@/components/PartnersSection';
import { NationwideCoverage } from '@/components/NationwideCoverage';
import { IraqOfficesMap } from '@/components/IraqOfficesMap';
import { OperationalPresenceSection } from '@/components/OperationalPresenceSection';
import { Reveal } from '@/components/Reveal';
import { HeroSlideshow } from '@/components/HeroSlideshow';

/** Drop your real PDF at apps/web/public/company-profile.pdf */
const COMPANY_PROFILE_PDF = '/company-profile.pdf';

const ABOUT_IMG = '/company/p01-1.jpg';
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
  const marquee = [...MARQUEE, ...MARQUEE];
  const intlOffices = (offices.data ?? []).filter(
    (o) => o.country && !/iraq/i.test(o.country),
  );
  const iraqOffices = (offices.data ?? []).filter(
    (o) => !o.country || /iraq/i.test(o.country),
  );

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

      {/* Hero — brand-first, full-bleed field image */}
      <section className="relative min-h-[min(92svh,44rem)] overflow-x-clip text-white sm:min-h-[min(100svh,52rem)]">
        <HeroSlideshow showDots={false} />

        <div className="relative z-10 mx-auto flex min-h-[min(92svh,44rem)] max-w-[90rem] flex-col justify-end px-4 pb-20 pt-28 sm:min-h-[min(100svh,52rem)] sm:px-6 sm:pb-24 sm:pt-32 lg:justify-center lg:px-10 lg:pb-28 lg:pt-28">
          <div className="max-w-3xl">
            <p className="reveal text-[clamp(2.35rem,8vw,4.75rem)] font-extrabold leading-[0.95] tracking-tight text-white">
              {locale === 'ar' ? t.hero.brandAr : t.hero.brand}
            </p>
            <p className="reveal reveal-delay-1 mt-2 text-sm font-semibold tracking-[0.18em] text-accent sm:mt-3 sm:text-base sm:tracking-[0.22em]">
              {locale === 'ar' ? t.hero.brand : t.hero.brandAr}
            </p>
            <h1 className="reveal reveal-delay-2 mt-5 max-w-2xl text-xl font-bold leading-snug text-white/95 sm:mt-7 sm:text-3xl sm:leading-tight lg:text-4xl">
              {t.hero.title}
            </h1>
            <p className="reveal reveal-delay-2 mt-3 max-w-xl text-sm font-medium leading-relaxed text-white/70 sm:mt-4 sm:text-base lg:text-lg">
              {t.hero.subtitle}
            </p>
            <div className="reveal reveal-delay-3 mt-7 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
              <a
                href={storePath('products')}
                className="btn-cta btn-cta-primary btn-shine group w-full sm:w-auto"
              >
                {t.hero.ctaStore}
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <Link to="/services" className="btn-cta btn-cta-ghost w-full sm:w-auto">
                {t.hero.ctaContact}
                <Arrow className="h-4 w-4" />
              </Link>
            </div>
            <a
              href={COMPANY_PROFILE_PDF}
              download="AT-Energy-Horizon-Company-Profile.pdf"
              className="reveal reveal-delay-3 mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/65 transition hover:text-white"
            >
              <Download className="h-4 w-4" />
              {t.hero.ctaProfile}
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            document.getElementById('home-next')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          className="absolute inset-x-0 bottom-3 z-20 mx-auto flex w-fit flex-col items-center gap-1 rounded-full px-3 py-2 text-white/70 transition hover:text-white"
          aria-label={t.hero.scrollDown}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t.hero.scrollDown}</span>
          <ChevronDown className="hero-scroll-cue h-5 w-5" aria-hidden />
        </button>
      </section>

      {/* Safety values strip */}
      <section
        id="home-next"
        className="overflow-x-clip border-b border-white/10 bg-[#0a0a0a] text-white scroll-mt-16"
      >
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
      <section className="overflow-x-clip border-b border-line bg-page py-14 text-fg sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <Reveal className="min-w-0">
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
              <img
                src={ABOUT_IMG}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex items-center gap-3 border-t border-white/10 bg-accent px-4 py-3.5 text-white sm:px-5 sm:py-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <HardHat className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-kpi text-2xl font-extrabold leading-none sm:text-3xl">
                    {t.home.experience}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold leading-snug text-white/90 sm:text-xs">
                    {t.home.experienceLabel}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={1} className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
              {t.home.valuesTitle}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:mt-4 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              {t.home.capabilities}
            </h2>
            <p className="mt-4 text-sm font-medium leading-relaxed text-muted sm:mt-5 sm:text-base lg:text-lg">
              {t.home.capabilitiesSub}
            </p>
            <Link
              to="/about"
              className="btn-cta btn-cta-primary btn-shine mt-7 w-full sm:mt-8 sm:w-auto"
            >
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
              const loc = localizeService(s, locale);
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
                      <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">{loc.name}</h3>
                      <p className="service-card-muted mt-3 line-clamp-3 text-sm font-medium leading-relaxed text-muted">
                        {loc.shortDescription || loc.description}
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

      <OperationalPresenceSection
        dir={dir}
        stats={stats}
        labels={{
          eyebrow: t.home.statsEyebrow,
          title: t.home.statsTitle,
          sub: t.home.statsSub,
          cta: t.home.statsCta,
          from: t.home.coverageFrom,
          to: t.home.coverageTo,
          badge: t.home.coverageBadge,
        }}
      />

      <PartnersSection
        dir={dir}
        labels={{
          partners: t.home.partners,
          partnersSub: t.home.partnersSub,
          clients: t.home.clients,
          brands: t.home.brands,
          viewBrand: t.home.partnersViewBrand,
          viewProjects: t.home.partnersViewProjects,
          allBrands: t.home.partnersAllBrands,
          allProjects: t.home.partnersAllProjects,
        }}
      />

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
                IQ + INT
              </span>
            </div>
          </Reveal>

          {intlOffices.length ? (
            <Reveal delay={1} className="mt-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                {t.pages.officesIntl}
              </p>
              <p className="mt-2 max-w-xl text-sm text-muted">{t.pages.officesIntlSub}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {intlOffices.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-xl border border-border/80 bg-card px-5 py-5"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                      {o.country}
                    </p>
                    <h3 className="mt-2 text-lg font-extrabold tracking-tight">{o.name}</h3>
                    {o.contactPerson ? (
                      <p className="mt-2 text-sm text-muted">{o.contactPerson}</p>
                    ) : null}
                    {o.phone ? (
                      <a
                        href={`tel:${o.phone.replace(/\s/g, '')}`}
                        className="mt-3 inline-block text-sm font-bold text-accent"
                      >
                        {o.phone}
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </Reveal>
          ) : null}

          {iraqOffices.length || (offices.data ?? []).length ? (
            <Reveal delay={2} className="mt-14">
              <IraqOfficesMap
                offices={iraqOffices.length ? iraqOffices : (offices.data ?? [])}
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
