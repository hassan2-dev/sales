import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, GitCompareArrows, Heart, Minus, Plus, SlidersHorizontal } from 'lucide-react';
import { LoadingState, EmptyState, ErrorState, Pagination } from '@/components/ui/States';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/ProductCard';
import { AvailabilityBadge } from '@/components/store/StoreUI';
import { catalogApi, ordersApi } from '@/services/endpoints';
import { useCart } from '@/stores/cart-context';
import { useAuth } from '@/stores/auth-context';
import { useFavorites } from '@/stores/favorites-context';
import { useCompare } from '@/stores/compare-context';
import { formatMoney } from '@/lib/cn';
import { storePath } from '@/lib/urls';
import { useI18n } from '@/i18n/i18n-context';
import { statusLabel } from '@/i18n/dictionaries';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { saveStoreOrder } from '@/lib/store-orders';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Seo } from '@/lib/seo';
import { appToast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { formatOrderDate } from '@/pages/store/AccountPages';
import type { Order } from '@/types';

export function StoreProductsPage() {
  const { locale } = useI18n();
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || 1);
  const search = params.get('q') || '';
  const sortParam = params.get('sort');
  const sort = sortParam || 'newest';
  const categorySlug = params.get('category') || '';
  const brandSlug = params.get('brand') || '';
  const [mobileFilters, setMobileFilters] = useState(false);

  const sortBy =
    sort === 'bestsellers'
      ? 'bestsellers'
      : sort === 'price-low' || sort === 'price'
        ? 'price'
        : sort === 'name'
          ? 'name'
          : 'createdAt';
  const sortOrder =
    sort === 'price-low' || sort === 'price' || sort === 'name' ? 'asc' : 'desc';

  const categories = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => (await catalogApi.categories()).data,
  });
  const brands = useQuery({
    queryKey: ['store-brands'],
    queryFn: async () => (await catalogApi.brands()).data,
  });

  const query = useQuery({
    queryKey: ['store-products', page, search, sort, categorySlug, brandSlug],
    queryFn: async () =>
      (
        await catalogApi.products({
          page,
          limit: 16,
          search: search || undefined,
          sortBy,
          sortOrder,
          categorySlug: categorySlug || undefined,
          brandSlug: brandSlug || undefined,
        })
      ).data,
    retry: 1,
  });

  const sortOptions = [
    { id: 'newest', label: locale === 'ar' ? 'الأحدث' : 'Newest' },
    { id: 'bestsellers', label: locale === 'ar' ? 'الأكثر مبيعاً' : 'Best sellers' },
    { id: 'price-low', label: locale === 'ar' ? 'الأقل سعراً' : 'Price: low' },
    { id: 'name', label: locale === 'ar' ? 'الاسم' : 'Name A–Z' },
  ];

  function applyParams(next: Record<string, string | null | undefined>) {
    const merged: Record<string, string> = {
      ...(search ? { q: search } : {}),
      ...(sort && sort !== 'newest' ? { sort } : {}),
      ...(categorySlug ? { category: categorySlug } : {}),
      ...(brandSlug ? { brand: brandSlug } : {}),
      ...(page > 1 ? { page: String(page) } : {}),
    };
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === '' || (k === 'sort' && v === 'newest') || (k === 'page' && v === '1')) {
        delete merged[k];
      } else {
        merged[k] = v;
      }
    }
    setParams(merged);
  }

  const activeCategory = (categories.data ?? []).find((c) => c.slug === categorySlug);
  const activeBrand = (brands.data ?? []).find((b) => b.slug === brandSlug);
  const total = query.data?.meta.total ?? 0;
  const products = query.data?.data ?? [];
  const cats = categories.data ?? [];
  const brandList = brands.data ?? [];
  const hasFilters = Boolean(search || categorySlug || brandSlug || sortParam);

  const title = search
    ? locale === 'ar'
      ? 'نتائج البحث'
      : 'Search results'
    : activeCategory
      ? activeCategory.name
      : activeBrand
        ? activeBrand.name
        : sort === 'bestsellers'
          ? locale === 'ar'
            ? 'الأكثر مبيعاً'
            : 'Best sellers'
          : sortParam === 'newest'
            ? locale === 'ar'
              ? 'وصل حديثاً'
              : 'New arrivals'
            : locale === 'ar'
              ? 'كل المنتجات'
              : 'All products';

  return (
    <>
      <Seo title={title} path={storePath('products')} />

      {cats.length > 0 ? (
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-[90rem] px-4 py-3 sm:px-6 lg:px-10">
            <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:px-0">
              <button
                type="button"
                onClick={() => applyParams({ category: null, page: '1' })}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition',
                  !categorySlug
                    ? 'bg-navy text-white'
                    : 'border border-border bg-page text-muted hover:border-accent/40 hover:text-fg',
                )}
              >
                {locale === 'ar' ? 'كل الأقسام' : 'All'}
              </button>
              {cats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => applyParams({ category: c.slug, page: '1' })}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition',
                    categorySlug === c.slug ||
                      (c.children ?? []).some((ch) => ch.slug === categorySlug)
                      ? 'bg-accent text-white'
                      : 'border border-border bg-page text-muted hover:border-accent/40 hover:text-fg',
                  )}
                >
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : null}
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-10 lg:py-10">
        {/* Sidebar */}
        <aside className="hidden space-y-4 lg:sticky lg:top-28 lg:block lg:self-start">
          <div className="store-surface overflow-hidden">
            <div className="border-b border-border bg-navy px-4 py-3 text-white">
              <p className="text-sm font-extrabold">
                {locale === 'ar' ? 'تصفية النتائج' : 'Filter results'}
              </p>
            </div>
            <div className="space-y-5 p-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted">
                  {locale === 'ar' ? 'المجموعات / الأقسام' : 'Groups / Categories'}
                </p>
                <div className="mt-3 flex max-h-72 flex-col gap-2 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => applyParams({ category: null, page: '1' })}
                    className={cn(
                      'rounded-xl px-3 py-2 text-start text-sm transition',
                      !categorySlug
                        ? 'bg-accent/10 font-bold text-accent'
                        : 'text-muted hover:bg-mist hover:text-fg dark:hover:bg-white/5',
                    )}
                  >
                    {locale === 'ar' ? 'كل الأقسام' : 'All categories'}
                  </button>
                  {cats.map((group) => (
                    <div key={group.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => applyParams({ category: group.slug, page: '1' })}
                        className={cn(
                          'w-full rounded-xl px-3 py-2 text-start text-sm font-bold transition',
                          categorySlug === group.slug
                            ? 'bg-navy text-white'
                            : 'text-fg hover:bg-mist dark:hover:bg-white/5',
                        )}
                      >
                        {group.name}
                      </button>
                      {(group.children ?? []).map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => applyParams({ category: child.slug, page: '1' })}
                          className={cn(
                            'ms-2 w-[calc(100%-0.5rem)] rounded-xl px-3 py-1.5 text-start text-xs transition',
                            categorySlug === child.slug
                              ? 'bg-accent/10 font-bold text-accent'
                              : 'text-muted hover:bg-mist hover:text-fg dark:hover:bg-white/5',
                          )}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted">
                  {locale === 'ar' ? 'العلامات' : 'Brands'}
                </p>
                <div className="mt-3 flex max-h-52 flex-col gap-1 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => applyParams({ brand: null, page: '1' })}
                    className={cn(
                      'rounded-xl px-3 py-2 text-start text-sm transition',
                      !brandSlug
                        ? 'bg-accent/10 font-bold text-accent'
                        : 'text-muted hover:bg-mist hover:text-fg dark:hover:bg-white/5',
                    )}
                  >
                    {locale === 'ar' ? 'كل العلامات' : 'All brands'}
                  </button>
                  {brandList.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => applyParams({ brand: b.slug, page: '1' })}
                      className={cn(
                        'rounded-xl px-3 py-2 text-start text-sm transition',
                        brandSlug === b.slug
                          ? 'bg-accent/10 font-bold text-accent'
                          : 'text-muted hover:bg-mist hover:text-fg dark:hover:bg-white/5',
                      )}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile filters drawer */}
        {mobileFilters ? (
          <div className="store-surface space-y-4 p-4 lg:hidden">
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold">
                {locale === 'ar' ? 'الفلاتر' : 'Filters'}
              </p>
              <button
                type="button"
                className="text-xs font-bold text-accent"
                onClick={() => setMobileFilters(false)}
              >
                {locale === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    applyParams({ category: c.slug, page: '1' });
                    setMobileFilters(false);
                  }}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-bold',
                    categorySlug === c.slug
                      ? 'bg-accent text-white'
                      : 'border border-border text-muted',
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {brandList.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    applyParams({ brand: b.slug, page: '1' });
                    setMobileFilters(false);
                  }}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-bold',
                    brandSlug === b.slug
                      ? 'bg-navy text-white'
                      : 'border border-border text-muted',
                  )}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-fg sm:text-2xl">
                {title}
              </h1>
              <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-bold text-muted dark:bg-white/10">
                {total} {locale === 'ar' ? 'منتج' : 'products'}
              </span>
              {search ? <span className="text-sm text-muted">«{search}»</span> : null}
              {hasFilters ? (
                <button
                  type="button"
                  className="text-xs font-bold text-accent hover:underline"
                  onClick={() => setParams({})}
                >
                  {locale === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
                </button>
              ) : null}
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-xl border border-border px-3 text-xs font-bold text-muted lg:hidden"
                onClick={() => setMobileFilters((v) => !v)}
              >
                <SlidersHorizontal className="me-1.5 h-3.5 w-3.5" />
                {locale === 'ar' ? 'فلاتر' : 'Filters'}
              </button>
            </div>
            <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
              {sortOptions.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => applyParams({ sort: f.id, page: '1' })}
                  className={cn(
                    'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition',
                    sort === f.id
                      ? 'bg-accent text-white'
                      : 'border border-border bg-card text-muted hover:border-accent/40 hover:text-fg',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {query.isLoading ? <LoadingState variant="products" /> : null}
          {query.isError ? (
            <ErrorState
              title={locale === 'ar' ? 'تعذر تحميل المنتجات' : 'Could not load products'}
              description={
                locale === 'ar'
                  ? 'تأكد أن الـ API شغّال ثم أعد المحاولة'
                  : 'Make sure the API is running, then try again'
              }
              retryLabel={locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
              onRetry={() => void query.refetch()}
            />
          ) : null}

          {!query.isLoading && !query.isError ? (
            products.length ? (
              <div
                key={`${search}-${sort}-${categorySlug}-${brandSlug}-${page}`}
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              >
                {products.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    index={i}
                    badge={
                      sort === 'bestsellers'
                        ? locale === 'ar'
                          ? 'مبيعات'
                          : 'Top'
                        : sort === 'newest' || !sortParam
                          ? p.featured
                            ? locale === 'ar'
                              ? 'مميز'
                              : 'Featured'
                            : undefined
                          : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  search
                    ? locale === 'ar'
                      ? `لا نتائج لـ «${search}»`
                      : `No results for «${search}»`
                    : locale === 'ar'
                      ? 'لا توجد منتجات'
                      : 'No products found'
                }
                description={
                  locale === 'ar'
                    ? 'جرّب كلمة أخرى أو أزل الفلاتر'
                    : 'Try another keyword or clear filters'
                }
                action={{
                  label: locale === 'ar' ? 'إعادة ضبط' : 'Reset',
                  onClick: () => setParams({}),
                }}
              />
            )
          ) : null}

          <div className="mt-8">
            <Pagination
              locale={locale}
              page={query.data?.meta.page ?? page}
              totalPages={query.data?.meta.totalPages ?? 1}
              onChange={(p) => applyParams({ page: String(p) })}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export function StoreCategoriesPage() {
  const { locale } = useI18n();
  const categories = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => (await catalogApi.categories()).data,
  });

  return (
    <>
      <Seo title={locale === 'ar' ? 'الأقسام' : 'Categories'} path={storePath('categories')} />
      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            {locale === 'ar' ? 'مجموعات الأقسام' : 'Category groups'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {locale === 'ar'
              ? 'كروبات رئيسية وتحتها أقسام المنتجات'
              : 'Main groups with product sections inside'}
          </p>
        </div>

        {categories.isLoading ? <LoadingState variant="cards" /> : null}
        {categories.isError ? <ErrorState onRetry={() => void categories.refetch()} /> : null}

        <div className="space-y-8">
          {(categories.data ?? []).map((group, i) => (
            <section key={group.id} className="store-surface overflow-hidden">
              <Link
                to={storePath(`categories/${group.slug}`)}
                className="group relative block overflow-hidden"
              >
                <div className="relative aspect-[21/9] max-h-48 w-full bg-mist sm:max-h-56">
                  {group.imageUrl ? (
                    <img
                      src={group.imageUrl}
                      alt={group.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-navy/10 text-navy">
                      <span className="text-sm font-bold">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-navy/85 via-navy/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-accent-soft">
                      {locale === 'ar' ? 'مجموعة' : 'Group'}
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                      {group.name}
                    </h2>
                    {group.description ? (
                      <p className="mt-1 max-w-2xl text-sm text-white/75">{group.description}</p>
                    ) : null}
                  </div>
                </div>
              </Link>

              {(group.children?.length ?? 0) > 0 ? (
                <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(group.children ?? []).map((child) => (
                    <Link
                      key={child.id}
                      to={storePath(`categories/${child.slug}`)}
                      className="flex items-center gap-3 rounded-xl border border-border bg-page p-3 transition hover:border-accent/40 hover:shadow-sm"
                    >
                      {child.imageUrl ? (
                        <img
                          src={child.imageUrl}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent text-xs font-bold">
                          EH
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-fg">{child.name}</p>
                        {child.description ? (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                            {child.description}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>

        {!categories.isLoading && !(categories.data ?? []).length ? (
          <EmptyState title={locale === 'ar' ? 'لا توجد أقسام' : 'No categories yet'} />
        ) : null}
      </div>
    </>
  );
}

export function StoreCategoryPage() {
  const { locale } = useI18n();
  const { slug = '' } = useParams();
  const category = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => (await catalogApi.categoryBySlug(slug)).data,
  });
  const products = useQuery({
    queryKey: ['category-products', category.data?.slug],
    enabled: Boolean(category.data?.slug),
    queryFn: async () =>
      (await catalogApi.products({ categorySlug: category.data!.slug, limit: 24 })).data,
  });

  if (category.isLoading) return <LoadingState variant="page" />;
  if (category.isError || !category.data) {
    return (
      <ErrorState
        title={locale === 'ar' ? 'القسم غير موجود' : 'Category not found'}
      />
    );
  }

  return (
    <>
      <Seo title={category.data.name} path={storePath(`categories/${slug}`)} />
      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10">
        <Link
          to={storePath('categories')}
          className="text-sm font-semibold text-accent"
        >
          {locale === 'ar' ? '← كل الأقسام' : '← All categories'}
        </Link>

        {category.data.imageUrl ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            <div className="relative aspect-[21/9] max-h-64 w-full sm:max-h-72">
              <img
                src={category.data.imageUrl}
                alt={category.data.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-navy/75 via-navy/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                {(category.data.children?.length ?? 0) > 0 ? (
                  <p className="text-[11px] font-bold uppercase tracking-wide text-accent-soft">
                    {locale === 'ar' ? 'مجموعة أقسام' : 'Category group'}
                  </p>
                ) : null}
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {category.data.name}
                </h1>
                {category.data.description ? (
                  <p className="mt-1 max-w-2xl text-sm text-white/75">
                    {category.data.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-fg">
              {category.data.name}
            </h1>
            {category.data.description ? (
              <p className="mt-1 max-w-2xl text-sm text-muted">{category.data.description}</p>
            ) : null}
          </>
        )}

        {(category.data.children?.length ?? 0) > 0 ? (
          <div className="mt-8">
            <h2 className="text-lg font-extrabold text-fg">
              {locale === 'ar' ? 'الأقسام داخل المجموعة' : 'Sections in this group'}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(category.data.children ?? []).map((child) => (
                <Link
                  key={child.id}
                  to={storePath(`categories/${child.slug}`)}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-accent/40 hover:shadow-sm"
                >
                  {child.imageUrl ? (
                    <img
                      src={child.imageUrl}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="truncate font-bold text-fg">{child.name}</p>
                    {child.description ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                        {child.description}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-8 text-sm font-semibold text-muted">
          {products.data?.meta.total ?? products.data?.data?.length ?? 0}{' '}
          {locale === 'ar' ? 'منتج في هذه المجموعة / القسم' : 'products in this group / category'}
        </p>
        {products.isLoading ? <LoadingState variant="products" /> : null}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {(products.data?.data ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {!products.isLoading && !(products.data?.data ?? []).length ? (
          <EmptyState
            title={locale === 'ar' ? 'لا توجد منتجات في هذا القسم' : 'No products in this category'}
          />
        ) : null}
      </div>
    </>
  );
}

export function StoreBrandPage() {
  const { slug = '' } = useParams();
  const brand = useQuery({
    queryKey: ['brand', slug],
    queryFn: async () => (await catalogApi.brandBySlug(slug)).data,
  });
  const products = useQuery({
    queryKey: ['brand-products', brand.data?.id],
    enabled: Boolean(brand.data?.id),
    queryFn: async () =>
      (await catalogApi.products({ brandId: brand.data!.id, limit: 24 })).data,
  });

  if (brand.isLoading) return <LoadingState variant="page" />;
  if (brand.isError || !brand.data) return <ErrorState title="Brand not found" />;

  return (
    <>
      <Seo title={brand.data.name} path={storePath(`brands/${slug}`)} />
      <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 lg:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-fg">{brand.data.name}</h1>
        <p className="mt-2 text-muted">{brand.data.description}</p>
        {products.isLoading ? <LoadingState variant="products" /> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(products.data?.data ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {!products.isLoading && !(products.data?.data ?? []).length ? (
          <EmptyState title="No products for this brand" />
        ) : null}
      </div>
    </>
  );
}

export function ProductDetailPage() {
  const { locale } = useI18n();
  const { slug = '' } = useParams();
  const { cart, addItem, updateItem, removeItem } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const { isCompared, toggle: toggleCompare } = useCompare();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const query = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await catalogApi.productBySlug(slug)).data,
  });

  const similarFallback = useQuery({
    queryKey: ['product-similar', query.data?.id, query.data?.category?.id],
    enabled: Boolean(query.data?.id && query.data?.category?.id && !(query.data.similar?.length)),
    queryFn: async () =>
      (
        await catalogApi.products({
          categoryId: query.data!.category!.id,
          excludeId: query.data!.id,
          limit: 8,
        })
      ).data.data,
  });

  useEffect(() => {
    setActiveImage(0);
    setQty(1);
  }, [slug]);

  if (query.isLoading) return <LoadingState variant="page" />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        title={locale === 'ar' ? 'المنتج غير موجود' : 'Product not found'}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const p = query.data;
  const similar = (p.similar?.length ? p.similar : similarFallback.data) ?? [];
  const variants = p.variants ?? [];
  const line = cart?.items?.find((i) => i.productId === p.id || i.product?.id === p.id);
  const inCartQty = line?.quantity ?? 0;
  const maxStock = Math.max(1, Number(p.stock ?? 99));
  const outOfStock = p.availability === 'OUT_OF_STOCK' || Number(p.stock ?? 0) <= 0;
  const images =
    p.images?.length ? p.images.map((i) => i.url) : p.imageUrl ? [p.imageUrl] : [];
  const specs =
    p.specifications && typeof p.specifications === 'object'
      ? Object.entries(p.specifications).filter(([key]) => key !== 'Variant')
      : [];
  const docs = p.documents ?? [];
  const datasheet = docs[0];
  const variantLabel =
    p.specifications && typeof p.specifications === 'object'
      ? String((p.specifications as Record<string, unknown>).Variant ?? '')
      : '';
  const fav = isFavorite(p.id);
  const compared = isCompared(p.id);

  function variantName(item: typeof p) {
    const label =
      item.specifications && typeof item.specifications === 'object'
        ? String((item.specifications as Record<string, unknown>).Variant ?? '')
        : '';
    return label || item.name;
  }

  return (
    <>
      <Seo
        title={p.name}
        path={storePath(`products/${slug}`)}
        description={p.shortDescription || undefined}
      />
      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="store-surface flex aspect-4/3 items-center justify-center overflow-hidden bg-mist/60 p-4 sm:aspect-square dark:bg-muted/30">
              {images[activeImage] ? (
                <img
                  src={images[activeImage]}
                  alt={p.name}
                  className="max-h-full w-full object-contain"
                />
              ) : (
                <span className="text-muted">
                  {locale === 'ar' ? 'بدون صورة' : 'No product image'}
                </span>
              )}
            </div>
            {images.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      'h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-card',
                      activeImage === i ? 'border-accent' : 'border-transparent',
                    )}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              {p.category ? (
                <Link
                  to={storePath(`categories/${p.category.slug}`)}
                  className="font-semibold text-accent hover:text-accent-soft"
                >
                  {p.category.name}
                </Link>
              ) : null}
              {p.brand ? (
                <>
                  <span>·</span>
                  <Link
                    to={storePath(`brands/${p.brand.slug}`)}
                    className="hover:text-accent"
                  >
                    {p.brand.name}
                  </Link>
                </>
              ) : null}
              <span>·</span>
              <span className="font-mono text-xs">SKU {p.sku}</span>
            </div>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
              {p.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-2xl font-extrabold tabular-nums text-navy dark:text-accent">
                {formatMoney(p.price, p.currency)}
              </p>
              <AvailabilityBadge
                availability={p.availability}
                stock={p.stock}
                locale={locale}
              />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted">
              {p.shortDescription || p.description}
            </p>

            {variants.length > 1 ? (
              <div className="mt-6">
                <p className="text-sm font-bold text-fg">
                  {locale === 'ar' ? 'الخيار / القسم' : 'Variant / Category option'}
                  {p.category ? (
                    <span className="ms-2 font-medium text-muted">
                      · {p.category.name}
                    </span>
                  ) : null}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const active = v.id === p.id;
                    return (
                      <Link
                        key={v.id}
                        to={storePath(`products/${v.slug}`)}
                        className={cn(
                          'inline-flex min-h-10 items-center rounded-xl border px-3 py-2 text-sm font-semibold transition',
                          active
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-card text-fg hover:border-accent hover:text-accent',
                        )}
                      >
                        {variantName(v)}
                      </Link>
                    );
                  })}
                </div>
                {variantLabel ? (
                  <p className="mt-2 text-xs text-muted">
                    {locale === 'ar' ? 'الخيار الحالي:' : 'Selected:'}{' '}
                    <span className="font-semibold text-fg">{variantLabel}</span>
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {inCartQty > 0 && line ? (
                <div className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-page px-1 sm:w-auto">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30"
                    disabled={inCartQty <= 1}
                    onClick={() => void updateItem(line.id, inCartQty - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-bold tabular-nums">
                    {inCartQty}
                  </span>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30"
                    disabled={inCartQty >= maxStock}
                    onClick={() => void updateItem(line.id, inCartQty + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="ms-1 px-2 text-xs font-semibold text-red-600 hover:underline"
                    onClick={() => void removeItem(line.id)}
                  >
                    {locale === 'ar' ? 'حذف' : 'Remove'}
                  </button>
                </div>
              ) : (
                <>
                  <Input
                    type="number"
                    min={1}
                    max={maxStock}
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.min(maxStock, Math.max(1, Number(e.target.value) || 1)))
                    }
                    className="h-11 w-full rounded-xl sm:w-20"
                  />
                  <Button
                    className="h-11 w-full rounded-xl sm:w-auto"
                    disabled={outOfStock}
                    onClick={() => void addItem(p.id, qty, p)}
                  >
                    {outOfStock
                      ? locale === 'ar'
                        ? 'غير متوفر'
                        : 'Unavailable'
                      : locale === 'ar'
                        ? 'أضف للسلة'
                        : 'Add to cart'}
                  </Button>
                </>
              )}
              <Link to={`${storePath('quote')}?product=${p.id}`} className="w-full sm:w-auto">
                <Button variant="outline" className="h-11 w-full rounded-xl sm:w-auto">
                  <FileText className="h-4 w-4" />
                  {locale === 'ar' ? 'طلب عرض سعر' : 'Request quote'}
                </Button>
              </Link>
              {datasheet ? (
                <a
                  href={datasheet.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" className="h-11 w-full rounded-xl sm:w-auto">
                    <FileText className="h-4 w-4" />
                    {locale === 'ar' ? 'تحميل شيت المنتج' : 'Download datasheet'}
                  </Button>
                </a>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    const ok = toggle(p.id);
                    if (!ok) {
                      navigate(
                        `${storePath('account/login')}?next=${encodeURIComponent(
                          storePath(`products/${p.slug}`),
                        )}`,
                      );
                    }
                    return;
                  }
                  toggle(p.id);
                }}
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold transition hover:border-accent',
                  fav && 'border-accent bg-accent/5 text-accent',
                )}
              >
                <Heart className={cn('h-4 w-4', fav && 'fill-current')} />
                {locale === 'ar' ? 'المفضلة' : 'Wishlist'}
              </button>
              <button
                type="button"
                onClick={() => toggleCompare(p.id, p.category?.id || p.categoryId)}
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold transition hover:border-accent',
                  compared && 'border-navy bg-navy/5 text-navy dark:text-accent',
                )}
              >
                <GitCompareArrows className="h-4 w-4" />
                {locale === 'ar' ? 'مقارنة' : 'Compare'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="store-surface p-5 lg:col-span-2">
            <h2 className="text-lg font-bold text-fg">
              {locale === 'ar' ? 'الوصف' : 'Description'}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {p.description || p.shortDescription || (locale === 'ar' ? 'لا يوجد وصف' : 'No description')}
            </p>
          </div>

          <div className="space-y-6">
            <div className="store-surface p-5">
              <h2 className="text-lg font-bold text-fg">
                {locale === 'ar' ? 'المواصفات' : 'Specifications'}
              </h2>
              {specs.length ? (
                <dl className="mt-3 divide-y divide-border">
                  {specs.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col gap-1 py-2.5 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                    >
                      <dt className="shrink-0 font-semibold text-muted">{key}</dt>
                      <dd className="min-w-0 break-words font-medium text-fg sm:text-end">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-muted">
                  {locale === 'ar' ? 'لا توجد مواصفات' : 'No specifications listed'}
                </p>
              )}
            </div>

            <div className="store-surface p-5">
              <h2 className="text-lg font-bold text-fg">
                {locale === 'ar' ? 'شيت المنتج / المستندات' : 'Product sheet / Documents'}
              </h2>
              {docs.length ? (
                <ul className="mt-3 space-y-2">
                  {docs.map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-soft"
                      >
                        <FileText className="h-4 w-4" />
                        {doc.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted">
                  {locale === 'ar' ? 'لا توجد مستندات' : 'No documents available'}
                </p>
              )}
            </div>
          </div>
        </div>

        {similar.length > 0 ? (
          <div className="mt-14 border-t border-border pt-10">
            <div className="mb-5 flex items-end justify-between gap-3">
              <h2 className="text-xl font-extrabold tracking-tight">
                {locale === 'ar' ? 'منتجات ذات صلة' : 'Related products'}
              </h2>
              {p.category ? (
                <Link
                  to={storePath(`categories/${p.category.slug}`)}
                  className="text-sm font-semibold text-accent"
                >
                  {locale === 'ar' ? 'عرض القسم' : 'View category'}
                </Link>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}


const checkoutSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(8),
  company: z.string().optional(),
  shippingAddress: z.string().min(5),
  billingAddress: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export function CartPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { cart, loading, updateItem, removeItem, clear } = useCart();
  const items = cart?.items ?? [];
  const subtotal = useMemo(() => {
    if (cart?.subtotal != null) return Number(cart.subtotal);
    return items.reduce((sum, i) => {
      const price = Number(i.unitPrice ?? i.product?.price ?? 0);
      return sum + price * i.quantity;
    }, 0);
  }, [cart, items]);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      shippingAddress: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      firstName: user.firstName && user.firstName !== 'Customer' ? user.firstName : '',
      lastName: user.lastName || '',
      email: user.email?.endsWith('@customers.local') ? '' : user.email || '',
      phone: user.phone || '',
      company: form.getValues('company') || '',
      shippingAddress: form.getValues('shippingAddress') || '',
      billingAddress: form.getValues('billingAddress') || '',
      notes: form.getValues('notes') || '',
    });
  }, [user, form]);

  async function onSubmit(values: CheckoutForm) {
    try {
      const { data } = await ordersApi.checkout({
        ...values,
        email:
          values.email ||
          (user?.email?.endsWith('@customers.local') ? undefined : user?.email) ||
          `${(user?.phone || values.phone).replace(/\D/g, '')}@customers.local`,
        firstName: values.firstName || user?.firstName,
        lastName: values.lastName || user?.lastName,
        phone: values.phone || user?.phone,
        billingAddress: values.billingAddress || values.shippingAddress,
      });
      await clear({ silent: true });
      saveStoreOrder(data);
      appToast.success('orderPlaced', { orderNumber: data.orderNumber });
      navigate(storePath(`account/orders/${data.id}`));
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
          ? String((err.response.data as { message: unknown }).message)
          : null;
      appToast.error('orderFailed');
      if (message) {
        // surface API reason in console for debugging; toast stays user-friendly
        console.warn('Checkout failed:', message);
      }
    }
  }

  function onInvalid() {
    appToast.error('orderValidationFailed');
  }

  return (
    <>
      <Seo title={locale === 'ar' ? 'السلة' : 'Cart'} path={storePath('cart')} />
      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-fg">
            {locale === 'ar' ? 'السلة' : 'Cart'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {locale === 'ar'
              ? 'راجع المنتجات وأكمل الطلب من هنا.'
              : 'Review products and place your order here.'}
          </p>
        </div>

        {loading || authLoading ? <LoadingState /> : null}

        {!loading && !items.length ? (
          <EmptyState
            title={locale === 'ar' ? 'السلة فارغة' : 'Cart is empty'}
            description={
              locale === 'ar'
                ? 'تصفّح المنتجات وأضف ما تحتاجه.'
                : 'Browse products and add what you need.'
            }
            action={{
              label: locale === 'ar' ? 'تصفح المنتجات' : 'Browse products',
              onClick: () => navigate(storePath('products')),
            }}
          />
        ) : null}

        {items.length ? (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-7">
              {items.map((item) => {
                const unit = Number(item.unitPrice ?? item.product?.price ?? 0);
                const lineTotal = unit * item.quantity;
                const img =
                  item.product?.images?.[0]?.url || item.product?.imageUrl || null;
                return (
                  <div
                    key={item.id}
                    className="store-surface flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4"
                  >
                    <div className="flex min-w-0 flex-1 gap-3">
                      <Link
                        to={storePath(`products/${item.product?.slug || ''}`)}
                        className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted/40"
                      >
                        {img ? (
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-muted">
                            SKU
                          </div>
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={storePath(`products/${item.product?.slug || ''}`)}
                          className="line-clamp-2 text-sm font-semibold text-fg hover:text-accent"
                        >
                          {item.product?.name || 'Product'}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted">{item.product?.sku}</p>
                        <p className="mt-1 text-sm font-bold text-accent">
                          {formatMoney(unit, item.product?.currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2">
                      <div className="flex h-10 items-center rounded-md border border-border bg-page px-1">
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-muted disabled:opacity-30"
                          onClick={() => void updateItem(item.id, item.quantity - 1)}
                          aria-label={locale === 'ar' ? 'تقليل' : 'Decrease'}
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-muted"
                          onClick={() => void updateItem(item.id, item.quantity + 1)}
                          aria-label={locale === 'ar' ? 'زيادة' : 'Increase'}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                        <p className="text-sm font-semibold text-fg">
                          {formatMoney(lineTotal, item.product?.currency)}
                        </p>
                        <button
                          type="button"
                          className="text-xs font-semibold text-red-600 hover:underline"
                          onClick={() => void removeItem(item.id)}
                        >
                          {locale === 'ar' ? 'حذف' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Link
                to={storePath('products')}
                className="inline-flex text-sm font-semibold text-accent hover:text-accent-soft"
              >
                {locale === 'ar' ? '← متابعة التسوق' : '← Continue shopping'}
              </Link>
            </div>

            <aside className="lg:col-span-5">
              <div className="store-surface sticky top-20 space-y-4 p-4 sm:p-5 lg:top-28">
                <div>
                  <h2 className="text-base font-bold">
                    {locale === 'ar' ? 'ملخص الطلب' : 'Order summary'}
                  </h2>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted">
                      {locale === 'ar' ? 'المنتجات' : 'Items'} ({items.length})
                    </span>
                    <span className="font-semibold">{formatMoney(subtotal)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                    <span className="font-bold">
                      {locale === 'ar' ? 'الإجمالي' : 'Total'}
                    </span>
                    <span className="text-xl font-bold text-accent">
                      {formatMoney(subtotal)}
                    </span>
                  </div>
                </div>

                {!isAuthenticated ? (
                  <div className="space-y-3 rounded-xl border border-accent/25 bg-accent/5 p-4">
                    <p className="text-sm leading-relaxed text-fg">
                      {locale === 'ar'
                        ? 'لإتمام الطلب: سجّل حسابي بالاسم ورقم الهاتف وأكد OTP.'
                        : 'To place the order: register My account with name + phone and confirm OTP.'}
                    </p>
                    <Button
                      className="w-full rounded-xl"
                      size="lg"
                      onClick={() =>
                        navigate(
                          `${storePath('account/login')}?next=${encodeURIComponent(storePath('cart'))}`,
                        )
                      }
                    >
                      {locale === 'ar' ? 'تسجيل حسابي ثم الطلب' : 'Register My account then order'}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-3">
                    <div className="rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-sm">
                      {locale === 'ar' ? 'حساب موثّق:' : 'Verified:'}{' '}
                      <strong>
                        {user?.firstName} {user?.lastName}
                      </strong>{' '}
                      · {user?.phone}
                    </div>
                    <p className="text-xs text-muted">
                      {locale === 'ar'
                        ? 'أكمل عنوان الشحن ثم اضغط تأكيد الطلب'
                        : 'Enter a shipping address, then place the order'}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Input
                          placeholder={locale === 'ar' ? 'الاسم الأول *' : 'First name *'}
                          {...form.register('firstName')}
                          className={form.formState.errors.firstName ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.firstName ? (
                          <p className="mt-1 text-[11px] font-semibold text-red-600">
                            {locale === 'ar' ? 'مطلوب' : 'Required'}
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <Input
                          placeholder={locale === 'ar' ? 'اسم العائلة *' : 'Last name *'}
                          {...form.register('lastName')}
                          className={form.formState.errors.lastName ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.lastName ? (
                          <p className="mt-1 text-[11px] font-semibold text-red-600">
                            {locale === 'ar' ? 'مطلوب' : 'Required'}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <Input
                      placeholder={locale === 'ar' ? 'الهاتف' : 'Phone'}
                      {...form.register('phone')}
                      readOnly
                      className="opacity-80"
                    />
                    <Input
                      placeholder={locale === 'ar' ? 'الشركة (اختياري)' : 'Company (optional)'}
                      {...form.register('company')}
                    />
                    <div>
                      <Textarea
                        placeholder={
                          locale === 'ar'
                            ? 'عنوان الشحن * (مثال: بغداد، الكرادة...)'
                            : 'Shipping address * (e.g. Baghdad, Karrada...)'
                        }
                        {...form.register('shippingAddress')}
                        className={form.formState.errors.shippingAddress ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.shippingAddress ? (
                        <p className="mt-1 text-[11px] font-semibold text-red-600">
                          {locale === 'ar'
                            ? 'عنوان الشحن مطلوب (5 أحرف على الأقل)'
                            : 'Shipping address required (min 5 characters)'}
                        </p>
                      ) : null}
                    </div>
                    <Textarea
                      placeholder={locale === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                      {...form.register('notes')}
                    />
                    <Button
                      type="submit"
                      className="w-full rounded-xl"
                      size="lg"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting
                        ? locale === 'ar'
                          ? 'جارٍ إرسال الطلب…'
                          : 'Placing order…'
                        : locale === 'ar'
                          ? 'تأكيد الطلب'
                          : 'Place order'}
                    </Button>
                  </form>
                )}
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </>
  );
}


export function CheckoutPage() {
  return <Navigate to={storePath('cart')} replace />;
}

export function StoreLoginPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || storePath('account/orders');
  const { requestOtp, loginWithOtp, isAuthenticated } = useAuth();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [devCode, setDevCode] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate(next, { replace: true });
  }, [isAuthenticated, navigate, next]);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setError(
        locale === 'ar'
          ? 'الاسم الكامل ورقم الهاتف مطلوبان'
          : 'Full name and phone are required',
      );
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await requestOtp(phone);
      setPhone(res.phone);
      setDevCode(res.devCode);
      setStep('otp');
      appToast.success('otpSent');
    } catch {
      setError(locale === 'ar' ? 'تعذّر إرسال الرمز. تحقق من الرقم.' : 'Could not send OTP.');
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await loginWithOtp({
        phone,
        code,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      appToast.success('otpVerified');
      navigate(next);
    } catch {
      setError(locale === 'ar' ? 'رمز غير صحيح أو منتهي.' : 'Invalid or expired OTP.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Seo title={locale === 'ar' ? 'حسابي' : 'My account'} path={storePath('account/login')} />
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <Badge className="w-fit rounded-md border-0 bg-accent/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent hover:bg-accent/15">
            {locale === 'ar' ? 'حسابي' : 'My account'}
          </Badge>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {locale === 'ar' ? 'تسجيل موثّق برقم الهاتف' : 'Verified phone registration'}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            {locale === 'ar'
              ? 'نطلب اسمك ورقمك ثم نرسل OTP للتأكد أنك شخص حقيقي. بعدها تقدر تطلب وتحفظ طلباتك في حسابي.'
              : 'We ask for your name and phone, then send an OTP to confirm you are a real person. Then you can order and keep history in My account.'}
          </p>
          <Separator className="my-8 max-w-sm" />
          <ul className="space-y-3 text-sm text-fg/80">
            <li className="flex gap-2">
              <span className="font-bold text-accent">01</span>
              {locale === 'ar' ? 'أدخل الاسم والرقم' : 'Enter name and phone'}
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-accent">02</span>
              {locale === 'ar' ? 'أكد رمز OTP' : 'Confirm OTP code'}
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-accent">03</span>
              {locale === 'ar' ? 'اطلب واحفظ في حسابي' : 'Order and save under My account'}
            </li>
          </ul>
        </div>

        <Card className="shadow-[0_30px_80px_-48px_rgb(0_112_192/0.45)]">
          <CardHeader>
            <CardTitle className="text-lg">
              {step === 'details'
                ? locale === 'ar'
                  ? 'بيانات الحساب'
                  : 'Account details'
                : locale === 'ar'
                  ? 'تأكيد OTP'
                  : 'Confirm OTP'}
            </CardTitle>
            <CardDescription>
              {step === 'details'
                ? locale === 'ar'
                  ? 'الاسم ورقم الهاتف مطلوبان'
                  : 'Name and phone are required'
                : locale === 'ar'
                  ? `رمز أُرسل إلى ${phone}`
                  : `Code sent to ${phone}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'details' ? (
              <form id="store-otp-details" onSubmit={sendCode} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      {locale === 'ar' ? 'الاسم الأول' : 'First name'}
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={locale === 'ar' ? 'مثال: أحمد' : 'e.g. Ahmed'}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      {locale === 'ar' ? 'اسم العائلة' : 'Last name'}
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={locale === 'ar' ? 'مثال: علي' : 'e.g. Ali'}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{locale === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XXXXXXXXX"
                    required
                  />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </form>
            ) : (
              <form id="store-otp-verify" onSubmit={verify} className="space-y-4">
                <p className="text-sm text-fg">
                  {firstName} {lastName}
                </p>
                {devCode ? (
                  <div className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
                    Dev OTP: <strong>{devCode}</strong>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="otp">{locale === 'ar' ? 'رمز OTP' : 'OTP code'}</Label>
                  <Input
                    id="otp"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="••••"
                    inputMode="numeric"
                    required
                  />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {step === 'details' ? (
              <Button
                type="submit"
                form="store-otp-details"
                className="w-full"
                size="lg"
                disabled={busy}
              >
                {busy
                  ? locale === 'ar'
                    ? 'جارٍ الإرسال…'
                    : 'Sending…'
                  : locale === 'ar'
                    ? 'إرسال رمز OTP'
                    : 'Send OTP'}
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  form="store-otp-verify"
                  className="w-full"
                  size="lg"
                  disabled={busy}
                >
                  {busy
                    ? locale === 'ar'
                      ? 'جارٍ التحقق…'
                      : 'Verifying…'
                    : locale === 'ar'
                      ? 'تأكيد وإنشاء حسابي'
                      : 'Verify & create My account'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('details');
                    setCode('');
                    setDevCode(undefined);
                  }}
                >
                  {locale === 'ar' ? 'تعديل البيانات' : 'Edit details'}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export function MyOrdersPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();

  const mine = useQuery({
    queryKey: ['store-my-orders', user?.id],
    enabled: isAuthenticated,
    queryFn: async () => (await ordersApi.mine()).data.data,
  });

  if (authLoading) return <LoadingState variant="page" />;

  if (!isAuthenticated) {
    return (
      <EmptyState
        title={locale === 'ar' ? 'ادخل حسابي لعرض طلباتك' : 'Open My account to view orders'}
        description={
          locale === 'ar'
            ? 'سجّل اسمك ورقمك ثم أكّد OTP — حساب شخص حقيقي'
            : 'Register with name + phone, confirm OTP — real-person account'
        }
        action={{
          label: locale === 'ar' ? 'حسابي' : 'My account',
          onClick: () => navigate(storePath('account/login')),
        }}
      />
    );
  }

  return (
    <>
      <Seo title={locale === 'ar' ? 'حسابي · طلباتي' : 'My account · Orders'} path={storePath('account/orders')} />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {locale === 'ar' ? 'حسابي' : 'My account'}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fg">
              {locale === 'ar' ? 'طلباتي' : 'My orders'}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {user?.firstName} {user?.lastName} · {user?.phone || user?.email}
            </p>
          </div>
          <Button variant="outline" className="rounded-xl" onClick={() => void logout()}>
            {locale === 'ar' ? 'خروج' : 'Sign out'}
          </Button>
        </div>

        <div className="mt-10">
          {mine.isLoading ? <LoadingState /> : null}
          {mine.isError ? <ErrorState onRetry={() => void mine.refetch()} /> : null}
          {!mine.isLoading && !(mine.data?.length) ? (
            <EmptyState
              title={locale === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}
              action={{
                label: locale === 'ar' ? 'تصفح المنتجات' : 'Browse products',
                onClick: () => navigate(storePath('products')),
              }}
            />
          ) : null}

          <div className="space-y-3">
            {(mine.data ?? []).map((o) => (
              <Link
                key={o.id}
                to={storePath(`account/orders/${o.id}`)}
                className="flex flex-wrap items-center justify-between gap-3 border border-line bg-[var(--card)] px-4 py-4 transition hover:border-accent/40"
              >
                <div>
                  <p className="font-semibold text-fg">{o.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted">{formatOrderDate(locale, o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="font-kpi text-sm font-bold text-fg">
                    {formatMoney(o.total, o.currency)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function MyOrderDetailPage() {
  const { locale } = useI18n();
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const order = useQuery({
    queryKey: ['store-order', id],
    enabled: isAuthenticated && Boolean(id),
    queryFn: async () => (await ordersApi.myOrder(id)).data as Order,
    refetchInterval: 12_000,
    refetchOnWindowFocus: true,
  });

  if (authLoading) return <LoadingState variant="page" />;

  if (!isAuthenticated) {
    return (
      <EmptyState
        title={locale === 'ar' ? 'سجّل دخولك' : 'Sign in required'}
        action={{
          label: locale === 'ar' ? 'دخول' : 'Sign in',
          onClick: () => navigate(storePath('account/login')),
        }}
      />
    );
  }

  if (order.isLoading) return <LoadingState variant="page" />;
  if (order.isError || !order.data) {
    return (
      <ErrorState
        onRetry={() => void order.refetch()}
        title={locale === 'ar' ? 'الطلب غير موجود' : 'Order not found'}
      />
    );
  }

  const o = order.data;
  const subtotal = Number(o.subtotal ?? 0);
  const discount = Number(o.discount ?? 0);
  const shipping = Number(o.shipping ?? 0);

  return (
    <>
      <Seo
        title={`${locale === 'ar' ? 'طلب' : 'Order'} ${o.orderNumber}`}
        path={storePath(`account/orders/${o.id}`)}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to={storePath('account/orders')}
          className="text-sm font-semibold text-accent hover:text-accent-soft"
        >
          ← {locale === 'ar' ? 'كل الطلبات' : 'All orders'}
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-fg">{o.orderNumber}</h1>
            <p className="mt-2 text-sm text-muted">{formatOrderDate(locale, o.createdAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={o.status} />
            {o.paymentStatus ? <StatusBadge status={o.paymentStatus} /> : null}
          </div>
        </div>

        <div className="mt-8 border border-line bg-[var(--card)] p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            {locale === 'ar' ? 'العميل' : 'Customer'}
          </p>
          <p className="mt-2 font-semibold text-fg">
            {o.customer?.firstName} {o.customer?.lastName}
          </p>
          {o.customer?.company ? (
            <p className="text-sm text-muted">{o.customer.company}</p>
          ) : null}
          {o.customer?.phone ? <p className="text-sm text-muted">{o.customer.phone}</p> : null}
          {o.customer?.email && !o.customer.email.endsWith('@customers.local') ? (
            <p className="text-sm text-muted">{o.customer.email}</p>
          ) : null}
          {o.shippingAddress ? (
            <p className="mt-3 text-sm text-muted whitespace-pre-wrap">{o.shippingAddress}</p>
          ) : null}
          {o.notes ? (
            <p className="mt-3 text-sm text-muted whitespace-pre-wrap">
              {locale === 'ar' ? 'ملاحظات' : 'Notes'}: {o.notes}
            </p>
          ) : null}
        </div>

        <div className="mt-4 border border-line bg-[var(--card)]">
          <div className="border-b border-line px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
            {locale === 'ar' ? 'المنتجات' : 'Items'}
          </div>
          <ul className="divide-y divide-[var(--border)]">
            {(o.items ?? []).map((item) => (
              <li
                key={item.id || `${item.sku}-${item.productName}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-fg">{item.productName}</p>
                  <p className="text-xs text-muted">
                    {item.sku} · ×{item.quantity} ·{' '}
                    {formatMoney(item.unitPrice ?? 0, o.currency, moneyLocale)}
                  </p>
                </div>
                <p className="font-kpi text-sm font-bold">
                  {formatMoney(item.lineTotal ?? 0, o.currency, moneyLocale)}
                </p>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-line px-5 py-4 text-sm">
            <div className="flex justify-between gap-3 text-muted">
              <span>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span className="font-kpi">
                {formatMoney(subtotal || o.total, o.currency, moneyLocale)}
              </span>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between gap-3 text-muted">
                <span>{locale === 'ar' ? 'الخصم' : 'Discount'}</span>
                <span className="font-kpi">
                  −{formatMoney(discount, o.currency, moneyLocale)}
                </span>
              </div>
            ) : null}
            {shipping > 0 ? (
              <div className="flex justify-between gap-3 text-muted">
                <span>{locale === 'ar' ? 'الشحن' : 'Shipping'}</span>
                <span className="font-kpi">
                  {formatMoney(shipping, o.currency, moneyLocale)}
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
              <span className="text-sm font-semibold text-muted">
                {locale === 'ar' ? 'الإجمالي' : 'Total'}
              </span>
              <span className="font-kpi text-lg font-extrabold text-fg">
                {formatMoney(o.total, o.currency, moneyLocale)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 border border-line bg-[var(--card)] p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            {locale === 'ar' ? 'تتبع الحالة' : 'Status timeline'}
          </p>
          {(o.history ?? []).length ? (
            <ol className="mt-4 space-y-3">
              {(o.history ?? []).map((h) => (
                <li
                  key={h.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 text-sm last:border-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={h.toStatus} />
                    <span className="text-muted">
                      {statusLabel(locale, h.toStatus)}
                      {h.note ? ` · ${h.note}` : ''}
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(h.createdAt).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted">
              {statusLabel(locale, o.status)} ·{' '}
              {locale === 'ar' ? 'يتم تحديث الحالة تلقائياً' : 'Status updates automatically'}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

