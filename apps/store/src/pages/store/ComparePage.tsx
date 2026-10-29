import { Link, useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { AvailabilityBadge, StorePageHeader } from '@/components/store/StoreUI';
import { catalogApi } from '@/services/endpoints';
import { useCompare } from '@/stores/compare-context';
import { useCart } from '@/stores/cart-context';
import { useI18n } from '@/i18n/i18n-context';
import { storePath } from '@/lib/urls';
import { useCommerceSettings } from '@/stores/commerce-settings-context';
import type { Product } from '@/types';

export function ComparePage() {
  const { locale } = useI18n();
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const commerce = useCommerceSettings();
  const navigate = useNavigate();
  const { ids, remove, clear } = useCompare();
  const { addItem } = useCart();

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['store-compare-product', id],
      queryFn: async () => (await catalogApi.productById(id)).data as Product,
      staleTime: 60_000,
    })),
  });

  const loading = queries.some((q) => q.isLoading);
  const products = queries.map((q) => q.data).filter((p): p is Product => Boolean(p));

  const specKeys = Array.from(
    new Set(
      products.flatMap((p) =>
        p.specifications && typeof p.specifications === 'object'
          ? Object.keys(p.specifications)
          : [],
      ),
    ),
  ).slice(0, 8);

  const rows = [
    {
      key: 'brand',
      label: locale === 'ar' ? 'العلامة' : 'Brand',
      render: (p: Product) => p.brand?.name || '—',
    },
    {
      key: 'category',
      label: locale === 'ar' ? 'القسم' : 'Category',
      render: (p: Product) => p.category?.name || '—',
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (p: Product) => p.sku,
    },
    {
      key: 'price',
      label: locale === 'ar' ? 'السعر' : 'Price',
      render: (p: Product) =>
        commerce.formatDisplayPrice(p.price, p.currency, moneyLocale),
    },
    {
      key: 'stock',
      label: locale === 'ar' ? 'التوفر' : 'Availability',
      render: (p: Product) => (
        <AvailabilityBadge availability={p.availability} stock={p.stock} locale={locale} />
      ),
    },
    ...specKeys.map((key) => ({
      key: `spec-${key}`,
      label: key,
      render: (p: Product) =>
        p.specifications && typeof p.specifications === 'object'
          ? String((p.specifications as Record<string, unknown>)[key] ?? '—')
          : '—',
    })),
  ];

  return (
    <>
      <Seo title={locale === 'ar' ? 'مقارنة المنتجات' : 'Compare products'} path={storePath('compare')} />
      <StorePageHeader
        eyebrow={locale === 'ar' ? 'مقارنة' : 'Compare'}
        title={locale === 'ar' ? 'مقارنة المنتجات' : 'Product comparison'}
        description={
          locale === 'ar'
            ? 'قارن منتجات من نفس القسم — المواصفات والتوفر والأسعار'
            : 'Compare products from the same category — specs, stock, and price'
        }
        actions={
          products.length ? (
            <Button variant="outline" onClick={clear}>
              {locale === 'ar' ? 'مسح الكل' : 'Clear all'}
            </Button>
          ) : null
        }
      />

      <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        {loading ? <LoadingState variant="products" /> : null}
        {!loading && !products.length ? (
          <EmptyState
            title={locale === 'ar' ? 'لا توجد منتجات للمقارنة' : 'No products to compare'}
            description={
              locale === 'ar'
                ? 'أضف منتجات من نفس القسم عبر أيقونة المقارنة'
                : 'Add products from the same category via the compare icon'
            }
            action={{
              label: locale === 'ar' ? 'تصفح المنتجات' : 'Browse products',
              onClick: () => navigate(storePath('products')),
            }}
          />
        ) : null}

        {products.length ? (
          <>
            {/* Mobile: stacked cards */}
            <div className="space-y-4 md:hidden">
              {products.map((p) => (
                <article key={p.id} className="store-surface overflow-hidden">
                  <div className="aspect-4/3 bg-mist dark:bg-muted/40">
                    {p.images?.[0]?.url || p.imageUrl ? (
                      <img
                        src={p.images?.[0]?.url || p.imageUrl || ''}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={storePath(`products/${p.slug}`)}
                        className="min-w-0 text-base font-bold text-fg hover:text-accent"
                      >
                        {p.name}
                      </Link>
                      <button
                        type="button"
                        className="shrink-0 text-xs font-semibold text-red-600"
                        onClick={() => remove(p.id)}
                      >
                        {locale === 'ar' ? 'إزالة' : 'Remove'}
                      </button>
                    </div>
                    <dl className="space-y-2 text-sm">
                      {rows.map((row) => (
                        <div key={row.key} className="flex justify-between gap-3">
                          <dt className="shrink-0 text-muted">{row.label}</dt>
                          <dd className="min-w-0 break-words text-end font-medium text-fg">
                            {row.render(p)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className="flex flex-col gap-2 pt-1">
                      <Button className="w-full" onClick={() => void addItem(p.id, 1, p)}>
                        {locale === 'ar' ? 'أضف للسلة' : 'Add to cart'}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] border-separate border-spacing-3">
                <thead>
                  <tr>
                    <th className="w-36 p-0 text-start text-xs font-bold uppercase tracking-wider text-muted">
                      {locale === 'ar' ? 'الخاصية' : 'Attribute'}
                    </th>
                    {products.map((p) => (
                      <th key={p.id} className="p-0 align-top">
                        <div className="store-surface overflow-hidden">
                          <div className="aspect-4/3 bg-mist dark:bg-muted/40">
                            {p.images?.[0]?.url || p.imageUrl ? (
                              <img
                                src={p.images?.[0]?.url || p.imageUrl || ''}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="space-y-2 p-3 text-start">
                            <Link
                              to={storePath(`products/${p.slug}`)}
                              className="line-clamp-2 text-sm font-bold text-fg hover:text-accent"
                            >
                              {p.name}
                            </Link>
                            <button
                              type="button"
                              className="text-xs font-semibold text-red-600"
                              onClick={() => remove(p.id)}
                            >
                              {locale === 'ar' ? 'إزالة' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key}>
                      <td className="rounded-xl bg-card px-3 py-3 text-xs font-bold text-muted">
                        {row.label}
                      </td>
                      {products.map((p) => (
                        <td key={p.id} className="rounded-xl bg-card px-3 py-3 text-sm break-words text-fg">
                          {row.render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="rounded-xl bg-card px-3 py-3 text-xs font-bold text-muted">
                      {locale === 'ar' ? 'إجراء' : 'Action'}
                    </td>
                    {products.map((p) => (
                      <td key={p.id} className="rounded-xl bg-card px-3 py-3">
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => void addItem(p.id, 1, p)}
                          >
                            {locale === 'ar' ? 'أضف للسلة' : 'Add to cart'}
                          </Button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
