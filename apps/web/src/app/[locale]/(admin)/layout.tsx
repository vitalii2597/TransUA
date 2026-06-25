'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    if (!isAuthenticated()) { router.replace(`/${locale}/login`); return; }
    api.get('/users/me').then((res) => {
      if (res.data.data.role !== 'ADMIN') router.replace(`/${locale}`);
    }).catch(() => router.replace(`/${locale}/login`));
  }, []);

  return <>{children}</>;
}
