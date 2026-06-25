'use client';

import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { isAuthenticated, removeTokens } from '@/lib/auth';

const LOCALES = [
  { code: 'uk', label: '🇺🇦' },
  { code: 'no', label: '🇳🇴' },
  { code: 'sv', label: '🇸🇪' },
  { code: 'pl', label: '🇵🇱' },
];

export default function Navbar() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'uk';
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setAuthed(isAuthenticated()); }, [pathname]);

  function changeLocale(code: string) {
    const path = window.location.pathname.replace(/^\/(uk|no|sv|pl)/, '') || '/';
    router.push(`/${code}${path}`);
  }

  function logout() {
    if (!confirm(tc('confirmLogout'))) return;
    removeTokens();
    setAuthed(false);
    router.push(`/${locale}/login`);
  }

  return (
    <nav style={{ backgroundColor: '#04122a' }} className="text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <div style={{ backgroundColor: '#f59e0b' }} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5" aria-hidden="true">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Trans<span style={{ color: '#f59e0b' }}>UA</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href={`/${locale}/trips`}
              className="px-4 py-2 rounded-lg text-sm font-medium text-blue-200 hover:text-white transition-all"
              style={{ ['--tw-bg-opacity' as any]: '0' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              {t('trips')}
            </Link>
            <Link href={`/${locale}/parcels`}
              className="px-4 py-2 rounded-lg text-sm font-medium text-blue-200 hover:text-white transition-all"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              {t('parcels')}
            </Link>

            <div className="w-px h-5 mx-2" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />

            {authed ? (
              <>
                <Link href={`/${locale}/bookings`}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-blue-200 hover:text-white transition-all"
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  {t('bookings')}
                </Link>
                <Link href={`/${locale}/dashboard`}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-blue-200 hover:text-white transition-all"
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  {t('dashboard')}
                </Link>
                <button onClick={logout}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ color: '#fca5a5' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-blue-200 hover:text-white transition-all"
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  {t('login')}
                </Link>
                <Link href={`/${locale}/register`}
                  className="ml-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{ backgroundColor: '#f59e0b', color: '#04122a' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fbbf24')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f59e0b')}>
                  {t('register')}
                </Link>
              </>
            )}

            {/* Language switcher */}
            <div className="flex gap-0.5 ml-3 pl-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
              {LOCALES.map((l) => (
                <button key={l.code} onClick={() => changeLocale(l.code)}
                  className="text-base px-1.5 py-0.5 rounded transition-all"
                  style={{
                    backgroundColor: locale === l.code ? 'rgba(255,255,255,0.15)' : 'transparent',
                    opacity: locale === l.code ? 1 : 0.6,
                    transform: locale === l.code ? 'scale(1.1)' : 'scale(1)',
                  }}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="md:hidden p-2 rounded-lg transition"
            style={{ backgroundColor: menuOpen ? 'rgba(255,255,255,0.1)' : 'transparent' }}
          >
            <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Link href={`/${locale}/trips`} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-blue-200 hover:text-white">{t('trips')}</Link>
            <Link href={`/${locale}/parcels`} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-blue-200 hover:text-white">{t('parcels')}</Link>
            {authed ? (
              <>
                <Link href={`/${locale}/bookings`} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-blue-200 hover:text-white">{t('bookings')}</Link>
                <Link href={`/${locale}/dashboard`} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-blue-200 hover:text-white">{t('dashboard')}</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm" style={{ color: '#fca5a5' }}>{t('logout')}</button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-blue-200 hover:text-white">{t('login')}</Link>
                <Link href={`/${locale}/register`} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#f59e0b' }}>{t('register')}</Link>
              </>
            )}
            <div className="flex gap-1 px-4 pt-2">
              {LOCALES.map((l) => (
                <button key={l.code} onClick={() => { changeLocale(l.code); setMenuOpen(false); }}
                  className="text-base px-2 py-1 rounded"
                  style={{ backgroundColor: locale === l.code ? 'rgba(255,255,255,0.15)' : 'transparent', opacity: locale === l.code ? 1 : 0.6 }}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
