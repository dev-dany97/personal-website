'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion, type SceneRef } from './scene';

interface Particle {
  x: number; lane: number; speed: number; amp: number; freq: number; ph: number; len: number; w: number; alt: boolean;
}

// Glowing "coolant streams" behind the hero. Pauses as soon as the hero
// is off screen, and draws a still image with reduced motion.
export function FlowCanvas({ scene }: { scene: SceneRef }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const reduce = prefersReducedMotion();
    let W = 0, H = 0, raf = 0, visible = true;
    let parts: Particle[] = [];

    const spawn = (anywhere: boolean): Particle => ({
      x: anywhere ? Math.random() * W : -40, lane: Math.random(), speed: 0.4 + Math.random() * 1.4,
      amp: 18 + Math.random() * 60, freq: 0.002 + Math.random() * 0.004, ph: Math.random() * 6.28,
      len: 20 + Math.random() * 70, w: Math.random() < 0.15 ? 2 : 1, alt: Math.random() < 0.35
    });
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: Math.round(Math.min(150, (W * H) / 7000)) }, () => spawn(true));
    };
    const yAt = (p: Particle, x: number, t: number) => H * (0.12 + p.lane * 0.8) + Math.sin(x * p.freq + p.ph + t * 0.0006) * p.amp;

    const draw = (t: number) => {
      const { h1, h2, overclock } = scene.current;
      const sp = overclock ? 2.6 : 1;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        if (!reduce) p.x += p.speed * sp;
        if (p.x - p.len > W) Object.assign(p, spawn(false));
        const hue = p.alt ? h2 : h1;
        const g = ctx.createLinearGradient(p.x - p.len, 0, p.x, 0);
        g.addColorStop(0, `hsla(${hue},100%,60%,0)`);
        g.addColorStop(1, `hsla(${hue},100%,65%,.55)`);
        ctx.strokeStyle = g; ctx.lineWidth = p.w; ctx.beginPath();
        for (let x = p.x - p.len; x <= p.x; x += 6) {
          const y = yAt(p, x, t);
          if (x === p.x - p.len) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = `hsla(${hue},100%,75%,.9)`;
        ctx.beginPath(); ctx.arc(p.x, yAt(p, p.x, t), p.w + 0.4, 0, 6.28); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    };
    const loop = (t: number) => {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    let io: IntersectionObserver | undefined;
    if (reduce) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
      io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
      io.observe(cv);
    }
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); io?.disconnect(); };
  }, [scene]);

  return <canvas ref={ref} className="gx-flow" aria-hidden="true" />;
}
