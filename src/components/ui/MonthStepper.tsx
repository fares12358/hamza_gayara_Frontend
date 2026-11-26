import { useMemo } from 'react';
import { monthName } from '../../lib/dates';
import { Icon } from '../layout/Icon';
import { Button } from './Button';
import { Select } from './Select';

/** Previous / month list / next. In RTL the "previous" arrow points right. */
export function MonthStepper({ months, value, onChange }: { months: string[]; value: string; onChange: (m: string) => void }) {
  const index = months.indexOf(value);
  const options = useMemo(() => months.map((m) => ({ value: m, label: `${monthName(m)} ${m.slice(0, 4)}` })), [months]);
  return (
    <div className="flex items-center gap-1 self-start rounded-2xl border border-line bg-surface p-1">
      <Button variant="ghost" size="icon" aria-label="الشهر اللي قبله" disabled={index <= 0} onClick={() => onChange(months[index - 1])}>
        <Icon name="right" />
      </Button>
      <Select
        label="الشهر"
        hideLabel
        value={value}
        options={options}
        onValue={onChange}
        className="w-40"
        buttonClassName="min-h-11! justify-center! border-transparent! bg-surface font-display text-lg"
      />
      <Button variant="ghost" size="icon" aria-label="الشهر اللي بعده" disabled={index < 0 || index >= months.length - 1} onClick={() => onChange(months[index + 1])}>
        <Icon name="left" />
      </Button>
    </div>
  );
}
