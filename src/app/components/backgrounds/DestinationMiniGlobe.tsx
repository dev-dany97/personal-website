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

// shortest-path angle interpolation so the globe never spins the "long way round"
function lerpAngle(a: number, b: number, factor: number) {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * factor;
}

function facingRotation(vec: Vec3) {
  return Math.atan2(-vec.x, vec.z);
}

const TRANSITION_DURATION = 1.6;

export function DestinationMiniGlobe({ countryCode }: { countryCode: string }) {
  const stateRef = useRef({
    active: countryCode,
    prev: countryCode,
    transitionStart: null as number | null,
    rotation: facingRotation(toVector3(COUNTRY_COORDS[countryCode]?.lat ?? 0, COUNTRY_COORDS[countryCode]?.lon ?? 0))
  });
  const borderRingsRef = useRef<Vec3[][] | null>(null);

  useEffect(() => {
    if (stateRef.current.active === countryCode) return;
    stateRef.current.prev = stateRef.current.active;
    stateRef.current.active = countryCode;
    stateRef.current.transitionStart = null;
  }, [countryCode]);

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
        // decorative widget — fail silently, grid + markers still render
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const canvasRef = useCanvasAnimation((ctx, width, height, t) => {
    if (width === 0 || height === 0) return;
    ctx.clearRect(0, 0, width, height);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const lineAlphaMul = isLight ? 1.6 : 1;
    const homeColor = isLight ? '20, 25, 26' : '255, 255, 255';

    const st = stateRef.current;
    if (st.transitionStart === null) st.transitionStart = t;

    const elapsed = t - st.transitionStart;
    const progress = Math.min(1, elapsed / TRANSITION_DURATION);
    const eased = easeInOutCubic(progress);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.42;

    const activeTarget = COUNTRY_COORDS[st.active] ?? HOME;
    const targetRotation = facingRotation(toVector3(activeTarget.lat, activeTarget.lon));
    st.rotation = lerpAngle(st.rotation, targetRotation, 0.035);
    const rotation = st.rotation;
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
      ctx.fillStyle = `rgba(79, 185, 173, ${(0.08 + p.z * 0.1) * lineAlphaMul})`;
      ctx.fillRect(p.sx - 0.5, p.sy - 0.5, 1, 1);
    }
    for (const lat of [-45, 0, 45]) {
      for (let i = 0; i <= 36; i++) {
        const lon = (i / 36) * 360 - 180;
        const p = project(toVector3(lat, lon));
        if (p.z <= 0.02) continue;
        ctx.fillStyle = `rgba(79, 185, 173, ${(0.06 + p.z * 0.08) * lineAlphaMul})`;
        ctx.fillRect(p.sx - 0.5, p.sy - 0.5, 1, 1);
      }
    }

    // real country / coastline borders, like the hero globe but smaller + dezent
    const rings = borderRingsRef.current;
    if (rings) {
      ctx.lineWidth = 0.7;
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
        ctx.strokeStyle = `rgba(148, 226, 213, ${(0.3 + minAlpha * 0.45) * lineAlphaMul})`;
        ctx.stroke();
      }
    }

    // outer rim
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(79, 185, 173, ${0.35 * lineAlphaMul})`;
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
        ? `rgba(${homeColor}, ${0.85 * visibility})`
        : `rgba(127, 231, 214, ${(isActive ? 0.95 : 0.4) * visibility})`;
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
      const fade = Math.sin(Math.PI * progress);

      // short fading trail behind the plane
      for (let i = 1; i <= 4; i++) {
        const trailT = Math.max(0, eased - i * 0.035);
        const trailVec = slerp(prevVec, activeVec, trailT);
        const tp = project(trailVec);
        if (tp.z <= -0.05) continue;
        ctx.fillStyle = `rgba(${homeColor}, ${fade * (0.22 - i * 0.045)})`;
        ctx.beginPath();
        ctx.arc(tp.sx, tp.sy, Math.max(0.4, 1.4 - i * 0.25), 0, Math.PI * 2);
        ctx.fill();
      }

      const planeVec = slerp(prevVec, activeVec, eased);
      const planeAheadVec = slerp(prevVec, activeVec, Math.min(1, eased + 0.02));
      const p = project(planeVec);
      const ahead = project(planeAheadVec);

      if (p.z > -0.05) {
        const angle = Math.atan2(ahead.sy - p.sy, ahead.sx - p.sx);
        const bob = Math.sin(t * 14) * 0.6;

        ctx.save();
        ctx.translate(p.sx, p.sy + bob);
        ctx.rotate(angle);
        ctx.fillStyle = `rgba(${homeColor}, ${0.9 * fade})`;
        ctx.strokeStyle = `rgba(127, 231, 214, ${0.6 * fade})`;
        ctx.lineWidth = 0.6;

        // fuselage
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-5, 2.2);
        ctx.lineTo(-2.5, 0);
        ctx.lineTo(-5, -2.2);
        ctx.closePath();
        ctx.fill();

        // wings (subtle flutter)
        const wingSpan = 4.5 + Math.sin(t * 16) * 0.5;
        ctx.beginPath();
        ctx.moveTo(0.5, 0);
        ctx.lineTo(-1, wingSpan);
        ctx.lineTo(-2, 0.5);
        ctx.lineTo(-2, -0.5);
        ctx.lineTo(-1, -wingSpan);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    }
  });

  return (
    <div className="destination-mini-globe-panel">
      <canvas ref={canvasRef} className="destination-mini-globe-canvas" aria-hidden="true" />
    </div>
  );
}
