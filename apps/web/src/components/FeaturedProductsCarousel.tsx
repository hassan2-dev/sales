import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
import { storePath } from '@/lib/urls';
import { useI18n } from '@/i18n/i18n-context';
import { cn } from '@/lib/cn';
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

const GAP = 16;
const CARD_W = 300;
const AUTO_SPEED = 0.75;
const COPIES = 3;

export function FeaturedProductsCarousel({
  products,
  labels,
}: {
  products: Product[];
  labels: Labels;
}) {
  const { dir } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const setWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const dragMoved = useRef(false);
  const draggingRef = useRef(false);
  const pausedRef = useRef(false);
  const nudgeLockRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const loop =
    products.length > 0
      ? Array.from({ length: COPIES }, () => products).flat()
      : [];

  function measureSetWidth() {
    const track = trackRef.current;
    if (!track || !products.length) return 0;
    const w = track.scrollWidth / COPIES;
    setWidthRef.current = w;
    return w;
  }

  /** Infinite wrap into [-setWidth, 0) */
  function normalize(x: number) {
    const w = setWidthRef.current;
    if (w <= 0) return 0;
    // Real modulo into [0, w) then shift to (-w, 0]
    const r = ((x % w) + w) % w;
    return r === 0 ? 0 : r - w;
  }

  function paint(raw: number) {
    const track = trackRef.current;
    if (!track) return;
    if (!setWidthRef.current) measureSetWidth();
    const x = normalize(raw);
    offsetRef.current = x;
    track.style.transform = `translate3d(${x}px,0,0)`;
  }

  useEffect(() => {
    const boot = () => {
      const w = measureSetWidth();
      // Start on the middle copy so either direction has buffer
      offsetRef.current = dir === 'rtl' ? -w : -w;
      paint(offsetRef.current);
    };

    boot();
    // Remeasure after images settle
    const t1 = window.setTimeout(boot, 120);
    const t2 = window.setTimeout(boot, 600);

    const onResize = () => {
      measureSetWidth();
      paint(offsetRef.current);
    };
    window.addEventListener('resize', onResize);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      return () => {
        window.removeEventListener('resize', onResize);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    // Continuous infinite drift — never ends
    const sign = dir === 'rtl' ? 1 : -1;
    let raf = 0;
    const tick = () => {
      if (!draggingRef.current && !pausedRef.current && !nudgeLockRef.current) {
        paint(offsetRef.current + sign * AUTO_SPEED);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [dir, products]);

  function nudge(screenDir: 1 | -1) {
    const card = trackRef.current?.querySelector<HTMLElement>('[data-product-card]');
    const cardW = card?.offsetWidth || CARD_W;
    const step = (cardW + GAP) * screenDir;
    const from = offsetRef.current;
    const to = from + step;
    const start = performance.now();
    const dur = 380;
    nudgeLockRef.current = true;
    pausedRef.current = true;

    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - t, 3);
      paint(from + (to - from) * ease);
      if (t < 1) requestAnimationFrame(animate);
      else {
        nudgeLockRef.current = false;
        setTimeout(() => {
          pausedRef.current = false;
        }, 600);
      }
    };
    requestAnimationFrame(animate);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    // Don't capture yet — allow real clicks on product links
    dragMoved.current = false;
    draggingRef.current = false;
    dragStartX.current = e.clientX;
    dragStartOffset.current = offsetRef.current;
  }

  function onPointerMove(e: React.PointerEvent) {
    const dx = e.clientX - dragStartX.current;

    // Activate drag only after a clear slide (so tap opens product)
    if (!draggingRef.current) {
      if (Math.abs(dx) < 12) return;
      draggingRef.current = true;
      dragMoved.current = true;
      setDragging(true);
      pausedRef.current = true;
      try {
        trackRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    paint(dragStartOffset.current + dx);
  }

  function endDrag(e: React.PointerEvent) {
    if (draggingRef.current) {
      draggingRef.current = false;
      setDragging(false);
      try {
        trackRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        pausedRef.current = false;
        dragMoved.current = false;
      }, 50);
    }
  }

  function onClickCapture(e: React.MouseEvent) {
    // Block navigation only after a real drag swipe
    if (dragMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      dragMoved.current = false;
    }
  }

  if (!products.length) return null;

  return (
    <section className="border-b border-line bg-page py-14 text-fg sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <Reveal className="mb-8 flex flex-col items-start gap-4 sm:mb-10 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
          <div className="max-w-2xl min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {labels.mostRequested}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
              {labels.featured}
            </h2>
            <p className="mt-3 text-sm font-medium text-muted sm:text-base">{labels.featuredSub}</p>
          </div>
          <Link
            to={storePath('products')}
            className="btn-cta btn-cta-primary btn-shine h-11 w-full px-5 text-sm sm:w-auto"
          >
            {labels.viewCatalog}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div
          dir="ltr"
          className="carousel-shell relative"
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
        >
          <button
            type="button"
            onClick={() => nudge(1)}
            className="carousel-side-btn absolute start-0 top-1/2 z-20 hidden -translate-y-1/2 sm:inline-flex"
            aria-label={labels.prev}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => nudge(-1)}
            className="carousel-side-btn absolute end-0 top-1/2 z-20 hidden -translate-y-1/2 sm:inline-flex"
            aria-label={labels.next}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="carousel-viewport overflow-hidden px-1 sm:px-14">
            <div
              ref={trackRef}
              className={cn(
                'carousel-track flex w-max gap-4 will-change-transform',
                dragging ? 'cursor-grabbing' : 'cursor-grab',
              )}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClickCapture={onClickCapture}
              style={{ touchAction: 'pan-y' }}
            >
              {loop.map((p, i) => (
                <div
                  key={`${p.id}-${i}`}
                  data-product-card
                  className="w-[min(82vw,300px)] shrink-0 select-none sm:w-[300px]"
                  draggable={false}
                >
                  <ProductCard
                    product={p}
                    showCart={false}
                    badge={labels.mostRequested}
                    className="pointer-events-auto h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
