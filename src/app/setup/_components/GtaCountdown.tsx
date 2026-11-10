'use client';

import { useEffect, useState } from 'react';
import { SiteImage } from '@/app/components/SiteImage';

// Offizieller Release laut Rockstar/Take-Two: 19. November 2026 (PS5, Xbox Series X|S).
// Midnight German time, so the counter hits 0 for visitors here
// when the day starts. If the game is delayed, just change this date.
const RELEASE = new Date('2026-11-19T00:00:00+01:00').getTime();

const TEXT = {
  de: {
    eyebrow: 'Countdown · Release',
    title: 'Grand Theft Auto VI',
    lead: 'Das Spiel, auf das ich schon lange warte... Erscheint am 19. November 2026 für PS5 und Xbox Series X|S.',
    imageAlt: 'Titelbild von Grand Theft Auto VI mit Release-Datum 19. November 2026',
    released: 'Es ist so weit: GTA VI ist erschienen!',
    units: ['Tage', 'Std', 'Min', 'Sek'],
    aria: 'Zeit bis zum Release von GTA VI'
  },
  en: {
    eyebrow: 'Countdown · Release',
    title: 'Grand Theft Auto VI',
    lead: "The game I've been waiting for for a long time... It comes out on 19 November 2026 for PS5 and Xbox Series X|S.",
    imageAlt: 'Grand Theft Auto VI cover art with the release date 19 November 2026',
    released: "It's here: GTA VI is out now!",
    units: ['Days', 'Hrs', 'Min', 'Sec'],
    aria: 'Time until the GTA VI release'
  }
};

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
}

export function GtaCountdown({ lang }: { lang: 'de' | 'en' }) {
  const t = TEXT[lang];
  // Only set in the browser, otherwise server and client output don't match.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  const left = now === null ? null : RELEASE - now;
  const done = left !== null && left <= 0;
  const parts = left === null ? null : split(left);

  return (
    <section className="gx-band gx-gta" id="gta6">
      <div className="gx-wrap gx-gta-inner">
        <div className="gx-gta-cover gx-hud gx-rv">
          <SiteImage src="/images/setup/gta6-cover.webp" alt={t.imageAlt} width={597} height={335} sizes="(max-width: 900px) 100vw, 420px" />
        </div>
        <div className="gx-gta-text">
          <div className="gx-sec-head gx-rv">
            <span className="gx-eyebrow">{t.eyebrow}</span>
            <h2>{t.title}</h2>
            <p>{done ? t.released : t.lead}</p>
          </div>
          {!done && (
            <div className="gx-gta-clock gx-rv" role="timer" aria-label={t.aria}>
              {t.units.map((unit, i) => (
                <div key={unit} className="gx-gta-cell gx-hud">
                  <b>{parts ? String(parts[i]).padStart(i === 0 ? 1 : 2, '0') : '–'}</b>
                  <small>{unit}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
