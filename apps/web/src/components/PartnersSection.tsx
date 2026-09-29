import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Brand } from '@/types';
import { storePath } from '@/lib/urls';
import { Reveal } from '@/components/Reveal';

function partnerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!)
    .join('')
    .toUpperCase();
}

function brandLogoSrc(brand: Brand) {
  if (brand.logo) return brand.logo;
  if (brand.slug === 'energy-horizon') return '/logo.png';
  return null;
}

export function PartnersSection({
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
  const [active, setActive] = useState(0);
  const featured = brands[active] ?? brands[0] ?? null;
  const featuredLogo = featured ? brandLogoSrc(featured) : null;

  return (
    <section className="relative overflow-hidden border-b border-line bg-page text-fg">
      <div
        className="pointer-events-none absolute -start-24 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-20 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <Reveal className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
            {labels.partners}
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {labels.partnersSub}
          </h2>
        </Reveal>

        {brands.length ? (
          <div className="mt-12 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-5">
            <Reveal className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
                  {labels.brands}
                </p>
                <span className="font-kpi text-sm text-accent">
                  {String(brands.length).padStart(2, '0')}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {brands.map((b, i) => {
                  const on = i === active;
                  return (
                    <li key={b.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        onClick={() => setActive(i)}
                        className={`trust-roster-row group flex w-full items-center gap-4 px-5 py-4 text-start transition ${
                          on ? 'is-active' : ''
                        }`}
                      >
                        <span className="font-kpi w-8 text-xs text-muted transition group-[.is-active]:text-accent">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={`flex-1 text-base font-extrabold tracking-tight transition sm:text-lg ${
                            on ? 'text-accent' : 'text-fg/70 group-hover:text-fg'
                          }`}
                        >
                          {b.name}
                        </span>
                        <ArrowUpRight
                          className={`h-4 w-4 transition ${
                            on
                              ? 'text-accent opacity-100'
                              : 'text-muted opacity-0 group-hover:opacity-60'
                          }`}
                          aria-hidden
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            <Reveal delay={1}>
              <div className="trust-spotlight relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-[#0a0a0a] p-7 text-white sm:min-h-[380px] sm:p-9 dark:border-white/10">
                <div
                  className="pointer-events-none absolute inset-0 opacity-80"
                  style={{
                    backgroundImage:
                      'radial-gradient(ellipse 70% 60% at 80% 20%, rgb(0 112 192 / 0.35), transparent 60%)',
                  }}
                  aria-hidden
                />
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                    {labels.brands}
                  </p>
                  <span className="font-kpi text-4xl text-white/15 sm:text-5xl">
                    {String((active % Math.max(brands.length, 1)) + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="relative z-10 mt-auto">
                  {featuredLogo ? (
                    <img
                      key={featured?.id}
                      src={featuredLogo}
                      alt={featured?.name ?? ''}
                      className="trust-spotlight-logo mb-6 max-h-14 max-w-[200px] object-contain brightness-0 invert"
                    />
                  ) : null}
                  <h3
                    key={`name-${featured?.id}`}
                    className="trust-spotlight-title text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
                  >
                    {featured?.name}
                  </h3>
                  {featured?.description ? (
                    <p className="mt-4 line-clamp-3 max-w-md text-sm font-medium leading-relaxed text-white/55">
                      {featured.description}
                    </p>
                  ) : (
                    <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-white/55">
                      {labels.partnersSub}
                    </p>
                  )}
                  {featured ? (
                    <Link
                      to={storePath(`brands/${featured.slug}`)}
                      className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-accent transition hover:gap-3 hover:text-white"
                    >
                      {featured.name}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </Reveal>
          </div>
        ) : null}

        {clients.length ? (
          <div className="mt-16">
            <Reveal className="mb-8 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                {labels.clients}
              </p>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </Reveal>

            <div className="flex flex-wrap items-stretch gap-3">
              {clients.map((name, i) => (
                <Reveal key={name} delay={i % 6} className="min-w-[min(100%,280px)] flex-1">
                  <div className="trust-seal group flex h-full items-center gap-4 rounded-2xl border border-border bg-card px-4 py-4 transition duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_16px_36px_-18px_rgb(0_112_192/0.45)] sm:px-5">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-accent/40 bg-accent/10 font-kpi text-sm text-accent transition duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                      {partnerInitials(name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-extrabold tracking-tight sm:text-lg">
                        {name}
                      </p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                        {labels.clients}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
