import { Link } from 'react-router-dom';
import { Reveal } from '@/components/Reveal';
import { CLIENT_LOGOS, MANUFACTURER_BRANDS } from '@/data/company-logos';

function LogoMarquee({
  items,
  href,
  reverse = false,
}: {
  items: readonly { name: string; logo: string; slug: string }[];
  href: string;
  reverse?: boolean;
}) {
  const belt = [...items, ...items];

  return (
    <div className="logo-marquee relative overflow-hidden rounded-xl border border-border/80 py-6 sm:py-8">
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-10 bg-gradient-to-r from-[var(--card)] to-transparent sm:w-16 dark:from-[#d9e2ec]" />
      <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-10 bg-gradient-to-l from-[var(--card)] to-transparent sm:w-16 dark:from-[#d9e2ec]" />

      <div
        className="marquee-track flex w-max items-center gap-10 px-6 sm:gap-14"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {belt.map((item, i) => (
          <Link
            key={`${item.slug}-${i}`}
            to={href}
            className="group inline-flex h-16 min-w-[9.5rem] shrink-0 items-center justify-center px-3"
            tabIndex={i >= items.length ? -1 : undefined}
            aria-hidden={i >= items.length ? true : undefined}
          >
            <img
              src={item.logo}
              alt={item.name}
              className="logo-mark max-h-10 max-w-[150px] object-contain sm:max-h-12 sm:max-w-[170px]"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function PartnersSection({
  labels,
}: {
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
        <Reveal className="max-w-2xl">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {labels.partners}
          </h2>
          <p className="mt-5 text-sm font-medium leading-relaxed text-muted sm:text-lg">
            {labels.partnersSub}
          </p>
        </Reveal>

        <div className="mt-12">
          <div className="mb-5 flex items-center gap-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
              {labels.brands}
            </p>
            <span className="h-px flex-1 bg-line" aria-hidden />
            <Link
              to="/brands"
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent"
            >
              →
            </Link>
          </div>
          <LogoMarquee items={MANUFACTURER_BRANDS} href="/brands" />
        </div>

        <div className="mt-14">
          <div className="mb-5 flex items-center gap-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
              {labels.clients}
            </p>
            <span className="h-px flex-1 bg-line" aria-hidden />
            <Link
              to="/projects"
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent"
            >
              →
            </Link>
          </div>
          <LogoMarquee items={CLIENT_LOGOS} href="/projects" reverse />
        </div>
      </div>
    </section>
  );
}
