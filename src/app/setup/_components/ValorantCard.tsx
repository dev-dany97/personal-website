'use client';

import { useEffect, useState } from 'react';
import { formatNumber } from './telemetry';
import { SiteImage } from '@/app/components/SiteImage';

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
  // The bar has six (tablet: three, phone: two) columns, so at most six values.
  const shown = stats.length > 6 ? stats.filter((s) => s.label !== t.level).slice(0, 6) : stats;

  return (
    <section className="gx-band" id="valorant">
      <div className="gx-wrap">
        <div className="gx-sec-head gx-rv">
          <span className="gx-eyebrow" style={{ color: 'var(--alert)' }}>{t.eyebrow}</span>
          <h2>{t.title}</h2>
        </div>
        <div className="gx-val gx-rv">
          <ValorantBackdrop />
          {p?.bannerUrl && <SiteImage src={p.bannerUrl} alt="" className="gx-val-banner" width={1240} height={400} />}
          {/* Neon as a fixed figure, independent of the favourite agent from the API */}
          <SiteImage src="/images/setup/neon-agent.webp" alt="" className="gx-val-agent" width={700} height={742} sizes="(max-width: 560px) 240px, 380px" />
          <div className="gx-val-id">
            <div className="gx-eyebrow">{t.mode}</div>
            {!p ? (
              <div className="gx-val-name">…</div>
            ) : (
              <>
                <div className="gx-val-name">{p.name}<span>#{p.tag}</span></div>
                <div className="gx-rank">
                  {p.currentTierIcon
                    ? <SiteImage src={p.currentTierIcon} alt="" className="gx-rank-icon" width={64} height={64} />
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

// Custom background in Valorant style: angular red shapes and Neon's
// blue lightning. Drawn entirely as SVG, so no external image files.
// If the API returns a player card banner, it is laid on top.
function ValorantBackdrop() {
  return (
    <svg className="gx-val-bg" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="gxValBase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0f1923" />
          <stop offset=".55" stopColor="#140d1c" />
          <stop offset="1" stopColor="#081426" />
        </linearGradient>
        <linearGradient id="gxValRed" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff4655" stopOpacity=".55" />
          <stop offset="1" stopColor="#ff4655" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gxValBolt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7df9ff" />
          <stop offset="1" stopColor="#2f6bff" />
        </linearGradient>
        <filter id="gxValGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="1200" height="420" fill="url(#gxValBase)" />
      <polygon points="0,0 560,0 430,420 0,420" fill="url(#gxValRed)" opacity=".35" />
      <polygon points="610,0 640,0 510,420 480,420" fill="#ff4655" opacity=".55" />
      <polygon points="660,0 668,0 538,420 530,420" fill="#ff4655" opacity=".35" />
      <g stroke="#ece8e1" strokeOpacity=".08" fill="none">
        <path d="M40 360 L180 360 L210 330" /><path d="M40 60 L120 60" /><path d="M1060 40 L1160 40 L1160 120" />
      </g>
      <text x="1180" y="400" textAnchor="end" className="gx-val-word">NEON</text>
      <g filter="url(#gxValGlow)" stroke="url(#gxValBolt)" strokeWidth="3" fill="none" strokeLinejoin="bevel" opacity=".85">
        <polyline points="760,-10 820,120 790,140 880,300 850,318 930,430" />
        <polyline points="1010,-10 980,90 1030,110 960,260 1000,280 950,430" strokeWidth="2" opacity=".7" />
        <polyline points="1120,30 1090,150 1130,170 1080,300" strokeWidth="1.5" opacity=".6" />
      </g>
    </svg>
  );
}
