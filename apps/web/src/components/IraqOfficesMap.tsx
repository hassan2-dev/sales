import { useEffect, useMemo, useState } from 'react';
import { Building2, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import type { Office } from '@/types';
import {
  IRAQ_CITY_ALIASES,
  IRAQ_GOVERNORATES,
  type IraqGovId,
} from '@/data/iraq-governorates';
import { ReadyIraqMap } from '@/components/ReadyIraqMap';

function normalizeCity(value?: string | null) {
  return (value ?? '').trim().toLowerCase();
}

function resolveGovId(office: Office): IraqGovId | null {
  const raw = office.city || office.name;
  if (!raw) return null;
  const key = normalizeCity(raw);
  if (IRAQ_CITY_ALIASES[key]) return IRAQ_CITY_ALIASES[key];

  for (const [alias, id] of Object.entries(IRAQ_CITY_ALIASES)) {
    if (key.includes(alias) || alias.includes(key)) return id;
  }

  for (const g of IRAQ_GOVERNORATES) {
    if (key.includes(g.id) || key.includes(g.nameEn.toLowerCase())) return g.id;
  }
  return null;
}

type Labels = {
  offices: string;
  officesSub: string;
  selectGov: string;
  selectGovHint: string;
  noBranch: string;
  hasBranch: string;
  callOffice: string;
};

export function IraqOfficesMap({
  offices,
  locale,
  labels,
}: {
  offices: Office[];
  locale: 'en' | 'ar';
  labels: Labels;
}) {
  const officeByGov = useMemo(() => {
    const map = new Map<IraqGovId, Office>();
    for (const office of offices) {
      const id = resolveGovId(office);
      if (id && !map.has(id)) map.set(id, office);
    }
    return map;
  }, [offices]);

  const activeIds = useMemo(() => new Set(officeByGov.keys()), [officeByGov]);

  const defaultId = useMemo(() => {
    if (officeByGov.has('baghdad')) return 'baghdad' as IraqGovId;
    return [...officeByGov.keys()][0] ?? null;
  }, [officeByGov]);

  const [hovered, setHovered] = useState<IraqGovId | null>(null);
  const [selected, setSelected] = useState<IraqGovId | null>(null);

  useEffect(() => {
    if (defaultId) setSelected((prev) => prev ?? defaultId);
  }, [defaultId]);

  const selectedGov = IRAQ_GOVERNORATES.find((g) => g.id === selected) ?? null;
  const selectedOffice = selected ? officeByGov.get(selected) ?? null : null;
  const hoveredGov = IRAQ_GOVERNORATES.find((g) => g.id === hovered) ?? null;

  return (
    <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]" dir="ltr">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card dark:border-white/10 dark:bg-black/35">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 20%, rgb(0 112 192 / 0.45), transparent 45%), radial-gradient(circle at 70% 80%, rgb(0 112 192 / 0.2), transparent 40%)',
          }}
          aria-hidden
        />

        <div className="relative px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted dark:text-white/40">
              Republic of Iraq
            </p>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
              {hoveredGov
                ? locale === 'ar'
                  ? hoveredGov.nameAr
                  : hoveredGov.nameEn
                : `${activeIds.size} active`}
            </p>
          </div>

          <ReadyIraqMap
            mode="offices"
            locale={locale}
            hovered={hovered}
            selected={selected}
            activeIds={activeIds}
            onHover={setHovered}
            onSelect={setSelected}
            ariaLabel={locale === 'ar' ? 'خريطة محافظات العراق' : 'Iraq governorates map'}
          />

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted dark:text-white/40">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-accent/80" />
              {labels.hasBranch}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-black/15 dark:bg-white/15" />
              {locale === 'ar' ? 'محافظة' : 'Governorate'}
            </span>
          </div>
        </div>
      </div>

      <aside className="relative flex min-h-[380px] flex-col overflow-hidden rounded-xl border border-border bg-card p-6 text-fg sm:p-8 dark:border-white/10 dark:bg-black/45 dark:text-white">
        <div
          className="pointer-events-none absolute -end-16 -top-16 h-40 w-40 rounded-full bg-accent/15 blur-3xl dark:bg-accent/20"
          aria-hidden
        />

        {!selectedGov ? (
          <div className="flex flex-1 flex-col justify-center">
            <MapPin className="h-8 w-8 text-accent" aria-hidden />
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight">{labels.selectGov}</h3>
            <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-muted dark:text-white/50">
              {labels.selectGovHint}
            </p>
          </div>
        ) : selectedOffice ? (
          <div className="relative z-10 flex h-full flex-col" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {locale === 'ar' ? selectedGov.nameAr : selectedGov.nameEn}
                </p>
                <h3 className="mt-3 text-3xl font-extrabold tracking-tight">
                  {selectedOffice.name}
                </h3>
                <p className="mt-2 text-sm font-medium text-muted dark:text-white/50">
                  {[selectedOffice.city, selectedOffice.country].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent dark:bg-accent/15">
                <Building2 className="h-5 w-5" aria-hidden />
              </span>
            </div>

            {selectedOffice.address ? (
              <p className="mt-6 text-sm font-medium leading-relaxed text-muted dark:text-white/55">
                {selectedOffice.address}
              </p>
            ) : null}

            <div className="mt-auto space-y-4 pt-10">
              {selectedOffice.phone ? (
                <a
                  href={`tel:${selectedOffice.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 text-xl font-bold text-accent transition hover:text-fg dark:hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  {selectedOffice.phone}
                </a>
              ) : null}
              {selectedOffice.email ? (
                <a
                  href={`mailto:${selectedOffice.email}`}
                  className="flex items-center gap-3 text-sm font-medium text-muted transition hover:text-fg dark:text-white/60 dark:hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  {selectedOffice.email}
                </a>
              ) : null}
              {selectedOffice.contactPerson ? (
                <p className="flex items-center gap-3 text-sm font-medium text-muted dark:text-white/60">
                  <UserRound className="h-4 w-4 shrink-0" aria-hidden />
                  {selectedOffice.contactPerson}
                </p>
              ) : null}

              {selectedOffice.phone ? (
                <a
                  href={`tel:${selectedOffice.phone.replace(/\s/g, '')}`}
                  className="btn-cta btn-cta-primary mt-4 inline-flex w-full justify-center sm:w-auto"
                >
                  {labels.callOffice}
                  <Phone className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <div
            className="relative z-10 flex flex-1 flex-col justify-center"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted dark:text-white/40">
              {locale === 'ar' ? selectedGov.nameAr : selectedGov.nameEn}
            </p>
            <h3 className="mt-4 text-2xl font-extrabold tracking-tight">{labels.noBranch}</h3>
            <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-muted dark:text-white/50">
              {labels.selectGovHint}
            </p>
            {offices.length ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {[...officeByGov.entries()].map(([id, office]) => {
                  const g = IRAQ_GOVERNORATES.find((x) => x.id === id)!;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelected(id)}
                      className="rounded-lg border border-border bg-page px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-muted transition hover:border-accent hover:bg-accent hover:text-white dark:border-white/15 dark:bg-white/5 dark:text-white/70"
                    >
                      {locale === 'ar' ? g.nameAr : office.city || g.nameEn}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}
      </aside>
    </div>
  );
}
