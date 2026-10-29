import { useState } from 'react';
import { Check, Truck } from 'lucide-react';
import { IRAQ_GOVERNORATES, type IraqGovId } from '@/data/iraq-governorates';
import { ReadyIraqMap } from '@/components/ReadyIraqMap';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/utils';

type Labels = {
  coverage: string;
  coverageTitle: string;
  coverageSub: string;
  coverageCount: string;
  coverageFrom: string;
  coverageTo: string;
  coverageBadge: string;
};

export function NationwideCoverage({
  locale,
  labels,
}: {
  locale: 'en' | 'ar';
  labels: Labels;
}) {
  const [hovered, setHovered] = useState<IraqGovId | null>(null);
  const total = IRAQ_GOVERNORATES.length;
  const activeName = hovered
    ? locale === 'ar'
      ? IRAQ_GOVERNORATES.find((g) => g.id === hovered)?.nameAr
      : IRAQ_GOVERNORATES.find((g) => g.id === hovered)?.nameEn
    : null;

  return (
    <section className="relative overflow-hidden border-b border-line bg-page text-fg">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 50% 40% at 10% 20%, rgb(0 112 192 / 0.10), transparent 55%), radial-gradient(ellipse 40% 50% at 90% 80%, rgb(0 112 192 / 0.08), transparent 50%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[90rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-10 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <Reveal className="order-2 min-w-0 lg:order-1">
            <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#0a0a0a] dark:shadow-none">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <p className="inline-flex min-w-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                  <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{labels.coverageBadge}</span>
                </p>
                <p className="max-w-[45%] truncate text-end font-kpi text-sm text-muted dark:text-white/45">
                  {activeName ?? `${total}/${total}`}
                </p>
              </div>

              <ReadyIraqMap
                mode="coverage"
                locale={locale}
                hovered={hovered}
                onHover={setHovered}
                ariaLabel={labels.coverageTitle}
              />

              <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-muted dark:text-white/35">
                {labels.coverageFrom} → {labels.coverageTo}
              </p>
            </div>
          </Reveal>

          <div className="order-1 min-w-0 lg:order-2">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                {labels.coverage}
              </p>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                {labels.coverageTitle}
              </h2>
              <p className="mt-5 max-w-xl text-sm font-medium leading-relaxed text-muted sm:text-lg">
                {labels.coverageSub}
              </p>
            </Reveal>

            <Reveal delay={1} className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-1">
              <span className="font-kpi text-5xl leading-none text-accent sm:text-7xl">{total}</span>
              <span className="pb-1 text-xs font-bold uppercase tracking-[0.18em] text-muted sm:pb-2 sm:text-sm">
                {labels.coverageCount}
              </span>
            </Reveal>

            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {IRAQ_GOVERNORATES.map((g, i) => {
                const isHot = hovered === g.id;
                return (
                  <Reveal key={g.id} delay={i % 6}>
                    <button
                      type="button"
                      onMouseEnter={() => setHovered(g.id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(g.id)}
                      onBlur={() => setHovered(null)}
                      className={cn(
                        'coverage-chip group flex w-full min-w-0 items-center gap-1.5 rounded-lg border px-2.5 py-2.5 text-start transition duration-300 sm:gap-2 sm:px-3',
                        isHot
                          ? 'border-accent bg-accent text-white'
                          : 'border-border bg-card hover:border-accent/50 hover:bg-accent/10 dark:border-border/80',
                      )}
                    >
                      <Check
                        className={cn(
                          'h-3.5 w-3.5 shrink-0',
                          isHot ? 'text-white' : 'text-accent',
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 truncate text-xs font-bold tracking-tight sm:text-sm">
                        {locale === 'ar' ? g.nameAr : g.nameEn}
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
