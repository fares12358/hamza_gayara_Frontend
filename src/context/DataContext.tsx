import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DATA_CHANGED_EVENT, type DataChange } from '../api/client';
import { DataStore } from '../lib/dataStore';

/**
 * The context holds the store itself, which never changes, so the context causes no re-renders.
 * Each screen subscribes only to the data it shows (see useApi).
 */
const DataContext = createContext<DataStore | null>(null);

export function useDataStore() {
  const store = useContext(DataContext);
  if (!store) throw new Error('useDataStore must be inside DataProvider');
  return store;
}

/** Mounted per logged in user: logout or another user starts with nothing. */
export function DataProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new DataStore());

  useEffect(() => {
    const onChange = (event: Event) => {
      if ((event as CustomEvent<DataChange>).detail === 'saved') store.invalidate();
      else store.markStale();
    };
    window.addEventListener(DATA_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, onChange);
  }, [store]);

  return <DataContext.Provider value={store}>{children}</DataContext.Provider>;
}
