'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { AutoplayVideo } from '@/app/components/AutoplayVideo';
import { GamingHudBackground } from '@/app/components/backgrounds/GamingHudBackground';

// Large video files are hosted on S3/CloudFront rather than bundled under
// /public — falls back to the local /public/videos path when unset.
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '';

interface HardwareComponent {
  label: string;
  value: string;
  image?: string;
}

interface SetupContent {
  title: string;
  lead: string;
  highEndTitle: string;
  highEndDesc: string;
  waterCoolingTitle: string;
  waterCoolingIntro: string;
  bullets: { title: string; text: string }[];
  tipsTitle: string;
  tipsText: string;
  explore3dTitle: string;
  explore3dText: string;
  componentsPhotoTitle: string;
  componentsPhotoCaption: string;
  componentsPhotoAlt: string;
  secondBuildTitle: string;
  secondBuildDesc: string;
  hardwareTitle: string;
  hardwareDisclaimer: string;
  pc2Components: HardwareComponent[];
}

interface SetupResponse {
  primaryComponents: HardwareComponent[];
  en: SetupContent;
  de: SetupContent;
}

export default function Setup() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'en';
  const [data, setData] = useState<SetupResponse | null>(null);

  useEffect(() => {
    fetch('/api/setup')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <main style={{ minHeight: '100vh' }}>
        <Navbar currentPage="/setup" />
      </main>
    );
  }

  const c = data[lang];

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar currentPage="/setup" />

      <section className="setup-hero">
        <GamingHudBackground />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="display-4 mb-4 text-center fw-bold">{c.title}</h1>
          <p className="lead text-center theme-text-soft mb-0">{c.lead}</p>
        </div>
      </section>

      <ValorantProfile lang={lang} />

      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-auto" style={{ maxWidth: '380px', width: '100%' }}>
              <div className="setup-build-card">
                <AutoplayVideo
                  src={`${MEDIA_BASE_URL}/videos/setup/Gaming_PC.mp4`}
                  className="rounded shadow-lg"
                  style={{ width: '100%', height: 'auto', display: 'block', background: '#000' }}
                />
                <div className="setup-build-caption">
                  <h5 className="mb-1">{c.highEndTitle}</h5>
                  <p className="theme-text-soft mb-0">{c.highEndDesc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row align-items-center mb-5">
            <div className="col-lg-5 mb-4 mb-lg-0">
              <img
                src="/images/setup/bg-gaminghead.jpg"
                alt="Water cooling setup"
                className="img-fluid rounded shadow"
                style={{ minHeight: '320px', objectFit: 'cover', width: '100%' }}
              />
            </div>
            <div className="col-lg-7">
              <h3 className="mb-3">{c.waterCoolingTitle}</h3>
              <p className="theme-text-soft mb-2">{c.waterCoolingIntro}</p>
              <ul className="theme-text-soft">
                {c.bullets.map((b) => (
                  <li key={b.title}><strong className="theme-text">{b.title}</strong> {b.text}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="mb-3">{c.tipsTitle}</h3>
            <p className="theme-text-soft">{c.tipsText}</p>
          </div>

          <div className="row g-4 setup-component-grid mb-5">
            {data.primaryComponents.map((component) => (
              <div key={component.label} className="col-md-6 col-xl-4">
                <div className="card bg-dark border-0 h-100 shadow-sm setup-component-card" style={{ border: '1px solid var(--card-border)' }}>
                  {component.image ? (
                    <img src={component.image} alt={component.label} className="card-img-top" style={{ height: '180px', objectFit: 'cover' }} />
                  ) : (
                    <div className="setup-component-placeholder" aria-hidden="true" />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{component.label}</h5>
                    <p className="card-text theme-text-soft mb-0">{component.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <h3 className="mb-2">{c.explore3dTitle}</h3>
            <p className="theme-text-soft mb-0">{c.explore3dText}</p>
          </div>
          <div className="mb-5">
            <iframe
              src="/pc-modell.html"
              title="Custom-Loop PC – 3D-Modell"
              style={{ width: '100%', height: '720px', border: 0, borderRadius: '12px' }}
              allow="autoplay"
              loading="lazy"
            />
          </div>

          <div className="mb-5">
            <h3 className="mb-3">{c.componentsPhotoTitle}</h3>
            <p className="theme-text-soft mb-3">{c.componentsPhotoCaption}</p>
            <img
              src="/images/setup/pc-setup/all-components.jpg"
              alt={c.componentsPhotoAlt}
              className="img-fluid rounded shadow-lg"
              style={{ width: '100%', maxHeight: '640px', objectFit: 'cover', objectPosition: 'center 20%' }}
            />
          </div>

          <hr className="my-5" style={{ borderColor: 'var(--card-border)' }} />

          <div className="row justify-content-center mb-4">
            <div className="col-auto" style={{ maxWidth: '380px', width: '100%' }}>
              <div className="setup-build-card">
                <AutoplayVideo
                  src={`${MEDIA_BASE_URL}/videos/setup/Gaming_PC2.mp4`}
                  className="rounded shadow-lg"
                  style={{ width: '100%', height: 'auto', display: 'block', background: '#000' }}
                />
                <div className="setup-build-caption">
                  <h5 className="mb-1">{c.secondBuildTitle}</h5>
                  <p className="theme-text-soft mb-0">{c.secondBuildDesc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <h3 className="mb-2">{c.hardwareTitle}</h3>
            <p className="theme-text-soft" style={{ fontSize: '0.9rem' }}>{c.hardwareDisclaimer}</p>
          </div>

          <div className="row g-4 setup-component-grid">
            {c.pc2Components.map((component) => (
              <div key={component.label} className="col-md-6 col-xl-4">
                <div className="card bg-dark border-0 h-100 shadow-sm setup-component-card" style={{ border: '1px solid var(--card-border)' }}>
                  <div className="setup-component-placeholder" aria-hidden="true" />
                  <div className="card-body">
                    <h5 className="card-title">{component.label}</h5>
                    <p className="card-text theme-text-soft mb-0">{component.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

interface ValorantProfileData {
  name: string;
  tag: string;
  currentTier: string;
  currentTierIcon: string | null;
  rr: number;
  rrChange: number | null;
  elo: number | null;
  peakTier: string;
  peakTierIcon: string | null;
  accountLevel: number | null;
  bannerUrl: string | null;
  seasonWinRate: number | null;
  lifetimeWinRate: number | null;
  recentKD: number | null;
  recentKills: number | null;
  recentDeaths: number | null;
  recentAssists: number | null;
  favoriteAgentName: string;
  favoriteAgentPortrait: string;
}

interface ValorantResponse {
  available: boolean;
  profile?: ValorantProfileData;
  updatedAt?: string;
}

const VALORANT_TEXT = {
  en: {
    current: 'Current Rank', peak: 'Peak Rank', agent: 'Favorite Agent', level: 'Account Level',
    winRate: 'Season Win Rate', lifetimeWinRate: 'Lifetime Win Rate', elo: 'Elo', rrChange: 'Last RR Change',
    recentForm: 'Last 5 Matches (K/D/A)', kd: 'K/D Ratio'
  },
  de: {
    current: 'Aktueller Rang', peak: 'Höchster Rang', agent: 'Lieblingsagent', level: 'Account-Level',
    winRate: 'Winrate (Season)', lifetimeWinRate: 'Winrate (Lifetime)', elo: 'Elo', rrChange: 'Letzte RR-Änderung',
    recentForm: 'Letzte 5 Matches (K/D/A)', kd: 'K/D-Verhältnis'
  }
};

function ValorantProfile({ lang }: { lang: 'en' | 'de' }) {
  const [data, setData] = useState<ValorantResponse | null>(null);
  const t = VALORANT_TEXT[lang];

  useEffect(() => {
    fetch('/api/valorant-profile')
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData({ available: false }));
  }, []);

  if (data && !data.available) return null;
  const profile = data?.profile;

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="valorant-card">
              {profile?.bannerUrl && <img src={profile.bannerUrl} alt="" className="valorant-banner" />}
              {profile?.favoriteAgentPortrait && (
                <img src={profile.favoriteAgentPortrait} alt={profile.favoriteAgentName} className="valorant-agent-portrait" />
              )}
              <div className="valorant-card-content">
                <div className="valorant-eyebrow">VALORANT</div>

                {!profile ? (
                  <p className="mb-0" style={{ color: 'rgba(236,232,225,0.6)' }}>…</p>
                ) : (
                  <>
                    <div className="d-flex flex-wrap align-items-end gap-5 mt-2">
                      <div>
                        <div className="valorant-tag-name">{profile.name}<span style={{ color: '#FF4655' }}>#{profile.tag}</span></div>
                      </div>

                      <div className="valorant-divider d-none d-md-block" />

                      <div>
                        <div className="valorant-stat-label">{t.current}</div>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          {profile.currentTierIcon && <img src={profile.currentTierIcon} alt={profile.currentTier} className="valorant-tier-icon" />}
                          <div className="valorant-stat-sub">{profile.rr} RR</div>
                        </div>
                      </div>

                      <div>
                        <div className="valorant-stat-label">{t.peak}</div>
                        <div className="mt-1">
                          {profile.peakTierIcon && <img src={profile.peakTierIcon} alt={profile.peakTier} className="valorant-tier-icon" />}
                        </div>
                      </div>

                      <div>
                        <div className="valorant-stat-label">{t.agent}</div>
                        <div className="valorant-stat-value">{profile.favoriteAgentName}</div>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-4 mt-4 pt-3 valorant-stat-row">
                      {profile.accountLevel !== null && (
                        <div>
                          <div className="valorant-stat-label">{t.level}</div>
                          <div className="valorant-stat-value">{profile.accountLevel}</div>
                        </div>
                      )}

                      {profile.elo !== null && (
                        <div>
                          <div className="valorant-stat-label">{t.elo}</div>
                          <div className="valorant-stat-value">{profile.elo}</div>
                        </div>
                      )}

                      {profile.rrChange !== null && (
                        <div>
                          <div className="valorant-stat-label">{t.rrChange}</div>
                          <div className={`valorant-stat-value ${profile.rrChange >= 0 ? 'valorant-up' : 'valorant-down'}`}>
                            {profile.rrChange >= 0 ? '+' : ''}{profile.rrChange}
                          </div>
                        </div>
                      )}

                      {profile.seasonWinRate !== null && (
                        <div>
                          <div className="valorant-stat-label">{t.winRate}</div>
                          <div className="valorant-stat-value">{profile.seasonWinRate}%</div>
                        </div>
                      )}

                      {profile.lifetimeWinRate !== null && (
                        <div>
                          <div className="valorant-stat-label">{t.lifetimeWinRate}</div>
                          <div className="valorant-stat-value">{profile.lifetimeWinRate}%</div>
                        </div>
                      )}

                      {profile.recentKD !== null && (
                        <div>
                          <div className="valorant-stat-label">{t.kd}</div>
                          <div className="valorant-stat-value">{profile.recentKD}</div>
                          {profile.recentKills !== null && (
                            <div className="valorant-stat-sub">
                              {profile.recentKills}/{profile.recentDeaths}/{profile.recentAssists}
                            </div>
                          )}
                        </div>
                      )}
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
