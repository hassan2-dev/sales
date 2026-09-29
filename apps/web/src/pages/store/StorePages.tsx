import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
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
import { catalogApi, ordersApi } from '@/services/endpoints';
import { useCart } from '@/stores/cart-context';
import { useAuth } from '@/stores/auth-context';
import { formatMoney } from '@/lib/cn';
import { storePath } from '@/lib/urls';
import { useI18n } from '@/i18n/i18n-context';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { saveStoreOrder } from '@/lib/store-orders';

export function StoreProductsPage() {
  const { locale } = useI18n();
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || 1);
  const search = params.get('q') || '';
  const sort = params.get('sort') || 'newest';
  const [q, setQ] = useState(search);

  const sortBy =
    sort === 'bestsellers' ? 'bestsellers' : sort === 'price' ? 'price' : 'createdAt';
  const sortOrder = sort === 'price' ? 'asc' : 'desc';

  const query = useQuery({
    queryKey: ['store-products', page, search, sort],
    queryFn: async () =>
      (
        await catalogApi.products({
          page,
          limit: 12,
          search: search || undefined,
          sortBy,
          sortOrder,
        })
      ).data,
  });

  const filters = [
    { id: 'newest', label: locale === 'ar' ? 'الأحدث' : 'Newest' },
    { id: 'bestsellers', label: locale === 'ar' ? 'الأكثر مبيعاً' : 'Best sellers' },
    { id: 'price', label: locale === 'ar' ? 'السعر' : 'Price' },
  ];

  function applyParams(next: Record<string, string>) {
    const merged: Record<string, string> = {
      ...(search ? { q: search } : {}),
      ...(sort && sort !== 'newest' ? { sort } : {}),
      ...next,
    };
    if (merged.page === '1') delete merged.page;
    if (merged.sort === 'newest') delete merged.sort;
    setParams(merged);
  }

  const title =
    sort === 'bestsellers'
      ? locale === 'ar'
        ? 'الأكثر مبيعاً'
        : 'Best sellers'
      : locale === 'ar'
        ? 'المنتجات'
        : 'Products';

  return (
    <>
      <Seo title={title} path={storePath('products')} />
      <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {locale === 'ar' ? 'الكتالوج' : 'Catalog'}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fg">{title}</h1>
            <p className="mt-1 text-sm text-muted">
              {locale === 'ar'
                ? 'كتالوج حي من مخزون افاق الطاقة'
                : 'Live catalog from Energy Horizon inventory'}
            </p>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              applyParams({ q, page: '1' });
            }}
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={locale === 'ar' ? 'بحث بالاسم أو SKU' : 'Search SKU or name'}
              className="w-56 rounded-xl"
            />
            <Button type="submit" variant="secondary" className="rounded-xl">
              {locale === 'ar' ? 'بحث' : 'Search'}
            </Button>
          </form>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => applyParams({ sort: f.id, page: '1' })}
              className={
                sort === f.id
                  ? 'rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white'
                  : 'rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-fg'
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {query.isLoading ? <LoadingState variant="products" /> : null}
        {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(query.data?.data ?? []).map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              badge={
                sort === 'bestsellers'
                  ? locale === 'ar'
                    ? 'مبيعات'
                    : 'Top'
                  : undefined
              }
            />
          ))}
        </div>
        {!query.isLoading && !(query.data?.data ?? []).length ? (
          <EmptyState title={locale === 'ar' ? 'لا توجد منتجات' : 'No products found'} />
        ) : null}
        <div className="mt-8">
          <Pagination
            page={query.data?.meta.page ?? page}
            totalPages={query.data?.meta.totalPages ?? 1}
            onChange={(p) => applyParams({ page: String(p) })}
          />
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
      <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
            {locale === 'ar' ? 'الكتالوج' : 'Catalog'}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
            {locale === 'ar' ? 'الأقسام' : 'Categories'}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            {locale === 'ar'
              ? 'اختر القسم المناسب لمعدات مشروعك'
              : 'Pick the right category for your project gear'}
          </p>
        </div>

        {categories.isLoading ? <LoadingState variant="cards" /> : null}
        {categories.isError ? <ErrorState onRetry={() => void categories.refetch()} /> : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(categories.data ?? []).map((c, i) => (
            <Link
              key={c.id}
              to={storePath(`categories/${c.slug}`)}
              className="group relative flex min-h-40 flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card p-5 transition duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_20px_40px_-28px_rgb(0_112_192/0.5)]"
            >
              {c.imageUrl ? (
                <img
                  src={c.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-25"
                />
              ) : (
                <div
                  className="pointer-events-none absolute -end-8 -top-8 h-28 w-28 rounded-full bg-accent/10 blur-2xl transition group-hover:bg-accent/25"
                  aria-hidden
                />
              )}
              <span className="relative font-kpi text-3xl text-accent/30 transition group-hover:text-accent/60">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="relative mt-3 text-lg font-extrabold tracking-tight text-fg">{c.name}</p>
              {c.description ? (
                <p className="relative mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
              ) : null}
            </Link>
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
    queryKey: ['category-products', category.data?.id],
    enabled: Boolean(category.data?.id),
    queryFn: async () =>
      (await catalogApi.products({ categoryId: category.data!.id, limit: 24 })).data,
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
      <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 lg:px-10">
        <Link
          to={storePath('categories')}
          className="text-sm font-semibold text-accent hover:text-accent-soft"
        >
          {locale === 'ar' ? '← كل الأقسام' : '← All categories'}
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-fg">
          {category.data.name}
        </h1>
        {category.data.description ? (
          <p className="mt-2 max-w-2xl text-muted">{category.data.description}</p>
        ) : null}
        {products.isLoading ? <LoadingState variant="products" /> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
  const { cart, addItem, updateItem, removeItem, loading } = useCart();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await catalogApi.productBySlug(slug)).data,
  });

  if (query.isLoading) return <LoadingState variant="page" />;
  if (query.isError || !query.data) {
    return <ErrorState title="Product not found" onRetry={() => void query.refetch()} />;
  }

  const p = query.data;
  const line = cart?.items?.find((i) => i.productId === p.id || i.product?.id === p.id);
  const inCartQty = line?.quantity ?? 0;
  const maxStock = Math.max(1, Number(p.stock ?? 99));
  const disabled = busy || loading;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Seo
        title={p.name}
        path={storePath(`products/${slug}`)}
        description={p.shortDescription || undefined}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-2 sm:px-6 lg:px-8">
        <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-2xl border border-line bg-[var(--card)]">
          {p.images?.[0]?.url ? (
            <img src={p.images[0].url} alt={p.name} className="max-h-[420px] w-full object-contain" />
          ) : (
            <span className="text-muted">{locale === 'ar' ? 'بدون صورة' : 'No product image'}</span>
          )}
        </div>
        <div>
          <p className="text-sm text-muted">
            {p.brand?.name} · SKU {p.sku}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fg">{p.name}</h1>
          <p className="mt-4 text-2xl font-extrabold text-accent">
            {formatMoney(p.price, p.currency)}
          </p>
          <p className="mt-2 text-sm text-muted">
            {locale === 'ar' ? 'التوفر' : 'Availability'}: {p.availability} ·{' '}
            {locale === 'ar' ? 'المخزون' : 'Stock'}: {p.stock}
          </p>
          <p className="mt-4 leading-relaxed text-muted">{p.shortDescription || p.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {inCartQty > 0 && line ? (
              <div className="flex h-11 items-center gap-2 rounded-xl border border-accent/35 bg-accent/10 px-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() =>
                    void run(async () => {
                      if (inCartQty <= 1) await removeItem(line.id);
                      else await updateItem(line.id, inCartQty - 1);
                    })
                  }
                >
                  {inCartQty <= 1 ? '−' : '−'}
                </Button>
                <span className="min-w-10 text-center text-base font-extrabold tabular-nums">
                  {inCartQty}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled || inCartQty >= maxStock}
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() => void run(() => updateItem(line.id, inCartQty + 1))}
                >
                  +
                </Button>
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
                  className="w-24 rounded-xl"
                />
                <Button
                  className="rounded-xl"
                  disabled={disabled}
                  onClick={() => void run(() => addItem(p.id, qty))}
                >
                  {locale === 'ar' ? 'أضف للسلة' : 'Add to cart'}
                </Button>
              </>
            )}
          </div>
          {p.description && p.shortDescription ? (
            <div className="mt-8 whitespace-pre-wrap border-t border-line pt-6 text-sm leading-relaxed text-muted">
              {p.description}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function CartPage() {
  const { locale } = useI18n();
  const { isAuthenticated } = useAuth();
  const { cart, loading, updateItem, removeItem } = useCart();
  const items = cart?.items ?? [];
  const subtotal = useMemo(() => {
    if (cart?.subtotal != null) return Number(cart.subtotal);
    return items.reduce((sum, i) => {
      const price = Number(i.unitPrice ?? i.product?.price ?? 0);
      return sum + price * i.quantity;
    }, 0);
  }, [cart, items]);

  return (
    <>
      <Seo title={locale === 'ar' ? 'السلة' : 'Cart'} path={storePath('cart')} />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-fg">
          {locale === 'ar' ? 'سلتك' : 'Your cart'}
        </h1>
        {loading ? <LoadingState /> : null}
        {!loading && !items.length ? (
          <EmptyState
            title={locale === 'ar' ? 'السلة فارغة' : 'Cart is empty'}
            description={
              locale === 'ar'
                ? 'تصفّح الكتالوج وأضف المعدات للمتابعة.'
                : 'Browse the catalog and add equipment to continue.'
            }
            action={{
              label: locale === 'ar' ? 'تصفح المنتجات' : 'Browse products',
              onClick: () => (window.location.href = storePath('products')),
            }}
          />
        ) : null}
        <div className="mt-6 divide-y divide-[var(--border)] border-y border-line">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 py-5"
            >
              <div>
                <Link
                  to={storePath(`products/${item.product?.slug || ''}`)}
                  className="font-medium text-fg hover:text-accent"
                >
                  {item.product?.name || 'Product'}
                </Link>
                <p className="text-sm text-muted">{item.product?.sku}</p>
                <p className="mt-1 text-sm font-semibold text-accent">
                  {formatMoney(item.unitPrice ?? item.product?.price, item.product?.currency)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  className="w-20"
                  value={item.quantity}
                  onChange={(e) => void updateItem(item.id, Math.max(1, Number(e.target.value) || 1))}
                />
                <Button variant="ghost" onClick={() => void removeItem(item.id)}>
                  {locale === 'ar' ? 'حذف' : 'Remove'}
                </Button>
              </div>
            </div>
          ))}
        </div>
        {items.length ? (
          <div className="mt-8 space-y-4 border-t border-line pt-6">
            {!isAuthenticated ? (
              <div className="rounded-xl border border-accent/25 bg-accent/5 px-4 py-3 text-sm text-fg">
                {locale === 'ar'
                  ? 'قبل إتمام الطلب: سجّل حسابي بالاسم ورقم الهاتف وأكد OTP.'
                  : 'Before checkout: register My account with name + phone and confirm OTP.'}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-lg font-extrabold text-fg">
                {locale === 'ar' ? 'المجموع' : 'Subtotal'}: {formatMoney(subtotal)}
              </p>
              <Link to={storePath('checkout')}>
                <Button size="lg" className="rounded-xl px-8">
                  {isAuthenticated
                    ? locale === 'ar'
                      ? 'إتمام الطلب'
                      : 'Checkout'
                    : locale === 'ar'
                      ? 'متابعة — تسجيل حسابي'
                      : 'Continue — create My account'}
                </Button>
              </Link>
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

export function CheckoutPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { cart, clear, itemCount } = useCart();
  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      firstName: user.firstName && user.firstName !== 'Customer' ? user.firstName : '',
      lastName: user.lastName || '',
      email: user.email?.endsWith('@customers.local') ? '' : user.email || '',
      phone: user.phone || '',
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
      await clear();
      saveStoreOrder(data);
      toast.success(
        locale === 'ar'
          ? `تم الطلب ${data.orderNumber}`
          : `Order ${data.orderNumber} placed`,
      );
      navigate(storePath(`account/orders/${data.id}`));
    } catch {
      toast.error(
        locale === 'ar'
          ? 'فشل إتمام الطلب. تحقق من السلة وأعد المحاولة.'
          : 'Checkout failed. Confirm cart items and try again.',
      );
    }
  }

  if (authLoading) return <LoadingState variant="page" />;

  if (!itemCount && !(cart?.items?.length)) {
    return (
      <EmptyState
        title={locale === 'ar' ? 'لا يوجد ما يُطلب' : 'Nothing to checkout'}
        action={{
          label: locale === 'ar' ? 'العودة للسلة' : 'Back to cart',
          onClick: () => navigate(storePath('cart')),
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Seo title={locale === 'ar' ? 'تحقق مطلوب' : 'Verification required'} path={storePath('checkout')} />
        <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-[0_24px_60px_-40px_rgb(0_112_192/0.45)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
              <span className="text-xl font-extrabold">OTP</span>
            </div>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-fg">
              {locale === 'ar' ? 'سجّل حسابك قبل الطلب' : 'Create your account before ordering'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {locale === 'ar'
                ? 'للتأكد أنك شخص حقيقي: أدخل اسمك ورقم هاتفك، ثم أكّد برمز OTP. بعدها تقدر تكمّل الطلب ويُحفظ في حسابي.'
                : 'To confirm you are a real person: enter your name and phone, verify with OTP, then complete checkout. Orders are saved under My account.'}
            </p>
            <Button
              className="mt-8 w-full rounded-xl"
              size="lg"
              onClick={() =>
                navigate(
                  `${storePath('account/login')}?next=${encodeURIComponent(storePath('checkout'))}`,
                )
              }
            >
              {locale === 'ar' ? 'تسجيل الاسم والرقم' : 'Register with name & phone'}
            </Button>
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => navigate(storePath('cart'))}
            >
              {locale === 'ar' ? 'العودة للسلة' : 'Back to cart'}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title={locale === 'ar' ? 'إتمام الطلب' : 'Checkout'} path={storePath('checkout')} />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-fg">
          {locale === 'ar' ? 'حساب موثّق:' : 'Verified account:'}{' '}
          <strong>
            {user?.firstName} {user?.lastName}
          </strong>{' '}
          · {user?.phone}
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-fg">
          {locale === 'ar' ? 'إتمام الطلب' : 'Checkout'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {locale === 'ar'
            ? 'أكمل عنوان الشحن. الطلب يُحفظ مباشرة في حسابي.'
            : 'Complete shipping details. The order is saved to My account.'}
        </p>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 space-y-3 rounded-2xl border border-line bg-[var(--card)] p-6 sm:p-8"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder={locale === 'ar' ? 'الاسم الأول' : 'First name'}
              {...form.register('firstName')}
            />
            <Input
              placeholder={locale === 'ar' ? 'اسم العائلة' : 'Last name'}
              {...form.register('lastName')}
            />
          </div>
          <Input
            type="email"
            placeholder={locale === 'ar' ? 'البريد (اختياري)' : 'Email (optional)'}
            {...form.register('email')}
          />
          <Input
            placeholder={locale === 'ar' ? 'الهاتف' : 'Phone'}
            {...form.register('phone')}
            readOnly
            className="opacity-80"
          />
          <Input
            placeholder={locale === 'ar' ? 'الشركة' : 'Company'}
            {...form.register('company')}
          />
          <Textarea
            placeholder={locale === 'ar' ? 'عنوان الشحن' : 'Shipping address'}
            {...form.register('shippingAddress')}
          />
          <Textarea
            placeholder={
              locale === 'ar' ? 'عنوان الفوترة (اختياري)' : 'Billing address (optional)'
            }
            {...form.register('billingAddress')}
          />
          <Textarea
            placeholder={locale === 'ar' ? 'ملاحظات الطلب' : 'Order notes'}
            {...form.register('notes')}
          />
          <Select defaultValue="invoice">
            <option value="invoice">
              {locale === 'ar' ? 'طلب فاتورة / أمر شراء' : 'Request invoice / PO'}
            </option>
            <option value="card" disabled>
              {locale === 'ar' ? 'بطاقة (قريباً)' : 'Card payment (coming soon)'}
            </option>
          </Select>
          <Button type="submit" className="w-full rounded-xl" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? locale === 'ar'
                ? 'جارٍ إرسال الطلب…'
                : 'Placing order…'
              : locale === 'ar'
                ? 'تأكيد الطلب'
                : 'Place order'}
          </Button>
        </form>
      </div>
    </>
  );
}

function formatOrderDate(locale: string, value: string) {
  return new Date(value).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB');
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
      toast.success(locale === 'ar' ? 'تم إرسال رمز التحقق' : 'OTP sent');
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
      toast.success(locale === 'ar' ? 'تم التحقق — حسابك جاهز' : 'Verified — account ready');
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
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const order = useQuery({
    queryKey: ['store-order', id],
    enabled: isAuthenticated && Boolean(id),
    queryFn: async () => (await ordersApi.myOrder(id)).data,
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
          <StatusBadge status={o.status} />
        </div>

        <div className="mt-8 border border-line bg-[var(--card)] p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            {locale === 'ar' ? 'العميل' : 'Customer'}
          </p>
          <p className="mt-2 font-semibold text-fg">
            {o.customer?.firstName} {o.customer?.lastName}
          </p>
          {o.customer?.phone ? <p className="text-sm text-muted">{o.customer.phone}</p> : null}
          {o.customer?.email && !o.customer.email.endsWith('@customers.local') ? (
            <p className="text-sm text-muted">{o.customer.email}</p>
          ) : null}
          {o.shippingAddress ? (
            <p className="mt-3 text-sm text-muted">{o.shippingAddress}</p>
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
                    {item.sku} · ×{item.quantity}
                  </p>
                </div>
                <p className="font-kpi text-sm font-bold">
                  {formatMoney(item.lineTotal ?? 0, o.currency)}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-line px-5 py-4">
            <span className="text-sm font-semibold text-muted">
              {locale === 'ar' ? 'الإجمالي' : 'Total'}
            </span>
            <span className="font-kpi text-lg font-extrabold text-fg">
              {formatMoney(o.total, o.currency)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

