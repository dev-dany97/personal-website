'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface AutoplayVideoProps {
  src: string;
  className?: string;
  style?: CSSProperties;
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
export function AutoplayVideo({ src, className, style }: AutoplayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
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

  return (
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
      controls={blocked}
    >
      Your browser does not support the video tag.
    </video>
  );
}
