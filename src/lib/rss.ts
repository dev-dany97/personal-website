// Minimal RSS 2.0 parser for headline feeds: title, link and publication date
// only. Feed content is untrusted, so only plain text and http(s) links survive.

export interface FeedItem {
  title: string;
  link: string;
  publishedAt: string | null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeEntities(m[1]).replace(/<[^>]*>/g, '').trim() : '';
}

export function parseRss(xml: string, limit = 10): FeedItem[] {
  const items: FeedItem[] = [];
  for (const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const block = match[1];
    const title = tag(block, 'title');
    const link = tag(block, 'link');
    if (!title || !/^https?:\/\//i.test(link)) continue;
    const date = new Date(tag(block, 'pubDate'));
    items.push({ title, link, publishedAt: Number.isNaN(date.getTime()) ? null : date.toISOString() });
    if (items.length >= limit) break;
  }
  return items;
}
