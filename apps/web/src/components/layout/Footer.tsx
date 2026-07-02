'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Bus } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Flag } from '@/components/Flags';

const COUNTRIES = [
  { code: 'ua', name: 'Ukraine' },
  { code: 'pl', name: 'Poland' },
  { code: 'se', name: 'Sweden' },
  { code: 'no', name: 'Norway' },
] as const;

export default function Footer() {
  const t = useTranslations('nav');
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'uk';
  const year = new Date().getFullYear();

  const col = (title: string, links: { href: string; label: string }[]) => (
    <div>
      <p className="mb-3 font-mono text-xs uppercase tracking-wider text-slate-400">{title}</p>
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
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Bus travel and parcels between Ukraine and Scandinavia.
            </p>
          </div>

          {col('Travel', [
            { href: `/${locale}/trips`, label: t('trips') },
            { href: `/${locale}/parcels`, label: t('parcels') },
          ])}
          {col('Account', [
            { href: `/${locale}/login`, label: t('login') },
            { href: `/${locale}/register`, label: t('register') },
          ])}
          {col('Legal', [
            { href: `/${locale}/privacy`, label: 'Privacy' },
            { href: `/${locale}/terms`, label: 'Terms' },
          ])}
        </div>

        {/* countries we serve */}
        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-slate-400">
            Countries we serve
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {COUNTRIES.map((c) => (
              <span key={c.code} className="flex items-center gap-2 text-sm text-slate-600">
                <Flag code={c.code} /> {c.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">© {year} TransUA. All rights reserved.</p>
          <p className="font-mono text-xs text-slate-400">Ukraine ↔ Scandinavia</p>
        </div>
      </Container>
    </footer>
  );
}
