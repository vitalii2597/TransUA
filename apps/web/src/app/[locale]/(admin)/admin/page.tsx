'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';

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
  const router = useRouter();
  const toast = useToast();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data.data))
      .catch(() => toast('Failed to load stats', 'error'));
  }, []);

  const cards = stats ? [
    { label: t('totalUsers'), value: stats.users, color: '#1a3a5c' },
    { label: t('totalTrips'), value: stats.trips, color: '#7c3aed' },
    { label: t('totalBookings'), value: stats.bookings, color: '#059669' },
    { label: t('totalParcels'), value: stats.parcels, color: '#d97706' },
    { label: t('revenue'), value: `${stats.revenueUah.toLocaleString()} ₴`, color: '#dc2626' },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">{t('title')}</h1>

      {!stats ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {cards.map((c) => (
            <div key={c.label} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.07)', padding: '20px 24px' }}>
              <p className="text-sm text-gray-500 mb-1">{c.label}</p>
              <p className="text-3xl font-bold" style={{ color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('users'), path: 'users' },
          { label: t('trips'), path: 'trips' },
          { label: t('parcels'), path: 'parcels' },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(`/${locale}/admin/${item.path}`)}
            style={{ background: '#1a3a5c', color: '#fff', borderRadius: 10, padding: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            className="hover:opacity-90 transition"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
