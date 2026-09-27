'use client';

import { useEffect, useRef } from 'react';

type DrawFn = (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => void;

export function useCanvasAnimation(draw: DrawFn) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    const start = performance.now();

    const frame = (now: number) => {
      draw(ctx, width, height, (now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };

    if (prefersReducedMotion) {
      draw(ctx, width, height, 0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return canvasRef;
}
