import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { catalogApi, cmsApi } from '@/services/endpoints';
import { STORE_URL } from '@/lib/urls';
import { useI18n } from '@/i18n/i18n-context';

function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="relative overflow-x-clip text-white">
      <div className="absolute inset-0 hero-plane" />
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
        <h1 className="reveal max-w-3xl break-words text-3xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="reveal reveal-delay-1 mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function AboutPage() {
  const { locale } = useI18n();
  const page = useQuery({
    queryKey: ['page', 'about'],
    queryFn: async () => {
      try {
        return (await cmsApi.pageBySlug('about')).data;
      } catch {
        return null;
      }
    },
  });

  return (
    <>
      <Seo title={locale === 'ar' ? 'من نحن' : 'About'} path="/about" />
      <PageHero
        title={locale === 'ar' ? 'من نحن' : 'About Energy Horizon'}
        subtitle={
          locale === 'ar'
            ? 'افاق الطاقة — شريك صناعي لعمليات النفط والغاز.'
            : 'افاق الطاقة — industrial partners for oil & gas operations.'
        }
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {page.isLoading ? <LoadingState /> : null}
        {page.data?.content ? (
          <div className="whitespace-pre-wrap text-base leading-relaxed text-muted">
            {page.data.content}
          </div>
        ) : (
          <div className="space-y-5 text-base leading-relaxed text-muted">
            <p>
              {locale === 'ar'
                ? 'توفّر افاق الطاقة معدات صناعية وخدمات هندسية لمشغّلي النفط والغاز عبر مراحل الإنتاج. نجمع بين كتالوج منتجات مُختار وفرق جاهزة للميدان.'
                : 'Energy Horizon supplies industrial equipment and engineering services for upstream, midstream, and downstream operators. We combine a curated product catalog with field-ready teams.'}
            </p>
            <p>
              {locale === 'ar'
                ? 'حضورنا ثنائي اللغة — Energy Horizon / افاق الطاقة — يعكس انتشاراً إقليمياً والتزاماً بالتسليم الموثوق.'
                : 'Our bilingual brand — Energy Horizon / افاق الطاقة — reflects a regional footprint and a commitment to dependable delivery.'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export function ServicesPage() {
  const { locale } = useI18n();
  const query = useQuery({
    queryKey: ['services'],
    queryFn: async () => (await cmsApi.services()).data,
  });

  return (
    <>
      <Seo title={locale === 'ar' ? 'الخدمات' : 'Services'} path="/services" />
      <PageHero
        title={locale === 'ar' ? 'الخدمات' : 'Services'}
        subtitle={
          locale === 'ar'
            ? 'هندسة وتشغيل ودعم ميداني.'
            : 'Engineering, commissioning, and operational support.'
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
        <div className="divide-y divide-[var(--border)] border-y border-line">
          {(query.data ?? []).map((s, i) => (
            <Link
              key={s.id}
              to={`/services/${s.slug}`}
              className="group grid gap-2 py-7 transition sm:grid-cols-[4rem_1fr] sm:gap-8"
            >
              <span className="text-sm tabular-nums text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h2 className="text-xl font-semibold text-fg transition group-hover:text-accent">
                  {s.name}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted line-clamp-3">
                  {s.shortDescription || s.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {!query.isLoading && !(query.data ?? []).length ? (
          <EmptyState title={locale === 'ar' ? 'لا توجد خدمات' : 'No services published'} />
        ) : null}
      </div>
    </>
  );
}

export function ServiceDetailPage({ slug }: { slug: string }) {
  const query = useQuery({
    queryKey: ['service', slug],
    queryFn: async () => (await cmsApi.serviceBySlug(slug)).data,
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return <ErrorState title="Service not found" onRetry={() => void query.refetch()} />;
  }

  return (
    <>
      <Seo
        title={query.data.name}
        path={`/services/${slug}`}
        description={query.data.shortDescription || undefined}
      />
      <PageHero title={query.data.name} subtitle={query.data.shortDescription || undefined} />
      <div className="mx-auto max-w-3xl px-4 py-16 whitespace-pre-wrap text-base leading-relaxed text-muted sm:px-6 lg:px-8">
        {query.data.description || 'Details coming soon.'}
      </div>
    </>
  );
}

export function BrandsPage() {
  const { locale } = useI18n();
  const query = useQuery({
    queryKey: ['brands-public'],
    queryFn: async () => (await catalogApi.brands()).data,
  });

  return (
    <>
      <Seo title={locale === 'ar' ? 'العلامات' : 'Brands'} path="/brands" />
      <PageHero
        title={locale === 'ar' ? 'العلامات التجارية' : 'Brands'}
        subtitle={
          locale === 'ar'
            ? 'الشركات وخطوط المنتجات التي نمثّلها.'
            : 'Manufacturers and product lines we represent.'
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
        <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          {(query.data ?? []).map((b) => (
            <a
              key={b.id}
              href={`${STORE_URL.replace(/\/$/, '')}/brands/${b.slug}`}
              className="bg-[var(--card)] p-8 transition hover:bg-elevated"
            >
              <h2 className="text-lg font-semibold text-fg">{b.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">{b.description}</p>
            </a>
          ))}
        </div>
        {!query.isLoading && !(query.data ?? []).length ? (
          <EmptyState title={locale === 'ar' ? 'لا توجد علامات' : 'No brands yet'} />
        ) : null}
      </div>
    </>
  );
}

export function ProjectsPage() {
  const { locale } = useI18n();
  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await cmsApi.projects()).data,
  });

  return (
    <>
      <Seo title={locale === 'ar' ? 'المشاريع' : 'Projects'} path="/projects" />
      <PageHero
        title={locale === 'ar' ? 'المشاريع' : 'Projects'}
        subtitle={
          locale === 'ar'
            ? 'نماذج من التنفيذ والتسليم.'
            : 'Selected deployments and delivery highlights.'
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
        <div className="divide-y divide-[var(--border)] border-y border-line">
          {(query.data ?? []).map((p) => (
            <article key={p.id} className="py-8">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                {[p.client, p.location].filter(Boolean).join(' · ') || '—'}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-fg">{p.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
                {p.shortDescription || p.description}
              </p>
            </article>
          ))}
        </div>
        {!query.isLoading && !(query.data ?? []).length ? (
          <EmptyState title={locale === 'ar' ? 'لا توجد مشاريع' : 'No projects published'} />
        ) : null}
      </div>
    </>
  );
}

export function NewsPage() {
  const { locale } = useI18n();
  const query = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const res = await cmsApi.news();
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  return (
    <>
      <Seo title={locale === 'ar' ? 'الأخبار' : 'News'} path="/news" />
      <PageHero
        title={locale === 'ar' ? 'الأخبار' : 'News & insights'}
        subtitle={
          locale === 'ar' ? 'تحديثات من افاق الطاقة.' : 'Updates from Energy Horizon.'
        }
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
        <div className="divide-y divide-[var(--border)] border-y border-line">
          {(query.data ?? []).map((n) => (
            <Link key={n.id} to={`/news/${n.slug}`} className="group block py-8">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                {n.publishedAt
                  ? new Date(n.publishedAt).toLocaleDateString(
                      locale === 'ar' ? 'ar-IQ' : 'en-GB',
                      { year: 'numeric', month: 'short', day: 'numeric' },
                    )
                  : ''}
                {n.author ? ` · ${n.author}` : ''}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-fg transition group-hover:text-accent">
                {n.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{n.excerpt}</p>
            </Link>
          ))}
        </div>
        {!query.isLoading && !(query.data ?? []).length ? (
          <EmptyState title={locale === 'ar' ? 'لا توجد أخبار' : 'No news yet'} />
        ) : null}
      </div>
    </>
  );
}

export function NewsDetailPage({ slug }: { slug: string }) {
  const query = useQuery({
    queryKey: ['news', slug],
    queryFn: async () => (await cmsApi.newsBySlug(slug)).data,
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return <ErrorState title="Article not found" onRetry={() => void query.refetch()} />;
  }

  return (
    <>
      <Seo
        title={query.data.title}
        path={`/news/${slug}`}
        description={query.data.excerpt || undefined}
      />
      <PageHero title={query.data.title} subtitle={query.data.excerpt || undefined} />
      <article className="mx-auto max-w-3xl px-4 py-16 whitespace-pre-wrap text-base leading-relaxed text-muted sm:px-6 lg:px-8">
        {query.data.content || 'Full article coming soon.'}
      </article>
    </>
  );
}

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactPage() {
  const { locale } = useI18n();
  const offices = useQuery({
    queryKey: ['offices'],
    queryFn: async () => (await cmsApi.offices()).data,
  });
  const form = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactForm) {
    const subject = encodeURIComponent(`Inquiry from ${values.firstName} ${values.lastName}`);
    const body = encodeURIComponent(
      [
        `Name: ${values.firstName} ${values.lastName}`,
        `Email: ${values.email}`,
        values.phone ? `Phone: ${values.phone}` : '',
        values.company ? `Company: ${values.company}` : '',
        '',
        values.message,
      ]
        .filter(Boolean)
        .join('\n'),
    );
    window.location.href = `mailto:info@energy-horizon.net?subject=${subject}&body=${body}`;
    toast.success(
      locale === 'ar'
        ? 'جارٍ فتح برنامج البريد… لطلبات المنتجات استخدم المتجر.'
        : 'Opening your email client… For product quotes, use the store.',
    );
    form.reset();
  }

  return (
    <>
      <Seo title={locale === 'ar' ? 'تواصل معنا' : 'Contact'} path="/contact" />
      <PageHero
        title={locale === 'ar' ? 'تواصل معنا' : 'Contact'}
        subtitle={
          locale === 'ar'
            ? 'اطلب عرض سعر أو تحدّث مع الفريق التجاري.'
            : 'Request a quote or speak with our commercial team.'
        }
      />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3 border border-line bg-[var(--card)] p-6 sm:p-8"
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
            placeholder={locale === 'ar' ? 'كيف يمكننا المساعدة؟' : 'How can we help?'}
            {...form.register('message')}
          />
          <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-sm">
            {form.formState.isSubmitting
              ? locale === 'ar'
                ? 'جارٍ الإرسال…'
                : 'Sending…'
              : locale === 'ar'
                ? 'إرسال الطلب'
                : 'Send request'}
          </Button>
        </form>
        <div>
          <h2 className="text-2xl font-semibold text-fg">
            {locale === 'ar' ? 'المكاتب' : 'Offices'}
          </h2>
          {offices.isLoading ? <LoadingState /> : null}
          <div className="mt-6 divide-y divide-[var(--border)] border-y border-line">
            {(offices.data ?? []).map((o) => (
              <div key={o.id} className="py-5 text-sm">
                <p className="font-semibold text-fg">{o.name}</p>
                <p className="mt-1 text-muted">{[o.city, o.country].filter(Boolean).join(', ')}</p>
                {o.phone ? (
                  <a href={`tel:${o.phone.replace(/\s/g, '')}`} className="mt-2 inline-block text-accent">
                    {o.phone}
                  </a>
                ) : null}
                {o.email ? <p className="mt-1 text-muted">{o.email}</p> : null}
                {o.contactPerson ? (
                  <p className="mt-2 text-muted">
                    {locale === 'ar' ? 'المسؤول: ' : 'Contact: '}
                    {o.contactPerson}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          {!offices.isLoading && !(offices.data ?? []).length ? (
            <EmptyState
              title={locale === 'ar' ? 'تفاصيل المكاتب قريباً' : 'Office details coming soon'}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
