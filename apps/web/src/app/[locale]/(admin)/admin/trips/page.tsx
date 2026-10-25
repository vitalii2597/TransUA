'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Pagination } from '@/components/Pagination';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

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

const STATUS_TONE: Record<TripStatus, 'brand' | 'warning' | 'success' | 'neutral'> = {
  SCHEDULED: 'brand',
  BOARDING: 'warning',
  IN_PROGRESS: 'brand',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
};

const STATUS_ICONS: Record<TripStatus, string> = {
  SCHEDULED: '○',
  BOARDING: '◑',
  IN_PROGRESS: '●',
  COMPLETED: '✓',
  CANCELLED: '✕',
};

const PAGE_SIZE = 20;

const selectCls =
  'rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-ink ' +
  'transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60';

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

  if (trips === null)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  return (
    <Container className="max-w-6xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">{t('trips')}</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('addTrip')}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 p-6">
          <form onSubmit={createTrip}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {[
                { key: 'fromCity', label: t('from'), type: 'text' },
                { key: 'toCity', label: t('to'), type: 'text' },
                { key: 'departureAt', label: t('departure'), type: 'datetime-local' },
                { key: 'arrivalAt', label: t('arrival'), type: 'datetime-local' },
                { key: 'priceUah', label: `${t('price')} (UAH)`, type: 'number' },
                { key: 'totalSeats', label: t('seats'), type: 'number' },
              ].map(({ key, label, type }) => (
                <Field key={key} label={label} htmlFor={`new-${key}`}>
                  <Input
                    id={`new-${key}`}
                    type={type}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    required
                  />
                </Field>
              ))}
            </div>
            <div className="mt-4">
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting ? '...' : 'Create'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[t('from'), t('to'), t('departure'), t('price'), t('seats'), t('driver'), t('status'), t('actions')].map(
                  (h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    {tc('noData')}
                  </td>
                </tr>
              ) : (
                trips.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((trip) => (
                  <tr key={trip.id} className="border-t border-slate-100">
                    <td className="max-w-[120px] truncate px-4 py-3 font-medium text-ink" title={trip.fromCity}>
                      {trip.fromCity}
                    </td>
                    <td className="max-w-[120px] truncate px-4 py-3" title={trip.toCity}>
                      {trip.toCity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono tabular text-slate-600">
                      {fmt(trip.departureAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono tabular">{trip.priceUah} ₴</td>
                    <td className="px-4 py-3 font-mono tabular">
                      {trip._count?.bookings ?? 0}/{trip.totalSeats}
                    </td>
                    <td
                      className="max-w-[120px] truncate px-4 py-3 text-slate-600"
                      title={trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : ''}
                    >
                      {trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : t('noDriver')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[trip.status]}>
                        {STATUS_ICONS[trip.status]} {trip.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={trip.status}
                        onChange={(e) => updateStatus(trip.id, e.target.value as TripStatus)}
                        disabled={updatingStatus === trip.id}
                        className={selectCls}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={trips.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>
    </Container>
  );
}
