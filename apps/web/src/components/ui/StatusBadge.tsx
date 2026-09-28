import { cn } from '@/lib/cn';

const tones: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CONFIRMED: 'bg-sky-100 text-sky-800',
  PROCESSING: 'bg-sky-100 text-sky-800',
  PENDING: 'bg-amber/20 text-amber-900',
  DRAFT: 'bg-navy/10 text-navy/70',
  OPEN: 'bg-amber/20 text-amber-900',
  CANCELLED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-navy/10 text-navy/50',
  SHIPPED: 'bg-steel/15 text-steel',
  READY: 'bg-steel/15 text-steel',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        tones[status] || 'bg-navy/10 text-navy/70',
        className,
      )}
    >
      {status}
    </span>
  );
}
