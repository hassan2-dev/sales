import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

const HERO_SLIDES = [
  '/company/p01-1.jpg',
  '/company/p05-1.jpg',
  '/company/p06-1.jpg',
  '/company/p12-1.jpg',
  '/company/p14-1.jpg',
  '/company/p10-1.jpg',
];

const INTERVAL_MS = 6000;

export function HeroSlideshow({
  images = HERO_SLIDES,
  intervalMs = INTERVAL_MS,
  className,
  showDots = true,
}: {
  images?: string[];
  intervalMs?: number;
  className?: string;
  showDots?: boolean;
}) {
  const [active, setActive] = useState(0);
  const slides = images.length ? images : HERO_SLIDES;

  useEffect(() => {
    if (slides.length < 2) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs, active]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {slides.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className={cn(
            'hero-slide absolute inset-0 h-full w-full object-cover object-center',
            i === active && 'is-active',
          )}
        />
      ))}

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
              onClick={() => setActive(i)}
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
