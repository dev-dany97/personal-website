import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { parseRss } from '@/lib/rss';

export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 10 * 60 * 1000;

// Public RSS feed for the headline ticker on /finance. Only headlines and links
// are shown, every entry links to the original article.
const FEED = {
  url: 'https://www.tagesschau.de/wirtschaft/index~rss2.xml',
  source: 'tagesschau.de',
  sourceUrl: 'https://www.tagesschau.de/wirtschaft'
};

export async function GET() {
  const db = getDb();
  const cached = db.prepare('SELECT data, updated_at FROM market_quote_cache WHERE key = ?').get('news') as
    | { data: string; updated_at: string }
    | undefined;
  const meta = { source: FEED.source, sourceUrl: FEED.sourceUrl };

  if (cached && Date.now() - new Date(cached.updated_at).getTime() < CACHE_TTL_MS) {
    return NextResponse.json({ available: true, items: JSON.parse(cached.data), updatedAt: cached.updated_at, ...meta });
  }

  try {
    const res = await fetch(FEED.url, { cache: 'no-store', headers: { 'User-Agent': 'd-mohles.de news ticker' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = parseRss(await res.text(), 8);
    if (items.length === 0) throw new Error('empty feed');
    const updatedAt = new Date().toISOString();
    db.prepare(
      'INSERT INTO market_quote_cache (key, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
    ).run('news', JSON.stringify(items), updatedAt);
    return NextResponse.json({ available: true, items, updatedAt, ...meta });
  } catch (err) {
    console.error('news-ticker fetch failed', err);
    if (cached) return NextResponse.json({ available: true, items: JSON.parse(cached.data), updatedAt: cached.updated_at, stale: true, ...meta });
    return NextResponse.json({ available: false, reason: 'error' });
  }
}
