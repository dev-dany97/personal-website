'use client';

import { useState, type PointerEvent } from 'react';
import { SiteImage } from '@/app/components/SiteImage';

export interface HardwareComponent { label: string; value: string; image?: string }

type Cat = 'core' | 'storage' | 'cooling' | 'periph' | 'display';
const CATEGORY: Record<string, Cat> = {
  'Memory SSD': 'storage', 'Memory HDD': 'storage', 'Memory M2': 'storage',
  'Water Cooling': 'cooling', Pump: 'cooling', Fan: 'cooling', Cable: 'cooling', 'Custom Water Front Plate': 'cooling',
  Keyboard: 'periph', Mouse: 'periph', Wheel: 'periph', Microphone: 'periph', Headset: 'periph', Monitor: 'display'
};
// Diese Karte ist auf breiten Bildschirmen doppelt so breit. Bei 23 Teilen
// und einer breiten Karte geht das Vierer-Raster ohne Lücke auf.
const WIDE = new Set(['Water Cooling']);

const TEXT = {
  de: { group: 'Komponenten filtern', all: 'Alle', core: 'Kernsystem', storage: 'Speicher', cooling: 'Kühlung & RGB', periph: 'Peripherie', display: 'Monitore' },
  en: { group: 'Filter components', all: 'All', core: 'Core system', storage: 'Storage', cooling: 'Cooling & RGB', periph: 'Peripherals', display: 'Monitors' }
};

const GLYPH: Record<string, React.ReactNode> = {
  Wheel: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.5" /><path d="M3.5 10h6M14.5 10h6M12 14.5V21" /></svg>,
  'Memory HDD': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="10" r="4.5" /><circle cx="12" cy="10" r="1" /><path d="M14.5 13.5 17 18M7 18.5h3" /></svg>,
  Drive: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.5" /><path d="M12 3a9 9 0 0 1 9 9M12 6.5a5.5 5.5 0 0 1 5.5 5.5" /></svg>,
  'Custom Water Front Plate': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="2" width="12" height="20" rx="1.5" /><path d="M9 6c3 2 3 4 0 6s-3 4 0 6M15 6c-3 2-3 4 0 6s3 4 0 6" /></svg>
};
const CHIP = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="6" width="12" height="12" rx="1.5" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></svg>;

const finePointer = () => typeof window !== 'undefined'
  && window.matchMedia('(hover:hover) and (pointer:fine)').matches
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tilt(e: PointerEvent<HTMLElement>) {
  if (!finePointer()) return;
  const card = e.currentTarget, r = card.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  card.style.setProperty('--mx', `${x * 100}%`);
  card.style.setProperty('--my', `${y * 100}%`);
  card.style.transform = `perspective(800px) rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg) translateY(-4px)`;
}

export function HardwareMatrix({ components, lang, showFilters = true, wideAt = [] }: { components: HardwareComponent[]; lang: 'de' | 'en'; showFilters?: boolean; wideAt?: number[] }) {
  const t = TEXT[lang];
  const [filter, setFilter] = useState<'all' | Cat>('all');
  const catOf = (c: HardwareComponent): Cat => CATEGORY[c.label] ?? 'core';
  const filters: Array<'all' | Cat> = ['all', 'core', 'storage', 'cooling', 'periph', 'display'];

  return (
    <>
      {showFilters && <div className="gx-filters" role="group" aria-label={t.group}>
        {filters.map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {t[f]}
            <span className="gx-n">{f === 'all' ? components.length : components.filter((c) => catOf(c) === f).length}</span>
          </button>
        ))}
      </div>}
      <div className={`gx-parts${filter === 'all' ? ' gx-all' : ''}`}>
        {components.filter((c) => filter === 'all' || catOf(c) === filter).map((c, i) => (
          <article
            key={`${c.label}-${c.value}`}
            className={`gx-part${WIDE.has(c.label) || wideAt.includes(i) ? ' gx-wide' : ''}${c.image?.endsWith('.webp') ? ' gx-cut' : ''}`}
            onPointerMove={tilt}
            onPointerLeave={(e) => { e.currentTarget.style.transform = ''; }}
          >
            <div className="gx-part-img">
              {c.image
                ? <SiteImage src={c.image} alt={c.label} width={720} height={450} sizes="(max-width: 560px) 50vw, (max-width: 1100px) 33vw, 25vw" />
                : <div className="gx-glyph" aria-hidden="true">{GLYPH[c.label] ?? CHIP}</div>}
            </div>
            <div className="gx-part-body">
              <small>{c.label}</small>
              <p>{c.value}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
