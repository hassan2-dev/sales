import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  GitCompareArrows,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { formatMoney, cn } from '@/lib/utils';
import { storePath } from '@/lib/urls';
import { useCart } from '@/stores/cart-context';
import { useFavorites } from '@/stores/favorites-context';
import { useCompare } from '@/stores/compare-context';
import { useAuth } from '@/stores/auth-context';
import { useI18n } from '@/i18n/i18n-context';
import { AvailabilityBadge } from '@/components/store/StoreUI';
import type { Product } from '@/types';

type ProductCardProps = {
  product: Product;
  showCart?: boolean;
  badge?: string;
  className?: string;
  index?: number;
};

function productImage(p: Product) {
  return p.images?.[0]?.url || p.imageUrl || null;
}

function shortSpec(product: Product): string | null {
  if (product.shortDescription) return product.shortDescription;
  const specs = product.specifications;
  if (!specs || typeof specs !== 'object') return null;
  const entries = Object.entries(specs).slice(0, 2);
  if (!entries.length) return null;
  return entries.map(([k, v]) => `${k}: ${String(v)}`).join(' · ');
}

export function ProductCard({
  product,
  showCart = true,
  badge,
  className,
  index = 0,
}: ProductCardProps) {
  const { cart, addItem, updateItem, removeItem } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const { isCompared, toggle: toggleCompare } = useCompare();
  const { isAuthenticated } = useAuth();
  const { locale } = useI18n();
  const navigate = useNavigate();
  const img = productImage(product);
  const fav = isFavorite(product.id);
  const compared = isCompared(product.id);
  const outOfStock =
    product.availability === 'OUT_OF_STOCK' || Number(product.stock ?? 0) <= 0;
  const maxStock = Math.max(1, Number(product.stock ?? 99));
  const spec = shortSpec(product);

  const line = cart?.items?.find(
    (i) => i.productId === product.id || i.product?.id === product.id,
  );
  const qty = line?.quantity ?? 0;

  function onToggleFavorite() {
    if (!isAuthenticated) {
      const ok = toggle(product.id);
      if (!ok) {
        navigate(
          `${storePath('account/login')}?next=${encodeURIComponent(storePath(`products/${product.slug}`))}`,
        );
      }
      return;
    }
    toggle(product.id);
  }

  return (
    <article
      className={cn('store-card group flex h-full flex-col', className)}
      style={{ animationDelay: `${Math.min(index, 14) * 45}ms` }}
    >
      <div className="relative overflow-hidden">
        <Link to={storePath(`products/${product.slug}`)} className="block">
          <div className="aspect-4/3 overflow-hidden bg-mist/80 dark:bg-muted/40">
            {img ? (
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
                <ShoppingBag className="h-8 w-8 opacity-35 transition group-hover:text-accent" />
                <span className="text-[11px]">{locale === 'ar' ? 'بدون صورة' : 'No image'}</span>
              </div>
            )}
          </div>
        </Link>

        <div className="absolute end-2.5 top-2.5 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onToggleFavorite}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-fg shadow-sm transition hover:scale-105',
              fav && 'border-accent bg-accent text-white',
            )}
            aria-label={locale === 'ar' ? 'المفضلة' : 'Wishlist'}
          >
            <Heart className={cn('h-4 w-4', fav && 'fill-current')} />
          </button>
          <button
            type="button"
            onClick={() =>
              toggleCompare(product.id, product.category?.id || product.categoryId)
            }
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-fg shadow-sm transition hover:scale-105',
              compared && 'border-navy bg-navy text-white',
            )}
            aria-label={locale === 'ar' ? 'مقارنة' : 'Compare'}
          >
            <GitCompareArrows className="h-4 w-4" />
          </button>
        </div>

        {badge ? (
          <span className="absolute start-2.5 top-2.5 rounded-md bg-navy px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-accent">
            {product.brand?.name || product.category?.name || '—'}
          </p>
          <span className="text-[11px] text-muted">SKU {product.sku}</span>
        </div>

        <Link to={storePath(`products/${product.slug}`)} className="min-w-0">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-fg transition group-hover:text-accent">
            {product.name}
          </h3>
        </Link>

        {spec ? <p className="line-clamp-2 text-xs leading-relaxed text-muted">{spec}</p> : null}

        <AvailabilityBadge
          availability={product.availability}
          stock={product.stock}
          locale={locale}
        />

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <p className="text-lg font-extrabold tabular-nums text-navy dark:text-accent">
            {formatMoney(product.price, product.currency, locale === 'ar' ? 'ar-IQ' : 'en-US')}
          </p>
        </div>

        {showCart ? (
          <div className="space-y-2">
            {qty > 0 && line ? (
              <div className="flex h-11 items-center justify-between rounded-xl border border-accent/25 bg-accent/5 px-1">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg transition hover:bg-accent hover:text-white disabled:opacity-30"
                  disabled={qty <= 1}
                  onClick={() => void updateItem(line.id, qty - 1)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-7 text-center text-base font-extrabold tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg transition hover:bg-accent hover:text-white disabled:opacity-30"
                  disabled={qty >= maxStock}
                  onClick={() => void updateItem(line.id, qty + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="ms-1 rounded-lg px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
                  onClick={() => void removeItem(line.id)}
                >
                  {locale === 'ar' ? 'حذف' : 'Del'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => void addItem(product.id, 1, product)}
                className="store-add-btn h-11 w-full rounded-xl bg-accent text-sm font-extrabold text-white disabled:opacity-50"
              >
                {outOfStock
                  ? locale === 'ar'
                    ? 'غير متوفر'
                    : 'Unavailable'
                  : locale === 'ar'
                    ? 'أضف للسلة'
                    : 'Add to cart'}
              </button>
            )}
            <Link
              to={`${storePath('quote')}?product=${product.id}`}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-bold text-fg transition hover:border-accent hover:text-accent"
            >
              <FileText className="h-3.5 w-3.5" />
              {locale === 'ar' ? 'طلب عرض سعر' : 'Request quote'}
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
