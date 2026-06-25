'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

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
    <div
      className="cookie-enter"
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#04122a',
        color: '#fff',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        zIndex: 9000,
        maxWidth: 580,
        width: 'calc(100% - 32px)',
      }}
    >
      <p className="text-sm flex-1 min-w-0" style={{ color: '#cbd5e1' }}>
        {t('message')}{' '}
        <Link href={`/${locale}/privacy`} style={{ color: '#f59e0b', textDecoration: 'underline' }}>
          {t('privacyPolicy')}
        </Link>
      </p>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{ background: 'transparent', color: '#94a3b8', padding: '7px 14px', borderRadius: 8, border: '1px solid #334155', cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}
        >
          {t('decline')}
        </button>
        <button
          onClick={accept}
          style={{ background: '#f59e0b', color: '#04122a', padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 13 }}
        >
          {t('accept')}
        </button>
      </div>
    </div>
  );
}
