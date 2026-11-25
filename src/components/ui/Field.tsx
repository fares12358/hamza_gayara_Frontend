import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { daysAgoIso, formatLongDate, todayIso } from '../../lib/dates';
import { formatMoney, parseMoney } from '../../lib/money';
import { Icon, type IconName } from '../layout/Icon';

const control = 'min-h-12 w-full min-w-0 rounded-xl border bg-bg px-3 text-base text-ink placeholder:text-muted/70';

function Wrapper({ id, label, children, className = '' }: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string;
  error?: string;
  /** Helper line under the box. */
  hint?: ReactNode;
  icon?: IconName;
  suffix?: string;
  onValue?: (value: string) => void;
};

export function Input({ label, error, hint, icon, suffix, onValue, className, type = 'text', ...rest }: InputProps) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} className={className}>
      <div className="relative">
        {icon && <Icon name={icon} className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted" />}
        <input
          id={id}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-note` : undefined}
          onChange={(e) => onValue?.(e.target.value)}
          className={`${control} ${error ? 'border-danger' : 'border-field'} ${type === 'date' ? '[direction:ltr] text-right' : ''} ${icon ? 'ps-10' : ''} ${suffix ? 'pe-12' : ''}`}
          {...rest}
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted">{suffix}</span>}
      </div>
      {(error || hint) && (
        <div id={`${id}-note`} className={`text-sm ${error ? 'text-danger' : 'text-muted'}`}>
          {error || hint}
        </div>
      )}
    </Wrapper>
  );
}

/** Shows the amount again with separators, so an extra zero is easy to see. */
export function MoneyInput({ value, allowNegative, ...rest }: InputProps & { value: string; allowNegative?: boolean }) {
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
}

/**
 * The date box follows the browser language and may show month first,
 * so the date is also written in words.
 */
export function DateField({ label, value, onValue }: { label: string; value: string; onValue: (v: string) => void }) {
  const quick = [
    { text: 'النهارده', date: todayIso() },
    { text: 'امبارح', date: daysAgoIso(1) },
  ];
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Input label={label} type="date" value={value} max={todayIso()} onValue={onValue} hint={value ? formatLongDate(value) : undefined} />
      <div className="flex gap-2">
        {quick.map((q) => (
          <button
            key={q.text}
            type="button"
            aria-pressed={value === q.date}
            onClick={() => onValue(q.date)}
            className="min-h-11 rounded-full border border-field px-4 text-sm font-semibold text-muted aria-pressed:border-accent aria-pressed:bg-raised aria-pressed:text-ink"
          >
            {q.text}
          </button>
        ))}
      </div>
    </div>
  );
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  label: string;
  options: { value: string; label: string }[];
  onValue: (value: string) => void;
};

export function Select({ label, options, onValue, className, ...rest }: SelectProps) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} className={className}>
      <select id={id} className={`${control} border-field`} onChange={(e) => onValue(e.target.value)} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}
