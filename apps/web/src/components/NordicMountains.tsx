/**
 * Layered Norwegian fjord range for the hero backdrop: a soft horizon sun glow,
 * three ridges with atmospheric depth (pale far → deep near), snow-capped peaks,
 * and a few minimalist pines. Blue-slate tones keep it cohesive with the palette.
 * Peaks sit in the lower band so hero text keeps clear contrast above them.
 */

// A snow cap that hugs a peak apex with a soft wavy lower edge.
function snowCap(px: number, py: number, w = 22, drop = 24): string {
  return (
    `M${px - w},${py + drop} L${px},${py} L${px + w},${py + drop} ` +
    `L${px + w * 0.4},${py + drop - 5} L${px},${py + drop + 6} L${px - w * 0.4},${py + drop - 5} Z`
  );
}

// A small two-tier spruce.
function pine(x: number, y: number, s = 1): string {
  return (
    `M${x},${y - 20 * s} L${x - 7 * s},${y - 6 * s} L${x + 7 * s},${y - 6 * s} Z ` +
    `M${x},${y - 12 * s} L${x - 9 * s},${y + 6 * s} L${x + 9 * s},${y + 6 * s} Z`
  );
}

const MID_PEAKS: [number, number][] = [
  [200, 200],
  [560, 190],
  [980, 198],
  [1400, 205],
];
const NEAR_PEAKS: [number, number][] = [
  [520, 182],
  [880, 200],
  [1060, 178],
];

export function NordicMountains({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-44 w-full sm:h-52 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sun" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#fff1dc" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#ffe0be" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffe0be" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* warm dawn glow + soft sun disc, low in the sky behind the ranges */}
      <ellipse cx="720" cy="150" rx="360" ry="155" fill="url(#sun)" />
      <circle cx="720" cy="150" r="30" fill="#fff4e0" opacity="0.85" />

      {/* far ridge — palest, atmospheric */}
      <path
        d="M0,320 L0,270 L220,215 L430,255 L640,210 L860,255 L1080,215 L1300,250 L1440,225 L1440,320 Z"
        fill="#cbdcf5"
        opacity="0.65"
      />

      {/* mid ridge */}
      <path
        d="M0,320 L0,258 L200,200 L380,250 L560,190 L760,245 L980,198 L1200,248 L1400,205 L1440,210 L1440,320 Z"
        fill="#9db9e4"
      />
      {MID_PEAKS.map(([x, y]) => (
        <path key={`ms-${x}`} d={snowCap(x, y, 20, 22)} fill="#ffffff" opacity="0.7" />
      ))}

      {/* near ridge — deepest, front */}
      <path
        d="M0,320 L0,270 L160,205 L340,258 L520,182 L700,250 L880,200 L1060,178 L1240,248 L1400,210 L1440,220 L1440,320 Z"
        fill="#6f90c4"
      />
      {NEAR_PEAKS.map(([x, y]) => (
        <path key={`ns-${x}`} d={snowCap(x, y, 26, 28)} fill="#ffffff" opacity="0.92" />
      ))}

      {/* a small stand of pines on the near slope */}
      <g fill="#4f74a8">
        <path d={pine(250, 292, 1)} />
        <path d={pine(286, 300, 0.85)} />
        <path d={pine(1300, 286, 0.9)} />
      </g>
    </svg>
  );
}
