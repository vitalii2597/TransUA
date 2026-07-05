import { Flag } from '@/components/Flags';
import { RouteLine } from '@/components/RouteLine';

/**
 * Branded left panel for the auth split-layout (login / register).
 * Brand-tinted surface with the RouteLine motif + served-countries flags.
 * Hidden on small screens; the form fills the width there.
 */
export function AuthAside({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative hidden overflow-hidden bg-brand-600 lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-white">
      {/* soft aurora glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-brand-400/40 blur-3xl"
      />

      <div className="relative">
        <span className="font-display text-xl font-semibold tracking-tight">TransUA</span>
      </div>

      <div className="relative space-y-6">
        <h2 className="font-display text-3xl font-semibold leading-tight">{title}</h2>
        <p className="max-w-sm text-sm text-white/80">{subtitle}</p>
        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/15">
          <RouteLine from="Kyiv" to="Oslo" middle="1 850 km" className="text-white [&_*]:text-white" />
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <span className="text-xs uppercase tracking-wide text-white/60">Countries we serve</span>
        <span className="flex items-center gap-1.5">
          <Flag code="ua" />
          <Flag code="pl" />
          <Flag code="se" />
          <Flag code="no" />
        </span>
      </div>
    </div>
  );
}
