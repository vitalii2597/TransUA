'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, Users } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RouteLine } from '@/components/RouteLine';

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

const NEXT_STATUS: Partial<Record<TripStatus, TripStatus>> = {
  SCHEDULED: 'BOARDING',
  BOARDING: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
};

export default function DriverDashboard() {
  const t = useTranslations('driver');
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

  if (!trips)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  return (
    <Container className="max-w-3xl py-10">
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">{t('title')}</h1>

      {trips.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-500">{t('noTrips')}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <Card key={trip.id} className="p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <RouteLine from={trip.fromCity} to={trip.toCity} className="text-base" />
                  <p className="mt-2 font-mono text-sm tabular text-slate-500">
                    {fmt(trip.departureAt)} — {fmt(trip.arrivalAt)}
                  </p>
                  {trip.vehicle && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {trip.vehicle.model} · <span className="font-mono">{trip.vehicle.plateNumber}</span>
                    </p>
                  )}
                  <p className="mt-1 text-sm text-slate-600">
                    {t('passengers')}:{' '}
                    <strong className="font-mono tabular">
                      {trip._count.bookings}/{trip.totalSeats}
                    </strong>
                  </p>
                </div>
                <Badge tone={STATUS_TONE[trip.status]}>
                  {STATUS_ICONS[trip.status]} {trip.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => router.push(`/${locale}/driver/trips/${trip.id}`)}>
                  <Users className="h-4 w-4" aria-hidden="true" />
                  {t('passengers')}
                </Button>
                {NEXT_STATUS[trip.status] && (
                  <Button size="sm" onClick={() => advanceStatus(trip)} disabled={updating === trip.id}>
                    {updating === trip.id ? '...' : NEXT_STATUS[trip.status]}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
