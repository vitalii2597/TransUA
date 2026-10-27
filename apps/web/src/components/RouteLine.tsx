/**
 * Signature motif: an origin ● —— destination ○ connector that encodes the trip.
 * Reused in the hero, route cards, trip results and tickets. Markers are fixed-size
 * CSS circles (not SVG stretched by preserveAspectRatio) so they stay round at any
 * container width — from a narrow route card to a wide timetable row.
 */
export function RouteLine({
  from,
  to,
  middle,
  animate = false,
  className = '',
}: {
  from?: string;
  to?: string;
  middle?: string;
  animate?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {from && <span className="shrink-0 font-medium text-ink">{from}</span>}
      <span className="relative flex flex-1 items-center">
        {/* origin dot — fixed size, never distorted regardless of container width */}
        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
        {/* connector */}
        <span
          className={`mx-1.5 h-0 flex-1 border-t border-dashed border-slate-300 ${
            animate ? 'line-grow origin-left' : ''
          }`}
          aria-hidden="true"
        />
        {/* destination ring */}
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full border-[1.5px] border-brand-600 bg-white"
          aria-hidden="true"
        />
        {middle && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 font-mono text-xs text-slate-500 tabular">
            {middle}
          </span>
        )}
      </span>
      {to && <span className="shrink-0 font-medium text-ink">{to}</span>}
    </div>
  );
}
