import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { ProductCard } from '@/components/ProductCard';
import { StorePageHeader } from '@/components/store/StoreUI';
import { catalogApi } from '@/services/endpoints';
import { useFavorites } from '@/stores/favorites-context';
import { useAuth } from '@/stores/auth-context';
import { useI18n } from '@/i18n/i18n-context';
import { storePath } from '@/lib/urls';
import type { Product } from '@/types';

export function FavoritesPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { ids, clear } = useFavorites();

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['store-fav-product', id],
      queryFn: async () => (await catalogApi.productById(id)).data as Product,
      staleTime: 60_000,
      enabled: isAuthenticated && ids.length > 0,
    })),
  });

  const loading = authLoading || (isAuthenticated && queries.some((q) => q.isLoading));
  const products = queries.map((q) => q.data).filter((p): p is Product => Boolean(p));

  if (!authLoading && !isAuthenticated) {
    return (
      <>
        <Seo title={locale === 'ar' ? 'المفضلة' : 'Wishlist'} path={storePath('favorites')} />
        <EmptyState
          title={locale === 'ar' ? 'سجّل دخولك للمفضلة' : 'Sign in to use wishlist'}
          description={
            locale === 'ar'
              ? 'المفضلة متاحة فقط للحسابات الموثّقة'
              : 'Wishlist is available for verified accounts only'
          }
          action={{
            label: locale === 'ar' ? 'تسجيل الدخول' : 'Sign in',
            onClick: () =>
              navigate(
                `${storePath('account/login')}?next=${encodeURIComponent(storePath('favorites'))}`,
              ),
          }}
        />
      </>
    );
  }

  return (
    <>
      <Seo title={locale === 'ar' ? 'المفضلة' : 'Wishlist'} path={storePath('favorites')} />
      <StorePageHeader
        eyebrow={locale === 'ar' ? 'المفضلة' : 'Wishlist'}
        title={locale === 'ar' ? 'المنتجات المحفوظة' : 'Saved products'}
        description={
          locale === 'ar'
            ? `${ids.length} منتج محفوظ في حسابك`
            : `${ids.length} saved in your account`
        }
        actions={
          ids.length ? (
            <Button variant="outline" onClick={clear}>
              {locale === 'ar' ? 'مسح الكل' : 'Clear all'}
            </Button>
          ) : null
        }
      />

      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10">
        {loading ? <LoadingState variant="products" /> : null}
        {!loading && !products.length ? (
          <EmptyState
            title={locale === 'ar' ? 'لا توجد مفضلات' : 'No saved products yet'}
            description={
              locale === 'ar'
                ? 'اضغط أيقونة القلب على المنتجات لإضافتها هنا'
                : 'Tap the heart icon on products to save them here'
            }
            action={{
              label: locale === 'ar' ? 'تصفح المنتجات' : 'Browse products',
              onClick: () => navigate(storePath('products')),
            }}
          />
        ) : null}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}
