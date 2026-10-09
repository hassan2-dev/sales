import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, type Location } from 'react-router-dom';
import { cn } from '@/lib/cn';

const LOGO_SRC =
  import.meta.env.VITE_LOGO_URL?.trim() || '/energy-horizon-logo.svg';

const COVER_MS = 420;
const HOLD_MS = 280;
const REVEAL_MS = 560; // slightly longer than curtain-rise so it finishes upward before unmount

type Phase = 'idle' | 'covering' | 'holding' | 'revealing';

/**
 * Curtain only on pathname changes (all surfaces: store, site, admin).
 * Drop from top → swap page → rise back up the same way.
 */
export function RouteTransition({ children }: { children: (loc: Location) => ReactNode }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [phase, setPhase] = useState<Phase>('idle');
  const pending = useRef<Location | null>(null);
  const timers = useRef<number[]>([]);
  const runId = useRef(0);

  useEffect(() => {
    if (location.key === displayLocation.key) return;

    // Same page, only query/hash — no curtain
    if (location.pathname === displayLocation.pathname) {
      setDisplayLocation(location);
      return;
    }

    pending.current = location;
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    const id = ++runId.current;
    setPhase('covering');

    const tCover = window.setTimeout(() => {
      if (runId.current !== id) return;
      const next = pending.current;
      if (next) {
        setDisplayLocation(next);
        pending.current = null;
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
      setPhase('holding');
    }, COVER_MS);

    const tReveal = window.setTimeout(() => {
      if (runId.current !== id) return;
      setPhase('revealing');
    }, COVER_MS + HOLD_MS);

    const tIdle = window.setTimeout(() => {
      if (runId.current !== id) return;
      setPhase('idle');
    }, COVER_MS + HOLD_MS + REVEAL_MS);

    timers.current = [tCover, tReveal, tIdle];

    return () => {
      // Don't clear on displayLocation sync — only when effect re-runs for a new nav
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- driven by location
  }, [location]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  return (
    <>
      {children(displayLocation)}

      {phase !== 'idle' ? (
        <div className="fixed inset-0 z-[200] overflow-hidden" aria-hidden aria-busy>
          <div
            className={cn(
              'page-curtain absolute inset-0 flex items-center justify-center bg-card',
              phase === 'covering' && 'is-covering',
              phase === 'holding' && 'is-holding',
              phase === 'revealing' && 'is-revealing',
            )}
          >
            <div className="absolute inset-0 bg-card" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_35%,rgb(0_112_192/0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_55%_45%_at_50%_35%,rgb(0_112_192/0.28),transparent_70%)]" />
            <div className="absolute inset-x-0 top-0 h-1 bg-accent" />

            <div className="relative z-10 flex flex-col items-center gap-4 px-6">
              <img
                src={LOGO_SRC}
                alt=""
                className="h-12 w-auto max-w-[160px] object-contain sm:h-14 sm:max-w-[180px]"
                decoding="async"
              />
              <div className="h-0.5 w-14 overflow-hidden rounded-full bg-line">
                <div className="h-full w-1/2 animate-[page-shimmer_0.9s_ease-in-out_infinite] rounded-full bg-accent" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
