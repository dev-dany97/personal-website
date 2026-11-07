'use client';

import { useEffect, useRef, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { SiteImage } from '@/app/components/SiteImage';

// Minimum distance in pixels for a horizontal swipe to count as an image change.
const SWIPE_THRESHOLD = 40;

interface ImageLightboxProps {
  images: string[];
  index: number;
  alt: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  labels: { close: string; previous: string; next: string };
}

// Helper for swipe gestures: returns -1 (back), 1 (next) or 0.
export function swipeDirection(startX: number, startY: number, endX: number, endY: number) {
  const dx = endX - startX;
  const dy = endY - startY;
  if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
}

export function useSwipe(onSwipe: (direction: 1 | -1) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e: TouchEvent) => {
      if (!start.current) return;
      const t = e.changedTouches[0];
      const dir = swipeDirection(start.current.x, start.current.y, t.clientX, t.clientY);
      start.current = null;
      if (dir !== 0) onSwipe(dir);
    },
  };
}

// Fullscreen view of an image without cropping (object-fit: contain), with
// arrows, swiping and keyboard (Esc, ←, →).
export function ImageLightbox({ images, index, alt, onIndexChange, onClose, labels }: ImageLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;
  const go = (step: 1 | -1) => onIndexChange((index + step + count) % count);
  const swipe = useSwipe((dir) => count > 1 && go(dir));

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Capture phase + stopImmediatePropagation: Esc closes only the
      // fullscreen view, not the project window underneath as well.
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && count > 1) onIndexChange((index + 1) % count);
      else if (e.key === 'ArrowLeft' && count > 1) onIndexChange((index - 1 + count) % count);
      else return;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [index, count, onIndexChange, onClose]);

  // Portal to <body> so the view sits above everything (also above the cookie banner).
  return createPortal(
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      {...swipe}
    >
      <SiteImage
        key={images[index]}
        src={images[index]}
        alt={`${alt} ${index + 1}`}
        className="image-lightbox-image"
        width={2400}
        height={1600}
        sizes="100vw"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        ref={closeRef}
        type="button"
        className="image-lightbox-close"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label={labels.close}
      >
        &times;
      </button>
      {count > 1 && (
        <>
          <button
            type="button"
            className="image-lightbox-nav image-lightbox-nav--prev"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            aria-label={labels.previous}
          >
            &#8249;
          </button>
          <button
            type="button"
            className="image-lightbox-nav image-lightbox-nav--next"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            aria-label={labels.next}
          >
            &#8250;
          </button>
          <span className="image-lightbox-counter" aria-live="polite">
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>,
    document.body,
  );
}
