'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Wallet } from 'lucide-react';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { Spinner } from '@/components/Spinner';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { RouteLine } from '@/components/RouteLine';

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

  if (!trip)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  const taken = new Set(trip.takenSeats);
  const seatNumbers = Array.from({ length: trip.totalSeats }, (_, i) => i + 1);

  // Step 4 — Success
  if (step === 3) {
    return (
      <Container className="max-w-md py-16 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink">{t('bookingSuccess')}</h1>
        <p className="mt-2 text-slate-500">{t('cashNote')}</p>
        <div className="mx-auto mt-4 max-w-xs">
          <RouteLine from={trip.fromCity} to={trip.toCity} middle={`#${selectedSeat}`} />
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Ref: <strong className="font-mono tabular text-ink">{bookingRef}</strong>
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={() => router.push(`/${locale}/bookings`)}>{t('myBookings')}</Button>
          <Button variant="secondary" onClick={() => router.push(`/${locale}/trips`)}>
            {t('search')}
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl py-10">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('back')}
      </button>

      {/* Trip summary */}
      <Card className="mb-6 p-5">
        <RouteLine from={trip.fromCity} to={trip.toCity} className="text-lg" />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {t('departure')}: <span className="font-mono tabular text-slate-600">{fmt(trip.departureAt)}</span>
          </p>
          <p className="font-mono text-xl font-semibold tabular text-ink">{trip.priceUah} ₴</p>
        </div>
      </Card>

      {/* Stepper */}
      <div className="mb-8 flex items-center">
        {STEPS.slice(0, 3).map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition
              ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`ml-2 hidden text-xs sm:block ${i === step ? 'font-semibold text-brand-700' : 'text-slate-500'}`}
            >
              {t(s)}
            </span>
            {i < 2 && <div className={`mx-3 h-0.5 flex-1 ${i < step ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1 — Seat + Addresses */}
      {step === 0 && (
        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="mb-4 text-base font-semibold text-ink">{t('selectSeat')}</h2>
            <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-4 w-4 rounded bg-slate-200" /> {t('seatTaken')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-4 w-4 rounded border border-brand-200 bg-brand-50" /> {t('seatFree')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-4 w-4 rounded bg-brand-600" /> {t('seatSelected')}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
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
                    className={`rounded-lg py-2 font-mono text-sm font-medium tabular transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40
                      ${
                        isTaken
                          ? 'cursor-not-allowed bg-slate-100 text-slate-500'
                          : isSelected
                            ? 'bg-brand-600 text-white'
                            : 'border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100'
                      }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <Field label={t('pickupAddress')} htmlFor="pickup">
              <Input
                id="pickup"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="e.g. Khreshchatyk St 1, Kyiv"
              />
            </Field>
            <Field label={t('dropoffAddress')} htmlFor="dropoff">
              <Input
                id="dropoff"
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder="e.g. Karl Johans gate 1, Oslo"
              />
            </Field>
            <Field label={t('luggage')} htmlFor="luggage">
              <Input
                id="luggage"
                type="number"
                min={0}
                max={50}
                value={luggageKg}
                onChange={(e) => setLuggageKg(Number(e.target.value))}
                className="w-32"
              />
            </Field>
          </Card>

          {/* First passenger name required to advance */}
          <Card className="p-6">
            <h2 className="mb-3 text-base font-semibold text-ink">{t('passengerName')}</h2>
            <Input
              aria-label={t('fullName')}
              value={passengers[0].fullName}
              onChange={(e) => updatePassenger(0, 'fullName', e.target.value)}
              placeholder="Full name"
            />
          </Card>

          <Button onClick={() => setStep(1)} disabled={!canAdvanceStep1()} size="lg" className="w-full">
            {t('next')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Step 2 — Passengers */}
      {step === 1 && (
        <div className="space-y-4">
          {passengers.map((p, i) => (
            <Card key={i} className="space-y-3 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Passenger {i + 1}</h3>
                {i > 0 && (
                  <button onClick={() => removePassenger(i)} className="text-xs text-red-600 hover:underline">
                    {t('removePassenger')}
                  </button>
                )}
              </div>
              <Field label={`${t('fullName')} *`} htmlFor={`pax-name-${i}`}>
                <Input
                  id={`pax-name-${i}`}
                  value={p.fullName}
                  onChange={(e) => updatePassenger(i, 'fullName', e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('documentNumber')} htmlFor={`pax-doc-${i}`}>
                  <Input
                    id={`pax-doc-${i}`}
                    value={p.documentNumber}
                    onChange={(e) => updatePassenger(i, 'documentNumber', e.target.value)}
                  />
                </Field>
                <Field label={ta('phone')} htmlFor={`pax-phone-${i}`}>
                  <Input
                    id={`pax-phone-${i}`}
                    value={p.phone}
                    onChange={(e) => updatePassenger(i, 'phone', e.target.value)}
                  />
                </Field>
              </div>
            </Card>
          ))}

          {passengers.length < 3 && (
            <button
              onClick={addPassenger}
              className="w-full rounded-xl border-2 border-dashed border-brand-200 py-2.5 text-sm text-brand-600 transition hover:bg-brand-50"
            >
              + {t('addPassenger')}
            </button>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(0)} size="lg" className="flex-1">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('back')}
            </Button>
            <Button onClick={() => setStep(2)} disabled={!canAdvanceStep2()} size="lg" className="flex-1">
              {t('next')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Payment */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="mb-4 text-base font-semibold text-ink">{t('paymentMethod')}</h2>

            {/* Cash — selected */}
            <div className="mb-3 flex cursor-default items-center gap-3 rounded-xl border-2 border-brand-600 bg-brand-50 p-4">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-brand-600">
                <div className="h-2.5 w-2.5 rounded-full bg-brand-600" />
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-brand-700" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-brand-800">{t('cashPayment')}</p>
                  <p className="font-mono text-xs tabular text-brand-600">{trip.priceUah} ₴</p>
                </div>
              </div>
            </div>

            {/* Card — disabled */}
            <div className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-slate-200 p-4 opacity-50">
              <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300" />
              <p className="text-sm font-medium text-slate-500">💳 {t('cardComingSoon')}</p>
            </div>
          </Card>

          {/* Summary */}
          <Card className="space-y-1.5 p-6 text-sm text-slate-600">
            <p className="mb-2 font-semibold text-ink">Summary</p>
            <p>
              {trip.fromCity} → {trip.toCity}
            </p>
            <p className="font-mono tabular">{fmt(trip.departureAt)}</p>
            <p>
              Seat <span className="font-mono tabular">{selectedSeat}</span> · {passengers.length} passenger
              {passengers.length > 1 ? 's' : ''}
            </p>
            {pickupAddress && <p>Pickup: {pickupAddress}</p>}
            {dropoffAddress && <p>Dropoff: {dropoffAddress}</p>}
            {luggageKg > 0 && <p>Luggage: {luggageKg} kg</p>}
            <p className="pt-1 font-mono font-bold tabular text-brand-700">{trip.priceUah} ₴ — cash on board</p>
          </Card>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)} size="lg" className="flex-1">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('back')}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} size="lg" className="flex-1">
              {submitting ? tc('loading') : t('confirmBooking')}
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}
