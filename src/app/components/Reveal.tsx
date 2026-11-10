'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMediaQuery } from './useBrowserState';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

// Subtle, one-time fade + translate when a section scrolls into view.
// Intentionally understated (300ms, 16px) — a quiet detail, not a showcase.
export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const visible = inView || reducedMotion;

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    // An element can only ever show 15% of itself when it is at most
    // (viewport / 0.15) tall. Long blocks (e.g. the expanded about sections on
    // a phone, which stack several images) would otherwise never be revealed
    // and stay invisible, so for those any visible pixel is enough.
    const visibleHeight = window.innerHeight - 40;
    const threshold = el.offsetHeight * 0.15 > visibleHeight ? 0 : 0.15;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal--visible' : ''} ${className ?? ''}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
