import fs from 'fs';

const path = 'apps/web/src/pages/corporate/CmsPages.tsx';
const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

const brandsStart = lines.findIndex((l) => l.startsWith('export function BrandsPage()'));
const projectCoverStart = lines.findIndex((l) => l.startsWith('function projectCover'));
const projectsStart = lines.findIndex((l) => l.startsWith('export function ProjectsPage()'));

if (brandsStart < 0 || projectCoverStart < 0 || projectsStart < 0) {
  throw new Error(
    `markers missing brands=${brandsStart} cover=${projectCoverStart} projects=${projectsStart}`,
  );
}

const helpersAndBrands = `function LogoBandHero({
  title,
  subtitle,
  centered = false,
}: {
  title: string;
  subtitle: string;
  centered?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-accent text-white">
      <div
        className="pointer-events-none absolute -end-8 top-0 h-24 w-40 -skew-x-12 bg-[#1a1a1a]/35 sm:h-28 sm:w-52"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute end-16 top-1/2 hidden h-14 w-24 -translate-y-1/2 -skew-x-12 bg-white/10 sm:block"
        aria-hidden
      />
      <div
        className={cn(
          'relative mx-auto max-w-[90rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-10',
          centered ? 'text-center' : '',
        )}
      >
        <h1 className="text-3xl font-extrabold uppercase tracking-[0.04em] sm:text-5xl">
          {title}
        </h1>
        <p
          className={cn(
            'mt-5 text-sm leading-relaxed text-white/90 sm:text-base',
            centered ? 'mx-auto max-w-xl' : 'max-w-3xl',
          )}
        >
          {subtitle}
        </p>
      </div>
    </section>
  );
}

function LogoGrid({
  items,
}: {
  items: readonly { name: string; logo: string; slug: string }[];
}) {
  return (
    <div className="grid grid-cols-2 border-t border-line sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.slug}
          className="logo-cell flex min-h-[120px] items-center justify-center border-b border-e border-line bg-white px-4 py-8 sm:min-h-[150px] sm:px-8 sm:py-10"
        >
          <img
            src={item.logo}
            alt={item.name}
            className="max-h-14 w-auto max-w-[85%] object-contain sm:max-h-16"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

export function BrandsPage() {
  const { t, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const p = t.pages;

  return (
    <>
      <Seo title={p.brandsHero} path="/brands" description={p.brandsHeroSub} />
      <LogoBandHero title={p.brandsHero} subtitle={p.brandsHeroSub} />

      <section className="bg-white">
        <div className="mx-auto max-w-[90rem]">
          <LogoGrid items={MANUFACTURER_BRANDS} />
        </div>
      </section>

      <section className="border-t border-line bg-page py-12 text-fg sm:py-16">
        <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <div className="max-w-xl">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              {p.brandsCtaTitle}
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">{p.brandsCtaSub}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/contact" className="btn-cta btn-cta-primary btn-shine w-full sm:w-auto">
              {p.brandsCtaContact}
              <Arrow className="h-4 w-4" />
            </Link>
            <Link to={storePath()} className="btn-cta btn-cta-dark w-full sm:w-auto">
              {p.brandsCtaStore}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
`.split('\n');

const before = lines.slice(0, brandsStart);
const middle = lines.slice(projectCoverStart, projectsStart);
const projectsFn = lines.slice(projectsStart);

// Find and replace ProjectsPage hero block
const joined = projectsFn.join('\n');
const seoIdx = projectsFn.findIndex((l) => l.includes('path="/projects"'));
const listSectionIdx = projectsFn.findIndex((l) => l.includes('{p.projectsList}'));
if (seoIdx < 0 || listSectionIdx < 0) {
  throw new Error('project sections not found ' + seoIdx + ' ' + listSectionIdx);
}

// Find the section that contains projectsList - go back to its opening <section
let listSectionStart = listSectionIdx;
while (listSectionStart > 0 && !projectsFn[listSectionStart].includes('<section')) {
  listSectionStart -= 1;
}

const projectsHead = `export function ProjectsPage() {
  const { t, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const p = t.pages;

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await cmsApi.projects()).data,
  });

  const projects = useMemo(
    () =>
      [...(query.data ?? [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title),
      ),
    [query.data],
  );

  const featured = projects.find((item) => item.featured) ?? projects[0];
  const rest = featured ? projects.filter((item) => item.id !== featured.id) : [];

  const process = [
    { title: p.projectsStep1, sub: p.projectsStep1Sub },
    { title: p.projectsStep2, sub: p.projectsStep2Sub },
    { title: p.projectsStep3, sub: p.projectsStep3Sub },
  ];

  return (
    <>
      <Seo title={p.projectsHero} path="/projects" description={p.projectsHeroSub} />
      <LogoBandHero title={p.projectsHero} subtitle={p.projectsHeroSub} centered />

      <section className="bg-white">
        <div className="mx-auto max-w-[90rem]">
          <LogoGrid items={CLIENT_LOGOS} />
        </div>
      </section>
`.split('\n');

const projectsTail = projectsFn.slice(listSectionStart);
const out = [...before, ...helpersAndBrands, '', ...middle, ...projectsHead, ...projectsTail];
fs.writeFileSync(path, out.join('\n'));
console.log('ok', {
  brandsStart,
  projectCoverStart,
  projectsStart,
  listSectionStart,
  lines: out.length,
});
