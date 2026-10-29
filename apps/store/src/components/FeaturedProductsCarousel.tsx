import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { storePath } from '@/lib/urls';
import { useI18n } from '@/i18n/i18n-context';
import { useCommerceSettings } from '@/stores/commerce-settings-context';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

type Labels = {
  mostRequested: string;
  featured: string;
  featuredSub: string;
  viewCatalog: string;
  from: string;
  openProduct: string;
  prev: string;
  next: string;
};

function productImage(p: Product) {
  return p.images?.[0]?.url || p.imageUrl || null;
}

function FeaturedCard({
  product,
  index,
  badge,
  openLabel,
  moneyLocale,
}: {
  product: Product;
  index: number;
  badge: string;
  openLabel: string;
  moneyLocale: string;
}) {
  const commerce = useCommerceSettings();
  const img = productImage(product);
  const secondary = commerce.formatSecondaryPrice(
    product.price,
    product.currency,
    moneyLocale,
  );

  return (
    <Link
      to={storePath(`products/${product.slug}`)}
      className={cn(
        'group relative flex w-[min(85vw,19.5rem)] shrink-0 snap-center flex-col overflow-hidden rounded-[1.35rem]',
        'border border-border/70 bg-card text-fg shadow-[0_18px_50px_-28px_rgb(11_31_58/0.45)]',
        'transition duration-500 hover:-translate-y-1.5 hover:border-accent/35 hover:shadow-[0_28px_60px_-24px_rgb(0_112_192/0.35)]',
        'sm:w-[21rem]',
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-mist dark:bg-[#0b1220]">
        {img ? (
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-muted">
            EH
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white shadow-lg shadow-accent/30">
            {badge}
          </span>
          <span className="font-kpi text-3xl font-extrabold leading-none text-white/35 tabular-nums sm:text-4xl">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          {product.brand?.name ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
              {product.brand.name}
            </p>
          ) : null}
          <h3 className="mt-1.5 line-clamp-2 text-lg font-extrabold leading-snug tracking-tight text-white sm:text-xl">
            {product.name}
          </h3>

          <div className="mt-4 flex items-end justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                {openLabel}
              </p>
              <p className="mt-0.5 text-base font-extrabold tabular-nums text-white sm:text-lg">
                {commerce.formatDisplayPrice(product.price, product.currency, moneyLocale)}
              </p>
              {secondary ? (
                <p className="text-[11px] font-semibold tabular-nums text-white/50">{secondary}</p>
              ) : null}
            </div>
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-lg shadow-accent/40 transition group-hover:bg-white group-hover:text-accent">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedProductsCarousel({
  products,
  labels,
}: {
  products: Product[];
  labels: Labels;
}) {
  const { dir, locale } = useI18n();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const list = products.slice(0, 10);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-featured-card]');
    const step = (card?.offsetWidth ?? 320) + 20;
    el.scrollBy({
      left: step * direction * (dir === 'rtl' ? -1 : 1),
      behavior: 'smooth',
    });
  }

  if (!list.length) return null;

  return (
    <section className="overflow-x-clip border-b border-line bg-page py-14 text-fg sm:py-24">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <Reveal className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent">
              {labels.mostRequested}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-none">
              {labels.featured}
            </h2>
            <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-muted sm:text-base">
              {labels.featuredSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-fg transition hover:border-accent hover:text-accent"
                aria-label={labels.prev}
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-fg transition hover:border-accent hover:text-accent"
                aria-label={labels.next}
              >
                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </button>
            </div>
            <Link
              to={storePath('products')}
              className="btn-cta btn-cta-primary btn-shine h-11 px-5 text-sm"
            >
              {labels.viewCatalog}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth px-4 pb-2 snap-x snap-mandatory sm:gap-6 sm:px-6 lg:px-10"
      >
        {list.map((p, i) => (
          <div key={p.id} data-featured-card>
            <FeaturedCard
              product={p}
              index={i}
              badge={labels.mostRequested}
              openLabel={labels.openProduct}
              moneyLocale={moneyLocale}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
