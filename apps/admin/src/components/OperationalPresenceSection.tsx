import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, Layers, MapPin } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { CountUpStat } from '@/components/CountUpStat';

const STAT_ICONS = [Layers, Award, MapPin] as const;

export function OperationalPresenceSection({
  dir,
  labels,
  stats,
}: {
  dir: 'ltr' | 'rtl';
  labels: {
    eyebrow: string;
    title: string;
    sub: string;
    cta: string;
    from: string;
    to: string;
    badge: string;
  };
  stats: { end: number; suffix: string; label: string }[];
}) {
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden border-b border-line bg-[#050810] text-white">
      <img
        src="/company/p07-1.jpg"
        alt=""
        className="hero-ken absolute inset-0 h-full w-full object-cover opacity-[0.22] mix-blend-luminosity"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0070c0]/35 via-[#050810]/92 to-[#050810]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_85%_15%,rgb(0_112_192/0.55),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(255 255 255 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.08) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[90rem] px-4 py-20 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
        <div className="grid items-end gap-14 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-accent" aria-hidden />
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
                {labels.eyebrow}
              </p>
            </div>
            <h2 className="mt-5 text-[1.75rem] font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
              {labels.title}
            </h2>
            <p className="mt-5 max-w-md text-sm font-medium leading-relaxed text-white/65 sm:text-base lg:text-lg">
              {labels.sub}
            </p>
            <Link
              to="/contact"
              className="btn-cta btn-cta-primary btn-shine mt-8 inline-flex w-full sm:w-auto"
            >
              {labels.cta}
              <Arrow className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((s, i) => {
                const Icon = STAT_ICONS[i % STAT_ICONS.length];
                return (
                  <Reveal key={s.label} delay={i} variant="scale">
                    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_80px_-40px_rgb(0_0_0/0.8)] backdrop-blur-md transition duration-500 hover:border-accent/45 hover:bg-white/[0.09] sm:p-7 lg:min-h-[200px]">
                      <div
                        className="pointer-events-none absolute -end-6 -top-6 h-28 w-28 rounded-full bg-accent/25 blur-2xl transition duration-500 group-hover:bg-accent/40"
                        aria-hidden
                      />
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="relative mt-8">
                        <CountUpStat
                          end={s.end}
                          suffix={s.suffix}
                          label={s.label}
                          variant="glass"
                          durationMs={1500 + i * 180}
                        />
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>

        <Reveal delay={2} className="mt-14 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
              <span className="text-white/70">{labels.from}</span>
              <span className="mx-3 text-accent" aria-hidden>
                →
              </span>
              <span className="text-white/70">{labels.to}</span>
            </p>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {labels.badge}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
