import { memo, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { normalizeArabic } from '../../lib/arabic';
import { formatMoney, SETTLED } from '../../lib/money';
import type { CustomerOption } from '../../types';
import { Icon } from '../layout/Icon';
import { control, controlBorder, FieldShell } from './fieldStyles';
import { Listbox, optionId } from './Listbox';

const balanceText = (b: number) =>
  Math.abs(b) < SETTLED ? 'خالص' : `${b > 0 ? 'عليه' : 'له'} ${formatMoney(Math.abs(b))}`;

type PickerCustomer = CustomerOption & { aliases?: string[] };

interface Props {
  /** Keep the same array between renders. */
  customers: PickerCustomer[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
}

/**
 * Search and pick a customer. Money is saved on the chosen customer, so typing
 * clears the choice until a name is picked again from the list.
 */
export const CustomerPicker = memo(function CustomerPicker({ customers, value, onChange, label = 'العميل' }: Props) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  // Sorted and prepared for search once, not on every letter.
  const searchable = useMemo(
    () =>
      [...customers]
        .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
        .map((customer) => ({ customer, names: [customer.name, ...(customer.aliases ?? [])].map(normalizeArabic) })),
    [customers],
  );
  const matches = useMemo(() => {
    const q = normalizeArabic(query);
    return searchable.filter((s) => !q || s.names.some((n) => n.includes(q))).map((s) => s.customer);
  }, [searchable, query]);

  const selected = customers.find((c) => c.id === value);

  function show() {
    setActive(0);
    setOpen(true);
  }
  function pick(customer: PickerCustomer) {
    onChange(customer.id);
    setQuery('');
    setOpen(false);
  }
  function clear() {
    onChange('');
    setQuery('');
    input.current?.focus();
    show();
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) return show();
      setActive(Math.max(0, Math.min(matches.length - 1, active + (event.key === 'ArrowDown' ? 1 : -1))));
    } else if (event.key === 'Enter' && open) {
      event.preventDefault(); // picking a name must not submit the form
      if (matches[active]) pick(matches[active]);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  }

  return (
    <FieldShell id={id} label={label}>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted" />
        <input
          ref={input}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && matches[active] ? optionId(listId, matches[active].id) : undefined}
          aria-describedby={selected && !open ? `${id}-note` : undefined}
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
          className={`${control} ${controlBorder()} ps-10 pe-12 font-semibold`}
        />
        {selected && !open ? (
          <button
            type="button"
            aria-label="مسح اختيار العميل"
            onClick={clear}
            className="absolute inset-y-0 end-0.5 my-auto grid size-11 place-items-center rounded-lg text-muted hover:text-ink"
          >
            <Icon name="close" className="size-4" />
          </button>
        ) : (
          <Icon name="down" className={`pointer-events-none absolute inset-y-0 end-4 my-auto size-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
        {open && (
          <Listbox
            id={listId}
            label={label}
            items={matches}
            keyOf={(c) => c.id}
            selectedKey={value}
            active={active}
            onActive={setActive}
            onPick={pick}
            empty="مفيش عميل بالاسم ده"
          >
            {(c) => (
              <>
                <span className="min-w-0 truncate font-semibold">{c.name}</span>
                <span className="num shrink-0 text-sm font-normal text-muted" dir="rtl">{balanceText(c.balance)}</span>
              </>
            )}
          </Listbox>
        )}
      </div>
      {selected && !open && (
        <p id={`${id}-note`} className="text-sm text-muted">{balanceText(selected.balance)}</p>
      )}
    </FieldShell>
  );
});
