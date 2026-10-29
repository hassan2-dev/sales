import { cn } from '@/lib/cn';

export function AvailabilityBadge({
  availability,
  stock,
  locale,
  className,
}: {
  availability?: string | null;
  stock?: number | null;
  locale: string;
  className?: string;
}) {
  const out =
    availability === 'OUT_OF_STOCK' || (stock != null && Number(stock) <= 0);
  const low =
    !out && stock != null && Number(stock) > 0 && Number(stock) <= 5;

  if (out) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-300',
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        {locale === 'ar' ? 'غير متوفر' : 'Out of stock'}
      </span>
    );
  }

  if (low) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300',
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {locale === 'ar' ? `مخزون محدود (${stock})` : `Low stock (${stock})`}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {locale === 'ar' ? 'متوفر' : 'In stock'}
    </span>
  );
}

export function SectionHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-2xl">
        <h2 className="text-xl font-extrabold tracking-tight text-fg sm:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-1.5 text-sm leading-relaxed text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StorePageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-end justify-between gap-4 px-4 py-7 sm:px-6 lg:px-10">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
            {title}
          </h1>
          {description ? <div className="mt-1.5 text-sm text-muted">{description}</div> : null}
        </div>
        {actions}
      </div>
    </div>
  );
}
