'use client';

import { useEffect, useRef } from 'react';
import { useCanvasAnimation } from './useCanvasAnimation';

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Place {
  name: string;
  lat: number;
  lon: number;
}

// Home base + visited destinations (approximate coordinates)
const HOME: Place = { name: 'Regensburg', lat: 49.0, lon: 12.1 };
const DESTINATIONS: Place[] = [
  { name: 'Italy', lat: 41.9, lon: 12.5 },
  { name: 'Dubai', lat: 25.2, lon: 55.3 },
  { name: 'Australia', lat: -25.3, lon: 133.8 },
  { name: 'Bangkok', lat: 13.75, lon: 100.5 },
  { name: 'Paris', lat: 48.85, lon: 2.35 },
  { name: 'Canary Islands', lat: 28.3, lon: -16.5 },
  { name: 'Croatia', lat: 44.1, lon: 15.2 }
];

function toVector3(lat: number, lon: number): Vec3 {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  return {
    x: Math.cos(latRad) * Math.sin(lonRad),
    y: Math.sin(latRad),
    z: Math.cos(latRad) * Math.cos(lonRad)
  };
}

function rotateY(v: Vec3, cos: number, sin: number): Vec3 {
  return {
    x: v.x * cos + v.z * sin,
    y: v.y,
    z: -v.x * sin + v.z * cos
  };
}

function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const sinOmega = Math.sin(omega);
  const wa = Math.sin((1 - t) * omega) / sinOmega;
  const wb = Math.sin(t * omega) / sinOmega;
  return {
    x: a.x * wa + b.x * wb,
    y: a.y * wa + b.y * wb,
    z: a.z * wa + b.z * wb
  };
}

const homeVec = toVector3(HOME.lat, HOME.lon);
const destVecs = DESTINATIONS.map((d) => ({ ...d, vec: toVector3(d.lat, d.lon) }));

const LAT_STEPS = [-60, -30, 0, 30, 60];
const LON_STEPS = Array.from({ length: 12 }, (_, i) => i * 30);

export function GlobeBackground() {
  // Pre-projected (lat/lon -> unit sphere) country border rings, loaded once from
  // a simplified Natural Earth (110m, public domain) dataset.
  const borderRingsRef = useRef<Vec3[][] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/data/world-borders.json')
      .then((res) => res.json())
      .then((flatRings: number[][]) => {
        if (cancelled) return;
        borderRingsRef.current = flatRings.map((flat) => {
          const ring: Vec3[] = [];
          for (let i = 0; i < flat.length; i += 2) {
            ring.push(toVector3(flat[i + 1], flat[i]));
          }
          return ring;
        });
      })
      .catch(() => {
        // decorative background — fail silently, grid + markers still render
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const canvasRef = useCanvasAnimation((ctx, width, height, t) => {
    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    const cx = width * 0.8;
    const cy = height * 0.5;
    const radius = Math.min(width * 0.24, height * 0.44, 230);
    const rotation = t * 0.15;
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);

    const project = (v: Vec3) => {
      const r = rotateY(v, cosR, sinR);
      return { sx: cx + r.x * radius, sy: cy - r.y * radius, z: r.z };
    };

    // faint full-sphere lat/lon grid for context
    for (const lat of LAT_STEPS) {
      for (let i = 0; i <= 48; i++) {
        const lon = (i / 48) * 360 - 180;
        const p = project(toVector3(lat, lon));
        if (p.z <= 0.02) continue;
        const alpha = 0.05 + p.z * 0.1;
        ctx.fillStyle = `rgba(79, 185, 173, ${alpha})`;
        ctx.fillRect(p.sx - 0.5, p.sy - 0.5, 1, 1);
      }
    }
    for (const lon of LON_STEPS) {
      for (let i = 0; i <= 32; i++) {
        const lat = (i / 32) * 180 - 90;
        const p = project(toVector3(lat, lon));
        if (p.z <= 0.02) continue;
        const alpha = 0.05 + p.z * 0.1;
        ctx.fillStyle = `rgba(79, 185, 173, ${alpha})`;
        ctx.fillRect(p.sx - 0.5, p.sy - 0.5, 1, 1);
      }
    }

    // real country / coastline borders
    const rings = borderRingsRef.current;
    if (rings) {
      ctx.lineWidth = 1;
      ctx.lineJoin = 'round';
      for (const ring of rings) {
        ctx.beginPath();
        let started = false;
        let minAlpha = 0;
        for (const v of ring) {
          const r = rotateY(v, cosR, sinR);
          if (r.z <= 0.03) {
            started = false;
            continue;
          }
          const sx = cx + r.x * radius;
          const sy = cy - r.y * radius;
          if (!started) {
            ctx.moveTo(sx, sy);
            started = true;
          } else {
            ctx.lineTo(sx, sy);
          }
          if (r.z > minAlpha) minAlpha = r.z;
        }
        ctx.strokeStyle = `rgba(148, 226, 213, ${0.22 + minAlpha * 0.4})`;
        ctx.stroke();
      }
    }

    // outer rim
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(79, 185, 173, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // flight arcs from home to each destination
    destVecs.forEach((d) => {
      const steps = 60;
      for (let i = 0; i < steps; i++) {
        const p = project(slerp(homeVec, d.vec, i / steps));
        if (p.z <= 0) continue;
        const pulse = (Math.sin(t * 1.4 - i * 0.25) + 1) / 2;
        ctx.fillStyle = `rgba(127, 231, 214, ${0.25 + pulse * 0.45 * p.z})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // markers
    const drawMarker = (place: Place, vec: Vec3, isHome: boolean) => {
      const p = project(vec);
      if (p.z <= -0.1) return;
      const visibility = Math.max(0, Math.min(1, (p.z + 0.1) / 0.4));
      const pulse = 1 + Math.sin(t * 2.4 + place.lat) * 0.25;
      const baseR = isHome ? 4 : 3.2;

      const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, baseR * 4 * pulse);
      glow.addColorStop(0, `rgba(79, 185, 173, ${0.55 * visibility})`);
      glow.addColorStop(1, 'rgba(79, 185, 173, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, baseR * 4 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isHome ? `rgba(255, 255, 255, ${0.95 * visibility})` : `rgba(127, 231, 214, ${0.95 * visibility})`;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, baseR * pulse, 0, Math.PI * 2);
      ctx.fill();
    };

    drawMarker(HOME, homeVec, true);
    destVecs.forEach((d) => drawMarker(d, d.vec, false));
  });

  return <canvas ref={canvasRef} className="bg-canvas bg-canvas--globe" aria-hidden="true" />;
}
