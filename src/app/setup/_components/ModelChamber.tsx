'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const TEXT = {
  de: { start: 'Modell aktivieren', hint: 'Antippen zum Starten. Bis dahin scrollt die Seite normal weiter.', fs: 'Vollbild' },
  en: { start: 'Start the model', hint: 'Tap to start. Until then the page scrolls normally.', fs: 'Full screen' }
};

export interface ModelChamberHandle { activate: () => void }

// The 3D model (public/pc-modell.html) only loads after a tap.
// That way it costs no data until someone opens it, and on phones
// scrolling doesn't get stuck in the model.
export const ModelChamber = forwardRef<ModelChamberHandle, { lang: 'de' | 'en' }>(function ModelChamber({ lang }, ref) {
  const t = TEXT[lang];
  const [live, setLive] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({ activate: () => setLive(true) }), []);

  const fullscreen = async () => {
    setLive(true);
    const el = boxRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className={`gx-chamber gx-hud${live ? ' gx-live' : ''}`} ref={boxRef}>
      {live && <iframe src="/pc-modell.html" title="Custom-Loop PC – 3D-Modell" allow="autoplay; fullscreen" />}
      {!live && (
        <button className="gx-chamber-gate" type="button" onClick={() => setLive(true)}>
          <span>
            <span className="gx-ring">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M12 2 3 7v10l9 5 9-5V7z" /><path d="M3 7l9 5 9-5M12 12v10" />
              </svg>
            </span>
            <b>{t.start}</b>
            <small>{t.hint}</small>
          </span>
        </button>
      )}
      <div className="gx-chamber-bar">
        <button className="gx-icon-btn" type="button" onClick={fullscreen} aria-label={t.fs}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
        </button>
      </div>
    </div>
  );
});
