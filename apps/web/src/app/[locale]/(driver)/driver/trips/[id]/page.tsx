'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Loader2, Radio, Square } from 'lucide-react';
import type { Socket } from 'socket.io-client';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';

interface Booking {
  id: string;
  seatNumber: number;
  passengerName: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  luggageKg?: number;
  user: { firstName: string; lastName: string; phone: string };
  passengers: { fullName: string; phone?: string }[];
}

export default function DriverTripDetailPage() {
  const t = useTranslations('driver');
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsConnecting, setGpsConnecting] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    api.get(`/driver/trips/${id}/passengers`)
      .then((res) => setBookings(res.data.data))
      .catch(() => toast('Failed to load passengers', 'error'));
  }, [id]);

  async function startGps() {
    if (!navigator.geolocation) { toast('Geolocation not supported by this browser', 'error'); return; }
    setGpsConnecting(true);
    const socketModule = await import('socket.io-client');
    const socket = socketModule.io(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}/gps`);
    socketRef.current = socket as Socket;

    socket.on('connect', () => {
      socket.emit('join-trip', { tripId: id });
      setGpsConnecting(false);
      setGpsActive(true);
    });

    socket.on('connect_error', () => {
      toast('Failed to connect to GPS server', 'error');
      setGpsConnecting(false);
      socket.disconnect();
      socketRef.current = null;
    });

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit('location-update', {
          tripId: id,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: new Date().toISOString(),
        });
      },
      (err) => { console.error('GPS error', err); toast('GPS error: ' + err.message, 'error'); },
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
  }

  function stopGps() {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    socketRef.current?.disconnect();
    watchRef.current = null;
    socketRef.current = null;
    setGpsActive(false);
    setGpsConnecting(false);
  }

  useEffect(() => () => { stopGps(); }, []);

  if (!bookings)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  const gpsBase =
    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all ' +
    'focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none';
  const gpsCls = gpsActive
    ? 'bg-red-600 hover:bg-red-700'
    : gpsConnecting
      ? 'bg-slate-400'
      : 'bg-emerald-600 hover:bg-emerald-700';

  return (
    <Container className="max-w-3xl py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-ink">{t('passengers')}</h1>
        <button
          onClick={gpsActive ? stopGps : gpsConnecting ? undefined : startGps}
          disabled={gpsConnecting}
          className={`${gpsBase} ${gpsCls}`}
        >
          {gpsConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Connecting…
            </>
          ) : gpsActive ? (
            <>
              <Square className="h-4 w-4" aria-hidden="true" /> {t('stopGps')}
            </>
          ) : (
            <>
              <Radio className="h-4 w-4" aria-hidden="true" /> {t('broadcastGps')}
            </>
          )}
        </button>
      </div>

      {gpsActive && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          {t('gpsActive')}
        </div>
      )}

      {bookings.length === 0 ? (
        <p className="text-slate-500">No passengers yet.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 font-mono text-sm font-bold tabular text-white">
                  {b.seatNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{b.passengerName}</p>
                  <p className="font-mono text-sm tabular text-slate-500">{b.user.phone}</p>
                  {b.pickupAddress && <p className="mt-0.5 text-xs text-slate-500">↑ {b.pickupAddress}</p>}
                  {b.dropoffAddress && <p className="text-xs text-slate-500">↓ {b.dropoffAddress}</p>}
                  {b.luggageKg ? <p className="text-xs text-slate-500">Luggage: {b.luggageKg} kg</p> : null}
                  {b.passengers.length > 0 && (
                    <div className="mt-1 text-xs text-slate-500">
                      +{b.passengers.map((p) => p.fullName).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
