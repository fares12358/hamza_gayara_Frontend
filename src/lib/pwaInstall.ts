/**
 * "Install the app". The browser may offer installation before React has started,
 * so this file listens as soon as it is imported (first in main.tsx).
 */
import { useSyncExternalStore } from 'react';

/** Chrome, Edge and Android. Not in the TypeScript DOM types. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallMode =
  /** the browser can show its install window */
  | 'prompt'
  /** iPhone and iPad: the user installs from the Share menu */
  | 'ios'
  /** already installed, or this browser cannot install */
  | 'none';

const SNOOZE_KEY = 'gayara-install-later';
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

const standalone = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

// iPadOS reports itself as a Mac with a touch screen.
const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1);

function readSnooze() {
  try {
    return Date.now() - Number(localStorage.getItem(SNOOZE_KEY) ?? 0) < SNOOZE_MS;
  } catch {
    return false;
  }
}

let deferred: InstallPromptEvent | null = null;
let installed = false;
let snoozed = readSnooze();
const listeners = new Set<() => void>();
const changed = () => listeners.forEach((l) => l());

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault(); // we show our own card instead of the browser's bar
  deferred = event as InstallPromptEvent;
  changed();
});
window.addEventListener('appinstalled', () => {
  installed = true;
  deferred = null;
  changed();
});

function mode(): InstallMode {
  if (installed || standalone()) return 'none';
  if (deferred) return 'prompt';
  return isIos() ? 'ios' : 'none';
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useInstall() {
  const current = useSyncExternalStore(subscribe, mode);
  const later = useSyncExternalStore(subscribe, () => snoozed);

  return {
    mode: current,
    /** The user pressed "later" in the last 14 days. */
    snoozed: later,
    async install() {
      if (!deferred) return false;
      const event = deferred;
      await event.prompt();
      const { outcome } = await event.userChoice;
      deferred = null; // the browser allows each offer to be used once
      if (outcome === 'dismissed') snooze();
      changed();
      return outcome === 'accepted';
    },
    snooze,
  };
}

function snooze() {
  snoozed = true;
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now()));
  } catch {
    /* storage blocked: hidden for this visit */
  }
  changed();
}
