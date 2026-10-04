import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  HardHat,
  Package,
  ShieldCheck,
  Truck,
  Users,
  Warehouse,
  Wrench,
  Zap,
} from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { catalogApi, cmsApi } from '@/services/endpoints';
import { STORE_URL, storePath } from '@/lib/urls';
import { useI18n } from '@/i18n/i18n-context';
import { cn } from '@/lib/cn';

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
  const { locale } = useI18n();
  const page = useQuery({
    queryKey: ['page', 'about'],
    queryFn: async () => {
      try {
        return (await cmsApi.pageBySlug('about')).data;
      } catch {
        return null;
      }
    },
  });

  return (
    <>
      <Seo title={locale === 'ar' ? 'من نحن' : 'About'} path="/about" />
      <PageHero
        title={locale === 'ar' ? 'من نحن' : 'About Energy Horizon'}
        subtitle={
          locale === 'ar'
            ? 'افاق الطاقة — شريك صناعي لعمليات النفط والغاز.'
            : 'افاق الطاقة — industrial partners for oil & gas operations.'
        }
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {page.isLoading ? <LoadingState /> : null}
        {page.data?.content ? (
          <div className="whitespace-pre-wrap text-base leading-relaxed text-muted">
            {page.data.content}
          </div>
        ) : (
          <div className="space-y-5 text-base leading-relaxed text-muted">
            <p>
              {locale === 'ar'
                ? 'توفّر افاق الطاقة معدات صناعية وخدمات هندسية لمشغّلي النفط والغاز عبر مراحل الإنتاج. نجمع بين كتالوج منتجات مُختار وفرق جاهزة للميدان.'
                : 'Energy Horizon supplies industrial equipment and engineering services for upstream, midstream, and downstream operators. We combine a curated product catalog with field-ready teams.'}
            </p>
            <p>
              {locale === 'ar'
                ? 'حضورنا ثنائي اللغة — Energy Horizon / افاق الطاقة — يعكس انتشاراً إقليمياً والتزاماً بالتسليم الموثوق.'
                : 'Our bilingual brand — Energy Horizon / افاق الطاقة — reflects a regional footprint and a commitment to dependable delivery.'}
            </p>
          </div>
        )}
      </div>
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
                    <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">{s.name}</h3>
                    <p className="mt-3 line-clamp-3 text-sm font-medium leading-relaxed text-muted">
                      {s.shortDescription || s.description}
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

  const query = useQuery({
    queryKey: ['service', slug],
    queryFn: async () => (await cmsApi.serviceBySlug(slug)).data,
  });

  if (query.isLoading) return <LoadingState variant="page" />;
  if (query.isError || !query.data) {
    return <ErrorState title="Service not found" onRetry={() => void query.refetch()} />;
  }

  const s = query.data;

  return (
    <>
      <Seo
        title={s.name}
        path={`/services/${slug}`}
        description={s.shortDescription || undefined}
      />
      <PageHero title={s.name} subtitle={s.shortDescription || undefined} />

      {(s.imageUrl || s.image) && (
        <div className="border-b border-line bg-page">
          <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-10">
            <img
              src={s.imageUrl || s.image || ''}
              alt=""
              className="aspect-[21/9] w-full rounded-xl object-cover"
            />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-14 text-base leading-relaxed text-muted sm:px-6 sm:py-20 lg:px-8">
        <div className="whitespace-pre-wrap">
          {s.description || (locale === 'ar' ? 'التفاصيل قريباً.' : 'Details coming soon.')}
        </div>
      </div>

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

export function BrandsPage() {
  const { t, locale, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const p = t.pages;

  const query = useQuery({
    queryKey: ['brands-public'],
    queryFn: async () => (await catalogApi.brands()).data,
  });

  const brands = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [query.data],
  );

  const ownBrand = brands.find((b) => b.slug === 'energy-horizon');
  const partners = brands.filter((b) => b.slug !== 'energy-horizon');

  const why = [
    { title: p.brandsWhy1, sub: p.brandsWhy1Sub, Icon: BadgeCheck },
    { title: p.brandsWhy2, sub: p.brandsWhy2Sub, Icon: Warehouse },
    { title: p.brandsWhy3, sub: p.brandsWhy3Sub, Icon: Truck },
  ];

  return (
    <>
      <Seo title={p.brandsHero} path="/brands" description={p.brandsHeroSub} />
      <PageHero title={p.brandsHero} subtitle={p.brandsHeroSub} />

      <section className="border-b border-line bg-page text-fg">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
            {p.brandsIntro}
          </p>
          <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted sm:text-xl">
            {p.brandsIntroSub}
          </p>
        </div>
      </section>

      {ownBrand ? (
        <section className="border-b border-line bg-page py-14 text-fg sm:py-20">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                {p.brandsOwn}
              </p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
                {p.brandsOwnSub}
              </h2>
            </div>

            <Link
              to={storePath(`brands/${ownBrand.slug}`)}
              className="brand-own group relative flex flex-col gap-8 overflow-hidden rounded-xl border border-accent/30 bg-card p-6 sm:flex-row sm:items-center sm:gap-12 sm:p-10"
            >
              <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-lg border border-line bg-page sm:h-36 sm:w-56">
                {ownBrand.logo ? (
                  <img
                    src={ownBrand.logo}
                    alt={ownBrand.name}
                    className="max-h-16 max-w-[70%] object-contain sm:max-h-20"
                  />
                ) : (
                  <span className="text-xl font-extrabold tracking-tight">{ownBrand.name}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {ownBrand.name}
                </h3>
                <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-muted sm:text-base">
                  {ownBrand.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-accent transition group-hover:gap-2.5">
                  {p.brandsView}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      ) : null}

      <section className="border-b border-line bg-page py-14 text-fg sm:py-24">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <div className="mb-10 max-w-2xl sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {p.brandsList}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
              {p.brandsListSub}
            </h2>
          </div>

          {query.isLoading ? <LoadingState variant="cards" /> : null}
          {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {partners.map((b, i) => (
              <Link
                key={b.id}
                to={storePath(`brands/${b.slug}`)}
                className="brand-card group flex h-full min-h-[240px] flex-col overflow-hidden rounded-xl border border-border/80 bg-card p-5 sm:min-h-[260px] sm:p-7"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-kpi text-3xl leading-none text-accent/35">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex h-16 w-36 items-center justify-center rounded-lg border border-line bg-page px-3">
                    {b.logo ? (
                      <img
                        src={b.logo}
                        alt={b.name}
                        className={cn(
                          'max-h-9 max-w-full object-contain opacity-80 grayscale transition duration-300',
                          'group-hover:opacity-100 group-hover:grayscale-0',
                          'dark:brightness-0 dark:invert dark:opacity-70 dark:group-hover:opacity-100',
                        )}
                      />
                    ) : (
                      <span className="text-sm font-extrabold tracking-tight text-fg/70">
                        {b.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-auto pt-8">
                  <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">{b.name}</h3>
                  <p className="mt-3 line-clamp-3 text-sm font-medium leading-relaxed text-muted">
                    {b.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-accent transition group-hover:gap-2.5 group-hover:text-white">
                    {p.brandsView}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {!query.isLoading && !brands.length ? (
            <EmptyState title={locale === 'ar' ? 'لا توجد علامات' : 'No brands yet'} />
          ) : null}
        </div>
      </section>

      <section className="border-b border-line bg-[#0a0a0a] py-14 text-white sm:py-20">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
            {p.brandsWhy}
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {why.map((item, i) => (
              <div key={item.title} className="border-t border-white/15 pt-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-kpi text-sm text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <item.Icon className="h-5 w-5 text-accent" aria-hidden />
                </div>
                <h3 className="mt-3 text-lg font-extrabold tracking-tight sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-page py-14 text-fg sm:py-20">
        <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {p.brandsCtaTitle}
            </h2>
            <p className="mt-3 text-muted">{p.brandsCtaSub}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/contact" className="btn-cta btn-cta-primary btn-shine w-full sm:w-auto">
              {p.brandsCtaContact}
              <Arrow className="h-4 w-4" />
            </Link>
            <Link to={storePath()} className="btn-cta btn-cta-dark w-full sm:w-auto">
              {p.brandsCtaStore}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function ProjectsPage() {
  const { locale } = useI18n();
  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await cmsApi.projects()).data,
  });

  return (
    <>
      <Seo title={locale === 'ar' ? 'المشاريع' : 'Projects'} path="/projects" />
      <PageHero
        title={locale === 'ar' ? 'المشاريع' : 'Projects'}
        subtitle={
          locale === 'ar'
            ? 'نماذج من التنفيذ والتسليم.'
            : 'Selected deployments and delivery highlights.'
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
        <div className="divide-y divide-[var(--border)] border-y border-line">
          {(query.data ?? []).map((p) => (
            <article key={p.id} className="py-8">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                {[p.client, p.location].filter(Boolean).join(' · ') || '—'}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-fg">{p.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
                {p.shortDescription || p.description}
              </p>
            </article>
          ))}
        </div>
        {!query.isLoading && !(query.data ?? []).length ? (
          <EmptyState title={locale === 'ar' ? 'لا توجد مشاريع' : 'No projects published'} />
        ) : null}
      </div>
    </>
  );
}

export function NewsPage() {
  const { locale } = useI18n();
  const query = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const res = await cmsApi.news();
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  return (
    <>
      <Seo title={locale === 'ar' ? 'الأخبار' : 'News'} path="/news" />
      <PageHero
        title={locale === 'ar' ? 'الأخبار' : 'News & insights'}
        subtitle={
          locale === 'ar' ? 'تحديثات من افاق الطاقة.' : 'Updates from Energy Horizon.'
        }
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
        <div className="divide-y divide-[var(--border)] border-y border-line">
          {(query.data ?? []).map((n) => (
            <Link key={n.id} to={`/news/${n.slug}`} className="group block py-8">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                {n.publishedAt
                  ? new Date(n.publishedAt).toLocaleDateString(
                      locale === 'ar' ? 'ar-IQ' : 'en-GB',
                      { year: 'numeric', month: 'short', day: 'numeric' },
                    )
                  : ''}
                {n.author ? ` · ${n.author}` : ''}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-fg transition group-hover:text-accent">
                {n.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{n.excerpt}</p>
            </Link>
          ))}
        </div>
        {!query.isLoading && !(query.data ?? []).length ? (
          <EmptyState title={locale === 'ar' ? 'لا توجد أخبار' : 'No news yet'} />
        ) : null}
      </div>
    </>
  );
}

export function NewsDetailPage({ slug }: { slug: string }) {
  const query = useQuery({
    queryKey: ['news', slug],
    queryFn: async () => (await cmsApi.newsBySlug(slug)).data,
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return <ErrorState title="Article not found" onRetry={() => void query.refetch()} />;
  }

  return (
    <>
      <Seo
        title={query.data.title}
        path={`/news/${slug}`}
        description={query.data.excerpt || undefined}
      />
      <PageHero title={query.data.title} subtitle={query.data.excerpt || undefined} />
      <article className="mx-auto max-w-3xl px-4 py-16 whitespace-pre-wrap text-base leading-relaxed text-muted sm:px-6 lg:px-8">
        {query.data.content || 'Full article coming soon.'}
      </article>
    </>
  );
}

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactPage() {
  const { locale } = useI18n();
  const offices = useQuery({
    queryKey: ['offices'],
    queryFn: async () => (await cmsApi.offices()).data,
  });
  const form = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactForm) {
    const subject = encodeURIComponent(`Inquiry from ${values.firstName} ${values.lastName}`);
    const body = encodeURIComponent(
      [
        `Name: ${values.firstName} ${values.lastName}`,
        `Email: ${values.email}`,
        values.phone ? `Phone: ${values.phone}` : '',
        values.company ? `Company: ${values.company}` : '',
        '',
        values.message,
      ]
        .filter(Boolean)
        .join('\n'),
    );
    window.location.href = `mailto:info@energy-horizon.net?subject=${subject}&body=${body}`;
    toast.success(
      locale === 'ar'
        ? 'جارٍ فتح برنامج البريد… لطلبات المنتجات استخدم المتجر.'
        : 'Opening your email client… For product quotes, use the store.',
    );
    form.reset();
  }

  return (
    <>
      <Seo title={locale === 'ar' ? 'تواصل معنا' : 'Contact'} path="/contact" />
      <PageHero
        title={locale === 'ar' ? 'تواصل معنا' : 'Contact'}
        subtitle={
          locale === 'ar'
            ? 'اطلب عرض سعر أو تحدّث مع الفريق التجاري.'
            : 'Request a quote or speak with our commercial team.'
        }
      />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3 border border-line bg-[var(--card)] p-6 sm:p-8"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder={locale === 'ar' ? 'الاسم الأول' : 'First name'}
              {...form.register('firstName')}
            />
            <Input
              placeholder={locale === 'ar' ? 'اسم العائلة' : 'Last name'}
              {...form.register('lastName')}
            />
          </div>
          <Input
            type="email"
            placeholder={locale === 'ar' ? 'البريد' : 'Email'}
            {...form.register('email')}
          />
          <Input
            placeholder={locale === 'ar' ? 'الهاتف' : 'Phone'}
            {...form.register('phone')}
          />
          <Input
            placeholder={locale === 'ar' ? 'الشركة' : 'Company'}
            {...form.register('company')}
          />
          <Textarea
            placeholder={locale === 'ar' ? 'كيف يمكننا المساعدة؟' : 'How can we help?'}
            {...form.register('message')}
          />
          <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-sm">
            {form.formState.isSubmitting
              ? locale === 'ar'
                ? 'جارٍ الإرسال…'
                : 'Sending…'
              : locale === 'ar'
                ? 'إرسال الطلب'
                : 'Send request'}
          </Button>
        </form>
        <div>
          <h2 className="text-2xl font-semibold text-fg">
            {locale === 'ar' ? 'المكاتب' : 'Offices'}
          </h2>
          {offices.isLoading ? <LoadingState /> : null}
          <div className="mt-6 divide-y divide-[var(--border)] border-y border-line">
            {(offices.data ?? []).map((o) => (
              <div key={o.id} className="py-5 text-sm">
                <p className="font-semibold text-fg">{o.name}</p>
                <p className="mt-1 text-muted">{[o.city, o.country].filter(Boolean).join(', ')}</p>
                {o.phone ? (
                  <a href={`tel:${o.phone.replace(/\s/g, '')}`} className="mt-2 inline-block text-accent">
                    {o.phone}
                  </a>
                ) : null}
                {o.email ? <p className="mt-1 text-muted">{o.email}</p> : null}
                {o.contactPerson ? (
                  <p className="mt-2 text-muted">
                    {locale === 'ar' ? 'المسؤول: ' : 'Contact: '}
                    {o.contactPerson}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          {!offices.isLoading && !(offices.data ?? []).length ? (
            <EmptyState
              title={locale === 'ar' ? 'تفاصيل المكاتب قريباً' : 'Office details coming soon'}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
