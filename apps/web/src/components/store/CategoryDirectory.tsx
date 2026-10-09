import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bolt,
  Box,
  Cable,
  CircuitBoard,
  Cog,
  Factory,
  Flame,
  Gauge,
  HardHat,
  Layers,
  Package,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { storePath } from '@/lib/urls';
import type { Category } from '@/types';

const CAT_ICONS: LucideIcon[] = [
  Wrench,
  Bolt,
  Gauge,
  Cable,
  CircuitBoard,
  Cog,
  Flame,
  HardHat,
  Factory,
  Layers,
  Box,
  Package,
];

export function categoryIcon(slug: string, index: number): LucideIcon {
  const s = slug.toLowerCase();
  if (s.includes('cable') || s.includes('wire')) return Cable;
  if (s.includes('pump') || s.includes('valve')) return Gauge;
  if (s.includes('electr') || s.includes('power')) return Bolt;
  if (s.includes('tool') || s.includes('wrench')) return Wrench;
  if (s.includes('safe') || s.includes('ppe')) return HardHat;
  if (s.includes('fire')) return Flame;
  if (s.includes('indust') || s.includes('factory')) return Factory;
  return CAT_ICONS[index % CAT_ICONS.length];
}

function IndexMark({ n }: { n: number }) {
  return (
    <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-accent-soft/90">
      {String(n).padStart(2, '0')}
    </span>
  );
}

/** Home showcase: featured lead + compact rail — industrial catalog feel. */
export function CategoryHomeShowcase({
  categories,
  locale,
}: {
  categories: Category[];
  locale: string;
}) {
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  if (!categories.length) return null;

  const [lead, ...rest] = categories;
  const LeadIcon = categoryIcon(lead.slug, 0);
  const childCount = lead.children?.length ?? 0;

  return (
    <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
      <Link
        to={storePath(`categories/${lead.slug}`)}
        className="group relative isolate min-h-[18rem] overflow-hidden bg-navy text-white sm:min-h-[22rem] lg:col-span-7 lg:min-h-[26rem]"
      >
        {lead.imageUrl ? (
          <img
            src={lead.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgb(0_112_192/0.35),transparent_55%),linear-gradient(160deg,#0b1f3a,#071525)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050d18] via-[#050d18]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050d18]/70 via-transparent to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-6 sm:p-8 lg:p-10">
          <IndexMark n={1} />
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
            {locale === 'ar' ? 'مجموعة رئيسية' : 'Primary group'}
            {childCount
              ? ` · ${childCount} ${locale === 'ar' ? 'قسم' : 'sections'}`
              : ''}
          </p>
          <h3 className="mt-2 max-w-lg text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            {lead.name}
          </h3>
          {lead.description ? (
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70 line-clamp-2">
              {lead.description}
            </p>
          ) : null}
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent-soft transition group-hover:gap-3">
            {locale === 'ar' ? 'استكشف المجموعة' : 'Explore group'}
            <Arrow className="h-4 w-4" />
          </span>
          {!lead.imageUrl ? (
            <LeadIcon className="pointer-events-none absolute end-6 top-6 h-16 w-16 text-white/10 sm:end-8 sm:top-8 sm:h-20 sm:w-20" />
          ) : null}
        </div>
      </Link>

      <div className="flex flex-col gap-3 lg:col-span-5">
        {rest.slice(0, 4).map((c, i) => {
          const Icon = categoryIcon(c.slug, i + 1);
          const kids = c.children?.length ?? 0;
          return (
            <Link
              key={c.id}
              to={storePath(`categories/${c.slug}`)}
              className="group relative flex min-h-[5.5rem] flex-1 overflow-hidden border border-border bg-card transition duration-300 hover:border-accent/50"
            >
              <div className="relative w-[5.5rem] shrink-0 self-stretch bg-navy/5 sm:w-28">
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-accent">
                    <Icon className="h-6 w-6 opacity-70" />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <IndexMark n={i + 2} />
                  {kids > 0 ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {kids} {locale === 'ar' ? 'أقسام' : 'sections'}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-base font-extrabold tracking-tight text-fg group-hover:text-accent">
                  {c.name}
                </p>
                {c.description ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted">{c.description}</p>
                ) : null}
              </div>
              <span className="me-3 flex items-center text-muted opacity-0 transition group-hover:opacity-100 sm:me-4">
                <Arrow className="h-4 w-4 text-accent" />
              </span>
            </Link>
          );
        })}
        {rest.length > 4 ? (
          <Link
            to={storePath('categories')}
            className="inline-flex items-center justify-center gap-2 border border-dashed border-border px-4 py-3 text-sm font-bold text-muted transition hover:border-accent/40 hover:text-accent"
          >
            {locale === 'ar'
              ? `+${rest.length - 4} مجموعات أخرى`
              : `+${rest.length - 4} more groups`}
            <Arrow className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

/** Full categories index — editorial group bands with section rows. */
export function CategoryCatalog({
  categories,
  locale,
}: {
  categories: Category[];
  locale: string;
}) {
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-10 sm:space-y-14">
      {categories.map((group, i) => {
        const Icon = categoryIcon(group.slug, i);
        const kids = group.children ?? [];
        return (
          <article key={group.id} className="store-cat" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
            <Link
              to={storePath(`categories/${group.slug}`)}
              className="group relative block isolate overflow-hidden bg-navy text-white"
            >
              <div className="relative aspect-[2.4/1] min-h-[11rem] sm:min-h-[14rem] lg:aspect-[3/1] lg:min-h-[16rem]">
                {group.imageUrl ? (
                  <img
                    src={group.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgb(0_112_192/0.28),transparent_50%),linear-gradient(135deg,#0b1f3a_0%,#071525_100%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050d18] via-[#050d18]/45 to-[#050d18]/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050d18]/80 via-[#050d18]/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7 lg:p-9">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <IndexMark n={i + 1} />
                      <span className="h-px w-8 bg-accent/70" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                        {locale === 'ar' ? 'مجموعة' : 'Group'}
                        {kids.length
                          ? ` · ${kids.length} ${locale === 'ar' ? 'قسم' : 'sections'}`
                          : ''}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                      {group.name}
                    </h2>
                    {group.description ? (
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65 line-clamp-2">
                        {group.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="hidden shrink-0 items-center gap-2 self-end pb-1 text-sm font-bold text-accent-soft sm:inline-flex">
                    {locale === 'ar' ? 'افتح' : 'Open'}
                    <Arrow className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  </span>
                </div>
                {!group.imageUrl ? (
                  <Icon className="pointer-events-none absolute end-6 top-6 h-14 w-14 text-white/10 sm:end-10 sm:top-8 sm:h-16 sm:w-16" />
                ) : null}
              </div>
            </Link>

            {kids.length > 0 ? (
              <ul className="divide-y divide-border border-x border-b border-border bg-card">
                {kids.map((child, ci) => {
                  const ChildIcon = categoryIcon(child.slug, ci);
                  return (
                    <li key={child.id}>
                      <Link
                        to={storePath(`categories/${child.slug}`)}
                        className="group/row flex items-center gap-3 px-4 py-3.5 transition hover:bg-page sm:gap-4 sm:px-6 sm:py-4"
                      >
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden bg-navy/5 sm:h-14 sm:w-14">
                          {child.imageUrl ? (
                            <img
                              src={child.imageUrl}
                              alt=""
                              className="h-full w-full object-cover transition duration-500 group-hover/row:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-accent">
                              <ChildIcon className="h-5 w-5 opacity-70" />
                            </span>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-fg group-hover/row:text-accent sm:text-base">
                            {child.name}
                          </p>
                          {child.description ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted sm:text-[13px]">
                              {child.description}
                            </p>
                          ) : null}
                        </div>
                        <Arrow className="h-4 w-4 shrink-0 text-muted transition group-hover/row:text-accent" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

/** Sub-sections grid on a category detail page. */
export function CategoryChildrenGrid({
  items,
  locale,
}: {
  items: Category[];
  locale: string;
}) {
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  if (!items.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((child, i) => {
        const Icon = categoryIcon(child.slug, i);
        return (
          <Link
            key={child.id}
            to={storePath(`categories/${child.slug}`)}
            className="group relative flex min-h-[7.5rem] overflow-hidden border border-border bg-card transition duration-300 hover:border-accent/45"
          >
            <div className="relative w-[5.25rem] shrink-0 self-stretch bg-navy sm:w-28">
              {child.imageUrl ? (
                <img
                  src={child.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[linear-gradient(160deg,#0b1f3a,#123456)]">
                  <Icon className="h-6 w-6 text-white/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/10" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
              <IndexMark n={i + 1} />
              <p className="mt-1 truncate font-extrabold tracking-tight text-fg group-hover:text-accent">
                {child.name}
              </p>
              {child.description ? (
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                  {child.description}
                </p>
              ) : null}
            </div>
            <span className="me-3 flex items-center sm:me-4">
              <Arrow className="h-4 w-4 text-muted transition group-hover:text-accent" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function CategoryHero({
  category,
  locale,
  backHref = storePath('categories'),
}: {
  category: Category;
  locale: string;
  backHref?: string;
}) {
  const Back = locale === 'ar' ? ArrowRight : ArrowLeft;
  const Icon = categoryIcon(category.slug, 0);
  const kids = category.children?.length ?? 0;
  const isGroup = kids > 0;

  return (
    <div className="relative isolate overflow-hidden bg-navy text-white">
      <div className="relative min-h-[14rem] sm:min-h-[18rem] lg:min-h-[20rem]">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgb(0_112_192/0.35),transparent_55%),linear-gradient(145deg,#0b1f3a,#071525)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050d18] via-[#050d18]/55 to-[#050d18]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050d18]/75 via-transparent to-transparent" />
        <div className="relative mx-auto flex min-h-[14rem] max-w-[90rem] flex-col justify-end px-4 py-8 sm:min-h-[18rem] sm:px-6 sm:py-10 lg:min-h-[20rem] lg:px-10 lg:py-12">
          <Link
            to={backHref}
            className="mb-auto inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/70 transition hover:text-white"
          >
            <Back className="h-3.5 w-3.5" />
            {locale === 'ar' ? 'كل المجموعات' : 'All groups'}
          </Link>
          <div className="mt-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                {isGroup
                  ? locale === 'ar'
                    ? `مجموعة · ${kids} قسم`
                    : `Group · ${kids} sections`
                  : locale === 'ar'
                    ? 'قسم منتجات'
                    : 'Product section'}
              </span>
            </div>
            <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {category.name}
            </h1>
            {category.description ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                {category.description}
              </p>
            ) : null}
          </div>
          {!category.imageUrl ? (
            <Icon className="pointer-events-none absolute end-6 top-1/2 h-24 w-24 -translate-y-1/2 text-white/[0.07] sm:end-10 sm:h-32 sm:w-32" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
