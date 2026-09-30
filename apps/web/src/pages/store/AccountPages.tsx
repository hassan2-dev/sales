import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  FileText,
  FolderOpen,
  Heart,
  LifeBuoy,
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

const tabs = (locale: string) => [
  {
    to: storePath('account'),
    end: true,
    icon: UserRound,
    label: locale === 'ar' ? 'الإعدادات' : 'Settings',
  },
  {
    to: storePath('account/orders'),
    icon: Package,
    label: locale === 'ar' ? 'الطلبات' : 'Orders',
  },
  {
    to: storePath('account/quotes'),
    icon: FileText,
    label: locale === 'ar' ? 'عروض الأسعار' : 'Quotes',
  },
  {
    to: storePath('favorites'),
    icon: Heart,
    label: locale === 'ar' ? 'المحفوظات' : 'Saved',
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

export function AccountShell() {
  const { locale } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, logout } = useAuth();

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
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            {locale === 'ar' ? 'حسابي' : 'My account'}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="mt-1 text-sm text-muted">{user?.phone || user?.email}</p>
        </div>
        <Button variant="outline" onClick={() => void logout()}>
          {locale === 'ar' ? 'خروج' : 'Sign out'}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="store-surface h-fit p-2 lg:sticky lg:top-28">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {tabs(locale).map((tab) => {
              const active = tab.end
                ? location.pathname === tab.to || location.pathname === `${tab.to}/`
                : location.pathname.startsWith(tab.to);
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={cn(
                    'inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                    active
                      ? 'bg-accent text-white'
                      : 'text-muted hover:bg-mist hover:text-fg dark:hover:bg-white/5',
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div>
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

  return (
    <>
      <Seo title={locale === 'ar' ? 'إعدادات الحساب' : 'Account settings'} path={storePath('account')} />
      <div className="store-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-fg">
              {locale === 'ar' ? 'إعدادات الحساب' : 'Account settings'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {locale === 'ar'
                ? 'حدّث بياناتك الشخصية وبيانات شركتك'
                : 'Update your personal and company details'}
            </p>
          </div>
          <div className="rounded-xl bg-page px-3 py-2 text-xs font-semibold text-muted">
            {locale === 'ar' ? 'محفوظات' : 'Saved'}: {ids.length} ·{' '}
            {locale === 'ar' ? 'طلبات' : 'Orders'}: {profile.data?._count?.orders ?? 0} ·{' '}
            {locale === 'ar' ? 'عروض' : 'Quotes'}: {profile.data?._count?.quotes ?? 0}
          </div>
        </div>

        {profile.isLoading ? <LoadingState variant="form" /> : null}
        {profile.isError ? (
          <div className="mt-4">
            <ErrorState
              title={locale === 'ar' ? 'تعذّر تحميل الملف' : 'Could not load profile'}
              onRetry={() => void profile.refetch()}
            />
          </div>
        ) : null}

        {!profile.isLoading && !profile.isError ? (
          <form onSubmit={onSave} className="mt-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-fg">
                {locale === 'ar' ? 'المعلومات الشخصية' : 'Personal information'}
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{locale === 'ar' ? 'الاسم الأول' : 'First name'}</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === 'ar' ? 'اسم العائلة' : 'Last name'}</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === 'ar' ? 'الهاتف (موثّق)' : 'Phone (verified)'}</Label>
                  <Input value={user?.phone || profile.data?.phone || ''} readOnly className="opacity-80" />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === 'ar' ? 'البريد' : 'Email'}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-5">
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

            <Button type="submit" size="lg" className="rounded-xl" disabled={busy}>
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
  });

  return (
    <>
      <Seo
        title={locale === 'ar' ? 'طلباتي' : 'My orders'}
        path={storePath('account/orders')}
      />
      <div className="store-surface p-5 sm:p-6">
        <h2 className="text-lg font-bold text-fg">
          {locale === 'ar' ? 'الطلبات' : 'Orders'}
        </h2>
        <div className="mt-5">
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
          <div className="space-y-3">
            {(mine.data ?? []).map((o) => (
              <Link
                key={o.id}
                to={storePath(`account/orders/${o.id}`)}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-4 transition hover:border-accent/40"
              >
                <div>
                  <p className="font-semibold text-fg">{o.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatOrderDate(locale, o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="text-sm font-bold text-fg">
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
      <div className="store-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-fg">
              {locale === 'ar' ? 'عروض الأسعار' : 'Quote requests'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {locale === 'ar'
                ? 'هنا تشوف عروضك ومتابعتها بعد ما ترسلها'
                : 'Your sent quotes show up here so you can follow them'}
            </p>
          </div>
          <Button onClick={() => navigate(storePath('quote'))}>
            {locale === 'ar' ? 'طلب جديد' : 'New quote'}
          </Button>
        </div>

        <div className="mt-6">
          {quotes.isLoading ? <LoadingState /> : null}
          {quotes.isError ? <ErrorState onRetry={() => void quotes.refetch()} /> : null}
          {!quotes.isLoading && !(quotes.data?.length) ? (
            <QuoteExplainSection
              locale={locale}
              variant="account-empty"
              onPrimary={() => navigate(storePath('products'))}
            />
          ) : null}
          <div className="space-y-3">
            {(quotes.data ?? []).map((q) => (
              <div
                key={q.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-4"
              >
                <div>
                  <p className="font-semibold text-fg">{q.quoteNumber}</p>
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
      <div className="store-surface p-5 sm:p-6">
        <h2 className="text-lg font-bold text-fg">
          {locale === 'ar' ? 'الدعم' : 'Support'}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          {locale === 'ar'
            ? 'للت지원 الفني أو استفسارات المشاريع، تواصل مع فريق افاق الطاقة عبر الموقع الرئيسي أو اطلب عرض سعر لمنتجاتك.'
            : 'For technical or project support, contact Energy Horizon via the corporate site or request a quote for your products.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to={storePath('quote')}
            className="inline-flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-bold text-white hover:bg-accent-soft"
          >
            {locale === 'ar' ? 'طلب عرض سعر' : 'Request quote'}
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
      <div className="store-surface p-5 sm:p-6">
        <h2 className="text-lg font-bold text-fg">
          {locale === 'ar' ? 'الإشعارات' : 'Notifications'}
        </h2>
        <EmptyState
          title={locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications yet'}
          description={
            locale === 'ar'
              ? 'ستظهر هنا تحديثات الطلبات وعروض الأسعار'
              : 'Order and quote updates will appear here'
          }
        />
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
      <div className="store-surface p-5 sm:p-6">
        <h2 className="text-lg font-bold text-fg">
          {locale === 'ar' ? 'المستندات' : 'Documents'}
        </h2>
        <EmptyState
          title={locale === 'ar' ? 'لا توجد مستندات بعد' : 'No documents yet'}
          description={
            locale === 'ar'
              ? 'ستظهر هنا عروض الأسعار والفواتير والمستندات الفنية'
              : 'Quotes, invoices, and technical files will appear here'
          }
        />
      </div>
    </>
  );
}

export function AccountIndexRedirect() {
  return <Navigate to={storePath('account')} replace />;
}

export { formatOrderDate };
