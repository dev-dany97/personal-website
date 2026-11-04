'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, ExternalLink } from 'lucide-react';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { SiteImage } from '@/app/components/SiteImage';
import { ChartBackground } from '@/app/components/backgrounds/ChartBackground';
import {
  LessonsLearned,
  ReadingList,
  TradeJournal,
  TradingRules,
  Watchlist,
  type FinanceBook,
  type FinanceRule,
  type FinanceTrade
} from './sections';

interface FinancePlatform {
  name: string;
  url: string;
  description: string;
  affiliateUrl?: string | null;
}

interface FinanceContent {
  eyebrow: string;
  title: string;
  lead: string;
  tags: string[];
  stats: { label: string; value: string }[];
  strategyTitle: string;
  focusAreas: string[];
  platformsTitle: string;
  platformsLead: string;
  platforms: FinancePlatform[];
  credential?: { label: string; title: string; text: string };
  rulesTitle: string;
  rulesLead?: string;
  rules: FinanceRule[];
  watchlistTitle: string;
  watchlistLead?: string;
  journalTitle: string;
  journalLead?: string;
  journalColumns: { date: string; asset: string; side: string; idea: string; result: string; open: string };
  trades: FinanceTrade[];
  lessonsTitle: string;
  lessons: FinanceRule[];
  booksTitle: string;
  booksLead?: string;
  books: FinanceBook[];
  resourcesTitle: string;
  resourcesLead?: string;
  resourcesFocusLabel?: string;
  resources: FinanceResource[];
}

interface FinanceResource {
  name: string;
  url: string;
  category: string;
  image: string | null;
  description: string;
}

interface FinanceResponse {
  en: FinanceContent;
  de: FinanceContent;
}

export default function Finance() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'en';
  const [data, setData] = useState<FinanceResponse | null>(null);

  useEffect(() => {
    fetch('/api/finance')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <main style={{ minHeight: '100vh' }}>
        <Navbar currentPage="/finance" />
      </main>
    );
  }

  const c = data[lang];

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar currentPage="/finance" />

      <section className="py-5" style={{ position: 'relative', overflow: 'hidden' }}>
        <ChartBackground />
        <div className="container py-4" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <p className="text-uppercase theme-accent fw-semibold mb-3" style={{ letterSpacing: '0.15em', fontSize: '0.75rem' }}>
                {c.eyebrow}
              </p>
              <h1 className="display-4 fw-bold mb-4">{c.title}</h1>
              <p className="lead theme-text-soft mb-4">{c.lead}</p>

              <div className="d-flex flex-wrap gap-2 mb-5">
                {c.tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge rounded-pill border"
                    style={{
                      background: 'var(--card-bg)',
                      color: 'var(--text)',
                      borderColor: 'var(--card-border)',
                      padding: '0.6rem 0.9rem',
                      fontWeight: 500
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="col-lg-5">
              <div className="row g-3">
                {c.stats.map((stat) => (
                  <div key={stat.label} className="col-6">
                    <div className="card h-100 border-0 shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                      <div className="card-body p-4">
                        <div className="text-uppercase theme-text-soft" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                          {stat.label}
                        </div>
                        <div className="mt-2 fs-4 fw-bold theme-text">{stat.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {c.credential && (
                  <div className="col-12">
                    <div className="card border-0 shadow-sm finance-credential">
                      <div className="card-body p-4 d-flex align-items-center gap-3">
                        <div className="finance-credential-icon" aria-hidden="true">
                          <Award size={26} />
                        </div>
                        <div>
                          <div className="text-uppercase theme-accent fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                            {c.credential.label}
                          </div>
                          <div className="fs-5 fw-bold theme-text">{c.credential.title}</div>
                          <div className="theme-text-soft" style={{ fontSize: '0.88rem' }}>{c.credential.text}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <MorningBriefing lang={lang} />
      <PortfolioHistoryChart lang={lang} />
      <AllocationSection
        lang={lang}
        endpoint="/api/binance-portfolio"
        title={{ en: 'Crypto Allocation', de: 'Krypto-Allokation' }}
        changeLabel={{ en: '24h', de: '24h' }}
      />
      <AllocationSection
        lang={lang}
        endpoint="/api/stock-portfolio"
        title={{ en: 'Stock Allocation', de: 'Aktien-Allokation' }}
        changeLabel={{ en: 'since purchase', de: 'seit Kauf' }}
      />
      <Watchlist lang={lang} title={c.watchlistTitle} lead={c.watchlistLead} />

      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <div className="card-body p-4 p-lg-5">
                  <h3 className="mb-4 theme-text">{c.strategyTitle}</h3>
                  <ul className="list-group list-group-flush" style={{ background: 'transparent' }}>
                    {c.focusAreas.map((item) => (
                      <li
                        key={item}
                        className="list-group-item px-0 py-3 theme-text-soft"
                        style={{ background: 'transparent', borderColor: 'var(--card-border)' }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TradingRules title={c.rulesTitle} lead={c.rulesLead} rules={c.rules ?? []} />
      <TradeJournal lang={lang} title={c.journalTitle} lead={c.journalLead} columns={c.journalColumns} trades={c.trades ?? []} />
      <LessonsLearned title={c.lessonsTitle} lessons={c.lessons ?? []} />

      <section className="py-5">
        <div className="container">
          <div className="mb-4">
            <h3 className="fw-bold">{c.platformsTitle}</h3>
            <p className="theme-text-soft mb-0">{c.platformsLead}</p>
          </div>

          <div className="row g-3">
            {c.platforms.map((platform) => (
              <div key={platform.name} className="col-md-6 col-xl-4">
                <div
                  className="card h-100 border-0 shadow-sm"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', transition: 'all 0.2s ease' }}
                >
                  <div className="card-body p-4">
                    <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                      <div className="mb-2">
                        <span className="fw-semibold theme-text">{platform.name}</span>
                      </div>
                    </a>
                    <p className="theme-text-soft mb-0" style={{ fontSize: '0.9rem' }}>
                      {platform.description}
                    </p>
                    {platform.affiliateUrl && (
                      <a
                        href={platform.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="d-inline-block mt-2 fw-semibold theme-accent"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {lang === 'de' ? 'Jetzt starten' : 'Get started'}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          <div className="mb-4">
            <h3 className="fw-bold">{c.resourcesTitle}</h3>
            {c.resourcesLead && <p className="theme-text-soft mb-0">{c.resourcesLead}</p>}
          </div>

          {Array.from(new Set(c.resources.map((r) => r.category))).map((category) => (
            <div key={category} className="mb-4">
              <h5 className="theme-text-soft mb-3" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {category}
              </h5>
              <div className="row g-3">
                {c.resources
                  .filter((r) => r.category === category)
                  .map((resource) => (
                    <div key={resource.name} className="col-md-6 col-xl-4">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                        <div className="card h-100 border-0 shadow-sm finance-resource-card">
                          {resource.image && (
                            <SiteImage
                              src={resource.image}
                              alt=""
                              // Logos sit on white and are shown whole; podcast covers fill the frame.
                              className={`finance-resource-image${resource.image.includes('/logos/') ? ' is-logo' : ''}`}
                              width={640}
                              height={360}
                              sizes="(max-width: 768px) 100vw, 400px"
                            />
                          )}
                          <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                              <span className="fw-semibold theme-text">{resource.name}</span>
                              <ExternalLink size={15} className="theme-text-soft flex-shrink-0" aria-hidden="true" />
                            </div>
                            {resource.description && (
                              <p className="theme-text-soft mb-0" style={{ fontSize: '0.9rem' }}>
                                {resource.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ReadingList title={c.booksTitle} lead={c.booksLead} books={c.books ?? []} />

      <Footer />
    </main>
  );
}

interface BriefingResponse {
  available: boolean;
  date?: string;
  generatedAt?: string;
  content?: string;
  stale?: boolean;
}

const BRIEFING_TEXT = {
  en: {
    title: 'Morning Briefing',
    stale: 'Latest briefing',
    disclaimer: 'Automatically generated based on current market news. This is not financial advice!'
  },
  de: {
    title: 'Morning Briefing',
    stale: 'Letztes Briefing',
    disclaimer: 'Automatisch generiert auf Basis aktueller Börsennachrichten. Dies ist keine Anlageberatung!'
  }
};

function formatBriefingTimestamp(generatedAt: string | undefined, lang: 'en' | 'de'): string {
  if (!generatedAt) return '';
  const d = new Date(generatedAt);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-GB', {
    timeZone: 'Europe/Berlin',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

function MorningBriefing({ lang }: { lang: 'en' | 'de' }) {
  // Keyed by language: after a switch the old briefing is hidden right away
  // instead of being reset inside the effect.
  const [loaded, setLoaded] = useState<{ lang: 'en' | 'de'; data: BriefingResponse } | null>(null);
  const briefing = loaded?.lang === lang ? loaded.data : null;
  const t = BRIEFING_TEXT[lang];

  useEffect(() => {
    fetch(`/api/finance-briefing?lang=${lang}`)
      .then((res) => res.json())
      .then((data: BriefingResponse) => setLoaded({ lang, data }))
      .catch(() => setLoaded({ lang, data: { available: false } }));
  }, [lang]);

  if (briefing && !briefing.available) return null;

  const timestamp = formatBriefingTimestamp(briefing?.generatedAt, lang);

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-4">
                  <h3 className="theme-text mb-0">{t.title}</h3>
                  <div className="d-flex align-items-center gap-2">
                    {briefing?.stale && <span className="briefing-stale-note">{t.stale}</span>}
                    {timestamp && <span className="theme-text-soft" style={{ fontSize: '0.85rem' }}>{timestamp}</span>}
                  </div>
                </div>

                {!briefing ? (
                  <p className="theme-text-soft mb-0">…</p>
                ) : (
                  <>
                    <div className="briefing-content theme-text-soft" dangerouslySetInnerHTML={{ __html: briefing.content ?? '' }} />
                    <p className="theme-text-soft mt-3 mb-0" style={{ fontSize: '0.78rem', fontStyle: 'italic', opacity: 0.75 }}>
                      {t.disclaimer}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface Allocation {
  asset: string;
  percent: number;
  change: number | null;
}

interface PortfolioResponse {
  available: boolean;
  allocations?: Allocation[];
  updatedAt?: string;
}

const LIVE_TEXT = { en: 'Live', de: 'Live' };

const ALLOCATION_COLORS = ['#4fb9ad', '#e0a93d', '#7fa8e0', '#c47fe0', '#e07a7a', '#7fe0a0', '#a0a0a0'];

function DonutChart({
  allocations,
  active,
  onActiveChange
}: {
  allocations: Allocation[];
  active: number | null;
  onActiveChange: (i: number | null) => void;
}) {
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGrown(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const size = 220;
  const radius = 80;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  const lengths = allocations.map((a) => (a.percent / 100) * circumference);
  const segments = allocations.map((a, i) => ({
    asset: a.asset,
    offset: lengths.slice(0, i).reduce((sum, l) => sum + l, 0),
    length: lengths[i],
    color: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]
  }));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-soft)" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => (
          <circle
            key={seg.asset}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={active === i ? strokeWidth + 6 : strokeWidth}
            strokeDasharray={grown ? `${seg.length} ${circumference - seg.length}` : `0 ${circumference}`}
            strokeDashoffset={-seg.offset}
            style={{
              transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1), stroke-width 0.2s ease, opacity 0.2s ease',
              opacity: active === null || active === i ? 1 : 0.4,
              cursor: 'pointer',
              filter: active === i ? `drop-shadow(0 0 6px ${seg.color})` : 'none'
            }}
            onMouseEnter={() => onActiveChange(i)}
            onMouseLeave={() => onActiveChange(null)}
          />
        ))}
      </g>
    </svg>
  );
}

function AllocationSection({
  lang,
  endpoint,
  title,
  changeLabel
}: {
  lang: 'en' | 'de';
  endpoint: string;
  title: { en: string; de: string };
  changeLabel: { en: string; de: string };
}) {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then(setPortfolio)
      .catch(() => setPortfolio({ available: false }));
  }, [endpoint]);

  if (portfolio && !portfolio.available) return null;
  if (portfolio && (!portfolio.allocations || portfolio.allocations.length === 0)) return null;

  const allocations = portfolio?.allocations ?? [];
  const displayed = active !== null ? allocations[active] : allocations[0];

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
                  <h3 className="theme-text mb-0">{title[lang]}</h3>
                  <span className="portfolio-live-badge">
                    <span className="portfolio-live-dot" /> {LIVE_TEXT[lang]}
                  </span>
                </div>

                {!portfolio ? (
                  <p className="theme-text-soft mb-0">…</p>
                ) : (
                  <div className="d-flex flex-wrap align-items-center justify-content-center gap-5">
                    <div className="portfolio-donut-wrap">
                      <DonutChart allocations={allocations} active={active} onActiveChange={setActive} />
                      {displayed && (
                        <div className="portfolio-donut-center">
                          <div className="portfolio-donut-asset">{displayed.asset}</div>
                          <div className="portfolio-donut-percent">{displayed.percent}%</div>
                          {displayed.change !== null && (
                            <div className={`portfolio-donut-change ${displayed.change >= 0 ? 'up' : 'down'}`}>
                              {displayed.change >= 0 ? '▲' : '▼'} {Math.abs(displayed.change).toFixed(2)}% <span style={{ opacity: 0.7 }}>{changeLabel[lang]}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="portfolio-legend">
                      {allocations.map((a, i) => (
                        <div
                          key={a.asset}
                          className={`portfolio-legend-row ${active === i ? 'active' : ''}`}
                          onMouseEnter={() => setActive(i)}
                          onMouseLeave={() => setActive(null)}
                        >
                          <span className="portfolio-legend-dot" style={{ background: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }} />
                          <span className="portfolio-legend-asset theme-text">{a.asset}</span>
                          <span className="portfolio-legend-percent theme-text-soft">{a.percent}%</span>
                          {a.change !== null ? (
                            <span className={`portfolio-legend-change ${a.change >= 0 ? 'up' : 'down'}`}>
                              {a.change >= 0 ? '▲' : '▼'} {Math.abs(a.change).toFixed(2)}%
                            </span>
                          ) : (
                            <span className="portfolio-legend-change" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface HistoryResponse {
  available: boolean;
  history?: { date: string; index: number }[];
  markers?: { date: string; label: string }[];
  updatedAt?: string;
}

const HISTORY_TEXT = {
  en: { title: 'Total Wealth', live: 'Live' },
  de: { title: 'Gesamtvermögen', live: 'Live' }
};

function formatAxisDate(date: string, lang: 'en' | 'de'): string {
  const d = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-GB', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(d);
}

function PortfolioHistoryChart({ lang }: { lang: 'en' | 'de' }) {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const t = HISTORY_TEXT[lang];

  useEffect(() => {
    fetch('/api/portfolio-history')
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData({ available: false }));
  }, []);

  if (data && !data.available) return null;
  const history = data?.history ?? [];
  if (data && history.length === 0) return null;

  const width = 760;
  const height = 220;
  const padding = 8;

  const values = history.map((h) => h.index);
  const min = Math.min(...values, 100);
  const max = Math.max(...values, 100);
  const span = max - min || 1;

  const points = history.map((h, i) => {
    const x = (i / Math.max(history.length - 1, 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((h.index - min) / span) * (height - padding * 2);
    return { x, y, ...h };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x.toFixed(1)} ${height - padding} L ${points[0]?.x.toFixed(1)} ${height - padding} Z`;

  const active = hover !== null ? points[hover] : points[points.length - 1];
  const isUp = active ? active.index >= 100 : true;
  const color = isUp ? '#4fb9ad' : '#e07a7a';

  const markers = (data?.markers ?? []).map((m) => {
    let closestIdx = 0;
    let closestDiff = Infinity;
    points.forEach((p, i) => {
      const diff = Math.abs(new Date(p.date).getTime() - new Date(m.date).getTime());
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIdx = i;
      }
    });
    return { ...m, x: points[closestIdx]?.x ?? 0 };
  });

  const axisTickCount = 5;
  const axisTicks = Array.from({ length: axisTickCount }, (_, i) => {
    const idx = Math.round((i / (axisTickCount - 1)) * (history.length - 1));
    return { x: points[idx]?.x ?? 0, label: history[idx] ? formatAxisDate(history[idx].date, lang) : '' };
  });

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-1">
                  <h3 className="theme-text mb-0">{t.title}</h3>
                  <span className="portfolio-live-badge">
                    <span className="portfolio-live-dot" /> {t.live}
                  </span>
                </div>

                {!data ? (
                  <p className="theme-text-soft mb-0 mt-4">…</p>
                ) : (
                  <>
                    {active && (
                      <div className="mt-3 mb-2">
                        <span className="fs-2 fw-bold theme-text">{active.index.toFixed(1)}%</span>
                        <span className="theme-text-soft ms-2" style={{ fontSize: '0.85rem' }}>
                          {hover !== null ? active.date : lang === 'de' ? 'heute' : 'today'}
                        </span>
                      </div>
                    )}
                    <svg
                      viewBox={`0 0 ${width} ${height}`}
                      style={{ width: '100%', height: 'auto', overflow: 'visible', cursor: 'crosshair' }}
                      onMouseLeave={() => setHover(null)}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = (e.clientX - rect.left) / rect.width;
                        const idx = Math.round(ratio * (points.length - 1));
                        if (idx >= 0 && idx < points.length) setHover(idx);
                      }}
                    >
                      <defs>
                        <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                          <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <line x1={padding} y1={height - padding - ((100 - min) / span) * (height - padding * 2)} x2={width - padding} y2={height - padding - ((100 - min) / span) * (height - padding * 2)} stroke="var(--card-border)" strokeWidth={1} strokeDasharray="4 4" />
                      <path d={areaPath} fill="url(#historyGradient)" />
                      <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                      {hover !== null && points[hover] && (
                        <line x1={points[hover].x} y1={padding} x2={points[hover].x} y2={height - padding} stroke="var(--card-border)" strokeWidth={1} />
                      )}
                      {active && <circle cx={active.x} cy={active.y} r={4.5} fill={color} stroke="var(--card-bg)" strokeWidth={2} />}
                      {markers.map((m) => (
                        <g key={m.label}>
                          <line x1={m.x} y1={height - padding} x2={m.x} y2={height - padding + 6} stroke="#e0a93d" strokeWidth={2} />
                          <circle cx={m.x} cy={height - padding} r={3} fill="#e0a93d">
                            <title>{m.label} · {m.date}</title>
                          </circle>
                        </g>
                      ))}
                    </svg>
                    <div className="d-flex justify-content-between mt-2">
                      {axisTicks.map((tick, i) => (
                        <span key={i} className="theme-text-soft" style={{ fontSize: '0.72rem' }}>
                          {tick.label}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
