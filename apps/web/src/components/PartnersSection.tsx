import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/components/Reveal';
import { CLIENT_LOGOS, MANUFACTURER_BRANDS } from '@/data/company-logos';

type LogoItem = { name: string; logo: string; slug: string };

function TrustSpotlight({
  item,
  kind,
  labels,
  dir,
}: {
  item: LogoItem;
  kind: 'brands' | 'clients';
  labels: { viewBrand: string; viewProjects: string };
  dir: 'ltr' | 'rtl';
}) {
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const href = kind === 'brands' ? `/brands/${item.slug}` : '/projects';
  const cta = kind === 'brands' ? labels.viewBrand : labels.viewProjects;
  const panelClass =
    kind === 'brands'
      ? 'bg-[#0070c0] text-white'
      : 'bg-[#0a1628] text-white';

  return (
    <div
      className={cn(
        'relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden px-6 py-12 sm:min-h-[340px] sm:px-10 lg:min-h-[420px]',
        panelClass,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgb(255_255_255/0.12),transparent_65%)]"
        aria-hidden
      />
      <div className="trust-spotlight-logo relative flex h-28 w-full max-w-md items-center justify-center rounded-2xl bg-white px-8 py-6 shadow-lg shadow-black/15 sm:h-32">
        <img
          src={item.logo}
          alt={item.name}
          className="logo-mark max-h-16 w-auto max-w-full object-contain sm:max-h-20"
        />
      </div>
      <p className="trust-spotlight-title relative mt-8 text-center text-lg font-extrabold tracking-tight sm:text-xl">
        {item.name}
      </p>
      <Link
        to={href}
        className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-bold backdrop-blur-sm transition hover:bg-white/20"
      >
        {cta}
        {kind === 'brands' ? (
          <Arrow className="h-4 w-4" />
        ) : (
          <ArrowUpRight className="h-4 w-4" />
        )}
      </Link>
    </div>
  );
}

function TrustRoster({
  items,
  activeIndex,
  onSelect,
  kind,
}: {
  items: readonly LogoItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  kind: 'brands' | 'clients';
}) {
  return (
    <>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {items.map((item, i) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-2.5 text-xs font-bold transition',
              i === activeIndex
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-card text-muted',
            )}
          >
            {item.name}
          </button>
        ))}
      </div>

      <ul className="hidden max-h-[420px] overflow-y-auto lg:block">
        {items.map((item, i) => (
          <li key={item.slug}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                'trust-roster-row flex w-full items-center gap-3 px-4 py-3 text-start transition',
                i === activeIndex && 'is-active',
              )}
            >
              <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-white px-1.5 shadow-sm dark:bg-[#d9e2ec]">
                <img
                  src={item.logo}
                  alt=""
                  className="logo-mark max-h-7 max-w-full object-contain"
                />
              </span>
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-sm font-semibold',
                  i === activeIndex ? 'text-accent' : 'text-fg',
                )}
              >
                {item.name}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 hidden items-center justify-between border-t border-line pt-3 lg:flex">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
          {activeIndex + 1} / {items.length}
        </span>
        <Link
          to={kind === 'brands' ? '/brands' : '/projects'}
          className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent"
        >
          →
        </Link>
      </div>
    </>
  );
}

export function PartnersSection({
  dir,
  labels,
}: {
  dir: 'ltr' | 'rtl';
  labels: {
    partners: string;
    partnersSub: string;
    clients: string;
    brands: string;
    viewBrand: string;
    viewProjects: string;
    allBrands: string;
    allProjects: string;
  };
}) {
  const [tab, setTab] = useState<'brands' | 'clients'>('brands');
  const [brandIndex, setBrandIndex] = useState(0);
  const [clientIndex, setClientIndex] = useState(0);

  const brandItems = MANUFACTURER_BRANDS;
  const clientItems = CLIENT_LOGOS;

  useEffect(() => {
    setBrandIndex(0);
    setClientIndex(0);
  }, [tab]);

  const activeBrand = brandItems[brandIndex] ?? brandItems[0];
  const activeClient = clientItems[clientIndex] ?? clientItems[0];

  return (
    <section className="border-b border-line bg-page py-20 text-fg sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {labels.partners}
            </h2>
            <p className="mt-5 text-sm font-medium leading-relaxed text-muted sm:text-lg">
              {labels.partnersSub}
            </p>
          </Reveal>

          <Reveal delay={1} className="flex shrink-0 rounded-xl border border-border/80 bg-card p-1">
            <button
              type="button"
              onClick={() => setTab('brands')}
              className={cn(
                'rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition sm:px-6 sm:text-[13px]',
                tab === 'brands'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-muted hover:text-fg',
              )}
            >
              {labels.brands}
            </button>
            <button
              type="button"
              onClick={() => setTab('clients')}
              className={cn(
                'rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition sm:px-6 sm:text-[13px]',
                tab === 'clients'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-muted hover:text-fg',
              )}
            >
              {labels.clients}
            </button>
          </Reveal>
        </div>

        <Reveal delay={2} className="mt-12 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm lg:rounded-3xl">
          <div className="grid lg:grid-cols-12">
            <div className="border-b border-line p-4 sm:p-6 lg:col-span-4 lg:border-b-0 lg:border-e lg:p-5">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                {tab === 'brands' ? labels.brands : labels.clients}
              </p>
              {tab === 'brands' ? (
                <TrustRoster
                  kind="brands"
                  items={brandItems}
                  activeIndex={brandIndex}
                  onSelect={setBrandIndex}
                />
              ) : (
                <TrustRoster
                  kind="clients"
                  items={clientItems}
                  activeIndex={clientIndex}
                  onSelect={setClientIndex}
                />
              )}
            </div>

            <div className="lg:col-span-8">
              {tab === 'brands' && activeBrand ? (
                <TrustSpotlight
                  key={activeBrand.slug}
                  item={activeBrand}
                  kind="brands"
                  labels={labels}
                  dir={dir}
                />
              ) : null}
              {tab === 'clients' && activeClient ? (
                <TrustSpotlight
                  key={activeClient.slug}
                  item={activeClient}
                  kind="clients"
                  labels={labels}
                  dir={dir}
                />
              ) : null}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 sm:justify-end">
          <Link
            to="/brands"
            className="text-sm font-bold text-accent transition hover:underline"
          >
            {labels.allBrands} →
          </Link>
          <Link
            to="/projects"
            className="text-sm font-bold text-muted transition hover:text-accent hover:underline"
          >
            {labels.allProjects} →
          </Link>
        </div>
      </div>
    </section>
  );
}
