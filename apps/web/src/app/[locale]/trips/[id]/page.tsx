'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { Spinner } from '@/components/Spinner';


interface Trip {
  id: string;
  fromCity: string;
  toCity: string;
  departureAt: string;
  arrivalAt: string;
  priceUah: number;
  totalSeats: number;
  takenSeats: number[];
}

interface Passenger {
  fullName: string;
  documentNumber: string;
  phone: string;
}

const STEPS = ['stepSeat', 'stepPassengers', 'stepPayment', 'stepConfirm'] as const;

export default function TripDetailPage() {
  const t = useTranslations('trips');
  const tc = useTranslations('common');
  const ta = useTranslations('auth');
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [luggageKg, setLuggageKg] = useState(0);

  // Step 2
  const [passengers, setPassengers] = useState<Passenger[]>([{ fullName: '', documentNumber: '', phone: '' }]);

  // Step 3 — cash only for now
  const paymentMethod = 'CASH';

  // Step 4
  const [bookingRef, setBookingRef] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/${locale}/login`);
      return;
    }
    api.get(`/trips/${id}`).then((res) => setTrip(res.data.data));
  }, [id, locale, router]);

  const intlLocale = { uk: 'uk-UA', no: 'nb-NO', sv: 'sv-SE', pl: 'pl-PL' }[locale] ?? 'en-GB';
  const fmt = (d: string) =>
    new Date(d).toLocaleString(intlLocale, { dateStyle: 'long', timeStyle: 'short', timeZoneName: 'short' });

  function addPassenger() {
    if (passengers.length >= 3) return;
    setPassengers([...passengers, { fullName: '', documentNumber: '', phone: '' }]);
  }

  function removePassenger(i: number) {
    setPassengers(passengers.filter((_, idx) => idx !== i));
  }

  function updatePassenger(i: number, field: keyof Passenger, value: string) {
    setPassengers(passengers.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }

  function canAdvanceStep1() {
    return selectedSeat !== null && passengers[0]?.fullName.trim().length >= 2;
  }

  function canAdvanceStep2() {
    return passengers.every((p) => p.fullName.trim().length >= 2);
  }

  async function handleSubmit() {
    if (!isAuthenticated()) {
      router.push(`/${locale}/login`);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/bookings', {
        tripId: id,
        seatNumber: selectedSeat,
        passengerName: passengers[0].fullName.trim(),
        pickupAddress: pickupAddress || undefined,
        dropoffAddress: dropoffAddress || undefined,
        luggageKg: luggageKg > 0 ? luggageKg : undefined,
        passengers: passengers.map((p) => ({
          fullName: p.fullName.trim(),
          documentNumber: p.documentNumber || undefined,
          phone: p.phone || undefined,
        })),
      });
      setBookingRef(res.data.data.id.slice(0, 8).toUpperCase());
      setStep(3);
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      if (code === 'SEAT_TAKEN') setError(t('seatAlreadyTaken'));
      else if (code === 'TRIP_FULL') setError(t('tripFull'));
      else setError(tc('error'));
      api.get(`/trips/${id}`).then((res) => setTrip(res.data.data));
    } finally {
      setSubmitting(false);
    }
  }

  if (!trip) return <Spinner />;

  const taken = new Set(trip.takenSeats);
  const seatNumbers = Array.from({ length: trip.totalSeats }, (_, i) => i + 1);

  // Step 4 — Success
  if (step === 3) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('bookingSuccess')}</h1>
        <p className="text-gray-500 mb-1">{t('cashNote')}</p>
        <p className="text-gray-500 mb-6">{trip.fromCity} → {trip.toCity} · Seat {selectedSeat}</p>
        <p className="text-sm text-gray-400 mb-6">Ref: <strong>{bookingRef}</strong></p>
        <button onClick={() => router.push(`/${locale}/bookings`)}
          className="bg-fjord-800 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-fjord-900 transition mr-3">
          {t('myBookings')}
        </button>
        <button onClick={() => router.push(`/${locale}/trips`)}
          className="border border-gray-300 px-6 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition">
          {t('search')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => router.back()} className="text-fjord-700 hover:underline text-sm mb-4">← {t('back')}</button>

      {/* Trip summary */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
        <h1 className="text-xl font-bold text-gray-800">{trip.fromCity} → {trip.toCity}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('departure')}: {fmt(trip.departureAt)}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-amber-600">💵 {t('cashNote')}</p>
          <p className="text-lg font-bold text-fjord-700">{trip.priceUah} ₴</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.slice(0, 3).map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition
              ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-fjord-800 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`ml-2 text-xs hidden sm:block ${i === step ? 'text-fjord-700 font-semibold' : 'text-gray-400'}`}>
              {t(s)}
            </span>
            {i < 2 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1 — Seat + Addresses */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">{t('selectSeat')}</h2>
            <div className="flex gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-gray-200 inline-block" /> {t('seatTaken')}</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-fjord-100 border border-fjord-300 inline-block" /> {t('seatFree')}</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-fjord-800 inline-block" /> {t('seatSelected')}</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {seatNumbers.map((n) => {
                const isTaken = taken.has(n);
                const isSelected = selectedSeat === n;
                return (
                  <button
                    key={n}
                    disabled={isTaken}
                    onClick={() => setSelectedSeat(isSelected ? null : n)}
                    aria-label={`${t('selectSeat')} ${n}${isTaken ? ` — ${t('seatTaken')}` : isSelected ? ` — ${t('seatSelected')}` : ` — ${t('seatFree')}`}`}
                    aria-pressed={isSelected}
                    className={`py-2 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-fjord-500
                      ${isTaken ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                        isSelected ? 'bg-fjord-800 text-white' :
                        'bg-fjord-50 border border-fjord-200 text-fjord-700 hover:bg-fjord-100'}`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('pickupAddress')}</label>
              <input aria-label={t('pickupAddress')} value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="e.g. Khreshchatyk St 1, Kyiv"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('dropoffAddress')}</label>
              <input aria-label={t('dropoffAddress')} value={dropoffAddress} onChange={(e) => setDropoffAddress(e.target.value)} placeholder="e.g. Karl Johans gate 1, Oslo"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('luggage')}</label>
              <input aria-label={t('luggage')} type="number" min={0} max={50} value={luggageKg}
                onChange={(e) => setLuggageKg(Number(e.target.value))}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500 text-sm" />
            </div>
          </div>

          {/* First passenger name required to advance */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-3">{t('passengerName')}</h2>
            <input aria-label={t('fullName')} value={passengers[0].fullName} onChange={(e) => updatePassenger(0, 'fullName', e.target.value)}
              placeholder="Full name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500 text-sm" />
          </div>

          <button onClick={() => setStep(1)} disabled={!canAdvanceStep1()}
            className="w-full bg-fjord-800 text-white py-2.5 rounded-lg font-semibold hover:bg-fjord-900 transition disabled:opacity-50">
            {t('next')} →
          </button>
        </div>
      )}

      {/* Step 2 — Passengers */}
      {step === 1 && (
        <div className="space-y-4">
          {passengers.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 text-sm">Passenger {i + 1}</h3>
                {i > 0 && (
                  <button onClick={() => removePassenger(i)} className="text-xs text-red-500 hover:underline">
                    {t('removePassenger')}
                  </button>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('fullName')} *</label>
                <input aria-label={`${t('fullName')} ${i + 1}`} value={p.fullName} onChange={(e) => updatePassenger(i, 'fullName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('documentNumber')}</label>
                  <input aria-label={`${t('documentNumber')} ${i + 1}`} value={p.documentNumber} onChange={(e) => updatePassenger(i, 'documentNumber', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{ta('phone')}</label>
                  <input aria-label={`${ta('phone')} ${i + 1}`} value={p.phone} onChange={(e) => updatePassenger(i, 'phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500 text-sm" />
                </div>
              </div>
            </div>
          ))}

          {passengers.length < 3 && (
            <button onClick={addPassenger}
              className="w-full border-2 border-dashed border-fjord-300 text-fjord-600 py-2.5 rounded-xl text-sm hover:bg-fjord-50 transition">
              + {t('addPassenger')}
            </button>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition">
              ← {t('back')}
            </button>
            <button onClick={() => setStep(2)} disabled={!canAdvanceStep2()}
              className="flex-1 bg-fjord-800 text-white py-2.5 rounded-lg font-semibold hover:bg-fjord-900 transition disabled:opacity-50">
              {t('next')} →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Payment */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">{t('paymentMethod')}</h2>

            {/* Cash — selected */}
            <div className="flex items-center gap-3 p-4 border-2 border-fjord-700 bg-fjord-50 rounded-xl mb-3 cursor-default">
              <div className="w-5 h-5 rounded-full border-2 border-fjord-700 flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-fjord-700" />
              </div>
              <div>
                <p className="font-semibold text-fjord-800 text-sm">💵 {t('cashPayment')}</p>
                <p className="text-xs text-fjord-600">{trip.priceUah} ₴</p>
              </div>
            </div>

            {/* Card — disabled */}
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl opacity-50 cursor-not-allowed">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
              <div>
                <p className="font-medium text-gray-500 text-sm">💳 {t('cardComingSoon')}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-md p-6 text-sm text-gray-600 space-y-1.5">
            <p className="font-semibold text-gray-800 mb-2">Summary</p>
            <p>{trip.fromCity} → {trip.toCity}</p>
            <p>{fmt(trip.departureAt)}</p>
            <p>Seat {selectedSeat} · {passengers.length} passenger{passengers.length > 1 ? 's' : ''}</p>
            {pickupAddress && <p>Pickup: {pickupAddress}</p>}
            {dropoffAddress && <p>Dropoff: {dropoffAddress}</p>}
            {luggageKg > 0 && <p>Luggage: {luggageKg} kg</p>}
            <p className="font-bold text-fjord-700 pt-1">{trip.priceUah} ₴ — cash on board</p>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition">
              ← {t('back')}
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 bg-fjord-800 text-white py-2.5 rounded-lg font-semibold hover:bg-fjord-900 transition disabled:opacity-60">
              {submitting ? tc('loading') : t('confirmBooking')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
