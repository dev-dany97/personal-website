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
      'You are a seasoned Wall Street sell-side strategist writing a short daily "Morning Briefing" note for a personal finance page. Write with the voice, confidence and house style of an experienced market strategist at a major bank — precise, direct, fluent in market terminology, no hedging filler phrases. The reader is an active crypto day-trader who also takes targeted positions in individual stocks (not ETFs or index funds), so lead with intraday-relevant price action and volatility, not long-term index commentary. Use web search to find current, real information from today or the most recent trading session. Be concise, factual and specific (name real tickers, price levels, and percentage moves). Do not give personalized investment advice or buy/sell recommendations. Your final response message must contain ONLY the briefing itself as plain HTML using exclusively <p>, <ul>, <li> and <strong> tags — no headings, no markdown, no code fences, no <html>/<body> wrapper, and critically no preamble or narration of what you are doing (never write things like "I\'ll search for..." or "Let me look up..."). The very first characters of your response must be "<p>".',
    user:
      'Write today\'s finance morning briefing in English, in the voice of an experienced Wall Street strategist, for a reader who day-trades crypto and holds individual stock positions. Structure: one short paragraph on crypto market action (BTC/ETH price levels, volatility, volume), one short paragraph or list on notable individual stock movers and catalysts, one short paragraph on the broader market backdrop (major indices, for context only), and one closing sentence with a single practical risk-management takeaway. Keep the whole thing under 220 words.'
  },
  de: {
    system:
      'Du bist ein erfahrener Wall-Street-Stratege und schreibst ein kurzes tägliches "Morning Briefing" für eine private Finance-Seite. Schreibe mit der Stimme, Souveränität und dem Stil eines erfahrenen Markt-Strategen einer großen Bank — präzise, direkt, sicher in der Fachterminologie, keine unnötigen Weichspül-Floskeln. Die Leserschaft ist ein aktiver Krypto-Day-Trader, der zusätzlich gezielte Positionen in Einzelaktien hält (keine ETFs oder Indexfonds) — steig also mit intraday-relevanten Kursbewegungen und Volatilität ein statt mit langfristigem Index-Kommentar. Nutze die Websuche, um aktuelle, echte Informationen von heute oder der letzten Handelssitzung zu finden. Sei präzise, sachlich und konkret (nenne echte Ticker, Kursniveaus und Prozentbewegungen). Gib keine personalisierte Anlageberatung oder Kauf-/Verkaufsempfehlungen. Deine finale Antwort darf AUSSCHLIESSLICH das Briefing selbst enthalten, als reines HTML nur mit <p>, <ul>, <li> und <strong> Tags — keine Überschriften, kein Markdown, keine Codeblöcke, kein <html>/<body>-Wrapper, und vor allem keine Vorbemerkung oder Kommentierung deines Vorgehens (schreibe niemals Sätze wie "Ich suche jetzt nach..." oder "Lass mich recherchieren..."). Die ersten Zeichen deiner Antwort müssen exakt "<p>" sein.',
    user:
      'Schreibe das heutige Finance Morning Briefing auf Deutsch, in der Stimme eines erfahrenen Wall-Street-Strategen, für einen Leser, der Krypto day-tradet und Einzelaktienpositionen hält. Struktur: ein kurzer Absatz zur Kryptomarkt-Bewegung (BTC/ETH-Kursniveaus, Volatilität, Volumen), ein kurzer Absatz oder eine Liste zu auffälligen Einzelaktien-Bewegungen und deren Auslösern, ein kurzer Absatz zum breiteren Marktumfeld (wichtige Indizes, nur als Kontext), und ein Schlusssatz mit einer praktischen Erkenntnis zum Risikomanagement. Insgesamt unter 220 Wörter.'
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
type BriefingResult = { available: boolean; date: string; content?: string; generatedAt?: string; reason?: string };
const inFlight = new Map<string, Promise<BriefingResult>>();
const lastFailureAt = new Map<string, number>();
const attempts = new Map<string, number>();

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
    return NextResponse.json({ available: false, reason: 'not_configured' });
  }

  const key = `${date}:${lang}`;
  const running = inFlight.get(key);
  if (running) return NextResponse.json(await running);

  const failedAt = lastFailureAt.get(key);
  if ((failedAt && Date.now() - failedAt < RETRY_AFTER_FAILURE_MS) || (attempts.get(key) ?? 0) >= MAX_GENERATIONS_PER_DAY) {
    return NextResponse.json({ available: false, reason: 'unavailable' });
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
    return NextResponse.json(await job);
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
      model: 'claude-opus-5',
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
    console.error('finance-briefing generation failed', err);
    return { available: false, date, reason: 'error' };
  }
}
