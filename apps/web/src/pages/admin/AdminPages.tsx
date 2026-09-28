import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CalendarDays,
  Package,
  AlertTriangle,
  Hourglass,
  LifeBuoy,
  Moon,
  Sun,
  Pencil,
  Plus,
  ArrowLeft,
  ArrowRight,
  FolderTree,
  type LucideIcon,
} from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoadingState, EmptyState, Pagination } from '@/components/ui/States';
import { RevenueTrendChart, OrdersStatusChart } from '@/components/admin/DashboardCharts';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/stores/auth-context';
import { useI18n } from '@/i18n/i18n-context';
import { useTheme } from '@/stores/theme-context';
import { statusLabel } from '@/i18n/dictionaries';
import {
  authApi,
  catalogApi,
  customersApi,
  dashboardApi,
  ordersApi,
  quotesApi,
  supportApi,
  cmsApi,
  adminCmsApi,
  usersApi,
  auditApi,
} from '@/services/endpoints';
import { formatMoney } from '@/lib/cn';
import { adminPath, SITE_URL } from '@/lib/urls';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'READY',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
] as const;

export function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { t, locale, toggleLocale, dir } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@energy-horizon.net');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    navigate(adminPath());
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success(t.admin.welcome);
      navigate(adminPath());
    } catch {
      toast.error(t.admin.invalidCreds);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-page px-4" dir={dir}>
      <div className="pointer-events-none absolute inset-0 hero-void opacity-95" />
      <Seo title={t.admin.brand} path={adminPath('login')} />
      <div className="absolute end-4 top-4 z-20 flex items-center gap-1">
        <button
          type="button"
          onClick={toggleLocale}
          className="inline-flex h-9 min-w-9 items-center justify-center border border-white/20 px-2.5 text-[11px] font-bold tracking-wider text-white/80 transition hover:border-accent hover:text-white"
        >
          {locale === 'en' ? 'ع' : 'EN'}
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center border border-white/20 text-white/80 transition hover:border-accent hover:text-white"
          aria-label={theme === 'light' ? t.theme.dark : t.theme.light}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>
      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-md space-y-4 border border-white/10 bg-elevated/95 p-8 shadow-2xl backdrop-blur-md"
      >
        <div className="flex flex-col items-center text-center">
          <Logo to="/" className="mb-4" imgClassName="h-12 max-w-[220px] sm:h-14" />
          <h1 className="text-xl font-bold text-fg">{t.admin.brand}</h1>
          <p className="text-sm text-muted">
            {locale === 'ar' ? 'افاق الطاقة · Energy Horizon' : 'Energy Horizon · افاق الطاقة'}
          </p>
        </div>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.common.email}
        />
        <Input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.common.password}
        />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? t.admin.signingIn : t.admin.signIn}
        </Button>
        <p className="text-center text-xs text-muted">
          <a href={SITE_URL}>{t.admin.backWebsite}</a>
        </p>
      </form>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground/70" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="font-kpi text-[1.75rem] font-bold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardPage() {
  const { t, locale } = useI18n();
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';

  const overview = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => (await dashboardApi.overview()).data,
  });
  const sales = useQuery({
    queryKey: ['dashboard-sales'],
    queryFn: async () =>
      (await dashboardApi.sales()).data as {
        monthOrders: number;
        monthRevenue: number;
        completedOrders: number;
        completedRevenue: number;
        currency: string;
      },
  });
  const trend = useQuery({
    queryKey: ['dashboard-sales-trend'],
    queryFn: async () => (await dashboardApi.salesTrend(30)).data,
  });
  const orderStats = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: async () =>
      (await dashboardApi.orders()).data as { byStatus: { status: string; count: number }[] },
  });
  const activity = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => {
      const res = await dashboardApi.recentActivity();
      const data = res.data as unknown;
      if (Array.isArray(data))
        return data as { id: string; action: string; entity: string; createdAt: string }[];
      if (data && typeof data === 'object' && 'data' in data) {
        return (data as { data: { id: string; action: string; entity: string; createdAt: string }[] })
          .data;
      }
      return [];
    },
  });

  const primaryCards = overview.data
    ? [
        {
          label: t.admin.monthRevenue,
          value: formatMoney(
            overview.data.revenue.monthTotal,
            overview.data.revenue.currency,
            moneyLocale,
          ),
          icon: DollarSign,
        },
        { label: t.admin.orders, value: overview.data.orders.total, icon: ShoppingBag },
        { label: t.admin.pendingOrders, value: overview.data.orders.pending, icon: Clock },
        { label: t.admin.openTickets, value: overview.data.tickets.open, icon: LifeBuoy },
      ]
    : [];

  const secondaryCards = overview.data
    ? [
        { label: t.admin.ordersToday, value: overview.data.orders.today, icon: CalendarDays },
        { label: t.admin.products, value: overview.data.products.total, icon: Package },
        { label: t.admin.lowStock, value: overview.data.products.lowStock, icon: AlertTriangle },
        { label: t.admin.pendingQuotes, value: overview.data.quotes.pending, icon: Hourglass },
      ]
    : [];

  const chartStatuses =
    orderStats.data?.byStatus.map((s) => ({
      status: statusLabel(locale, s.status),
      count: s.count,
    })) ?? [];

  return (
    <div className="space-y-8">
      <Seo title={t.admin.overviewTitle} path="/admin" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t.admin.overviewTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.overviewSub}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={adminPath('products/new')}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t.admin.addProduct}
            </Button>
          </Link>
          <Link to={adminPath('categories')}>
            <Button variant="outline" className="gap-2">
              <FolderTree className="h-4 w-4" />
              {t.admin.categories}
            </Button>
          </Link>
        </div>
      </div>

      {overview.isLoading ? <LoadingState label={t.common.loading} /> : null}
      {overview.isError ? (
        <p className="text-sm text-destructive">{t.admin.loadError}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryCards.map((c) => (
          <KpiCard key={c.label} label={c.label} value={c.value} icon={c.icon} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {secondaryCards.map((c) => (
          <KpiCard key={c.label} label={c.label} value={c.value} icon={c.icon} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>{t.admin.revenueTrend}</CardTitle>
            <CardDescription>{t.admin.revenueTrendSub}</CardDescription>
          </CardHeader>
          <CardContent>
            {trend.isLoading ? <LoadingState className="py-16" label={t.common.loading} /> : null}
            {trend.data?.series ? <RevenueTrendChart data={trend.data.series} /> : null}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t.admin.ordersByStatus}</CardTitle>
          </CardHeader>
          <CardContent>
            {orderStats.isLoading ? (
              <LoadingState className="py-16" label={t.common.loading} />
            ) : null}
            {chartStatuses.length ? (
              <OrdersStatusChart data={chartStatuses} />
            ) : !orderStats.isLoading ? (
              <p className="py-16 text-center text-sm text-muted-foreground">{t.admin.noActivity}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.admin.salesMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.isLoading ? <LoadingState className="py-8" label={t.common.loading} /> : null}
            {sales.data ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <dt className="text-sm text-muted-foreground">{t.admin.orders}</dt>
                  <dd className="mt-1 font-kpi text-2xl font-bold">{sales.data.monthOrders}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">{t.admin.monthRevenue}</dt>
                  <dd className="mt-1 font-kpi text-2xl font-bold">
                    {formatMoney(sales.data.monthRevenue, sales.data.currency, moneyLocale)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">{t.admin.completed}</dt>
                  <dd className="mt-1 font-kpi text-2xl font-bold">{sales.data.completedOrders}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">{t.admin.completedRevenue}</dt>
                  <dd className="mt-1 font-kpi text-2xl font-bold">
                    {formatMoney(sales.data.completedRevenue, sales.data.currency, moneyLocale)}
                  </dd>
                </div>
              </dl>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.admin.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(overview.data?.recentOrders ?? []).slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 text-sm">
                  <Link
                    to={adminPath(`orders/${o.id}`)}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {o.orderNumber}
                  </Link>
                  <span className="tabular-nums text-muted-foreground">
                    {formatMoney(o.total, o.currency, moneyLocale)}
                  </span>
                </li>
              ))}
              {(activity.data ?? []).slice(0, 3).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {a.action} · {a.entity}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
                  </span>
                </li>
              ))}
              {!overview.isLoading &&
              !(overview.data?.recentOrders ?? []).length &&
              !(activity.data ?? []).length ? (
                <li className="py-6 text-center text-muted-foreground">{t.admin.noActivity}</li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AdminProductsPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['admin-products', page],
    queryFn: async () => (await catalogApi.products({ page, limit: 20 })).data,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fg">{t.admin.products}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.quickActions}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={adminPath('categories')}>
            <Button variant="outline" className="gap-2">
              <FolderTree className="h-4 w-4" />
              {t.admin.categories}
            </Button>
          </Link>
          <Link to={adminPath('products/new')}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t.admin.addProduct}
            </Button>
          </Link>
        </div>
      </div>
      {query.isLoading ? <LoadingState label={t.common.loading} /> : null}
      <Card className="overflow-hidden py-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-start text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">{t.common.name}</th>
                  <th className="px-4 py-3 text-start">{t.common.sku}</th>
                  <th className="px-4 py-3 text-start">{t.admin.category}</th>
                  <th className="px-4 py-3 text-start">{t.common.price}</th>
                  <th className="px-4 py-3 text-start">{t.common.stock}</th>
                  <th className="px-4 py-3 text-start">{t.common.status}</th>
                  <th className="px-4 py-3 text-start">{t.admin.actions}</th>
                </tr>
              </thead>
              <tbody>
                {(query.data?.data ?? []).map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        to={adminPath(`products/${p.id}`)}
                        className="font-medium text-primary hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{p.sku}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.category?.name || t.admin.noCategory}
                    </td>
                    <td className="px-4 py-3">{formatMoney(p.price, p.currency, moneyLocale)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link to={adminPath(`products/${p.id}`)}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Pencil className="h-3.5 w-3.5" />
                          {t.admin.edit}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {!query.isLoading && !(query.data?.data ?? []).length ? (
        <EmptyState
          title={t.admin.emptyList}
          action={{
            label: t.admin.addProduct,
            onClick: () => navigate(adminPath('products/new')),
          }}
        />
      ) : null}
      <Pagination
        page={query.data?.meta.page ?? 1}
        totalPages={query.data?.meta.totalPages ?? 1}
        onChange={setPage}
      />
    </div>
  );
}

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  currency: z.string(),
  categoryId: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export function AdminProductFormPage() {
  const { t, locale, dir } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const existing = useQuery({
    queryKey: ['admin-product', id],
    enabled: !isNew,
    queryFn: async () => (await catalogApi.productById(id!)).data,
  });
  const categories = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await catalogApi.categoriesAdmin()).data,
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      stock: 0,
      shortDescription: '',
      description: '',
      status: 'DRAFT',
      currency: 'USD',
      categoryId: '',
    },
    values: existing.data
      ? {
          name: existing.data.name,
          sku: existing.data.sku,
          price: Number(existing.data.price),
          stock: existing.data.stock,
          shortDescription: existing.data.shortDescription || '',
          description: existing.data.description || '',
          status: (['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(existing.data.status)
            ? existing.data.status
            : 'DRAFT') as ProductForm['status'],
          currency: existing.data.currency,
          categoryId: existing.data.category?.id || '',
        }
      : undefined,
  });

  async function onSubmit(values: ProductForm) {
    const payload = {
      ...values,
      categoryId: values.categoryId || null,
    };
    try {
      if (isNew) {
        await catalogApi.createProduct(payload);
        toast.success(t.admin.productCreated);
      } else {
        await catalogApi.updateProduct(id!, payload);
        toast.success(t.admin.productUpdated);
      }
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
      navigate(adminPath('products'));
    } catch {
      toast.error(t.admin.saveFailed);
    }
  }

  if (!isNew && existing.isLoading) return <LoadingState label={t.common.loading} />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to={adminPath('products')}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <BackIcon className="h-4 w-4" />
            {t.admin.back}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-fg">
          {isNew ? t.admin.newProduct : t.admin.editProduct}
        </h1>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>{isNew ? t.admin.newProduct : t.admin.editProduct}</CardTitle>
            <CardDescription>{t.admin.products}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder={t.common.name} {...form.register('name')} />
            <Input placeholder={t.common.sku} {...form.register('sku')} />
            <Select {...form.register('categoryId')}>
              <option value="">{t.admin.noCategory}</option>
              {(categories.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                type="number"
                step="0.01"
                placeholder={t.common.price}
                {...form.register('price', { valueAsNumber: true })}
              />
              <Input
                type="number"
                placeholder={t.common.stock}
                {...form.register('stock', { valueAsNumber: true })}
              />
              <Input placeholder={t.admin.currency} {...form.register('currency')} />
            </div>
            <Select {...form.register('status')}>
              <option value="DRAFT">{statusLabel(locale, 'DRAFT')}</option>
              <option value="ACTIVE">{statusLabel(locale, 'ACTIVE')}</option>
              <option value="ARCHIVED">{statusLabel(locale, 'ARCHIVED')}</option>
            </Select>
            <Textarea placeholder={t.admin.shortDescription} {...form.register('shortDescription')} />
            <Textarea placeholder={t.admin.description} {...form.register('description')} />
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit">{t.common.save}</Button>
            <Link to={adminPath('products')}>
              <Button type="button" variant="outline">
                {t.admin.back}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export function AdminCategoriesPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await catalogApi.categoriesAdmin()).data,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await catalogApi.updateCategory(editingId, {
          name,
          description,
          status: 'PUBLISHED',
        });
        toast.success(t.admin.categoryUpdated);
      } else {
        await catalogApi.createCategory({
          name,
          description,
          status: 'PUBLISHED',
          slug: name.toLowerCase().replace(/\s+/g, '-'),
        });
        toast.success(t.admin.categoryCreated);
      }
      setName('');
      setDescription('');
      setEditingId(null);
      await qc.invalidateQueries({ queryKey: ['admin-categories'] });
    } catch {
      toast.error(t.admin.saveFailed);
    }
  }

  async function onDelete(id: string) {
    try {
      await catalogApi.deleteCategory(id);
      toast.success(t.admin.categoryDeleted);
      await qc.invalidateQueries({ queryKey: ['admin-categories'] });
    } catch {
      toast.error(t.admin.deleteFailed);
    }
  }

  function startEdit(row: { id: string; name: string; description?: string | null }) {
    setEditingId(row.id);
    setName(row.name);
    setDescription(row.description || '');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">{t.admin.categories}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin.quickActions}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? t.admin.editCategory : t.admin.newCategory}</CardTitle>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-3">
            <Input
              required
              placeholder={t.common.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              placeholder={t.admin.description}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit">{editingId ? t.common.save : t.common.create}</Button>
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setName('');
                  setDescription('');
                }}
              >
                {t.admin.back}
              </Button>
            ) : null}
          </CardFooter>
        </form>
      </Card>

      {list.isLoading ? <LoadingState label={t.common.loading} /> : null}
      <div className="space-y-2">
        {(list.data ?? []).map((row) => (
          <Card key={row.id} size="sm">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-0">
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">
                  {row.slug} · {row.description || '—'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={String(row.status || 'PUBLISHED')} />
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => startEdit(row)}>
                  <Pencil className="h-3.5 w-3.5" />
                  {t.admin.edit}
                </Button>
                <Button variant="danger" size="sm" onClick={() => void onDelete(row.id)}>
                  {t.admin.delete}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!list.isLoading && !(list.data ?? []).length ? <EmptyState title={t.admin.emptyList} /> : null}
    </div>
  );
}

export function AdminOrdersPage() {
  const { t, locale } = useI18n();
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: async () => (await ordersApi.list({ page, limit: 20 })).data,
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-fg">{t.admin.orders}</h1>
      {query.isLoading ? <LoadingState label={t.common.loading} /> : null}
      <div className="overflow-x-auto surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line bg-black/[0.03] text-xs uppercase text-muted dark:bg-white/5">
            <tr>
              <th className="px-4 py-3 text-start">{t.common.order}</th>
              <th className="px-4 py-3 text-start">{t.common.customer}</th>
              <th className="px-4 py-3 text-start">{t.common.total}</th>
              <th className="px-4 py-3 text-start">{t.common.status}</th>
            </tr>
          </thead>
          <tbody>
            {(query.data?.data ?? []).map((o) => (
              <tr key={o.id} className="border-b border-line">
                <td className="px-4 py-3">
                  <Link className="text-accent" to={adminPath(`orders/${o.id}`)}>
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.customer?.email}</td>
                <td className="px-4 py-3">{formatMoney(o.total, o.currency, moneyLocale)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={query.data?.meta.page ?? 1}
        totalPages={query.data?.meta.totalPages ?? 1}
        onChange={setPage}
      />
    </div>
  );
}

export function AdminOrderDetailPage() {
  const { t, locale } = useI18n();
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const order = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => (await ordersApi.get(id)).data,
  });
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');

  if (order.isLoading) return <LoadingState label={t.common.loading} />;
  if (!order.data) return <EmptyState title={t.admin.orderNotFound} />;

  async function saveStatus() {
    try {
      await ordersApi.updateStatus(id, status || order.data!.status, note || undefined);
      toast.success(t.admin.statusUpdated);
      await qc.invalidateQueries({ queryKey: ['admin-order', id] });
    } catch {
      toast.error(t.admin.updateFailed);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-fg">
        {t.admin.orderDetail} {order.data.orderNumber}
      </h1>
      <StatusBadge status={order.data.status} />
      <div className="surface p-5">
        <p className="text-sm">
          {order.data.customer?.firstName} {order.data.customer?.lastName} ·{' '}
          {order.data.customer?.email}
        </p>
        <p className="mt-2 font-semibold">
          {formatMoney(order.data.total, order.data.currency, moneyLocale)}
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {(order.data.items ?? []).map((i, idx) => (
            <li key={idx}>
              {i.quantity} × {i.productName} ({i.sku})
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-3 surface p-5">
        <Select value={status || order.data.status} onChange={(e) => setStatus(e.target.value)}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(locale, s)}
            </option>
          ))}
        </Select>
        <Input
          placeholder={t.admin.internalNote}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => void saveStatus()}>{t.admin.updateStatus}</Button>
      </div>
    </div>
  );
}

function AdminListPage({
  title,
  queryKey,
  fetcher,
  columns,
  newPath,
}: {
  title: string;
  queryKey: string;
  fetcher: () => Promise<{ data: unknown }>;
  columns: (row: Record<string, unknown>) => React.ReactNode;
  newPath?: string;
}) {
  const { t } = useI18n();
  const query = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await fetcher();
      const data = res.data as unknown;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'data' in data) return (data as { data: unknown[] }).data;
      return [];
    },
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-fg">{title}</h1>
        {newPath ? (
          <Link to={newPath}>
            <Button>{t.common.create}</Button>
          </Link>
        ) : null}
      </div>
      {query.isLoading ? <LoadingState label={t.common.loading} /> : null}
      <div className="space-y-2">
        {(query.data as Record<string, unknown>[] | undefined)?.map((row, i) => (
          <Card key={String(row.id ?? i)} size="sm">
            <CardContent>{columns(row)}</CardContent>
          </Card>
        ))}
      </div>
      {!query.isLoading && !(query.data as unknown[])?.length ? (
        <EmptyState title={t.admin.emptyList} />
      ) : null}
    </div>
  );
}

export function AdminCustomersPage() {
  const { t } = useI18n();
  return (
    <AdminListPage
      title={t.admin.customers}
      queryKey="admin-customers"
      fetcher={() => customersApi.list()}
      columns={(row) => (
        <Link to={adminPath(`customers/${row.id}`)} className="font-medium text-accent">
          {String(row.firstName)} {String(row.lastName)} · {String(row.email)}
        </Link>
      )}
    />
  );
}

export function AdminCustomerDetailPage() {
  const { t } = useI18n();
  const { id = '' } = useParams();
  const customer = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: async () => (await customersApi.get(id)).data,
  });
  if (customer.isLoading) return <LoadingState label={t.common.loading} />;
  if (!customer.data) return <EmptyState title={t.admin.customerNotFound} />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-fg">
        {customer.data.firstName} {customer.data.lastName}
      </h1>
      <p className="text-sm text-muted">{customer.data.email}</p>
      <p className="text-sm">{customer.data.company || ''}</p>
    </div>
  );
}

export function AdminQuotesPage() {
  const { t } = useI18n();
  return (
    <AdminListPage
      title={t.admin.quoteRequests}
      queryKey="admin-quotes"
      fetcher={() => quotesApi.list()}
      columns={(row) => (
        <Link to={adminPath(`quotes/${row.id}`)} className="flex justify-between">
          <span className="font-medium text-accent">{String(row.quoteNumber)}</span>
          <StatusBadge status={String(row.status)} />
        </Link>
      )}
    />
  );
}

export function AdminQuoteDetailPage() {
  const { t } = useI18n();
  const { id = '' } = useParams();
  const quote = useQuery({
    queryKey: ['admin-quote', id],
    queryFn: async () => (await quotesApi.get(id)).data,
  });
  if (quote.isLoading) return <LoadingState label={t.common.loading} />;
  if (!quote.data) return <EmptyState title={t.admin.quoteNotFound} />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{quote.data.quoteNumber}</h1>
      <StatusBadge status={quote.data.status} />
      <p className="whitespace-pre-wrap text-sm">{quote.data.message || ''}</p>
    </div>
  );
}

export function AdminSupportPage() {
  const { t } = useI18n();
  return (
    <AdminListPage
      title={t.admin.support}
      queryKey="admin-tickets"
      fetcher={() => supportApi.list()}
      columns={(row) => (
        <Link to={adminPath(`support/${row.id}`)} className="flex justify-between gap-3">
          <span className="font-medium text-accent">
            {String(row.ticketNumber)} — {String(row.subject)}
          </span>
          <StatusBadge status={String(row.status)} />
        </Link>
      )}
    />
  );
}

export function AdminSupportDetailPage() {
  const { t, locale } = useI18n();
  const { id = '' } = useParams();
  const [message, setMessage] = useState('');
  const qc = useQueryClient();
  const ticket = useQuery({
    queryKey: ['admin-ticket', id],
    queryFn: async () =>
      (await supportApi.get(id)).data as {
        ticketNumber: string;
        subject: string;
        status: string;
        description: string;
        messages?: { id: string; message: string; createdAt: string; sender?: { firstName: string } }[];
      },
  });

  async function reply() {
    try {
      await supportApi.reply(id, message);
      setMessage('');
      toast.success(t.admin.replySent);
      await qc.invalidateQueries({ queryKey: ['admin-ticket', id] });
    } catch {
      toast.error(t.admin.replyFailed);
    }
  }

  if (ticket.isLoading) return <LoadingState label={t.common.loading} />;
  if (!ticket.data) return <EmptyState title={t.admin.ticketNotFound} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{ticket.data.ticketNumber}</h1>
      <p className="font-medium">{ticket.data.subject}</p>
      <StatusBadge status={ticket.data.status} />
      <p className="text-sm text-muted">{ticket.data.description}</p>
      <div className="space-y-3">
        {(ticket.data.messages ?? []).map((m) => (
          <div key={m.id} className="surface p-3 text-sm">
            <p className="text-xs text-muted">
              {m.sender?.firstName} ·{' '}
              {new Date(m.createdAt).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
            </p>
            <p className="mt-1">{m.message}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.admin.replyPlaceholder}
        />
        <Button onClick={() => void reply()}>{t.common.send}</Button>
      </div>
    </div>
  );
}

function CmsCrudPage({
  title,
  listKey,
  listFn,
  createFn,
  fields,
}: {
  title: string;
  listKey: string;
  listFn: () => Promise<{ data: unknown }>;
  createFn: (data: Record<string, string>) => Promise<unknown>;
  fields: { key: string; label: string }[];
}) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const list = useQuery({
    queryKey: [listKey],
    queryFn: async () => {
      const res = await listFn();
      return Array.isArray(res.data) ? res.data : ((res.data as { data: unknown[] }).data ?? []);
    },
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createFn(form);
      toast.success(t.admin.created);
      setForm({});
      await qc.invalidateQueries({ queryKey: [listKey] });
    } catch {
      toast.error(t.admin.createFailed);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-fg">{title}</h1>
      <form onSubmit={create} className="grid gap-2 surface p-4 md:grid-cols-2">
        {fields.map((f) => (
          <Input
            key={f.key}
            placeholder={f.label}
            value={form[f.key] || ''}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            required={f.key === 'name' || f.key === 'title'}
          />
        ))}
        <Button type="submit" className="md:col-span-2">
          {t.common.create}
        </Button>
      </form>
      {list.isLoading ? <LoadingState label={t.common.loading} /> : null}
      <div className="space-y-2">
        {(list.data as Record<string, unknown>[] | undefined)?.map((row) => (
          <div key={String(row.id)} className="surface p-3 text-sm">
            {String(row.name || row.title)} · {String(row.slug || '')} ·{' '}
            <StatusBadge status={String(row.status || 'DRAFT')} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminServicesPage() {
  const { t } = useI18n();
  return (
    <CmsCrudPage
      title={t.admin.services}
      listKey="admin-services"
      listFn={() => cmsApi.services()}
      createFn={(d) =>
        adminCmsApi.createService({
          ...d,
          status: 'PUBLISHED',
          slug: d.name?.toLowerCase().replace(/\s+/g, '-'),
        })
      }
      fields={[
        { key: 'name', label: t.common.name },
        { key: 'shortDescription', label: t.admin.shortDescription },
        { key: 'description', label: t.admin.description },
      ]}
    />
  );
}

export function AdminProjectsPage() {
  const { t } = useI18n();
  return (
    <CmsCrudPage
      title={t.admin.projects}
      listKey="admin-projects"
      listFn={() => cmsApi.projects()}
      createFn={(d) =>
        adminCmsApi.createProject({
          ...d,
          title: d.title || d.name,
          status: 'PUBLISHED',
          slug: (d.title || d.name || '').toLowerCase().replace(/\s+/g, '-'),
        })
      }
      fields={[
        { key: 'title', label: t.admin.title },
        { key: 'shortDescription', label: t.admin.shortDescription },
        { key: 'description', label: t.admin.description },
      ]}
    />
  );
}

export function AdminNewsPage() {
  const { t } = useI18n();
  return (
    <CmsCrudPage
      title={t.admin.news}
      listKey="admin-news"
      listFn={() => cmsApi.news()}
      createFn={(d) =>
        adminCmsApi.createNews({
          ...d,
          title: d.title,
          status: 'PUBLISHED',
          slug: d.title.toLowerCase().replace(/\s+/g, '-'),
          publishedAt: new Date().toISOString(),
        })
      }
      fields={[
        { key: 'title', label: t.admin.title },
        { key: 'excerpt', label: t.admin.excerpt },
        { key: 'content', label: t.admin.content },
        { key: 'author', label: t.admin.author },
      ]}
    />
  );
}

export function AdminBrandsPage() {
  const { t } = useI18n();
  return (
    <CmsCrudPage
      title={t.admin.brands}
      listKey="admin-brands"
      listFn={() => cmsApi.brands()}
      createFn={(d) =>
        adminCmsApi.createBrand({
          ...d,
          status: 'PUBLISHED',
          slug: d.name.toLowerCase().replace(/\s+/g, '-'),
        })
      }
      fields={[
        { key: 'name', label: t.common.name },
        { key: 'description', label: t.admin.description },
        { key: 'website', label: t.admin.website },
      ]}
    />
  );
}

export function AdminPagesPage() {
  const { t } = useI18n();
  return (
    <CmsCrudPage
      title={t.admin.pages}
      listKey="admin-pages"
      listFn={() => cmsApi.pages()}
      createFn={(d) =>
        adminCmsApi.createPage({
          ...d,
          title: d.title,
          status: 'PUBLISHED',
          slug: d.title.toLowerCase().replace(/\s+/g, '-'),
        })
      }
      fields={[
        { key: 'title', label: t.admin.title },
        { key: 'excerpt', label: t.admin.excerpt },
        { key: 'content', label: t.admin.content },
      ]}
    />
  );
}

export function AdminOfficesPage() {
  const { t } = useI18n();
  return (
    <CmsCrudPage
      title={t.admin.offices}
      listKey="admin-offices"
      listFn={() => cmsApi.offices()}
      createFn={(d) => adminCmsApi.createOffice({ ...d, status: 'PUBLISHED' })}
      fields={[
        { key: 'name', label: t.common.name },
        { key: 'city', label: t.admin.city },
        { key: 'phone', label: t.admin.phone },
        { key: 'contactPerson', label: t.admin.contactPerson },
        { key: 'email', label: t.common.email },
      ]}
    />
  );
}

export function AdminUsersPage() {
  const { t } = useI18n();
  return (
    <AdminListPage
      title={t.admin.users}
      queryKey="admin-users"
      fetcher={() => usersApi.list()}
      columns={(row) => (
        <span>
          {String(row.email)} · {String((row.role as { code?: string })?.code || row.role || '')}
        </span>
      )}
    />
  );
}

export function AdminAuditPage() {
  const { t, locale } = useI18n();
  return (
    <AdminListPage
      title={t.admin.auditLogs}
      queryKey="admin-audit"
      fetcher={() => auditApi.list()}
      columns={(row) => (
        <span className="text-sm">
          {String(row.action)} · {String(row.entity)} ·{' '}
          {new Date(String(row.createdAt)).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
        </span>
      )}
    />
  );
}

export function AdminSettingsPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-fg">{t.admin.settings}</h1>
      <p className="text-sm text-muted">{t.admin.settingsBlurb}</p>
      <Button
        onClick={() =>
          void authApi
            .me()
            .then(() => toast.success(t.admin.sessionValid))
            .catch(() => toast.error(t.admin.sessionInvalid))
        }
      >
        {t.admin.validateSession}
      </Button>
    </div>
  );
}
