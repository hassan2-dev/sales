import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

type CountUpStatProps = {
  end: number;
  suffix?: string;
  label: string;
  durationMs?: number;
  className?: string;
};

export function CountUpStat({
  end,
  suffix = '',
  label,
  durationMs = 1600,
  className,
}: CountUpStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(end);
      setStarted(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end]);

  useEffect(() => {
    if (!started) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(end);
      return;
    }

    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(end * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, end, durationMs]);

  return (
    <div ref={ref} className={cn(className)}>
      <p className="font-kpi text-5xl font-extrabold text-accent tabular-nums sm:text-6xl">
        {value.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
        {label}
      </p>
    </div>
  );
}
