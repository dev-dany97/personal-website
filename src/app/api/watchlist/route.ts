import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 15 * 60 * 1000;

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

// Symbols on Daniel's watchlist (Yahoo Finance tickers). Only public market
// data is returned: price and the change against the previous close.
const WATCHLIST = [
  { symbol: 'BTC-USD', name: 'Bitcoin', kind: 'crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', kind: 'crypto' },
  { symbol: 'SOL-USD', name: 'Solana', kind: 'crypto' },
  { symbol: 'NVDA', name: 'Nvidia', kind: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft', kind: 'stock' },
  { symbol: 'TSLA', name: 'Tesla', kind: 'stock' },
  { symbol: 'SAP.DE', name: 'SAP', kind: 'stock' },
  { symbol: 'RHM.DE', name: 'Rheinmetall', kind: 'stock' }
] as const;

interface WatchlistItem {
  symbol: string;
  name: string;
  kind: 'crypto' | 'stock';
  price: number;
  currency: string;
  change: number | null;
}

async function fetchQuote(symbol: string): Promise<{ price: number; currency: string; previousClose: number | null } | null> {
  const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`, {
    headers: YAHOO_HEADERS,
    cache: 'no-store'
  });
  if (!res.ok) return null;
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice || !meta?.currency) return null;
  const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? null;
  return { price: meta.regularMarketPrice as number, currency: meta.currency as string, previousClose };
}

async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const quotes = await Promise.all(WATCHLIST.map((w) => fetchQuote(w.symbol).catch(() => null)));
  const items: WatchlistItem[] = [];
  WATCHLIST.forEach((w, i) => {
    const q = quotes[i];
    if (!q) return;
    const change = q.previousClose ? Math.round(((q.price - q.previousClose) / q.previousClose) * 10000) / 100 : null;
    items.push({ symbol: w.symbol, name: w.name, kind: w.kind, price: q.price, currency: q.currency, change });
  });
  return items;
}

export async function GET() {
  const db = getDb();
  const cached = db.prepare('SELECT data, updated_at FROM watchlist_cache WHERE id = 1').get() as
    | { data: string; updated_at: string }
    | undefined;

  if (cached && Date.now() - new Date(cached.updated_at).getTime() < CACHE_TTL_MS) {
    return NextResponse.json({ available: true, items: JSON.parse(cached.data), updatedAt: cached.updated_at });
  }

  try {
    const items = await fetchWatchlist();
    if (items.length === 0) throw new Error('no quotes');
    const updatedAt = new Date().toISOString();
    db.prepare(
      'INSERT INTO watchlist_cache (id, data, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
    ).run(JSON.stringify(items), updatedAt);
    return NextResponse.json({ available: true, items, updatedAt });
  } catch (err) {
    console.error('watchlist fetch failed', err);
    if (cached) {
      return NextResponse.json({ available: true, items: JSON.parse(cached.data), updatedAt: cached.updated_at, stale: true });
    }
    return NextResponse.json({ available: false, reason: 'error' });
  }
}
