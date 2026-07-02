import type { ReactNode } from 'react';

/** Hairline surface card. `interactive` adds a quiet hover lift for clickable cards. */
export function Card({
  children,
  className = '',
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={
        `rounded-2xl border border-slate-200 bg-white shadow-card ` +
        (interactive
          ? 'transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift '
          : '') +
        className
      }
    >
      {children}
    </div>
  );
}
