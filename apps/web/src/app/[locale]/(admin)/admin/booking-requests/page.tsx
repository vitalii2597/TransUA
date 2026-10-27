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
import { fmtDate } from '@/lib/scheduleRun';

type Status = 'NEW' | 'CONFIRMED' | 'CANCELLED';

interface BookingRequest {
  id: string;
  direction: 'TO_NORWAY' | 'TO_UKRAINE';
  passengers: number;
  fromCity: string;
  toCity: string;
  phone: string;
  comment: string | null;
  status: Status;
  createdAt: string;
  scheduleRun: { month: string; number: number; passengersDate: string; returnDate: string };
  user: { firstName: string; lastName: string; email: string };
}

const STATUS_LABEL: Record<Status, string> = {
  NEW: 'statusNew',
  CONFIRMED: 'statusConfirmed',
  CANCELLED: 'statusCancelled',
};

const STATUS_CLS: Record<Status, string> = {
  NEW: 'border-amber-200 bg-amber-50 text-amber-800',
  CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  CANCELLED: 'border-slate-200 bg-slate-50 text-slate-600',
};

const PAGE_SIZE = 20;

export default function AdminBookingRequestsPage() {
  const t = useTranslations('admin');
  const tb = useTranslations('bookRequest');
  const tc = useTranslations('common');
  const toast = useToast();
  const { locale } = useParams<{ locale: string }>();
  const [requests, setRequests] = useState<BookingRequest[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Requests grow without bound, so paginate server-side (unlike the small schedule-runs list).
  useEffect(() => {
    api.get('/admin/booking-requests', { params: { page, limit: PAGE_SIZE } })
      .then((res) => {
        setRequests(res.data.data);
        setTotal(res.data.meta.total);
      })
      .catch(() => toast('Failed to load booking requests', 'error'));
  }, [page]);

  async function changeStatus(id: string, status: Status) {
    setSavingId(id);
    try {
      await api.patch(`/admin/booking-requests/${id}/status`, { status });
      setRequests((prev) => prev?.map((r) => (r.id === id ? { ...r, status } : r)) ?? prev);
      toast('Status updated', 'success');
    } catch {
      toast('Failed to update status', 'error');
    } finally {
      setSavingId(null);
    }
  }

  if (requests === null)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  const intlLocale = { uk: 'uk-UA', no: 'nb-NO', sv: 'sv-SE', pl: 'pl-PL' }[locale] ?? 'en-GB';
  const fmtCreated = (iso: string) =>
    new Date(iso).toLocaleString(intlLocale, { dateStyle: 'short', timeStyle: 'short' });

  return (
    <Container className="max-w-6xl py-10">
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">{t('bookingRequests')}</h1>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[t('date'), t('run'), t('direction'), t('passengers'), t('route'), t('customer'), t('comment'), t('status')].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    {tc('noData')}
                  </td>
                </tr>
              ) : (
                requests.map((r) => {
                  const departure = r.direction === 'TO_NORWAY' ? r.scheduleRun.passengersDate : r.scheduleRun.returnDate;
                  return (
                    <tr key={r.id} className="border-t border-slate-100 align-top">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs tabular text-slate-500">{fmtCreated(r.createdAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono tabular">
                        {r.scheduleRun.month} #{r.scheduleRun.number}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {tb(r.direction === 'TO_NORWAY' ? 'toNorway' : 'toUkraine')}
                        <br />
                        <span className="font-mono text-xs tabular text-slate-500">{fmtDate(departure.slice(0, 10))}</span>
                      </td>
                      <td className="px-4 py-3 font-mono tabular">{r.passengers}</td>
                      <td className="px-4 py-3">
                        <span className="block max-w-[180px] truncate" title={`${r.fromCity} → ${r.toCity}`}>
                          {r.fromCity} → {r.toCity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.user.firstName} {r.user.lastName}
                        <br />
                        <span className="font-mono text-xs tabular text-slate-500">{r.phone}</span>
                        <br />
                        <span className="text-xs text-slate-500">{r.user.email}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="block max-w-[220px] whitespace-pre-line break-words">{r.comment ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={t('status')}
                          value={r.status}
                          disabled={savingId === r.id}
                          onChange={(e) => changeStatus(r.id, e.target.value as Status)}
                          className={`rounded-lg border px-2.5 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50 ${STATUS_CLS[r.status]}`}
                        >
                          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                            <option key={s} value={s}>
                              {t(STATUS_LABEL[s])}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={total} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>
    </Container>
  );
}
