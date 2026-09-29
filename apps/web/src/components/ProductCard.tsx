import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
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
};

function productImage(p: Product) {
  return p.images?.[0]?.url || p.imageUrl || null;
}

function stockLabel(product: Product, locale: string) {
  const stock = Number(product.stock ?? 0);
  if (product.availability === 'OUT_OF_STOCK' || stock <= 0) {
    return {
      text: locale === 'ar' ? 'غير متوفر' : 'Out of stock',
      tone: 'danger' as const,
    };
  }
  if (stock <= 5) {
    return {
      text: locale === 'ar' ? 'كمية محدودة' : 'Low stock',
      tone: 'warn' as const,
    };
  }
  return {
    text: locale === 'ar' ? 'متوفر' : 'In stock',
    tone: 'ok' as const,
  };
}

export function ProductCard({
  product,
  showCart = true,
  badge,
  className,
}: ProductCardProps) {
  const { cart, addItem, updateItem, removeItem, loading } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const { locale } = useI18n();
  const [busy, setBusy] = useState(false);
  const img = productImage(product);
  const fav = isFavorite(product.id);
  const stock = stockLabel(product, locale);
  const outOfStock = stock.tone === 'danger';
  const maxStock = Math.max(1, Number(product.stock ?? 99));

  const line = cart?.items?.find((i) => i.productId === product.id || i.product?.id === product.id);
  const qty = line?.quantity ?? 0;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd() {
    await run(() => addItem(product.id, 1));
  }

  async function handleInc() {
    if (!line) return;
    if (qty >= maxStock) return;
    await run(() => updateItem(line.id, qty + 1));
  }

  async function handleDec() {
    if (!line) return;
    if (qty <= 1) {
      await run(() => removeItem(line.id));
      return;
    }
    await run(() => updateItem(line.id, qty - 1));
  }

  const disabled = busy || loading;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-fg shadow-[0_1px_0_rgb(0_0_0/0.04)] transition duration-300',
        'hover:-translate-y-1.5 hover:border-accent/60 hover:shadow-[0_28px_50px_-32px_rgb(0_112_192/0.55)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(product.id);
        }}
        className={cn(
          'absolute end-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-md transition',
          fav
            ? 'border-accent bg-accent text-white shadow-[0_8px_20px_-10px_rgb(0_112_192/0.8)]'
            : 'border-white/15 bg-black/55 text-white hover:border-accent hover:bg-accent',
        )}
        aria-label={
          fav
            ? locale === 'ar'
              ? 'إزالة من المفضلة'
              : 'Remove from favorites'
            : locale === 'ar'
              ? 'أضف للمفضلة'
              : 'Add to favorites'
        }
      >
        <Heart className={cn('h-4 w-4', fav && 'fill-current')} />
      </button>

      <Link to={storePath(`products/${product.slug}`)} className="flex min-h-0 flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#0b0b0b]">
          {img ? (
            <img
              src={img}
              alt=""
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#111] via-[#0b0b0b] to-[#0070c0]/20">
              <span className="text-xs font-semibold tracking-wide text-white/35">
                {locale === 'ar' ? 'بدون صورة' : 'No image'}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
            <span
              className={cn(
                'rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm',
                stock.tone === 'ok' && 'bg-emerald-500/20 text-emerald-100',
                stock.tone === 'warn' && 'bg-amber-500/25 text-amber-100',
                stock.tone === 'danger' && 'bg-red-500/25 text-red-100',
              )}
            >
              {stock.text}
            </span>
            {badge ? (
              <Badge className="rounded-md border-0 bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-accent">
                {badge}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              <span>{product.brand?.name || product.sku}</span>
              {product.category?.name ? (
                <>
                  <span className="text-border">·</span>
                  <span className="normal-case tracking-normal text-muted/80">
                    {product.category.name}
                  </span>
                </>
              ) : null}
            </div>
            <h3 className="line-clamp-2 min-h-[2.75rem] text-[1.05rem] font-extrabold leading-snug tracking-tight transition group-hover:text-accent">
              {product.name}
            </h3>
            {product.shortDescription ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                {product.shortDescription}
              </p>
            ) : null}
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/70 pt-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                {locale === 'ar' ? 'السعر' : 'Price'}
              </p>
              <p className="mt-1 font-kpi text-xl font-extrabold tabular-nums text-accent sm:text-2xl">
                {formatMoney(product.price, product.currency, locale === 'ar' ? 'ar-IQ' : 'en-US')}
              </p>
            </div>
            <span className="hidden text-[11px] font-semibold text-muted sm:inline">
              {product.sku}
            </span>
          </div>
        </div>
      </Link>

      {showCart ? (
        <div className="border-t border-border p-3 sm:p-4">
          {qty > 0 && line ? (
            <div className="flex h-11 items-center justify-between gap-2 rounded-xl border border-accent/35 bg-accent/10 px-1.5">
              <button
                type="button"
                disabled={disabled}
                onClick={() => void handleDec()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg transition hover:bg-accent hover:text-white disabled:opacity-50"
                aria-label={locale === 'ar' ? 'تقليل' : 'Decrease'}
              >
                {qty <= 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-4 w-4" />}
              </button>
              <span className="min-w-8 text-center text-sm font-extrabold tabular-nums text-fg">
                {qty}
              </span>
              <button
                type="button"
                disabled={disabled || qty >= maxStock}
                onClick={() => void handleInc()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg transition hover:bg-accent hover:text-white disabled:opacity-50"
                aria-label={locale === 'ar' ? 'زيادة' : 'Increase'}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              className="w-full rounded-xl"
              size="md"
              disabled={outOfStock || disabled}
              onClick={() => void handleAdd()}
            >
              <ShoppingCart className="h-4 w-4" />
              {outOfStock
                ? locale === 'ar'
                  ? 'غير متوفر'
                  : 'Unavailable'
                : locale === 'ar'
                  ? 'أضف للسلة'
                  : 'Add to cart'}
            </Button>
          )}
        </div>
      ) : null}
    </article>
  );
}
