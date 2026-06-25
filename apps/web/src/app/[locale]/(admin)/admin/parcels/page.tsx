'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Pagination } from '@/components/Pagination';

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

const STATUS_COLORS: Record<string, string> = {
  PENDING_PICKUP: 'bg-yellow-100 text-yellow-700',
  PICKED_UP: 'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  RETURNED: 'bg-gray-100 text-gray-500',
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

  if (parcels === null) return <Spinner />;

  const intlLocale = { uk: 'uk-UA', no: 'nb-NO', sv: 'sv-SE', pl: 'pl-PL' }[locale] ?? 'en-GB';
  const fmt = (d: string) => new Date(d).toLocaleDateString(intlLocale, { dateStyle: 'short' });
  const paginated = parcels.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('parcels')}</h1>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.07)', overflow: 'auto' }}>
        <table className="w-full text-sm">
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              {[t('code'), t('sender'), t('recipient'), t('weight'), t('priceEur'), t('status'), t('date')].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">{tc('noData')}</td>
              </tr>
            ) : (
              paginated.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-mono text-xs font-bold">{p.trackingCode}</td>
                  <td className="px-4 py-3">{p.sender.firstName} {p.sender.lastName}<br /><span className="text-gray-400 text-xs">{p.sender.phone}</span></td>
                  <td className="px-4 py-3">{p.recipientName}<br /><span className="text-gray-400 text-xs">{p.deliveryAddress}</span></td>
                  <td className="px-4 py-3">{p.weightKg} kg</td>
                  <td className="px-4 py-3">{p.priceEur} €</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? ''}`}>
                      {STATUS_ICONS[p.status] ?? '○'} {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{fmt(p.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination total={parcels.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  );
}
