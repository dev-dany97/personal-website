'use client';

import { useSyncExternalStore } from 'react';

// Browser-Zustand (Media Queries, localStorage) ohne setState im Effekt.
// Auf dem Server und beim Hydrieren gilt der Server-Wert, danach liest React
// den echten Wert und rendert bei Änderungen neu.

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
// Steht für "localStorage nicht verfügbar", etwa im privaten Modus.
export const STORAGE_UNAVAILABLE = '\u0000unavailable';

function subscribeStorage(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(LOCAL_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(LOCAL_EVENT, onChange);
  };
}

// Liefert den gespeicherten Wert, null wenn nichts gespeichert ist, und
// undefined auf dem Server und beim Hydrieren.
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
