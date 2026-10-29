import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  Download,
  HardHat,
  Handshake,
  Leaf,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import type { CmsNews, CmsProject } from '@/types';
import { Seo } from '@/lib/seo';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { catalogApi, cmsApi } from '@/services/endpoints';
import { STORE_URL, storePath } from '@/lib/urls';
import { useI18n } from '@/i18n/i18n-context';
import { localizeService } from '@/lib/localize-cms';
import { Reveal } from '@/components/Reveal';
import { CountUpStat } from '@/components/CountUpStat';
import { NationwideCoverage } from '@/components/NationwideCoverage';
import { IraqOfficesMap } from '@/components/IraqOfficesMap';
import { CLIENT_LOGOS, MANUFACTURER_BRANDS } from '@/data/company-logos';

const COMPANY_PROFILE_PDF = '/company-profile.pdf';
const ABOUT_STORY_IMG = '/company/p01-1.jpg';
const ABOUT_STATS_IMG = '/company/p07-1.jpg';

function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="relative overflow-x-clip text-white">
      <div className="absolute inset-0 hero-plane" />
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
        <h1 className="reveal max-w-3xl break-words text-3xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="reveal reveal-delay-1 mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function AboutPage() {
  const { t, locale, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const p = t.pages;

  const offices = useQuery({
    queryKey: ['about-offices'],
    queryFn: async () => (await cmsApi.offices()).data,
  });

  const values = [
    { title: t.home.valueSafety, sub: t.home.valueSafetySub, icon: ShieldCheck },
    { title: t.home.valueOps, sub: t.home.valueOpsSub, icon: Wrench },
    { title: t.home.valueGrowth, sub: t.home.valueGrowthSub, icon: Leaf },
    { title: t.home.valuePeople, sub: t.home.valuePeopleSub, icon: Handshake },
  ];

  const pillars = [
    { title: p.aboutPillar1, sub: p.aboutPillar1Sub, icon: Package },
    { title: p.aboutPillar2, sub: p.aboutPillar2Sub, icon: HardHat },
    { title: p.aboutPillar3, sub: p.aboutPillar3Sub, icon: BadgeCheck },
  ];

  const stats = [
    { end: 10, suffix: '+', label: t.home.experienceLabel },
    { end: 18, suffix: '', label: t.home.coverageCount },
    { end: (offices.data ?? []).length || 2, suffix: '', label: t.home.offices },
  ];

  return (
    <>
      <Seo title={p.aboutHero} path="/about" description={p.aboutHeroSub} />
      <PageHero title={p.aboutHero} subtitle={p.aboutHeroSub} />

      {/* Intro */}
      <section className="border-b border-line bg-page text-fg">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-10">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {p.aboutIntro}
            </p>
            <p className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {locale === 'ar' ? t.brand : 'Energy Horizon'}
            </p>
          </Reveal>
          <Reveal delay={1}>
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted sm:text-xl">
              {p.aboutIntroSub}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Story + image */}
      <section className="border-b border-line bg-page py-16 text-fg sm:py-28">
        <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <Reveal variant="left" className="relative mb-10 pb-12 sm:mb-0 sm:pb-8">
            <img
              src={ABOUT_STORY_IMG}
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
              {p.aboutStory}
            </h2>
            <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-muted sm:text-lg">
              {p.aboutStorySub}
            </p>
            <div className="mt-4 max-w-xl space-y-4 text-base leading-relaxed text-muted">
              {p.aboutStoryBody.split('\n\n').map((para) => (
                <p key={para.slice(0, 48)}>{para}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-b border-line bg-page py-14 text-fg sm:py-24">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <Reveal className="mb-10 max-w-2xl sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {p.aboutMission}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
              {p.aboutMissionSub}
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {pillars.map((item, i) => (
              <Reveal key={item.title} delay={i}>
                <div className="service-card flex h-full flex-col rounded-xl border border-border/80 bg-card p-6 sm:p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-muted">{item.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values strip */}
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

      {/* Stats */}
      <section className="relative overflow-hidden border-b border-line text-white">
        <img
          src={ABOUT_STATS_IMG}
          alt=""
          className="hero-ken absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/85" />
        <div className="relative mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {p.aboutFootprint}
            </p>
            <h2 className="mt-4 max-w-lg text-2xl font-extrabold tracking-tight sm:text-4xl">
              {p.aboutFootprintSub}
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

      {/* Offices */}
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

          {offices.isLoading ? <LoadingState variant="page" className="mt-10" /> : null}
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
        </div>
      </section>

      {/* CTA */}
      <section className="bg-page py-14 text-fg sm:py-20">
        <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{p.aboutCtaTitle}</h2>
            <p className="mt-3 text-muted">{p.aboutCtaSub}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <a
              href={COMPANY_PROFILE_PDF}
              download="AT-Energy-Horizon-Company-Profile.pdf"
              className="btn-cta btn-cta-primary btn-shine w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              {p.aboutCtaProfile}
            </a>
            <Link to="/contact" className="btn-cta btn-cta-dark w-full sm:w-auto">
              {p.aboutCtaContact}
              <Arrow className="h-4 w-4" />
            </Link>
            <a href={STORE_URL} className="btn-cta btn-cta-dark w-full sm:w-auto">
              {p.aboutCtaStore}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export function ServicesPage() {
  const { t, locale, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const p = t.pages;

  const query = useQuery({
    queryKey: ['services'],
    queryFn: async () => (await cmsApi.services()).data,
  });

  const services = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [query.data],
  );

  const process = [
    { title: p.servicesStep1, sub: p.servicesStep1Sub },
    { title: p.servicesStep2, sub: p.servicesStep2Sub },
    { title: p.servicesStep3, sub: p.servicesStep3Sub },
  ];

  const icons = [HardHat, Wrench, Zap, Users, ShieldCheck, Package] as const;

  return (
    <>
      <Seo title={p.servicesHero} path="/services" description={p.servicesHeroSub} />
      <PageHero title={p.servicesHero} subtitle={p.servicesHeroSub} />

      {/* Intro */}
      <section className="border-b border-line bg-page text-fg">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
            {p.servicesIntro}
          </p>
          <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted sm:text-xl">
            {p.servicesIntroSub}
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="border-b border-line bg-page py-14 text-fg sm:py-24">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <div className="mb-10 max-w-2xl sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {p.servicesList}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
              {p.servicesListSub}
            </h2>
          </div>

          {query.isLoading ? <LoadingState variant="cards" /> : null}
          {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((s, i) => {
              const Icon = icons[i % icons.length];
              const loc = localizeService(s, locale);
              return (
                <Link
                  key={s.id}
                  to={`/services/${s.slug}`}
                  className="service-card group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-xl border border-border/80 bg-card p-5 sm:min-h-[300px] sm:p-7"
                >
                  {(s.imageUrl || s.image) && (
                    <img
                      src={s.imageUrl || s.image || ''}
                      alt=""
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-[0.16]"
                    />
                  )}
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <span className="font-kpi text-4xl leading-none text-accent/35">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                  </div>
                  <div className="relative z-10 mt-auto pt-8">
                    <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">{loc.name}</h3>
                    <p className="mt-3 line-clamp-3 text-sm font-medium leading-relaxed text-muted">
                      {loc.shortDescription || loc.description}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-accent transition group-hover:gap-2.5 group-hover:text-white">
                      {p.learnMore}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {!query.isLoading && !services.length ? (
            <EmptyState
              title={locale === 'ar' ? 'لا توجد خدمات' : 'No services published'}
            />
          ) : null}
        </div>
      </section>

      {/* Process */}
      <section className="border-b border-line bg-[#0a0a0a] py-14 text-white sm:py-20">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
            {p.servicesProcess}
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {process.map((step, i) => (
              <div key={step.title} className="border-t border-white/15 pt-6">
                <span className="font-kpi text-sm text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-extrabold tracking-tight sm:text-xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-page py-14 text-fg sm:py-20">
        <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {p.servicesCtaTitle}
            </h2>
            <p className="mt-3 text-muted">{p.servicesCtaSub}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/contact" className="btn-cta btn-cta-primary btn-shine w-full sm:w-auto">
              {p.servicesCtaContact}
              <Arrow className="h-4 w-4" />
            </Link>
            <a
              href={STORE_URL}
              className="btn-cta btn-cta-dark w-full sm:w-auto"
            >
              {p.servicesCtaStore}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export function ServiceDetailPage({ slug }: { slug: string }) {
  const { t, locale, dir } = useI18n();
  const p = t.pages;
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const query = useQuery({
    queryKey: ['service', slug],
    queryFn: async () => (await cmsApi.serviceBySlug(slug)).data,
  });

  if (query.isLoading) return <LoadingState variant="page" />;
  if (query.isError || !query.data) {
    return <ErrorState title="Service not found" onRetry={() => void query.refetch()} />;
  }

  const s = query.data;
  const loc = localizeService(s, locale);
  const brands = s.brands ?? [];
  const heroImg = s.imageUrl || s.image || '';

  return (
    <>
      <Seo
        title={loc.name}
        path={`/services/${slug}`}
        description={loc.shortDescription || undefined}
      />

      <section className="relative min-h-[min(52vh,28rem)] overflow-hidden text-white sm:min-h-[min(60vh,34rem)]">
        {heroImg ? (
          <img
            src={heroImg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#0a1628]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/70 to-black/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_15%_50%,rgb(0_112_192/0.35),transparent_65%)]" />
        <div className="relative z-10 mx-auto flex min-h-[min(52vh,28rem)] max-w-[90rem] flex-col justify-end px-4 pb-12 pt-24 sm:min-h-[min(60vh,34rem)] sm:px-6 sm:pb-16 lg:px-10">
          <Link
            to="/services"
            className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-bold text-white/70 transition hover:text-white"
          >
            {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {p.servicesHero}
          </Link>
          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {loc.name}
          </h1>
          {loc.shortDescription ? (
            <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-white/75 sm:text-lg">
              {loc.shortDescription}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-14 text-base leading-relaxed text-muted sm:px-6 sm:py-20 lg:px-8">
        <div className="whitespace-pre-wrap">
          {loc.description || (locale === 'ar' ? 'التفاصيل قريباً.' : 'Details coming soon.')}
        </div>
      </div>

      {brands.length ? (
        <section className="relative overflow-hidden bg-[#0070c0] py-16 text-white sm:py-24">
          <div
            className="pointer-events-none absolute start-1/2 top-0 h-6 w-12 -translate-x-1/2 bg-page [clip-path:polygon(0_0,100%_0,50%_100%)]"
            aria-hidden
          />
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
                {p.servicesBrands}
              </h2>
              <p className="mt-3 text-sm font-medium text-white/80 sm:text-base">
                {p.servicesBrandsSub}
              </p>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {brands.map((b, i) => (
                <Reveal key={b.id} delay={i % 3}>
                  <Link
                    to={`/brands/${b.slug}`}
                    className="group flex min-h-[160px] flex-col items-center justify-center rounded-2xl bg-white px-6 py-10 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-[180px]"
                  >
                    {b.logo ? (
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="max-h-14 w-auto max-w-[85%] object-contain sm:max-h-16"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-lg font-extrabold tracking-tight text-[#0a1628]">
                        {b.name}
                      </span>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0070c0] opacity-0 transition group-hover:opacity-100">
                      {p.servicesBrandOpen}
                      <Arrow className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-line bg-page py-12 text-fg">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <Link to="/services" className="inline-flex items-center gap-2 text-sm font-bold text-accent">
            {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {p.servicesHero}
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/contact" className="btn-cta btn-cta-primary btn-shine">
              {p.servicesCtaContact}
            </Link>
            <a href={STORE_URL} className="btn-cta btn-cta-dark">
              {p.servicesCtaStore}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function LogoGrid({
  items,
}: {
  items: readonly { name: string; logo: string; slug: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {items.map((item) => (
        <Link
          key={item.slug}
          to={`/brands/${item.slug}`}
          className="logo-cell group flex min-h-[120px] items-center justify-center rounded-xl border border-border/80 px-4 py-8 transition hover:border-accent/35 hover:shadow-md sm:min-h-[150px] sm:px-8 sm:py-10"
        >
          <img
            src={item.logo}
            alt={item.name}
            className="logo-mark max-h-14 w-auto max-w-[85%] object-contain transition duration-300 group-hover:scale-[1.03] sm:max-h-16"
            loading="lazy"
          />
        </Link>
      ))}
    </div>
  );
}

export function BrandDetailPage({ slug }: { slug: string }) {
  const { t, locale, dir } = useI18n();
  const p = t.pages;
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const query = useQuery({
    queryKey: ['brand', slug],
    queryFn: async () => (await catalogApi.brandBySlug(slug)).data,
  });

  if (query.isLoading) return <LoadingState variant="page" />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        title={locale === 'ar' ? 'العلامة غير موجودة' : 'Brand not found'}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const brand = query.data;
  const services = brand.services ?? [];
  const products = brand.products ?? [];

  return (
    <>
      <Seo
        title={brand.name}
        path={`/brands/${slug}`}
        description={brand.description || undefined}
      />

      <section className="border-b border-line bg-page text-fg">
        <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
          <Link
            to="/brands"
            className="inline-flex items-center gap-2 text-sm font-bold text-accent"
          >
            {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {p.brandsBack}
          </Link>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-16">
            <Reveal variant="left">
              <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-border/80 bg-white px-8 py-12 shadow-sm dark:bg-[#d9e2ec]">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-24 w-auto max-w-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-extrabold tracking-tight">{brand.name}</span>
                )}
              </div>
            </Reveal>

            <Reveal variant="right" delay={1}>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
                {p.brandsList}
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
                {brand.name}
              </h1>
              {brand.description ? (
                <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-muted sm:text-lg">
                  {brand.description}
                </p>
              ) : null}

              {services.length ? (
                <div className="mt-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                    {p.brandsInServices}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {services.map((svc) => {
                      const svcLoc = localizeService(svc, locale);
                      return (
                      <Link
                        key={svc.id}
                        to={`/services/${svc.slug}`}
                        className="rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-bold text-fg transition hover:border-accent/40 hover:text-accent"
                      >
                        {svcLoc.name}
                      </Link>
                    );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/contact" className="btn-cta btn-cta-primary btn-shine">
                  {p.brandsQuote}
                  <Arrow className="h-4 w-4" />
                </Link>
                <a href={STORE_URL} className="btn-cta btn-cta-dark">
                  {p.brandsCtaStore}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                {brand.website ? (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-cta btn-cta-outline"
                  >
                    {p.brandsWebsite}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {products.length ? (
        <section className="border-b border-line bg-page py-14 text-fg sm:py-20">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              {p.brandsProducts}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((prod) => {
                const img = prod.images?.[0]?.url;
                return (
                  <a
                    key={prod.id}
                    href={storePath(`products/${prod.slug}`)}
                    className="group overflow-hidden rounded-xl border border-border/80 bg-card transition hover:border-accent/35"
                  >
                    {img ? (
                      <div className="aspect-[16/10] overflow-hidden bg-mist">
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : null}
                    <div className="p-5">
                      <h3 className="font-bold tracking-tight">{prod.name}</h3>
                      {prod.shortDescription ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted">
                          {prod.shortDescription}
                        </p>
                      ) : null}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

export function BrandsPage() {
  const { t, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const p = t.pages;

  return (
    <>
      <Seo title={p.brandsHero} path="/brands" description={p.brandsHeroSub} />
      <PageHero title={p.brandsHero} subtitle={p.brandsHeroSub} />

      <section className="border-b border-line bg-page py-10 text-fg sm:py-14">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <LogoGrid items={MANUFACTURER_BRANDS} />
        </div>
      </section>

      <section className="border-t border-line bg-page py-12 text-fg sm:py-16">
        <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <div className="max-w-xl">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              {p.brandsCtaTitle}
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">{p.brandsCtaSub}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/contact" className="btn-cta btn-cta-primary btn-shine w-full sm:w-auto">
              {p.brandsCtaContact}
              <Arrow className="h-4 w-4" />
            </Link>
            <a href={STORE_URL} className="btn-cta btn-cta-dark w-full sm:w-auto">
              {p.brandsCtaStore}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}


function projectCover(p: CmsProject) {
  return p.coverImage || p.imageUrl || '/company/p01-1.jpg';
}

function ProjectMeta({
  project,
  clientLabel,
  locationLabel,
}: {
  project: CmsProject;
  clientLabel: string;
  locationLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
      {project.client ? (
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3 w-3 text-accent" aria-hidden />
          <span className="sr-only">{clientLabel}</span>
          {project.client}
        </span>
      ) : null}
      {project.location ? (
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-accent" aria-hidden />
          <span className="sr-only">{locationLabel}</span>
          {project.location}
        </span>
      ) : null}
    </div>
  );
}

export function ProjectsPage() {
  const { t, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const p = t.pages;

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await cmsApi.projects()).data,
  });

  const projects = useMemo(
    () =>
      [...(query.data ?? [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title),
      ),
    [query.data],
  );

  const featured = projects.find((item) => item.featured) ?? projects[0];
  const rest = featured ? projects.filter((item) => item.id !== featured.id) : [];

  const process = [
    { title: p.projectsStep1, sub: p.projectsStep1Sub },
    { title: p.projectsStep2, sub: p.projectsStep2Sub },
    { title: p.projectsStep3, sub: p.projectsStep3Sub },
  ];

  return (
    <>
      <Seo title={p.projectsHero} path="/projects" description={p.projectsHeroSub} />
      <PageHero title={p.projectsHero} subtitle={p.projectsHeroSub} />

      <section className="border-b border-line bg-page py-10 text-fg sm:py-14">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <LogoGrid items={CLIENT_LOGOS} />
        </div>
      </section>

      <section className="border-b border-line bg-page py-14 text-fg sm:py-24">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <Reveal className="mb-10 max-w-2xl sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {p.projectsList}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
              {p.projectsListSub}
            </h2>
          </Reveal>

          {query.isLoading ? <LoadingState variant="cards" /> : null}
          {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}

          {featured ? (
            <Reveal>
              <Link
                to={`/projects/${featured.slug}`}
                className="card-lift group relative mb-4 grid overflow-hidden rounded-xl border border-border/80 bg-card lg:grid-cols-[1.15fr_1fr]"
              >
                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[340px]">
                  <img
                    src={projectCover(featured)}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/25" />
                  {featured.featured ? (
                    <span className="absolute start-4 top-4 rounded-md bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                      {p.projectsFeatured}
                    </span>
                  ) : null}
                  <span className="absolute bottom-4 start-4 font-kpi text-4xl text-white/50 sm:text-5xl">
                    01
                  </span>
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <ProjectMeta
                    project={featured}
                    clientLabel={p.projectsClient}
                    locationLabel={p.projectsLocation}
                  />
                  <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {featured.title}
                  </h3>
                  <p className="mt-4 line-clamp-4 text-sm font-medium leading-relaxed text-muted sm:text-base">
                    {featured.shortDescription || featured.description}
                  </p>
                  <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-accent transition group-hover:gap-2.5">
                    {p.projectsView}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ) : null}

          {rest.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {rest.map((project, i) => (
                <Reveal key={project.id} delay={i}>
                  <Link
                    to={`/projects/${project.slug}`}
                    className="card-lift group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={projectCover(project)}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute bottom-3 start-4 font-kpi text-3xl text-white/45">
                        {String(i + 2).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <ProjectMeta
                        project={project}
                        clientLabel={p.projectsClient}
                        locationLabel={p.projectsLocation}
                      />
                      <h3 className="mt-3 text-xl font-extrabold tracking-tight">{project.title}</h3>
                      <p className="mt-3 line-clamp-3 flex-1 text-sm font-medium leading-relaxed text-muted">
                        {project.shortDescription || project.description}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-accent transition group-hover:gap-2.5">
                        {p.projectsView}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : null}

          {!query.isLoading && !projects.length ? (
            <EmptyState title={p.projectsEmpty} />
          ) : null}
        </div>
      </section>

      <section className="border-b border-line bg-[#0a0a0a] py-14 text-white sm:py-20">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
            {p.projectsProcess}
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {process.map((step, i) => (
              <div key={step.title} className="border-t border-white/15 pt-6">
                <span className="font-kpi text-sm text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-extrabold tracking-tight sm:text-xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-page py-14 text-fg sm:py-20">
        <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {p.projectsCtaTitle}
            </h2>
            <p className="mt-3 text-muted">{p.projectsCtaSub}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/contact" className="btn-cta btn-cta-primary btn-shine w-full sm:w-auto">
              {p.projectsCtaContact}
              <Arrow className="h-4 w-4" />
            </Link>
            <a href={STORE_URL} className="btn-cta btn-cta-dark w-full sm:w-auto">
              {p.projectsCtaStore}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export function ProjectDetailPage({ slug }: { slug: string }) {
  const { t, locale, dir } = useI18n();
  const p = t.pages;

  const query = useQuery({
    queryKey: ['project', slug],
    queryFn: async () => (await cmsApi.projectBySlug(slug)).data,
  });

  if (query.isLoading) return <LoadingState variant="page" />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        title={locale === 'ar' ? 'المشروع غير موجود' : 'Project not found'}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const project = query.data;

  return (
    <>
      <Seo
        title={project.title}
        path={`/projects/${slug}`}
        description={project.shortDescription || undefined}
      />
      <PageHero title={project.title} subtitle={project.shortDescription || undefined} />

      <div className="border-b border-line bg-page">
        <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-10">
          <img
            src={projectCover(project)}
            alt=""
            className="aspect-[21/9] w-full rounded-xl object-cover"
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_280px] lg:px-10">
        <div className="max-w-3xl space-y-5 text-base leading-relaxed text-muted">
          {(project.content || project.description || '')
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((para) => (
              <p key={para.slice(0, 40)} className="whitespace-pre-wrap">
                {para}
              </p>
            ))}
          {!project.content && !project.description ? (
            <p>{locale === 'ar' ? 'التفاصيل قريباً.' : 'Details coming soon.'}</p>
          ) : null}
        </div>

        <aside className="h-fit space-y-5 rounded-xl border border-border/80 bg-card p-5 lg:sticky lg:top-24">
          {project.client ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                {p.projectsClient}
              </p>
              <p className="mt-2 text-sm font-semibold text-fg">{project.client}</p>
            </div>
          ) : null}
          {project.location ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                {p.projectsLocation}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-fg">
                <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden />
                {project.location}
              </p>
            </div>
          ) : null}
          {project.completedAt ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                {locale === 'ar' ? 'التاريخ' : 'Completed'}
              </p>
              <p className="mt-2 text-sm font-semibold text-fg">
                {new Date(project.completedAt).toLocaleDateString(
                  locale === 'ar' ? 'ar-IQ' : 'en-GB',
                  { year: 'numeric', month: 'short' },
                )}
              </p>
            </div>
          ) : null}
        </aside>
      </div>

      <section className="border-t border-line bg-page py-12 text-fg">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-bold text-accent">
            {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {p.projectsBack}
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/contact" className="btn-cta btn-cta-primary btn-shine">
              {p.projectsCtaContact}
            </Link>
            <a href={STORE_URL} className="btn-cta btn-cta-dark">
              {p.projectsCtaStore}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

const NEWS_FALLBACK_IMG = '/company/p03-1.jpg';

function newsCover(n: CmsNews) {
  return n.coverImage || NEWS_FALLBACK_IMG;
}

function formatNewsDate(value: string | null | undefined, locale: 'en' | 'ar') {
  if (!value) return '';
  return new Date(value).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function NewsPage() {
  const { t, locale, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const p = t.pages;

  const query = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const res = await cmsApi.news();
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  const articles = useMemo(() => {
    const list = [...(query.data ?? [])];
    list.sort((a, b) => {
      const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return db - da;
    });
    return list;
  }, [query.data]);

  const featured = articles.find((item) => item.featured) ?? articles[0];
  const rest = featured ? articles.filter((item) => item.id !== featured.id) : [];

  return (
    <>
      <Seo title={p.newsHero} path="/news" description={p.newsHeroSub} />
      <PageHero title={p.newsHero} subtitle={p.newsHeroSub} />

      <section className="border-b border-line bg-page text-fg">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-10">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {p.newsIntro}
            </p>
          </Reveal>
          <Reveal delay={1}>
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted sm:text-xl">
              {p.newsIntroSub}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-line bg-page py-14 text-fg sm:py-24">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-14 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                {p.newsList}
              </p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
                {p.newsListSub}
              </h2>
            </div>
            {articles.length ? (
              <span className="font-kpi text-4xl leading-none text-accent/35 sm:text-5xl">
                {String(articles.length).padStart(2, '0')}
              </span>
            ) : null}
          </Reveal>

          {query.isLoading ? <LoadingState variant="cards" /> : null}
          {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}

          {featured ? (
            <Reveal>
              <Link
                to={`/news/${featured.slug}`}
                className="card-lift group relative mb-4 grid overflow-hidden rounded-xl border border-border/80 bg-card lg:grid-cols-[1.2fr_1fr]"
              >
                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[360px]">
                  <img
                    src={newsCover(featured)}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/30" />
                  {featured.featured ? (
                    <span className="absolute start-4 top-4 rounded-md bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                      {p.newsFeatured}
                    </span>
                  ) : null}
                  {featured.category ? (
                    <span className="absolute bottom-4 start-4 rounded-md border border-white/25 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                      {featured.category}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                    {featured.publishedAt ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-accent" aria-hidden />
                        {formatNewsDate(featured.publishedAt, locale)}
                      </span>
                    ) : null}
                    {featured.author ? <span>{featured.author}</span> : null}
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                    {featured.title}
                  </h3>
                  {featured.excerpt ? (
                    <p className="mt-4 line-clamp-4 text-sm font-medium leading-relaxed text-muted sm:text-base">
                      {featured.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-accent transition group-hover:gap-2.5">
                    {p.newsRead}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ) : null}

          {rest.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rest.map((article, i) => (
                <Reveal key={article.id} delay={i % 3}>
                  <Link
                    to={`/news/${article.slug}`}
                    className="card-lift group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={newsCover(article)}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                      {article.category ? (
                        <span className="absolute start-3 top-3 rounded-md border border-white/20 bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                          {article.category}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                        {article.publishedAt ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-accent" aria-hidden />
                            {formatNewsDate(article.publishedAt, locale)}
                          </span>
                        ) : null}
                        {article.author ? <span>{article.author}</span> : null}
                      </div>
                      <h3 className="mt-3 text-lg font-extrabold tracking-tight sm:text-xl">
                        {article.title}
                      </h3>
                      {article.excerpt ? (
                        <p className="mt-3 line-clamp-3 flex-1 text-sm font-medium leading-relaxed text-muted">
                          {article.excerpt}
                        </p>
                      ) : null}
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-accent transition group-hover:gap-2.5">
                        {p.newsRead}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : null}

          {!query.isLoading && !articles.length ? <EmptyState title={p.newsEmpty} /> : null}
        </div>
      </section>

      <section className="bg-page py-14 text-fg sm:py-20">
        <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{p.newsCtaTitle}</h2>
            <p className="mt-3 text-muted">{p.newsCtaSub}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/contact" className="btn-cta btn-cta-primary btn-shine w-full sm:w-auto">
              {p.newsCtaContact}
              <Arrow className="h-4 w-4" />
            </Link>
            <a href={STORE_URL} className="btn-cta btn-cta-dark w-full sm:w-auto">
              {p.newsCtaStore}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export function NewsDetailPage({ slug }: { slug: string }) {
  const { t, locale, dir } = useI18n();
  const p = t.pages;

  const query = useQuery({
    queryKey: ['news', slug],
    queryFn: async () => (await cmsApi.newsBySlug(slug)).data,
  });

  if (query.isLoading) return <LoadingState variant="page" />;
  if (query.isError || !query.data) {
    return <ErrorState title={p.newsNotFound} onRetry={() => void query.refetch()} />;
  }

  const article = query.data;

  return (
    <>
      <Seo
        title={article.title}
        path={`/news/${slug}`}
        description={article.excerpt || undefined}
      />
      <PageHero title={article.title} subtitle={article.excerpt || undefined} />

      <div className="border-b border-line bg-page">
        <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-10">
          <img
            src={newsCover(article)}
            alt=""
            className="aspect-[21/9] w-full rounded-xl object-cover"
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_260px] lg:px-10">
        <article className="max-w-3xl space-y-5 text-base leading-relaxed text-muted">
          {(article.content || '')
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((para) => (
              <p key={para.slice(0, 40)} className="whitespace-pre-wrap">
                {para}
              </p>
            ))}
          {!article.content ? <p>{p.newsComingSoon}</p> : null}
        </article>

        <aside className="h-fit space-y-5 rounded-xl border border-border/80 bg-card p-5 lg:sticky lg:top-24">
          {article.publishedAt ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                {locale === 'ar' ? 'التاريخ' : 'Date'}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-fg">
                <Calendar className="h-3.5 w-3.5 text-accent" aria-hidden />
                {formatNewsDate(article.publishedAt, locale)}
              </p>
            </div>
          ) : null}
          {article.author ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                {p.newsAuthor}
              </p>
              <p className="mt-2 text-sm font-semibold text-fg">{article.author}</p>
            </div>
          ) : null}
          {article.category ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                {p.newsCategory}
              </p>
              <p className="mt-2 text-sm font-semibold text-fg">{article.category}</p>
            </div>
          ) : null}
        </aside>
      </div>

      <section className="border-t border-line bg-page py-12 text-fg">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <Link to="/news" className="inline-flex items-center gap-2 text-sm font-bold text-accent">
            {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {p.newsBack}
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/contact" className="btn-cta btn-cta-primary btn-shine">
              {p.newsCtaContact}
            </Link>
            <a href={STORE_URL} className="btn-cta btn-cta-dark">
              {p.newsCtaStore}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/** Owner + branch managers from company profile (CV contact page) */
const CONTACT_TEAM = [
  {
    id: 'ali',
    name: { en: 'Eng. Ali Altaai', ar: 'م. علي الطائي' },
    role: { en: 'Owner · Managing Director', ar: 'المالك · المدير العام' },
    office: { en: 'Baghdad HQ', ar: 'مقر بغداد' },
    phone: '+964 771 393 8595',
    email: 'sales@energy-horizon.net',
    initials: 'AA',
    highlight: true,
    bio: {
      en: 'Leads Energy Horizon from Baghdad with a focus on Oil & Gas supply, field delivery, and long-term client relationships across Iraq.',
      ar: 'يقود افاق الطاقة من بغداد مع تركيز على توريد النفط والغاز والتسليم الميداني وبناء علاقات طويلة الأمد مع العملاء عبر العراق.',
    },
  },
  {
    id: 'tabarak',
    name: { en: 'Eng. Tabarak Mohammed', ar: 'م. تبارك محمد' },
    role: { en: 'Basra Branch Manager', ar: 'مدير فرع البصرة' },
    office: { en: 'Basra Office', ar: 'مكتب البصرة' },
    phone: '+964 781 056 5100',
    email: 'tabarak@energy-horizon.net',
    initials: 'TM',
    highlight: false,
    bio: {
      en: 'Runs the southern desk — staging, quotes, and site support for drilling and plant work across Basra and nearby fields.',
      ar: 'يدير مكتب الجنوب — التجهيز وعروض الأسعار ودعم المواقع لأعمال الحفر والمصانع في البصرة والحقول المجاورة.',
    },
  },
  {
    id: 'mustafa',
    name: { en: 'Mustafa Al Saffar', ar: 'مصطفى الصفار' },
    role: { en: 'America Branch Manager', ar: 'مدير فرع أمريكا' },
    office: { en: 'America Office', ar: 'مكتب أمريكا' },
    phone: '+1 314 201 3439',
    email: 'mustafa.alsaffar@energy-horizon.net',
    initials: 'MS',
    highlight: false,
    bio: {
      en: 'Handles America-side commercial follow-up and vendor coordination for packages moving into Iraqi energy projects.',
      ar: 'يتابع الجانب التجاري في أمريكا وتنسيق المورّدين للباقات المتجهة إلى مشاريع الطاقة في العراق.',
    },
  },
] as const;

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

function waHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}

export function ContactPage() {
  const { t, locale } = useI18n();
  const p = t.pages;

  const offices = useQuery({
    queryKey: ['contact-offices'],
    queryFn: async () => (await cmsApi.offices()).data,
  });

  /** Iraq map desks — same source as home; exclude international branches */
  const iraqOffices = useMemo(
    () =>
      (offices.data ?? []).filter((o) => {
        const country = (o.country || 'Iraq').toLowerCase();
        return country.includes('iraq') || country.includes('العراق');
      }),
    [offices.data],
  );

  const owner = CONTACT_TEAM.find((x) => x.highlight)!;
  const managers = CONTACT_TEAM.filter((x) => !x.highlight);

  return (
    <>
      <Seo title={p.contactHero} path="/contact" description={p.contactHeroSub} />
      <PageHero title={p.contactHero} subtitle={p.contactHeroSub} />

      <section className="border-b border-line bg-page text-fg">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-10">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {p.contactIntro}
            </p>
          </Reveal>
          <Reveal delay={1}>
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted sm:text-xl">
              {p.contactIntroSub}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Leadership — owner band + manager rows (not card grid) */}
      <section className="border-b border-line bg-page text-fg">
        <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
          <Reveal className="mb-10 max-w-2xl sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {p.contactTeam}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
              {p.contactTeamSub}
            </h2>
          </Reveal>

          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] text-white">
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse 55% 70% at 90% 20%, rgb(0 112 192 / 0.35), transparent 60%)',
                }}
                aria-hidden
              />
              <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-12 lg:p-10">
                <div className="flex items-center gap-4">
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-accent text-xl font-extrabold tracking-wide text-white sm:h-24 sm:w-24 sm:text-2xl">
                    {owner.initials}
                  </span>
                  <div className="min-w-0 lg:hidden">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                      {locale === 'ar' ? 'المالك' : 'Owner'}
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                      {owner.name[locale]}
                    </h3>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-accent lg:block">
                    {locale === 'ar' ? 'المالك' : 'Owner'}
                  </p>
                  <h3 className="hidden text-3xl font-extrabold tracking-tight lg:mt-2 lg:block">
                    {owner.name[locale]}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-white/70 sm:text-base">
                    {owner.role[locale]}
                  </p>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
                    {owner.bio[locale]}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white/40">
                    <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden />
                    {owner.office[locale]}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-stretch">
                  <a
                    href={telHref(owner.phone)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden />
                    {owner.phone}
                  </a>
                  <a
                    href={waHref(owner.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-bold text-white/85 transition hover:border-accent hover:text-white"
                  >
                    {p.contactWhatsApp}
                  </a>
                  <a
                    href={`mailto:${owner.email}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-bold text-white/85 transition hover:border-accent hover:text-white"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    {p.contactMail}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="mt-4 divide-y divide-line border-y border-line">
            {managers.map((person, i) => (
              <Reveal key={person.id} delay={i}>
                <article className="group grid gap-5 py-8 sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:gap-8 lg:gap-12">
                  <span className="font-kpi text-3xl leading-none text-accent/35 transition group-hover:text-accent/70 sm:text-4xl">
                    {String(i + 2).padStart(2, '0')}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                        {person.name[locale]}
                      </h3>
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                        {person.role[locale]}
                      </span>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                      {person.bio[locale]}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                      <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden />
                      {person.office[locale]}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 sm:min-w-[11rem] sm:items-end">
                    <a
                      href={telHref(person.phone)}
                      className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-fg transition hover:text-accent"
                    >
                      <Phone className="h-3.5 w-3.5 text-accent" aria-hidden />
                      {person.phone}
                    </a>
                    <a
                      href={`mailto:${person.email}`}
                      className="inline-flex min-h-10 items-center gap-2 break-all text-sm text-muted transition hover:text-accent"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                      {person.email}
                    </a>
                    <a
                      href={waHref(person.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center text-xs font-bold uppercase tracking-[0.14em] text-accent transition hover:underline"
                    >
                      {p.contactWhatsApp}
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Same contact / offices block as HomePage */}
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
                {String(iraqOffices.length || 0).padStart(2, '0')}
              </span>
              <span className="pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
                IQ
              </span>
            </div>
          </Reveal>

          {offices.isLoading ? <LoadingState variant="page" className="mt-10" /> : null}

          {iraqOffices.length ? (
            <Reveal delay={1}>
              <IraqOfficesMap
                offices={iraqOffices}
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

          {!offices.isLoading && !iraqOffices.length ? (
            <div className="mt-12">
              <EmptyState title={p.contactEmptyOffices} />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
