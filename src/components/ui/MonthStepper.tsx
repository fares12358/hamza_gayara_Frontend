import { monthName } from '../../lib/dates';
import { Icon } from '../layout/Icon';
import { Button } from './Button';

/** Previous / month list / next. In RTL the "previous" arrow points right. */
export function MonthStepper({ months, value, onChange }: { months: string[]; value: string; onChange: (m: string) => void }) {
  const index = months.indexOf(value);
  return (
    <div className="flex items-center gap-1 self-start rounded-2xl border border-line bg-surface p-1">
      <Button variant="ghost" size="icon" aria-label="الشهر اللي قبله" disabled={index <= 0} onClick={() => onChange(months[index - 1])}>
        <Icon name="right" />
      </Button>
      <select
        aria-label="الشهر"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 rounded-xl bg-surface px-3 text-center font-display text-lg font-bold"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {monthName(m)} {m.slice(0, 4)}
          </option>
        ))}
      </select>
      <Button variant="ghost" size="icon" aria-label="الشهر اللي بعده" disabled={index < 0 || index >= months.length - 1} onClick={() => onChange(months[index + 1])}>
        <Icon name="left" />
      </Button>
    </div>
  );
}
