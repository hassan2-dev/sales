import { Link } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import { formatMoney, cn } from '@/lib/utils';
import { storePath } from '@/lib/urls';
import { useCart } from '@/stores/cart-context';
import { useFavorites } from '@/stores/favorites-context';
import { useI18n } from '@/i18n/i18n-context';
import type { Product } from '@/types';

type ProductCardProps = {
  product: Product;
  showCart?: boolean;
  badge?: string;
  className?: string;
  /** Stagger entrance animation index */
  index?: number;
};

function productImage(p: Product) {
  return p.images?.[0]?.url || p.imageUrl || null;
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
  const { locale } = useI18n();
  const img = productImage(product);
  const fav = isFavorite(product.id);
  const outOfStock =
    product.availability === 'OUT_OF_STOCK' || Number(product.stock ?? 0) <= 0;
  const maxStock = Math.max(1, Number(product.stock ?? 99));

  const line = cart?.items?.find(
    (i) => i.productId === product.id || i.product?.id === product.id,
  );
  const qty = line?.quantity ?? 0;

  return (
    <article
      className={cn('store-card group flex h-full flex-col', className)}
      style={{ animationDelay: `${Math.min(index, 14) * 45}ms` }}
    >
      <div className="relative overflow-hidden">
        <Link to={storePath(`products/${product.slug}`)} className="block">
          <div className="aspect-4/3 overflow-hidden bg-muted/30">
            {img ? (
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-linear-to-br from-accent/15 via-muted/20 to-transparent text-muted">
                <ShoppingBag className="h-8 w-8 opacity-40 transition group-hover:scale-110 group-hover:text-accent" />
                <span className="text-[11px]">{locale === 'ar' ? 'بدون صورة' : 'No image'}</span>
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        </Link>

        <button
          type="button"
          onClick={() => toggle(product.id)}
          className={cn(
            'absolute end-2.5 top-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/95 text-fg shadow-md backdrop-blur transition hover:scale-110',
            fav && 'border-accent bg-accent text-white',
          )}
          aria-label={locale === 'ar' ? 'المفضلة' : 'Favorite'}
        >
          <Heart className={cn('h-4 w-4 transition', fav && 'fill-current scale-110')} />
        </button>

        {badge ? (
          <span className="absolute start-2.5 top-2.5 rounded-md bg-accent px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white shadow-md">
            {badge}
          </span>
        ) : null}

        {outOfStock ? (
          <span className="absolute inset-x-0 bottom-0 bg-black/75 py-1.5 text-center text-[11px] font-bold text-white">
            {locale === 'ar' ? 'غير متوفر' : 'Out of stock'}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <Link to={storePath(`products/${product.slug}`)} className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {product.brand?.name || product.category?.name || product.sku}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-fg transition group-hover:text-accent">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2">
          <p className="text-lg font-extrabold tabular-nums text-accent">
            {formatMoney(product.price, product.currency, locale === 'ar' ? 'ar-IQ' : 'en-US')}
          </p>
          {!outOfStock && Number(product.stock ?? 0) > 0 ? (
            <span className="text-[10px] font-semibold text-muted">
              {locale === 'ar' ? `متوفر ${product.stock}` : `Stock ${product.stock}`}
            </span>
          ) : null}
        </div>

        {showCart ? (
          qty > 0 && line ? (
            <div className="flex h-11 items-center justify-between rounded-xl border border-accent/30 bg-accent/5 px-1 transition">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg transition hover:bg-accent hover:text-white disabled:opacity-30"
                disabled={qty <= 1}
                onClick={() => void updateItem(line.id, qty - 1)}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-7 text-center text-base font-extrabold tabular-nums">{qty}</span>
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
          )
        ) : null}
      </div>
    </article>
  );
}
