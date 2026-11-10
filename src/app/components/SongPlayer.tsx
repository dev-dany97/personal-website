'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Music } from 'lucide-react';

// "Go Hard Or Go Home" von Andreas W. Herb (Radio Edit), mein Motivationssong.
// Plays through the official Spotify player: the music rights stay
// with Spotify, this site hosts no audio file of its own.
const TRACK_ID = '4TQOj0TWlEAw2gk9EGeNJ1';
const EMBED_URL = `https://open.spotify.com/embed/track/${TRACK_ID}?utm_source=generator&theme=0`;

const TEXT = {
  de: {
    start: 'Song abspielen',
    song: 'Go Hard Or Go Home',
    artist: 'von Andreas W. Herb, mein Motivationssong',
    consent: 'Lädt den Spotify-Player. Dabei werden Daten an Spotify übertragen.',
    privacy: 'Datenschutz',
    close: 'Player schließen',
    title: 'Spotify-Player: Go Hard Or Go Home von Andreas W. Herb'
  },
  en: {
    start: 'Play the song',
    song: 'Go Hard Or Go Home',
    artist: 'by Andreas W. Herb, my motivation song',
    consent: 'Loads the Spotify player, which sends data to Spotify.',
    privacy: 'Privacy',
    close: 'Close player',
    title: 'Spotify player: Go Hard Or Go Home by Andreas W. Herb'
  }
};

// Button in the finance page hero. The Spotify player only loads after the click (before that
// no data goes to Spotify). The player then floats at the bottom left, stays
// visible while scrolling and can be paused or closed at any time.
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
            height="80"
            loading="eager"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
          <button type="button" className="song-player-close" onClick={() => setOpen(false)} aria-label={t.close} title={t.close}>
            &times;
          </button>
        </div>
      )}
    </>
  );
}
