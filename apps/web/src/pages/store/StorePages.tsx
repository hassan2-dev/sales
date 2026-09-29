import { useMemo, useState } from 'react';
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
import { ProductCard } from '@/components/ProductCard';
import { catalogApi, ordersApi } from '@/services/endpoints';
import { useCart } from '@/stores/cart-context';
import { formatMoney } from '@/lib/cn';
import { storePath } from '@/lib/urls';
import { useI18n } from '@/i18n/i18n-context';

export function StoreHomePage() {
  const { locale } = useI18n();
  const featured = useQuery({
    queryKey: ['store-featured'],
    queryFn: async () => (await catalogApi.products({ featured: true, limit: 8 })).data,
  });
  const categories = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => (await catalogApi.categories()).data,
  });

  return (
    <>
      <Seo title={locale === 'ar' ? 'المتجر' : 'Store'} path={storePath()} />
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0 hero-plane" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <img
            src="/energy-horizon-logo.png"
            alt="Energy Horizon"
            className="reveal mb-8 h-14 w-auto object-contain sm:h-16"
          />
          <h1 className="reveal reveal-delay-1 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {locale === 'ar' ? 'كتالوج المعدات الصناعية' : 'Industrial equipment catalog'}
          </h1>
          <p className="reveal reveal-delay-2 mt-4 max-w-lg text-base text-white/60">
            {locale === 'ar'
              ? 'تصفّح المعدات، اطلب عرض سعر، أو أكمل الطلب بأسعار المخزون الحية.'
              : 'Browse equipment, request quotes, or place orders with live inventory pricing.'}
          </p>
          <div className="reveal reveal-delay-3 mt-8">
            <Link
              to={storePath('products')}
              className="inline-flex h-11 items-center rounded-sm bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent-soft"
            >
              {locale === 'ar' ? 'تصفح المنتجات' : 'Shop products'}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-fg">
            {locale === 'ar' ? 'التصنيفات' : 'Categories'}
          </h2>
          {categories.isLoading ? <LoadingState variant="cards" /> : null}
          <div className="mt-6 grid gap-px overflow-hidden rounded-sm border border-line bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {(categories.data ?? []).map((c) => (
              <Link
                key={c.id}
                to={storePath(`categories/${c.slug}`)}
                className="bg-[var(--card)] p-5 transition hover:bg-elevated"
              >
                <p className="font-semibold text-fg">{c.name}</p>
                <p className="mt-1.5 text-sm text-muted line-clamp-2">{c.description}</p>
              </Link>
            ))}
          </div>
          {!categories.isLoading && !(categories.data ?? []).length ? (
            <EmptyState title={locale === 'ar' ? 'لا توجد تصنيفات' : 'No categories yet'} />
          ) : null}
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-fg">
              {locale === 'ar' ? 'مميز' : 'Featured'}
            </h2>
            <Link
              to={storePath('products')}
              className="text-sm font-semibold text-accent hover:text-accent-soft"
            >
              {locale === 'ar' ? 'كل المنتجات' : 'All products'}
            </Link>
          </div>
          {featured.isLoading ? <LoadingState variant="products" /> : null}
          {featured.isError ? <ErrorState onRetry={() => void featured.refetch()} /> : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(featured.data?.data ?? []).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {!featured.isLoading && !(featured.data?.data ?? []).length ? (
            <EmptyState title={locale === 'ar' ? 'لا توجد منتجات مميزة' : 'No featured products'} />
          ) : null}
        </section>
      </div>
    </>
  );
}

export function StoreProductsPage() {
  const { locale } = useI18n();
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || 1);
  const search = params.get('q') || '';
  const [q, setQ] = useState(search);

  const query = useQuery({
    queryKey: ['store-products', page, search],
    queryFn: async () =>
      (await catalogApi.products({ page, limit: 12, search: search || undefined })).data,
  });

  return (
    <>
      <Seo title={locale === 'ar' ? 'المنتجات' : 'Products'} path={storePath('products')} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-fg">
              {locale === 'ar' ? 'المنتجات' : 'Products'}
            </h1>
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
              setParams({ q, page: '1' });
            }}
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={locale === 'ar' ? 'بحث بالاسم أو SKU' : 'Search SKU or name'}
              className="w-56"
            />
            <Button type="submit" variant="secondary" className="rounded-sm">
              {locale === 'ar' ? 'بحث' : 'Search'}
            </Button>
          </form>
        </div>
        {query.isLoading ? <LoadingState variant="products" /> : null}
        {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(query.data?.data ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {!query.isLoading && !(query.data?.data ?? []).length ? (
          <EmptyState title={locale === 'ar' ? 'لا توجد منتجات' : 'No products found'} />
        ) : null}
        <div className="mt-8">
          <Pagination
            page={query.data?.meta.page ?? page}
            totalPages={query.data?.meta.totalPages ?? 1}
            onChange={(p) => setParams({ q: search, page: String(p) })}
          />
        </div>
      </div>
    </>
  );
}

export function StoreCategoryPage() {
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
    return <ErrorState title="Category not found" />;
  }

  return (
    <>
      <Seo title={category.data.name} path={storePath(`categories/${slug}`)} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-fg">{category.data.name}</h1>
        <p className="mt-2 text-muted">{category.data.description}</p>
        {products.isLoading ? <LoadingState variant="products" /> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(products.data?.data ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {!products.isLoading && !(products.data?.data ?? []).length ? (
          <EmptyState title="No products in this category" />
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
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const query = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await catalogApi.productBySlug(slug)).data,
  });

  if (query.isLoading) return <LoadingState variant="page" />;
  if (query.isError || !query.data) {
    return <ErrorState title="Product not found" onRetry={() => void query.refetch()} />;
  }

  const p = query.data;

  return (
    <>
      <Seo
        title={p.name}
        path={storePath(`products/${slug}`)}
        description={p.shortDescription || undefined}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-2 sm:px-6 lg:px-8">
        <div className="flex min-h-72 items-center justify-center border border-line bg-[var(--card)]">
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
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">{p.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-accent">
            {formatMoney(p.price, p.currency)}
          </p>
          <p className="mt-2 text-sm text-muted">
            {locale === 'ar' ? 'التوفر' : 'Availability'}: {p.availability} ·{' '}
            {locale === 'ar' ? 'المخزون' : 'Stock'}: {p.stock}
          </p>
          <p className="mt-4 leading-relaxed text-muted">{p.shortDescription || p.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-24"
            />
            <Button className="rounded-sm" onClick={() => void addItem(p.id, qty)}>
              {locale === 'ar' ? 'أضف للسلة' : 'Add to cart'}
            </Button>
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
        <h1 className="text-3xl font-semibold tracking-tight text-fg">
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
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-lg font-semibold text-fg">
              {locale === 'ar' ? 'المجموع' : 'Subtotal'}: {formatMoney(subtotal)}
            </p>
            <Link to={storePath('checkout')}>
              <Button size="lg" className="rounded-sm">
                {locale === 'ar' ? 'إتمام الطلب' : 'Checkout'}
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}

const checkoutSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  shippingAddress: z.string().min(5),
  billingAddress: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { cart, clear, itemCount } = useCart();
  const form = useForm<CheckoutForm>({ resolver: zodResolver(checkoutSchema) });

  async function onSubmit(values: CheckoutForm) {
    try {
      const { data } = await ordersApi.checkout({
        ...values,
        billingAddress: values.billingAddress || values.shippingAddress,
      });
      await clear();
      toast.success(
        locale === 'ar'
          ? `تم الطلب ${data.orderNumber}`
          : `Order ${data.orderNumber} placed`,
      );
      navigate(storePath());
    } catch {
      toast.error(
        locale === 'ar'
          ? 'فشل إتمام الطلب. تحقق من السلة وأعد المحاولة.'
          : 'Checkout failed. Confirm cart items and try again.',
      );
    }
  }

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

  return (
    <>
      <Seo title={locale === 'ar' ? 'إتمام الطلب' : 'Checkout'} path={storePath('checkout')} />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-fg">
          {locale === 'ar' ? 'إتمام الطلب' : 'Checkout'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {locale === 'ar'
            ? 'تُحسب المجاميع من الخادم بأسعار الكتالوج الحالية.'
            : 'Totals are calculated server-side from current catalog prices.'}
        </p>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 space-y-3 border border-line bg-[var(--card)] p-6 sm:p-8"
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
            placeholder={locale === 'ar' ? 'البريد' : 'Email'}
            {...form.register('email')}
          />
          <Input
            placeholder={locale === 'ar' ? 'الهاتف' : 'Phone'}
            {...form.register('phone')}
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
          <Button type="submit" className="w-full rounded-sm" disabled={form.formState.isSubmitting}>
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
