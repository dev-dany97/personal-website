import { describe, expect, it } from 'vitest';
import { parseRss } from './rss';

const xml = `<?xml version="1.0"?><rss><channel>
<item><title><![CDATA[DAX schließt im Plus & Gold steigt]]></title><link>https://example.com/a</link><pubDate>Wed, 04 Nov 2026 13:05:00 +0100</pubDate></item>
<item><title>Bad link</title><link>javascript:alert(1)</link></item>
<item><title>Ohne Datum &amp; mit <b>HTML</b></title><link>https://example.com/b</link></item>
</channel></rss>`;

describe('parseRss', () => {
  it('reads title, link and date and drops unsafe links', () => {
    const items = parseRss(xml);
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ title: 'DAX schließt im Plus & Gold steigt', link: 'https://example.com/a', publishedAt: '2026-11-04T12:05:00.000Z' });
    expect(items[1]).toEqual({ title: 'Ohne Datum & mit HTML', link: 'https://example.com/b', publishedAt: null });
  });

  it('respects the limit', () => {
    expect(parseRss(xml, 1)).toHaveLength(1);
  });
});
