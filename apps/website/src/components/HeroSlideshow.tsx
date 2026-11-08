import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/** Optimized hero frames (1600×900). First slide uses dedicated LCP assets. */
const HERO_SLIDES = [
  {
    webp: '/company/hero-lcp.webp',
    jpg: '/company/hero-lcp.jpg',
    w: 960,
    h: 1200,
  },
  {
    webp: '/company/p12-1-hero.webp',
    jpg: '/company/p12-1-hero.jpg',
    w: 1600,
    h: 900,
  },
  {
    webp: '/company/p06-1-hero.webp',
    jpg: '/company/p06-1-hero.jpg',
    w: 1600,
    h: 900,
  },
  {
    webp: '/company/p14-1-hero.webp',
    jpg: '/company/p14-1-hero.jpg',
    w: 1600,
    h: 900,
  },
  {
    webp: '/company/p05-1-hero.webp',
    jpg: '/company/p05-1-hero.jpg',
    w: 1600,
    h: 900,
  },
  {
    webp: '/company/p10-1-hero.webp',
    jpg: '/company/p10-1-hero.jpg',
    w: 1600,
    h: 900,
  },
  {
    webp: '/company/p01-1-hero.webp',
    jpg: '/company/p01-1-hero.jpg',
    w: 1600,
    h: 900,
  },
] as const;

const INTERVAL_MS = 6000;

type Slide = (typeof HERO_SLIDES)[number];

export function HeroSlideshow({
  images,
  intervalMs = INTERVAL_MS,
  className,
  showDots = true,
}: {
  /** Optional override — jpg paths only; converted to single-source slides. */
  images?: string[];
  intervalMs?: number;
  className?: string;
  showDots?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [extrasReady, setExtrasReady] = useState(false);

  const slides: Slide[] = images?.length
    ? images.map((jpg) => ({ webp: jpg, jpg, w: 1600, h: 900 }))
    : [...HERO_SLIDES];

  // Defer non-LCP frames until after first paint / idle.
  useEffect(() => {
    if (slides.length < 2) return;
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setExtrasReady(true);
    };

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(enable, { timeout: 1800 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const t = window.setTimeout(enable, 900);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [slides.length]);

  useEffect(() => {
    if (!extrasReady || slides.length < 2) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [extrasReady, slides.length, intervalMs]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {slides.map((slide, i) => {
        const isLcp = i === 0;
        if (!isLcp && !extrasReady && i !== active) return null;

        return (
          <picture
            key={slide.jpg}
            className="pointer-events-none absolute inset-0 block h-full w-full"
          >
            {slide.webp !== slide.jpg ? (
              <source type="image/webp" srcSet={slide.webp} />
            ) : null}
            <img
              src={slide.jpg}
              alt=""
              aria-hidden
              width={slide.w}
              height={slide.h}
              fetchPriority={isLcp ? 'high' : 'low'}
              decoding={isLcp ? 'sync' : 'async'}
              loading={isLcp ? 'eager' : 'lazy'}
              className={cn(
                'hero-slide absolute inset-0 h-full w-full object-cover object-center',
                i === active && 'is-active',
              )}
            />
          </picture>
        );
      })}

      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black via-black/55 to-black/20" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-black/75 via-black/35 to-transparent rtl:bg-gradient-to-l" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_70%_55%_at_70%_20%,rgb(0_112_192/0.28),transparent_60%)]" />

      {showDots && slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-1 sm:bottom-6">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              aria-current={i === active || undefined}
              onClick={() => {
                setExtrasReady(true);
                setActive(i);
              }}
              className="flex h-9 w-9 items-center justify-center"
            >
              <span
                className={cn(
                  'block rounded-full transition-all duration-500',
                  i === active ? 'h-1 w-7 bg-white' : 'h-1 w-1 bg-white/45 hover:bg-white/75',
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
