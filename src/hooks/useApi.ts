import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { useDataStore } from '../context/DataContext';

interface Options {
  /** Check again whether the data is still fresh when this changes. */
  refreshOn?: unknown;
  /** Keep the old data on screen while a new key loads. Only for "show more" lists. */
  keepPrevious?: boolean;
}

/**
 * Data from the server, shared and cached by "key" (see lib/dataStore).
 * The key must name the request and every value it uses, e.g. `statement:${id}:${range}`.
 */
export function useApi<T>(load: () => Promise<T>, key: string, { refreshOn, keepPrevious }: Options = {}) {
  const store = useDataStore();
  const loader = useRef(load);
  loader.current = load;

  const subscribe = useCallback((listener: () => void) => store.subscribe(key, listener), [store, key]);
  const snapshot = useSyncExternalStore(subscribe, () => store.get(key));

  useEffect(() => store.ensure(key, loader.current), [store, key, refreshOn]);

  const previous = useRef<T>(undefined);
  const own = snapshot.data as T | undefined;
  if (own !== undefined) previous.current = own;
  // Without keepPrevious, figures of another customer or month are never shown.
  const data = own ?? (keepPrevious && !snapshot.error ? previous.current : undefined);

  const reload = useCallback(() => store.reload(key), [store, key]);
  return { data, error: snapshot.error, loading: snapshot.loading, reload };
}
