'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { Reveal } from '@/app/components/Reveal';
import { Code2, ShipWheel, Globe, Lightbulb, type LucideIcon } from 'lucide-react';

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

interface AboutSection {
  heading: string;
  image: string;
  paragraphs: string[];
}

interface HomeStat {
  icon: 'code' | 'sailing' | 'globe' | 'idea';
  value: string;
  label: string;
}

const STAT_ICONS: Record<HomeStat['icon'], LucideIcon> = {
  code: Code2,
  sailing: ShipWheel,
  globe: Globe,
  idea: Lightbulb
};

interface HomeContent {
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroCta: string;
  aboutHeading: string;
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

  return (
    <div className="legacy-aerial-card" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
      <div className="legacy-aerial-media">
        <img src={shot.image} alt={shot.title} loading="lazy" />
        {shot.hoverVideo && hovering && (
          <video
            className="legacy-aerial-hover-video"
            src={shot.hoverVideo}
            autoPlay
            muted
            loop
            playsInline
          />
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
              <img src="/images/profile.jpg" alt="Daniel Mohles" className="legacy-portrait" />
            </div>
            <div className="col-lg-8">
              <h2>{c.aboutHeading}</h2>
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
              </button>
            </div>
          </Reveal>

          <Reveal className="legacy-stats-bar">
            {c.stats.map((stat) => {
              const Icon = STAT_ICONS[stat.icon];
              return (
                <div key={stat.label} className="legacy-stats-card">
                  <span className="legacy-stats-icon"><Icon size={20} strokeWidth={1.8} /></span>
                  <strong>{stat.value}</strong>
                  <span className="legacy-stats-label">{stat.label}</span>
                </div>
              );
            })}
          </Reveal>

          {aboutExpanded && (
            <div className="legacy-about-more">
              {c.aboutSections.map((section, sIdx) => (
                <Reveal
                  key={section.heading}
                  className={`row align-items-center g-5 legacy-about-more-section ${sIdx % 2 === 1 ? 'flex-row-reverse' : ''}`}
                >
                  <div className="col-lg-4 text-center">
                    <div className={`legacy-about-more-image-wrap ${sIdx % 2 === 1 ? 'legacy-about-more-image-wrap--reverse' : ''}`}>
                      <img src={section.image} alt={section.heading} className="legacy-about-more-image" loading="lazy" />
                    </div>
                  </div>
                  <div className="col-lg-8">
                    <h3>{section.heading}</h3>
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={`section-${sIdx}-${pIdx}`}>{renderWithLinks(p, `section-${sIdx}-${pIdx}`)}</p>
                    ))}
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

          <div className="row g-4">
            {c.aerialShots.map((shot) => (
              <div key={shot.title} className="col-md-6">
                <Reveal>
                  <AerialShotCard shot={shot} />
                </Reveal>
              </div>
            ))}
          </div>

          <div className="row g-4 mt-1">
            {c.videos.map((video) => (
              <div key={video.src} className="col-12 col-lg-4">
                <Reveal className="legacy-aerial-card legacy-aerial-video">
                  <video src={video.src} muted autoPlay playsInline loop preload="auto">
                    Your browser does not support the video tag.
                  </video>
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
