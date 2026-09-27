import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 30 * 60 * 1000;
const RIOT_NAME = process.env.VALORANT_RIOT_NAME ?? '';
const RIOT_TAG = process.env.VALORANT_RIOT_TAG ?? '';
const REGION = 'eu';
const PLATFORM = 'pc';

// Favorite agent is fixed rather than derived from match history.
const FAVORITE_AGENT_NAME = 'Neon';
const FAVORITE_AGENT_ID = 'bb2a4828-46eb-8cd1-e765-15848195d751';
const FAVORITE_AGENT_PORTRAIT = `https://media.valorant-api.com/agents/${FAVORITE_AGENT_ID}/fullportrait.png`;

interface ValorantProfile {
  name: string;
  tag: string;
  currentTier: string;
  currentTierIcon: string | null;
  rr: number;
  rrChange: number | null;
  elo: number | null;
  peakTier: string;
  peakTierIcon: string | null;
  accountLevel: number | null;
  bannerUrl: string | null;
  seasonWinRate: number | null;
  lifetimeWinRate: number | null;
  recentKD: number | null;
  recentKills: number | null;
  recentDeaths: number | null;
  recentAssists: number | null;
  favoriteAgentName: string;
  favoriteAgentPortrait: string;
}

async function fetchTierIconBase(): Promise<string | null> {
  try {
    const res = await fetch('https://valorant-api.com/v1/competitivetiers', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const tables = json?.data as { uuid: string }[] | undefined;
    return tables?.[tables.length - 1]?.uuid ?? null;
  } catch {
    return null;
  }
}

async function fetchAccount(apiKey: string): Promise<{ accountLevel: number | null; bannerUrl: string | null }> {
  try {
    const res = await fetch(`https://api.henrikdev.xyz/valorant/v2/account/${RIOT_NAME}/${RIOT_TAG}`, {
      headers: { Authorization: apiKey },
      cache: 'no-store'
    });
    if (!res.ok) return { accountLevel: null, bannerUrl: null };
    const json = await res.json();
    const cardId = json?.data?.card as string | undefined;
    return {
      accountLevel: json?.data?.account_level ?? null,
      bannerUrl: cardId ? `https://media.valorant-api.com/playercards/${cardId}/wideart.png` : null
    };
  } catch {
    return { accountLevel: null, bannerUrl: null };
  }
}

async function fetchRecentKD(apiKey: string): Promise<{ kd: number | null; kills: number | null; deaths: number | null; assists: number | null }> {
  try {
    const res = await fetch(
      `https://api.henrikdev.xyz/valorant/v4/matches/${REGION}/${PLATFORM}/${RIOT_NAME}/${RIOT_TAG}?mode=competitive&size=5`,
      { headers: { Authorization: apiKey }, cache: 'no-store' }
    );
    if (!res.ok) return { kd: null, kills: null, deaths: null, assists: null };
    const json = await res.json();
    const matches = json?.data as { players: { name: string; tag: string; stats: { kills: number; deaths: number; assists: number } }[] }[] | undefined;
    if (!matches?.length) return { kd: null, kills: null, deaths: null, assists: null };

    let kills = 0, deaths = 0, assists = 0;
    for (const match of matches) {
      const me = match.players?.find((p) => p.name.toLowerCase() === RIOT_NAME.toLowerCase() && p.tag === RIOT_TAG);
      if (me) {
        kills += me.stats.kills;
        deaths += me.stats.deaths;
        assists += me.stats.assists;
      }
    }
    const kd = deaths > 0 ? Math.round((kills / deaths) * 100) / 100 : null;
    return { kd, kills, deaths, assists };
  } catch {
    return { kd: null, kills: null, deaths: null, assists: null };
  }
}

async function fetchProfile(): Promise<ValorantProfile | null> {
  const apiKey = process.env.HENRIKDEV_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `https://api.henrikdev.xyz/valorant/v3/mmr/${REGION}/${PLATFORM}/${RIOT_NAME}/${RIOT_TAG}`,
    { headers: { Authorization: apiKey }, cache: 'no-store' }
  );
  if (!res.ok) return null;
  const json = await res.json();
  const data = json?.data;
  if (!data?.current?.tier?.name) return null;

  const [tierIconBase, account, recent] = await Promise.all([
    fetchTierIconBase(),
    fetchAccount(apiKey),
    fetchRecentKD(apiKey)
  ]);

  const iconFor = (tierId: number | undefined) =>
    tierIconBase && tierId !== undefined ? `https://media.valorant-api.com/competitivetiers/${tierIconBase}/${tierId}/largeicon.png` : null;

  const seasonal = data.seasonal as { wins: number; games: number }[] | undefined;
  const lastSeason = seasonal?.[seasonal.length - 1];
  const seasonWinRate = lastSeason && lastSeason.games > 0 ? Math.round((lastSeason.wins / lastSeason.games) * 100) : null;

  const lifetimeTotals = (seasonal ?? []).reduce(
    (acc, s) => ({ wins: acc.wins + s.wins, games: acc.games + s.games }),
    { wins: 0, games: 0 }
  );
  const lifetimeWinRate = lifetimeTotals.games > 0 ? Math.round((lifetimeTotals.wins / lifetimeTotals.games) * 100) : null;

  return {
    name: RIOT_NAME,
    tag: RIOT_TAG,
    currentTier: data.current.tier.name,
    currentTierIcon: iconFor(data.current.tier.id),
    rr: data.current.rr ?? 0,
    rrChange: data.current.last_change ?? null,
    elo: data.current.elo ?? null,
    peakTier: data.peak?.tier?.name ?? data.current.tier.name,
    peakTierIcon: iconFor(data.peak?.tier?.id ?? data.current.tier.id),
    accountLevel: account.accountLevel,
    bannerUrl: account.bannerUrl,
    seasonWinRate,
    lifetimeWinRate,
    recentKD: recent.kd,
    recentKills: recent.kills,
    recentDeaths: recent.deaths,
    recentAssists: recent.assists,
    favoriteAgentName: FAVORITE_AGENT_NAME,
    favoriteAgentPortrait: FAVORITE_AGENT_PORTRAIT
  };
}

export async function GET() {
  const db = getDb();

  const cached = db.prepare('SELECT data, updated_at FROM valorant_profile_cache WHERE id = 1').get() as
    | { data: string; updated_at: string }
    | undefined;

  if (cached && Date.now() - new Date(cached.updated_at).getTime() < CACHE_TTL_MS) {
    return NextResponse.json({ available: true, profile: JSON.parse(cached.data), updatedAt: cached.updated_at });
  }

  if (!process.env.HENRIKDEV_API_KEY) {
    return NextResponse.json({ available: false, reason: 'not_configured' });
  }

  try {
    const profile = await fetchProfile();
    if (!profile) {
      return NextResponse.json({ available: false, reason: 'empty' });
    }
    const updatedAt = new Date().toISOString();

    db.prepare(
      'INSERT INTO valorant_profile_cache (id, data, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
    ).run(JSON.stringify(profile), updatedAt);

    return NextResponse.json({ available: true, profile, updatedAt });
  } catch (err) {
    console.error('valorant-profile fetch failed', err);
    if (cached) {
      return NextResponse.json({ available: true, profile: JSON.parse(cached.data), updatedAt: cached.updated_at, stale: true });
    }
    return NextResponse.json({ available: false, reason: 'error' });
  }
}
