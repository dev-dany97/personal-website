import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DAYS = 365;
const STABLECOINS = new Set(['USDT', 'USDC', 'BUSD', 'FDUSD', 'DAI', 'TUSD', 'USDP']);

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

function sign(query: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(query).digest('hex');
}

function dateAxis(days: number): string[] {
  const axis: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    axis.push(d.toISOString().slice(0, 10));
  }
  return axis;
}

function fillSeries(axis: string[], raw: Map<string, number>): number[] {
  const out: number[] = new Array(axis.length).fill(NaN);
  let last: number | null = null;
  for (let i = 0; i < axis.length; i++) {
    const v = raw.get(axis[i]);
    if (v !== undefined) last = v;
    out[i] = last ?? NaN;
  }
  // Back-fill any leading gap (series that started later than the axis) with its first known value.
  const firstKnown = out.find((v) => !Number.isNaN(v));
  if (firstKnown !== undefined) {
    for (let i = 0; i < out.length; i++) {
      if (Number.isNaN(out[i])) out[i] = firstKnown;
      else break;
    }
  }
  return out;
}

async function fetchYahooHistory(symbol: string): Promise<{ dates: Map<string, number>; currency: string } | null> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d`,
    { headers: YAHOO_HEADERS, cache: 'no-store' }
  );
  if (!res.ok) return null;
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  const timestamps: number[] = result?.timestamp ?? [];
  const closes: (number | null)[] = result?.indicators?.quote?.[0]?.close ?? [];
  const currency: string = result?.meta?.currency ?? 'USD';
  if (timestamps.length === 0) return null;

  const dates = new Map<string, number>();
  timestamps.forEach((ts, i) => {
    const close = closes[i];
    if (close === null || close === undefined) return;
    const dateStr = new Date(ts * 1000).toISOString().slice(0, 10);
    dates.set(dateStr, close);
  });
  return { dates, currency };
}

async function fetchBinanceKlines(asset: string): Promise<Map<string, number> | null> {
  for (const quote of ['USDT', 'USDC', 'BUSD']) {
    const symbol = `${asset}${quote}`;
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=${DAYS + 5}`,
        { cache: 'no-store' }
      );
      if (!res.ok) continue;
      const rows = (await res.json()) as unknown[];
      if (!Array.isArray(rows) || rows.length === 0) continue;
      const dates = new Map<string, number>();
      for (const row of rows as (string | number)[][]) {
        const closeTime = Number(row[6]);
        const close = parseFloat(String(row[4]));
        const dateStr = new Date(closeTime).toISOString().slice(0, 10);
        dates.set(dateStr, close);
      }
      return dates;
    } catch {
      continue;
    }
  }
  return null;
}

interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

async function fetchCryptoHoldings(): Promise<{ asset: string; amount: number }[]> {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;
  if (!apiKey || !apiSecret) return [];

  const timestamp = Date.now();
  const query = `timestamp=${timestamp}&recvWindow=5000`;
  const signature = sign(query, apiSecret);
  const res = await fetch(`https://api.binance.com/api/v3/account?${query}&signature=${signature}`, {
    headers: { 'X-MBX-APIKEY': apiKey },
    cache: 'no-store'
  });
  if (!res.ok) return [];
  const account = (await res.json()) as { balances: BinanceBalance[] };
  return account.balances
    .map((b) => ({ asset: b.asset, amount: parseFloat(b.free) + parseFloat(b.locked) }))
    .filter((b) => b.amount > 0);
}

interface StockPosition {
  ticker: string;
  name: string;
  quantity: number;
  buy_price: number;
}

interface Marker {
  date: string;
  label: string;
}

// No real purchase date on record, so approximate it: the most recent date in the
// window where the price was still at or below the buy price (i.e. the last time
// it "reached" that value before rallying past it for good).
function findImpliedPurchaseDate(dates: Map<string, number>, buyPrice: number): string | null {
  const sorted = [...dates.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  if (sorted.length === 0) return null;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i][1] <= buyPrice) return sorted[i][0];
  }
  let closest = sorted[0];
  let minDiff = Math.abs(sorted[0][1] - buyPrice);
  for (const entry of sorted) {
    const diff = Math.abs(entry[1] - buyPrice);
    if (diff < minDiff) {
      minDiff = diff;
      closest = entry;
    }
  }
  return closest[0];
}

async function computeHistory(): Promise<{ history: { date: string; index: number }[]; markers: Marker[] }> {
  const axis = dateAxis(DAYS);
  const db = getDb();

  const stocks = db.prepare('SELECT ticker, name, quantity, buy_price FROM stock_positions ORDER BY sort_order').all() as unknown as StockPosition[];
  const cryptoHoldings = await fetchCryptoHoldings();

  const fx = await fetchYahooHistory('EURUSD=X');
  const fxSeries = fx ? fillSeries(axis, fx.dates) : axis.map(() => 1);

  let totalInvested = 0;
  const seriesEur: number[][] = [];
  const markers: Marker[] = [];

  // Stocks: baseline is the known buy price (EUR), independent of date.
  for (const s of stocks) {
    const hist = await fetchYahooHistory(s.ticker);
    if (!hist) continue;
    const priceSeries = fillSeries(axis, hist.dates);
    if (priceSeries.every((v) => Number.isNaN(v))) continue;
    const eurSeries = priceSeries.map((p, i) => (hist.currency === 'EUR' ? p : p / fxSeries[i]));
    seriesEur.push(eurSeries.map((p) => p * s.quantity));
    totalInvested += s.buy_price * s.quantity;

    const impliedDate = findImpliedPurchaseDate(hist.dates, s.buy_price);
    if (impliedDate && impliedDate >= axis[0]) markers.push({ date: impliedDate, label: s.name });
  }

  // Crypto: no purchase date on record, so per the user's instruction we use the
  // price exactly 365 days ago (start of the window) as the cost-basis proxy.
  for (const h of cryptoHoldings) {
    if (h.asset === 'EUR') {
      // Fiat EUR balance: flat contribution, no price series needed.
      seriesEur.push(axis.map(() => h.amount));
      totalInvested += h.amount;
      continue;
    }
    let eurSeries: number[];
    if (STABLECOINS.has(h.asset)) {
      eurSeries = fxSeries.map((rate) => 1 / rate);
    } else {
      const klines = await fetchBinanceKlines(h.asset);
      if (!klines) continue;
      const usdSeries = fillSeries(axis, klines);
      // Some assets have no candle overlapping our window (e.g. no longer actively
      // traded) — fillSeries can't recover from that, so skip rather than poison the sum.
      if (usdSeries.every((v) => Number.isNaN(v))) continue;
      eurSeries = usdSeries.map((p, i) => p / fxSeries[i]);
    }
    seriesEur.push(eurSeries.map((p) => p * h.amount));
    totalInvested += eurSeries[0] * h.amount;
  }

  if (seriesEur.length === 0 || totalInvested <= 0) return { history: [], markers: [] };

  const history = axis.map((date, i) => {
    const totalValue = seriesEur.reduce((sum, series) => sum + series[i], 0);
    return { date, index: Math.round((totalValue / totalInvested) * 1000) / 10 };
  });

  return { history, markers };
}

export async function GET() {
  const db = getDb();

  const cached = db.prepare('SELECT data, updated_at FROM portfolio_history_cache WHERE id = 1').get() as
    | { data: string; updated_at: string }
    | undefined;

  if (cached && Date.now() - new Date(cached.updated_at).getTime() < CACHE_TTL_MS) {
    const parsed = JSON.parse(cached.data);
    return NextResponse.json({ available: true, ...parsed, updatedAt: cached.updated_at });
  }

  try {
    const { history, markers } = await computeHistory();
    if (history.length === 0) {
      return NextResponse.json({ available: false, reason: 'empty' });
    }
    const updatedAt = new Date().toISOString();
    const payload = { history, markers };

    db.prepare(
      'INSERT INTO portfolio_history_cache (id, data, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
    ).run(JSON.stringify(payload), updatedAt);

    return NextResponse.json({ available: true, ...payload, updatedAt });
  } catch (err) {
    console.error('portfolio-history fetch failed', err);
    if (cached) {
      const parsed = JSON.parse(cached.data);
      return NextResponse.json({ available: true, ...parsed, updatedAt: cached.updated_at, stale: true });
    }
    return NextResponse.json({ available: false, reason: 'error' });
  }
}
