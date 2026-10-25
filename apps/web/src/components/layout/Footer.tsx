'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Bus, Phone, MessageCircle, Send } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Flag } from '@/components/Flags';
import { CONTACT } from '@/lib/contact';

const COUNTRIES = [
  { code: 'ua', name: 'Ukraine' },
  { code: 'pl', name: 'Poland' },
  { code: 'se', name: 'Sweden' },
  { code: 'no', name: 'Norway' },
] as const;

export default function Footer() {
  const t = useTranslations('nav');
  const tf = useTranslations('footer');
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'uk';
  const year = new Date().getFullYear();

  const col = (title: string, links: { href: string; label: string }[]) => (
    <div>
      <p className="mb-3 font-mono text-xs uppercase tracking-wider text-slate-500">{title}</p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-slate-600 transition-colors hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Bus className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-ink">TransUA</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-slate-500">{tf('tagline')}</p>
          </div>

          {col(tf('travel'), [
            { href: `/${locale}/trips`, label: t('trips') },
            { href: `/${locale}/parcels`, label: t('parcels') },
          ])}
          {col(tf('account'), [
            { href: `/${locale}/login`, label: t('login') },
            { href: `/${locale}/register`, label: t('register') },
          ])}
          {col(tf('legal'), [
            { href: `/${locale}/privacy`, label: 'Privacy' },
            { href: `/${locale}/terms`, label: 'Terms' },
          ])}
        </div>

        {/* contact channels — the primary conversion path for this audience */}
        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-slate-500">{tf('contactEyebrow')}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href={CONTACT.phoneHref} className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-brand-700">
              <Phone className="h-4 w-4" aria-hidden="true" /> <span className="font-mono tabular">{CONTACT.phoneDisplay}</span>
            </a>
            <a href={CONTACT.viberHref} className="flex items-center gap-2 text-sm text-slate-600 hover:text-ink">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t('chatViber')}
            </a>
            <a href={CONTACT.telegramHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-600 hover:text-ink">
              <Send className="h-4 w-4" aria-hidden="true" /> {t('chatTelegram')}
            </a>
          </div>
        </div>

        {/* countries we serve */}
        <div className="mt-6 border-t border-slate-200 pt-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-slate-500">{tf('countriesServe')}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {COUNTRIES.map((c) => (
              <span key={c.code} className="flex items-center gap-2 text-sm text-slate-600">
                <Flag code={c.code} /> {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* company details build trust — replace placeholders with the real registration details */}
        <div className="mt-8 flex flex-col gap-1 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
          <span>{tf('companyPlaceholder')}</span>
          <span className="hidden sm:inline">·</span>
          <span>{tf('regNumberPlaceholder')}</span>
          <span className="hidden sm:inline">·</span>
          <span>{tf('addressPlaceholder')}</span>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">© {year} TransUA. {tf('rights')}</p>
          <p className="font-mono text-xs text-slate-500">Ukraine ↔ Scandinavia</p>
        </div>
      </Container>
    </footer>
  );
}
