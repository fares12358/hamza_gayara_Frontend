import { useState } from 'react';

/**
 * Text fields of a form. Each field gets one setter that never changes,
 * so typing in one box does not re-render the other (memo) boxes.
 */
export function useFields<T extends Record<string, string>>(empty: T) {
  const [values, setValues] = useState(empty);
  const [actions] = useState(() => ({
    set: Object.fromEntries(
      Object.keys(empty).map((key) => [key, (value: string) => setValues((v) => ({ ...v, [key]: value }))]),
    ) as Record<keyof T, (value: string) => void>,
    reset: () => setValues(empty),
  }));
  return { values, ...actions };
}
