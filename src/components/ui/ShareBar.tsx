import { motion } from 'framer-motion';

/**
 * A thin bar: "value" compared with "max". The "late" part of the value is drawn
 * apart (2px gap) in the late color. The figures must also be written as text.
 */
export function ShareBar({ value, max, late = 0 }: { value: number; max: number; late?: number }) {
  const width = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const latePart = value > 0 ? Math.max(0, Math.min(1, late / value)) : 0;
  return (
    <div aria-hidden="true" className="h-2 w-full overflow-hidden rounded-full bg-raised">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex h-full gap-0.5"
      >
        {latePart > 0 && <span className="h-full rounded-e-sm bg-late first:rounded-s-full last:rounded-e-full" style={{ flexGrow: latePart }} />}
        {latePart < 1 && <span className="h-full rounded-e-full bg-accent" style={{ flexGrow: 1 - latePart }} />}
      </motion.div>
    </div>
  );
}
