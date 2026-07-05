'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

const COOKIE_KEY = 'transua_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'uk';
  const t = useTranslations('cookie');

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-enter fixed bottom-5 left-1/2 z-[9000] flex w-[calc(100%-32px)] max-w-xl -translate-x-1/2 flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lift">
      <p className="min-w-0 flex-1 text-sm text-slate-600">
        {t('message')}{' '}
        <Link href={`/${locale}/privacy`} className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700">
          {t('privacyPolicy')}
        </Link>
      </p>
      <div className="flex shrink-0 gap-2">
        <Button variant="ghost" size="sm" onClick={decline}>
          {t('decline')}
        </Button>
        <Button size="sm" onClick={accept}>
          {t('accept')}
        </Button>
      </div>
    </div>
  );
}
