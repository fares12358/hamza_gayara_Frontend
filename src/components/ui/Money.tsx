import { formatMoney, SETTLED } from '../../lib/money';

export function Money({ value, className = '', currency = false, sign = '' }: {
  value: number;
  className?: string;
  currency?: boolean;
  /** Kept in the same left-to-right box as the number, so it stays in front of it. */
  sign?: '+' | '−' | '';
}) {
  return (
    <span className={className}>
      <span className="num">{sign}{formatMoney(value)}</span>
      {currency && <span className="ms-1 text-[0.6em] font-medium opacity-75">ج.م</span>}
    </span>
  );
}

/** A customer balance in words and color: عليه / له / خالص */
export function Balance({ value }: { value: number }) {
  if (Math.abs(value) < SETTLED) return <span className="text-muted">خالص</span>;
  const owes = value > 0;
  return (
    <span className="inline-flex flex-col items-end">
      <Money value={Math.abs(value)} className={`text-lg font-semibold ${owes ? 'text-danger' : 'text-ink'}`} />
      <span className="text-xs text-muted">{owes ? 'عليه' : 'له'}</span>
    </span>
  );
}
