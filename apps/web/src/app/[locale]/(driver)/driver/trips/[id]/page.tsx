'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import type { Socket } from 'socket.io-client';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';

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
  const tc = useTranslations('common');
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

  if (!bookings) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('passengers')}</h1>
        <button
          onClick={gpsActive ? stopGps : gpsConnecting ? undefined : startGps}
          disabled={gpsConnecting}
          style={{
            background: gpsActive ? '#dc2626' : gpsConnecting ? '#6b7280' : '#059669',
            color: '#fff',
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            cursor: gpsConnecting ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            opacity: gpsConnecting ? 0.8 : 1,
          }}
        >
          {gpsConnecting ? '⟳ Connecting...' : gpsActive ? t('stopGps') : t('broadcastGps')}
        </button>
      </div>

      {gpsActive && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 16px', marginBottom: 20 }} className="text-sm text-green-700 font-medium">
          ● {t('gpsActive')}
        </div>
      )}

      {bookings.length === 0 ? (
        <p className="text-gray-500">No passengers yet.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.07)', padding: '16px 20px' }}>
              <div className="flex items-start gap-4">
                <div style={{ background: '#1a3a5c', color: '#fff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  {b.seatNumber}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{b.passengerName}</p>
                  <p className="text-sm text-gray-500">{b.user.phone}</p>
                  {b.pickupAddress && <p className="text-xs text-gray-400 mt-0.5">↑ {b.pickupAddress}</p>}
                  {b.dropoffAddress && <p className="text-xs text-gray-400">↓ {b.dropoffAddress}</p>}
                  {b.luggageKg ? <p className="text-xs text-gray-400">Luggage: {b.luggageKg} kg</p> : null}
                  {b.passengers.length > 0 && (
                    <div className="mt-1 text-xs text-gray-400">
                      +{b.passengers.map((p) => p.fullName).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
