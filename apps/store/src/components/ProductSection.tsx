import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { useI18n } from '@/i18n/i18n-context';
import type { Product } from '@/types';

type ProductSectionProps = {
  eyebrow: string;
  title: string;
  products?: Product[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  badge?: string;
};

export function ProductSection({
  eyebrow,
  title,
  products = [],
  loading,
  error,
  onRetry,
  emptyTitle,
  viewAllTo,
  viewAllLabel,
  badge,
}: ProductSectionProps) {
  const { locale } = useI18n();

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-accent">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold">{title}</h2>
        </div>
        {viewAllTo ? (
          <Link to={viewAllTo} className="text-sm font-semibold text-accent">
            {viewAllLabel || (locale === 'ar' ? 'الكل' : 'All')}
          </Link>
        ) : null}
      </div>

      {loading ? <LoadingState variant="products" /> : null}
      {error ? <ErrorState onRetry={onRetry} /> : null}

      {!loading && !error ? (
        products.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} badge={badge} />
            ))}
          </div>
        ) : (
          <EmptyState title={emptyTitle || '—'} />
        )
      ) : null}
    </section>
  );
}
