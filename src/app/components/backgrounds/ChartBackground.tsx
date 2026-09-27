'use client';

import { useRef } from 'react';
import { useCanvasAnimation } from './useCanvasAnimation';

interface Series {
  points: number[];
  color: string;
  lastShift: number;
}

const POINT_COUNT = 48;
const SHIFT_INTERVAL = 550;

function randomWalk(prev: number) {
  const delta = (Math.random() - 0.48) * 0.09;
  let next = prev + delta;
  if (next < 0.12) next = 0.12 + Math.random() * 0.08;
  if (next > 0.88) next = 0.88 - Math.random() * 0.08;
  return next;
}

export function ChartBackground() {
  const seriesRef = useRef<Series[] | null>(null);

  const canvasRef = useCanvasAnimation((ctx, width, height, t) => {
    if (width === 0 || height === 0) return;

    if (!seriesRef.current) {
      seriesRef.current = [
        { points: Array.from({ length: POINT_COUNT }, () => 0.55), color: '79, 185, 173', lastShift: 0 },
        { points: Array.from({ length: POINT_COUNT }, () => 0.4), color: '224, 169, 61', lastShift: 0 }
      ];
      seriesRef.current.forEach((s) => {
        for (let i = 1; i < POINT_COUNT; i++) s.points[i] = randomWalk(s.points[i - 1]);
      });
    }

    const now = t * 1000;
    const series = seriesRef.current;

    ctx.clearRect(0, 0, width, height);

    // faint horizontal grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const spacing = width / (POINT_COUNT - 1);

    series.forEach((s) => {
      if (now - s.lastShift > SHIFT_INTERVAL) {
        s.points.shift();
        s.points.push(randomWalk(s.points[s.points.length - 1]));
        s.lastShift = now;
      }

      const progress = Math.min(1, (now - s.lastShift) / SHIFT_INTERVAL);
      const offsetX = -progress * spacing;

      ctx.beginPath();
      s.points.forEach((val, i) => {
        const x = i * spacing + offsetX;
        const y = height - val * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      const strokeGrad = ctx.createLinearGradient(0, 0, width, 0);
      strokeGrad.addColorStop(0, `rgba(${s.color}, 0.15)`);
      strokeGrad.addColorStop(1, `rgba(${s.color}, 0.75)`);
      ctx.strokeStyle = strokeGrad;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();

      const lastX = (POINT_COUNT - 1) * spacing + offsetX;
      const lastY = height - s.points[s.points.length - 1] * height;
      const pulse = 3 + Math.sin(t * 3) * 1.2;
      const glow = ctx.createRadialGradient(lastX, lastY, 0, lastX, lastY, pulse * 5);
      glow.addColorStop(0, `rgba(${s.color}, 0.55)`);
      glow.addColorStop(1, `rgba(${s.color}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lastX, lastY, pulse * 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${s.color}, 0.9)`;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 2.6, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  return <canvas ref={canvasRef} className="bg-canvas bg-canvas--chart" aria-hidden="true" />;
}
