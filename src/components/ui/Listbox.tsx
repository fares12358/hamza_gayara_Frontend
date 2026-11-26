import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../layout/Icon';

const MAX_HEIGHT = 288;

interface Props<T> {
  id: string;
  label: string;
  items: T[];
  keyOf: (item: T) => string;
  selectedKey: string;
  active: number;
  onActive: (index: number) => void;
  onPick: (item: T) => void;
  children: (item: T) => ReactNode;
  empty?: string;
}

export const optionId = (listId: string, key: string) => `${listId}-${key}`;

/**
 * The popup list of Select and CustomerPicker. Put it inside a "relative" box around the control.
 * The control keeps the focus and handles the keyboard.
 * Opens upwards when there is more room above.
 */
export function Listbox<T>({ id, label, items, keyOf, selectedKey, active, onActive, onPick, children, empty }: Props<T>) {
  const list = useRef<HTMLUListElement>(null);
  const [place, setPlace] = useState({ up: false, height: MAX_HEIGHT });

  useLayoutEffect(() => {
    const anchor = list.current?.parentElement?.getBoundingClientRect();
    if (!anchor) return;
    const screen = window.visualViewport?.height ?? window.innerHeight; // smaller with the phone keyboard open
    const bottomBar = window.innerWidth < 1024 ? 80 : 12;
    const below = screen - anchor.bottom - bottomBar;
    const above = anchor.top - 72;
    const up = below < MAX_HEIGHT && above > below;
    setPlace({ up, height: Math.max(140, Math.min(MAX_HEIGHT, up ? above : below)) });
  }, []);

  // Scrolls only the list, never the page.
  useLayoutEffect(() => {
    const box = list.current;
    const row = box?.children[active] as HTMLElement | undefined;
    if (!box || !row) return;
    if (row.offsetTop < box.scrollTop) box.scrollTop = row.offsetTop;
    else if (row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = row.offsetTop + row.offsetHeight - box.clientHeight;
    }
  }, [active, place.height, items.length]);

  return (
    <motion.ul
      ref={list}
      id={id}
      role="listbox"
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
      style={{ maxHeight: place.height }}
      // The control must not lose focus while a name or the scrollbar is pressed.
      onMouseDown={(e) => e.preventDefault()}
      className={`absolute start-0 z-40 w-full min-w-max max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface p-1 shadow-xl ${place.up ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`}
    >
      {items.map((item, i) => {
        const key = keyOf(item);
        const selected = key === selectedKey;
        return (
          <li
            key={key}
            id={optionId(id, key)}
            role="option"
            aria-selected={selected}
            onMouseMove={() => i !== active && onActive(i)}
            onClick={() => onPick(item)}
            className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 ${i === active ? 'bg-raised' : ''} ${selected ? 'font-bold' : ''}`}
          >
            <span className="flex min-w-0 flex-1 items-center justify-between gap-3">{children(item)}</span>
            <Icon name="check" className={`size-4 ${selected ? 'text-accent' : 'invisible'}`} />
          </li>
        );
      })}
      {!items.length && (
        <li role="presentation" className="px-3 py-3 text-sm text-muted">
          {empty}
        </li>
      )}
    </motion.ul>
  );
}
