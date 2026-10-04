import { Link } from 'react-router-dom';
import type { Brand } from '@/types';
import { storePath } from '@/lib/urls';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';

function isExternalPartner(brand: Brand) {
  return brand.slug !== 'energy-horizon';
}

function BrandMark({ brand, className }: { brand: Brand; className?: string }) {
  if (brand.logo) {
    return (
      <img
        src={brand.logo}
        alt={brand.name}
        className={cn(
          'max-h-9 max-w-[150px] object-contain object-center sm:max-h-11 sm:max-w-[170px]',
          'opacity-80 grayscale transition duration-300',
          'group-hover:opacity-100 group-hover:grayscale-0',
          'dark:brightness-0 dark:invert dark:opacity-70 dark:group-hover:opacity-100',
          className,
        )}
      />
    );
  }

  return (
    <span className="text-base font-extrabold tracking-tight text-fg/65 transition group-hover:text-fg sm:text-lg">
      {brand.name}
    </span>
  );
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

            <div className="relative overflow-hidden rounded-xl border border-line bg-card py-6 sm:py-8">
              <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-10 bg-gradient-to-r from-[var(--card)] to-transparent sm:w-16" />
              <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-10 bg-gradient-to-l from-[var(--card)] to-transparent sm:w-16" />

              <div className="marquee-track flex w-max items-center gap-8 px-6 sm:gap-12">
                {belt.map((b, i) => (
                  <Link
                    key={`${b.id}-${i}`}
                    to={storePath(`brands/${b.slug}`)}
                    className="group inline-flex h-16 min-w-[9.5rem] shrink-0 items-center justify-center rounded-lg px-4 transition hover:bg-muted/50"
                    tabIndex={i >= partners.length ? -1 : undefined}
                    aria-hidden={i >= partners.length ? true : undefined}
                  >
                    <BrandMark brand={b} />
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
