import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { formatMoney, cn } from '@/lib/utils';
import { storePath } from '@/lib/urls';
import { useCart } from '@/stores/cart-context';
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

export function ProductCard({
  product,
  showCart = true,
  badge,
  className,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { locale } = useI18n();
  const img = productImage(product);

  return (
    <Card
      className={cn(
        'group w-full gap-0 overflow-hidden py-0 transition hover:border-accent',
        className,
      )}
    >
      <Link to={storePath(`products/${product.slug}`)} className="block">
        <div className="relative flex h-44 items-center justify-center overflow-hidden bg-black/5 dark:bg-black">
          {img ? (
            <img
              src={img}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="text-xs text-muted-foreground">
              {locale === 'ar' ? 'بدون صورة' : 'No image'}
            </span>
          )}
          {badge ? (
            <span className="absolute start-3 top-3 bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              {badge}
            </span>
          ) : null}
        </div>
        <CardHeader className="gap-1.5 p-4 pb-2">
          <CardDescription className="text-[11px] font-semibold uppercase tracking-[0.12em]">
            {product.brand?.name || product.sku}
          </CardDescription>
          <CardTitle className="line-clamp-2 text-base leading-snug group-hover:text-accent">
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="font-kpi text-sm text-accent">
            {formatMoney(product.price, product.currency, locale === 'ar' ? 'ar-IQ' : 'en-US')}
          </p>
        </CardContent>
      </Link>
      {showCart ? (
        <CardFooter className="border-t border-border p-3">
          <Button className="w-full" size="sm" onClick={() => void addItem(product.id, 1)}>
            {locale === 'ar' ? 'أضف للسلة' : 'Add to cart'}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
