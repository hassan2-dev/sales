import { Link } from 'react-router-dom';
import type { Brand } from '@/types';
import { storePath } from '@/lib/urls';
import { Reveal } from '@/components/Reveal';

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
  const belt = partners.length ? [...partners, ...partners] : [];

  return (
    <section className="border-b border-line bg-page py-20 text-fg sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <Reveal className="max-w-2xl">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {labels.partners}
          </h2>
          <p className="mt-5 text-sm font-medium leading-relaxed text-muted sm:text-lg">
            {labels.partnersSub}
          </p>
        </Reveal>

        {partners.length ? (
          <div className="mt-12">
            <div className="mb-5 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                {labels.brands}
              </p>
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>

            <div className="relative overflow-hidden border-y border-line bg-card py-8">
              <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-12 bg-gradient-to-r from-[var(--card)] to-transparent sm:w-20" />
              <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-12 bg-gradient-to-l from-[var(--card)] to-transparent sm:w-20" />

              <div className="marquee-track flex w-max items-center gap-10 px-6 sm:gap-14">
                {belt.map((b, i) => (
                  <Link
                    key={`${b.id}-${i}`}
                    to={storePath(`brands/${b.slug}`)}
                    className="inline-flex h-14 min-w-[8rem] shrink-0 items-center justify-center opacity-70 transition hover:opacity-100"
                    tabIndex={i >= partners.length ? -1 : undefined}
                    aria-hidden={i >= partners.length ? true : undefined}
                  >
                    {b.logo ? (
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="max-h-10 max-w-[140px] object-contain sm:max-h-12 sm:max-w-[160px]"
                      />
                    ) : (
                      <span className="text-lg font-extrabold tracking-tight text-fg/70 sm:text-xl">
                        {b.name}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {clients.length ? (
          <div className="mt-14">
            <Reveal className="mb-6 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                {labels.clients}
              </p>
              <span className="h-px flex-1 bg-line" aria-hidden />
            </Reveal>

            <div className="flex flex-wrap gap-x-8 gap-y-4 sm:gap-x-12">
              {clients.map((name, i) => (
                <Reveal key={name} delay={i % 6}>
                  <p className="text-base font-semibold tracking-tight text-fg/80 sm:text-lg">
                    {name}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
