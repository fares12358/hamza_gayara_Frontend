import { memo, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { normalizeArabic } from '../../lib/arabic';
import { Icon } from '../layout/Icon';
import { control, controlBorder, FieldShell } from './fieldStyles';
import { Listbox, optionId } from './Listbox';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  label: string;
  hideLabel?: boolean;
  value: string;
  /** Keep the same array between renders (a constant or useMemo). */
  options: SelectOption[];
  onValue: (value: string) => void;
  className?: string;
  buttonClassName?: string;
}

/**
 * Drop-down menu. Keyboard: arrows, Home, End, Enter, Escape, or type the first letters.
 * Only Enter, Space or a click changes the value: leaving the box never does.
 */
export const Select = memo(function Select({ label, hideLabel, value, options, onValue, className, buttonClassName = '' }: Props) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const button = useRef<HTMLButtonElement>(null);
  const typed = useRef({ text: '', timer: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const shown = options[selectedIndex]?.label ?? value;

  useEffect(() => () => window.clearTimeout(typed.current.timer), []);

  // Safari does not focus a clicked button, so "blur" alone cannot close the list.
  useEffect(() => {
    if (!open) return;
    const onOutside = (event: PointerEvent) => {
      if (!button.current?.parentElement?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onOutside);
    return () => document.removeEventListener('pointerdown', onOutside);
  }, [open]);

  function show(index = selectedIndex) {
    if (!options.length) return;
    setActive(Math.max(0, index));
    setOpen(true);
  }
  function pick(option: SelectOption) {
    setOpen(false);
    if (option.value !== value) onValue(option.value);
  }
  function search(letter: string) {
    window.clearTimeout(typed.current.timer);
    typed.current.text += letter;
    typed.current.timer = window.setTimeout(() => (typed.current.text = ''), 700);
    const query = normalizeArabic(typed.current.text);
    const found = options.findIndex((o) => normalizeArabic(o.label).startsWith(query));
    if (found < 0) return;
    if (open) setActive(found);
    else show(found);
  }

  function onKeyDown(event: KeyboardEvent) {
    const { key } = event;
    const last = options.length - 1;
    const next = ({ ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: last } as Record<string, number>)[key];
    if (next !== undefined) {
      event.preventDefault();
      if (!open) return show();
      setActive(Math.max(0, Math.min(last, next)));
    } else if (key === 'Enter' || (key === ' ' && !typed.current.text)) {
      event.preventDefault();
      if (!open) show();
      else if (options[active]) pick(options[active]);
    } else if (key === 'Escape' && open) {
      event.preventDefault(); // closes the list, not the dialog around it
      event.stopPropagation();
      setOpen(false);
    } else if (key === 'Tab') {
      setOpen(false);
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      search(key);
    }
  }

  return (
    <FieldShell id={id} labelId={`${id}-label`} label={label} hideLabel={hideLabel} className={className}>
      <div className="relative">
        <button
          ref={button}
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={open && options[active] ? optionId(listId, options[active].value) : undefined}
          disabled={!options.length}
          onClick={(e) => {
            e.currentTarget.focus();
            if (open) setOpen(false);
            else show();
          }}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className={`${control} ${controlBorder()} flex items-center justify-between gap-2 text-start font-semibold disabled:opacity-60 ${buttonClassName}`}
        >
          <span className="min-w-0 truncate">{shown}</span>
          <Icon name="down" className={`size-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <Listbox
            id={listId}
            label={label}
            items={options}
            keyOf={(o) => o.value}
            selectedKey={value}
            active={active}
            onActive={setActive}
            onPick={pick}
          >
            {(o) => <span>{o.label}</span>}
          </Listbox>
        )}
      </div>
    </FieldShell>
  );
});
