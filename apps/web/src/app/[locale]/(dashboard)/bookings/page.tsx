'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';

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

  if (!bookings && !loadError) return <Spinner />;
  if (loadError && !bookings) return <div className="p-8 text-center text-red-500">Failed to load bookings.</div>;

  const list = bookings ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('title')}</h1>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">{t('empty')}</p>
          <button
            onClick={() => router.push(`/${locale}/trips`)}
            className="bg-fjord-800 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-fjord-900 transition"
          >
            {th('searchTrips')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((b) => (
            <div key={b.id} className={`bg-white rounded-2xl shadow-md p-5 ${b.status === 'CANCELLED' ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {b.trip.fromCity} → {b.trip.toCity}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{fmt(b.trip.departureAt)}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <span>{t('seat')}: <strong>{b.seatNumber}</strong></span>
                    <span>{t('passenger')}: <strong>{b.passengerName}</strong></span>
                    <span>{b.trip.priceUah} ₴ · {t('cash')}</span>
                  </div>
                  {(b.pickupAddress || b.dropoffAddress) && (
                    <div className="mt-1 text-xs text-gray-400 space-y-0.5">
                      {b.pickupAddress && <p>Pickup: {b.pickupAddress}</p>}
                      {b.dropoffAddress && <p>Dropoff: {b.dropoffAddress}</p>}
                      {b.luggageKg ? <p>Luggage: {b.luggageKg} kg</p> : null}
                    </div>
                  )}
                  {b.passengers && b.passengers.length > 0 && (
                    <div className="mt-1 text-xs text-gray-400">
                      Passengers: {b.passengers.map((p) => p.fullName).join(', ')}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{t('bookingRef')}: {b.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {b.status === 'CONFIRMED' ? t('confirmed') : t('cancelled')}
                </span>
              </div>

              {b.status === 'CONFIRMED' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => downloadTicket(b.id)}
                    disabled={downloading === b.id}
                    className="text-sm bg-fjord-800 text-white px-4 py-1.5 rounded-lg hover:bg-fjord-900 transition disabled:opacity-60"
                  >
                    {downloading === b.id ? tc('loading') : t('download')}
                  </button>
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelling === b.id}
                    className="text-sm border border-red-300 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-60"
                  >
                    {cancelling === b.id ? tc('loading') : t('cancel')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
