import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

const HERO_SLIDES = [
  // Desert oil drilling rig
  'https://images.unsplash.com/photo-1696059928249-f036c4d54338?auto=format&fit=crop&w=2400&q=80',
  // Industrial pumps & piping
  'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=2400&q=80',
  // Power transmission / electrical
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=2400&q=80',
  // Crew in PPE on site
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2400&q=80',
];

const INTERVAL_MS = 5500;

export function HeroSlideshow({
  images = HERO_SLIDES,
  intervalMs = INTERVAL_MS,
  className,
}: {
  images?: string[];
  intervalMs?: number;
  className?: string;
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
  }, [slides.length, intervalMs]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {slides.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className={cn(
            'hero-slide absolute inset-0 h-full w-full object-cover',
            i === active && 'is-active',
          )}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-black/90 via-black/70 to-black/35 dark:from-black/95 dark:via-black/80" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_50%_60%_at_20%_50%,rgb(0_112_192/0.35),transparent_65%)]" />

      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center gap-2 px-4">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              aria-current={i === active || undefined}
              onClick={() => setActive(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-500',
                i === active ? 'w-8 bg-accent' : 'w-1.5 bg-white/40 hover:bg-white/70',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
