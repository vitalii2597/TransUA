'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { type Run, type ScheduleRunRow, toRun, fmtDate, phaseStatus, startOfDay } from '@/lib/scheduleRun';

type Direction = 'TO_NORWAY' | 'TO_UKRAINE';
type FormData = {
  direction: Direction;
  passengers: number;
  fromCity: string;
  toCity: string;
  phone: string;
  comment?: string;
};

// Outbound passengers leave on the "passengers" phase date, the return leg on the "return" one.
const DIRECTION_PHASE = { TO_NORWAY: 'passengers', TO_UKRAINE: 'return' } as const;

export default function BookRequestPage() {
  const t = useTranslations('bookRequest');
  const tc = useTranslations('common');
  const { locale, runId } = useParams<{ locale: string; runId: string }>();
  const router = useRouter();
  const toast = useToast();

  const [run, setRun] = useState<Run | null | undefined>(undefined);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState('');

  const schema = z.object({
    direction: z.enum(['TO_NORWAY', 'TO_UKRAINE']),
    passengers: z.coerce.number().int().min(1).max(8),
    fromCity: z.string().trim().min(1, t('required')).max(100),
    toCity: z.string().trim().min(1, t('required')).max(100),
    phone: z.string().regex(/^\+?[0-9]{9,15}$/, t('invalidPhone')),
    comment: z.string().max(500).optional(),
  });

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { direction: 'TO_NORWAY', passengers: 1, fromCity: '', toCity: '', phone: '', comment: '' },
  });
  const direction = watch('direction');

  const today = startOfDay(new Date());
  const isDeparted = (r: Run, d: Direction) =>
    phaseStatus(r.phases.find((p) => p.type === DIRECTION_PHASE[d])!, today) === 'done';
  const departureDate = (r: Run, d: Direction) => r.phases.find((p) => p.type === DIRECTION_PHASE[d])!.date;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/${locale}/login`);
      return;
    }
    Promise.all([api.get('/schedule-runs'), api.get('/users/me')])
      .then(([runsRes, meRes]) => {
        const row = (runsRes.data.data as ScheduleRunRow[]).find((r) => r.id === runId);
        const found = row ? toRun(row) : null;
        setRun(found && !(isDeparted(found, 'TO_NORWAY') && isDeparted(found, 'TO_UKRAINE')) ? found : null);
        reset({
          direction: found && isDeparted(found, 'TO_NORWAY') ? 'TO_UKRAINE' : 'TO_NORWAY',
          passengers: 1,
          fromCity: '',
          toCity: '',
          phone: meRes.data.data.phone ?? '',
          comment: '',
        });
      })
      .catch(() => {
        setRun(null);
        toast(tc('error'), 'error');
      });
  }, []);

  async function onSubmit(data: FormData) {
    setError('');
    try {
      await api.post('/booking-requests', { ...data, scheduleRunId: runId, comment: data.comment || undefined });
      setSentTo(data.phone);
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      setError(
        code === 'RUN_DEPARTED' ? t('runDeparted') : code === 'TOO_MANY_PENDING_REQUESTS' ? t('tooManyPending') : tc('error'),
      );
    }
  }

  if (run === undefined)
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );

  if (run === null)
    return (
      <Container className="max-w-xl py-16">
        <Card className="p-8 text-center">
          <p className="text-slate-600">{t('notFound')}</p>
          <Button href={`/${locale}/trips`} variant="secondary" className="mt-6">
            {t('backToSchedule')}
          </Button>
        </Card>
      </Container>
    );

  if (sentTo)
    return (
      <Container className="max-w-xl py-16">
        <Card className="p-8 text-center">
          <div role="status">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden="true" />
            <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{t('successTitle')}</h1>
            <p className="mt-2 text-slate-600">{t('successText', { phone: sentTo })}</p>
          </div>
          <Button href={`/${locale}/trips`} variant="secondary" className="mt-6">
            {t('backToSchedule')}
          </Button>
        </Card>
      </Container>
    );

  const toNorway = direction === 'TO_NORWAY';

  return (
    <Container className="max-w-xl py-12">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-600">{t('eyebrow')}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">{t('title')}</h1>
      <p className="mt-2 text-slate-500">{t('subtitle')}</p>

      <Card className="mt-8 p-6">
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-slate-700">{t('direction')}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['TO_NORWAY', 'TO_UKRAINE'] as const).map((d) => {
                const departed = isDeparted(run, d);
                return (
                  <label
                    key={d}
                    className={`flex cursor-pointer flex-col rounded-lg border p-3.5 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500/40 ${
                      departed ? 'cursor-not-allowed opacity-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input type="radio" value={d} disabled={departed} className="sr-only" {...register('direction')} />
                    <span className="font-medium text-ink">{t(d === 'TO_NORWAY' ? 'toNorway' : 'toUkraine')}</span>
                    <span className="mt-0.5 font-mono text-sm tabular text-slate-500">
                      {departed ? t('departed') : fmtDate(departureDate(run, d))}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <Field label={t('passengers')} htmlFor="passengers" error={errors.passengers?.message}>
            <Input id="passengers" type="number" min={1} max={8} className="w-28 font-mono tabular" {...register('passengers')} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('fromCity')} htmlFor="fromCity" error={errors.fromCity?.message}>
              <Input
                id="fromCity"
                placeholder={t(toNorway ? 'fromCityPlaceholderNo' : 'fromCityPlaceholderUa')}
                {...register('fromCity')}
              />
            </Field>
            <Field label={t('toCity')} htmlFor="toCity" error={errors.toCity?.message}>
              <Input
                id="toCity"
                placeholder={t(toNorway ? 'toCityPlaceholderNo' : 'toCityPlaceholderUa')}
                {...register('toCity')}
              />
            </Field>
          </div>

          <Field label={t('phone')} htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" type="tel" autoComplete="tel" className="font-mono" {...register('phone')} />
          </Field>

          <Field label={t('comment')} htmlFor="comment" error={errors.comment?.message}>
            <textarea
              id="comment"
              rows={3}
              placeholder={t('commentPlaceholder')}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              {...register('comment')}
            />
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? tc('loading') : t('submit')}
          </Button>
        </form>
      </Card>
    </Container>
  );
}
