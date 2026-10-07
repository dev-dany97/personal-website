'use client';

import { useEffect, useRef } from 'react';
import { useCanvasAnimation } from './useCanvasAnimation';

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Place {
  lat: number;
  lon: number;
}

const HOME: Place = { lat: 49.0, lon: 12.1 };

const COUNTRY_COORDS: Record<string, Place> = {
  IT: { lat: 41.9, lon: 12.5 },
  AE: { lat: 25.2, lon: 55.3 },
  TH: { lat: 13.75, lon: 100.5 },
  FR: { lat: 48.85, lon: 2.35 },
  ES: { lat: 28.3, lon: -16.5 },
  HR: { lat: 44.1, lon: 15.2 },
  AU: { lat: -25.3, lon: 133.8 }
};

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

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const TRANSITION_DURATION = 1.3;

export function DestinationMiniGlobe({ countryCode }: { countryCode: string }) {
  const stateRef = useRef({
    active: countryCode,
    prev: countryCode,
    transitionStart: null as number | null
  });

  useEffect(() => {
    if (stateRef.current.active === countryCode) return;
    stateRef.current.prev = stateRef.current.active;
    stateRef.current.active = countryCode;
    stateRef.current.transitionStart = null;
  }, [countryCode]);

  const canvasRef = useCanvasAnimation((ctx, width, height, t) => {
    if (width === 0 || height === 0) return;
    ctx.clearRect(0, 0, width, height);

    const st = stateRef.current;
    if (st.transitionStart === null) st.transitionStart = t;

    const elapsed = t - st.transitionStart;
    const progress = Math.min(1, elapsed / TRANSITION_DURATION);
    const eased = easeInOutCubic(progress);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.42;
    const rotation = t * 0.1;
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);

    const project = (v: Vec3) => {
      const r = rotateY(v, cosR, sinR);
      return { sx: cx + r.x * radius, sy: cy - r.y * radius, z: r.z };
    };

    // faint lat/lon grid
    for (let i = 0; i <= 24; i++) {
      const lon = (i / 24) * 360 - 180;
      const p = project(toVector3(0, lon));
      if (p.z <= 0.02) continue;
      ctx.fillStyle = `rgba(79, 185, 173, ${0.06 + p.z * 0.08})`;
      ctx.fillRect(p.sx - 0.5, p.sy - 0.5, 1, 1);
    }
    for (const lat of [-45, 0, 45]) {
      for (let i = 0; i <= 36; i++) {
        const lon = (i / 36) * 360 - 180;
        const p = project(toVector3(lat, lon));
        if (p.z <= 0.02) continue;
        ctx.fillStyle = `rgba(79, 185, 173, ${0.05 + p.z * 0.07})`;
        ctx.fillRect(p.sx - 0.5, p.sy - 0.5, 1, 1);
      }
    }

    // outer rim
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(79, 185, 173, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const activePlace = COUNTRY_COORDS[st.active] ?? HOME;
    const activeVec = toVector3(activePlace.lat, activePlace.lon);
    const homeVec = toVector3(HOME.lat, HOME.lon);

    const drawMarker = (vec: Vec3, isHome: boolean, isActive: boolean) => {
      const p = project(vec);
      if (p.z <= -0.1) return;
      const visibility = Math.max(0, Math.min(1, (p.z + 0.1) / 0.4));
      const pulse = isActive ? 1 + Math.sin(t * 2.6) * 0.3 : 1;
      const baseR = isHome ? 2.6 : isActive ? 3.4 : 2;

      if (isActive) {
        const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, baseR * 4 * pulse);
        glow.addColorStop(0, `rgba(127, 231, 214, ${0.5 * visibility})`);
        glow.addColorStop(1, 'rgba(127, 231, 214, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, baseR * 4 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isHome
        ? `rgba(255, 255, 255, ${0.8 * visibility})`
        : `rgba(127, 231, 214, ${(isActive ? 0.95 : 0.35) * visibility})`;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, baseR * pulse, 0, Math.PI * 2);
      ctx.fill();
    };

    drawMarker(homeVec, true, false);
    Object.entries(COUNTRY_COORDS).forEach(([code, place]) => {
      if (code === st.active) return;
      drawMarker(toVector3(place.lat, place.lon), false, false);
    });
    drawMarker(activeVec, false, true);

    // dezent flying-plane transition between the previous and the newly active destination
    if (progress < 1 && st.prev !== st.active) {
      const prevPlace = COUNTRY_COORDS[st.prev] ?? HOME;
      const prevVec = toVector3(prevPlace.lat, prevPlace.lon);
      const planeVec = slerp(prevVec, activeVec, eased);
      const planeAheadVec = slerp(prevVec, activeVec, Math.min(1, eased + 0.02));
      const p = project(planeVec);
      const ahead = project(planeAheadVec);

      if (p.z > -0.05) {
        const fade = Math.sin(Math.PI * progress);
        const angle = Math.atan2(ahead.sy - p.sy, ahead.sx - p.sx);

        ctx.save();
        ctx.translate(p.sx, p.sy);
        ctx.rotate(angle);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * fade})`;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(-4, 3);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-4, -3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  });

  return <canvas ref={canvasRef} className="destination-mini-globe-canvas" aria-hidden="true" />;
}
