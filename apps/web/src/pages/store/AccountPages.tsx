import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  FileText,
  FolderOpen,
  Heart,
  LifeBuoy,
  LogOut,
  Package,
  UserRound,
} from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/label';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/stores/auth-context';
import { useFavorites } from '@/stores/favorites-context';
import { useI18n } from '@/i18n/i18n-context';
import { customersApi, ordersApi, quotesApi } from '@/services/endpoints';
import { storePath } from '@/lib/urls';
import { formatMoney, cn } from '@/lib/cn';
import { appToast } from '@/lib/toast';
import { QuoteExplainSection } from '@/pages/store/RequestQuotePage';

function formatOrderDate(locale: string, value?: string) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-IQ' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

type AccountTab = {
  to: string;
  end?: boolean;
  icon: typeof UserRound;
  label: string;
  primary?: boolean;
};

function accountTabs(locale: string): AccountTab[] {
  return [
    {
      to: storePath('account'),
      end: true,
      icon: UserRound,
      label: locale === 'ar' ? 'الإعدادات' : 'Settings',
      primary: true,
    },
    {
      to: storePath('account/orders'),
      icon: Package,
      label: locale === 'ar' ? 'الطلبات' : 'Orders',
      primary: true,
    },
    {
      to: storePath('account/quotes'),
      icon: FileText,
      label: locale === 'ar' ? 'عروض الأسعار' : 'Quotes',
      primary: true,
    },
    {
      to: storePath('favorites'),
      icon: Heart,
      label: locale === 'ar' ? 'المحفوظات' : 'Saved',
      primary: true,
    },
    {
      to: storePath('account/support'),
      icon: LifeBuoy,
      label: locale === 'ar' ? 'الدعم' : 'Support',
    },
    {
      to: storePath('account/notifications'),
      icon: Bell,
      label: locale === 'ar' ? 'الإشعارات' : 'Notifications',
    },
    {
      to: storePath('account/documents'),
      icon: FolderOpen,
      label: locale === 'ar' ? 'المستندات' : 'Documents',
    },
  ];
}

function isTabActive(pathname: string, tab: AccountTab) {
  return tab.end
    ? pathname === tab.to || pathname === `${tab.to}/`
    : pathname.startsWith(tab.to);
}

function initials(first?: string | null, last?: string | null) {
  const a = (first || '').trim().charAt(0);
  const b = (last || '').trim().charAt(0);
  const value = `${a}${b}`.toUpperCase();
  return value || 'EH';
}

function NavLinkItem({
  tab,
  active,
  variant,
}: {
  tab: AccountTab;
  active: boolean;
  variant: 'sidebar' | 'grid' | 'secondary';
}) {
  if (variant === 'grid') {
    return (
      <Link
        to={tab.to}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-4 text-center transition',
          active
            ? 'border-accent/30 bg-accent text-white shadow-sm'
            : 'border-border bg-card text-fg hover:border-accent/30 hover:bg-mist/60 dark:hover:bg-white/5',
        )}
      >
        <tab.icon className={cn('h-5 w-5', active ? 'text-white' : 'text-accent')} />
        <span className="text-[11px] font-bold leading-tight sm:text-xs">{tab.label}</span>
      </Link>
    );
  }

  if (variant === 'secondary') {
    return (
      <Link
        to={tab.to}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
          active
            ? 'border-accent/30 bg-accent/10 text-accent'
            : 'border-border bg-card text-muted hover:border-accent/25 hover:text-fg',
        )}
      >
        <tab.icon className="h-3.5 w-3.5" />
        {tab.label}
      </Link>
    );
  }

  return (
    <Link
      to={tab.to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
        active
          ? 'bg-accent text-white'
          : 'text-muted hover:bg-mist hover:text-fg dark:hover:bg-white/5',
      )}
    >
      <tab.icon className="h-4 w-4 shrink-0" />
      {tab.label}
    </Link>
  );
}

export function AccountShell() {
  const { locale } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const navTabs = accountTabs(locale);
  const primaryTabs = navTabs.filter((t) => t.primary);
  const secondaryTabs = navTabs.filter((t) => !t.primary);
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    (locale === 'ar' ? 'حسابي' : 'My account');

  if (loading) return <LoadingState variant="page" />;

  if (!isAuthenticated) {
    return (
      <EmptyState
        title={locale === 'ar' ? 'سجّل دخولك لحسابي' : 'Sign in to My account'}
        description={
          locale === 'ar'
            ? 'حساب موثّق بالهاتف لإدارة الطلبات والعروض'
            : 'OTP-verified account for orders and quotes'
        }
        action={{
          label: locale === 'ar' ? 'تسجيل الدخول' : 'Sign in',
          onClick: () =>
            navigate(
              `${storePath('account/login')}?next=${encodeURIComponent(location.pathname)}`,
            ),
        }}
      />
    );
  }

  return (
    <div className="mx-auto min-w-0 max-w-[90rem] px-4 py-5 sm:px-6 sm:py-10 lg:px-10">
      <div className="store-surface mb-5 flex items-center gap-3 p-3 sm:mb-8 sm:gap-4 sm:p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-sm font-extrabold tracking-wide text-white sm:h-14 sm:w-14 sm:text-base">
          {initials(user?.firstName, user?.lastName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent sm:text-[11px]">
            {locale === 'ar' ? 'حسابي' : 'My account'}
          </p>
          <h1 className="mt-0.5 truncate text-lg font-extrabold tracking-tight text-fg sm:text-2xl">
            {displayName}
          </h1>
          <p className="mt-0.5 truncate text-xs text-muted sm:text-sm" dir="ltr">
            {user?.phone || user?.email}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 rounded-xl gap-1.5"
          onClick={() => void logout()}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{locale === 'ar' ? 'خروج' : 'Sign out'}</span>
        </Button>
      </div>

      {/* Mobile primary grid + secondary links */}
      <div className="mb-5 space-y-3 lg:hidden">
        <div className="grid grid-cols-2 gap-2.5">
          {primaryTabs.map((tab) => (
            <NavLinkItem
              key={tab.to}
              tab={tab}
              active={isTabActive(location.pathname, tab)}
              variant="grid"
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {secondaryTabs.map((tab) => (
            <NavLinkItem
              key={tab.to}
              tab={tab}
              active={isTabActive(location.pathname, tab)}
              variant="secondary"
            />
          ))}
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[240px_1fr] lg:gap-8">
        <aside className="store-surface hidden h-fit p-2 lg:sticky lg:top-28 lg:block">
          <nav className="flex flex-col gap-1">
            {navTabs.map((tab) => (
              <NavLinkItem
                key={tab.to}
                tab={tab}
                active={isTabActive(location.pathname, tab)}
                variant="sidebar"
              />
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function AccountProfilePage() {
  const { locale } = useI18n();
  const { user, refreshUser } = useAuth();
  const { ids } = useFavorites();

  const profile = useQuery({
    queryKey: ['store-customer-me', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => (await customersApi.me()).data,
    retry: 1,
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const c = profile.data;
    if (!c && !user) return;
    setFirstName(c?.firstName || user?.firstName || '');
    setLastName(c?.lastName || user?.lastName || '');
    const mail = c?.email || user?.email || '';
    setEmail(mail.endsWith('@customers.local') ? '' : mail);
    setCompany(c?.company || '');
    setAddress(c?.address || '');
    setCity(c?.city || '');
  }, [profile.data, user]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      appToast.error('profileUpdateFailed');
      return;
    }
    setBusy(true);
    try {
      await customersApi.updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        company: company.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
      });
      await refreshUser();
      await profile.refetch();
      appToast.success('profileUpdated');
    } catch {
      appToast.error('profileUpdateFailed');
    } finally {
      setBusy(false);
    }
  }

  const metrics = [
    {
      label: locale === 'ar' ? 'محفوظات' : 'Saved',
      value: ids.length,
    },
    {
      label: locale === 'ar' ? 'طلبات' : 'Orders',
      value: profile.data?._count?.orders ?? 0,
    },
    {
      label: locale === 'ar' ? 'عروض' : 'Quotes',
      value: profile.data?._count?.quotes ?? 0,
    },
  ];

  return (
    <>
      <Seo title={locale === 'ar' ? 'إعدادات الحساب' : 'Account settings'} path={storePath('account')} />
      <div className="space-y-4">
        <div className="store-surface min-w-0 p-3 sm:p-4">
          <h2 className="text-base font-extrabold tracking-tight text-fg sm:text-lg">
            {locale === 'ar' ? 'إعدادات الحساب' : 'Account settings'}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {locale === 'ar'
              ? 'حدّث بياناتك الشخصية وبيانات شركتك'
              : 'Update your personal and company details'}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-border bg-page px-2 py-3 text-center sm:px-3"
              >
                <p className="text-lg font-extrabold tabular-nums text-navy dark:text-accent sm:text-xl">
                  {m.value}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-muted sm:text-xs">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {profile.isLoading ? <LoadingState variant="form" /> : null}
        {profile.isError ? (
          <ErrorState
            title={locale === 'ar' ? 'تعذّر تحميل الملف' : 'Could not load profile'}
            onRetry={() => void profile.refetch()}
          />
        ) : null}

        {!profile.isLoading && !profile.isError ? (
          <form onSubmit={onSave} className="space-y-4">
            <div className="store-surface min-w-0 p-3 sm:p-4">
              <h3 className="text-sm font-bold text-fg">
                {locale === 'ar' ? 'المعلومات الشخصية' : 'Personal information'}
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{locale === 'ar' ? 'الاسم الأول' : 'First name'}</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === 'ar' ? 'اسم العائلة' : 'Last name'}</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === 'ar' ? 'الهاتف (موثّق)' : 'Phone (verified)'}</Label>
                  <Input
                    value={user?.phone || profile.data?.phone || ''}
                    readOnly
                    dir="ltr"
                    className="opacity-80"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === 'ar' ? 'البريد' : 'Email'}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="store-surface min-w-0 p-3 sm:p-4">
              <h3 className="text-sm font-bold text-fg">
                {locale === 'ar' ? 'معلومات الشركة' : 'Company information'}
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>{locale === 'ar' ? 'اسم الشركة' : 'Company name'}</Label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={locale === 'ar' ? 'شركة / مؤسسة' : 'Company / organization'}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === 'ar' ? 'المدينة' : 'City'}</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={locale === 'ar' ? 'بغداد' : 'Baghdad'}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>{locale === 'ar' ? 'عنوان الشركة' : 'Company address'}</Label>
                  <Textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      locale === 'ar' ? 'العنوان التفصيلي للشركة' : 'Full company address'
                    }
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl sm:w-auto"
              disabled={busy}
            >
              {busy
                ? locale === 'ar'
                  ? 'جارٍ الحفظ…'
                  : 'Saving…'
                : locale === 'ar'
                  ? 'حفظ الإعدادات'
                  : 'Save settings'}
            </Button>
          </form>
        ) : null}
      </div>
    </>
  );
}

export function AccountOrdersPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const mine = useQuery({
    queryKey: ['store-my-orders', user?.id],
    enabled: isAuthenticated,
    queryFn: async () => (await ordersApi.mine()).data.data,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <Seo
        title={locale === 'ar' ? 'طلباتي' : 'My orders'}
        path={storePath('account/orders')}
      />
      <div className="store-surface min-w-0 p-3 sm:p-4">
        <h2 className="text-base font-extrabold tracking-tight text-fg sm:text-lg">
          {locale === 'ar' ? 'الطلبات' : 'Orders'}
        </h2>
        <div className="mt-4">
          {mine.isLoading ? <LoadingState /> : null}
          {!mine.isLoading && !(mine.data?.length) ? (
            <EmptyState
              title={locale === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}
              action={{
                label: locale === 'ar' ? 'تصفح المنتجات' : 'Browse products',
                onClick: () => navigate(storePath('products')),
              }}
            />
          ) : null}
          <div className="space-y-2.5">
            {(mine.data ?? []).map((o) => (
              <Link
                key={o.id}
                to={storePath(`account/orders/${o.id}`)}
                className="flex flex-col gap-2 rounded-xl border border-border px-3 py-3 transition hover:border-accent/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-fg">{o.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatOrderDate(locale, o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <StatusBadge status={o.status} />
                  <span className="text-sm font-bold tabular-nums text-fg">
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

export function AccountQuotesPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const quotes = useQuery({
    queryKey: ['store-my-quotes', user?.id],
    enabled: isAuthenticated,
    queryFn: async () => (await quotesApi.mine()).data.data,
  });

  return (
    <>
      <Seo
        title={locale === 'ar' ? 'عروض الأسعار' : 'Quotes'}
        path={storePath('account/quotes')}
      />
      <div className="store-surface min-w-0 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-extrabold tracking-tight text-fg sm:text-lg">
              {locale === 'ar' ? 'عروض الأسعار' : 'Quote requests'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {locale === 'ar'
                ? 'هنا تشوف عروضك ومتابعتها بعد ما ترسلها'
                : 'Your sent quotes show up here so you can follow them'}
            </p>
          </div>
          <Button
            className="w-full shrink-0 rounded-xl sm:w-auto"
            onClick={() => navigate(storePath('cart'))}
          >
            {locale === 'ar' ? 'من السلة' : 'From cart'}
          </Button>
        </div>

        <div className="mt-4 sm:mt-5">
          {quotes.isLoading ? <LoadingState /> : null}
          {quotes.isError ? <ErrorState onRetry={() => void quotes.refetch()} /> : null}
          {!quotes.isLoading && !(quotes.data?.length) ? (
            <QuoteExplainSection
              locale={locale}
              variant="account-empty"
              onPrimary={() => navigate(storePath('products'))}
            />
          ) : null}
          <div className="space-y-2.5">
            {(quotes.data ?? []).map((q) => (
              <div
                key={q.id}
                className="flex flex-col gap-2 rounded-xl border border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-fg">{q.quoteNumber}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatOrderDate(locale, q.createdAt)} · {q.items?.length ?? 0}{' '}
                    {locale === 'ar' ? 'منتج' : 'items'}
                  </p>
                </div>
                <StatusBadge status={q.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function AccountSupportPage() {
  const { locale } = useI18n();
  return (
    <>
      <Seo title={locale === 'ar' ? 'الدعم' : 'Support'} path={storePath('account/support')} />
      <div className="store-surface min-w-0 p-3 sm:p-4">
        <h2 className="text-base font-extrabold tracking-tight text-fg sm:text-lg">
          {locale === 'ar' ? 'الدعم' : 'Support'}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          {locale === 'ar'
            ? 'للت지원 الفني أو استفسارات المشاريع، تواصل مع فريق افاق الطاقة عبر الموقع الرئيسي أو اطلب عرض سعر لمنتجاتك.'
            : 'For technical or project support, contact Energy Horizon via the corporate site or request a quote for your products.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to={storePath('cart')}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-accent px-4 text-sm font-bold text-white hover:bg-accent-soft sm:w-auto"
          >
            {locale === 'ar' ? 'الذهاب للسلة' : 'Go to cart'}
          </Link>
        </div>
      </div>
    </>
  );
}

export function AccountNotificationsPage() {
  const { locale } = useI18n();
  return (
    <>
      <Seo
        title={locale === 'ar' ? 'الإشعارات' : 'Notifications'}
        path={storePath('account/notifications')}
      />
      <div className="store-surface min-w-0 p-3 sm:p-4">
        <h2 className="text-base font-extrabold tracking-tight text-fg sm:text-lg">
          {locale === 'ar' ? 'الإشعارات' : 'Notifications'}
        </h2>
        <div className="mt-3">
          <EmptyState
            title={locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications yet'}
            description={
              locale === 'ar'
                ? 'ستظهر هنا تحديثات الطلبات وعروض الأسعار'
                : 'Order and quote updates will appear here'
            }
          />
        </div>
      </div>
    </>
  );
}

export function AccountDocumentsPage() {
  const { locale } = useI18n();
  return (
    <>
      <Seo
        title={locale === 'ar' ? 'المستندات' : 'Documents'}
        path={storePath('account/documents')}
      />
      <div className="store-surface min-w-0 p-3 sm:p-4">
        <h2 className="text-base font-extrabold tracking-tight text-fg sm:text-lg">
          {locale === 'ar' ? 'المستندات' : 'Documents'}
        </h2>
        <div className="mt-3">
          <EmptyState
            title={locale === 'ar' ? 'لا توجد مستندات بعد' : 'No documents yet'}
            description={
              locale === 'ar'
                ? 'ستظهر هنا عروض الأسعار والفواتير والمستندات الفنية'
                : 'Quotes, invoices, and technical files will appear here'
            }
          />
        </div>
      </div>
    </>
  );
}

export function AccountIndexRedirect() {
  return <Navigate to={storePath('account')} replace />;
}

export { formatOrderDate };
