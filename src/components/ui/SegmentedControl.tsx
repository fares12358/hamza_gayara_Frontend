import { memo, useId } from 'react';
import { motion } from 'framer-motion';

interface Props<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** Choices with a sliding marker. Wraps on small screens so none is hidden. */
function Control<T extends string>({ label, value, options, onChange }: Props<T>) {
  const id = useId();
  return (
    <div role="group" aria-label={label} className="flex max-w-full flex-wrap gap-1 self-start rounded-2xl bg-raised p-1">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o.value)}
            className={`relative min-h-11 grow rounded-xl px-4 text-sm font-semibold ${selected ? 'text-on-accent' : 'text-muted hover:text-ink'}`}
          >
            {selected && (
              <motion.span
                layoutId={id}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                className="absolute inset-0 rounded-xl bg-accent"
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Re-renders only when its value or options change: keep "options" the same array. */
export const SegmentedControl = memo(Control) as typeof Control;
