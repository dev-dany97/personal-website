import { getDb } from '@/lib/db';

// Server-only helper: public Yahoo Finance quotes (price + change against the
// previous close), cached per list in SQLite so visitors never hit Yahoo directly.

const CACHE_TTL_MS = 15 * 60 * 1000;

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

export interface QuoteSpec {
  symbol: string;
  name: string;
  kind: 'crypto' | 'stock' | 'index' | 'fx' | 'commodity';
}

export interface Quote extends QuoteSpec {
  price: number;
  currency: string;
  change: number | null;
}

export type QuotesResult =
  | { available: true; items: Quote[]; updatedAt: string; stale?: boolean }
  | { available: false; reason: string };

async function fetchQuote(spec: QuoteSpec): Promise<Quote | null> {
  const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(spec.symbol)}`, {
    headers: YAHOO_HEADERS,
    cache: 'no-store'
  });
  if (!res.ok) return null;
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice || !meta?.currency) return null;
  const price = meta.regularMarketPrice as number;
  const previousClose = (meta.chartPreviousClose ?? meta.previousClose ?? null) as number | null;
  const change = previousClose ? Math.round(((price - previousClose) / previousClose) * 10000) / 100 : null;
  return { ...spec, price, currency: meta.currency as string, change };
}

export async function getQuotes(cacheKey: string, specs: readonly QuoteSpec[]): Promise<QuotesResult> {
  const db = getDb();
  const cached = db.prepare('SELECT data, updated_at FROM market_quote_cache WHERE key = ?').get(cacheKey) as
    | { data: string; updated_at: string }
    | undefined;

  if (cached && Date.now() - new Date(cached.updated_at).getTime() < CACHE_TTL_MS) {
    return { available: true, items: JSON.parse(cached.data), updatedAt: cached.updated_at };
  }

  try {
    const quotes = await Promise.all(specs.map((s) => fetchQuote(s).catch(() => null)));
    const items = quotes.filter((q): q is Quote => q !== null);
    if (items.length === 0) throw new Error('no quotes');
    const updatedAt = new Date().toISOString();
    db.prepare(
      'INSERT INTO market_quote_cache (key, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
    ).run(cacheKey, JSON.stringify(items), updatedAt);
    return { available: true, items, updatedAt };
  } catch (err) {
    console.error(`market quotes (${cacheKey}) fetch failed`, err);
    if (cached) return { available: true, items: JSON.parse(cached.data), updatedAt: cached.updated_at, stale: true };
    return { available: false, reason: 'error' };
  }
}
