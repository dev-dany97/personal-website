import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 15 * 60 * 1000;

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

interface Allocation {
  asset: string;
  percent: number;
  change: number | null;
}

interface StockPosition {
  ticker: string;
  name: string;
  quantity: number;
  buy_price: number;
}

async function fetchYahooPrice(symbol: string): Promise<{ price: number; currency: string } | null> {
  const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`, {
    headers: YAHOO_HEADERS,
    cache: 'no-store'
  });
  if (!res.ok) return null;
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice || !meta?.currency) return null;
  return { price: meta.regularMarketPrice as number, currency: meta.currency as string };
}

async function fetchAllocations(): Promise<Allocation[]> {
  const db = getDb();
  const positions = db.prepare('SELECT ticker, name, quantity, buy_price FROM stock_positions ORDER BY sort_order').all() as unknown as StockPosition[];
  if (positions.length === 0) return [];

  const quotes = await Promise.all(positions.map((p) => fetchYahooPrice(p.ticker)));

  const needsFx = quotes.some((q) => q && q.currency !== 'EUR');
  let usdToEur: number | null = null;
  if (needsFx) {
    const fx = await fetchYahooPrice('EURUSD=X');
    if (fx) usdToEur = 1 / fx.price;
  }

  // Everything below is an absolute € value, used only to compute percentages.
  // Neither buy prices, quantities nor these values are ever included in the response.
  const valued: { asset: string; currentValue: number; investedValue: number }[] = [];
  positions.forEach((p, i) => {
    const quote = quotes[i];
    if (!quote) return;
    let priceEur = quote.price;
    if (quote.currency !== 'EUR') {
      if (quote.currency !== 'USD' || !usdToEur) return;
      priceEur = quote.price * usdToEur;
    }
    valued.push({
      asset: p.name,
      currentValue: p.quantity * priceEur,
      investedValue: p.quantity * p.buy_price
    });
  });

  const total = valued.reduce((sum, v) => sum + v.currentValue, 0);
  if (total <= 0) return [];

  valued.sort((a, b) => b.currentValue - a.currentValue);

  return valued
    .map((v) => ({
      asset: v.asset,
      percent: Math.round((v.currentValue / total) * 1000) / 10,
      change: v.investedValue > 0 ? Math.round(((v.currentValue - v.investedValue) / v.investedValue) * 10000) / 100 : null
    }))
    .filter((a) => a.percent > 0);
}

export async function GET() {
  const db = getDb();

  const cached = db.prepare('SELECT data, updated_at FROM stock_portfolio_cache WHERE id = 1').get() as
    | { data: string; updated_at: string }
    | undefined;

  if (cached && Date.now() - new Date(cached.updated_at).getTime() < CACHE_TTL_MS) {
    return NextResponse.json({ available: true, allocations: JSON.parse(cached.data), updatedAt: cached.updated_at });
  }

  try {
    const allocations = await fetchAllocations();
    if (allocations.length === 0) {
      return NextResponse.json({ available: false, reason: 'empty' });
    }
    const updatedAt = new Date().toISOString();

    db.prepare(
      'INSERT INTO stock_portfolio_cache (id, data, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
    ).run(JSON.stringify(allocations), updatedAt);

    return NextResponse.json({ available: true, allocations, updatedAt });
  } catch (err) {
    console.error('stock-portfolio fetch failed', err);
    if (cached) {
      return NextResponse.json({ available: true, allocations: JSON.parse(cached.data), updatedAt: cached.updated_at, stale: true });
    }
    return NextResponse.json({ available: false, reason: 'error' });
  }
}
