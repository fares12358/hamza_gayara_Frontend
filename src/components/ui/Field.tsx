/**
 * Text, money and date boxes. They are "memo": give them setters that stay the same
 * (useState or useFields), and a box re-renders only when its own value changes.
 */
import { memo, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { daysAgoIso, formatLongDate, todayIso } from '../../lib/dates';
import { formatMoney, parseMoney } from '../../lib/money';
import { Icon, type IconName } from '../layout/Icon';
import { control, controlBorder, FieldShell } from './fieldStyles';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string;
  error?: string;
  /** Helper line under the box. */
  hint?: ReactNode;
  icon?: IconName;
  suffix?: string;
  onValue?: (value: string) => void;
};

export const Input = memo(function Input({ label, error, hint, icon, suffix, onValue, className, type = 'text', ...rest }: InputProps) {
  const id = useId();
  const clearable = type === 'search' && Boolean(rest.value);
  return (
    <FieldShell id={id} label={label} className={className}>
      <div className="relative">
        {icon && <Icon name={icon} className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted" />}
        <input
          id={id}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-note` : undefined}
          onChange={(e) => onValue?.(e.target.value)}
          className={`${control} ${controlBorder(Boolean(error))} ${type === 'date' ? '[direction:ltr] text-right' : ''} ${type === 'search' ? '[&::-webkit-search-cancel-button]:hidden' : ''} ${icon ? 'ps-10' : ''} ${suffix || clearable ? 'pe-12' : ''}`}
          {...rest}
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted">{suffix}</span>}
        {clearable && (
          <button
            type="button"
            aria-label="مسح البحث"
            onClick={() => {
              onValue?.('');
              document.getElementById(id)?.focus();
            }}
            className="absolute inset-y-0 end-0.5 my-auto grid size-11 place-items-center rounded-lg text-muted hover:text-ink"
          >
            <Icon name="close" className="size-4" />
          </button>
        )}
      </div>
      {(error || hint) && (
        <div id={`${id}-note`} className={`text-sm ${error ? 'text-danger' : 'text-muted'}`}>
          {error || hint}
        </div>
      )}
    </FieldShell>
  );
});

/** Shows the amount again with separators, so an extra zero is easy to see. */
export const MoneyInput = memo(function MoneyInput({ value, allowNegative, ...rest }: InputProps & { value: string; allowNegative?: boolean }) {
  const parsed = parseMoney(value, { allowNegative });
  return (
    <Input
      inputMode="decimal"
      autoComplete="off"
      placeholder="0"
      suffix="ج.م"
      value={value}
      error={parsed === null ? 'رقم غير صحيح. للكسور استخدم النقطة، زي 12.50' : undefined}
      hint={parsed ? <span className="num font-semibold text-ink">{formatMoney(parsed)}</span> : undefined}
      {...rest}
    />
  );
});

const QUICK_DATES = [
  { text: 'النهارده', date: todayIso },
  { text: 'امبارح', date: () => daysAgoIso(1) },
];

/**
 * The date box follows the browser language and may show month first,
 * so the date is also written in words.
 * Not "memo" on purpose: "today" must stay right when the app is open past midnight.
 */
export function DateField({ label, value, onValue }: { label: string; value: string; onValue: (v: string) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Input label={label} type="date" value={value} max={todayIso()} onValue={onValue} hint={value ? formatLongDate(value) : undefined} />
      <div className="flex gap-2">
        {QUICK_DATES.map((q) => (
          <button
            key={q.text}
            type="button"
            aria-pressed={value === q.date()}
            // Read at the moment of the press, never from an older screen.
            onClick={() => onValue(q.date())}
            className="min-h-11 rounded-full border border-field px-4 text-sm font-semibold text-muted transition-colors hover:text-ink aria-pressed:border-accent aria-pressed:bg-raised aria-pressed:text-ink"
          >
            {q.text}
          </button>
        ))}
      </div>
    </div>
  );
}
