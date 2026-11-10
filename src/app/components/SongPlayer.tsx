'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Music } from 'lucide-react';

// "Go Hard Or Go Home" von Andreas W. Herb, mein Motivationssong.
// Abgespielt wird über den eingebetteten YouTube-Player (Datenschutzmodus
// youtube-nocookie.com). Anders als Spotify spielt YouTube den ganzen Song auch
// für Besucher ohne Login; auf dieser Seite liegt keine eigene Audiodatei.
const VIDEO_ID = 'ikRPMnHSyPc';
const EMBED_URL = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&playsinline=1`;

const TEXT = {
  de: {
    start: 'Song abspielen',
    song: 'Go Hard Or Go Home',
    artist: 'von Andreas W. Herb, mein Motivationssong',
    consent: 'Lädt den YouTube-Player. Dabei werden Daten an YouTube (Google) übertragen.',
    privacy: 'Datenschutz',
    close: 'Player schließen',
    title: 'YouTube-Player: Go Hard Or Go Home von Andreas W. Herb'
  },
  en: {
    start: 'Play the song',
    song: 'Go Hard Or Go Home',
    artist: 'by Andreas W. Herb, my motivation song',
    consent: 'Loads the YouTube player, which sends data to YouTube (Google).',
    privacy: 'Privacy',
    close: 'Close player',
    title: 'YouTube player: Go Hard Or Go Home by Andreas W. Herb'
  }
};

// Knopf im Hero der Finance-Seite. Erst nach dem Klick wird der YouTube-Player geladen (vorher
// gehen keine Daten an YouTube). Der Player schwebt dann unten links, bleibt
// beim Scrollen sichtbar und lässt sich jederzeit pausieren oder schließen.
export function SongPlayer({ lang }: { lang: 'de' | 'en' }) {
  const t = TEXT[lang];
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="song-player">
        <button type="button" className="btn btn-brand-outline song-player-btn" onClick={() => setOpen(true)} aria-pressed={open}>
          <Music size={16} strokeWidth={2} aria-hidden="true" />
          {t.start}: <span className="song-player-name">{t.song}</span>
        </button>
        <span className="song-player-artist">{t.artist}</span>
        <small className="song-player-hint">
          {t.consent} <Link href="/datenschutz">{t.privacy}</Link>
        </small>
      </div>

      {open && (
        <div className="song-player-dock" role="region" aria-label={t.title}>
          <iframe
            title={t.title}
            src={EMBED_URL}
            width="100%"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
          <button type="button" className="song-player-close" onClick={() => setOpen(false)} aria-label={t.close} title={t.close}>
            &times;
          </button>
        </div>
      )}
    </>
  );
}
