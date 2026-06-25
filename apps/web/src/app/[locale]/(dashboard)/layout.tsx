'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/${locale}/login`);
    }
  }, [locale, router]);

  return <>{children}</>;
}
