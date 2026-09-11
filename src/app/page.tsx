'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';

interface AerialShot {
  title: string;
  image: string;
  description: string;
}

interface HomeVideo {
  src: string;
  title: string;
  description: string;
}

interface HomeContent {
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroCta: string;
  aboutHeading: string;
  aboutP1Template: string;
  aboutP2: string;
  aboutP3: string;
  aerialEyebrow: string;
  aerialTitle: string;
  aerialLead: string;
  aerialShots: AerialShot[];
  videos: HomeVideo[];
}

type HomeResponse = Record<'en' | 'de', HomeContent>;

export default function Home() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'en';
  const [data, setData] = useState<HomeResponse | null>(null);

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
  const aboutP1 = c.aboutP1Template.replace('{age}', String(currentAge));

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
          <div className="row align-items-center g-5">
            <div className="col-lg-4 text-center">
              <img src="/images/profile.jpg" alt="Daniel Mohles" className="legacy-portrait" />
            </div>
            <div className="col-lg-8">
              <h2>{c.aboutHeading}</h2>
              <p>{aboutP1}</p>
              <p>{c.aboutP2}</p>
              <p>{c.aboutP3}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="legacy-aerial">
        <div className="container">
          <div className="text-center mb-5">
            <p className="legacy-eyebrow">{c.aerialEyebrow}</p>
            <h2>{c.aerialTitle}</h2>
            <p className="legacy-aerial-lead">{c.aerialLead}</p>
          </div>

          <div className="row g-4">
            {c.aerialShots.map((shot) => (
              <div key={shot.title} className="col-md-6">
                <div className="legacy-aerial-card">
                  <img src={shot.image} alt={shot.title} loading="lazy" />
                  <div className="legacy-aerial-card-body">
                    <h4>{shot.title}</h4>
                    <p>{shot.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 mt-1">
            {c.videos.map((video) => (
              <div key={video.src} className="col-12 col-lg-4">
                <div className="legacy-aerial-card legacy-aerial-video">
                  <video src={video.src} muted autoPlay playsInline loop preload="auto">
                    Your browser does not support the video tag.
                  </video>
                  <div className="legacy-aerial-card-body">
                    <h4>{video.title}</h4>
                    <p>{video.description}</p>
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
