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
import { Badge } from '@/components/ui/Badge';

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
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/admin/parcels')
      .then((res) => setParcels(res.data.data))
      .catch(() => toast('Failed to load parcels', 'error'));
  }, []);

  if (parcels === null)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  const intlLocale = { uk: 'uk-UA', no: 'nb-NO', sv: 'sv-SE', pl: 'pl-PL' }[locale] ?? 'en-GB';
  const fmt = (d: string) => new Date(d).toLocaleDateString(intlLocale, { dateStyle: 'short' });
  const paginated = parcels.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    {tc('noData')}
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs font-bold tabular text-ink">{p.trackingCode}</td>
                    <td className="px-4 py-3">
                      {p.sender.firstName} {p.sender.lastName}
                      <br />
                      <span className="font-mono text-xs tabular text-slate-400">{p.sender.phone}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.recipientName}
                      <br />
                      <span className="text-xs text-slate-400">{p.deliveryAddress}</span>
                    </td>
                    <td className="px-4 py-3 font-mono tabular">{p.weightKg} kg</td>
                    <td className="px-4 py-3 font-mono tabular">{p.priceEur} €</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[p.status] ?? 'neutral'}>
                        {STATUS_ICONS[p.status] ?? '○'} {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono tabular text-slate-500">{fmt(p.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={parcels.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>
    </Container>
  );
}
