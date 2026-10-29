import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Store,
  Globe,
  Moon,
  Sun,
  Pencil,
  Plus,
  ArrowLeft,
  ArrowRight,
  FolderTree,
  Trash2,
  ImageIcon,
  Power,
  ChevronDown,
  Check,
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
  settingsApi,
  usersApi,
  auditApi,
} from '@/services/endpoints';
import type { CmsService } from '@/types';
import { cn, formatMoney } from '@/lib/cn';
import { adminPath, SITE_URL } from '@/lib/urls';
import { usdToIqd, useCommerceSettings } from '@/stores/commerce-settings-context';
import type { Order, Product, QuoteRequest } from '@/types';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'READY',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
] as const;

const QUOTE_STATUSES = [
  'PENDING',
  'REVIEWING',
  'QUOTED',
  'ACCEPTED',
  'REJECTED',
  'CLOSED',
] as const;

const PRODUCT_STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;

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
  hint,
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
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

type DashboardPreset = 'today' | '7d' | '30d' | 'month' | 'custom';

function toDateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildDashboardRange(
  preset: DashboardPreset,
  customFrom: string,
  customTo: string,
): { from?: string; to?: string; days?: number } {
  const today = toDateInputValue(new Date());
  if (preset === 'today') return { from: today, to: today };
  if (preset === '7d') return { days: 7 };
  if (preset === '30d') return { days: 30 };
  if (preset === 'month') return {};
  if (customFrom && customTo) return { from: customFrom, to: customTo };
  if (customFrom) return { from: customFrom, to: today };
  return { days: 30 };
}

export function AdminDashboardPage() {
  const { t, locale } = useI18n();
  const commerce = useCommerceSettings();
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const [preset, setPreset] = useState<DashboardPreset>('month');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [appliedCustom, setAppliedCustom] = useState({ from: '', to: '' });
  const rangeMenuRef = useRef<HTMLDivElement>(null);

  function formatDashMoney(amount: number | string | null | undefined, currency = 'USD') {
    const n = Number(amount ?? 0);
    const safe = Number.isFinite(n) ? n : 0;
    const src = (currency || 'USD').toUpperCase();
    if (commerce.displayCurrency === 'IQD') {
      const iqd = src === 'IQD' ? safe : usdToIqd(safe, commerce.usdToIqdRate);
      return formatMoney(iqd, 'IQD', moneyLocale);
    }
    return formatMoney(safe, src === 'IQD' ? 'IQD' : 'USD', moneyLocale);
  }

  useEffect(() => {
    if (!rangeOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (rangeMenuRef.current && !rangeMenuRef.current.contains(e.target as Node)) {
        setRangeOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setRangeOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [rangeOpen]);

  const rangeParams = buildDashboardRange(
    preset,
    preset === 'custom' ? appliedCustom.from : customFrom,
    preset === 'custom' ? appliedCustom.to : customTo,
  );

  const overview = useQuery({
    queryKey: ['dashboard-overview', rangeParams],
    queryFn: async () => (await dashboardApi.overview(rangeParams)).data,
  });
  const sales = useQuery({
    queryKey: ['dashboard-sales', rangeParams],
    queryFn: async () =>
      (await dashboardApi.sales(rangeParams)).data as {
        monthOrders: number;
        monthRevenue: number;
        completedOrders: number;
        completedRevenue: number;
        currency: string;
      },
  });
  const trend = useQuery({
    queryKey: ['dashboard-sales-trend', rangeParams],
    queryFn: async () => (await dashboardApi.salesTrend(rangeParams)).data,
  });
  const orderStats = useQuery({
    queryKey: ['dashboard-orders', rangeParams],
    queryFn: async () =>
      (await dashboardApi.orders(rangeParams)).data as {
        byStatus: { status: string; count: number }[];
      },
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

  const rangeLabel =
    overview.data?.range != null
      ? `${overview.data.range.from} → ${overview.data.range.to}`
      : null;

  const primaryCards = overview.data
    ? [
        {
          label: preset === 'month' ? t.admin.monthRevenue : t.admin.periodRevenue,
          value: formatDashMoney(
            overview.data.revenue.periodTotal ?? overview.data.revenue.monthTotal,
            overview.data.revenue.currency,
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
        {
          label: preset === 'today' ? t.admin.ordersToday : t.admin.ordersInPeriod,
          value: overview.data.orders.period ?? overview.data.orders.total,
          icon: CalendarDays,
        },
        { label: t.admin.products, value: overview.data.products.total, icon: Package },
        { label: t.admin.lowStock, value: overview.data.products.lowStock, icon: AlertTriangle },
        { label: t.admin.pendingQuotes, value: overview.data.quotes.pending, icon: Hourglass },
      ]
    : [];

  const visitorCards = overview.data?.visitors
    ? [
        {
          label: t.admin.storeVisitors,
          value: overview.data.visitors.store.period ?? overview.data.visitors.store.total,
          hint: `${overview.data.visitors.store.today} ${t.admin.rangeToday}`,
          icon: Store,
        },
        {
          label: t.admin.siteVisitors,
          value: overview.data.visitors.corporate.period ?? overview.data.visitors.corporate.total,
          hint: `${overview.data.visitors.corporate.today} ${t.admin.rangeToday}`,
          icon: Globe,
        },
      ]
    : [];

  const chartStatuses =
    orderStats.data?.byStatus.map((s) => ({
      status: statusLabel(locale, s.status),
      count: s.count,
    })) ?? [];

  const presets: { id: DashboardPreset; label: string }[] = [
    { id: 'today', label: t.admin.rangeToday },
    { id: '7d', label: t.admin.range7d },
    { id: '30d', label: t.admin.range30d },
    { id: 'month', label: t.admin.rangeMonth },
    { id: 'custom', label: t.admin.rangeCustom },
  ];

  return (
    <div className="space-y-8">
      <Seo title={t.admin.overviewTitle} path="/admin" />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            {t.admin.overviewTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.admin.overviewSub}
            {rangeLabel ? (
              <span className="ms-2 inline-block font-medium text-foreground tabular-nums">
                ({rangeLabel})
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={adminPath('products/new')} className="min-w-0 flex-1 sm:flex-none">
            <Button className="w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              {t.admin.addProduct}
            </Button>
          </Link>
          <Link to={adminPath('categories')} className="min-w-0 flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <FolderTree className="h-4 w-4" />
              {t.admin.categories}
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative w-full sm:w-auto" ref={rangeMenuRef}>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {t.admin.dateRange}
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full min-w-0 justify-between gap-2 sm:min-w-[12rem] sm:w-auto"
            aria-expanded={rangeOpen}
            aria-haspopup="listbox"
            onClick={() => setRangeOpen((o) => !o)}
          >
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {presets.find((p) => p.id === preset)?.label ?? t.admin.dateRange}
            </span>
            <ChevronDown
              className={cn('h-4 w-4 text-muted-foreground transition', rangeOpen && 'rotate-180')}
            />
          </Button>
          {rangeOpen ? (
            <div
              role="listbox"
              className="absolute start-0 z-40 mt-1.5 min-w-full overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg"
            >
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={preset === p.id}
                  onClick={() => {
                    setPreset(p.id);
                    setRangeOpen(false);
                    if (p.id === 'custom' && !customFrom) {
                      const to = toDateInputValue(new Date());
                      const fromDate = new Date();
                      fromDate.setDate(fromDate.getDate() - 6);
                      const from = toDateInputValue(fromDate);
                      setCustomFrom(from);
                      setCustomTo(to);
                      setAppliedCustom({ from, to });
                    }
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2 text-sm font-semibold transition',
                    preset === p.id
                      ? 'bg-accent/10 text-accent'
                      : 'text-foreground hover:bg-muted/60',
                  )}
                >
                  {p.label}
                  {preset === p.id ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {preset === 'custom' ? (
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-muted-foreground">
                {t.admin.rangeFrom}
              </label>
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-9 w-[10.5rem]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-muted-foreground">
                {t.admin.rangeTo}
              </label>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-9 w-[10.5rem]"
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="h-9"
              onClick={() => setAppliedCustom({ from: customFrom, to: customTo || customFrom })}
              disabled={!customFrom}
            >
              {t.admin.applyRange}
            </Button>
          </div>
        ) : null}

        <div className="w-full sm:w-auto">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {locale === 'ar' ? 'العملة' : 'Currency'}
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full min-w-0 gap-1.5 font-extrabold tabular-nums sm:w-auto sm:min-w-[7.5rem]"
            onClick={commerce.toggleDisplayCurrency}
            aria-label={
              commerce.displayCurrency === 'USD'
                ? t.currencyToggle.switchToIqd
                : t.currencyToggle.switchToUsd
            }
            title={
              commerce.displayCurrency === 'USD'
                ? t.currencyToggle.switchToIqd
                : t.currencyToggle.switchToUsd
            }
          >
            <span
              className={cn(
                commerce.displayCurrency === 'USD' ? 'text-accent' : 'text-muted-foreground opacity-45',
              )}
            >
              $
            </span>
            <span className="text-muted-foreground opacity-30">/</span>
            <span
              className={cn(
                commerce.displayCurrency === 'IQD' ? 'text-accent' : 'text-muted-foreground opacity-45',
              )}
            >
              د.ع
            </span>
          </Button>
        </div>
      </div>

      {overview.isLoading ? <LoadingState variant="dashboard" /> : null}
      {overview.isError ? (
        <p className="text-sm text-destructive">{t.admin.loadError}</p>
      ) : null}

      {!overview.isLoading ? (
      <>
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

      {visitorCards.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {visitorCards.map((c) => (
            <KpiCard key={c.label} label={c.label} value={c.value} icon={c.icon} hint={c.hint} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>{t.admin.revenueTrend}</CardTitle>
            <CardDescription>
              {rangeLabel ?? t.admin.revenueTrendSub}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trend.isLoading ? <LoadingState variant="chart" /> : null}
            {trend.data?.series ? (
              <RevenueTrendChart
                data={trend.data.series}
                displayCurrency={commerce.displayCurrency}
                usdToIqdRate={commerce.usdToIqdRate}
              />
            ) : null}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t.admin.ordersByStatus}</CardTitle>
          </CardHeader>
          <CardContent>
            {orderStats.isLoading ? <LoadingState variant="chart" /> : null}
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
            {sales.isLoading ? <LoadingState variant="inline" /> : null}
            {sales.data ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <dt className="text-sm text-muted-foreground">{t.admin.orders}</dt>
                  <dd className="mt-1 font-kpi text-2xl font-bold">{sales.data.monthOrders}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">{t.admin.monthRevenue}</dt>
                  <dd className="mt-1 font-kpi text-2xl font-bold">
                    {formatDashMoney(sales.data.monthRevenue, sales.data.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">{t.admin.completed}</dt>
                  <dd className="mt-1 font-kpi text-2xl font-bold">{sales.data.completedOrders}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">{t.admin.completedRevenue}</dt>
                  <dd className="mt-1 font-kpi text-2xl font-bold">
                    {formatDashMoney(sales.data.completedRevenue, sales.data.currency)}
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
                    {formatDashMoney(o.total, o.currency)}
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
      </>
      ) : null}
    </div>
  );
}

export function AdminProductsPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const query = useQuery({
    queryKey: ['admin-products', page, statusFilter],
    queryFn: async () =>
      (
        await catalogApi.productsAdmin({
          page,
          limit: 20,
          status: statusFilter || undefined,
        })
      ).data,
  });

  async function toggleActive(p: Product) {
    const next = p.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    if (next === 'ARCHIVED' && !window.confirm(t.admin.confirmDeactivate)) return;
    try {
      await catalogApi.updateProduct(p.id, { status: next });
      toast.success(next === 'ACTIVE' ? t.admin.productActivated : t.admin.productDeactivated);
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
    } catch {
      toast.error(t.admin.updateFailed);
    }
  }

  async function onDelete(p: Product) {
    if (!window.confirm(t.admin.confirmDeleteProduct)) return;
    try {
      await catalogApi.deleteProduct(p.id);
      toast.success(t.admin.productDeleted);
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
    } catch {
      toast.error(t.admin.deleteFailed);
    }
  }

  const products = query.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-fg sm:text-2xl">{t.admin.products}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.quickActions}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="w-full sm:w-40"
          >
            <option value="">{t.admin.allStatuses}</option>
            {PRODUCT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(locale, s)}
              </option>
            ))}
          </Select>
          <Link to={adminPath('categories')} className="min-w-0 flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <FolderTree className="h-4 w-4" />
              <span className="truncate">{t.admin.categories}</span>
            </Button>
          </Link>
          <Link to={adminPath('products/new')} className="min-w-0 flex-1 sm:flex-none">
            <Button className="w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="truncate">{t.admin.addProduct}</span>
            </Button>
          </Link>
        </div>
      </div>
      {query.isLoading ? <LoadingState variant="table" /> : null}

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {products.map((p) => {
          const thumb = p.images?.[0]?.url || p.imageUrl;
          return (
            <Card key={p.id} size="sm">
              <CardContent className="space-y-3 py-0">
                <div className="flex items-start gap-3">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted">
                    {thumb ? (
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={adminPath(`products/${p.id}`)}
                      className="line-clamp-2 font-semibold text-primary"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.sku} · {p.category?.name || t.admin.noCategory}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="font-kpi text-sm font-bold">
                        {formatMoney(p.price, p.currency, moneyLocale)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t.common.stock}: {p.stock}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <Link to={adminPath(`products/${p.id}`)}>
                    <Button variant="outline" size="sm" className="w-full gap-1 px-2">
                      <Pencil className="h-3.5 w-3.5" />
                      {t.admin.edit}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 px-2"
                    onClick={() => void toggleActive(p)}
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {p.status === 'ACTIVE' ? t.admin.deactivate : t.admin.activate}
                    </span>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full gap-1 px-2"
                    onClick={() => void onDelete(p)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.admin.delete}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop table */}
      <Card className="hidden overflow-hidden py-0 md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-start text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">{t.common.name}</th>
                  <th className="px-4 py-3 text-start">{t.common.sku}</th>
                  <th className="hidden px-4 py-3 text-start lg:table-cell">{t.admin.category}</th>
                  <th className="px-4 py-3 text-start">{t.common.price}</th>
                  <th className="px-4 py-3 text-start">{t.common.stock}</th>
                  <th className="px-4 py-3 text-start">{t.common.status}</th>
                  <th className="px-4 py-3 text-start">{t.admin.actions}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const thumb = p.images?.[0]?.url || p.imageUrl;
                  return (
                    <tr key={p.id} className="border-b border-border hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link
                          to={adminPath(`products/${p.id}`)}
                          className="flex items-center gap-3 font-medium text-primary hover:underline"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted">
                            {thumb ? (
                              <img src={thumb} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </span>
                          <span className="line-clamp-2 max-w-[14rem]">{p.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{p.sku}</td>
                      <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                        {p.category?.name || t.admin.noCategory}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatMoney(p.price, p.currency, moneyLocale)}
                      </td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-nowrap gap-1.5">
                          <Link to={adminPath(`products/${p.id}`)}>
                            <Button variant="outline" size="sm" className="gap-1.5" title={t.admin.edit}>
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="hidden xl:inline">{t.admin.edit}</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            title={p.status === 'ACTIVE' ? t.admin.deactivate : t.admin.activate}
                            onClick={() => void toggleActive(p)}
                          >
                            <Power className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">
                              {p.status === 'ACTIVE' ? t.admin.deactivate : t.admin.activate}
                            </span>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="gap-1.5"
                            title={t.admin.delete}
                            onClick={() => void onDelete(p)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">{t.admin.delete}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {!query.isLoading && !products.length ? (
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


export { AdminProductFormPage } from './AdminProductFormPage';

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

      {list.isLoading ? <LoadingState variant="table" /> : null}
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
  const orders = query.data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-fg sm:text-2xl">{t.admin.orders}</h1>
      {query.isLoading ? <LoadingState variant="table" /> : null}

      <div className="space-y-3 md:hidden">
        {orders.map((o) => (
          <Link key={o.id} to={adminPath(`orders/${o.id}`)} className="block">
            <Card size="sm">
              <CardContent className="space-y-2 py-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-primary">{o.orderNumber}</p>
                    <p className="mt-1 truncate text-sm">
                      {o.customer?.firstName} {o.customer?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.customer?.phone || o.customer?.email || '—'}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-kpi font-bold">
                    {formatMoney(o.total, o.currency, moneyLocale)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="hidden overflow-hidden py-0 md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">{t.common.order}</th>
                  <th className="px-4 py-3 text-start">{t.common.customer}</th>
                  <th className="hidden px-4 py-3 text-start lg:table-cell">{t.admin.phone}</th>
                  <th className="px-4 py-3 text-start">{t.common.total}</th>
                  <th className="px-4 py-3 text-start">{t.common.status}</th>
                  <th className="hidden px-4 py-3 text-start xl:table-cell">{t.admin.orderDate}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        className="font-medium text-primary hover:underline"
                        to={adminPath(`orders/${o.id}`)}
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p>
                          {o.customer?.firstName} {o.customer?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{o.customer?.email}</p>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {o.customer?.phone || '—'}
                    </td>
                    <td className="px-4 py-3 font-kpi font-semibold whitespace-nowrap">
                      {formatMoney(o.total, o.currency, moneyLocale)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                      {new Date(o.createdAt).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Pagination
        page={query.data?.meta.page ?? 1}
        totalPages={query.data?.meta.totalPages ?? 1}
        onChange={setPage}
      />
    </div>
  );
}

export function AdminOrderDetailPage() {
  const { t, locale, dir } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const order = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => (await ordersApi.get(id)).data as Order,
  });
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');

  if (order.isLoading) return <LoadingState variant="page" />;
  if (!order.data) return <EmptyState title={t.admin.orderNotFound} />;

  const o = order.data;
  const subtotal = Number(o.subtotal ?? 0);
  const discount = Number(o.discount ?? 0);
  const shipping = Number(o.shipping ?? 0);

  async function saveStatus() {
    try {
      await ordersApi.updateStatus(id, status || o.status, note || undefined);
      toast.success(t.admin.statusUpdated);
      setNote('');
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin-order', id] }),
        qc.invalidateQueries({ queryKey: ['admin-orders'] }),
        qc.invalidateQueries({ queryKey: ['dashboard-overview'] }),
        qc.invalidateQueries({ queryKey: ['dashboard-orders'] }),
        qc.invalidateQueries({ queryKey: ['store-order'] }),
        qc.invalidateQueries({ queryKey: ['store-my-orders'] }),
      ]);
    } catch {
      toast.error(t.admin.updateFailed);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link to={adminPath('orders')}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <BackIcon className="h-4 w-4" />
              {t.admin.back}
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-fg sm:text-2xl">
            {t.admin.orderDetail} {o.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.admin.orderDate}:{' '}
            {new Date(o.createdAt).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={o.status} />
          {o.paymentStatus ? <StatusBadge status={o.paymentStatus} /> : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.admin.orderItems}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:hidden">
            {(o.items ?? []).map((item, idx) => (
              <div
                key={item.id || idx}
                className="border border-border p-3 text-sm"
              >
                <p className="font-medium">{item.productName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.sku} · ×{item.quantity}
                </p>
                <div className="mt-2 flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {formatMoney(item.unitPrice ?? 0, o.currency, moneyLocale)}
                  </span>
                  <span className="font-kpi font-semibold">
                    {formatMoney(item.lineTotal ?? 0, o.currency, moneyLocale)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
          <CardContent className="hidden p-0 sm:block">
            <div className="overflow-x-auto">
              <table className="min-w-[560px] w-full text-sm">
                <thead className="border-y border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-start">{t.common.name}</th>
                    <th className="px-4 py-3 text-start">{t.common.sku}</th>
                    <th className="px-4 py-3 text-start">{t.common.qty}</th>
                    <th className="px-4 py-3 text-start">{t.admin.unitPrice}</th>
                    <th className="px-4 py-3 text-start">{t.admin.lineTotal}</th>
                  </tr>
                </thead>
                <tbody>
                  {(o.items ?? []).map((item, idx) => (
                    <tr key={item.id || idx} className="border-b border-border">
                      <td className="px-4 py-3 font-medium">{item.productName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.sku}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">
                        {formatMoney(item.unitPrice ?? 0, o.currency, moneyLocale)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {formatMoney(item.lineTotal ?? 0, o.currency, moneyLocale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.admin.grandTotal}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t.admin.subtotal}</span>
              <span className="font-kpi font-semibold">
                {formatMoney(subtotal || o.total, o.currency, moneyLocale)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t.admin.discount}</span>
              <span className="font-kpi">
                âˆ’{formatMoney(discount, o.currency, moneyLocale)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t.admin.shippingCost}</span>
              <span className="font-kpi">{formatMoney(shipping, o.currency, moneyLocale)}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-border pt-3 text-base">
              <span className="font-semibold">{t.admin.grandTotal}</span>
              <span className="font-kpi text-lg font-bold">
                {formatMoney(o.total, o.currency, moneyLocale)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.admin.paymentStatus}: {statusLabel(locale, o.paymentStatus || 'UNPAID')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.common.customer}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold">
              {o.customer?.firstName} {o.customer?.lastName}
            </p>
            {o.customer?.company ? (
              <p>
                {t.admin.company}: {o.customer.company}
              </p>
            ) : null}
            {o.customer?.email ? <p>{o.customer.email}</p> : null}
            {o.customer?.phone ? <p>{o.customer.phone}</p> : null}
            {o.shippingAddress ? (
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t.admin.shippingAddress}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{o.shippingAddress}</p>
              </div>
            ) : null}
            {o.billingAddress ? (
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t.admin.billingAddress}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{o.billingAddress}</p>
              </div>
            ) : null}
            {o.notes ? (
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t.admin.customerNotes}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{o.notes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.admin.updateStatus}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={status || o.status} onChange={(e) => setStatus(e.target.value)}>
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
            />
            <Button onClick={() => void saveStatus()}>{t.admin.updateStatus}</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.statusHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          {(o.history ?? []).length ? (
            <ol className="space-y-3">
              {(o.history ?? []).map((h) => (
                <li
                  key={h.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-sm last:border-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {h.fromStatus ? <StatusBadge status={h.fromStatus} /> : null}
                    <span className="text-muted-foreground">â†’</span>
                    <StatusBadge status={h.toStatus} />
                    {h.note ? <span className="text-muted-foreground">· {h.note}</span> : null}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(h.createdAt).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">{t.admin.noHistory}</p>
          )}
        </CardContent>
      </Card>
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
      {query.isLoading ? <LoadingState variant="table" /> : null}
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
  if (customer.isLoading) return <LoadingState variant="page" />;
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
  const { t, locale, dir } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const quote = useQuery({
    queryKey: ['admin-quote', id],
    queryFn: async () => (await quotesApi.get(id)).data as QuoteRequest,
  });
  const [status, setStatus] = useState('');
  const [quotedAmount, setQuotedAmount] = useState('');
  const [validUntil, setValidUntil] = useState('');

  if (quote.isLoading) return <LoadingState variant="page" />;
  if (!quote.data) return <EmptyState title={t.admin.quoteNotFound} />;

  const q = quote.data;

  async function saveQuote() {
    try {
      await quotesApi.updateStatus(id, {
        status: status || q.status,
        quotedAmount: quotedAmount !== '' ? Number(quotedAmount) : undefined,
        validUntil: validUntil || undefined,
      });
      toast.success(t.admin.quoteUpdated);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin-quote', id] }),
        qc.invalidateQueries({ queryKey: ['admin-quotes'] }),
        qc.invalidateQueries({ queryKey: ['store-my-quotes'] }),
      ]);
    } catch {
      toast.error(t.admin.updateFailed);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link to={adminPath('quotes')}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <BackIcon className="h-4 w-4" />
              {t.admin.back}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-fg">
            {t.admin.quoteDetail} {q.quoteNumber}
          </h1>
          {q.createdAt ? (
            <p className="text-sm text-muted-foreground">
              {new Date(q.createdAt).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
            </p>
          ) : null}
        </div>
        <StatusBadge status={q.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.admin.quoteItems}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(q.items ?? []).map((item) => {
              const thumb =
                item.product?.images?.[0]?.url || item.product?.imageUrl || null;
              return (
                <div
                  key={item.id || item.productId}
                  className="flex flex-wrap items-center gap-3 border border-border p-3"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted">
                    {thumb ? (
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.product?.name || item.productId}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.product?.sku || '—'} · ×{item.quantity}
                    </p>
                  </div>
                  {item.product?.price != null ? (
                    <p className="font-kpi text-sm font-semibold">
                      {formatMoney(item.product.price, item.product.currency || 'USD', moneyLocale)}
                    </p>
                  ) : null}
                </div>
              );
            })}
            {q.message ? (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t.admin.quoteMessage}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{q.message}</p>
              </div>
            ) : null}
            {(q.attachments ?? []).length ? (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t.admin.attachments}
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {(q.attachments ?? []).map((a) => (
                    <li key={a.id}>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        {a.fileName || a.name || a.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.common.customer}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-semibold">
                {q.customer?.firstName || q.firstName} {q.customer?.lastName || q.lastName}
              </p>
              {(q.customer?.company || q.company) ? (
                <p>
                  {t.admin.company}: {q.customer?.company || q.company}
                </p>
              ) : null}
              {(q.customer?.email || q.email) ? <p>{q.customer?.email || q.email}</p> : null}
              {(q.customer?.phone || q.phone) ? <p>{q.customer?.phone || q.phone}</p> : null}
              {(q.customer?.city || q.city) ? <p>{q.customer?.city || q.city}</p> : null}
              {(q.customer?.address || q.address) ? (
                <p className="whitespace-pre-wrap">{q.customer?.address || q.address}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.admin.updateQuote}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={status || q.status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {QUOTE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(locale, s)}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                step="0.01"
                placeholder={t.admin.quotedAmount}
                value={
                  quotedAmount !== ''
                    ? quotedAmount
                    : q.quotedAmount != null
                      ? String(q.quotedAmount)
                      : ''
                }
                onChange={(e) => setQuotedAmount(e.target.value)}
              />
              <Input
                type="date"
                placeholder={t.admin.validUntil}
                value={
                  validUntil ||
                  (q.validUntil ? String(q.validUntil).slice(0, 10) : '')
                }
                onChange={(e) => setValidUntil(e.target.value)}
              />
              {q.quotedAmount != null ? (
                <p className="font-kpi text-lg font-bold">
                  {formatMoney(q.quotedAmount, q.currency || 'USD', moneyLocale)}
                </p>
              ) : null}
              <Button onClick={() => void saveQuote()}>{t.admin.updateQuote}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
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

  if (ticket.isLoading) return <LoadingState variant="page" />;
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
      {list.isLoading ? <LoadingState variant="table" /> : null}
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

const emptyServiceForm = {
  name: '',
  nameAr: '',
  shortDescription: '',
  shortDescriptionAr: '',
  description: '',
  descriptionAr: '',
};

export function AdminServicesPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyServiceForm);

  const list = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => (await adminCmsApi.services()).data,
  });

  function startEdit(row: CmsService) {
    setEditingId(row.id);
    setForm({
      name: row.name ?? '',
      nameAr: row.nameAr ?? '',
      shortDescription: row.shortDescription ?? '',
      shortDescriptionAr: row.shortDescriptionAr ?? '',
      description: row.description ?? '',
      descriptionAr: row.descriptionAr ?? '',
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    try {
      await adminCmsApi.updateService(editingId, form);
      toast.success(t.admin.serviceUpdated);
      setEditingId(null);
      setForm(emptyServiceForm);
      await qc.invalidateQueries({ queryKey: ['admin-services'] });
      await qc.invalidateQueries({ queryKey: ['services'] });
    } catch {
      toast.error(t.admin.saveFailed);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-fg">{t.admin.services}</h1>
      <p className="text-sm text-muted">{t.admin.servicesBilingualHint}</p>

      {editingId ? (
        <form onSubmit={save} className="surface grid gap-3 p-4 md:grid-cols-2">
          <p className="md:col-span-2 text-sm font-bold text-fg">{t.admin.editService}</p>
          <Input
            placeholder={t.admin.nameEn}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            placeholder={t.admin.nameAr}
            value={form.nameAr}
            onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
            dir="rtl"
          />
          <Textarea
            className="md:col-span-1"
            placeholder={t.admin.shortDescriptionEn}
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            rows={3}
          />
          <Textarea
            className="md:col-span-1"
            placeholder={t.admin.shortDescriptionAr}
            value={form.shortDescriptionAr}
            onChange={(e) => setForm({ ...form, shortDescriptionAr: e.target.value })}
            rows={3}
            dir="rtl"
          />
          <Textarea
            className="md:col-span-1"
            placeholder={t.admin.descriptionEn}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
          />
          <Textarea
            className="md:col-span-1"
            placeholder={t.admin.descriptionAr}
            value={form.descriptionAr}
            onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
            rows={5}
            dir="rtl"
          />
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">{t.common.save}</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyServiceForm);
              }}
            >
              {t.admin.back}
            </Button>
          </div>
        </form>
      ) : null}

      {list.isLoading ? <LoadingState variant="table" /> : null}
      <div className="space-y-2">
        {(list.data ?? []).map((row) => (
          <div
            key={row.id}
            className="surface flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
          >
            <span>
              {row.name}
              {row.nameAr ? ` · ${row.nameAr}` : ''} · {row.slug} ·{' '}
              <StatusBadge status={String(row.status || 'DRAFT')} />
            </span>
            <Button type="button" size="sm" variant="secondary" onClick={() => startEdit(row)}>
              <Pencil className="me-1.5 h-3.5 w-3.5" />
              {t.admin.edit}
            </Button>
          </div>
        ))}
      </div>
    </div>
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

function parseExchangeRate(raw: string) {
  const normalized = raw
    .trim()
    .replace(/[Ù¬ï¼Œ]/g, '')
    .replace(/[Ù«]/g, '.')
    .replace(/,/g, '')
    .replace(/[Ù -Ù©]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[Û°-Û¹]/g, (d) => String('Û°Û±Û²Û³Û´ÛµÛ¶Û·Û¸Û¹'.indexOf(d)));
  const value = Number(normalized);
  return value;
}

export function AdminSettingsPage() {
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const [rate, setRate] = useState('');
  const [enableIqd, setEnableIqd] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  const settings = useQuery({
    queryKey: ['admin-commerce-settings'],
    queryFn: async () => (await settingsApi.commerceAdmin()).data,
  });

  useEffect(() => {
    if (!settings.data || hydrated) return;
    const n = Number(settings.data.usdToIqdRate);
    setRate(Number.isFinite(n) ? String(n) : '');
    setEnableIqd(Boolean(settings.data.enableIqdDisplay));
    setHydrated(true);
  }, [settings.data, hydrated]);

  async function saveCommerce(e: React.FormEvent) {
    e.preventDefault();
    const usdToIqdRate = parseExchangeRate(rate);
    if (!Number.isFinite(usdToIqdRate) || usdToIqdRate < 1) {
      toast.error(t.admin.exchangeRateInvalid);
      return;
    }
    setSaving(true);
    try {
      const { data } = await settingsApi.updateCommerce({
        usdToIqdRate,
        enableIqdDisplay: enableIqd,
      });
      const saved = Number(data.usdToIqdRate);
      setRate(Number.isFinite(saved) ? String(saved) : String(usdToIqdRate));
      setEnableIqd(Boolean(data.enableIqdDisplay));
      toast.success(t.admin.settingsSaved);
      await qc.invalidateQueries({ queryKey: ['admin-commerce-settings'] });
      await qc.invalidateQueries({ queryKey: ['commerce-settings'] });
    } catch {
      toast.error(t.admin.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-fg">{t.admin.settings}</h1>
        <p className="mt-1 text-sm text-muted">{t.admin.settingsBlurb}</p>
      </div>

      <form onSubmit={saveCommerce} className="surface max-w-lg space-y-4 p-4">
        <h2 className="text-lg font-bold text-fg">{t.admin.commerceSettings}</h2>
        <p className="text-sm text-muted">{t.admin.commerceSettingsHint}</p>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
            {t.admin.usdToIqdRate}
          </label>
          <Input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            dir="ltr"
            className="font-kpi tabular-nums"
            placeholder={locale === 'ar' ? 'مثال: 1480' : 'e.g. 1480'}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-muted">{t.admin.usdToIqdHint}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-fg">
          <input
            type="checkbox"
            checked={enableIqd}
            onChange={(e) => setEnableIqd(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent"
          />
          {t.admin.enableIqdDisplay}
        </label>
        <Button type="submit" disabled={settings.isLoading || saving}>
          {saving ? (locale === 'ar' ? 'جاري الحفظ…' : 'Saving…') : t.common.save}
        </Button>
      </form>

      <Button
        variant="secondary"
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
