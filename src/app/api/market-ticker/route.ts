import { NextResponse } from 'next/server';
import { getQuotes, type QuoteSpec } from '@/lib/market-quotes';

export const dynamic = 'force-dynamic';

// Broad market overview for the scrolling ticker band on /finance.
const TICKER: QuoteSpec[] = [
  { symbol: '^GDAXI', name: 'DAX', kind: 'index' },
  { symbol: '^STOXX50E', name: 'Euro Stoxx 50', kind: 'index' },
  { symbol: '^GSPC', name: 'S&P 500', kind: 'index' },
  { symbol: '^IXIC', name: 'Nasdaq', kind: 'index' },
  { symbol: '^N225', name: 'Nikkei 225', kind: 'index' },
  { symbol: 'EURUSD=X', name: 'EUR/USD', kind: 'fx' },
  { symbol: 'GC=F', name: 'Gold', kind: 'commodity' },
  { symbol: 'BZ=F', name: 'Brent', kind: 'commodity' },
  { symbol: 'BTC-USD', name: 'Bitcoin', kind: 'crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', kind: 'crypto' }
];

export async function GET() {
  return NextResponse.json(await getQuotes('ticker', TICKER));
}
