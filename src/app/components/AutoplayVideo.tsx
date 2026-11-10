'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface AutoplayVideoProps {
  src: string;
  className?: string;
  style?: CSSProperties;
  poster?: string;
  // Used if src fails to load, e.g. a new clip not yet uploaded to the CDN.
  fallbackSrc?: string;
  ariaLabel?: string;
  // Renders a small play/pause button over the video (Gaming page). The
  // labels are passed in so the component stays language-agnostic.
  toggle?: { className?: string; playLabel: string; pauseLabel: string };
}

// Muted, looping background-style video that also plays on phones.
//
// Mobile browsers only autoplay a video that is muted *and* inline, and React
// sets `muted` only as a DOM property (never as the HTML attribute), which iOS
// Safari does not always accept for autoplay. So the attribute is set by hand
// and play() is called explicitly once the video scrolls into view; it pauses
// again off-screen to save data and battery.
//
// If the browser still refuses (iOS Low Power Mode, Android data saver), the
// native controls are shown so a tap starts the video instead of leaving a
// dead black box.
export function AutoplayVideo({ src: primarySrc, className, style, poster, ariaLabel, toggle, fallbackSrc }: AutoplayVideoProps) {
  const [failed, setFailed] = useState(false);
  const src = failed && fallbackSrc ? fallbackSrc : primarySrc;
  const ref = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);
  const [paused, setPaused] = useState(true);
  // Set when the visitor pauses by hand, so scrolling back does not restart it.
  const userPaused = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      if (userPaused.current) return;
      const result = video.play();
      if (result) {
        result.then(() => setBlocked(false)).catch((err: unknown) => {
          // AbortError only means a pause() interrupted play(); not a block.
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setBlocked(true);
        });
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      tryPlay();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay();
        else video.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  const onToggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  const videoEl = (
    <video
      ref={ref}
      // "#t=0.001" makes iOS Safari render the first frame as a preview while
      // only metadata is loaded. The fragment is never sent to the server.
      src={`${src}#t=0.001`}
      className={className}
      style={style}
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={ariaLabel}
      controls={blocked}
      onError={() => { if (fallbackSrc && !failed) setFailed(true); }}
      onPlay={() => setPaused(false)}
      onPause={() => setPaused(true)}
    >
      Your browser does not support the video tag.
    </video>
  );

  if (!toggle || blocked) return videoEl;

  return (
    <>
      {videoEl}
      <button
        type="button"
        className={toggle.className}
        onClick={onToggle}
        aria-label={paused ? toggle.playLabel : toggle.pauseLabel}
      >
        {paused ? (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
        )}
      </button>
    </>
  );
}
