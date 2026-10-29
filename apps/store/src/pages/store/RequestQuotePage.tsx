import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  FileText,
  Minus,
  Percent,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/label';
import { LoadingState } from '@/components/ui/States';
import { StorePageHeader } from '@/components/store/StoreUI';
import { catalogApi, customersApi, quotesApi } from '@/services/endpoints';
import { useCart } from '@/stores/cart-context';
import { useAuth } from '@/stores/auth-context';
import { useI18n } from '@/i18n/i18n-context';
import { storePath } from '@/lib/urls';
import { useCommerceSettings } from '@/stores/commerce-settings-context';
import { appToast } from '@/lib/toast';
import type { Product } from '@/types';

type QuoteLine = {
  productId: string;
  quantity: number;
  product?: Product;
};

export function QuoteExplainSection({
  locale,
  variant,
  onPrimary,
}: {
  locale: string;
  variant: 'guest' | 'empty-products' | 'account-empty';
  onPrimary: () => void;
}) {
  const ar = locale === 'ar';

  const headline =
    variant === 'guest'
      ? ar
        ? 'هلا بيك — خلّينا نجهّز عرض سعر مناسب'
        : 'Hey — let’s get you a fair quote'
      : variant === 'account-empty'
        ? ar
          ? 'ما عندك عروض بعد — يلا نبدأ'
          : 'No quotes yet — let’s start one'
        : ar
          ? 'القائمة فاضية — اختَر منتجاتك'
          : 'Nothing here yet — pick your products';

  const body =
    variant === 'guest'
      ? ar
        ? 'عرض السعر مو بس قائمة أسعار. نراجع طلبك ونعطيك سعر أوضح للمشروع، وغالباً أكو خصم للكميات والشركات. سجّل بسرعة برقمك، اختَر اللي تحتاجه، واترك الباقي علينا.'
        : 'A quote isn’t just a price list. We review what you need and usually offer better rates for volume and companies. Sign in with your phone, pick what you need, and we’ll take it from there.'
      : variant === 'account-empty'
        ? ar
          ? 'حسابك جاهز. اختَر المنتجات من المتجر، اكتب اسم الشركة، واطلب عرض — نرد عليك بسعر مناسب، وغالباً أفضل من الشراء المباشر إذا الكميات كبيرة.'
          : 'Your account is ready. Pick products, add your company name, and request a quote — we’ll reply with a fair price, often better than checkout when quantities are larger.'
        : ar
          ? 'ما ضفت منتجات بعد. روح للكتالوج، أضف اللي تحتاجه (أو من السلة)، وارجع هنا نكمّل ونرسل الطلب.'
          : 'No products yet. Browse the catalog, add what you need (or from the cart), then come back and we’ll send it.';

  const primaryLabel =
    variant === 'guest'
      ? ar
        ? 'سجّل برقمك وابدأ'
        : 'Sign in with your phone'
      : ar
        ? 'تصفّح المنتجات'
        : 'Browse products';

  const perks = ar
    ? [
        {
          icon: Percent,
          title: 'خصم للكميات والشركات',
          text: 'كل ما طلبك أكبر، غالباً السعر يصير أحسن.',
        },
        {
          icon: Sparkles,
          title: 'سعر واضح لمشروعك',
          text: 'مو تخمين — نرد عليك بعرض مرتب حسب اللي اخترته.',
        },
        {
          icon: UserRound,
          title: 'متابعة من حسابك',
          text: 'بعد الإرسال تشوف الطلب بحسابي → عروض الأسعار.',
        },
      ]
    : [
        {
          icon: Percent,
          title: 'Better rates for volume',
          text: 'Larger orders and companies often get a nicer price.',
        },
        {
          icon: Sparkles,
          title: 'A clear quote for your job',
          text: 'Not a guess — we reply based on what you picked.',
        },
        {
          icon: UserRound,
          title: 'Track it in your account',
          text: 'After you send, it shows under My account → Quotes.',
        },
      ];

  return (
    <section className="store-surface overflow-hidden p-5 sm:p-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-accent">
          {ar ? 'طلب عرض سعر' : 'Request a quote'}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
          {headline}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{body}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" onClick={onPrimary} className="rounded-xl">
            {primaryLabel}
          </Button>
          {variant !== 'guest' ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={onPrimary}
            >
              {ar ? 'روح للكتالوج' : 'Go to catalog'}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
        {perks.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-fg">{item.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RequestQuotePage() {
  const { locale } = useI18n();
  const moneyLocale = locale === 'ar' ? 'ar-IQ' : 'en-US';
  const commerce = useCommerceSettings();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const productParam = params.get('product') || '';
  const { cart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [attachmentNote, setAttachmentNote] = useState('');
  const [busy, setBusy] = useState(false);

  const seedProduct = useQuery({
    queryKey: ['quote-seed-product', productParam],
    enabled: Boolean(productParam),
    queryFn: async () => (await catalogApi.productById(productParam)).data,
  });

  const profile = useQuery({
    queryKey: ['store-customer-me', user?.id],
    enabled: isAuthenticated && Boolean(user?.id),
    queryFn: async () => (await customersApi.me()).data,
    retry: 1,
  });

  useEffect(() => {
    if (initialized) return;
    if (productParam && seedProduct.isLoading) return;

    if (productParam && seedProduct.data) {
      setLines([{ productId: seedProduct.data.id, quantity: 1, product: seedProduct.data }]);
      setInitialized(true);
      return;
    }

    if (!productParam) {
      const fromCart =
        cart?.items
          ?.filter((i) => i.productId)
          .map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            product: i.product,
          })) ?? [];
      setLines(fromCart);
      setInitialized(true);
    }
  }, [initialized, productParam, seedProduct.data, seedProduct.isLoading, cart?.items]);

  useEffect(() => {
    if (!user) return;
    const c = profile.data;
    setFirstName(c?.firstName || (user.firstName !== 'Customer' ? user.firstName : '') || '');
    setLastName(c?.lastName || user.lastName || '');
    setPhone(c?.phone || user.phone || '');
    const mail = c?.email || user.email || '';
    setEmail(mail.endsWith('@customers.local') ? '' : mail);
    setCompany(c?.company || '');
    setCity(c?.city || '');
    setAddress(c?.address || '');
  }, [user, profile.data]);

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const price = Number(line.product?.price ?? 0);
        return sum + price * line.quantity;
      }, 0),
    [lines],
  );

  function updateQty(productId: string, quantity: number) {
    setLines((prev) =>
      prev.map((l) =>
        l.productId === productId ? { ...l, quantity: Math.max(1, quantity) } : l,
      ),
    );
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      appToast.error('quoteLoginRequired');
      navigate(
        `${storePath('account/login')}?next=${encodeURIComponent(
          productParam
            ? `${storePath('quote')}?product=${productParam}`
            : storePath('quote'),
        )}`,
      );
      return;
    }
    if (!lines.length) {
      appToast.error('quoteFailed');
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      appToast.error('quoteFailed');
      return;
    }
    if (!company.trim()) {
      appToast.error('quoteCompanyRequired');
      return;
    }

    setBusy(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        company: company.trim(),
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        message: [message.trim(), attachmentNote.trim() ? `Attachments: ${attachmentNote}` : '']
          .filter(Boolean)
          .join('\n\n'),
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      };
      const { data } = await quotesApi.create(payload);
      appToast.success('quoteSubmitted', { quoteNumber: data.quoteNumber });
      navigate(storePath('account/quotes'));
    } catch {
      appToast.error('quoteFailed');
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || !initialized || (productParam && seedProduct.isLoading)) {
    return <LoadingState variant="page" />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <Seo title={locale === 'ar' ? 'طلب عرض سعر' : 'Request quote'} path={storePath('quote')} />
        <StorePageHeader
          title={locale === 'ar' ? 'طلب عرض سعر' : 'Request a quote'}
          description={
            locale === 'ar'
              ? 'سعر أوضح لمشروعك — وغالباً خصم للكميات والشركات'
              : 'A clearer price for your project — often with volume or company discounts'
          }
        />
        <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10">
          <QuoteExplainSection
            locale={locale}
            variant="guest"
            onPrimary={() =>
              navigate(
                `${storePath('account/login')}?next=${encodeURIComponent(
                  productParam
                    ? `${storePath('quote')}?product=${productParam}`
                    : storePath('quote'),
                )}`,
              )
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title={locale === 'ar' ? 'طلب عرض سعر' : 'Request quote'} path={storePath('quote')} />
      <StorePageHeader
        title={locale === 'ar' ? 'طلب عرض سعر' : 'Request a quote'}
        description={
          locale === 'ar'
            ? 'اختَر المنتجات، اكتب بياناتك واسم الشركة، ونرد عليك بسعر مناسب'
            : 'Pick products, add your details and company, and we’ll reply with a fair price'
        }
      />

      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10">
        {!lines.length ? (
          <QuoteExplainSection
            locale={locale}
            variant="empty-products"
            onPrimary={() => navigate(storePath('products'))}
          />
        ) : (
          <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-7">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-bold text-fg">
                  {locale === 'ar' ? 'المنتجات المحددة' : 'Selected products'}
                </h2>
              </div>
              {lines.map((line) => {
                const img =
                  line.product?.images?.[0]?.url || line.product?.imageUrl || null;
                return (
                  <div
                    key={line.productId}
                    className="store-surface flex gap-3 p-3 sm:items-center sm:p-4"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-mist dark:bg-muted/40">
                      {img ? (
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={storePath(`products/${line.product?.slug || ''}`)}
                        className="line-clamp-2 text-sm font-bold text-fg hover:text-accent"
                      >
                        {line.product?.name || 'Product'}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">SKU {line.product?.sku}</p>
                      <p className="mt-1 text-sm font-bold text-navy dark:text-accent">
                        {commerce.formatDisplayPrice(
                          line.product?.price,
                          line.product?.currency,
                          moneyLocale,
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex h-9 items-center rounded-lg border border-border bg-page px-1">
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-muted"
                          onClick={() => updateQty(line.productId, line.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-bold tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-muted"
                          onClick={() => updateQty(line.productId, line.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"
                        onClick={() => removeLine(line.productId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {locale === 'ar' ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  </div>
                );
              })}
              <Link
                to={storePath('products')}
                className="inline-flex text-sm font-semibold text-accent hover:text-accent-soft"
              >
                {locale === 'ar' ? '+ إضافة منتجات أخرى' : '+ Add more products'}
              </Link>
            </div>

            <aside className="lg:col-span-5">
              <div className="store-surface sticky top-28 space-y-5 p-5">
                <div className="rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-sm">
                  {locale === 'ar' ? 'حساب موثّق OTP:' : 'OTP verified:'}{' '}
                  <strong>
                    {user?.firstName} {user?.lastName}
                  </strong>{' '}
                  · {user?.phone}
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-accent" />
                    <h2 className="text-sm font-bold text-fg">
                      {locale === 'ar' ? 'معلوماتك الشخصية' : 'Your information'}
                    </h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>{locale === 'ar' ? 'الاسم الأول *' : 'First name *'}</Label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{locale === 'ar' ? 'اسم العائلة *' : 'Last name *'}</Label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>{locale === 'ar' ? 'الهاتف *' : 'Phone *'}</Label>
                      <Input value={phone} readOnly className="opacity-80" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>{locale === 'ar' ? 'البريد' : 'Email'}</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-accent" />
                    <h2 className="text-sm font-bold text-fg">
                      {locale === 'ar' ? 'معلومات الشركة' : 'Company information'}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>{locale === 'ar' ? 'اسم الشركة *' : 'Company name *'}</Label>
                      <Input
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                        placeholder={
                          locale === 'ar' ? 'شركة / مؤسسة' : 'Company / organization'
                        }
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
                    <div className="space-y-1.5">
                      <Label>{locale === 'ar' ? 'عنوان الشركة' : 'Company address'}</Label>
                      <Textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>{locale === 'ar' ? 'الرسالة / تفاصيل المشروع' : 'Message / project details'}</Label>
                  <Textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      locale === 'ar'
                        ? 'المشروع، الموقع، والجدول الزمني...'
                        : 'Project, location, timeline...'
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="inline-flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    {locale === 'ar' ? 'مرفقات / روابط' : 'File links'}
                  </Label>
                  <Textarea
                    rows={2}
                    value={attachmentNote}
                    onChange={(e) => setAttachmentNote(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="text-muted">
                    {locale === 'ar' ? 'تقدير المنتجات' : 'Catalog estimate'}
                  </span>
                  <span className="font-bold text-fg">
                    {commerce.formatDisplayPrice(subtotal, 'USD', moneyLocale)}
                  </span>
                </div>

                <Button type="submit" size="lg" className="w-full rounded-xl" disabled={busy}>
                  {busy
                    ? locale === 'ar'
                      ? 'جارٍ الإرسال…'
                      : 'Submitting…'
                    : locale === 'ar'
                      ? 'إرسال طلب العرض'
                      : 'Submit quote request'}
                </Button>
              </div>
            </aside>
          </form>
        )}
      </div>
    </>
  );
}
