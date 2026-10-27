'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Ticket } from 'lucide-react';
import {
  type Run,
  type ScheduleRunRow,
  toRun,
  PHASE_META,
  parseLocalDate,
  startOfDay,
  fmtDate,
  fmtRange,
  phaseStatus,
  isRunDone,
  groupByMonth,
} from '@/lib/scheduleRun';

export default function TripsPage() {
  const t = useTranslations('trips');
  const { locale } = useParams<{ locale: string }>();
  const toast = useToast();
  const intlLocale = { uk: 'uk-UA', no: 'nb-NO', sv: 'sv-SE', pl: 'pl-PL' }[locale] ?? 'en-GB';

  const [runs, setRuns] = useState<Run[] | null>(null);

  useEffect(() => {
    api.get('/schedule-runs')
      .then((res) => setRuns((res.data.data as ScheduleRunRow[]).map(toRun)))
      .catch(() => {
        setRuns([]);
        toast('Failed to load schedule', 'error');
      });
  }, []);

  const today = startOfDay(new Date());
  const groups = groupByMonth(runs ?? []);

  if (runs === null)
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );

  return (
    <Container className="max-w-3xl py-12">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-600">{t('eyebrow')}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t('title')}</h1>
      <p className="mt-2 max-w-lg text-slate-500">{t('subtitle')}</p>

      <div className="mt-10">
        {groups.map((group) => {
          const monthLabel = parseLocalDate(`${group.month}-01`).toLocaleDateString(intlLocale, {
            month: 'long',
            year: 'numeric',
          });

          return (
            <div key={group.month}>
              <div className="mb-4 mt-10 flex items-center gap-3 first:mt-0">
                <h2 className="shrink-0 font-mono text-xs font-semibold uppercase tracking-wider text-brand-600">
                  {monthLabel}
                </h2>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="space-y-4">
                {group.runs.map((run) => {
                  const runDone = isRunDone(run, today);
                  // Bookable while either passenger leg (outbound or return) hasn't left yet.
                  const bookable = run.phases.some(
                    (p) => (p.type === 'passengers' || p.type === 'return') && phaseStatus(p, today) !== 'done',
                  );

                  return (
                    <Card key={run.id} className={`p-6 ${runDone ? 'opacity-60' : ''}`}>
                      <div className="mb-5 flex items-center justify-between">
                        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-600">
                          {t('run')} {run.number}
                        </p>
                        {runDone && <Badge tone="neutral">{t('completed')}</Badge>}
                      </div>

                      <ol className="space-y-0">
                        {run.phases.map((phase, i) => {
                          const meta = PHASE_META[phase.type];
                          const Icon = meta.icon;
                          const status = phaseStatus(phase, today);
                          const isLast = i === run.phases.length - 1;
                          const dateText =
                            phase.type === 'destination' && phase.endDate
                              ? fmtRange(phase.date, phase.endDate)
                              : fmtDate(phase.date);

                          return (
                            <li key={phase.type} className="relative flex gap-4 pb-6 last:pb-0">
                              {!isLast && (
                                <span
                                  className="absolute left-4 top-9 h-[calc(100%-2.25rem)] w-px border-l border-dashed border-slate-300"
                                  aria-hidden="true"
                                />
                              )}
                              <span className="relative shrink-0">
                                {status === 'current' && (
                                  <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-brand-400 opacity-50" />
                                )}
                                <span
                                  className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                                    status === 'done'
                                      ? 'bg-slate-100 text-slate-500'
                                      : status === 'current'
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-brand-50 text-brand-600'
                                  }`}
                                >
                                  <Icon className="h-4 w-4" aria-hidden="true" />
                                </span>
                              </span>
                              <div className="min-w-0 flex-1 pt-1">
                                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                                  <p className={`font-medium ${status === 'done' ? 'text-slate-500' : 'text-ink'}`}>
                                    {t(meta.labelKey)}
                                  </p>
                                  <p
                                    className={`font-mono text-sm tabular ${
                                      status === 'done' ? 'text-slate-500' : 'text-ink'
                                    }`}
                                  >
                                    {dateText}
                                  </p>
                                </div>
                                {phase.cutoff && (
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {t('parcelCutoff', { date: fmtDate(phase.cutoff) })}
                                  </p>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ol>

                      {bookable && (
                        <div className="mt-6 border-t border-slate-100 pt-5">
                          <Button href={`/${locale}/book/${run.id}`} className="w-full sm:w-auto">
                            <Ticket className="h-4 w-4" aria-hidden="true" />
                            {t('bookSeat')}
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
