'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Pagination } from '@/components/Pagination';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';

interface ScheduleRun {
  id: string;
  month: string;
  number: number;
  parcelsDate: string;
  parcelsCutoff: string;
  passengersDate: string;
  destinationStart: string;
  destinationEnd: string;
  returnDate: string;
}

type EditForm = {
  month: string;
  number: string;
  parcelsDate: string;
  parcelsCutoff: string;
  passengersDate: string;
  destinationStart: string;
  destinationEnd: string;
  returnDate: string;
};

const PAGE_SIZE = 20;

const toInputValue = (iso: string) => iso.slice(0, 10);

function runToEditForm(run: ScheduleRun): EditForm {
  return {
    month: run.month,
    number: String(run.number),
    parcelsDate: toInputValue(run.parcelsDate),
    parcelsCutoff: toInputValue(run.parcelsCutoff),
    passengersDate: toInputValue(run.passengersDate),
    destinationStart: toInputValue(run.destinationStart),
    destinationEnd: toInputValue(run.destinationEnd),
    returnDate: toInputValue(run.returnDate),
  };
}

export default function AdminScheduleRunsPage() {
  const t = useTranslations('admin');
  const tt = useTranslations('trips');
  const tc = useTranslations('common');
  const toast = useToast();
  const { locale } = useParams<{ locale: string }>();
  const [runs, setRuns] = useState<ScheduleRun[] | null>(null);
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ month: '', number: '', parcelsDate: '' });
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/schedule-runs')
      .then((res) => setRuns(res.data.data))
      .catch(() => toast('Failed to load schedule runs', 'error'));
  }, []);

  async function createRun(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/schedule-runs', {
        month: form.month,
        number: Number(form.number),
        parcelsDate: form.parcelsDate,
      });
      setRuns((prev) => (prev ? [res.data.data, ...prev] : [res.data.data]));
      setForm({ month: '', number: '', parcelsDate: '' });
      setShowForm(false);
      toast('Run created', 'success');
    } catch {
      toast('Failed to create run', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(run: ScheduleRun) {
    setEditingId(run.id);
    setEditForm(runToEditForm(run));
  }

  async function saveEdit(id: string) {
    if (!editForm) return;
    setSavingEdit(true);
    try {
      const res = await api.patch(`/admin/schedule-runs/${id}`, {
        month: editForm.month,
        number: Number(editForm.number),
        parcelsDate: editForm.parcelsDate,
        parcelsCutoff: editForm.parcelsCutoff,
        passengersDate: editForm.passengersDate,
        destinationStart: editForm.destinationStart,
        destinationEnd: editForm.destinationEnd,
        returnDate: editForm.returnDate,
      });
      setRuns((prev) => (prev ? prev.map((r) => (r.id === id ? res.data.data : r)) : prev));
      setEditingId(null);
      setEditForm(null);
      toast('Run updated', 'success');
    } catch {
      toast('Failed to update run', 'error');
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteRun(id: string) {
    if (!confirm(t('confirmDeleteRun'))) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/schedule-runs/${id}`);
      setRuns((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
      toast('Run deleted', 'success');
    } catch {
      toast('Failed to delete run', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  const intlLocale = { uk: 'uk-UA', no: 'nb-NO', sv: 'sv-SE', pl: 'pl-PL' }[locale] ?? 'en-GB';
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(intlLocale, { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (runs === null)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  const editInputCls =
    'h-8 w-full rounded-md border border-slate-200 bg-white px-2 font-mono text-xs text-ink ' +
    'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30';

  return (
    <Container className="max-w-6xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">{t('scheduleRuns')}</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('addRun')}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 p-6">
          <form onSubmit={createRun}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Field label={t('month')} htmlFor="new-month">
                <Input
                  id="new-month"
                  type="text"
                  placeholder="2026-09"
                  pattern="\d{4}-\d{2}"
                  value={form.month}
                  onChange={(e) => setForm((prev) => ({ ...prev, month: e.target.value }))}
                  required
                />
              </Field>
              <Field label={t('runNumber')} htmlFor="new-number">
                <Input
                  id="new-number"
                  type="number"
                  min={1}
                  value={form.number}
                  onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
                  required
                />
              </Field>
              <Field label={tt('parcelDeparture')} htmlFor="new-parcelsDate">
                <Input
                  id="new-parcelsDate"
                  type="date"
                  value={form.parcelsDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, parcelsDate: e.target.value }))}
                  required
                />
              </Field>
            </div>
            <div className="mt-4">
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting ? '...' : 'Create'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  t('month'),
                  t('runNumber'),
                  tt('parcelDeparture'),
                  tt('passengerDeparture'),
                  tt('inNorway'),
                  tt('returnDeparture'),
                  t('actions'),
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {tc('noData')}
                  </td>
                </tr>
              ) : (
                runs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((run) => {
                  const isEditing = editingId === run.id && editForm;
                  return (
                    <tr key={run.id} className="border-t border-slate-100">
                      {isEditing ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              className={editInputCls}
                              value={editForm.month}
                              onChange={(e) => setEditForm({ ...editForm, month: e.target.value })}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={1}
                              className={editInputCls}
                              value={editForm.number}
                              onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              className={`${editInputCls} mb-1`}
                              value={editForm.parcelsDate}
                              onChange={(e) => setEditForm({ ...editForm, parcelsDate: e.target.value })}
                            />
                            <input
                              type="date"
                              className={editInputCls}
                              value={editForm.parcelsCutoff}
                              onChange={(e) => setEditForm({ ...editForm, parcelsCutoff: e.target.value })}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              className={editInputCls}
                              value={editForm.passengersDate}
                              onChange={(e) => setEditForm({ ...editForm, passengersDate: e.target.value })}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              className={`${editInputCls} mb-1`}
                              value={editForm.destinationStart}
                              onChange={(e) => setEditForm({ ...editForm, destinationStart: e.target.value })}
                            />
                            <input
                              type="date"
                              className={editInputCls}
                              value={editForm.destinationEnd}
                              onChange={(e) => setEditForm({ ...editForm, destinationEnd: e.target.value })}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              className={editInputCls}
                              value={editForm.returnDate}
                              onChange={(e) => setEditForm({ ...editForm, returnDate: e.target.value })}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                aria-label={t('save')}
                                disabled={savingEdit}
                                onClick={() => saveEdit(run.id)}
                                className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                              >
                                <Check className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <button
                                aria-label={t('cancelEdit')}
                                onClick={() => {
                                  setEditingId(null);
                                  setEditForm(null);
                                }}
                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                              >
                                <X className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-mono tabular text-ink">{run.month}</td>
                          <td className="px-4 py-3 font-mono tabular">{run.number}</td>
                          <td className="px-4 py-3">
                            <div className="font-mono tabular text-ink">{fmt(run.parcelsDate)}</div>
                            <div className="font-mono tabular text-xs text-slate-500">{fmt(run.parcelsCutoff)}</div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono tabular text-ink">
                            {fmt(run.passengersDate)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono tabular text-ink">
                            {fmt(run.destinationStart)} – {fmt(run.destinationEnd)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono tabular text-ink">
                            {fmt(run.returnDate)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                aria-label={t('edit')}
                                onClick={() => startEdit(run)}
                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                              >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <button
                                aria-label={t('delete')}
                                disabled={deletingId === run.id}
                                onClick={() => deleteRun(run.id)}
                                className="rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={runs.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>
    </Container>
  );
}
