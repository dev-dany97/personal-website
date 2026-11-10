import { describe, expect, it } from 'vitest';
import { checkBriefing, freshHeadlines, headlinesBlock, sanitizeBriefingHtml, webSearchStats } from './briefing';

// The text that was published on 07.11.2026 when web search was down.
const REFUSAL_DE =
  '<p>Für heute kann ich kein Morning Briefing liefern. Die Websuche ist gerade nicht verfügbar, und ohne aktuelle Quellen möchte ich keine Ereignisse oder Zahlen erfinden. Ein Briefing aus dem Gedächtnis wäre bei einem Tagesformat irreführend.</p><p>Sobald die Suche wieder funktioniert, schreibe ich es gern neu. Bitte versuchen Sie es dann noch einmal.</p>';

const REFUSAL_EN =
  "<p>I can't provide today's Morning Briefing because web search is currently unavailable. Please try again later.</p>";

const filler = 'Die Märkte reagieren darauf mit Vorsicht, weil Anleger auf neue Signale warten und Unsicherheit über den weiteren Kurs herrscht. ';
const BRIEFING_DE =
  '<ul><li><strong>EZB:</strong> Die Notenbank hält die Zinsen stabil und signalisiert Geduld.</li>' +
  '<li><strong>Ölpreis:</strong> Spannungen im Nahen Osten treiben die Energiepreise.</li></ul>' +
  `<p>${filler.repeat(5)}</p><p>In den nächsten Tagen lohnt der Blick auf die US-Inflationsdaten.</p>`;

describe('checkBriefing', () => {
  it('accepts a normal briefing', () => {
    expect(checkBriefing(BRIEFING_DE)).toEqual({ ok: true });
  });

  it('rejects the German refusal that was published', () => {
    expect(checkBriefing(REFUSAL_DE)).toEqual({ ok: false, reason: 'refusal' });
  });

  it('rejects an English refusal', () => {
    expect(checkBriefing(REFUSAL_EN)).toEqual({ ok: false, reason: 'refusal' });
  });

  it('rejects the NO_BRIEFING marker and empty output', () => {
    expect(checkBriefing('NO_BRIEFING').ok).toBe(false);
    expect(checkBriefing('')).toEqual({ ok: false, reason: 'empty_response' });
  });

  it('rejects text without the briefing structure', () => {
    expect(checkBriefing('<p>Kurzer Text ohne Liste.</p>')).toEqual({ ok: false, reason: 'malformed' });
  });
});

describe('sanitizeBriefingHtml', () => {
  it('keeps only allowed tags and drops narration before the first tag', () => {
    expect(sanitizeBriefingHtml('Let me search... <p class="x">Hi <a href="y">there</a><script>bad()</script></p>')).toBe('<p>Hi there</p>');
  });
});

describe('webSearchStats', () => {
  it('counts successful and failed searches', () => {
    const stats = webSearchStats([
      { type: 'server_tool_use' },
      { type: 'web_search_tool_result', content: { type: 'web_search_tool_result_error', error_code: 'unavailable' } },
      { type: 'web_search_tool_result', content: [{ type: 'web_search_result' }] },
      { type: 'web_search_tool_result', content: [] },
      { type: 'text' }
    ]);
    expect(stats).toEqual({ ok: 1, failed: 2, errorCodes: ['unavailable'] });
  });
});

describe('freshHeadlines', () => {
  it('keeps recent, dated, unique headlines, newest first', () => {
    const now = Date.parse('2026-11-07T12:00:00Z');
    const items = freshHeadlines(
      [
        { title: 'Alt', link: 'https://a', publishedAt: '2026-11-05T00:00:00.000Z' },
        { title: 'DAX steigt', link: 'https://b', publishedAt: '2026-11-07T08:00:00.000Z' },
        { title: 'dax steigt', link: 'https://c', publishedAt: '2026-11-07T07:00:00.000Z' },
        { title: 'Ohne Datum', link: 'https://d', publishedAt: null },
        { title: 'Fed hält Zinsen', link: 'https://e', publishedAt: '2026-11-07T10:00:00.000Z' }
      ],
      now
    );
    expect(items.map((i) => i.title)).toEqual(['Fed hält Zinsen', 'DAX steigt']);
    expect(headlinesBlock(items)).toBe('- [2026-11-07T10:00:00.000Z] Fed hält Zinsen\n- [2026-11-07T08:00:00.000Z] DAX steigt');
  });
});
