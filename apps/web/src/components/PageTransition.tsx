import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';

const LOGO_SRC =
  import.meta.env.VITE_LOGO_URL?.trim() || '/energy-horizon-logo.svg';

const MIN_MS = 420;
const EXIT_MS = 280;

/**
 * Branded route transition: top progress + centered logo veil on pathname change.
 */
export function PageTransition() {
  const { pathname, search } = useLocation();
  const key = `${pathname}${search}`;
  const prevKey = useRef(key);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (prevKey.current === key) return;
    prevKey.current = key;

    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    setLeaving(false);
    setVisible(true);
    setProgress(12);

    const t1 = window.setTimeout(() => setProgress(55), 80);
    const t2 = window.setTimeout(() => setProgress(82), 220);
    const t3 = window.setTimeout(() => {
      setProgress(100);
      setLeaving(true);
      const t4 = window.setTimeout(() => {
        setVisible(false);
        setLeaving(false);
        setProgress(0);
      }, EXIT_MS);
      timers.current.push(t4);
    }, MIN_MS);

    timers.current.push(t1, t2, t3);

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, [key]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-300',
        leaving ? 'opacity-0' : 'opacity-100',
      )}
      aria-hidden
      aria-busy={!leaving}
    >
      <div className="absolute inset-0 bg-page/85 backdrop-blur-[6px] dark:bg-page/90" />

      <div
        className="absolute inset-x-0 top-0 h-[2.5px] origin-left bg-accent shadow-[0_0_12px_rgb(0_112_192/0.55)] transition-[transform,opacity] duration-300 ease-out"
        style={{
          transform: `scaleX(${Math.max(progress, 4) / 100})`,
          opacity: leaving ? 0 : 1,
        }}
      />

      <div
        className={cn(
          'relative z-10 flex flex-col items-center gap-5 px-6 transition duration-300',
          leaving ? 'scale-95 opacity-0' : 'scale-100 opacity-100',
        )}
      >
        <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
          <span className="absolute inset-0 animate-[page-pulse_1.4s_ease-in-out_infinite] rounded-full border border-accent/25" />
          <span className="absolute inset-2 animate-[page-pulse_1.4s_ease-in-out_infinite_0.2s] rounded-full bg-accent/8" />
          <img
            src={LOGO_SRC}
            alt=""
            className="relative z-10 h-11 w-auto max-w-[140px] object-contain sm:h-14 sm:max-w-[168px]"
            decoding="async"
          />
        </div>
        <div className="h-0.5 w-16 overflow-hidden rounded-full bg-line">
          <div className="h-full w-1/2 animate-[page-shimmer_0.9s_ease-in-out_infinite] rounded-full bg-accent" />
        </div>
      </div>
    </div>
  );
}
