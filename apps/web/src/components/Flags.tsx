/**
 * Simple, crisp SVG flags for the four countries TransUA serves — used instead
 * of emoji so they render identically on every OS. Rounded + hairline ring.
 */
import type { JSX } from 'react';

type FlagCode = 'ua' | 'pl' | 'se' | 'no';

function Ua() {
  return (
    <svg viewBox="0 0 24 16" className="h-full w-full">
      <rect width="24" height="8" fill="#0057B7" />
      <rect y="8" width="24" height="8" fill="#FFD700" />
    </svg>
  );
}
function Pl() {
  return (
    <svg viewBox="0 0 24 16" className="h-full w-full">
      <rect width="24" height="8" fill="#ffffff" />
      <rect y="8" width="24" height="8" fill="#DC143C" />
    </svg>
  );
}
function Se() {
  return (
    <svg viewBox="0 0 24 16" className="h-full w-full">
      <rect width="24" height="16" fill="#006AA7" />
      <rect x="7" width="3" height="16" fill="#FECC00" />
      <rect y="6.5" width="24" height="3" fill="#FECC00" />
    </svg>
  );
}
function No() {
  return (
    <svg viewBox="0 0 24 16" className="h-full w-full">
      <rect width="24" height="16" fill="#EF2B2D" />
      <rect x="6" width="5" height="16" fill="#ffffff" />
      <rect y="5.5" width="24" height="5" fill="#ffffff" />
      <rect x="7" width="3" height="16" fill="#002868" />
      <rect y="6.5" width="24" height="3" fill="#002868" />
    </svg>
  );
}

const MAP: Record<FlagCode, () => JSX.Element> = { ua: Ua, pl: Pl, se: Se, no: No };

export function Flag({ code, className = 'h-3.5 w-5' }: { code: FlagCode; className?: string }) {
  const F = MAP[code];
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-[3px] ring-1 ring-slate-900/10 ${className}`}
      aria-hidden="true"
    >
      <F />
    </span>
  );
}
