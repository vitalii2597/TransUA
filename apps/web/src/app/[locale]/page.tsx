'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Bus, Package, MapPin, Banknote, CheckCircle2, Phone } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RouteLine } from '@/components/RouteLine';
import { SprinterJourney } from '@/components/SprinterJourney';
import { NordicMountains } from '@/components/NordicMountains';
import api from '@/lib/api';
import { CONTACT } from '@/lib/contact';
import {
  type Run,
  type ScheduleRunRow,
  toRun,
  PHASE_META,
  fmtDate,
  fmtRange,
  startOfDay,
  parseLocalDate,
  isRunDone,
} from '@/lib/scheduleRun';

const ROUTES = [
  { from: 'Kyiv', to: 'Oslo', dur: '~30h', price: '2400' },
  { from: 'Lviv', to: 'Stockholm', dur: '~24h', price: '2100' },
  { from: 'Odesa', to: 'Bergen', dur: '~34h', price: '2600' },
];

export default function HomePage() {
  const t = useTranslations('home');
  const { locale } = useParams<{ locale: string }>();
  const intlLocale = { uk: 'uk-UA', no: 'nb-NO', sv: 'sv-SE', pl: 'pl-PL' }[locale] ?? 'en-GB';

  const STEPS = [
    { n: '01', icon: Phone, title: t('step1Title'), desc: t('step1Desc') },
    { n: '02', icon: CheckCircle2, title: t('step2Title'), desc: t('step2Desc') },
    { n: '03', icon: Banknote, title: t('step3Title'), desc: t('step3Desc') },
    { n: '04', icon: Bus, title: t('step4Title'), desc: t('step4Desc') },
  ];

  const SELLING_POINTS = [
    { icon: Banknote, title: t('cashTitle'), desc: t('cashDesc'), price: t('cashFrom') },
    { icon: Bus, title: t('sprinterTitle'), desc: t('sprinterDesc'), price: null },
    { icon: MapPin, title: t('doorTitle'), desc: t('doorDesc'), price: null },
    { icon: Package, title: t('parcelTitle'), desc: t('parcelDesc'), price: t('parcelFrom') },
  ];

  const [runs, setRuns] = useState<Run[] | null>(null);

  useEffect(() => {
    api
      .get('/schedule-runs')
      .then((res) => setRuns((res.data.data as ScheduleRunRow[]).map(toRun)))
      .catch(() => setRuns([]));
  }, []);

  const today = startOfDay(new Date());
  const nextRun = (runs ?? []).find((r) => !isRunDone(r, today)) ?? null;
  const nextRunMonthLabel = nextRun
    ? parseLocalDate(`${nextRun.month}-01`).toLocaleDateString(intlLocale, { month: 'long', year: 'numeric' })
    : '';

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-brand-50 via-sky-50/40 to-white">
        {/* soft brand glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[720px] max-w-[92vw] -translate-x-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)' }}
        />
        {/* aurora borealis shimmer across the sky (below the nav) */}
        <div className="pointer-events-none absolute inset-x-0 top-10 h-72 overflow-hidden">
          <div
            className="aurora absolute top-2 left-[6%] h-56 w-[48%] rounded-[50%] blur-2xl"
            style={{
              background:
                'linear-gradient(150deg, rgba(16,185,129,0.55), rgba(45,212,191,0.40) 40%, rgba(56,189,248,0.20) 70%, transparent 86%)',
            }}
          />
          <div
            className="aurora absolute top-6 right-[4%] h-52 w-[44%] rounded-[50%] blur-2xl"
            style={{
              animationDelay: '-7s',
              background:
                'linear-gradient(205deg, rgba(139,92,246,0.42), rgba(56,189,248,0.26) 50%, transparent 84%)',
            }}
          />
        </div>
        {/* faint grid, fading out downward */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 80% 55% at 50% 0%, #000 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 55% at 50% 0%, #000 30%, transparent 100%)',
          }}
        />
        {/* Norwegian fjord range backdrop */}
        <NordicMountains />
        <Container className="relative pt-8 pb-16 sm:pt-10 sm:pb-20">
          <div className="mx-auto max-w-2xl text-center">
            {/* eyebrow badge — the actual corridor, not a marketing line */}
            <div className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/70 px-3.5 py-1.5 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-brand-700">{t('corridor')}</span>
            </div>

            <h1
              className="animate-fade-up text-balance font-display text-2xl font-bold leading-[1.2] tracking-tight text-ink sm:text-3xl lg:text-4xl"
              style={{ animationDelay: '80ms' }}
            >
              {t('headline')}
            </h1>
            <p
              className="animate-fade-up mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg"
              style={{ animationDelay: '160ms' }}
            >
              {t('tagline')}
            </p>

            <div
              className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-3"
              style={{ animationDelay: '240ms' }}
            >
              <Button href={`/${locale}/trips`} size="lg">
                {t('bookSeat')} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href={`/${locale}/parcels`} size="lg" variant="secondary">
                {t('orderPickup')}
              </Button>
            </div>
          </div>

          {/* Next-run card — real data from the published schedule, with a slim van strip on top */}
          <div className="animate-fade-up mx-auto mt-8 max-w-2xl" style={{ animationDelay: '340ms' }}>
            <Card className="overflow-hidden p-0">
              <SprinterJourney compact />

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-600">
                    {t('nextRunEyebrow')}
                  </p>
                  {runs !== null && (
                    <Link
                      href={`/${locale}/trips`}
                      className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      {t('viewFullSchedule')} <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                {runs === null && <p className="mt-3 text-sm text-slate-500">{t('nextRunLoading')}</p>}

                {runs !== null && !nextRun && <p className="mt-3 text-sm text-slate-500">{t('nextRunEmpty')}</p>}

                {nextRun && (
                  <>
                    <h2 className="mt-1 font-display text-lg font-bold text-ink">
                      {t('nextRunTitle', { number: nextRun.number, month: nextRunMonthLabel })}
                    </h2>
                    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-2.5">
                        <PHASE_META.parcels.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                        <div>
                          <dt className="text-sm text-slate-600">
                            {t('nextRunCutoff', { date: fmtDate(nextRun.phases[0].cutoff!) })}
                          </dt>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <PHASE_META.passengers.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                        <dt className="text-sm text-slate-600">
                          {t('nextRunDeparture', { date: fmtDate(nextRun.phases[1].date) })}
                        </dt>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <PHASE_META.destination.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                        <dt className="text-sm text-slate-600">
                          {t('nextRunArrival', { date: fmtRange(nextRun.phases[2].date, nextRun.phases[2].endDate!) })}
                        </dt>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <PHASE_META.return.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                        <dt className="text-sm text-slate-600">
                          {t('nextRunReturn', { date: fmtDate(nextRun.phases[3].date) })}
                        </dt>
                      </div>
                    </dl>
                    <div className="mt-5 flex flex-wrap gap-2.5">
                      <Button href={`/${locale}/trips`} size="sm">
                        {t('bookSeat')}
                      </Button>
                      <Button href={`/${locale}/parcels`} size="sm" variant="secondary">
                        {t('orderPickup')}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* ── SELLING POINTS — real reasons to choose us, up high, with prices ── */}
      <section className="border-y border-slate-200 bg-slate-50">
        <Container className="py-14">
          <p className="mb-8 text-center font-mono text-xs uppercase tracking-wider text-brand-600">
            {t('sellingPointsEyebrow')}
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SELLING_POINTS.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-600">
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="mb-1 font-semibold text-ink">{f.title}</h3>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                  {f.price && <p className="mt-1 font-mono text-sm font-semibold text-brand-700">{f.price}</p>}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── ROUTES ── */}
      <section>
        <Container className="py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-wider text-brand-600">{t('popularRoutesEyebrow')}</p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {t('popularRoutesTitle')}
              </h2>
            </div>
            <Link
              href={`/${locale}/trips`}
              className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 sm:flex"
            >
              {t('allRoutes')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ROUTES.map((r) => (
              <Link key={`${r.from}-${r.to}`} href={`/${locale}/trips`}>
                <Card interactive className="p-6">
                  <RouteLine from={r.from} to={r.to} middle={r.dur} />
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm text-slate-500">Mercedes Sprinter</span>
                    <span className="font-mono text-sm text-slate-500 tabular">
                      from <span className="font-semibold text-ink">{r.price} ₴</span>
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── TRUST ── placeholder stats; replace with real figures before launch */}
      <section className="bg-slate-50">
        <Container className="py-10">
          <p className="mb-6 text-center font-mono text-xs uppercase tracking-wider text-brand-600">
            {t('trustEyebrow')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-center">
            <p className="font-display text-lg font-semibold text-ink">{t('trustYears')}</p>
            <p className="font-display text-lg font-semibold text-ink">{t('trustTrips')}</p>
            <p className="font-display text-lg font-semibold text-ink">{t('trustReviews')}</p>
          </div>
        </Container>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section>
        <Container className="py-20">
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-brand-600">{t('howItWorksEyebrow')}</p>
          <h2 className="mb-12 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {t('howItWorksTitle')}
          </h2>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <s.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm text-slate-500 tabular">{s.n}</span>
                </div>
                <h3 className="mb-1.5 font-semibold text-ink">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA (the one dark moment) ── */}
      <section className="bg-ink">
        <Container className="py-20 text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('ctaTitle')}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-300">{t('ctaSubtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={`/${locale}/trips`} size="lg">
              {t('ctaButton')} <ArrowRight className="h-4 w-4" />
            </Button>
            <a
              href={CONTACT.phoneHref}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span className="font-mono tabular">{CONTACT.phoneDisplay}</span>
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
