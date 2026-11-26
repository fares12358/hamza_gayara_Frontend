/**
 * The answers of GET requests, kept in memory so that opening a screen again does not
 * ask the server (and the database) again.
 *
 * Old money figures are dangerous, so:
 * - memory only: never localStorage or the service worker; a page reload starts empty
 * - an answer is used for FRESH_MS at most
 * - after every save, everything is thrown away (invalidate)
 * - failed answers are never kept
 */
export const FRESH_MS = 2 * 60_000;

export interface Snapshot {
  data?: unknown;
  error?: string;
  loading: boolean;
}

interface Entry {
  snapshot: Snapshot;
  load: () => Promise<unknown>;
  loadedAt: number;
  stale: boolean;
  /** The request in progress. An answer is accepted only from this one. */
  request: object | null;
}

const PENDING: Snapshot = { loading: true };

export class DataStore {
  private entries = new Map<string, Entry>();
  private listeners = new Map<string, Set<() => void>>();

  get = (key: string): Snapshot => this.entries.get(key)?.snapshot ?? PENDING;

  subscribe(key: string, listener: () => void) {
    const set = this.listeners.get(key) ?? new Set();
    this.listeners.set(key, set.add(listener));
    return () => {
      set.delete(listener);
      if (!set.size) this.listeners.delete(key);
    };
  }

  /** Called when a screen needs "key". Asks the server only when there is no fresh answer. */
  ensure(key: string, load: () => Promise<unknown>) {
    let entry = this.entries.get(key);
    if (!entry) {
      entry = { snapshot: PENDING, load, loadedAt: 0, stale: true, request: null };
      this.entries.set(key, entry);
    }
    entry.load = load;
    if (entry.request) return; // two parts of the screen share one request

    const { data, error } = entry.snapshot;
    const expired = Date.now() - entry.loadedAt >= FRESH_MS;
    if (!entry.stale && !expired && !error && data !== undefined) return;
    // Expired or failed figures are not shown while loading: they would look current.
    this.fetch(key, entry, expired || error ? undefined : data);
  }

  /** "Try again". Does nothing when a request is already running. */
  reload(key: string) {
    const entry = this.entries.get(key);
    if (entry && !entry.request) this.fetch(key, entry, entry.snapshot.error ? undefined : entry.snapshot.data);
  }

  /** The data changed: forget everything, and load again what is on screen now. */
  invalidate() {
    for (const [key, entry] of this.entries) {
      if (this.listeners.has(key)) this.fetch(key, entry, entry.snapshot.error ? undefined : entry.snapshot.data);
      else this.entries.delete(key);
    }
  }

  /**
   * The data may have changed (a save got no answer). Nothing on screen is reloaded now,
   * because without internet that would replace the form with an error.
   */
  markStale() {
    for (const [key, entry] of this.entries) {
      if (!this.listeners.has(key)) this.entries.delete(key);
      else if (entry.request) this.fetch(key, entry, entry.snapshot.data); // it may have started too early
      else entry.stale = true;
    }
  }

  private fetch(key: string, entry: Entry, shown: unknown) {
    const request = {};
    entry.request = request;
    this.set(key, entry, { data: shown, loading: true });
    // False when a newer request replaced this one, or the entry was thrown away.
    const current = () => entry.request === request && this.entries.get(key) === entry;
    entry.load().then(
      (data) => {
        if (!current()) return;
        entry.request = null;
        entry.stale = false;
        entry.loadedAt = Date.now();
        this.set(key, entry, { data, loading: false });
      },
      (error: Error) => {
        if (!current()) return;
        entry.request = null;
        entry.stale = true;
        this.set(key, entry, { data: entry.snapshot.data, error: error.message, loading: false });
      },
    );
  }

  private set(key: string, entry: Entry, snapshot: Snapshot) {
    entry.snapshot = snapshot;
    this.listeners.get(key)?.forEach((listener) => listener());
  }
}
