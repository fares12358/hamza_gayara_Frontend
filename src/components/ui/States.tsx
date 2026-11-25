import type { ReactNode } from 'react';
import { Button } from './Button';

export const EmptyState = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">{children}</div>
);

export const Loading = () => (
  <div role="status" className="space-y-3">
    <span className="sr-only">جاري التحميل</span>
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-16 rounded-2xl bg-raised motion-safe:animate-pulse" />
    ))}
  </div>
);

export const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div role="alert" className="rounded-2xl border border-danger p-5 text-center">
    <p className="mb-3 text-danger">{message}</p>
    <Button onClick={onRetry}>حاول تاني</Button>
  </div>
);

/**
 * Loading / error / content in one place.
 * When a reload fails, old figures are hidden instead of looking current.
 */
export function AsyncView<T>({ state, children }: {
  state: { data?: T; error?: string; reload: () => void };
  children: (data: T) => ReactNode;
}) {
  if (state.error) return <ErrorState message={state.error} onRetry={state.reload} />;
  if (state.data === undefined) return <Loading />;
  return <>{children(state.data)}</>;
}
