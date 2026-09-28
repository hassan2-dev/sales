import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { cmsApi } from '@/services/endpoints';
import { useI18n } from '@/i18n/i18n-context';
import { STORE_URL } from '@/lib/urls';

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

  return (
    <>
      <Seo
        title={locale === 'ar' ? 'افاق الطاقة' : 'Energy Horizon'}
        description={t.tagline}
        path="/"
      />

      {/* Hero: brand + one line + one sentence + CTAs */}
      <section className="relative min-h-[100svh] overflow-hidden text-white">
        <div className="absolute inset-0 hero-plane" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,17,31,0.55)_0%,transparent_45%)]" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-20 pt-28 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28">
          <img
            src="/logo.png"
            alt="AT For General Trading and Engineering Services Ltd."
            className="reveal mb-10 h-[4.5rem] w-auto max-w-[min(100%,420px)] object-contain object-start sm:h-20 md:h-24"
          />

          <h1 className="reveal reveal-delay-1 max-w-3xl text-[2.75rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            {t.hero.title}
            <span className="mt-2 block text-2xl font-medium text-white/50 sm:text-3xl">
              {locale === 'ar' ? 'Energy Horizon' : 'افاق الطاقة'}
            </span>
          </h1>

          <p className="reveal reveal-delay-2 mt-6 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
            {t.hero.subtitle}
          </p>

          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-3">
            <a
              href={STORE_URL}
              className="inline-flex h-11 items-center rounded-sm bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent-soft"
            >
              {t.hero.ctaStore}
            </a>
            <Link
              to="/contact"
              className="inline-flex h-11 items-center rounded-sm border border-white/25 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t.hero.ctaContact}
            </Link>
          </div>
        </div>
      </section>

      {/* One purpose section */}
      <section className="border-b border-line bg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              {t.home.capabilities}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{t.home.capabilitiesSub}</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-fg">{t.home.services}</h2>
            <p className="mt-2 text-muted">{t.home.servicesSub}</p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-soft"
          >
            {t.home.allServices}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>

        {services.isLoading ? <LoadingState /> : null}
        {services.isError ? <ErrorState onRetry={() => void services.refetch()} /> : null}

        <div className="divide-y divide-[var(--border)] border-y border-line">
          {(services.data ?? []).map((s, i) => (
            <Link
              key={s.id}
              to={`/services/${s.slug}`}
              className="group grid gap-3 py-7 transition sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-8"
            >
              <span className="text-sm font-medium tabular-nums text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-xl font-semibold text-fg transition group-hover:text-accent">
                  {s.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted line-clamp-2">
                  {s.shortDescription || s.description}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition group-hover:opacity-100 sm:justify-self-end">
                {t.home.learnMore}
                <Arrow className="h-3.5 w-3.5" />
              </span>
            </Link>
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
      </section>

      {/* Store CTA band */}
      <section className="bg-brand text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 lg:py-20">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight">{t.home.featured}</h2>
            <p className="mt-3 text-white/60">{t.home.featuredSub}</p>
          </div>
          <a
            href={`${STORE_URL.replace(/\/$/, '')}/products`}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-sm bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent-soft"
          >
            {t.home.viewCatalog}
            <Arrow className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* News */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="text-3xl font-semibold tracking-tight text-fg">{t.home.news}</h2>
        {news.isLoading ? <LoadingState /> : null}
        <div className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {(news.data ?? []).map((n) => (
            <Link key={n.id} to={`/news/${n.slug}`} className="group block">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                {n.publishedAt
                  ? new Date(n.publishedAt).toLocaleDateString(
                      locale === 'ar' ? 'ar-IQ' : 'en-GB',
                      { year: 'numeric', month: 'short', day: 'numeric' },
                    )
                  : '—'}
              </p>
              <h3 className="mt-3 text-lg font-semibold leading-snug text-fg transition group-hover:text-accent">
                {n.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{n.excerpt}</p>
            </Link>
          ))}
        </div>
        {!news.isLoading && !(news.data ?? []).length ? (
          <EmptyState
            title={locale === 'ar' ? 'لا توجد أخبار بعد' : 'No news yet'}
            description={
              locale === 'ar' ? 'انشر المقالات من لوحة التحكم' : 'Publish articles from admin'
            }
          />
        ) : null}
      </section>

      {/* Offices */}
      <section className="border-t border-line bg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <h2 className="text-3xl font-semibold tracking-tight text-fg">{t.home.offices}</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-line bg-[var(--border)] sm:grid-cols-2">
            {(offices.data ?? []).map((o) => (
              <div key={o.id} className="bg-[var(--card)] p-8">
                <h3 className="text-lg font-semibold text-fg">{o.name}</h3>
                <p className="mt-1 text-sm text-muted">
                  {[o.city, o.country].filter(Boolean).join(', ')}
                </p>
                {o.contactPerson ? (
                  <p className="mt-5 text-sm text-fg">{o.contactPerson}</p>
                ) : null}
                {o.phone ? (
                  <a
                    href={`tel:${o.phone.replace(/\s/g, '')}`}
                    className="mt-1 inline-block text-sm font-medium text-accent hover:text-accent-soft"
                  >
                    {o.phone}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
          {!offices.isLoading && !(offices.data ?? []).length ? (
            <EmptyState
              title={locale === 'ar' ? 'لا توجد مكاتب' : 'No offices listed'}
            />
          ) : null}
        </div>
      </section>
    </>
  );
}
