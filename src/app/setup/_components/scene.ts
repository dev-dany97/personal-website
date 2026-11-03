import type { MutableRefObject } from 'react';

// Shared "lighting" state that canvas animations read every frame.
// Deliberately a ref instead of state so colour changes don't trigger
// re-renders.
export interface SceneState {
  h1: number;
  h2: number;
  overclock: boolean;
}

export type SceneRef = MutableRefObject<SceneState>;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
