import type { ReactNode } from 'react';

/** The look shared by every box the user types or chooses in. */
export const control =
  'min-h-12 w-full min-w-0 rounded-xl border bg-bg px-3 text-base text-ink transition-[border-color,box-shadow] duration-150 placeholder:font-normal placeholder:text-muted/70 focus:outline-2 focus:outline-offset-0 focus:outline-transparent focus:ring-3 focus:ring-accent/25';

export const controlBorder = (error?: boolean) =>
  error ? 'border-danger' : 'border-field hover:border-ink/60 focus:border-accent';

export function FieldShell({ id, labelId, label, hideLabel, children, className = '' }: {
  id: string;
  labelId?: string;
  label: string;
  hideLabel?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label id={labelId} htmlFor={id} className={hideLabel ? 'sr-only' : 'text-sm font-medium text-muted'}>
        {label}
      </label>
      {children}
    </div>
  );
}
