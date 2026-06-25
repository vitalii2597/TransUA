'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

const ROUTES = [
  { from: 'Kyiv', to: 'Oslo', flag: '🇳🇴', days: 3 },
  { from: 'Lviv', to: 'Stockholm', flag: '🇸🇪', days: 4 },
  { from: 'Odessa', to: 'Bergen', flag: '🇳🇴', days: 4 },
];

function SpinterVanSVG() {
  return (
    <svg viewBox="0 0 820 310" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" aria-hidden="true" focusable="false">

      {/* === GROUND / SHADOW === */}
      <ellipse cx="430" cy="292" rx="330" ry="14" fill="#020d1f" opacity="0.5"/>

      {/* === FULL VAN BODY (combined shape) === */}
      {/*
        Sprinter profile:
        - Cargo section: tall rectangle (high roof)
        - Cab section: shorter, with angled windshield
        - Stepped roofline between cab and cargo
      */}

      {/* Cargo body */}
      <rect x="210" y="38" width="530" height="228" rx="6" fill="#164b84"/>

      {/* Cab body (lower) */}
      <path d="M 68,268 L 68,138 Q 76,100 116,78 Q 152,58 210,50 L 210,268 Z" fill="#0f3868"/>

      {/* Cab-to-cargo roof step */}
      <path d="M 210,50 L 210,38 L 230,38 L 230,50 Z" fill="#1e5592"/>

      {/* === WINDSHIELD === */}
      <path d="M 80,138 Q 90,102 124,82 Q 157,64 206,54 L 206,138 Z"
        fill="#bfdbfe" opacity="0.85"/>
      {/* windshield glare */}
      <path d="M 92,135 Q 100,106 130,88 L 130,135 Z" fill="white" opacity="0.15"/>

      {/* === SIDE WINDOWS (4x) === */}
      <rect x="222" y="54" width="100" height="82" rx="5" fill="#93c5fd" opacity="0.75"/>
      <rect x="334" y="54" width="100" height="82" rx="5" fill="#93c5fd" opacity="0.70"/>
      <rect x="446" y="54" width="100" height="82" rx="5" fill="#93c5fd" opacity="0.65"/>
      <rect x="556" y="54" width="90" height="82" rx="5" fill="#93c5fd" opacity="0.55"/>

      {/* Window top glare */}
      <rect x="222" y="54" width="100" height="12" rx="4" fill="white" opacity="0.15"/>
      <rect x="334" y="54" width="100" height="12" rx="4" fill="white" opacity="0.15"/>
      <rect x="446" y="54" width="100" height="12" rx="4" fill="white" opacity="0.15"/>
      <rect x="556" y="54" width="90"  height="12" rx="4" fill="white" opacity="0.15"/>

      {/* === ROOF HIGHLIGHT === */}
      <rect x="210" y="38" width="530" height="10" rx="5" fill="#1e5592" opacity="0.7"/>

      {/* === AMBER BRANDING STRIPE === */}
      <rect x="68" y="182" width="672" height="18" rx="2" fill="#f59e0b"/>
      <rect x="68" y="182" width="672" height="4"  rx="2" fill="#fde68a" opacity="0.5"/>

      {/* === PANEL LINES === */}
      <line x1="210" y1="268" x2="740" y2="268" stroke="#082349" strokeWidth="2" opacity="0.4"/>
      <line x1="68"  y1="268" x2="740" y2="268" stroke="#082349" strokeWidth="2" opacity="0.3"/>

      {/* === REAR DOOR DETAIL === */}
      <line x1="648" y1="44" x2="648" y2="268" stroke="#082349" strokeWidth="2.5" opacity="0.5"/>
      <line x1="700" y1="44" x2="700" y2="268" stroke="#082349" strokeWidth="2"   opacity="0.4"/>
      {/* Door handle */}
      <rect x="673" y="135" width="5" height="42" rx="2.5" fill="#93c5fd" opacity="0.6"/>
      <circle cx="675" cy="133" r="5" fill="#bfdbfe" opacity="0.5"/>
      <circle cx="675" cy="179" r="5" fill="#bfdbfe" opacity="0.5"/>

      {/* === CAB / CARGO DIVIDER === */}
      <line x1="210" y1="38" x2="210" y2="268" stroke="#082349" strokeWidth="2" opacity="0.4"/>

      {/* === TRANSUA LETTERING === */}
      <text x="355" y="168" fontSize="30" fontWeight="800" fill="white" opacity="0.95"
        fontFamily="Inter, system-ui, sans-serif" letterSpacing="5">
        TRANS<tspan fill="#f59e0b">UA</tspan>
      </text>

      {/* === HEADLIGHT === */}
      <rect x="68" y="118" width="26" height="16" rx="3" fill="#fef9c3"/>
      <rect x="68" y="118" width="26" height="7"  rx="2" fill="#fefce8"/>
      {/* DRL */}
      <rect x="68" y="137" width="26" height="4" rx="2" fill="#fef9c3" opacity="0.6"/>

      {/* === FRONT BUMPER === */}
      <rect x="62" y="222" width="30" height="46" rx="4" fill="#082349"/>
      <rect x="64" y="234" width="26" height="8"  rx="2" fill="#0f3868"/>
      {/* grille lines */}
      <line x1="66" y1="246" x2="88" y2="246" stroke="#1e5592" strokeWidth="1.5"/>
      <line x1="66" y1="252" x2="88" y2="252" stroke="#1e5592" strokeWidth="1.5"/>

      {/* Side mirror */}
      <rect x="58" y="108" width="18" height="12" rx="3" fill="#0f3868"/>
      <rect x="54" y="110" width="6"  height="8"  rx="2" fill="#082349"/>

      {/* === FRONT WHEEL ARCH === */}
      <path d="M 68,220 Q 68,275 148,275 Q 224,275 224,220 Z" fill="#082349" opacity="0.9"/>

      {/* === FRONT WHEEL === */}
      <circle cx="152" cy="272" r="46" fill="#1c2b3a"/>
      <circle cx="152" cy="272" r="32" fill="#2d3748"/>
      <circle cx="152" cy="272" r="20" fill="#1a202c"/>
      <circle cx="152" cy="272" r="9"  fill="#4a5568"/>
      {/* spokes */}
      <line x1="152" y1="250" x2="152" y2="294" stroke="#4a5568" strokeWidth="4" opacity="0.6"/>
      <line x1="130" y1="272" x2="174" y2="272" stroke="#4a5568" strokeWidth="4" opacity="0.6"/>
      <line x1="136" y1="256" x2="168" y2="288" stroke="#4a5568" strokeWidth="3" opacity="0.4"/>
      <line x1="168" y1="256" x2="136" y2="288" stroke="#4a5568" strokeWidth="3" opacity="0.4"/>
      {/* hub cap */}
      <circle cx="152" cy="272" r="6" fill="#718096"/>

      {/* === REAR WHEEL ARCH === */}
      <path d="M 560,220 Q 560,275 640,275 Q 716,275 716,220 Z" fill="#082349" opacity="0.9"/>

      {/* === REAR WHEEL === */}
      <circle cx="638" cy="272" r="46" fill="#1c2b3a"/>
      <circle cx="638" cy="272" r="32" fill="#2d3748"/>
      <circle cx="638" cy="272" r="20" fill="#1a202c"/>
      <circle cx="638" cy="272" r="9"  fill="#4a5568"/>
      {/* spokes */}
      <line x1="638" y1="250" x2="638" y2="294" stroke="#4a5568" strokeWidth="4" opacity="0.6"/>
      <line x1="616" y1="272" x2="660" y2="272" stroke="#4a5568" strokeWidth="4" opacity="0.6"/>
      <line x1="622" y1="256" x2="654" y2="288" stroke="#4a5568" strokeWidth="3" opacity="0.4"/>
      <line x1="654" y1="256" x2="622" y2="288" stroke="#4a5568" strokeWidth="3" opacity="0.4"/>
      {/* hub cap */}
      <circle cx="638" cy="272" r="6" fill="#718096"/>

      {/* === TAIL LIGHT === */}
      <rect x="736" y="84"  width="6" height="40" rx="3" fill="#ef4444" opacity="0.8"/>
      <rect x="736" y="130" width="6" height="20" rx="3" fill="#f97316" opacity="0.7"/>
    </svg>
  );
}

function MountainSilhouette() {
  return (
    <svg viewBox="0 0 1440 130" preserveAspectRatio="none" className="w-full block" style={{ marginBottom: '-2px' }} aria-hidden="true" focusable="false">
      {/* Background mountains (lighter) */}
      <path d="M0,130 L0,90 L180,20 L360,80 L480,30 L600,70 L720,15 L840,65 L960,25 L1080,70 L1200,35 L1320,75 L1440,30 L1440,130 Z"
        fill="#0a1f3c" opacity="0.6"/>
      {/* Foreground mountains */}
      <path d="M0,130 L0,100 L100,45 L200,85 L310,30 L420,75 L520,20 L620,60 L740,10 L850,55 L950,28 L1060,68 L1160,22 L1280,62 L1380,35 L1440,55 L1440,130 Z"
        fill="#04122a"/>
    </svg>
  );
}

export default function HomePage() {
  const t = useTranslations('home');
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(135deg, #04122a 0%, #082349 55%, #0f3868 100%)', position: 'relative', overflow: 'hidden' }}>

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px' }}/>

        {/* Glow orbs */}
        <div className="absolute pointer-events-none" style={{ top: '-120px', right: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }}/>
        <div className="absolute pointer-events-none" style={{ bottom: '80px', left: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,85,146,0.3) 0%, transparent 70%)' }}/>

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-0">
          <div className="flex flex-col lg:flex-row items-center gap-8 pb-12">

            {/* Left — text */}
            <div className="flex-1 text-center lg:text-left z-10">

              {/* Live badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-8"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#93c5fd' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#f59e0b' }}/>
                Ukraine ↔ Norway · Sweden
              </div>

              <h1 className="font-black text-white leading-tight mb-5" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)' }}>
                Trans<span style={{ color: '#f59e0b' }}>UA</span>
              </h1>
              <p className="font-semibold mb-4 leading-snug" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', color: '#e0eaf7' }}>
                {t('hero')}
              </p>
              <p className="mb-10 text-lg" style={{ color: '#7baedf' }}>
                {t('tagline')}
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button onClick={() => router.push(`/${locale}/trips`)}
                  className="px-8 py-3.5 font-bold rounded-xl text-base transition-all hover:scale-105"
                  style={{ backgroundColor: '#f59e0b', color: '#04122a', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fbbf24')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f59e0b')}>
                  {t('searchTrips')} →
                </button>
                <button onClick={() => router.push(`/${locale}/parcels`)}
                  className="px-8 py-3.5 font-semibold rounded-xl text-base transition-all text-white"
                  style={{ border: '2px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  {t('sendParcel')}
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start text-sm" style={{ color: '#7baedf' }}>
                <span className="flex items-center gap-2"><span style={{ color: '#f59e0b' }}>✓</span> Cash payment on board</span>
                <span className="flex items-center gap-2"><span style={{ color: '#f59e0b' }}>✓</span> Mercedes Sprinter</span>
                <span className="flex items-center gap-2"><span style={{ color: '#f59e0b' }}>✓</span> Door-to-door pickup</span>
              </div>
            </div>

            {/* Right — van */}
            <div className="flex-1 w-full max-w-2xl">
              <SpinterVanSVG />
            </div>
          </div>
        </div>

        <MountainSilhouette />
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="bg-white" style={{ borderBottom: '1px solid #e8f0f7' }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: '🚐', title: 'Mercedes Sprinter', desc: 'Modern high-roof vans with air conditioning and comfortable reclining seats' },
              { icon: '📍', title: 'Door-to-door', desc: 'Pick-up and drop-off at your address anywhere along the route' },
              { icon: '💵', title: 'Pay on board', desc: 'Cash payment directly to the driver — no card or bank transfer needed' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: '#eef4fb' }}>
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: '#082349' }}>{f.title}</p>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#082349' }}>Popular routes</h2>
        <p className="text-gray-500 mb-8">Regular departures, comfortable vans, fair prices</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {ROUTES.map((r) => (
            <button key={`${r.from}-${r.to}`}
              onClick={() => router.push(`/${locale}/trips`)}
              className="bg-white rounded-2xl p-6 text-left transition-all group"
              style={{ border: '1px solid #d4e5f5' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#7baedf'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,56,104,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#d4e5f5'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div className="text-3xl mb-3">{r.flag}</div>
              <p className="text-lg font-bold mb-1" style={{ color: '#082349' }}>
                {r.from} <span style={{ color: '#f59e0b' }}>→</span> {r.to}
              </p>
              <p className="text-sm text-gray-500 mt-1">~{r.days} days · Mercedes Sprinter</p>
              <div className="mt-4 text-sm font-semibold" style={{ color: '#164b84' }}>
                See schedule →
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ backgroundColor: '#04122a' }} className="text-white">
        <div className="max-w-7xl mx-auto px-6 py-14 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to travel?</h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color: '#7baedf' }}>
            Book your seat in minutes. Safe, reliable, and comfortable transport between Ukraine and Scandinavia.
          </p>
          <button onClick={() => router.push(`/${locale}/trips`)}
            className="px-10 py-3.5 font-bold rounded-xl text-base transition-all hover:scale-105"
            style={{ backgroundColor: '#f59e0b', color: '#04122a' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fbbf24')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f59e0b')}>
            {t('searchTrips')} →
          </button>
        </div>
      </section>
    </div>
  );
}
