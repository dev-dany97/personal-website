'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, type SceneRef } from './scene';

// Simulated readings for the hero and loop monitor. They are
// als Demo-Werte gekennzeichnet. Mit Overclock steigen sie sichtbar an.
export interface Telemetry {
  cpu: number; gpu: number; flow: number; water: number; pump: number; history: number[];
}

const BASE = { cpu: 54, gpu: 58, flow: 142, water: 32.4, pump: 3240 };
const walk = (v: number, base: number, spread: number, step: number) =>
  Math.max(base - spread, Math.min(base + spread, v + (Math.random() - 0.5) * step));

export function useTelemetry(scene: SceneRef): Telemetry {
  const [t, setT] = useState<Telemetry>({ ...BASE, history: Array(60).fill(BASE.water) });

  useEffect(() => {
    const id = window.setInterval(() => {
      const oc = scene.current.overclock ? 1 : 0;
      setT((p) => {
        const water = walk(p.water, BASE.water + oc * 2.2, 1.2, 0.3);
        return {
          cpu: walk(p.cpu, BASE.cpu + oc * 14, 6, 2.2),
          gpu: walk(p.gpu, BASE.gpu + oc * 10, 6, 2),
          flow: walk(p.flow, BASE.flow + oc * 18, 4, 1.6),
          water,
          pump: walk(p.pump, BASE.pump + oc * 600, 80, 40),
          history: [...p.history.slice(1), water]
        };
      });
    }, prefersReducedMotion() ? 4000 : 1200);
    return () => window.clearInterval(id);
  }, [scene]);

  return t;
}

export const formatNumber = (n: number, lang: 'de' | 'en', digits = 0) =>
  n.toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });

// Water temperature curve (30 to 36 °C)
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
