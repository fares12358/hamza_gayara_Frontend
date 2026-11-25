import { useCallback, useEffect, useRef, useState } from 'react';

/** Loads data when "key" changes. Late answers of older requests are ignored. */
export function useApi<T>(load: () => Promise<T>, key: string) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true });
  const [version, setVersion] = useState(0);
  const loader = useRef(load);
  loader.current = load;
  const lastKey = useRef(key);

  useEffect(() => {
    let current = true;
    const keyChanged = lastKey.current !== key;
    lastKey.current = key;
    // Never show figures that belong to another customer or month.
    setState((s) => ({ data: keyChanged ? undefined : s.data, loading: true }));
    loader.current().then(
      (data) => current && setState({ data, loading: false }),
      (error: Error) => current && setState({ error: error.message, loading: false }),
    );
    return () => {
      current = false;
    };
  }, [key, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}
