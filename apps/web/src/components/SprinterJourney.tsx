/**
 * Hero showpiece: a Sprinter drives Ukraine → Scandinavia along the route line,
 * carrying passengers (heads in the windows) and a parcel on the roof — the two
 * things TransUA moves. Wheels spin, the suspension bobs, a brand-blue trail
 * grows behind it, and a faint fjord skyline sits behind. Loops on a 7s cycle;
 * parks statically for prefers-reduced-motion (handled in globals.css).
 */
import { Flag } from '@/components/Flags';

function SprinterVan() {
  return (
    <svg width="92" height="59" viewBox="0 0 100 64" fill="none" aria-hidden="true">
      {/* speed whooshes — trail behind (left) as it drives right */}
      <g stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" opacity="0.7">
        <line x1="12" y1="24" x2="2" y2="24" />
        <line x1="13" y1="32" x2="1" y2="32" />
        <line x1="12" y1="40" x2="3" y2="40" />
      </g>

      {/* van body — drawn facing left, mirrored to face its travel direction (right) */}
      <g transform="translate(100,0) scale(-1,1)">
        {/* ground shadow */}
        <ellipse cx="48" cy="58" rx="40" ry="3.5" fill="#0f172a" opacity="0.12" />

        {/* cab (front, lower) */}
        <path d="M8,44 L8,28 Q8,22.5 13,20 L24,16 L24,44 Z" fill="#1d4ed8" />
        {/* cargo body (high roof) */}
        <rect x="24" y="12" width="62" height="32" rx="4" fill="#2563eb" />

        {/* parcel on the roof */}
        <g className="float-cargo">
          <rect x="50" y="3.5" width="15" height="9.5" rx="1" fill="#d8b384" />
          <rect x="50" y="3.5" width="15" height="9.5" rx="1" stroke="#b5895a" strokeWidth="0.8" />
          <line x1="57.5" y1="3.5" x2="57.5" y2="13" stroke="#b5895a" strokeWidth="0.8" />
          <rect x="55.5" y="6" width="4" height="2.4" rx="0.4" fill="#c79b6a" />
        </g>

        {/* windshield */}
        <path d="M12.5,28 Q12.5,24 16.5,21.5 L22,19.2 L22,28 Z" fill="#dbeafe" opacity="0.95" />
        {/* side windows */}
        <rect x="28" y="16" width="16" height="10" rx="1.5" fill="#cfe0fb" />
        <rect x="47" y="16" width="16" height="10" rx="1.5" fill="#cfe0fb" />
        <rect x="66" y="16" width="14" height="10" rx="1.5" fill="#cfe0fb" />
        {/* passengers */}
        <circle cx="36" cy="23" r="2.6" fill="#475569" />
        <circle cx="55" cy="23" r="2.6" fill="#475569" />
        <circle cx="73" cy="23" r="2.6" fill="#475569" />

        {/* belt line + rear door seam */}
        <rect x="24" y="33" width="62" height="2.4" fill="#1d4ed8" />
        <line x1="79" y1="12" x2="79" y2="44" stroke="#1d4ed8" strokeWidth="1" opacity="0.6" />

        {/* headlight + bumper */}
        <rect x="7.5" y="31" width="3.6" height="4.5" rx="1" fill="#fde68a" />
        <rect x="6" y="39" width="5" height="5" rx="1" fill="#0f172a" />

        {/* wheels */}
        {[26, 72].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="47" r="8.5" fill="#1e293b" />
            <g className="wheel-spin" style={{ transformOrigin: `${cx}px 47px` }}>
              <circle cx={cx} cy="47" r="4.6" fill="#94a3b8" />
              <line x1={cx} y1="43" x2={cx} y2="51" stroke="#475569" strokeWidth="1.2" />
              <line x1={cx - 4} y1="47" x2={cx + 4} y2="47" stroke="#475569" strokeWidth="1.2" />
              <line x1={cx - 2.8} y1="44.2" x2={cx + 2.8} y2="49.8" stroke="#475569" strokeWidth="1" />
              <circle cx={cx} cy="47" r="1.6" fill="#e2e8f0" />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}

export function SprinterJourney({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-sky-50 to-slate-50 shadow-card ${
        compact ? 'h-16 sm:h-20' : 'h-40 sm:h-44'
      }`}
    >
      {/* faint fjord skyline — dropped in compact mode, no room for it */}
      {!compact && (
        <svg
          viewBox="0 0 400 60"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 h-16 w-full text-slate-200"
          aria-hidden="true"
        >
          <path
            d="M0,60 L0,34 L40,14 L80,32 L120,10 L165,30 L210,8 L255,28 L300,12 L345,30 L400,16 L400,60 Z"
            fill="currentColor"
            opacity="0.55"
          />
          <path
            d="M0,60 L0,44 L55,26 L110,42 L170,22 L230,40 L290,24 L350,40 L400,30 L400,60 Z"
            fill="currentColor"
          />
        </svg>
      )}

      {/* origin · transit · destination — each flag + name on one line, in UA→PL→SE→NO order.
          Full names on desktop, short codes on mobile so nothing collides. Dropped in compact mode. */}
      {!compact && (
        <>
          <span className="absolute left-[6%] bottom-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-600 sm:text-[11px]">
            <Flag code="ua" />
            <span className="sm:hidden">UA</span>
            <span className="hidden sm:inline">Ukraine</span>
          </span>
          <span className="absolute left-1/2 bottom-4 flex -translate-x-1/2 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-600 sm:text-[11px]">
            <Flag code="pl" />
            <span className="sm:hidden">PL</span>
            <span className="hidden sm:inline">Poland</span>
          </span>
          <span className="absolute right-[6%] bottom-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-600 sm:text-[11px]">
            <Flag code="se" />
            <span className="sm:hidden">SE</span>
            <span className="hidden sm:inline">Sweden</span>
            <span className="text-slate-300">·</span>
            <Flag code="no" />
            <span className="sm:hidden">NO</span>
            <span className="hidden sm:inline">Norway</span>
          </span>
        </>
      )}

      {/* route baseline + trail + markers (origin ● · Poland ○ · destination ○) */}
      <div className={`absolute left-[6%] right-[6%] ${compact ? 'top-1/2' : 'top-[42%]'}`}>
        <div className="h-0 border-t-2 border-dashed border-slate-300" />
        <div className="trail-grow absolute inset-x-0 top-0 h-0.5 -translate-y-px bg-brand-500" />
        <span className="absolute -left-1.5 top-0 h-3 w-3 -translate-y-1/2 rounded-full bg-brand-600 ring-4 ring-brand-600/15" />
        <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-500 bg-white" />
        <span className="absolute -right-1.5 top-0 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-brand-600 bg-white" />
      </div>

      {/* the van — scaled down and re-centered on the route line in compact mode */}
      <div
        className="van-drive absolute"
        style={compact ? { top: '50%', transform: 'translateY(-50%) scale(0.55)', transformOrigin: 'center' } : { top: 'calc(42% - 47px)' }}
      >
        <div className="van-bob">
          <SprinterVan />
        </div>
      </div>
    </div>
  );
}
