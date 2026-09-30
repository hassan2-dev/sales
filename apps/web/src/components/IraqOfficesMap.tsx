import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Building2, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import type { Office } from '@/types';
import {
  IRAQ_CITY_ALIASES,
  IRAQ_GOVERNORATES,
  type IraqGovId,
} from '@/data/iraq-governorates';
import { ReadyIraqMap } from '@/components/ReadyIraqMap';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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

/** Digits only for wa.me — keep country code when present, else assume Iraq (+964). */
function toWhatsAppNumber(phone: string) {
  let digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length >= 10) {
    digits = `964${digits.slice(1)}`;
  }
  return digits;
}

function buildWhatsAppUrl(
  officePhone: string,
  payload: { name: string; phone: string; subject: string; officeName: string },
  locale: 'en' | 'ar',
) {
  const wa = toWhatsAppNumber(officePhone);
  if (!wa) return null;

  const lines =
    locale === 'ar'
      ? [
          `مرحباً، أود التواصل مع فرع ${payload.officeName}`,
          `الاسم: ${payload.name}`,
          `الرقم: ${payload.phone}`,
          `الموضوع:`,
          payload.subject,
        ]
      : [
          `Hello, I'd like to reach the ${payload.officeName} branch`,
          `Name: ${payload.name}`,
          `Phone: ${payload.phone}`,
          `Subject:`,
          payload.subject,
        ];

  return `https://wa.me/${wa}?text=${encodeURIComponent(lines.join('\n'))}`;
}

type Labels = {
  offices: string;
  officesSub: string;
  selectGov: string;
  selectGovHint: string;
  noBranch: string;
  hasBranch: string;
  callOffice: string;
  contactName: string;
  contactPhone: string;
  contactSubject: string;
  contactSendWhatsApp: string;
  contactNeedPhone: string;
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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (defaultId) setSelected((prev) => prev ?? defaultId);
  }, [defaultId]);

  useEffect(() => {
    setName('');
    setPhone('');
    setSubject('');
  }, [selected]);

  const selectedGov = IRAQ_GOVERNORATES.find((g) => g.id === selected) ?? null;
  const selectedOffice = selected ? officeByGov.get(selected) ?? null : null;
  const hoveredGov = IRAQ_GOVERNORATES.find((g) => g.id === hovered) ?? null;

  function onSendWhatsApp(e: FormEvent) {
    e.preventDefault();
    if (!selectedOffice?.phone) return;
    const url = buildWhatsAppUrl(
      selectedOffice.phone,
      {
        name: name.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        officeName: selectedOffice.name,
      },
      locale,
    );
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="mt-10 grid min-w-0 items-stretch gap-6 lg:mt-12 lg:grid-cols-[1.15fr_0.85fr]" dir="ltr">
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

      <aside className="relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-4 text-fg sm:min-h-[380px] sm:p-8 dark:border-white/10 dark:bg-black/45 dark:text-white">
        <div
          className="pointer-events-none absolute -end-16 -top-16 h-40 w-40 rounded-full bg-accent/15 blur-3xl dark:bg-accent/20"
          aria-hidden
        />

        {!selectedGov ? (
          <div className="flex flex-1 flex-col justify-center">
            <MapPin className="h-8 w-8 text-accent" aria-hidden />
            <h3 className="mt-5 text-xl font-extrabold tracking-tight sm:text-2xl">{labels.selectGov}</h3>
            <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-muted dark:text-white/50">
              {labels.selectGovHint}
            </p>
          </div>
        ) : selectedOffice ? (
          <div className="relative z-10 flex h-full min-w-0 flex-col" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">
                    {locale === 'ar' ? selectedGov.nameAr : selectedGov.nameEn}
                  </span>
                </p>
                <h3 className="mt-3 break-words text-xl font-extrabold tracking-tight sm:text-3xl">
                  {selectedOffice.name}
                </h3>
                <p className="mt-2 text-sm font-medium text-muted dark:text-white/50">
                  {[selectedOffice.city, selectedOffice.country].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent sm:h-12 sm:w-12 dark:bg-accent/15">
                <Building2 className="h-5 w-5" aria-hidden />
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {selectedOffice.phone ? (
                <a
                  href={`tel:${selectedOffice.phone.replace(/\s/g, '')}`}
                  className="flex items-start gap-3 text-base font-bold text-accent transition hover:text-fg dark:hover:text-white"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 break-all">{selectedOffice.phone}</span>
                </a>
              ) : null}
              {selectedOffice.email ? (
                <a
                  href={`mailto:${selectedOffice.email}`}
                  className="flex items-start gap-3 text-sm font-medium text-muted transition hover:text-fg dark:text-white/60 dark:hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 break-all">{selectedOffice.email}</span>
                </a>
              ) : null}
              {selectedOffice.contactPerson ? (
                <p className="flex items-start gap-3 text-sm font-medium text-muted dark:text-white/60">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 break-words">{selectedOffice.contactPerson}</span>
                </p>
              ) : null}
            </div>

            <form onSubmit={onSendWhatsApp} className="mt-6 flex flex-1 flex-col gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted dark:text-white/45">
                  {labels.contactName}
                </span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-page px-3 text-sm font-medium text-fg outline-none transition focus:border-accent dark:border-white/15 dark:bg-white/5 dark:text-white"
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted dark:text-white/45">
                  {labels.contactPhone}
                </span>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-page px-3 text-sm font-medium text-fg outline-none transition focus:border-accent dark:border-white/15 dark:bg-white/5 dark:text-white"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>
              <label className="flex min-h-0 flex-1 flex-col">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted dark:text-white/45">
                  {labels.contactSubject}
                </span>
                <textarea
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  rows={5}
                  className="min-h-[8.5rem] w-full flex-1 resize-y rounded-lg border border-border bg-page px-3 py-2.5 text-sm font-medium leading-relaxed text-fg outline-none transition focus:border-accent dark:border-white/15 dark:bg-white/5 dark:text-white"
                />
              </label>

              <div className="pt-1">
                {selectedOffice.phone ? (
                  <button
                    type="submit"
                    className="btn-cta btn-cta-primary inline-flex w-full justify-center gap-2"
                  >
                    {labels.contactSendWhatsApp}
                    <WhatsAppIcon className="h-4 w-4" />
                  </button>
                ) : (
                  <p className="text-sm font-medium text-muted dark:text-white/50">
                    {labels.contactNeedPhone}
                  </p>
                )}
              </div>
            </form>
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
