import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-fg sm:text-[1.65rem]">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StudioHero({
  backTo,
  backLabel,
  eyebrow,
  title,
  meta,
  dir,
  actions,
}: {
  backTo: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  meta?: string;
  dir: 'rtl' | 'ltr';
  actions?: ReactNode;
}) {
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  return (
    <div className="overflow-hidden rounded-2xl border border-[#0b1f3a]/15 bg-[#0b1f3a] text-white shadow-sm">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div className="flex min-w-0 items-start gap-3">
          <Link to={backTo} className="mt-0.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="border-white/25 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white"
            >
              <BackIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7ec8f0]">{eyebrow}</p>
            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
            {meta ? <p className="mt-1 truncate text-sm text-white/70">{meta}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function StudioNav({
  items,
  active,
}: {
  items: { id: string; label: string }[];
  active: string;
}) {
  return (
    <nav className="sticky top-20 flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((item, index) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition',
            active === item.id
              ? 'bg-[#0b1f3a] text-white'
              : 'text-muted-foreground hover:bg-muted hover:text-fg',
          )}
        >
          <span className="font-mono text-[11px] opacity-70">{String(index + 1).padStart(2, '0')}</span>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export function StudioPanel({
  id,
  step,
  title,
  description,
  children,
}: {
  id: string;
  step: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-border bg-card shadow-xs">
      <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-6">
        <span className="mt-0.5 font-mono text-xs font-bold text-accent">{step}</span>
        <div>
          <h2 className="text-base font-bold text-fg">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

export function StudioDock({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-3 z-20 flex flex-wrap gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
      {children}
    </div>
  );
}
