import type { MutableRefObject } from 'react';

// Gemeinsamer Zustand der "Beleuchtung", den Canvas-Animationen pro Frame
// lesen. Bewusst ein Ref statt State, damit Farbwechsel keine Re-Renders
// auslösen.
export interface SceneState {
  h1: number;
  h2: number;
  overclock: boolean;
}

export type SceneRef = MutableRefObject<SceneState>;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
