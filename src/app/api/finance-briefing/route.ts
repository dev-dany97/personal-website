import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

function todayBerlin(): string {
  // Use Europe/Berlin so the briefing rolls over at German local midnight, not UTC.
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });
  return fmt.format(new Date()); // en-CA gives YYYY-MM-DD
}

const PROMPTS: Record<'en' | 'de', { system: string; user: string }> = {
  en: {
    system:
      "You write a short daily \"Morning Briefing\" for a personal finance page. Think like an experienced macro analyst, but write in plain, everyday language that anyone can follow. Your job is to explain what is happening in the world and why it matters for markets: geopolitics, central banks and interest rates, the economy, politics, energy and major company news. Always explain cause and effect (what happened, why it matters, what it could mean next). Keep numbers to a minimum: at most two or three figures in the whole briefing, and only where they really help. No lists of prices or percentage moves, no jargon without a short explanation. Use web search to find current, real information from today or the last trading day. Stay factual and balanced. Do not give personalized investment advice or buy/sell recommendations. Your final response message must contain ONLY the briefing itself as plain HTML using exclusively <p>, <ul>, <li> and <strong> tags — no headings, no markdown, no code fences, no <html>/<body> wrapper, and critically no preamble or narration of what you are doing (never write things like \"I'll search for...\" or \"Let me look up...\"). The very first characters of your response must be \"<p>\".",
    user:
      "Write today's Morning Briefing in English. Structure: 1) the two or three most important world events right now and why they matter for markets, as a short list; 2) one short paragraph on what this means for stocks and for crypto; 3) one sentence on what to watch in the coming days. Plain language, few numbers, under 250 words."
  },
  de: {
    system:
      "Du schreibst ein kurzes tägliches \"Morning Briefing\" für eine private Finanz-Seite. Denk wie ein erfahrener Makro-Analyst, aber schreib in einfacher, verständlicher Sprache, der jeder folgen kann. Deine Aufgabe ist es, das Weltgeschehen einzuordnen und zu erklären, warum es für die Märkte wichtig ist: Geopolitik, Notenbanken und Zinsen, Konjunktur, Politik, Energie und große Unternehmensnachrichten. Erkläre immer Ursache und Wirkung (was ist passiert, warum ist das wichtig, was könnte als Nächstes kommen). Halte Zahlen knapp: höchstens zwei bis drei Werte im ganzen Briefing und nur dort, wo sie wirklich helfen. Keine Aufzählungen von Kursen oder Prozentbewegungen, kein Fachjargon ohne kurze Erklärung. Nutze die Websuche, um aktuelle, echte Informationen von heute oder dem letzten Handelstag zu finden. Bleib sachlich und ausgewogen. Gib keine personalisierte Anlageberatung oder Kauf-/Verkaufsempfehlungen. Deine finale Antwort darf AUSSCHLIESSLICH das Briefing selbst enthalten, als reines HTML nur mit <p>, <ul>, <li> und <strong> Tags — keine Überschriften, kein Markdown, keine Codeblöcke, kein <html>/<body>-Wrapper, und vor allem keine Vorbemerkung oder Kommentierung deines Vorgehens (schreibe niemals Sätze wie \"Ich suche jetzt nach...\" oder \"Lass mich recherchieren...\"). Die ersten Zeichen deiner Antwort müssen exakt \"<p>\" sein.",
    user:
      "Schreibe das heutige Morning Briefing auf Deutsch. Aufbau: 1) die zwei bis drei wichtigsten Ereignisse im Weltgeschehen und warum sie für die Märkte zählen, als kurze Liste; 2) ein kurzer Absatz, was das für Aktien und für Krypto bedeutet; 3) ein Satz, worauf man in den nächsten Tagen achten sollte. Einfache Sprache, wenige Zahlen, unter 250 Wörter."
  }
};

const ALLOWED_TAGS = new Set(['p', 'ul', 'li', 'strong']);

// The briefing text is model-generated from web search results, so it's untrusted
// content even though we instruct the model to only use a small tag allowlist.
// Strip everything else (including all attributes) before it's ever stored or rendered.
function sanitizeBriefingHtml(html: string): string {
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

// Generating a briefing calls a paid model with web search, so a cache miss must
// never turn into one paid call per visitor. Concurrent misses share one
// in-flight generation, a failure blocks retries for a while, and there is a
// hard daily cap per language. State is in memory: this runs as one process.
const RETRY_AFTER_FAILURE_MS = 15 * 60 * 1000;
const MAX_GENERATIONS_PER_DAY = 3;
type BriefingResult = {
  available: boolean;
  date: string;
  content?: string;
  generatedAt?: string;
  reason?: string;
  stale?: boolean;
};
const inFlight = new Map<string, Promise<BriefingResult>>();
const lastFailureAt = new Map<string, number>();
const attempts = new Map<string, number>();

// When today's briefing can't be generated (no API key, no credits left, an
// outage, the daily cap), show the most recent stored one instead of hiding the
// section. It is flagged as stale so the page can label it with its date.
function withFallback(lang: 'en' | 'de', result: BriefingResult): BriefingResult {
  if (result.available) return result;
  const latest = getDb()
    .prepare('SELECT briefing_date, content, generated_at FROM finance_briefings WHERE lang = ? ORDER BY briefing_date DESC LIMIT 1')
    .get(lang) as { briefing_date: string; content: string; generated_at: string } | undefined;
  if (!latest) return result;
  return {
    available: true,
    stale: true,
    date: latest.briefing_date,
    content: latest.content,
    generatedAt: latest.generated_at,
    reason: result.reason
  };
}

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') === 'de' ? 'de' : 'en';
  const date = todayBerlin();
  const db = getDb();

  const cached = db
    .prepare('SELECT content, generated_at FROM finance_briefings WHERE briefing_date = ? AND lang = ?')
    .get(date, lang) as { content: string; generated_at: string } | undefined;

  if (cached) {
    return NextResponse.json({ available: true, date, content: cached.content, generatedAt: cached.generated_at });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(withFallback(lang, { available: false, date, reason: 'not_configured' }));
  }

  const key = `${date}:${lang}`;
  const running = inFlight.get(key);
  if (running) return NextResponse.json(withFallback(lang, await running));

  const failedAt = lastFailureAt.get(key);
  if ((failedAt && Date.now() - failedAt < RETRY_AFTER_FAILURE_MS) || (attempts.get(key) ?? 0) >= MAX_GENERATIONS_PER_DAY) {
    return NextResponse.json(withFallback(lang, { available: false, date, reason: 'unavailable' }));
  }

  attempts.set(key, (attempts.get(key) ?? 0) + 1);
  // Drop counters from previous days so the maps stay small.
  for (const k of attempts.keys()) if (!k.startsWith(date)) attempts.delete(k);
  for (const k of lastFailureAt.keys()) if (!k.startsWith(date)) lastFailureAt.delete(k);

  const job = generateBriefing(lang, date).then((result) => {
    if (!result.available) lastFailureAt.set(key, Date.now());
    return result;
  });
  inFlight.set(key, job);
  try {
    return NextResponse.json(withFallback(lang, await job));
  } finally {
    inFlight.delete(key);
  }
}

async function generateBriefing(lang: 'en' | 'de', date: string): Promise<BriefingResult> {
  const db = getDb();
  try {
    const client = new Anthropic();
    const prompt = PROMPTS[lang];

    const response = await client.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 8000,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
      tools: [
        { type: 'web_search_20260209', name: 'web_search', max_uses: 4 } satisfies Anthropic.WebSearchTool20260209
      ]
    });

    if (response.stop_reason === 'max_tokens') {
      console.error('finance-briefing hit max_tokens, discarding truncated output');
      return { available: false, date, reason: 'truncated' };
    }

    const rawHtml = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    const html = sanitizeBriefingHtml(rawHtml);

    if (!html) {
      return { available: false, date, reason: 'empty_response' };
    }

    const generatedAt = new Date().toISOString();
    db.prepare(
      'INSERT OR REPLACE INTO finance_briefings (briefing_date, lang, content, generated_at) VALUES (?, ?, ?, ?)'
    ).run(date, lang, html, generatedAt);

    return { available: true, date, content: html, generatedAt };
  } catch (err) {
    // An empty prepaid balance comes back as a 400 whose message mentions the
    // credit balance. Name it in the log so it is easy to spot on the server.
    const noCredits = err instanceof Anthropic.APIError && /credit balance/i.test(err.message);
    console.error(noCredits ? 'finance-briefing: Anthropic credit balance is empty' : 'finance-briefing generation failed', err);
    return { available: false, date, reason: noCredits ? 'no_credits' : 'error' };
  }
}
