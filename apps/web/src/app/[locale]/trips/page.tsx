'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

interface Trip {
  id: string;
  fromCity: string;
  toCity: string;
  departureAt: string;
  arrivalAt: string;
  priceUah: number;
  totalSeats: number;
  seatsAvailable: number;
}

export default function TripsPage() {
  const t = useTranslations('trips');
  const tc = useTranslations('common');
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(today);
  const [seats, setSeats] = useState(1);
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get('/trips', { params: { from, to, date, seats } });
      setTrips(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  const intlLocale = { uk: 'uk-UA', no: 'nb-NO', sv: 'sv-SE', pl: 'pl-PL' }[locale] ?? 'en-GB';
  const fmt = (d: string) =>
    new Date(d).toLocaleString(intlLocale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZoneName: 'short',
    });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('searchTitle')}</h1>

      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('from')}</label>
            <input
              aria-label={t('from')}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Kyiv"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('to')}</label>
            <input
              aria-label={t('to')}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Oslo"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
            <input
              aria-label={t('date')}
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('seats')}</label>
            <input
              aria-label={t('seats')}
              type="number"
              min={1}
              max={10}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-fjord-800 text-white py-2.5 rounded-lg font-semibold hover:bg-fjord-900 transition disabled:opacity-60"
        >
          {loading ? tc('loading') : t('search')}
        </button>
      </form>

      {trips !== null && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('results')}</h2>
          {trips.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('noTrips')}</p>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {trip.fromCity} → {trip.toCity}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('departure')}: {fmt(trip.departureAt)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('arrival')}: {fmt(trip.arrivalAt)}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {trip.seatsAvailable} {t('available')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-fjord-700">{trip.priceUah} ₴</p>
                    <p className="text-xs text-gray-400 mb-3">{t('perSeat')}</p>
                    <button
                      onClick={() => {
                        if (!isAuthenticated()) {
                          router.push(`/${locale}/login`);
                          return;
                        }
                        router.push(`/${locale}/trips/${trip.id}`);
                      }}
                      className="bg-fjord-800 text-white px-5 py-2 rounded-lg font-semibold hover:bg-fjord-900 transition text-sm"
                    >
                      {t('book')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
