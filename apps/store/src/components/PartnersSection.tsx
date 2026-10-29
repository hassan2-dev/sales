import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/components/Reveal';
import { CLIENT_LOGOS, MANUFACTURER_BRANDS } from '@/data/company-logos';

type LogoItem = { name: string; logo: string; slug: string };

function LogoGrid({
  items,
  kind,
}: {
  items: readonly LogoItem[];
  kind: 'brands' | 'clients';
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item, i) => {
        const to = kind === 'brands' ? `/brands/${item.slug}` : '/projects';
        return (
          <Reveal key={item.slug} delay={i % 5}>
            <Link
              to={to}
              className="group flex aspect-[5/3] flex-col items-center justify-center rounded-xl border border-border/80 bg-card px-4 py-5 transition duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md sm:px-5"
            >
              <span className="flex h-14 w-full items-center justify-center rounded-lg bg-white px-3 dark:bg-[#e8eef5]">
                <img
                  src={item.logo}
                  alt={item.name}
                  className="max-h-10 w-auto max-w-full object-contain transition duration-300 group-hover:scale-[1.04]"
                  loading="lazy"
                />
              </span>
              <span className="mt-3 line-clamp-1 text-center text-[11px] font-bold tracking-wide text-muted transition group-hover:text-fg sm:text-xs">
                {item.name}
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

export function PartnersSection({
  labels,
}: {
  dir?: 'ltr' | 'rtl';
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
  const items = tab === 'brands' ? MANUFACTURER_BRANDS : CLIENT_LOGOS;

  return (
    <section className="border-b border-line bg-page py-14 text-fg sm:py-24">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl min-w-0">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-none">
              {labels.partners}
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-muted sm:mt-4 sm:text-base lg:text-lg">
              {labels.partnersSub}
            </p>
          </Reveal>

          <Reveal delay={1} className="flex w-full shrink-0 rounded-xl border border-border/80 bg-card p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => setTab('brands')}
              className={cn(
                'flex-1 rounded-lg px-4 py-2.5 text-xs font-bold transition sm:flex-none sm:px-5 sm:text-sm',
                tab === 'brands' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-fg',
              )}
            >
              {labels.brands}
            </button>
            <button
              type="button"
              onClick={() => setTab('clients')}
              className={cn(
                'flex-1 rounded-lg px-4 py-2.5 text-xs font-bold transition sm:flex-none sm:px-5 sm:text-sm',
                tab === 'clients' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-fg',
              )}
            >
              {labels.clients}
            </button>
          </Reveal>
        </div>

        <div className="mt-8 sm:mt-10">
          <LogoGrid key={tab} items={items} kind={tab} />
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 sm:mt-10">
          <Link
            to="/brands"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-accent transition hover:gap-2.5"
          >
            {labels.allBrands}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted transition hover:text-accent"
          >
            {labels.allProjects}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
