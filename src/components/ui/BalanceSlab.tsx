import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Money } from './Money';

export interface SlabStat {
  label: string;
  value: ReactNode;
}

/** The key figure of a screen. The only gradient surface on a page. */
export function BalanceSlab({ label, amount, hint, stats = [], className = '' }: {
  label: string;
  amount: number;
  hint?: ReactNode;
  stats?: SlabStat[];
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`slab flex flex-col justify-between gap-5 rounded-3xl p-5 sm:p-7 ${className}`}
    >
      <div>
        <p className="text-sm opacity-75">{label}</p>
        <p className="mt-1 font-display text-4xl leading-tight font-bold sm:text-5xl">
          <Money value={amount} currency />
        </p>
        {hint && <p className="mt-2 text-sm opacity-80">{hint}</p>}
      </div>
      {stats.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-on-slab/15 pt-4 sm:flex sm:flex-wrap sm:gap-x-10">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-xs opacity-70">{s.label}</dt>
              <dd className="mt-0.5 font-display text-xl font-semibold">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </motion.section>
  );
}
