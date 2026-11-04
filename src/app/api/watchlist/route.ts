import { NextResponse } from 'next/server';
import { getQuotes, type QuoteSpec } from '@/lib/market-quotes';

export const dynamic = 'force-dynamic';

// Symbols on Daniel's watchlist (Yahoo Finance tickers).
const WATCHLIST: QuoteSpec[] = [
  { symbol: 'BTC-USD', name: 'Bitcoin', kind: 'crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', kind: 'crypto' },
  { symbol: 'SOL-USD', name: 'Solana', kind: 'crypto' },
  { symbol: 'NVDA', name: 'Nvidia', kind: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft', kind: 'stock' },
  { symbol: 'TSLA', name: 'Tesla', kind: 'stock' },
  { symbol: 'SAP.DE', name: 'SAP', kind: 'stock' },
  { symbol: 'RHM.DE', name: 'Rheinmetall', kind: 'stock' }
];

export async function GET() {
  return NextResponse.json(await getQuotes('watchlist', WATCHLIST));
}
