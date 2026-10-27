'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Users, Bus, Ticket, Package, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Stats {
  users: number;
  trips: number;
  bookings: number;
  parcels: number;
  revenueUah: number;
}

export default function AdminPage() {
  const t = useTranslations('admin');
  const { locale } = useParams<{ locale: string }>();
  const toast = useToast();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data.data))
      .catch(() => toast('Failed to load stats', 'error'));
  }, []);

  const cards: { label: string; value: string | number; icon: LucideIcon; tint: string }[] = stats
    ? [
        { label: t('totalUsers'), value: stats.users, icon: Users, tint: 'bg-brand-50 text-brand-600' },
        { label: t('totalTrips'), value: stats.trips, icon: Bus, tint: 'bg-violet-50 text-violet-600' },
        { label: t('totalBookings'), value: stats.bookings, icon: Ticket, tint: 'bg-emerald-50 text-emerald-600' },
        { label: t('totalParcels'), value: stats.parcels, icon: Package, tint: 'bg-amber-50 text-amber-600' },
        { label: t('revenue'), value: `${stats.revenueUah.toLocaleString()} ₴`, icon: Wallet, tint: 'bg-rose-50 text-rose-600' },
      ]
    : [];

  return (
    <Container className="max-w-5xl py-10">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">{t('title')}</h1>

      {!stats ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <Card key={c.label} className="p-5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${c.tint}`}>
                <c.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="mt-0.5 font-mono text-3xl font-bold tabular text-ink">{c.value}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: t('users'), path: 'users' },
          { label: t('trips'), path: 'trips' },
          { label: t('parcels'), path: 'parcels' },
          { label: t('scheduleRuns'), path: 'schedule-runs' },
          { label: t('bookingRequests'), path: 'booking-requests' },
        ].map((item) => (
          <Button key={item.path} href={`/${locale}/admin/${item.path}`} size="lg">
            {item.label}
          </Button>
        ))}
      </div>
    </Container>
  );
}
