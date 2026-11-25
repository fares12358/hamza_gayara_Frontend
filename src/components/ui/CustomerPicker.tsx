import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { matchesName } from '../../lib/arabic';
import { formatMoney, SETTLED } from '../../lib/money';
import type { CustomerOption } from '../../types';
import { Icon } from '../layout/Icon';

const balanceText = (b: number) =>
  Math.abs(b) < SETTLED ? 'خالص' : `${b > 0 ? 'عليه' : 'له'} ${formatMoney(Math.abs(b))}`;

/**
 * Search and pick a customer. Money is saved on the chosen customer, so typing
 * clears the choice until a name is picked again from the list.
 */
export function CustomerPicker({ customers, value, onChange, label = 'العميل' }: {
  customers: (CustomerOption & { aliases?: string[] })[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const list = useRef<HTMLUListElement>(null);

  const selected = customers.find((c) => c.id === value);
  const matches = customers
    .filter((c) => matchesName(query, c.name, ...(c.aliases ?? [])))
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  function show() {
    setActive(0);
    setOpen(true);
  }
  function pick(customerId: string) {
    onChange(customerId);
    setQuery('');
    setOpen(false);
  }
  function move(step: number) {
    const next = Math.max(0, Math.min(matches.length - 1, active + step));
    setActive(next);
    list.current?.children[next]?.scrollIntoView({ block: 'nearest' });
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) return show();
      move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter' && open) {
      event.preventDefault(); // picking a name must not submit the form
      if (matches[active]) pick(matches[active].id);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="relative flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-muted">
        {label}
      </label>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted" />
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-activedescendant={open && matches[active] ? `${id}-${matches[active].id}` : undefined}
          autoComplete="off"
          placeholder="اكتب اسم العميل"
          value={open ? query : selected?.name ?? ''}
          onFocus={() => {
            setQuery('');
            show();
          }}
          onClick={() => !open && show()}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            setQuery(e.target.value);
            show();
            if (value) onChange('');
          }}
          className="min-h-12 w-full rounded-xl border border-line bg-bg ps-10 pe-10 text-base font-semibold placeholder:font-normal placeholder:text-muted/70"
        />
        <Icon name="down" className="pointer-events-none absolute inset-y-0 end-3 my-auto size-4 text-muted" />
      </div>
      {selected && !open && <p className="text-sm text-muted">{balanceText(selected.balance)}</p>}
      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-[4.75rem] z-40 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-xl"
        >
          {matches.map((c, i) => (
            <li
              key={c.id}
              id={`${id}-${c.id}`}
              role="option"
              aria-selected={c.id === value}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(c.id)}
              className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 ${i === active ? 'bg-raised' : ''}`}
            >
              <span className="min-w-0 truncate font-semibold">{c.name}</span>
              <span className="num shrink-0 text-sm text-muted" dir="rtl">{balanceText(c.balance)}</span>
            </li>
          ))}
          {!matches.length && <li className="px-3 py-3 text-sm text-muted">مفيش عميل بالاسم ده</li>}
        </ul>
      )}
    </div>
  );
}
