'use client';

import { useSyncExternalStore } from 'react';

// Browser state (media queries, localStorage) without setState in an effect.
// On the server and during hydration the server value applies, then React reads
// the real value and re-renders on changes.

export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue
  );
}

const LOCAL_EVENT = 'local-storage-change';
// Stands for "localStorage not available", e.g. in private mode.
export const STORAGE_UNAVAILABLE = '\u0000unavailable';

function subscribeStorage(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(LOCAL_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(LOCAL_EVENT, onChange);
  };
}

// Returns the stored value, null if nothing is stored, and
// undefined on the server and during hydration.
export function useLocalStorage(key: string): string | null | undefined {
  return useSyncExternalStore(
    subscribeStorage,
    () => {
      try { return localStorage.getItem(key); } catch { return STORAGE_UNAVAILABLE; }
    },
    () => undefined
  );
}

export function writeLocalStorage(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* privater Modus */ }
  window.dispatchEvent(new Event(LOCAL_EVENT));
}
