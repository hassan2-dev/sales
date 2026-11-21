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
  Phone,
  Mail,
  Plus,
  ArrowLeft,
  ArrowRight,
  FolderTree,
  Trash2,
  ImageIcon,
  Power,
  ChevronDown,
  Check,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { PersonAvatar } from '@/components/admin/PersonAvatar';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoadingState, EmptyState, Pagination } from '@/components/ui/States';
import { PageHeader, StudioHero } from '@/components/admin/FormStudio';
import { confirmAction } from '@/components/admin/confirm';
import { Field } from '@/components/admin/Field';
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
  rolesApi,
  auditApi,
} from '@/services/endpoints';
import { cn, formatMoney } from '@/lib/cn';
import { adminPath, SITE_URL } from '@/lib/urls';
import { usdToIqd, useCommerceSettings } from '@/stores/commerce-settings-context';
import type { Customer, Order, Product, QuoteRequest, SupportTicket } from '@/types';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'READY',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
] as const;

const TICKET_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'WAITING_FOR_CUSTOMER',
  'RESOLVED',
  'CLOSED',
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
      <div className="absolute inset-e-4 top-4 z-20 flex items-center gap-1">
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
            className="w-full min-w-0 justify-between gap-2 sm:min-w-48 sm:w-auto"
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

const productIconBtn =
  'h-8 w-8 shrink-0 rounded-lg border border-transparent p-0 text-muted-foreground shadow-none hover:translate-y-0 hover:border-border hover:bg-muted hover:text-fg';

function CategoryThumb({ url }: { url?: string | null }) {
  return (
    <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
      )}
    </span>
  );
}

function CategoryRowActions({
  editTo,
  editLabel,
  deleteLabel,
  onDelete,
}: {
  editTo: string;
  editLabel: string;
  deleteLabel: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link to={editTo}>
        <Button variant="ghost" size="sm" className={productIconBtn} title={editLabel}>
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        className={cn(productIconBtn, 'text-red-600 hover:bg-red-50 hover:text-red-700')}
        title={deleteLabel}
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
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
    if (
      next === 'ARCHIVED' &&
      !(await confirmAction({
        title: t.admin.deactivate,
        description: t.admin.confirmDeactivate,
        confirmLabel: t.admin.deactivate,
        cancelLabel: t.admin.cancel,
      }))
    ) {
      return;
    }
    try {
      await catalogApi.updateProduct(p.id, { status: next });
      toast.success(next === 'ACTIVE' ? t.admin.productActivated : t.admin.productDeactivated);
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
    } catch {
      toast.error(t.admin.updateFailed);
    }
  }

  async function onDelete(p: Product) {
    if (
      !(await confirmAction({
        title: t.admin.delete,
        description: t.admin.confirmDeleteProduct,
        confirmLabel: t.admin.delete,
        cancelLabel: t.admin.cancel,
        danger: true,
      }))
    ) {
      return;
    }
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
      <PageHeader
        eyebrow={t.admin.groupSales}
        title={t.admin.products}
        actions={
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
        }
      />
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
                      to={adminPath(`products/${p.id}/edit`)}
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
                <div className="flex items-center justify-end gap-1 border-t border-border pt-2">
                  <Link to={adminPath(`products/${p.id}/edit`)}>
                    <Button variant="ghost" size="sm" className={productIconBtn} title={t.admin.edit}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={productIconBtn}
                    title={p.status === 'ACTIVE' ? t.admin.deactivate : t.admin.activate}
                    onClick={() => void toggleActive(p)}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(productIconBtn, 'text-red-600 hover:bg-red-50 hover:text-red-700')}
                    title={t.admin.delete}
                    onClick={() => void onDelete(p)}
                  >
                    <Trash2 className="h-4 w-4" />
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
            <table className="w-full text-start text-sm">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">{t.common.name}</th>
                  <th className="hidden px-4 py-3 text-start lg:table-cell">{t.admin.category}</th>
                  <th className="px-4 py-3 text-end">{t.common.price}</th>
                  <th className="px-4 py-3 text-end">{t.common.stock}</th>
                  <th className="px-4 py-3 text-start">{t.common.status}</th>
                  <th className="px-4 py-3 text-end">{t.admin.actions}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const thumb = p.images?.[0]?.url || p.imageUrl;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link
                          to={adminPath(`products/${p.id}/edit`)}
                          className="flex items-center gap-3"
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                            {thumb ? (
                              <img src={thumb} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="line-clamp-1 block font-medium text-fg hover:text-primary">
                              {p.name}
                            </span>
                            <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                              {p.sku}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                        {p.category?.name || t.admin.noCategory}
                      </td>
                      <td className="px-4 py-3 text-end font-medium tabular-nums whitespace-nowrap">
                        {formatMoney(p.price, p.currency, moneyLocale)}
                      </td>
                      <td
                        className={cn(
                          'px-4 py-3 text-end tabular-nums',
                          p.stock <= 0 ? 'font-semibold text-red-600' : 'text-fg',
                        )}
                      >
                        {p.stock}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={adminPath(`products/${p.id}/edit`)}>
                            <Button variant="ghost" size="sm" className={productIconBtn} title={t.admin.edit}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={productIconBtn}
                            title={p.status === 'ACTIVE' ? t.admin.deactivate : t.admin.activate}
                            onClick={() => void toggleActive(p)}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(productIconBtn, 'text-red-600 hover:bg-red-50 hover:text-red-700')}
                            title={t.admin.delete}
                            onClick={() => void onDelete(p)}
                          >
                            <Trash2 className="h-4 w-4" />
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


export function AdminCategoriesPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await catalogApi.categoriesAdmin()).data,
  });

  async function onDelete(id: string) {
    if (
      !(await confirmAction({
        title: t.admin.delete,
        description: t.admin.confirmDeleteCategory,
        confirmLabel: t.admin.delete,
        cancelLabel: t.admin.cancel,
        danger: true,
      }))
    ) {
      return;
    }
    try {
      await catalogApi.deleteCategory(id);
      toast.success(t.admin.categoryDeleted);
      await qc.invalidateQueries({ queryKey: ['admin-categories'] });
    } catch {
      toast.error(t.admin.deleteFailed);
    }
  }

  const rows = list.data ?? [];
  const childrenByParent = new Map<string, typeof rows>();
  const roots = rows.filter((row) => !row.parentId);
  for (const row of rows) {
    if (!row.parentId) continue;
    const bucket = childrenByParent.get(row.parentId) ?? [];
    bucket.push(row);
    childrenByParent.set(row.parentId, bucket);
  }
  const seen = new Set<string>();
  const ordered: { row: (typeof rows)[number]; depth: number }[] = [];
  for (const root of roots) {
    seen.add(root.id);
    ordered.push({ row: root, depth: 0 });
    for (const child of childrenByParent.get(root.id) ?? []) {
      seen.add(child.id);
      ordered.push({ row: child, depth: 1 });
    }
  }
  for (const row of rows) {
    if (!seen.has(row.id)) ordered.push({ row, depth: row.parentId ? 1 : 0 });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.admin.groupSales}
        title={t.admin.categories}
        description={t.admin.categoriesListHint}
        actions={
          <Link to={adminPath('categories/new')}>
            <Button className="w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              {t.admin.addCategory}
            </Button>
          </Link>
        }
      />

      {list.isLoading ? <LoadingState variant="table" /> : null}

      <div className="space-y-3 md:hidden">
        {ordered.map(({ row, depth }) => (
          <Card key={row.id} size="sm" className={depth ? 'ms-4' : undefined}>
            <CardContent className="flex items-center gap-3 py-0">
              <CategoryThumb url={row.imageUrl} />
              <div className="min-w-0 flex-1">
                <Link
                  to={adminPath(`categories/${row.id}/edit`)}
                  className="line-clamp-1 font-semibold text-fg"
                >
                  {row.name}
                </Link>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {row.parent?.name ? `${row.parent.name} · ` : ''}
                  {row._count?.products ?? 0} {t.admin.products}
                </p>
              </div>
              <StatusBadge status={String(row.status || 'PUBLISHED')} />
              <CategoryRowActions
                editTo={adminPath(`categories/${row.id}/edit`)}
                editLabel={t.admin.edit}
                deleteLabel={t.admin.delete}
                onDelete={() => void onDelete(row.id)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="hidden overflow-hidden py-0 md:block">
        <CardContent className="p-0">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">{t.admin.category}</th>
                <th className="px-4 py-3 text-end">{t.admin.products}</th>
                <th className="px-4 py-3 text-start">{t.common.status}</th>
                <th className="px-4 py-3 text-end">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map(({ row, depth }) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      to={adminPath(`categories/${row.id}/edit`)}
                      className="flex items-center gap-3"
                      style={{ paddingInlineStart: depth ? '1.75rem' : undefined }}
                    >
                      <CategoryThumb url={row.imageUrl} />
                      <span className="min-w-0">
                        <span className="line-clamp-1 block font-medium text-fg">{row.name}</span>
                        <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                          {row.description || row.slug}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-end tabular-nums text-muted-foreground">
                    {row._count?.products ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={String(row.status || 'PUBLISHED')} />
                  </td>
                  <td className="px-4 py-3">
                    <CategoryRowActions
                      editTo={adminPath(`categories/${row.id}/edit`)}
                      editLabel={t.admin.edit}
                      deleteLabel={t.admin.delete}
                      onDelete={() => void onDelete(row.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {!list.isLoading && !rows.length ? (
        <EmptyState
          title={t.admin.emptyList}
          action={{
            label: t.admin.addCategory,
            onClick: () => navigate(adminPath('categories/new')),
          }}
        />
      ) : null}
    </div>
  );
}

export function AdminOrdersPage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const dateLocale = locale === 'ar' ? 'ar-IQ' : 'en-GB';
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const query = useQuery({
    queryKey: ['admin-orders', page, statusFilter, search],
    queryFn: async () =>
      (
        await ordersApi.list({
          page,
          limit: 20,
          status: statusFilter || undefined,
          search: search || undefined,
        })
      ).data,
  });
  const orders = query.data?.data ?? [];
  const counts = query.data?.meta.statusCounts ?? {};
  const allCount = ORDER_STATUSES.reduce((sum, status) => sum + (counts[status] ?? 0), 0);
  const OpenIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  function pickStatus(next: string) {
    setStatusFilter(next);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.admin.groupSales}
        title={t.admin.orders}
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.admin.searchOrders}
              className="ps-9"
            />
          </div>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => pickStatus('')}
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
            statusFilter === ''
              ? 'border-accent bg-accent text-white'
              : 'border-border bg-card text-muted-foreground hover:text-fg',
          )}
        >
          {t.admin.allStatuses}
          <span className="tabular-nums">{allCount}</span>
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => pickStatus(status)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
              statusFilter === status
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-card text-muted-foreground hover:text-fg',
            )}
          >
            {statusLabel(locale, status)}
            <span className="tabular-nums">{counts[status] ?? 0}</span>
          </button>
        ))}
      </div>

      {query.isLoading ? <LoadingState variant="table" /> : null}

      <div className="space-y-3 md:hidden">
        {orders.map((o) => {
          const count = o._count?.items ?? o.items?.length ?? 0;
          return (
            <Link key={o.id} to={adminPath(`orders/${o.id}`)} className="block">
              <Card size="sm">
                <CardContent className="space-y-2 py-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-fg">{o.orderNumber}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString(dateLocale, {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="truncate text-sm">
                    {o.customer?.firstName} {o.customer?.lastName}
                    <span className="ltr-isolate text-muted-foreground" dir="ltr">
                      {' '}
                      · {o.customer?.phone || o.customer?.email || '—'}
                    </span>
                  </p>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium tabular-nums">
                      {formatMoney(o.total, o.currency, moneyLocale)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {count} {t.admin.orderItems}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="hidden overflow-hidden py-0 md:block">
        <CardContent className="p-0">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">{t.common.order}</th>
                <th className="px-4 py-3 text-start">{t.common.customer}</th>
                <th className="px-4 py-3 text-end">{t.admin.orderItems}</th>
                <th className="px-4 py-3 text-end">{t.common.total}</th>
                <th className="px-4 py-3 text-start">{t.common.status}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const count = o._count?.items ?? o.items?.length ?? 0;
                const firstItem = o.items?.[0]?.productName;
                return (
                  <tr
                    key={o.id}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30"
                    onClick={() => navigate(adminPath(`orders/${o.id}`))}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-fg">{o.orderNumber}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString(dateLocale, {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <PersonAvatar
                          size="sm"
                          name={`${o.customer?.firstName ?? ''} ${o.customer?.lastName ?? ''}`}
                        />
                        <div className="min-w-0">
                          <p className="line-clamp-1">
                            {o.customer?.firstName} {o.customer?.lastName}
                          </p>
                          <p className="ltr-isolate truncate text-xs text-muted-foreground" dir="ltr">
                            {o.customer?.phone || o.customer?.email || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <p className="tabular-nums">{count}</p>
                      {firstItem ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{firstItem}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-end font-medium tabular-nums whitespace-nowrap">
                      {formatMoney(o.total, o.currency, moneyLocale)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-end text-muted-foreground">
                      <OpenIcon className="ms-auto h-4 w-4" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {!query.isLoading && !orders.length ? <EmptyState title={t.admin.emptyList} /> : null}
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

  const when = new Date(o.createdAt).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB');
  const HistoryArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const customerName = [o.customer?.firstName, o.customer?.lastName].filter(Boolean).join(' ');

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <StudioHero
        backTo={adminPath('orders')}
        backLabel={t.admin.back}
        eyebrow={t.admin.orderDetail}
        title={o.orderNumber}
        meta={`${t.admin.orderDate}: ${when}`}
        dir={dir}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={o.status} />
            {o.paymentStatus ? <StatusBadge status={o.paymentStatus} /> : null}
          </div>
        }
      />

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
                -{formatMoney(discount, o.currency, moneyLocale)}
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

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center gap-3">
            <PersonAvatar name={customerName} />
            <CardTitle>{customerName || t.common.customer}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <dl>
              <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[9.5rem_1fr]">
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {t.common.name}
                </dt>
                <dd className="text-sm font-semibold text-fg">{customerName || '—'}</dd>
              </div>
              {o.customer?.company ? (
                <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[9.5rem_1fr]">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {t.admin.company}
                  </dt>
                  <dd className="text-sm text-fg">{o.customer.company}</dd>
                </div>
              ) : null}
              {o.customer?.email ? (
                <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[9.5rem_1fr]">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {t.common.email}
                  </dt>
                  <dd className="ltr-isolate text-sm text-fg" dir="ltr">
                    {o.customer.email}
                  </dd>
                </div>
              ) : null}
              {o.customer?.phone ? (
                <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[9.5rem_1fr]">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {t.admin.phone}
                  </dt>
                  <dd className="ltr-isolate text-sm text-fg" dir="ltr">
                    {o.customer.phone}
                  </dd>
                </div>
              ) : null}
              {o.shippingAddress ? (
                <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[9.5rem_1fr]">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {t.admin.shippingAddress}
                  </dt>
                  <dd className="whitespace-pre-wrap text-sm text-fg">{o.shippingAddress}</dd>
                </div>
              ) : null}
              {o.billingAddress ? (
                <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[9.5rem_1fr]">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {t.admin.billingAddress}
                  </dt>
                  <dd className="whitespace-pre-wrap text-sm text-fg">{o.billingAddress}</dd>
                </div>
              ) : null}
              {o.notes ? (
                <div className="grid gap-1 py-3 sm:grid-cols-[9.5rem_1fr]">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {t.admin.customerNotes}
                  </dt>
                  <dd className="whitespace-pre-wrap text-sm text-fg">{o.notes}</dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.admin.updateStatus}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label={t.common.status}>
              <Select value={status || o.status} onChange={(e) => setStatus(e.target.value)}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(locale, s)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.admin.internalNote}>
              <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <Button className="w-full" onClick={() => void saveStatus()}>
              {t.admin.updateStatus}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.statusHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          {(o.history ?? []).length ? (
            <ol className="space-y-0">
              {(o.history ?? []).map((h, index) => (
                <li key={h.id} className="grid grid-cols-[1.25rem_1fr] gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                    {index < (o.history?.length ?? 0) - 1 ? (
                      <span className="mt-1 w-px flex-1 bg-border" />
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4 pt-0.5 last:border-0">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {h.fromStatus ? (
                          <>
                            <StatusBadge status={h.fromStatus} />
                            <HistoryArrow className="h-3.5 w-3.5 text-muted-foreground" />
                          </>
                        ) : null}
                        <StatusBadge status={h.toStatus} />
                      </div>
                      {h.note ? <p className="text-sm text-muted-foreground">{h.note}</p> : null}
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {new Date(h.createdAt).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
                    </time>
                  </div>
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
      if (data && typeof data === 'object') {
        const record = data as { data?: unknown; items?: unknown };
        if (Array.isArray(record.data)) return record.data;
        if (Array.isArray(record.items)) return record.items;
      }
      return [];
    },
  });
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        actions={
          newPath ? (
            <Link to={newPath}>
              <Button>{t.common.create}</Button>
            </Link>
          ) : null
        }
      />
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

function customerEmail(email?: string | null) {
  if (!email || email.endsWith('@customers.local')) return '';
  return email;
}

export function AdminCustomersPage() {
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [activity, setActivity] = useState('');
  const [account, setAccount] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const query = useQuery({
    queryKey: ['admin-customers', page, activity, account, search],
    queryFn: async () =>
      (
        await customersApi.list({
          page,
          limit: 20,
          search: search || undefined,
          activity: activity || undefined,
          account: account || undefined,
        })
      ).data,
  });

  const payload = query.data;
  const customers: Customer[] = Array.isArray(payload) ? payload : (payload?.data ?? []);
  const meta = payload && !Array.isArray(payload) ? payload.meta : undefined;
  const facets = meta?.customerFacets;
  const OpenIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  function pickActivity(next: string) {
    setActivity(next);
    setPage(1);
  }

  const activityFilters = [
    { id: '', label: t.admin.allStatuses, count: facets?.all },
    { id: 'orders', label: t.admin.withOrders, count: facets?.orders },
    { id: 'quotes', label: t.admin.withQuotes, count: facets?.quotes },
    { id: 'tickets', label: t.admin.withTickets, count: facets?.tickets },
    { id: 'idle', label: t.admin.customerIdle, count: facets?.idle },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.admin.groupSales}
        title={t.admin.customers}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative sm:w-80">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t.admin.searchCustomers}
                className="ps-9"
              />
            </div>
            <Select
              value={account}
              onChange={(e) => {
                setAccount(e.target.value);
                setPage(1);
              }}
              className="sm:w-44"
            >
              <option value="">{t.admin.allAccounts}</option>
              <option value="registered">
                {t.admin.registeredAccount}
                {facets ? ` (${facets.registered})` : ''}
              </option>
              <option value="guest">
                {t.admin.guestAccount}
                {facets ? ` (${facets.guest})` : ''}
              </option>
            </Select>
          </div>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {activityFilters.map((filter) => (
          <button
            key={filter.id || 'all'}
            type="button"
            onClick={() => pickActivity(filter.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
              activity === filter.id
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-card text-muted-foreground hover:text-fg',
            )}
          >
            {filter.label}
            <span className="tabular-nums">{filter.count ?? 0}</span>
          </button>
        ))}
      </div>

      {query.isLoading ? <LoadingState variant="table" /> : null}

      <div className="space-y-3 md:hidden">
        {customers.map((customer) => {
          const name = `${customer.firstName} ${customer.lastName}`.trim();
          const email = customerEmail(customer.email);
          return (
            <Link key={customer.id} to={adminPath(`customers/${customer.id}`)} className="block">
              <Card size="sm">
                <CardContent className="space-y-3 py-0">
                  <div className="flex items-center gap-3">
                    <PersonAvatar name={name} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-fg">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {customer.company || customer.city || '—'}
                      </p>
                    </div>
                  </div>
                  <p className="ltr-isolate truncate text-xs text-muted-foreground" dir="ltr">
                    {customer.phone || '—'}
                    {email ? ` · ${email}` : ''}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <CustomerStat label={t.admin.orders} value={customer._count?.orders ?? 0} />
                    <CustomerStat label={t.admin.quotes} value={customer._count?.quotes ?? 0} />
                    <CustomerStat label={t.admin.support} value={customer._count?.tickets ?? 0} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="hidden overflow-hidden py-0 md:block">
        <CardContent className="p-0">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">{t.common.customer}</th>
                <th className="px-4 py-3 text-start">{t.admin.phone}</th>
                <th className="px-4 py-3 text-end">{t.admin.orders}</th>
                <th className="px-4 py-3 text-end">{t.admin.quotes}</th>
                <th className="px-4 py-3 text-end">{t.admin.support}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const name = `${customer.firstName} ${customer.lastName}`.trim();
                const email = customerEmail(customer.email);
                const place = [customer.company, customer.city].filter(Boolean).join(' · ');
                return (
                  <tr
                    key={customer.id}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30"
                    onClick={() => navigate(adminPath(`customers/${customer.id}`))}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <PersonAvatar name={name} />
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-medium text-fg">{name}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {place || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="ltr-isolate text-fg" dir="ltr">
                        {customer.phone || '—'}
                      </p>
                      {email ? (
                        <p className="ltr-isolate mt-0.5 truncate text-xs text-muted-foreground" dir="ltr">
                          {email}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-end tabular-nums">{customer._count?.orders ?? 0}</td>
                    <td className="px-4 py-3 text-end tabular-nums">{customer._count?.quotes ?? 0}</td>
                    <td className="px-4 py-3 text-end tabular-nums">{customer._count?.tickets ?? 0}</td>
                    <td className="px-4 py-3 text-end text-muted-foreground">
                      <OpenIcon className="ms-auto h-4 w-4" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {!query.isLoading && !customers.length ? <EmptyState title={t.admin.emptyList} /> : null}
      <Pagination
        page={meta?.page ?? 1}
        totalPages={meta?.totalPages ?? 1}
        onChange={setPage}
      />
    </div>
  );
}

function CustomerStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-1.5">
      <p className="font-semibold tabular-nums text-fg">{value}</p>
      <p className="truncate text-muted-foreground">{label}</p>
    </div>
  );
}

function dialPhone(phone: string) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `964${digits.slice(1)}`;
  return digits;
}

export function AdminCustomerDetailPage() {
  const { t, locale, dir } = useI18n();
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const customer = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: async () => (await customersApi.get(id)).data,
  });
  const history = useQuery({
    queryKey: ['admin-customer-history', id],
    enabled: Boolean(id),
    queryFn: async () => (await customersApi.history(id)).data,
  });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(customer.data?.notes ?? '');
  }, [customer.data?.id, customer.data?.notes]);

  if (customer.isLoading) return <LoadingState variant="page" />;
  if (!customer.data) return <EmptyState title={t.admin.customerNotFound} />;

  const c = customer.data;
  const email = c.email && !c.email.endsWith('@customers.local') ? c.email : '';
  const name = `${c.firstName} ${c.lastName}`.trim();
  const phoneDigits = c.phone ? dialPhone(c.phone) : '';
  const since = c.createdAt
    ? new Date(c.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB')
    : '';

  async function saveNotes() {
    setSaving(true);
    try {
      await customersApi.update(id, { notes });
      toast.success(t.admin.noteSaved);
      await qc.invalidateQueries({ queryKey: ['admin-customer', id] });
    } catch {
      toast.error(t.admin.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <StudioHero
        backTo={adminPath('customers')}
        backLabel={t.admin.back}
        eyebrow={t.admin.customers}
        title={name}
        meta={[c.company, since ? `${t.admin.customerSince} ${since}` : ''].filter(Boolean).join(' · ')}
        dir={dir}
        actions={
          <div className="flex flex-wrap gap-2">
            {phoneDigits ? (
              <a href={`tel:+${phoneDigits}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-[#0b1f3a]"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {t.admin.call}
                </Button>
              </a>
            ) : null}
            {phoneDigits ? (
              <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-[#0b1f3a]"
                >
                  {t.admin.whatsApp}
                </Button>
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-[#0b1f3a]"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {t.common.email}
                </Button>
              </a>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center gap-4">
            <PersonAvatar name={name} size="lg" />
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>{t.admin.customerFollowUp}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border px-3 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {t.admin.customerOrders}
              </p>
              <p className="mt-1 text-2xl font-bold">{c._count?.orders ?? history.data?.orders.length ?? 0}</p>
            </div>
            <div className="rounded-xl border border-border px-3 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {t.admin.customerQuotes}
              </p>
              <p className="mt-1 text-2xl font-bold">{c._count?.quotes ?? history.data?.quotes.length ?? 0}</p>
            </div>
            <div className="rounded-xl border border-border px-3 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {t.admin.customerTickets}
              </p>
              <p className="mt-1 text-2xl font-bold">{c._count?.tickets ?? history.data?.tickets.length ?? 0}</p>
            </div>
            <dl className="sm:col-span-3">
              {c.phone ? (
                <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[9rem_1fr]">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t.admin.phone}</dt>
                  <dd className="ltr-isolate text-sm" dir="ltr">{c.phone}</dd>
                </div>
              ) : null}
              {email ? (
                <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[9rem_1fr]">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t.common.email}</dt>
                  <dd className="ltr-isolate text-sm" dir="ltr">{email}</dd>
                </div>
              ) : null}
              {c.company ? (
                <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[9rem_1fr]">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t.admin.company}</dt>
                  <dd className="text-sm">{c.company}</dd>
                </div>
              ) : null}
              {c.address || c.city ? (
                <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr]">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t.admin.shippingAddress}</dt>
                  <dd className="text-sm">{[c.address, c.city, c.country].filter(Boolean).join(' · ')}</dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.admin.internalNote}</CardTitle>
            <CardDescription>{t.admin.customerNoteHint}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button className="w-full" disabled={saving} onClick={() => void saveNotes()}>
              {saving ? t.common.loading : t.common.save}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.customerOrders}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(history.data?.orders ?? []).map((order) => (
            <Link
              key={order.id}
              to={adminPath(`orders/${order.id}`)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-3 py-3 text-sm hover:border-accent/40"
            >
              <span className="font-semibold">{order.orderNumber}</span>
              <span className="text-muted-foreground">
                {formatMoney(order.total, order.currency, moneyLocale)}
              </span>
              <StatusBadge status={order.status} />
              <span className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
              </span>
            </Link>
          ))}
          {!history.isLoading && !(history.data?.orders ?? []).length ? (
            <p className="text-sm text-muted-foreground">{t.admin.noCustomerOrders}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.admin.customerQuotes}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(history.data?.quotes ?? []).map((quote) => (
              <Link
                key={quote.id}
                to={adminPath(`quotes/${quote.id}`)}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-3 text-sm hover:border-accent/40"
              >
                <span className="font-semibold">{quote.quoteNumber}</span>
                <StatusBadge status={quote.status} />
              </Link>
            ))}
            {!history.isLoading && !(history.data?.quotes ?? []).length ? (
              <p className="text-sm text-muted-foreground">{t.admin.noCustomerQuotes}</p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.admin.customerTickets}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(history.data?.tickets ?? []).map((ticket) => (
              <Link
                key={ticket.id}
                to={adminPath(`support/${ticket.id}`)}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-3 text-sm hover:border-accent/40"
              >
                <span className="min-w-0">
                  <span className="block font-semibold">{ticket.ticketNumber}</span>
                  <span className="block truncate text-xs text-muted-foreground">{ticket.subject}</span>
                </span>
                <StatusBadge status={ticket.status} />
              </Link>
            ))}
            {!history.isLoading && !(history.data?.tickets ?? []).length ? (
              <p className="text-sm text-muted-foreground">{t.admin.noCustomerTickets}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AdminQuotesPage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const dateLocale = locale === 'ar' ? 'ar-IQ' : 'en-GB';
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const query = useQuery({
    queryKey: ['admin-quotes', page, statusFilter, search],
    queryFn: async () =>
      (
        await quotesApi.list({
          page,
          limit: 20,
          status: statusFilter || undefined,
          search: search || undefined,
        })
      ).data,
  });

  const payload = query.data;
  const quotes: QuoteRequest[] = Array.isArray(payload) ? payload : (payload?.data ?? []);
  const meta = payload && !Array.isArray(payload) ? payload.meta : undefined;
  const counts = meta?.statusCounts ?? {};
  const allCount = QUOTE_STATUSES.reduce((sum, status) => sum + (counts[status] ?? 0), 0);
  const OpenIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  function pickStatus(next: string) {
    setStatusFilter(next);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.admin.groupSales}
        title={t.admin.quoteRequests}
        actions={
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.admin.searchQuotes}
              className="ps-9"
            />
          </div>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => pickStatus('')}
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
            statusFilter === ''
              ? 'border-accent bg-accent text-white'
              : 'border-border bg-card text-muted-foreground hover:text-fg',
          )}
        >
          {t.admin.allStatuses}
          <span className="tabular-nums">{allCount}</span>
        </button>
        {QUOTE_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => pickStatus(status)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
              statusFilter === status
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-card text-muted-foreground hover:text-fg',
            )}
          >
            {statusLabel(locale, status)}
            <span className="tabular-nums">{counts[status] ?? 0}</span>
          </button>
        ))}
      </div>

      {query.isLoading ? <LoadingState variant="table" /> : null}

      <div className="space-y-3 md:hidden">
        {quotes.map((quote) => {
          const customer = quote.customer;
          const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ');
          const count = quote._count?.items ?? quote.items?.length ?? 0;
          return (
            <Link key={quote.id} to={adminPath(`quotes/${quote.id}`)} className="block">
              <Card size="sm">
                <CardContent className="space-y-2 py-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-fg">{quote.quoteNumber}</p>
                      <p className="mt-0.5 truncate text-sm">{name || customer?.company || '—'}</p>
                    </div>
                    <StatusBadge status={quote.status} />
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium tabular-nums">
                      {quote.quotedAmount != null
                        ? formatMoney(quote.quotedAmount, quote.currency, moneyLocale)
                        : '—'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {count} {t.admin.quoteItems}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="hidden overflow-hidden py-0 md:block">
        <CardContent className="p-0">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">{t.admin.quoteDetail}</th>
                <th className="px-4 py-3 text-start">{t.common.customer}</th>
                <th className="px-4 py-3 text-end">{t.admin.quoteItems}</th>
                <th className="px-4 py-3 text-end">{t.admin.quotedAmount}</th>
                <th className="px-4 py-3 text-start">{t.common.status}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => {
                const customer = quote.customer;
                const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ');
                const count = quote._count?.items ?? quote.items?.length ?? 0;
                const firstItem = quote.items?.[0]?.productName;
                const when = quote.createdAt
                  ? new Date(quote.createdAt).toLocaleString(dateLocale, {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';
                return (
                  <tr
                    key={quote.id}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30"
                    onClick={() => navigate(adminPath(`quotes/${quote.id}`))}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-fg">{quote.quoteNumber}</p>
                      {when ? <p className="mt-0.5 text-xs text-muted-foreground">{when}</p> : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <PersonAvatar name={name || customer?.company || ''} />
                        <div className="min-w-0">
                          <p className="line-clamp-1">{name || '—'}</p>
                          <p className="ltr-isolate truncate text-xs text-muted-foreground" dir="ltr">
                            {customer?.phone || customer?.email || customer?.company || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <p className="tabular-nums">{count}</p>
                      {firstItem ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{firstItem}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-end font-medium tabular-nums whitespace-nowrap">
                      {quote.quotedAmount != null
                        ? formatMoney(quote.quotedAmount, quote.currency, moneyLocale)
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={quote.status} />
                    </td>
                    <td className="px-4 py-3 text-end text-muted-foreground">
                      <OpenIcon className="ms-auto h-4 w-4" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {!query.isLoading && !quotes.length ? <EmptyState title={t.admin.emptyList} /> : null}
      <Pagination page={meta?.page ?? 1} totalPages={meta?.totalPages ?? 1} onChange={setPage} />
    </div>
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
            <CardHeader className="flex flex-row items-center gap-3">
              <PersonAvatar
                name={`${q.customer?.firstName || q.firstName || ''} ${q.customer?.lastName || q.lastName || ''}`}
              />
              <CardTitle>
                {q.customer?.firstName || q.firstName} {q.customer?.lastName || q.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {(q.customer?.company || q.company) ? (
                <p>
                  {t.admin.company}: {q.customer?.company || q.company}
                </p>
              ) : null}
              {q.customer?.email || q.email ? (
                <p className="ltr-isolate" dir="ltr">
                  {q.customer?.email || q.email}
                </p>
              ) : null}
              {q.customer?.phone || q.phone ? (
                <p className="ltr-isolate" dir="ltr">
                  {q.customer?.phone || q.phone}
                </p>
              ) : null}
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
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const dateLocale = locale === 'ar' ? 'ar-IQ' : 'en-GB';
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const query = useQuery({
    queryKey: ['admin-tickets', page, statusFilter, search],
    queryFn: async () =>
      (
        await supportApi.list({
          page,
          limit: 20,
          status: statusFilter || undefined,
          search: search || undefined,
        })
      ).data,
  });

  const payload = query.data;
  const tickets: SupportTicket[] = Array.isArray(payload) ? payload : (payload?.data ?? []);
  const meta = payload && !Array.isArray(payload) ? payload.meta : undefined;
  const counts = meta?.statusCounts ?? {};
  const allCount = TICKET_STATUSES.reduce((sum, status) => sum + (counts[status] ?? 0), 0);
  const OpenIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const steps = [t.admin.supportHow1, t.admin.supportHow2, t.admin.supportHow3];

  function pickStatus(next: string) {
    setStatusFilter(next);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.admin.groupSales}
        title={t.admin.support}
        actions={
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.admin.searchTickets}
              className="ps-9"
            />
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-3 py-0">
          <p className="text-sm font-semibold text-fg">{t.admin.supportHowTitle}</p>
          <ol className="grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => pickStatus('')}
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
            statusFilter === ''
              ? 'border-accent bg-accent text-white'
              : 'border-border bg-card text-muted-foreground hover:text-fg',
          )}
        >
          {t.admin.allStatuses}
          <span className="tabular-nums">{allCount}</span>
        </button>
        {TICKET_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => pickStatus(status)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
              statusFilter === status
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-card text-muted-foreground hover:text-fg',
            )}
          >
            {statusLabel(locale, status)}
            <span className="tabular-nums">{counts[status] ?? 0}</span>
          </button>
        ))}
      </div>

      {query.isLoading ? <LoadingState variant="table" /> : null}

      <div className="space-y-3 md:hidden">
        {tickets.map((ticket) => {
          const name = [ticket.customer?.firstName, ticket.customer?.lastName].filter(Boolean).join(' ');
          return (
            <Link key={ticket.id} to={adminPath(`support/${ticket.id}`)} className="block">
              <Card size="sm">
                <CardContent className="space-y-2 py-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-fg">{ticket.ticketNumber}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm">{ticket.subject}</p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {name || '—'}
                    {ticket.priority ? ` · ${statusLabel(locale, ticket.priority)}` : ''}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="hidden overflow-hidden py-0 md:block">
        <CardContent className="p-0">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">{t.admin.support}</th>
                <th className="px-4 py-3 text-start">{t.common.customer}</th>
                <th className="px-4 py-3 text-start">{t.common.status}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => {
                const name = [ticket.customer?.firstName, ticket.customer?.lastName]
                  .filter(Boolean)
                  .join(' ');
                const when = ticket.createdAt
                  ? new Date(ticket.createdAt).toLocaleString(dateLocale, {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';
                return (
                  <tr
                    key={ticket.id}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30"
                    onClick={() => navigate(adminPath(`support/${ticket.id}`))}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-fg">{ticket.ticketNumber}</p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{ticket.subject}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="line-clamp-1">{name || '—'}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {when}
                        {ticket.priority ? ` · ${statusLabel(locale, ticket.priority)}` : ''}
                        {typeof ticket._count?.messages === 'number'
                          ? ` · ${ticket._count.messages}`
                          : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 text-end text-muted-foreground">
                      <OpenIcon className="ms-auto h-4 w-4" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {!query.isLoading && !tickets.length ? <EmptyState title={t.admin.emptyList} /> : null}
      <Pagination page={meta?.page ?? 1} totalPages={meta?.totalPages ?? 1} onChange={setPage} />
    </div>
  );
}

export function AdminSupportDetailPage() {
  const { t, locale } = useI18n();
  const { id = '' } = useParams();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
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
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin-ticket', id] }),
        qc.invalidateQueries({ queryKey: ['admin-tickets'] }),
      ]);
    } catch {
      toast.error(t.admin.replyFailed);
    }
  }

  async function saveStatus(next: string) {
    setStatus(next);
    try {
      await supportApi.update(id, { status: next });
      toast.success(t.admin.statusUpdated);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin-ticket', id] }),
        qc.invalidateQueries({ queryKey: ['admin-tickets'] }),
      ]);
    } catch {
      toast.error(t.admin.updateFailed);
    }
  }

  if (ticket.isLoading) return <LoadingState variant="page" />;
  if (!ticket.data) return <EmptyState title={t.admin.ticketNotFound} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{ticket.data.ticketNumber}</h1>
      <p className="font-medium">{ticket.data.subject}</p>
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={ticket.data.status} />
        <Select
          value={status || ticket.data.status}
          onChange={(e) => void saveStatus(e.target.value)}
          className="w-52"
        >
          {TICKET_STATUSES.map((item) => (
            <option key={item} value={item}>
              {statusLabel(locale, item)}
            </option>
          ))}
        </Select>
      </div>
      <p className="text-sm text-muted">{ticket.data.description}</p>
      <div className="space-y-3">
        {(ticket.data.messages ?? []).map((m) => (
          <div key={m.id} className="surface flex gap-3 p-3 text-sm">
            <PersonAvatar size="sm" name={m.sender?.firstName || ''} />
            <div className="min-w-0">
            <p className="text-xs text-muted">
              {m.sender?.firstName} ·{' '}
              {new Date(m.createdAt).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
            </p>
            <p className="mt-1">{m.message}</p>
            </div>
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
      <PageHeader eyebrow={t.admin.groupContent} title={title} />
      <form onSubmit={create} className="grid gap-3 surface p-4 md:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {f.label}
            </span>
          <Input
            value={form[f.key] || ''}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            required={f.key === 'name' || f.key === 'title'}
          />
          </label>
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

export function AdminServicesPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const list = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => (await adminCmsApi.services()).data,
  });
  const rows = list.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.admin.groupContent}
        title={t.admin.services}
        description={t.admin.servicesBilingualHint}
        actions={
          <Link to={adminPath('services/new')}>
            <Button className="w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              {t.admin.addService}
            </Button>
          </Link>
        }
      />

      {list.isLoading ? <LoadingState variant="table" /> : null}
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="surface flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
          >
            <span>
              {row.name}
              {row.nameAr ? ` · ${row.nameAr}` : ''} · {row.slug} ·{' '}
              <StatusBadge status={String(row.status || 'DRAFT')} />
            </span>
            <Link to={adminPath(`services/${row.id}/edit`)}>
              <Button type="button" size="sm" variant="secondary">
                <Pencil className="me-1.5 h-3.5 w-3.5" />
                {t.admin.edit}
              </Button>
            </Link>
          </div>
        ))}
      </div>
      {!list.isLoading && !rows.length ? (
        <EmptyState
          title={t.admin.emptyList}
          action={{
            label: t.admin.addService,
            onClick: () => navigate(adminPath('services/new')),
          }}
        />
      ) : null}
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
  const navigate = useNavigate();
  const list = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => (await adminCmsApi.brands()).data,
  });
  const rows = list.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.admin.groupContent}
        title={t.admin.brands}
        description={t.admin.brandsBilingualHint}
        actions={
          <Link to={adminPath('brands/new')}>
            <Button className="w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              {t.admin.addBrand}
            </Button>
          </Link>
        }
      />

      {list.isLoading ? <LoadingState variant="table" /> : null}
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="surface flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
          >
            <span>
              {row.name}
              {row.nameAr ? ` · ${row.nameAr}` : ''} · {row.slug} ·{' '}
              <StatusBadge status={String(row.status || 'DRAFT')} />
            </span>
            <Link to={adminPath(`brands/${row.id}/edit`)}>
              <Button type="button" size="sm" variant="secondary">
                <Pencil className="me-1.5 h-3.5 w-3.5" />
                {t.admin.edit}
              </Button>
            </Link>
          </div>
        ))}
      </div>
      {!list.isLoading && !rows.length ? (
        <EmptyState
          title={t.admin.emptyList}
          action={{
            label: t.admin.addBrand,
            onClick: () => navigate(adminPath('brands/new')),
          }}
        />
      ) : null}
    </div>
  );
}

const STAFF_ROLES = ['ADMIN', 'SALES', 'DATA_ENTRY'] as const;

function staffRoleLabel(code: string, t: ReturnType<typeof useI18n>['t']) {
  if (code === 'ADMIN') return t.admin.roleAdmin;
  if (code === 'SALES') return t.admin.roleSales;
  if (code === 'DATA_ENTRY') return t.admin.roleDataEntry;
  if (code === 'CUSTOMER') return t.admin.roleCustomer;
  return t.admin.roleEmployee;
}

export function AdminUsersPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [creating, setCreating] = useState(false);
  const people = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await usersApi.list({ limit: 100 })).data as { data?: Record<string, unknown>[] },
  });
  const roles = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => (await rolesApi.list()).data,
  });
  const staffRoles = (roles.data ?? []).filter((item) =>
    (STAFF_ROLES as readonly string[]).includes(item.code),
  );
  const rows = (people.data?.data ?? []).filter((row) => {
    const code = (row.role as { code?: string } | undefined)?.code;
    return code !== 'CUSTOMER';
  });

  async function patchUser(id: string, data: Record<string, unknown>) {
    try {
      await usersApi.update(id, data);
      toast.success(t.admin.roleUpdated);
      await qc.invalidateQueries({ queryKey: ['admin-users'] });
      await qc.invalidateQueries({ queryKey: ['admin-roles'] });
    } catch {
      toast.error(t.admin.updateFailed);
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || firstName;
    if (!firstName || !email.trim() || !phone.trim() || password.length < 8 || !roleId) {
      toast.error(t.admin.saveFailed);
      return;
    }
    setCreating(true);
    try {
      await usersApi.create({
        firstName,
        lastName,
        email: email.trim(),
        phone: phone.trim(),
        password,
        roleId,
      });
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      toast.success(t.admin.staffCreated);
      await qc.invalidateQueries({ queryKey: ['admin-users'] });
    } catch {
      toast.error(t.admin.createFailed);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow={t.admin.groupSystem} title={t.admin.users} description={t.admin.rolesHint} />
      <form onSubmit={(e) => void createUser(e)} className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.admin.staffName} required />
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.admin.staffPhone} required dir="ltr" />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.common.email} type="email" required dir="ltr" />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.admin.staffPassword} type="password" required minLength={8} dir="ltr" />
        <Select value={roleId} onChange={(e) => setRoleId(e.target.value)} required className="md:col-span-2">
          <option value="">{t.admin.rolePeople}</option>
          {staffRoles.map((item) => (
            <option key={item.id} value={item.id}>
              {staffRoleLabel(item.code, t)}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={creating} className="md:col-span-2 md:w-fit">
          {creating ? t.common.loading : t.admin.addStaff}
        </Button>
      </form>
      {people.isLoading ? <LoadingState variant="table" /> : null}
      <div className="space-y-3">
        {rows.map((row) => {
          const id = String(row.id);
          const person = `${String(row.firstName || '')} ${String(row.lastName || '')}`.trim();
          const role = row.role as { id?: string; code?: string } | undefined;
          const mine = user?.id === id;
          const options = staffRoles.some((item) => item.id === role?.id) || !role
            ? staffRoles
            : [...staffRoles, { id: String(role.id), code: String(role.code), name: String(role.code) }];
          return (
            <div key={id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
              <PersonAvatar name={person || String(row.email || '')} src={String(row.avatarUrl || '') || null} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-fg">{person || String(row.email)}</p>
                <p className="truncate text-xs text-muted-foreground" dir="ltr">
                  {row.phone ? `${String(row.phone)} · ` : ''}
                  {String(row.email)}
                </p>
              </div>
              <Select
                value={role?.id || ''}
                disabled={mine || !roles.data}
                title={mine ? t.admin.ownRoleLocked : undefined}
                onChange={(e) => void patchUser(id, { roleId: e.target.value })}
                className="sm:w-44"
              >
                {options.map((item) => (
                  <option key={item.id} value={item.id}>
                    {staffRoleLabel(item.code, t)}
                  </option>
                ))}
              </Select>
              <Select
                value={String(row.status || 'ACTIVE')}
                onChange={(e) => void patchUser(id, { status: e.target.value })}
                className="sm:w-36"
              >
                <option value="ACTIVE">{statusLabel(locale, 'ACTIVE')}</option>
                <option value="INACTIVE">{statusLabel(locale, 'INACTIVE')}</option>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminAuditPage() {
  const { t, locale } = useI18n();
  return (
    <AdminListPage
      title={t.admin.auditLogs}
      queryKey="admin-audit"
      fetcher={() => auditApi.list()}
      columns={(row) => {
        const user = row.user as { firstName?: string; lastName?: string; email?: string } | undefined;
        const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || '—';
        return (
          <span className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              <span className="font-medium text-fg">{String(row.action)}</span>
              <span className="text-muted-foreground"> · {String(row.entity)}</span>
              <span className="text-muted-foreground"> · {name}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(String(row.createdAt)).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB')}
            </span>
          </span>
        );
      }}
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
      <PageHeader
        eyebrow={t.admin.groupSystem}
        title={t.admin.settings}
        description={t.admin.settingsBlurb}
      />

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
