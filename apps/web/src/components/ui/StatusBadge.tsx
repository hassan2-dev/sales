import { cn } from '@/lib/cn';
import { useI18n } from '@/i18n/i18n-context';
import { statusLabel } from '@/i18n/dictionaries';

const tones: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  PUBLISHED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  COMPLETED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  CONFIRMED: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  PROCESSING: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  PENDING: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  DRAFT: 'bg-black/5 text-fg/70 dark:bg-white/10',
  OPEN: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  CANCELLED: 'bg-red-500/15 text-red-700 dark:text-red-300',
  ARCHIVED: 'bg-black/5 text-muted dark:bg-white/10',
  SHIPPED: 'bg-accent/15 text-steel dark:text-accent-soft',
  READY: 'bg-accent/15 text-steel dark:text-accent-soft',
  IN_PROGRESS: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  WAITING_FOR_CUSTOMER: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  CLOSED: 'bg-black/5 text-muted dark:bg-white/10',
  REVIEWING: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  QUOTED: 'bg-accent/15 text-steel dark:text-accent-soft',
  ACCEPTED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  REJECTED: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const { locale } = useI18n();
  return (
    <span
      className={cn(
        'inline-flex px-2 py-0.5 text-[11px] font-semibold tracking-wide',
        tones[status] || 'bg-black/5 text-fg/70 dark:bg-white/10',
        className,
      )}
    >
      {statusLabel(locale, status)}
    </span>
  );
}
