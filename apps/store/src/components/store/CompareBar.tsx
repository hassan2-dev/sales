import { Link } from 'react-router-dom';
import { GitCompareArrows, X } from 'lucide-react';
import { useCompare } from '@/stores/compare-context';
import { useI18n } from '@/i18n/i18n-context';
import { storePath } from '@/lib/urls';

export function CompareBar() {
  const { locale } = useI18n();
  const { count, clear } = useCompare();

  if (count < 1) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
      <div className="pointer-events-auto flex w-full max-w-xl items-center gap-2 rounded-2xl border border-border bg-card/95 px-3 py-2.5 shadow-[0_18px_40px_-18px_rgb(11_31_58/0.45)] backdrop-blur-md sm:gap-3 sm:px-4 sm:py-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent sm:h-10 sm:w-10">
          <GitCompareArrows className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-fg">
            {locale === 'ar'
              ? `${count} منتجات للمقارنة`
              : `${count} product${count === 1 ? '' : 's'} to compare`}
          </p>
          <p className="truncate text-xs text-muted">
            {locale === 'ar'
              ? 'نفس القسم فقط · حد أقصى 4'
              : 'Same category only · up to 4'}
          </p>
        </div>
        <Link
          to={storePath('compare')}
          className="inline-flex h-10 shrink-0 items-center rounded-xl bg-accent px-3.5 text-xs font-bold text-white hover:bg-accent-soft"
        >
          {locale === 'ar' ? 'مقارنة' : 'Compare'}
        </Link>
        <button
          type="button"
          onClick={clear}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-muted hover:text-fg"
          aria-label={locale === 'ar' ? 'مسح' : 'Clear'}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
