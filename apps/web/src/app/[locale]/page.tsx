'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Bus, Package, MapPin, Banknote, Search, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RouteLine } from '@/components/RouteLine';
import { SprinterJourney } from '@/components/SprinterJourney';
import { NordicMountains } from '@/components/NordicMountains';

const ROUTES = [
  { from: 'Kyiv', to: 'Oslo', dur: '~30h', price: '2400' },
  { from: 'Lviv', to: 'Stockholm', dur: '~24h', price: '2100' },
  { from: 'Odesa', to: 'Bergen', dur: '~34h', price: '2600' },
];

const STEPS = [
  { n: '01', icon: Search, title: 'Find your trip', desc: 'Search by route and date. See live seat availability.' },
  { n: '02', icon: CheckCircle2, title: 'Book your seat', desc: 'Pick a seat, add passengers and your pickup address.' },
  { n: '03', icon: Banknote, title: 'Pay on board', desc: 'Cash to the driver when you travel. No card needed.' },
  { n: '04', icon: Bus, title: 'Travel home', desc: 'Door-to-door in a modern Mercedes Sprinter.' },
];

const FEATURES = [
  { icon: Bus, title: 'Mercedes Sprinter', desc: 'High-roof vans with air conditioning and reclining seats.' },
  { icon: MapPin, title: 'Door-to-door', desc: 'Pickup and drop-off at your address along the route.' },
  { icon: Package, title: 'Parcels too', desc: 'Send packages to family from 15 € — tracked all the way.' },
];

export default function HomePage() {
  const t = useTranslations('home');
  const { locale } = useParams<{ locale: string }>();

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
        <Container className="relative pt-10 pb-24 sm:pt-12 sm:pb-28">
          <div className="mx-auto max-w-4xl text-center">
            {/* eyebrow badge */}
            <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/70 px-3.5 py-1.5 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-brand-700">
                Ukraine ⇄ Scandinavia
              </span>
            </div>

            <h1
              className="animate-fade-up text-balance font-display text-3xl font-bold leading-[1.15] tracking-tight text-ink sm:text-4xl lg:whitespace-nowrap"
              style={{ animationDelay: '80ms' }}
            >
              {t('heroRoute')}
            </h1>
            <p
              className="animate-fade-up mx-auto mt-5 max-w-xl text-lg text-slate-600"
              style={{ animationDelay: '160ms' }}
            >
              {t('tagline')}
            </p>

            <div
              className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3"
              style={{ animationDelay: '240ms' }}
            >
              <Button href={`/${locale}/trips`} size="lg">
                {t('searchTrips')} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href={`/${locale}/parcels`} size="lg" variant="secondary">
                {t('sendParcel')}
              </Button>
            </div>
          </div>

          {/* showpiece — the Sprinter drives the route */}
          <div className="animate-fade-up mx-auto mt-8 max-w-4xl sm:mt-10" style={{ animationDelay: '340ms' }}>
            <SprinterJourney />
          </div>

          <div
            className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wider text-slate-600"
            style={{ animationDelay: '420ms' }}
          >
            <span>Cash on board</span>
            <span className="text-slate-300">·</span>
            <span>Mercedes Sprinter</span>
            <span className="text-slate-300">·</span>
            <span>Door-to-door</span>
          </div>
        </Container>
      </section>

      {/* ── ROUTES ── */}
      <section className="bg-slate-50">
        <Container className="py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-wider text-brand-600">Popular routes</p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Regular departures both ways
              </h2>
            </div>
            <Link
              href={`/${locale}/trips`}
              className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 sm:flex"
            >
              All routes <ArrowRight className="h-4 w-4" />
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

      {/* ── HOW IT WORKS (a real, ordered sequence → numbered) ── */}
      <section>
        <Container className="py-20">
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-brand-600">How it works</p>
          <h2 className="mb-12 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            From search to seat in four steps
          </h2>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <s.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm text-slate-300 tabular">{s.n}</span>
                </div>
                <h3 className="mb-1.5 font-semibold text-ink">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FEATURES ── */}
      <section className="border-y border-slate-200 bg-slate-50">
        <Container className="py-16">
          <div className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-600">
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="mb-1 font-semibold text-ink">{f.title}</h3>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA (the one dark moment) ── */}
      <section className="bg-ink">
        <Container className="py-20 text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to travel home?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-400">
            Book your seat in minutes. Safe, reliable transport between Ukraine and Scandinavia.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href={`/${locale}/trips`} size="lg">
              {t('searchTrips')} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
