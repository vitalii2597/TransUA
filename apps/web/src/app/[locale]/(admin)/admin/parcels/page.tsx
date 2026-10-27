'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Pagination } from '@/components/Pagination';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';

interface Parcel {
  id: string;
  trackingCode: string;
  weightKg: number;
  priceEur: number;
  status: string;
  recipientName: string;
  deliveryAddress: string;
  createdAt: string;
  sender: { firstName: string; lastName: string; phone: string };
}

const STATUS_TONE: Record<string, 'warning' | 'brand' | 'success' | 'neutral'> = {
  PENDING_PICKUP: 'warning',
  PICKED_UP: 'brand',
  IN_TRANSIT: 'brand',
  DELIVERED: 'success',
  RETURNED: 'neutral',
};

// Select styling per tone, matching the Badge tones used elsewhere.
const STATUS_CLS: Record<'warning' | 'brand' | 'success' | 'neutral', string> = {
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  brand: 'border-brand-200 bg-brand-50 text-brand-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
};

const STATUS_ICONS: Record<string, string> = {
  PENDING_PICKUP: '○',
  PICKED_UP: '◑',
  IN_TRANSIT: '●',
  DELIVERED: '✓',
  RETURNED: '✕',
};

const PAGE_SIZE = 20;

export default function AdminParcelsPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const toast = useToast();
  const { locale } = useParams<{ locale: string }>();
  const [parcels, setParcels] = useState<Parcel[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);
  const tp = useTranslations('parcels');

  // Parcels grow without bound, so paginate server-side — fetching once and slicing
  // client-side only ever showed the API's default page (newest 20).
  useEffect(() => {
    api.get('/admin/parcels', { params: { page, limit: PAGE_SIZE } })
      .then((res) => {
        setParcels(res.data.data);
        setTotal(res.data.meta.total);
      })
      .catch(() => toast('Failed to load parcels', 'error'));
  }, [page]);

  // Same endpoint drivers use; it also appends a ParcelStatusLog entry.
  async function changeStatus(id: string, status: string) {
    setSavingId(id);
    try {
      await api.patch(`/parcels/${id}/status`, { status });
      setParcels((prev) => prev?.map((p) => (p.id === id ? { ...p, status } : p)) ?? prev);
      toast('Status updated', 'success');
    } catch {
      toast('Failed to update status', 'error');
    } finally {
      setSavingId(null);
    }
  }

  if (parcels === null)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  const intlLocale = { uk: 'uk-UA', no: 'nb-NO', sv: 'sv-SE', pl: 'pl-PL' }[locale] ?? 'en-GB';
  const fmt = (d: string) => new Date(d).toLocaleDateString(intlLocale, { dateStyle: 'short' });

  return (
    <Container className="max-w-6xl py-10">
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">{t('parcels')}</h1>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[t('code'), t('sender'), t('recipient'), t('weight'), t('priceEur'), t('status'), t('date')].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parcels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {tc('noData')}
                  </td>
                </tr>
              ) : (
                parcels.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs font-bold tabular text-ink">{p.trackingCode}</td>
                    <td className="px-4 py-3">
                      {p.sender.firstName} {p.sender.lastName}
                      <br />
                      <span className="font-mono text-xs tabular text-slate-500">{p.sender.phone}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.recipientName}
                      <br />
                      <span className="text-xs text-slate-500">{p.deliveryAddress}</span>
                    </td>
                    <td className="px-4 py-3 font-mono tabular">{p.weightKg} kg</td>
                    <td className="px-4 py-3 font-mono tabular">{p.priceEur} €</td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={t('status')}
                        value={p.status}
                        disabled={savingId === p.id}
                        onChange={(e) => changeStatus(p.id, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50 ${STATUS_CLS[STATUS_TONE[p.status] ?? 'neutral']}`}
                      >
                        {Object.keys(STATUS_TONE).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_ICONS[s]} {tp(s)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 font-mono tabular text-slate-500">{fmt(p.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={total} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>
    </Container>
  );
}
