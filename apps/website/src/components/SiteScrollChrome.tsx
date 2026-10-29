import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/i18n/i18n-context';

function readScrollProgress() {
  const el = document.documentElement;
  const max = el.scrollHeight - el.clientHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, el.scrollTop / max));
}

export function useSiteScrollChrome() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('site-hide-scrollbar');

    let frame = 0;
    const update = () => {
      frame = 0;
      setProgress(readScrollProgress());
      setShowTop(window.scrollY > 320);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      root.classList.remove('site-hide-scrollbar');
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return { progress, showTop };
}

export function HeaderScrollProgress({ progress }: { progress: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-0.5 overflow-hidden bg-border"
      aria-hidden
    >
      <div
        className="h-full origin-start bg-accent transition-[transform] duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

export function ScrollToTopButton({ show }: { show: boolean }) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t.common.backToTop}
      className={cn(
        'fixed bottom-6 end-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card text-fg shadow-lg shadow-black/10 transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white dark:shadow-black/40 sm:end-8',
        show
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
    </button>
  );
}
