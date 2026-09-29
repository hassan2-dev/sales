import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { ProductCard } from '@/components/ProductCard';
import { catalogApi } from '@/services/endpoints';
import { useFavorites } from '@/stores/favorites-context';
import { useI18n } from '@/i18n/i18n-context';
import { storePath } from '@/lib/urls';
import type { Product } from '@/types';

export function FavoritesPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { ids, clear } = useFavorites();

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['store-fav-product', id],
      queryFn: async () => (await catalogApi.productById(id)).data as Product,
      staleTime: 60_000,
    })),
  });

  const loading = queries.some((q) => q.isLoading);
  const products = queries.map((q) => q.data).filter((p): p is Product => Boolean(p));

  return (
    <>
      <Seo title={locale === 'ar' ? 'المفضلة' : 'Favorites'} path={storePath('favorites')} />
      <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {locale === 'ar' ? 'المفضلة' : 'Favorites'}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {locale === 'ar' ? 'منتجاتك المحفوظة' : 'Your saved products'}
            </h1>
            <p className="mt-3 text-sm text-muted">
              {locale === 'ar'
                ? `${ids.length} منتج محفوظ على هذا الجهاز`
                : `${ids.length} saved on this device`}
            </p>
          </div>
          {ids.length ? (
            <Button variant="outline" onClick={clear}>
              {locale === 'ar' ? 'مسح الكل' : 'Clear all'}
            </Button>
          ) : null}
        </div>

        <div className="mt-10">
          {loading ? <LoadingState variant="products" /> : null}
          {!loading && !products.length ? (
            <EmptyState
              title={locale === 'ar' ? 'لا توجد مفضلات' : 'No favorites yet'}
              description={
                locale === 'ar'
                  ? 'اضغط أيقونة القلب على المنتجات لإضافتها هنا'
                  : 'Tap the heart icon on products to add them here'
              }
              action={{
                label: locale === 'ar' ? 'تصفح المنتجات' : 'Browse products',
                onClick: () => navigate(storePath('products')),
              }}
            />
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
