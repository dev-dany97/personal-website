'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { Reveal } from '@/app/components/Reveal';
import { AutoplayVideo } from '@/app/components/AutoplayVideo';
import { Code2, ShipWheel, Map, Lightbulb, ArrowRight, type LucideIcon } from 'lucide-react';
import { SiteImage } from '@/app/components/SiteImage';
import { useMediaQuery } from '@/app/components/useBrowserState';

interface AerialShot {
  title: string;
  image: string;
  hoverVideo: string | null;
  location: string;
  year: number | null;
  description: string;
}

interface HomeVideo {
  src: string;
  title: string;
  location: string;
  year: number | null;
  description: string;
}

interface AboutSectionImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}

interface AboutSection {
  heading: string;
  image: string;
  // Further pictures stacked below the main one, each with a short caption.
  extraImages?: AboutSectionImage[];
  // A paragraph starting with "> " is shown as a highlighted quote (e.g. my motto).
  paragraphs: string[];
}

interface HomeStat {
  icon: 'code' | 'sailing' | 'globe' | 'idea';
  value: string;
  label: string;
}

// Start years for the "x years" mentions in the about texts and stats.
const CODING_START_YEAR = 2019;
const SAILING_START_YEAR = 2021;

const NUMBER_WORDS: Record<'de' | 'en', string[]> = {
  de: ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'],
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
};

function numberWord(n: number, lang: 'de' | 'en') {
  return NUMBER_WORDS[lang][n] ?? String(n);
}

const STAT_ICONS: Record<HomeStat['icon'], LucideIcon> = {
  code: Code2,
  sailing: ShipWheel,
  globe: Map,
  idea: Lightbulb
};

interface HomeContent {
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroCta: string;
  aboutHeading: string;
  aboutTags: string[];
  aboutIntro: string[];
  aboutMoreLabel: string;
  aboutLessLabel: string;
  aboutSections: AboutSection[];
  aerialEyebrow: string;
  aerialTitle: string;
  aerialLead: string;
  aerialShots: AerialShot[];
  videos: HomeVideo[];
  stats: HomeStat[];
}

type HomeResponse = Record<'en' | 'de', HomeContent>;

// Renders `[label](href)` markdown-style links within otherwise plain text.
function renderWithLinks(text: string, keyPrefix: string) {
  const parts = text.split(/\[([^\]]+)\]\(([^)]+)\)/);
  return parts.map((part, i) => {
    if (i % 3 === 1) {
      const href = parts[i + 1];
      return (
        <Link key={`${keyPrefix}-${i}`} href={href} className="legacy-about-link">
          {part}
        </Link>
      );
    }
    if (i % 3 === 2) return null;
    return part;
  });
}

function shotCaption(location: string, year: number | null) {
  return `Shot on DJI Mavic 3 · ${location}${year ? ` · ${year}` : ''}`;
}

function AerialShotCard({ shot }: { shot: AerialShot }) {
  const [hovering, setHovering] = useState(false);
  // Phones and tablets have no hover, so there the clip plays on its own
  // whenever the card is on screen.
  const touchOnly = useMediaQuery('(hover: none)');

  return (
    <div className="legacy-aerial-card" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
      <div className="legacy-aerial-media">
        <SiteImage src={shot.image} alt={shot.title} width={1200} height={800} sizes="(max-width: 768px) 100vw, 50vw" />
        {shot.hoverVideo && (hovering || touchOnly) && (
          <AutoplayVideo className="legacy-aerial-hover-video" src={shot.hoverVideo} />
        )}
      </div>
      <div className="legacy-aerial-card-body">
        <h4>{shot.title}</h4>
        <p className="legacy-aerial-caption">{shotCaption(shot.location, shot.year)}</p>
        {shot.description.split('\n\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'en';
  const [data, setData] = useState<HomeResponse | null>(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);

  useEffect(() => {
    fetch('/api/home')
      .then((res) => res.json())
      .then(setData);
  }, []);

  const birthDate = new Date('1997-03-28');
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassedThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  const currentAge = hasBirthdayPassedThisYear ? age : age - 1;

  if (!data) {
    return (
      <main className="legacy-home">
        <Navbar currentPage="/" />
      </main>
    );
  }

  const c = data[lang];
  const aboutIntro = c.aboutIntro.map((p) => p.replace('{age}', String(currentAge)));

  // Years since I started coding / sailing, so the texts and stats don't need
  // a manual update every year. Prose spells small numbers out ("fünf Jahren"),
  // the stats bar shows digits.
  const codingYears = today.getFullYear() - CODING_START_YEAR;
  const sailingYears = today.getFullYear() - SAILING_START_YEAR;
  const fillYears = (text: string, asWords: boolean) =>
    text
      .replaceAll('{codingYears}', asWords ? numberWord(codingYears, lang) : String(codingYears))
      .replaceAll('{sailingYears}', asWords ? numberWord(sailingYears, lang) : String(sailingYears));
  const aboutSections = c.aboutSections.map((section) => ({
    ...section,
    paragraphs: section.paragraphs.map((p) => fillYears(p, true))
  }));
  const stats = c.stats.map((stat) => ({ ...stat, value: fillYears(stat.value, false) }));

  return (
    <main className="legacy-home">
      <Navbar currentPage="/" />

      <section className="legacy-hero">
        <div className="container legacy-hero-inner text-center">
          <h1 className="legacy-title">{c.heroTitle1}<br />{c.heroTitle2}</h1>
          <p className="legacy-subtitle">{c.heroSubtitle}</p>
          <Link href="#about" className="btn legacy-cta">
            {c.heroCta.toUpperCase()}
          </Link>
        </div>
      </section>

      <section id="about" className="legacy-about">
        <div className="container">
          <Reveal className="row align-items-center g-5">
            <div className="col-lg-4 text-center">
              <SiteImage src="/images/profile.jpg" alt="Daniel Mohles" className="legacy-portrait legacy-portrait--glow" width={2209} height={2384} sizes="360px" style={{ height: 'auto' }} />
            </div>
            <div className="col-lg-8">
              <h2>{c.aboutHeading}</h2>
              <span className="legacy-about-underline" aria-hidden="true" />
              <p className="legacy-about-tags">
                {c.aboutTags.map((tag, i) => (
                  <span key={tag}>
                    {tag}
                    {i < c.aboutTags.length - 1 && <span className="legacy-about-tags-dot">&middot;</span>}
                  </span>
                ))}
              </p>
              {aboutIntro.map((p, i) => (
                <p key={`intro-${i}`}>{renderWithLinks(p, `intro-${i}`)}</p>
              ))}

              <button
                type="button"
                className="btn btn-brand-outline legacy-about-toggle"
                onClick={() => setAboutExpanded((v) => !v)}
                aria-expanded={aboutExpanded}
              >
                {aboutExpanded ? c.aboutLessLabel : c.aboutMoreLabel}
                <ArrowRight size={16} strokeWidth={2} className={`legacy-about-toggle-arrow ${aboutExpanded ? 'legacy-about-toggle-arrow--up' : ''}`} />
              </button>
            </div>
          </Reveal>

          <Reveal className="legacy-stats-bar">
            {stats.map((stat) => {
              const Icon = STAT_ICONS[stat.icon];
              return (
                <div key={stat.label} className="legacy-stats-card">
                  <span className="legacy-stats-icon"><Icon size={16} strokeWidth={1.8} /></span>
                  <strong>{stat.value}</strong>
                  <span className="legacy-stats-label">{stat.label}</span>
                </div>
              );
            })}
          </Reveal>

          {aboutExpanded && (
            <div className="legacy-about-more">
              {aboutSections.map((section, sIdx) => (
                <Reveal
                  key={section.heading}
                  className={`row align-items-center g-5 legacy-about-more-section ${sIdx % 2 === 1 ? 'flex-row-reverse' : ''}`}
                >
                  <div className="col-lg-4 text-center">
                    <div className={`legacy-about-more-image-wrap ${sIdx % 2 === 1 ? 'legacy-about-more-image-wrap--reverse' : ''}`}>
                      <SiteImage src={section.image} alt={section.heading} className="legacy-about-more-image" width={900} height={1200} sizes="(max-width: 992px) 100vw, 33vw" style={{ height: 'auto' }} />
                    </div>
                    {section.extraImages?.map((img) => (
                      <figure key={img.src} className="legacy-about-extra">
                        <SiteImage src={img.src} alt={img.alt} className="legacy-about-extra-image" width={img.width} height={img.height} sizes="(max-width: 992px) 100vw, 33vw" style={{ height: 'auto' }} />
                        <figcaption>{img.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                  <div className="col-lg-8">
                    <h3>{section.heading}</h3>
                    {section.paragraphs.map((p, pIdx) =>
                      p.startsWith('> ') ? (
                        <blockquote key={`section-${sIdx}-${pIdx}`} className="legacy-about-motto">
                          <p>{renderWithLinks(p.slice(2), `section-${sIdx}-${pIdx}`)}</p>
                        </blockquote>
                      ) : (
                        <p key={`section-${sIdx}-${pIdx}`}>{renderWithLinks(p, `section-${sIdx}-${pIdx}`)}</p>
                      )
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="legacy-aerial">
        <div className="container">
          <div className="text-center mb-5">
            <p className="legacy-eyebrow">{c.aerialEyebrow}</p>
            <h2>{c.aerialTitle}</h2>
            {c.aerialLead.split('\n\n').map((paragraph, i) => (
              <p key={i} className="legacy-aerial-lead">{paragraph}</p>
            ))}
          </div>

          <div className="legacy-aerial-grid">
            {c.aerialShots.map((shot) => (
              <Reveal key={shot.title}>
                <AerialShotCard shot={shot} />
              </Reveal>
            ))}
          </div>

          <div className="row g-4 mt-1">
            {c.videos.map((video) => (
              <div key={video.src} className="col-12 col-lg-4">
                <Reveal className="legacy-aerial-card legacy-aerial-video">
                  <AutoplayVideo src={video.src} />
                  <div className="legacy-aerial-card-body">
                    <h4>{video.title}</h4>
                    <p className="legacy-aerial-caption">{shotCaption(video.location, video.year)}</p>
                    {video.description.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
