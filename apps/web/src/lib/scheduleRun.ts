import { Package, Users, MapPin, Undo2, type LucideIcon } from 'lucide-react';

export type PhaseType = 'parcels' | 'passengers' | 'destination' | 'return';

export interface RunPhase {
  type: PhaseType;
  date: string; // ISO yyyy-mm-dd
  endDate?: string; // ISO yyyy-mm-dd — set for date-range phases
  cutoff?: string; // ISO yyyy-mm-dd — parcel drop-off deadline
}

export interface Run {
  id: string;
  month: string; // ISO yyyy-mm — which section this run is published under
  number: number;
  phases: RunPhase[];
}

export interface ScheduleRunRow {
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
export function toRun(row: ScheduleRunRow): Run {
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

export const PHASE_META: Record<PhaseType, { icon: LucideIcon; labelKey: string }> = {
  parcels: { icon: Package, labelKey: 'parcelDeparture' },
  passengers: { icon: Users, labelKey: 'passengerDeparture' },
  destination: { icon: MapPin, labelKey: 'inNorway' },
  return: { icon: Undo2, labelKey: 'returnDeparture' },
};

// Plain calendar dates ("2026-07-05") must be parsed as local Y/M/D, not as a
// UTC-midnight ISO string — otherwise timezones behind UTC show the wrong day.
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function fmtDate(iso: string) {
  const d = parseLocalDate(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function fmtRange(startIso: string, endIso: string) {
  const s = parseLocalDate(startIso);
  const e = parseLocalDate(endIso);
  const dd = (d: Date) => String(d.getDate()).padStart(2, '0');
  const mm = (d: Date) => String(d.getMonth() + 1).padStart(2, '0');
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${dd(s)}–${dd(e)}.${mm(e)}`;
  }
  return `${dd(s)}.${mm(s)}–${dd(e)}.${mm(e)}`;
}

export function phaseStatus(phase: RunPhase, today: Date): 'done' | 'current' | 'upcoming' {
  const start = startOfDay(parseLocalDate(phase.date));
  const end = startOfDay(parseLocalDate(phase.endDate ?? phase.date));
  if (today.getTime() > end.getTime()) return 'done';
  if (today.getTime() >= start.getTime() && today.getTime() <= end.getTime()) return 'current';
  return 'upcoming';
}

export function isRunDone(run: Run, today: Date): boolean {
  const lastPhase = run.phases[run.phases.length - 1];
  return today.getTime() > startOfDay(parseLocalDate(lastPhase.endDate ?? lastPhase.date)).getTime();
}

export function groupByMonth(runs: Run[]) {
  const groups: { month: string; runs: Run[] }[] = [];
  for (const run of runs) {
    const last = groups[groups.length - 1];
    if (last && last.month === run.month) last.runs.push(run);
    else groups.push({ month: run.month, runs: [run] });
  }
  return groups;
}
