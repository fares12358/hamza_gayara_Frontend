/**
 * Saves whose result is unknown (network or server failure). If the same data is
 * sent again, even after leaving the screen or closing the app, it reuses the
 * requestId, so the server cannot save it twice. Only a fingerprint is stored,
 * never names or amounts.
 */
const KEY = 'gayara-pending-saves';
const KEEP_MS = 24 * 60 * 60 * 1000;

type Pending = Record<string, { id: string; at: number }>;

function read(): Pending {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Pending;
    return Object.fromEntries(Object.entries(all).filter(([, v]) => Date.now() - v.at < KEEP_MS));
  } catch {
    return {};
  }
}

function write(pending: Pending) {
  try {
    localStorage.setItem(KEY, JSON.stringify(pending));
  } catch {
    /* storage blocked: protection lasts while the screen is open */
  }
}

/** FNV-1a with two seeds: a short fingerprint of the form data. */
export function fingerprint(data: unknown): string {
  const text = JSON.stringify(data);
  return [0x811c9dc5, 0x01000193]
    .map((seed) => {
      let hash = seed;
      for (let i = 0; i < text.length; i += 1) hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193);
      return (hash >>> 0).toString(16);
    })
    .join('') + `-${text.length}`;
}

export const pendingId = (print: string) => read()[print]?.id;

export function rememberPending(print: string, id: string) {
  write({ ...read(), [print]: { id, at: Date.now() } });
}

export function forgetPending(id: string) {
  write(Object.fromEntries(Object.entries(read()).filter(([, v]) => v.id !== id)));
}
