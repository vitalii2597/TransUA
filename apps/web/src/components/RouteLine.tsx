/**
 * Signature motif: an origin ● —— destination ○ connector that encodes the trip.
 * Reused in the hero, route cards, trip results and tickets. On first paint the
 * line draws itself in (respects prefers-reduced-motion via globals.css).
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
      <span className="relative flex-1">
        <svg
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          className="h-3 w-full"
          aria-hidden="true"
        >
          {/* origin dot */}
          <circle cx="3" cy="6" r="3" className="fill-brand-600" />
          {/* connector */}
          <line
            x1="6"
            y1="6"
            x2="94"
            y2="6"
            pathLength={1}
            style={{ ['--route-len' as string]: 1 }}
            className={`stroke-slate-300 ${animate ? 'route-draw' : ''}`}
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          {/* destination ring */}
          <circle cx="97" cy="6" r="2.6" className="fill-white stroke-brand-600" strokeWidth="1.5" />
        </svg>
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
