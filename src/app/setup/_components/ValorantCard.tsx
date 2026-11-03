'use client';

import { useEffect, useState } from 'react';
import { formatNumber } from './telemetry';

interface ValorantProfileData {
  name: string; tag: string;
  currentTier: string; currentTierIcon: string | null; rr: number; rrChange: number | null; elo: number | null;
  peakTier: string; peakTierIcon: string | null; accountLevel: number | null; bannerUrl: string | null;
  seasonWinRate: number | null; lifetimeWinRate: number | null;
  recentKD: number | null; recentKills: number | null; recentDeaths: number | null; recentAssists: number | null;
  favoriteAgentName: string; favoriteAgentPortrait: string;
}
interface ValorantResponse { available: boolean; profile?: ValorantProfileData }

const TEXT = {
  en: {
    eyebrow: 'Live profile', title: 'Player Card', mode: 'Valorant · Competitive', current: 'Current rank', peak: 'Peak',
    agent: 'Favorite agent', level: 'Account level', winRate: 'Season win rate', lifetimeWinRate: 'Lifetime win rate',
    elo: 'Elo', rrChange: 'Last RR change', kd: 'K/D (last 5)'
  },
  de: {
    eyebrow: 'Live-Profil', title: 'Player Card', mode: 'Valorant · Competitive', current: 'Aktueller Rang', peak: 'Höchster',
    agent: 'Lieblingsagent', level: 'Account-Level', winRate: 'Winrate (Season)', lifetimeWinRate: 'Winrate (Lifetime)',
    elo: 'Elo', rrChange: 'Letzte RR-Änderung', kd: 'K/D (letzte 5)'
  }
};

// Valorant profile via /api/valorant-profile. Without an API key the
// route returns available:false; then the whole section disappears.
export function ValorantCard({ lang }: { lang: 'de' | 'en' }) {
  const t = TEXT[lang];
  const [data, setData] = useState<ValorantResponse | null>(null);

  useEffect(() => {
    fetch('/api/valorant-profile')
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData({ available: false }));
  }, []);

  if (data && !data.available) return null;
  const p = data?.profile;
  const pct = (n: number) => `${formatNumber(n, lang, 1)} %`;

  const stats: Array<{ label: string; value: string; sub?: string; tone?: 'up' | 'down' }> = [];
  if (p) {
    if (p.seasonWinRate !== null) stats.push({ label: t.winRate, value: pct(p.seasonWinRate) });
    if (p.recentKD !== null) stats.push({
      label: t.kd, value: formatNumber(p.recentKD, lang, 2),
      sub: p.recentKills !== null ? `${p.recentKills}/${p.recentDeaths}/${p.recentAssists}` : undefined
    });
    if (p.elo !== null) stats.push({ label: t.elo, value: String(p.elo) });
    if (p.rrChange !== null) stats.push({ label: t.rrChange, value: `${p.rrChange >= 0 ? '+' : ''}${p.rrChange}`, tone: p.rrChange >= 0 ? 'up' : 'down' });
    if (p.lifetimeWinRate !== null) stats.push({ label: t.lifetimeWinRate, value: pct(p.lifetimeWinRate) });
    if (p.accountLevel !== null) stats.push({ label: t.level, value: String(p.accountLevel) });
    stats.push({ label: t.agent, value: p.favoriteAgentName });
  }
  // The grid has three (phone: two) columns, so at most six values.
  const shown = stats.length > 6 ? stats.filter((s) => s.label !== t.level).slice(0, 6) : stats;

  return (
    <section className="gx-band" id="valorant">
      <div className="gx-wrap">
        <div className="gx-sec-head gx-rv">
          <span className="gx-eyebrow" style={{ color: 'var(--alert)' }}>{t.eyebrow}</span>
          <h2>{t.title}</h2>
        </div>
        <div className="gx-val gx-rv">
          <div className="gx-val-id">
            {p?.favoriteAgentPortrait && <img src={p.favoriteAgentPortrait} alt="" className="gx-val-agent" />}
            <div className="gx-eyebrow">{t.mode}</div>
            {!p ? (
              <div className="gx-val-name">…</div>
            ) : (
              <>
                <div className="gx-val-name">{p.name}<span>#{p.tag}</span></div>
                <div className="gx-rank">
                  {p.currentTierIcon
                    ? <img src={p.currentTierIcon} alt="" className="gx-rank-icon" />
                    : <div className="gx-rank-badge">{p.currentTier.slice(0, 1)}</div>}
                  <div>
                    <span className="gx-dim gx-mono" style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>{t.current}</span>
                    <b>{p.currentTier}</b>
                    <span className="gx-dim gx-mono" style={{ fontSize: 12 }}>{p.rr} RR · {t.peak}: {p.peakTier}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="gx-val-stats">
            {shown.map((s) => (
              <div key={s.label}>
                <small>{s.label}</small>
                <b className={s.tone ? `gx-${s.tone}` : undefined}>{s.value}</b>
                {s.sub && <span>{s.sub}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
