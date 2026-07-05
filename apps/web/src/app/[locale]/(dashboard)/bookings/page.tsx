'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Download } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RouteLine } from '@/components/RouteLine';

interface Booking {
  id: string;
  seatNumber: number;
  passengerName: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  luggageKg?: number;
  passengers?: { fullName: string; documentNumber?: string; phone?: string }[];
  trip: {
    fromCity: string;
    toCity: string;
    departureAt: string;
    priceUah: number;
  };
}

export default function BookingsPage() {
  const t = useTranslations('bookings');
  const tc = useTranslations('common');
  const th = useTranslations('home');
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    api.get('/bookings/my')
      .then((res) => setBookings(res.data.data))
      .catch(() => { setLoadError(true); toast('Failed to load bookings', 'error'); });
  }, []);

  async function handleCancel(id: string) {
    if (!confirm(t('confirmCancel'))) return;
    setCancelling(id);
    try {
      await api.delete(`/bookings/${id}`);
      setBookings((prev) =>
        prev ? prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b)) : prev,
      );
      toast('Booking cancelled', 'success');
    } catch {
      toast('Failed to cancel booking', 'error');
    } finally {
      setCancelling(null);
    }
  }

  async function downloadTicket(id: string) {
    const token = document.cookie.match(/accessToken=([^;]+)/)?.[1];
    const url = `${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}/ticket.pdf`;
    setDownloading(id);
    try {
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await r.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.setAttribute('download', `ticket-${id.slice(0, 8)}.pdf`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast('Failed to download ticket', 'error');
    } finally {
      setDownloading(null);
    }
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleString(locale === 'uk' ? 'uk-UA' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  if (!bookings && !loadError)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  if (loadError && !bookings)
    return <div className="p-8 text-center text-red-600">Failed to load bookings.</div>;

  const list = bookings ?? [];

  return (
    <Container className="max-w-3xl py-10">
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">{t('title')}</h1>

      {list.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="mb-4 text-slate-500">{t('empty')}</p>
          <Button onClick={() => router.push(`/${locale}/trips`)}>{th('searchTrips')}</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((b) => (
            <Card key={b.id} className={`p-5 ${b.status === 'CANCELLED' ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <RouteLine from={b.trip.fromCity} to={b.trip.toCity} className="text-base" />
                  <p className="mt-2 font-mono text-sm tabular text-slate-500">{fmt(b.trip.departureAt)}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span>
                      {t('seat')}: <strong className="font-mono tabular">{b.seatNumber}</strong>
                    </span>
                    <span>
                      {t('passenger')}: <strong>{b.passengerName}</strong>
                    </span>
                    <span className="font-mono tabular">
                      {b.trip.priceUah} ₴ · {t('cash')}
                    </span>
                  </div>
                  {(b.pickupAddress || b.dropoffAddress) && (
                    <div className="mt-1 space-y-0.5 text-xs text-slate-400">
                      {b.pickupAddress && <p>Pickup: {b.pickupAddress}</p>}
                      {b.dropoffAddress && <p>Dropoff: {b.dropoffAddress}</p>}
                      {b.luggageKg ? <p>Luggage: {b.luggageKg} kg</p> : null}
                    </div>
                  )}
                  {b.passengers && b.passengers.length > 0 && (
                    <div className="mt-1 text-xs text-slate-400">
                      Passengers: {b.passengers.map((p) => p.fullName).join(', ')}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {t('bookingRef')}: <span className="font-mono tabular">{b.id.slice(0, 8).toUpperCase()}</span>
                  </p>
                </div>
                <Badge tone={b.status === 'CONFIRMED' ? 'success' : 'neutral'}>
                  {b.status === 'CONFIRMED' ? t('confirmed') : t('cancelled')}
                </Badge>
              </div>

              {b.status === 'CONFIRMED' && (
                <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
                  <Button size="sm" onClick={() => downloadTicket(b.id)} disabled={downloading === b.id}>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {downloading === b.id ? tc('loading') : t('download')}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleCancel(b.id)} disabled={cancelling === b.id}>
                    {cancelling === b.id ? tc('loading') : t('cancel')}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
