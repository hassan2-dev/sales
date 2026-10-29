import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger index for delay (0-based) */
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'li';
  variant?: 'up' | 'left' | 'right' | 'scale' | 'fade';
};

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
  variant = 'up',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.classList.add('is-visible');
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties | undefined = delay
    ? ({ '--reveal-delay': `${delay * 80}ms` } as CSSProperties)
    : undefined;

  return (
    <Tag
      ref={ref as never}
      className={cn('reveal-on-scroll', `reveal-${variant}`, className)}
      style={style}
    >
      {children}
    </Tag>
  );
}
