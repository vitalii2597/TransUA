'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Check, Package } from 'lucide-react';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

type DestinationCountry = 'NO' | 'SE';
type ParcelStatus = 'PENDING_PICKUP' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';

interface ParcelOrder {
  id: string;
  trackingCode: string;
  recipientName: string;
  pickupAddress: string;
  deliveryAddress: string;
  weightKg: number;
  priceEur: number;
  status: ParcelStatus;
  createdAt: string;
}

interface QuoteResult {
  priceEur: number;
  deliveryDays: number;
}

function calcClientPrice(weightKg: number, destination: DestinationCountry): QuoteResult {
  const extra = Math.max(0, weightKg - 5);
  let price = 15 + extra * 2;
  if (destination === 'SE') price += 5;
  const deliveryDays = destination === 'SE' ? 5 : 4;
  return { priceEur: Math.round(price * 100) / 100, deliveryDays };
}

const STATUS_TONE: Record<ParcelStatus, 'warning' | 'brand' | 'neutral' | 'success'> = {
  PENDING_PICKUP: 'warning',
  PICKED_UP: 'brand',
  IN_TRANSIT: 'brand',
  DELIVERED: 'success',
  RETURNED: 'neutral',
};

const selectCls =
  'h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-ink ' +
  'transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30';

export default function ParcelsPage() {
  const t = useTranslations('parcels');
  const tc = useTranslations('common');
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  const toast = useToast();
  const [authed, setAuthed] = useState(false);
  const [weightKg, setWeightKg] = useState(5);
  const [destination, setDestination] = useState<DestinationCountry>('NO');
  const quote = weightKg <= 50 ? calcClientPrice(weightKg, destination) : null;

  // Order form
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successCode, setSuccessCode] = useState('');

  // My parcels
  const [parcels, setParcels] = useState<ParcelOrder[] | null>(null);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  useEffect(() => {
    if (authed) {
      api.get('/parcels')
        .then((res) => setParcels(res.data.data))
        .catch(() => toast('Failed to load parcels', 'error'));
    }
  }, [authed, successCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (weightKg > 50) { setError(t('weightTooHigh')); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/parcels', {
        pickupAddress,
        deliveryAddress,
        recipientName,
        recipientPhone,
        weightKg,
        description: description || undefined,
      });
      setSuccessCode(res.data.data.trackingCode);
      setPickupAddress('');
      setDeliveryAddress('');
      setRecipientName('');
      setRecipientPhone('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || tc('error'));
    } finally {
      setSubmitting(false);
    }
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'en-GB', { dateStyle: 'medium' });

  return (
    <Container className="max-w-2xl space-y-10 py-10">
      {/* Price Calculator */}
      <Card className="p-7">
        <h2 className="mb-5 font-display text-xl font-semibold text-ink">{t('calculator')}</h2>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <Field label={t('weight')} htmlFor="calc-weight">
            <Input
              id="calc-weight"
              type="number"
              min={0.1}
              max={50}
              step={0.1}
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field label={t('destination')} htmlFor="calc-dest">
            <select
              id="calc-dest"
              value={destination}
              onChange={(e) => setDestination(e.target.value as DestinationCountry)}
              className={selectCls}
            >
              <option value="NO">{t('norway')}</option>
              <option value="SE">{t('sweden')}</option>
            </select>
          </Field>
        </div>

        {weightKg > 50 ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{t('maxWeight')}</p>
        ) : quote ? (
          <div className="flex items-center justify-between rounded-xl bg-brand-50 px-5 py-4">
            <div>
              <p className="text-sm text-slate-500">{t('estimatedPrice')}</p>
              <p className="font-mono text-2xl font-bold tabular text-brand-700">{quote.priceEur} €</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">{t('deliveryTime')}</p>
              <p className="font-mono text-lg font-semibold tabular text-ink">
                {quote.deliveryDays} {t('days')}
              </p>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Order Form */}
      <Card className="p-7">
        <h2 className="mb-5 font-display text-xl font-semibold text-ink">{t('orderForm')}</h2>

        {!authed ? (
          <div className="py-6 text-center">
            <p className="mb-4 text-slate-500">{t('loginPrompt')}</p>
            <Button onClick={() => router.push(`/${locale}/login`)}>{t('loginBtn')}</Button>
          </div>
        ) : successCode ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mb-3 text-xl font-bold text-emerald-700">{t('success')}</p>
            <p className="text-sm text-slate-500">{t('trackingCode')}</p>
            <p className="mb-4 mt-1 select-all font-mono text-2xl font-bold tabular text-ink">{successCode}</p>
            <Button variant="secondary" onClick={() => setSuccessCode('')}>
              + {t('orderForm')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('weight')} htmlFor="ord-weight">
                <Input
                  id="ord-weight"
                  type="number"
                  min={0.1}
                  max={50}
                  step={0.1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  required
                />
              </Field>
              <Field label={t('destination')} htmlFor="ord-dest">
                <select
                  id="ord-dest"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value as DestinationCountry)}
                  className={selectCls}
                >
                  <option value="NO">{t('norway')}</option>
                  <option value="SE">{t('sweden')}</option>
                </select>
              </Field>
            </div>

            <Field label={t('pickupAddress')} htmlFor="ord-pickup">
              <Input
                id="ord-pickup"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
                minLength={5}
              />
            </Field>

            <Field label={t('deliveryAddress')} htmlFor="ord-delivery">
              <Input
                id="ord-delivery"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
                minLength={5}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t('recipientName')} htmlFor="ord-rname">
                <Input
                  id="ord-rname"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                  minLength={2}
                />
              </Field>
              <Field label={t('recipientPhone')} htmlFor="ord-rphone">
                <Input
                  id="ord-rphone"
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  required
                  minLength={5}
                />
              </Field>
            </div>

            <Field label={t('description')} htmlFor="ord-desc">
              <Input id="ord-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>

            {quote && (
              <div className="flex justify-between rounded-lg bg-brand-50 px-4 py-2.5 text-sm">
                <span className="text-slate-600">{t('estimatedPrice')}:</span>
                <span className="font-mono font-bold tabular text-brand-700">
                  {quote.priceEur} € · {quote.deliveryDays} {t('days')}
                </span>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={submitting || weightKg > 50} size="lg" className="w-full">
              {submitting ? tc('loading') : t('submit')}
            </Button>
          </form>
        )}
      </Card>

      {/* My Parcels */}
      {authed && (
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">{t('myParcels')}</h2>

          {parcels === null ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : parcels.length === 0 ? (
            <p className="text-sm text-slate-500">{t('empty')}</p>
          ) : (
            <div className="space-y-3">
              {parcels.map((p) => (
                <Card key={p.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-mono text-sm font-bold text-ink">
                        <Package className="h-4 w-4 text-brand-600" aria-hidden="true" />
                        {p.trackingCode}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {p.recipientName} · <span className="font-mono tabular">{p.weightKg} kg</span> ·{' '}
                        <span className="font-mono tabular">{p.priceEur} €</span>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{p.deliveryAddress}</p>
                      <p className="font-mono text-xs tabular text-slate-400">{fmt(p.createdAt)}</p>
                    </div>
                    <Badge tone={STATUS_TONE[p.status]}>{t(p.status)}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </Container>
  );
}
