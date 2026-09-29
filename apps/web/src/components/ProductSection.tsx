import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { Reveal } from '@/components/Reveal';
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
  const { dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section>
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
        </div>
        {viewAllTo ? (
          <Link
            to={viewAllTo}
            className="group inline-flex items-center gap-2 text-sm font-bold text-accent transition hover:gap-3"
          >
            {viewAllLabel}
            <Arrow className="h-4 w-4" />
          </Link>
        ) : null}
      </Reveal>

      {loading ? <LoadingState variant="products" /> : null}
      {error ? <ErrorState onRetry={onRetry} /> : null}

      {!loading && !error ? (
        products.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
