'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Pagination } from '@/components/Pagination';

type TripStatus = 'SCHEDULED' | 'BOARDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface Trip {
  id: string;
  fromCity: string;
  toCity: string;
  departureAt: string;
  priceUah: number;
  totalSeats: number;
  status: TripStatus;
  driver?: { firstName: string; lastName: string } | null;
  _count?: { bookings: number };
}

const STATUSES: TripStatus[] = ['SCHEDULED', 'BOARDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

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

const PAGE_SIZE = 20;

export default function AdminTripsPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const toast = useToast();
  const { locale } = useParams<{ locale: string }>();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // New trip form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fromCity: '', toCity: '', departureAt: '', arrivalAt: '', priceUah: '', totalSeats: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/admin/trips')
      .then((res) => setTrips(res.data.data))
      .catch(() => toast('Failed to load trips', 'error'));
  }, []);

  async function updateStatus(tripId: string, status: TripStatus) {
    setUpdatingStatus(tripId);
    try {
      await api.patch(`/admin/trips/${tripId}/status`, { status });
      setTrips((prev) => prev ? prev.map((t) => (t.id === tripId ? { ...t, status } : t)) : prev);
      toast('Status updated', 'success');
    } catch {
      toast('Failed to update status', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  }

  async function createTrip(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/trips', {
        ...form,
        priceUah: Number(form.priceUah),
        totalSeats: Number(form.totalSeats),
      });
      setTrips((prev) => prev ? [res.data.data, ...prev] : [res.data.data]);
      setForm({ fromCity: '', toCity: '', departureAt: '', arrivalAt: '', priceUah: '', totalSeats: '' });
      setShowForm(false);
      toast('Trip created', 'success');
    } catch {
      toast('Failed to create trip', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const intlLocale = { uk: 'uk-UA', no: 'nb-NO', sv: 'sv-SE', pl: 'pl-PL' }[locale] ?? 'en-GB';
  const fmt = (d: string) => new Date(d).toLocaleString(intlLocale, { dateStyle: 'short', timeStyle: 'short' });

  if (trips === null) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('trips')}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ background: '#1a3a5c', color: '#fff', padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          {t('addTrip')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createTrip} style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'fromCity', label: t('from'), type: 'text' },
              { key: 'toCity', label: t('to'), type: 'text' },
              { key: 'departureAt', label: t('departure'), type: 'datetime-local' },
              { key: 'arrivalAt', label: t('arrival'), type: 'datetime-local' },
              { key: 'priceUah', label: `${t('price')} (UAH)`, type: 'number' },
              { key: 'totalSeats', label: t('seats'), type: 'number' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ marginTop: 16, background: '#059669', color: '#fff', padding: '8px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}
            className="disabled:opacity-60"
          >
            {submitting ? '...' : 'Create'}
          </button>
        </form>
      )}

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.07)', overflow: 'auto' }}>
        <table className="w-full text-sm">
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              {[t('from'), t('to'), t('departure'), t('price'), t('seats'), t('driver'), t('status'), t('actions')].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">{tc('noData')}</td>
              </tr>
            ) : (
              trips.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((trip) => (
                <tr key={trip.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium max-w-[120px] truncate" title={trip.fromCity}>{trip.fromCity}</td>
                  <td className="px-4 py-3 max-w-[120px] truncate" title={trip.toCity}>{trip.toCity}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{fmt(trip.departureAt)}</td>
                  <td className="px-4 py-3">{trip.priceUah} ₴</td>
                  <td className="px-4 py-3">{trip._count?.bookings ?? 0}/{trip.totalSeats}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate" title={trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : ''}>{trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : t('noDriver')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[trip.status]}`}>
                      {STATUS_ICONS[trip.status]} {trip.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={trip.status}
                      onChange={(e) => updateStatus(trip.id, e.target.value as TripStatus)}
                      disabled={updatingStatus === trip.id}
                      className="border border-gray-300 rounded px-2 py-1 text-xs disabled:opacity-60"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination total={trips.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  );
}
