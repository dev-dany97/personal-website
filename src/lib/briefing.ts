// Pure helpers for the Morning Briefing (/api/finance-briefing): sanitizing the
// model output, telling a real briefing from a refusal or an error text, and
// turning RSS headlines into a fallback source. Kept free of I/O so it can be tested.

import type { FeedItem } from './rss';

// The model is told to answer with exactly this when it has no current sources,
// instead of writing an apology that would end up on the page.
export const NO_BRIEFING = 'NO_BRIEFING';

const ALLOWED_TAGS = new Set(['p', 'ul', 'li', 'strong']);

// The briefing text is model-generated from web search results, so it's untrusted
// content even though we instruct the model to only use a small tag allowlist.
// Strip everything else (including all attributes) before it's ever stored or rendered.
export function sanitizeBriefingHtml(html: string): string {
  let out = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
  out = out.replace(/<\/?([a-zA-Z0-9]+)[^>]*>/g, (match, tagName: string) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return '';
    return match.startsWith('</') ? `</${tag}>` : `<${tag}>`;
  });
  out = out.trim();
  // Defensive: drop any stray narration text before the first real tag
  // (e.g. "I'll search for...") in case the model ignores the prompt instruction.
  const firstTag = out.search(/<(p|ul)>/);
  if (firstTag > 0) out = out.slice(firstTag);
  return out.trim();
}

// Phrases that only show up when the model explains why it can't write the
// briefing (search down, no sources, "please try again"), in German or English.
const REFUSAL_PATTERNS: RegExp[] = [
  /no_briefing/,
  /(websuche|web-suche|web search|internetsuche|suche)\b[^.]{0,60}(nicht verfügbar|nicht erreichbar|funktioniert (gerade |derzeit |aktuell )?nicht|ausgefallen|unavailable|not available|isn'?t working|is not working|is down)/,
  /(kann|könnte) ich (leider |heute |gerade |derzeit )*kein(e|en)?\b[^.]{0,40}(briefing|liefern|erstellen|schreiben)/,
  /\bi (can(no|')t|am unable to|'m unable to|was unable to|could not|couldn'?t) (provide|write|deliver|create|produce|generate|access|search)/,
  /versuchen sie es|versuch es (später|dann|noch)|bitte (später )?(noch einmal|erneut)|please try again|try again later/,
  /(aus dem gedächtnis|from memory)/,
  /(keine|ohne) aktuellen? (quellen|suchergebnisse)/,
  /\b(no|without) (current|up-to-date|recent) (sources|search results)/
];

function plainText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Decide whether text is a briefing worth publishing. A refusal or error text is
// never stored, so the page keeps showing the last good briefing instead.
export function checkBriefing(html: string): { ok: true } | { ok: false; reason: string } {
  const text = plainText(html).toLowerCase();
  if (!text) return { ok: false, reason: 'empty_response' };
  if (REFUSAL_PATTERNS.some((re) => re.test(text))) return { ok: false, reason: 'refusal' };
  // The prompt asks for a short list of events plus two paragraphs. A text
  // without that shape is not a briefing, whatever it says.
  const listItems = (html.match(/<li>/g) ?? []).length;
  const words = text.split(' ').length;
  if (listItems < 2 || words < 80) return { ok: false, reason: 'malformed' };
  return { ok: true };
}

type ResponseBlock = { type: string; content?: unknown };

// Count web search calls that returned results vs. failed (e.g. `unavailable`,
// `too_many_requests`). A briefing written without a single successful search is
// not grounded in today's news and must not be published.
export function webSearchStats(blocks: ResponseBlock[]): { ok: number; failed: number; errorCodes: string[] } {
  let ok = 0;
  let failed = 0;
  const errorCodes: string[] = [];
  for (const block of blocks) {
    if (block.type !== 'web_search_tool_result') continue;
    if (Array.isArray(block.content)) {
      if (block.content.length > 0) ok++;
      else failed++;
    } else {
      failed++;
      const code = (block.content as { error_code?: string } | undefined)?.error_code;
      if (code) errorCodes.push(code);
    }
  }
  return { ok, failed, errorCodes };
}

// Headlines from the last 36 hours, newest first, de-duplicated by title.
export function freshHeadlines(items: FeedItem[], now = Date.now(), maxAgeMs = 36 * 60 * 60 * 1000): FeedItem[] {
  const seen = new Set<string>();
  return items
    .filter((item) => item.publishedAt && now - new Date(item.publishedAt).getTime() <= maxAgeMs)
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
    .filter((item) => {
      const key = item.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

// Headlines are untrusted feed text: they go into the prompt as quoted data only.
export function headlinesBlock(items: FeedItem[]): string {
  return items.map((item) => `- [${item.publishedAt}] ${item.title.replace(/\s+/g, ' ')}`).join('\n');
}
