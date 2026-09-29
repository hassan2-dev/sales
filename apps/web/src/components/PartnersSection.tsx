import { Link } from 'react-router-dom';
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
  return null;
}

/** Own company is not a "partner" — keep it out of the roster. */
function isExternalPartner(brand: Brand) {
  return brand.slug !== 'energy-horizon';
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
  const partners = brands.filter(isExternalPartner);

  return (
    <section className="relative overflow-hidden border-b border-line bg-page text-fg">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
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

        {partners.length ? (
          <div className="mt-12">
            <Reveal className="mb-6 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                {labels.brands}
              </p>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </Reveal>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((b, i) => {
                const logo = brandLogoSrc(b);
                return (
                  <Reveal key={b.id} delay={i % 6}>
                    <Link
                      to={storePath(`brands/${b.slug}`)}
                      className="partner-logo-cell group flex min-h-[7.5rem] items-center justify-center rounded-2xl border border-border bg-card px-6 py-8 transition duration-300 hover:-translate-y-1 hover:border-accent"
                    >
                      {logo ? (
                        <img
                          src={logo}
                          alt={b.name}
                          className="max-h-12 max-w-[200px] object-contain opacity-80 transition duration-300 group-hover:opacity-100 dark:brightness-0 dark:invert"
                        />
                      ) : (
                        <span className="text-center text-xl font-extrabold tracking-tight text-fg/80 transition group-hover:text-accent sm:text-2xl">
                          {b.name}
                        </span>
                      )}
                    </Link>
                  </Reveal>
                );
              })}
            </div>
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
                  <div className="partner-client-cell group flex h-full items-center gap-4 rounded-2xl border border-border bg-card px-4 py-4 transition duration-300 hover:-translate-y-1 hover:border-accent sm:px-5">
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
