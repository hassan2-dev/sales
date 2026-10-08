import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, type Location } from 'react-router-dom';
import { cn } from '@/lib/cn';

const LOGO_SRC =
  import.meta.env.VITE_LOGO_URL?.trim() || '/energy-horizon-logo.svg';

const COVER_MS = 420;
const HOLD_MS = 260;
const REVEAL_MS = 450;

type Phase = 'idle' | 'covering' | 'holding' | 'revealing';

/**
 * Keeps the old page visible under an opaque curtain until fully covered,
 * then swaps to the new route and reveals — curtain first, page second.
 */
export function RouteTransition({ children }: { children: (loc: Location) => ReactNode }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<number[]>([]);
  const pending = useRef<Location | null>(null);

  useEffect(() => {
    if (location.key === displayLocation.key) return;

    // New navigation: drop curtain over the CURRENT (old) page first
    pending.current = location;
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setPhase('covering');

    const tCover = window.setTimeout(() => {
      // Fully covered — swap page content while curtain is opaque
      const next = pending.current;
      if (next) {
        setDisplayLocation(next);
        pending.current = null;
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
      setPhase('holding');
    }, COVER_MS);

    const tReveal = window.setTimeout(() => {
      setPhase('revealing');
    }, COVER_MS + HOLD_MS);

    const tIdle = window.setTimeout(() => {
      setPhase('idle');
    }, COVER_MS + HOLD_MS + REVEAL_MS);

    timers.current.push(tCover, tReveal, tIdle);

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to URL changes
  }, [location]);

  return (
    <>
      {children(displayLocation)}

      {phase !== 'idle' ? (
        <div className="fixed inset-0 z-[200] overflow-hidden" aria-hidden aria-busy>
          <div
            className={cn(
              'page-curtain absolute inset-0 flex items-center justify-center bg-page',
              phase === 'covering' && 'is-covering',
              phase === 'holding' && 'is-holding',
              phase === 'revealing' && 'is-revealing',
            )}
          >
            <div className="absolute inset-0 bg-page" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_35%,rgb(0_112_192/0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_55%_45%_at_50%_35%,rgb(0_112_192/0.28),transparent_70%)]" />
            <div className="absolute inset-x-0 top-0 h-1 bg-accent" />

            <div
              className={cn(
                'relative z-10 flex flex-col items-center gap-4 px-6 transition duration-300',
                phase === 'revealing'
                  ? 'translate-y-2 scale-95 opacity-0'
                  : 'translate-y-0 scale-100 opacity-100',
              )}
            >
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

