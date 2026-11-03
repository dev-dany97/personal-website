'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { prefersReducedMotion, type SceneRef } from './scene';

const MODES = [
  { id: 'coolant', name: 'Coolant', h1: 186, h2: 262 },
  { id: 'neon', name: 'Neon', h1: 300, h2: 222 },
  { id: 'radiant', name: 'Radiant', h1: 354, h2: 28 },
  { id: 'spectrum', name: 'Spectrum', h1: 0, h2: 120, cycle: true }
] as const;
type Mode = (typeof MODES)[number];

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const STORAGE_KEY = 'gaming-rgb-mode';

const TEXT = {
  de: { title: 'RGB-Beleuchtung', open: 'RGB-Beleuchtung einstellen', oc: 'Overclock-Modus', hint: 'Wird in deinem Browser gespeichert.', toast: 'Overclock aktiv · +15 % Takt' },
  en: { title: 'RGB lighting', open: 'Change the RGB lighting', oc: 'Overclock mode', hint: 'Saved in your browser.', toast: 'Overclock on · +15 % clock' }
};

interface Props {
  host: RefObject<HTMLDivElement | null>;
  sceneRef: SceneRef;
  lang: 'de' | 'en';
  overclock: boolean;
  setOverclock: (on: boolean) => void;
}

function savedMode(): Mode {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return MODES.find((m) => m.id === id) ?? MODES[0];
  } catch {
    return MODES[0];
  }
}

// Floating RGB switch like a lighting controller on a PC. Sets the
// hues as CSS variables on the page wrapper; "Spectrum" cycles
// through them. The Konami code turns on Spectrum plus overclock.
// Only rendered in the browser (the page loads its data on the client),
// so the initial value may come straight from localStorage.
export function RgbController({ host, sceneRef, lang, overclock, setOverclock }: Props) {
  const t = TEXT[lang];
  const [mode, setMode] = useState<Mode>(savedMode);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fabRef = useRef<HTMLDivElement>(null);

  const toggleOverclock = (on: boolean) => {
    setOverclock(on);
    if (on) setToast(t.toast);
  };

  // Apply the colour; Spectrum cycles through the hue
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, mode.id); } catch { /* privater Modus */ }
    const apply = (h1: number, h2: number) => {
      sceneRef.current.h1 = h1; sceneRef.current.h2 = h2;
      host.current?.style.setProperty('--h1', String(h1));
      host.current?.style.setProperty('--h2', String(h2));
    };
    if (!('cycle' in mode)) { apply(mode.h1, mode.h2); return; }
    if (prefersReducedMotion()) { apply(200, 320); return; }
    let raf = 0, h = sceneRef.current.h1;
    const step = () => {
      h = (h + (sceneRef.current.overclock ? 1.6 : 0.45)) % 360;
      apply(h, (h + 120) % 360);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mode, host, sceneRef]);

  // Konami-Code
  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === KONAMI[pos] ? pos + 1 : k === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) { pos = 0; setMode(MODES[3]); setOverclock(true); setToast(t.toast); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOverclock, t.toast]);

  // Panel closes on an outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!fabRef.current?.contains(e.target as Node)) setOpen(false); };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onEsc); };
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  return (
    <>
      <div className="gx-rgb-fab" ref={fabRef}>
        <div className="gx-rgb-panel gx-hud" id="gx-rgb-panel" hidden={!open}>
          <h4>{t.title}</h4>
          <div className="gx-modes">
            {MODES.map((m) => (
              <button key={m.id} type="button" aria-pressed={mode.id === m.id} onClick={() => setMode(m)}>
                <span
                  className="gx-sw"
                  style={{
                    background: 'cycle' in m
                      ? 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)'
                      : `linear-gradient(135deg, hsl(${m.h1} 100% 58%), hsl(${m.h2} 100% 66%))`
                  }}
                />
                {m.name}
              </button>
            ))}
          </div>
          <div className="gx-oc">
            <span>{t.oc}</span>
            <button className="gx-switch" type="button" role="switch" aria-checked={overclock} aria-label={t.oc} onClick={() => toggleOverclock(!overclock)} />
          </div>
          <p className="gx-hint">{t.hint}</p>
        </div>
        <button className="gx-rgb-toggle" type="button" aria-expanded={open} aria-controls="gx-rgb-panel" aria-label={t.open} onClick={() => setOpen((o) => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
          </svg>
        </button>
      </div>
      <div className={`gx-toast${toast ? ' gx-show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
