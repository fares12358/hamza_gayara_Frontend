import { Icon } from '../layout/Icon';
import { Money } from './Money';

/** The effect of a record before saving it: now → after. */
export function BalancePreview({ label, before, after }: { label: string; before: number; after: number }) {
  return (
    <div className="rounded-xl bg-raised px-4 py-3">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 flex flex-wrap items-center gap-x-2">
        <Money value={before} className="text-sm text-muted" />
        <Icon name="arrowLeft" className="size-5 text-muted" />
        <span className="sr-only">بعد الحفظ</span>
        <Money value={after} className="font-display text-xl font-bold" />
      </p>
    </div>
  );
}
