'use client';

import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Bus, Menu, X, Phone, MessageCircle, Send } from 'lucide-react';
import { isAuthenticated, removeTokens } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { CONTACT } from '@/lib/contact';

const LOCALES = [
  { code: 'uk', label: 'UA' },
  { code: 'pl', label: 'PL' },
  { code: 'sv', label: 'SE' },
  { code: 'no', label: 'NO' },
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

  useEffect(() => {
    setAuthed(isAuthenticated());
    setMenuOpen(false);
  }, [pathname]);

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

  const linkCls =
    'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Wordmark */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Bus className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">TransUA</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link href={`/${locale}/trips`} className={linkCls}>{t('trips')}</Link>
            <Link href={`/${locale}/parcels`} className={linkCls}>{t('parcels')}</Link>
            {authed && <Link href={`/${locale}/bookings`} className={linkCls}>{t('bookings')}</Link>}
            {authed && <Link href={`/${locale}/dashboard`} className={linkCls}>{t('dashboard')}</Link>}

            <span className="mx-2 h-5 w-px bg-slate-200" />

            {/* Language switcher */}
            <div className="flex items-center gap-0.5">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLocale(l.code)}
                  aria-current={locale === l.code ? 'true' : undefined}
                  className={`rounded-md px-2 py-1 font-mono text-xs transition-colors ${
                    locale === l.code
                      ? 'bg-slate-100 font-semibold text-ink'
                      : 'text-slate-500 hover:text-ink'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <span className="mx-2 h-5 w-px bg-slate-200" />

            {authed ? (
              <Button variant="ghost" size="sm" onClick={logout}>{t('logout')}</Button>
            ) : (
              <>
                <Link href={`/${locale}/login`} className={linkCls}>{t('login')}</Link>
                <Link href={`/${locale}/register`} className={linkCls}>{t('register')}</Link>
              </>
            )}

            <span className="mx-2 h-5 w-px bg-slate-200" />

            {/* Primary conversion channel for this audience — phone beats any form */}
            <div className="flex items-center gap-1.5">
              <a
                href={CONTACT.viberHref}
                aria-label={t('chatViber')}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
              >
                <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
              </a>
              <a
                href={CONTACT.telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('chatTelegram')}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
              >
                <Send className="h-[18px] w-[18px]" aria-hidden="true" />
              </a>
              <a
                href={CONTACT.phoneHref}
                aria-label={t('callUs')}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono tabular">{CONTACT.phoneDisplay}</span>
              </a>
            </div>
          </nav>

          {/* Mobile: call button always visible next to the hamburger, no need to open the menu */}
          <div className="flex items-center gap-1 md:hidden">
            <a
              href={CONTACT.phoneHref}
              aria-label={t('callUs')}
              className="flex items-center justify-center rounded-lg bg-brand-600 p-2 text-white"
            >
              <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <Container className="space-y-1 py-3">
            <Link href={`/${locale}/trips`} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">{t('trips')}</Link>
            <Link href={`/${locale}/parcels`} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">{t('parcels')}</Link>
            {authed ? (
              <>
                <Link href={`/${locale}/bookings`} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">{t('bookings')}</Link>
                <Link href={`/${locale}/dashboard`} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">{t('dashboard')}</Link>
                <button onClick={logout} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">{t('logout')}</button>
              </>
            ) : (
              <div className="flex flex-col gap-1">
                <Link href={`/${locale}/login`} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">{t('login')}</Link>
                <Link href={`/${locale}/register`} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">{t('register')}</Link>
              </div>
            )}

            <div className="flex flex-col gap-1 border-t border-slate-200 pt-2">
              <a href={CONTACT.phoneHref} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                <Phone className="h-4 w-4" aria-hidden="true" /> {CONTACT.phoneDisplay}
              </a>
              <a href={CONTACT.viberHref} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">{t('chatViber')}</a>
              <a href={CONTACT.telegramHref} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">{t('chatTelegram')}</a>
            </div>

            <div className="flex gap-1 pt-2">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLocale(l.code)}
                  className={`rounded-md px-2.5 py-1 font-mono text-xs ${
                    locale === l.code ? 'bg-slate-100 font-semibold text-ink' : 'text-slate-500'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
