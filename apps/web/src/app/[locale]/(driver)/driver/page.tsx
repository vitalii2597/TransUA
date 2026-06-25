'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';

type TripStatus = 'SCHEDULED' | 'BOARDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface Trip {
  id: string;
  fromCity: string;
  toCity: string;
  departureAt: string;
  arrivalAt: string;
  status: TripStatus;
  totalSeats: number;
  _count: { bookings: number };
  vehicle?: { plateNumber: string; model: string } | null;
}

const STATUS_COLORS: Record<TripStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  BOARDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

const STATUS_ICONS: Record<TripStatus, string> = {
  SCHEDULED: '○',
  BOARDING: '◑',
  IN_PROGRESS: '●',
  COMPLETED: '✓',
  CANCELLED: '✕',
};

const NEXT_STATUS: Partial<Record<TripStatus, TripStatus>> = {
  SCHEDULED: 'BOARDING',
  BOARDING: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
};

export default function DriverDashboard() {
  const t = useTranslations('driver');
  const tc = useTranslations('common');
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const toast = useToast();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    api.get('/driver/trips')
      .then((res) => setTrips(res.data.data))
      .catch(() => toast('Failed to load trips', 'error'));
  }, []);

  async function advanceStatus(trip: Trip) {
    const next = NEXT_STATUS[trip.status];
    if (!next) return;
    if (!confirm(t('confirmAdvance'))) return;
    setUpdating(trip.id);
    try {
      await api.patch(`/driver/trips/${trip.id}/status`, { status: next });
      setTrips((prev) => prev ? prev.map((t) => t.id === trip.id ? { ...t, status: next } : t) : prev);
      toast(`Status updated to ${next}`, 'success');
    } catch {
      toast('Failed to update status', 'error');
    } finally {
      setUpdating(null);
    }
  }

  const intlLocale = { uk: 'uk-UA', no: 'nb-NO', sv: 'sv-SE', pl: 'pl-PL' }[locale] ?? 'en-GB';
  const fmt = (d: string) => new Date(d).toLocaleString(intlLocale, { dateStyle: 'short', timeStyle: 'short' });

  if (!trips) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('title')}</h1>

      {trips.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
          <p className="text-gray-500">{t('noTrips')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.07)', padding: '20px 24px' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-gray-800 truncate max-w-xs">{trip.fromCity} → {trip.toCity}</p>
                  <p className="text-sm text-gray-500">{fmt(trip.departureAt)} — {fmt(trip.arrivalAt)}</p>
                  {trip.vehicle && <p className="text-xs text-gray-400 mt-0.5">{trip.vehicle.model} · {trip.vehicle.plateNumber}</p>}
                  <p className="text-sm text-gray-600 mt-1">{t('passengers')}: <strong>{trip._count.bookings}/{trip.totalSeats}</strong></p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[trip.status]}`}>{STATUS_ICONS[trip.status]} {trip.status}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => router.push(`/${locale}/driver/trips/${trip.id}`)}
                  style={{ background: '#f0f4ff', color: '#1a3a5c', padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                >
                  {t('passengers')}
                </button>
                {NEXT_STATUS[trip.status] && (
                  <button
                    onClick={() => advanceStatus(trip)}
                    disabled={updating === trip.id}
                    style={{ background: '#1a3a5c', color: '#fff', padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                    className="disabled:opacity-60"
                  >
                    {updating === trip.id ? '...' : `→ ${NEXT_STATUS[trip.status]}`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
