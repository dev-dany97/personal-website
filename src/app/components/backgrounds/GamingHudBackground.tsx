'use client';

import { useCanvasAnimation } from './useCanvasAnimation';

const NEON_RED = '255, 70, 85';
const NEON_CYAN = '61, 245, 214';

function hashRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function drawCornerBracket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = `rgba(${color}, ${alpha})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.stroke();
  ctx.restore();
}

export function GamingHudBackground() {
  const canvasRef = useCanvasAnimation((ctx, width, height, t) => {
    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    // --- diagonal scrolling tech grid ---
    const spacing = 44;
    const diag = Math.sqrt(width * width + height * height);
    ctx.save();
    ctx.translate(width * 0.5, height * 0.5);
    ctx.rotate(Math.PI / 4);
    const offset = (t * 16) % spacing;
    ctx.lineWidth = 1;
    for (let x = -diag; x < diag; x += spacing) {
      const lx = x + offset;
      const cyan = Math.floor(x / spacing) % 5 === 0;
      ctx.strokeStyle = cyan ? `rgba(${NEON_CYAN}, 0.07)` : `rgba(255, 255, 255, 0.025)`;
      ctx.beginPath();
      ctx.moveTo(lx, -diag);
      ctx.lineTo(lx, diag);
      ctx.stroke();
    }
    ctx.restore();

    // --- corner brackets (HUD viewfinder style) ---
    const bSize = Math.min(38, width * 0.05);
    const margin = 18;
    drawCornerBracket(ctx, margin, margin, bSize, 0, NEON_CYAN, 0.55);
    drawCornerBracket(ctx, width - margin, margin, bSize, Math.PI / 2, NEON_CYAN, 0.55);
    drawCornerBracket(ctx, width - margin, height - margin, bSize, Math.PI, NEON_RED, 0.55);
    drawCornerBracket(ctx, margin, height - margin, bSize, -Math.PI / 2, NEON_RED, 0.55);

    // --- tactical reticle ---
    const rx = width * 0.83;
    const ry = height * 0.42;
    const r = Math.min(width, height) * 0.16;

    ctx.save();
    ctx.translate(rx, ry);

    // outer ring
    ctx.strokeStyle = `rgba(${NEON_CYAN}, 0.35)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // tick marks
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const long = i % 4 === 0;
      const r1 = r + 3;
      const r2 = r + (long ? 11 : 6);
      ctx.strokeStyle = long ? `rgba(${NEON_RED}, 0.55)` : `rgba(${NEON_CYAN}, 0.3)`;
      ctx.lineWidth = long ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.stroke();
    }

    // rotating radar sweep
    const sweepAngle = t * 1.1;
    const sweepGrad = ctx.createConicGradient
      ? ctx.createConicGradient(sweepAngle, 0, 0)
      : null;
    if (sweepGrad) {
      sweepGrad.addColorStop(0, `rgba(${NEON_CYAN}, 0.28)`);
      sweepGrad.addColorStop(0.12, `rgba(${NEON_CYAN}, 0)`);
      sweepGrad.addColorStop(1, `rgba(${NEON_CYAN}, 0)`);
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // inner crosshair
    ctx.strokeStyle = `rgba(${NEON_CYAN}, 0.4)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.22, 0);
    ctx.lineTo(-r * 0.1, 0);
    ctx.moveTo(r * 0.1, 0);
    ctx.lineTo(r * 0.22, 0);
    ctx.moveTo(0, -r * 0.22);
    ctx.lineTo(0, -r * 0.1);
    ctx.moveTo(0, r * 0.1);
    ctx.lineTo(0, r * 0.22);
    ctx.stroke();

    // pulsing center dot
    const pulse = 1 + Math.sin(t * 3) * 0.35;
    ctx.fillStyle = `rgba(${NEON_RED}, 0.85)`;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // --- occasional glitch bar ---
    const glitchCycle = 2.6;
    const phase = t % glitchCycle;
    if (phase < 0.14) {
      const seedIndex = Math.floor(t / glitchCycle);
      const gy = hashRandom(seedIndex) * height;
      const gh = 4 + hashRandom(seedIndex + 0.5) * 10;
      const shift = 6 + hashRandom(seedIndex + 1.5) * 10;
      const glitchAlpha = 0.22 * (1 - phase / 0.14);

      ctx.fillStyle = `rgba(${NEON_RED}, ${glitchAlpha})`;
      ctx.fillRect(-shift, gy, width, gh);
      ctx.fillStyle = `rgba(${NEON_CYAN}, ${glitchAlpha})`;
      ctx.fillRect(shift, gy, width, gh);
    }

    // --- slow vertical scan line ---
    const scanY = ((t * 46) % (height + 120)) - 60;
    const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
    scanGrad.addColorStop(0, 'rgba(61, 245, 214, 0)');
    scanGrad.addColorStop(0.5, 'rgba(61, 245, 214, 0.06)');
    scanGrad.addColorStop(1, 'rgba(61, 245, 214, 0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 40, width, 80);
  });

  return <canvas ref={canvasRef} className="bg-canvas bg-canvas--hud" aria-hidden="true" />;
}
