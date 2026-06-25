'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';

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

const STATUS_COLORS: Record<ParcelStatus, string> = {
  PENDING_PICKUP: 'bg-yellow-100 text-yellow-700',
  PICKED_UP: 'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  RETURNED: 'bg-gray-100 text-gray-500',
};

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
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">

      {/* Price Calculator */}
      <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 28 }}>
        <h2 className="text-xl font-bold text-gray-800 mb-5">{t('calculator')}</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('weight')}</label>
            <input
              type="number"
              min={0.1}
              max={50}
              step={0.1}
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('destination')}</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value as DestinationCountry)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NO">{t('norway')}</option>
              <option value="SE">{t('sweden')}</option>
            </select>
          </div>
        </div>

        {weightKg > 50 ? (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{t('maxWeight')}</p>
        ) : quote ? (
          <div style={{ background: '#f0f4ff', borderRadius: 10, padding: '14px 18px' }} className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">{t('estimatedPrice')}</p>
              <p className="text-2xl font-bold" style={{ color: '#1a3a5c' }}>{quote.priceEur} €</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{t('deliveryTime')}</p>
              <p className="text-lg font-semibold text-gray-700">{quote.deliveryDays} {t('days')}</p>
            </div>
          </div>
        ) : null}
      </section>

      {/* Order Form */}
      <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 28 }}>
        <h2 className="text-xl font-bold text-gray-800 mb-5">{t('orderForm')}</h2>

        {!authed ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">{t('loginPrompt')}</p>
            <button
              onClick={() => router.push(`/${locale}/login`)}
              style={{ background: '#1a3a5c', color: '#fff', padding: '10px 28px', borderRadius: 8, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              {t('loginBtn')}
            </button>
          </div>
        ) : successCode ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 32 }} className="text-center">
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <p className="text-green-700 font-bold text-xl mb-3">{t('success')}</p>
            <p className="text-gray-500 text-sm mb-1">{t('trackingCode')}</p>
            <p className="text-2xl font-mono font-bold text-gray-800 mt-1 mb-4 select-all">{successCode}</p>
            <button
              onClick={() => setSuccessCode('')}
              style={{ background: '#1a3a5c', color: '#fff', padding: '8px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              + {t('orderForm')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('weight')}</label>
                <input
                  type="number"
                  min={0.1}
                  max={50}
                  step={0.1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('destination')}</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value as DestinationCountry)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NO">{t('norway')}</option>
                  <option value="SE">{t('sweden')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('pickupAddress')}</label>
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('deliveryAddress')}</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipientName')}</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('recipientPhone')}</label>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={5}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {quote && (
              <div style={{ background: '#f0f4ff', borderRadius: 8, padding: '10px 14px' }} className="flex justify-between text-sm">
                <span className="text-gray-600">{t('estimatedPrice')}:</span>
                <span className="font-bold" style={{ color: '#1a3a5c' }}>{quote.priceEur} € · {quote.deliveryDays} {t('days')}</span>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting || weightKg > 50}
              style={{ background: '#1a3a5c', color: '#fff', width: '100%', padding: '12px', borderRadius: 8, fontWeight: 600, border: 'none', cursor: 'pointer' }}
              className="disabled:opacity-60"
            >
              {submitting ? tc('loading') : t('submit')}
            </button>
          </form>
        )}
      </section>

      {/* My Parcels */}
      {authed && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('myParcels')}</h2>

          {parcels === null ? (
            <Spinner />
          ) : parcels.length === 0 ? (
            <p className="text-gray-500 text-sm">{t('empty')}</p>
          ) : (
            <div className="space-y-3">
              {parcels.map((p) => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.07)', padding: '16px 20px' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-sm font-bold text-gray-700">{p.trackingCode}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{p.recipientName} · {p.weightKg} kg · {p.priceEur} €</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.deliveryAddress}</p>
                      <p className="text-xs text-gray-400">{fmt(p.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>
                      {t(p.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
