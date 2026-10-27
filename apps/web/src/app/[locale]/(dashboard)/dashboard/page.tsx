'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Ticket, Bus } from 'lucide-react';
import api from '@/lib/api';
import { removeTokens } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/Spinner';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  preferredLang: string;
}

export default function DashboardPage() {
  const tc = useTranslations('common');
  const tn = useTranslations('nav');
  const ta = useTranslations('auth');
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.get('/users/me')
      .then((res) => setUser(res.data.data))
      .catch(() => router.replace(`/${locale}/login`));
  }, [locale, router]);

  function handleLogout() {
    if (!confirm(tn('logout') + '?')) return;
    removeTokens();
    router.push(`/${locale}/login`);
  }

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <Container className="max-w-4xl space-y-6 py-10">
      {/* Profile card */}
      <Card className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">
              {tc('welcome')}, {user.firstName}!
            </h1>
            <p className="mt-1 text-slate-500">{user.email}</p>
          </div>
          <Badge tone="brand">{user.role}</Badge>
        </div>
        <div className="mb-8 grid grid-cols-2 gap-4">
          {([
            [ta('firstName'), user.firstName],
            [ta('lastName'), user.lastName],
            [ta('phone'), user.phone],
            [ta('language'), user.preferredLang.toUpperCase()],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-4">
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">{label}</p>
              <p className="font-medium text-ink">{value}</p>
            </div>
          ))}
        </div>
        <Button variant="danger" onClick={handleLogout}>
          {tn('logout')}
        </Button>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card interactive className="group cursor-pointer" >
          <button onClick={() => router.push(`/${locale}/bookings`)} className="flex w-full items-center gap-4 p-6 text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Ticket className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-ink transition group-hover:text-brand-700">{tn('bookings')}</p>
              <p className="text-sm text-slate-500">{tc('viewTickets')}</p>
            </div>
          </button>
        </Card>
        <Card interactive className="group cursor-pointer">
          <button onClick={() => router.push(`/${locale}/trips`)} className="flex w-full items-center gap-4 p-6 text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Bus className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-ink transition group-hover:text-emerald-700">{tn('trips')}</p>
              <p className="text-sm text-slate-500">{tc('findTrip')}</p>
            </div>
          </button>
        </Card>
      </div>
    </Container>
  );
}
