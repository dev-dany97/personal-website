import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// How long a cached allocation snapshot stays valid before we hit Binance again.
const CACHE_TTL_MS = 15 * 60 * 1000;

const STABLECOINS = new Set(['USDT', 'USDC', 'BUSD', 'FDUSD', 'DAI', 'TUSD', 'USDP']);

interface Allocation {
  asset: string;
  percent: number;
  change: number | null;
}

interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

function sign(query: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(query).digest('hex');
}

async function fetchAllocations(): Promise<Allocation[]> {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;
  if (!apiKey || !apiSecret) throw new Error('not_configured');

  const timestamp = Date.now();
  const query = `timestamp=${timestamp}&recvWindow=5000`;
  const signature = sign(query, apiSecret);

  const accountRes = await fetch(`https://api.binance.com/api/v3/account?${query}&signature=${signature}`, {
    headers: { 'X-MBX-APIKEY': apiKey },
    cache: 'no-store'
  });
  if (!accountRes.ok) throw new Error(`binance_account_${accountRes.status}`);
  const account = (await accountRes.json()) as { balances: BinanceBalance[] };

  const held = account.balances
    .map((b) => ({ asset: b.asset, amount: parseFloat(b.free) + parseFloat(b.locked) }))
    .filter((b) => b.amount > 0);

  if (held.length === 0) return [];

  const priceRes = await fetch('https://api.binance.com/api/v3/ticker/price', { cache: 'no-store' });
  if (!priceRes.ok) throw new Error(`binance_price_${priceRes.status}`);
  const prices = (await priceRes.json()) as { symbol: string; price: string }[];
  const priceMap = new Map(prices.map((p) => [p.symbol, parseFloat(p.price)]));

  // Everything below is USD-equivalent VALUE, used only to compute percentages.
  // Neither the amounts nor these values are ever included in the API response.
  const valued: { asset: string; value: number; symbol: string | null }[] = [];
  for (const h of held) {
    if (STABLECOINS.has(h.asset)) {
      valued.push({ asset: h.asset, value: h.amount, symbol: null });
      continue;
    }
    const symbol = [`${h.asset}USDT`, `${h.asset}BUSD`, `${h.asset}USDC`].find((s) => priceMap.has(s));
    if (symbol) valued.push({ asset: h.asset, value: h.amount * priceMap.get(symbol)!, symbol });
    // Assets with no direct USD-quoted pair (e.g. some Earn/staking tokens) are skipped —
    // they're a small enough share for a personal portfolio snapshot to omit safely.
  }

  const total = valued.reduce((sum, v) => sum + v.value, 0);
  if (total <= 0) return [];

  valued.sort((a, b) => b.value - a.value);

  const TOP_N = 6;
  const top = valued.slice(0, TOP_N);
  const rest = valued.slice(TOP_N);
  const restValue = rest.reduce((sum, v) => sum + v.value, 0);

  // Batch-fetch 24h price change for the handful of symbols we're actually showing.
  const symbolsToQuery = top.map((v) => v.symbol).filter((s): s is string => Boolean(s));
  const changeMap = new Map<string, number>();
  if (symbolsToQuery.length > 0) {
    const symbolsParam = encodeURIComponent(JSON.stringify(symbolsToQuery));
    const changeRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsParam}&type=MINI`, {
      cache: 'no-store'
    });
    if (changeRes.ok) {
      const changes = (await changeRes.json()) as { symbol: string; openPrice: string; lastPrice: string }[];
      for (const c of changes) {
        const open = parseFloat(c.openPrice);
        const last = parseFloat(c.lastPrice);
        if (open > 0) changeMap.set(c.symbol, ((last - open) / open) * 100);
      }
    }
  }

  const allocations: Allocation[] = top
    .map((v) => ({
      asset: v.asset,
      percent: Math.round((v.value / total) * 1000) / 10,
      change: v.symbol
        ? changeMap.has(v.symbol)
          ? Math.round(changeMap.get(v.symbol)! * 100) / 100
          : null
        : 0 // stablecoins: pegged, treat as flat
    }))
    // Drop dust that rounds down to 0.0% — noise, not a real position.
    .filter((a) => a.percent > 0);

  const otherPercent = Math.round((restValue / total) * 1000) / 10;
  if (otherPercent > 0) {
    allocations.push({ asset: 'Other', percent: otherPercent, change: null });
  }

  return allocations;
}

export async function GET() {
  const db = getDb();

  const cached = db.prepare('SELECT data, updated_at FROM binance_portfolio_cache WHERE id = 1').get() as
    | { data: string; updated_at: string }
    | undefined;

  if (cached && Date.now() - new Date(cached.updated_at).getTime() < CACHE_TTL_MS) {
    return NextResponse.json({ available: true, allocations: JSON.parse(cached.data), updatedAt: cached.updated_at });
  }

  if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_API_SECRET) {
    return NextResponse.json({ available: false, reason: 'not_configured' });
  }

  try {
    const allocations = await fetchAllocations();
    const updatedAt = new Date().toISOString();

    db.prepare(
      'INSERT INTO binance_portfolio_cache (id, data, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
    ).run(JSON.stringify(allocations), updatedAt);

    return NextResponse.json({ available: true, allocations, updatedAt });
  } catch (err) {
    console.error('binance-portfolio fetch failed', err);
    // Serve a stale cache rather than nothing, if we have one.
    if (cached) {
      return NextResponse.json({ available: true, allocations: JSON.parse(cached.data), updatedAt: cached.updated_at, stale: true });
    }
    return NextResponse.json({ available: false, reason: 'error' });
  }
}
