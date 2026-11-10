'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, type SceneRef } from './scene';

// Simulierte Messwerte für Hero und Loop-Monitor. Sie sind auf der Seite
// als Demo-Werte gekennzeichnet. Mit Overclock steigen sie sichtbar an.
export interface Telemetry {
  cpu: number; gpu: number; flow: number; water: number; pump: number; history: number[];
}

const BASE = { cpu: 54, gpu: 58, flow: 142, water: 32.4, pump: 3240 };
// Maximaler Anstieg bei voll aufgeheiztem Overclock
const OC = { cpu: 24, gpu: 20, flow: 34, water: 3.4, pump: 950 };
// Overclock heizt über etwa 45 Sekunden langsam auf und kühlt danach etwa
// doppelt so schnell wieder ab.
const HEAT_UP = 1 / 45, COOL_DOWN = 2 / 45;

// Wert gleitet weich zum Ziel und rauscht dabei leicht.
const drift = (v: number, target: number, noise: number) =>
  v + (target - v) * 0.18 + (Math.random() - 0.5) * noise;

export function useTelemetry(scene: SceneRef): Telemetry {
  const [t, setT] = useState<Telemetry>({ ...BASE, history: Array(60).fill(BASE.water) });

  useEffect(() => {
    const tick = prefersReducedMotion() ? 4 : 1.2;
    let heat = 0;
    const id = window.setInterval(() => {
      heat = scene.current.overclock ? Math.min(1, heat + HEAT_UP * tick) : Math.max(0, heat - COOL_DOWN * tick);
      // leicht beschleunigter Anstieg, damit es am Anfang ruhig beginnt
      const k = heat * heat * (3 - 2 * heat);
      setT((p) => {
        const water = Math.min(35.9, drift(p.water, BASE.water + OC.water * k, 0.25));
        return {
          cpu: drift(p.cpu, BASE.cpu + OC.cpu * k, 2.4),
          gpu: drift(p.gpu, BASE.gpu + OC.gpu * k, 2),
          flow: drift(p.flow, BASE.flow + OC.flow * k, 2),
          water,
          pump: drift(p.pump, BASE.pump + OC.pump * k, 50),
          history: [...p.history.slice(1), water]
        };
      });
    }, (prefersReducedMotion() ? 4000 : 1200));
    return () => window.clearInterval(id);
  }, [scene]);

  return t;
}

export const formatNumber = (n: number, lang: 'de' | 'en', digits = 0) =>
  n.toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });

// Verlaufskurve der Wassertemperatur (30 bis 36 °C)
export function Sparkline({ values, scene }: { values: number[]; scene: SceneRef }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const w = cv.clientWidth, h = cv.clientHeight, r = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = w * r; cv.height = h * r; ctx.setTransform(r, 0, 0, r, 0, 0);
    const lo = 30, hi = 36, hue = scene.current.h1;
    const color = `hsl(${hue} 100% 58%)`;
    const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - ((v - lo) / (hi - lo)) * (h - 4) - 2]);
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, `hsl(${hue} 100% 58% / .35)`); g.addColorStop(1, 'transparent');
    const path = () => pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.beginPath(); path(); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); path(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    const [ex, ey] = pts[pts.length - 1];
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(ex - 2, ey, 3, 0, 6.28); ctx.fill();
  }, [values, scene]);

  return <canvas ref={ref} className="gx-spark" aria-hidden="true" />;
}
