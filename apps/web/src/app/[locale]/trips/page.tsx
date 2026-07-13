'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Package, Users, MapPin, Undo2, type LucideIcon } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

type PhaseType = 'parcels' | 'passengers' | 'destination' | 'return';

interface RunPhase {
  type: PhaseType;
  date: string; // ISO yyyy-mm-dd
  endDate?: string; // ISO yyyy-mm-dd — set for date-range phases
  cutoff?: string; // ISO yyyy-mm-dd — parcel drop-off deadline
}

interface Run {
  id: string;
  month: string; // ISO yyyy-mm — which section this run is published under
  number: number;
  phases: RunPhase[];
}

interface ScheduleRunRow {
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

// Published from the admin-managed schedule (see /admin/schedule-runs) — there is
// no hourly/seat-level booking for this corridor, just a recurring dated round-trip cycle.
function toRun(row: ScheduleRunRow): Run {
  return {
    id: row.id,
    month: row.month,
    number: row.number,
    phases: [
      { type: 'parcels', date: row.parcelsDate.slice(0, 10), cutoff: row.parcelsCutoff.slice(0, 10) },
      { type: 'passengers', date: row.passengersDate.slice(0, 10) },
      { type: 'destination', date: row.destinationStart.slice(0, 10), endDate: row.destinationEnd.slice(0, 10) },
      { type: 'return', date: row.returnDate.slice(0, 10) },
    ],
  };
}

const PHASE_META: Record<PhaseType, { icon: LucideIcon; labelKey: string }> = {
  parcels: { icon: Package, labelKey: 'parcelDeparture' },
  passengers: { icon: Users, labelKey: 'passengerDeparture' },
  destination: { icon: MapPin, labelKey: 'inNorway' },
  return: { icon: Undo2, labelKey: 'returnDeparture' },
};

// Plain calendar dates ("2026-07-05") must be parsed as local Y/M/D, not as a
// UTC-midnight ISO string — otherwise timezones behind UTC show the wrong day.
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDate(iso: string) {
  const d = parseLocalDate(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function fmtRange(startIso: string, endIso: string) {
  const s = parseLocalDate(startIso);
  const e = parseLocalDate(endIso);
  const dd = (d: Date) => String(d.getDate()).padStart(2, '0');
  const mm = (d: Date) => String(d.getMonth() + 1).padStart(2, '0');
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${dd(s)}–${dd(e)}.${mm(e)}`;
  }
  return `${dd(s)}.${mm(s)}–${dd(e)}.${mm(e)}`;
}

function phaseStatus(phase: RunPhase, today: Date): 'done' | 'current' | 'upcoming' {
  const start = startOfDay(parseLocalDate(phase.date));
  const end = startOfDay(parseLocalDate(phase.endDate ?? phase.date));
  if (today.getTime() > end.getTime()) return 'done';
  if (today.getTime() >= start.getTime() && today.getTime() <= end.getTime()) return 'current';
  return 'upcoming';
}

function groupByMonth(runs: Run[]) {
  const groups: { month: string; runs: Run[] }[] = [];
  for (const run of runs) {
    const last = groups[groups.length - 1];
    if (last && last.month === run.month) last.runs.push(run);
    else groups.push({ month: run.month, runs: [run] });
  }
  return groups;
}

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
                  const lastPhase = run.phases[run.phases.length - 1];
                  const runDone = today.getTime() > startOfDay(parseLocalDate(lastPhase.endDate ?? lastPhase.date)).getTime();

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
                                      ? 'bg-slate-100 text-slate-400'
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
                                  <p className={`font-medium ${status === 'done' ? 'text-slate-400' : 'text-ink'}`}>
                                    {t(meta.labelKey)}
                                  </p>
                                  <p
                                    className={`font-mono text-sm tabular ${
                                      status === 'done' ? 'text-slate-400' : 'text-ink'
                                    }`}
                                  >
                                    {dateText}
                                  </p>
                                </div>
                                {phase.cutoff && (
                                  <p className="mt-0.5 text-xs text-slate-400">
                                    {t('parcelCutoff', { date: fmtDate(phase.cutoff) })}
                                  </p>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
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
