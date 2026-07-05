'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { RouteLine } from '@/components/RouteLine';
import { Spinner } from '@/components/Spinner';

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
    <Container className="max-w-3xl py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">{t('searchTitle')}</h1>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t('from')} htmlFor="from">
              <Input id="from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Kyiv" />
            </Field>
            <Field label={t('to')} htmlFor="to">
              <Input id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Oslo" />
            </Field>
            <Field label={t('date')} htmlFor="date">
              <Input id="date" type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label={t('seats')} htmlFor="seats">
              <Input
                id="seats"
                type="number"
                min={1}
                max={10}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
              />
            </Field>
          </div>
          <Button type="submit" disabled={loading} size="lg" className="mt-5 w-full">
            <Search className="h-4 w-4" aria-hidden="true" />
            {loading ? tc('loading') : t('search')}
          </Button>
        </form>
      </Card>

      {loading && (
        <div className="mt-10 flex justify-center">
          <Spinner />
        </div>
      )}

      {!loading && trips !== null && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-ink">{t('results')}</h2>
          {trips.length === 0 ? (
            <p className="py-10 text-center text-slate-500">{t('noTrips')}</p>
          ) : (
            <div className="mt-4 space-y-4">
              {trips.map((trip) => (
                <Card key={trip.id} interactive className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <RouteLine from={trip.fromCity} to={trip.toCity} className="text-base" />
                      <dl className="mt-3 space-y-1 text-sm text-slate-500">
                        <div className="flex gap-2">
                          <dt>{t('departure')}:</dt>
                          <dd className="font-mono tabular text-slate-600">{fmt(trip.departureAt)}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>{t('arrival')}:</dt>
                          <dd className="font-mono tabular text-slate-600">{fmt(trip.arrivalAt)}</dd>
                        </div>
                      </dl>
                      <Badge tone="success" className="mt-2">
                        <span className="font-mono tabular">{trip.seatsAvailable}</span> {t('available')}
                      </Badge>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-2xl font-semibold tabular text-ink">{trip.priceUah} ₴</p>
                      <p className="mb-3 text-xs text-slate-400">{t('perSeat')}</p>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!isAuthenticated()) {
                            router.push(`/${locale}/login`);
                            return;
                          }
                          router.push(`/${locale}/trips/${trip.id}`);
                        }}
                      >
                        {t('book')}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
