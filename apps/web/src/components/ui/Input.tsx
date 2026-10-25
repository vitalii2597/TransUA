import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

const inputBase =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-ink placeholder:text-slate-500 ' +
  'transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ' +
  'disabled:bg-slate-50 disabled:text-slate-500';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...props }, ref) {
    return <input ref={ref} className={`h-11 ${inputBase} ${className}`} {...props} />;
  },
);

/** Labelled field wrapper with error text. Wrap any input/control. */
export function Field({
  label,
  error,
  htmlFor,
  children,
  className = '',
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
