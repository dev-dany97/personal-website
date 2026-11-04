'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Lightbulb } from 'lucide-react';
import { SiteImage } from '@/app/components/SiteImage';

export interface FinanceRule {
  title: string;
  text: string;
}

export interface FinanceBook {
  title: string;
  image?: string;
  author: string;
  text: string;
}

export interface FinanceTrade {
  date: string;
  asset: string;
  side: 'long' | 'short';
  idea: string;
  result: number | null;
}

const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)' };

function SectionHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mb-4">
      <h3 className="fw-bold">{title}</h3>
      {lead && <p className="theme-text-soft mb-0">{lead}</p>}
    </div>
  );
}

export function TradingRules({ title, lead, rules }: { title: string; lead?: string; rules: FinanceRule[] }) {
  if (rules.length === 0) return null;
  return (
    <section className="py-5">
      <div className="container">
        <SectionHeader title={title} lead={lead} />
        <div className="row g-3">
          {rules.map((rule, i) => (
            <div key={rule.title} className="col-md-6 col-xl-4">
              <div className="card h-100 border-0 shadow-sm" style={cardStyle}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <span className="finance-rule-number">{i + 1}</span>
                    <span className="fw-semibold theme-text">{rule.title}</span>
                  </div>
                  <p className="theme-text-soft mb-0" style={{ fontSize: '0.9rem' }}>
                    {rule.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface WatchlistItem {
  symbol: string;
  name: string;
  kind: 'crypto' | 'stock';
  price: number;
  currency: string;
  change: number | null;
}

function formatPrice(price: number, currency: string, lang: 'en' | 'de') {
  try {
    return new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: price >= 1000 ? 0 : 2
    }).format(price);
  } catch {
    return price.toFixed(2);
  }
}

export function Watchlist({ lang, title, lead }: { lang: 'en' | 'de'; title: string; lead?: string }) {
  const [items, setItems] = useState<WatchlistItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/watchlist')
      .then((res) => res.json())
      .then((data: { available: boolean; items?: WatchlistItem[] }) => {
        if (data.available && data.items?.length) setItems(data.items);
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  return (
    <section className="py-5">
      <div className="container">
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
          <SectionHeader title={title} lead={lead} />
          <span className="portfolio-live-badge">
            <span className="portfolio-live-dot" /> Live
          </span>
        </div>
        {!items ? (
          <p className="theme-text-soft mb-0">…</p>
        ) : (
          <div className="row g-3">
            {items.map((item) => (
              <div key={item.symbol} className="col-6 col-md-4 col-xl-3">
                <div className="card h-100 border-0 shadow-sm" style={cardStyle}>
                  <div className="card-body p-3 p-lg-4">
                    <div className="d-flex align-items-baseline justify-content-between gap-2">
                      <span className="fw-semibold theme-text">{item.name}</span>
                      <span className="theme-text-soft" style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                        {item.symbol.replace('-USD', '')}
                      </span>
                    </div>
                    <div className="mt-2 fs-5 fw-bold theme-text">{formatPrice(item.price, item.currency, lang)}</div>
                    {item.change !== null && (
                      <div className={`portfolio-legend-change text-start ${item.change >= 0 ? 'up' : 'down'}`}>
                        {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

interface TickerItem {
  symbol: string;
  name: string;
  kind: string;
  price: number;
  currency: string;
  change: number | null;
}

function formatTickerPrice(item: TickerItem, lang: 'en' | 'de') {
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  if (item.kind === 'index') return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(item.price);
  if (item.kind === 'fx') return new Intl.NumberFormat(locale, { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(item.price);
  return formatPrice(item.price, item.currency, lang);
}

// Scrolling market band. The list is rendered twice so the CSS animation can
// loop seamlessly; the copy is hidden from screen readers.
export function MarketTicker({ lang }: { lang: 'en' | 'de' }) {
  const [items, setItems] = useState<TickerItem[] | null>(null);

  useEffect(() => {
    fetch('/api/market-ticker')
      .then((res) => res.json())
      .then((data: { available: boolean; items?: TickerItem[] }) => setItems(data.available && data.items ? data.items : []))
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  const row = (hidden: boolean) => (
    <ul className="market-ticker-row" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item.symbol} className="market-ticker-item">
          <span className="market-ticker-name">{item.name}</span>
          <span className="market-ticker-price">{formatTickerPrice(item, lang)}</span>
          {item.change !== null && (
            <span className={`market-ticker-change ${item.change >= 0 ? 'up' : 'down'}`}>
              {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
            </span>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="market-ticker" aria-label={lang === 'de' ? 'Börsen-Ticker' : 'Market ticker'}>
      <div className="market-ticker-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

interface NewsItem {
  title: string;
  link: string;
  publishedAt: string | null;
}

export function NewsTicker({ lang }: { lang: 'en' | 'de' }) {
  const [data, setData] = useState<{ items: NewsItem[]; source: string; sourceUrl: string } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/news-ticker')
      .then((res) => res.json())
      .then((d: { available: boolean; items?: NewsItem[]; source?: string; sourceUrl?: string }) => {
        if (d.available && d.items?.length) setData({ items: d.items, source: d.source ?? '', sourceUrl: d.sourceUrl ?? '' });
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed || !data) return null;
  const locale = lang === 'de' ? 'de-DE' : 'en-GB';
  const date = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' });
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm" style={cardStyle}>
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                  <h3 className="theme-text mb-0">{lang === 'de' ? 'News-Ticker' : 'News ticker'}</h3>
                  <span className="portfolio-live-badge">
                    <span className="portfolio-live-dot" /> Live
                  </span>
                </div>
                <ul className="news-ticker-list">
                  {data.items.map((item) => {
                    const d = item.publishedAt ? new Date(item.publishedAt) : null;
                    return (
                      <li key={item.link}>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-ticker-link">
                          {d && (
                            <span className="news-ticker-meta">
                              <span>{date.format(d)}</span>
                              <span>{time.format(d)}</span>
                            </span>
                          )}
                          <span className="news-ticker-title">{item.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
                {data.source && (
                  <p className="theme-text-soft mt-3 mb-0" style={{ fontSize: '0.78rem' }}>
                    {lang === 'de' ? 'Quelle' : 'Source'}:{' '}
                    <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="theme-accent">
                      {data.source}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TradeJournal({
  lang,
  title,
  lead,
  columns,
  trades
}: {
  lang: 'en' | 'de';
  title: string;
  lead?: string;
  columns: { date: string; asset: string; side: string; idea: string; result: string; open: string };
  trades: FinanceTrade[];
}) {
  // Hidden until real trades are entered in seed-data.ts.
  if (trades.length === 0) return null;
  const fmt = new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
  return (
    <section className="py-5">
      <div className="container">
        <SectionHeader title={title} lead={lead} />
        <div className="card border-0 shadow-sm" style={cardStyle}>
          <div className="table-responsive">
            <table className="table mb-0 finance-journal">
              <thead>
                <tr>
                  <th>{columns.date}</th>
                  <th>{columns.asset}</th>
                  <th>{columns.side}</th>
                  <th>{columns.idea}</th>
                  <th className="text-end">{columns.result}</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={`${t.date}-${t.asset}`}>
                    <td className="text-nowrap">{fmt.format(new Date(`${t.date}T00:00:00Z`))}</td>
                    <td className="fw-semibold">{t.asset}</td>
                    <td>
                      <span className={`finance-side ${t.side}`}>{t.side === 'long' ? 'Long' : 'Short'}</span>
                    </td>
                    <td>{t.idea}</td>
                    <td className="text-end text-nowrap">
                      {t.result === null ? (
                        <span className="theme-text-soft">{columns.open}</span>
                      ) : (
                        <span className={`portfolio-legend-change ${t.result >= 0 ? 'up' : 'down'}`}>
                          {t.result >= 0 ? '+' : '−'}
                          {Math.abs(t.result).toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LessonsLearned({ title, lessons }: { title: string; lessons: FinanceRule[] }) {
  if (lessons.length === 0) return null;
  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm" style={cardStyle}>
              <div className="card-body p-4 p-lg-5">
                <h3 className="mb-4 theme-text">{title}</h3>
                <div className="d-flex flex-column gap-4">
                  {lessons.map((lesson) => (
                    <div key={lesson.title} className="d-flex gap-3">
                      <Lightbulb size={22} className="theme-accent flex-shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <div className="fw-semibold theme-text">{lesson.title}</div>
                        <div className="theme-text-soft" style={{ fontSize: '0.92rem' }}>{lesson.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ReadingList({ title, lead, books }: { title: string; lead?: string; books: FinanceBook[] }) {
  if (books.length === 0) return null;
  return (
    <section className="pb-5">
      <div className="container">
        <SectionHeader title={title} lead={lead} />
        <div className="row g-3">
          {books.map((book) => (
            <div key={book.title} className="col-md-6 col-xl-4">
              <div className="card h-100 border-0 shadow-sm" style={cardStyle}>
                <div className="card-body p-4 d-flex gap-3">
                  {book.image ? (
                    <SiteImage src={book.image} alt={book.title} width={88} height={130} className="finance-book-cover" />
                  ) : (
                    <div className="finance-book-spine" aria-hidden="true">
                      <BookOpen size={20} />
                    </div>
                  )}
                  <div>
                    <div className="fw-semibold theme-text">{book.title}</div>
                    <div className="theme-accent mb-2" style={{ fontSize: '0.82rem' }}>{book.author}</div>
                    <p className="theme-text-soft mb-0" style={{ fontSize: '0.9rem' }}>{book.text}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

