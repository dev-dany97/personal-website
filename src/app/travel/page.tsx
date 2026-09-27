'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { GlobeBackground } from '@/app/components/backgrounds/GlobeBackground';
import { FlagIcon } from '@/app/components/FlagIcon';

type FlagCode = 'IT' | 'AE' | 'TH' | 'FR' | 'ES' | 'HR' | 'AU';

interface Destination {
  id: string;
  name: string;
  flag: FlagCode;
  description: string;
  imageCount: number;
  image: string;
  gallery: string[];
}

interface TravelContent {
  heroTitle: string;
  heroLead: string;
  photos: string;
  viewGallery: string;
  destinations: Destination[];
}

type TravelResponse = Record<'en' | 'de', TravelContent>;

export default function Travel() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'en';
  const [data, setData] = useState<TravelResponse | null>(null);

  useEffect(() => {
    fetch('/api/travel')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <main style={{ minHeight: '100vh' }}>
        <Navbar currentPage="/travel" />
      </main>
    );
  }

  const c = data[lang];
  const destinations = c.destinations;

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar currentPage="/travel" />

      <section className="travel-hero">
        <GlobeBackground />
        <div className="container">
          <h1>{c.heroTitle}</h1>
          <p className="travel-hero-lead">{c.heroLead}</p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4 travel-story-grid">
            {destinations.map((dest) => (
              <div key={dest.name} className="col-md-6">
                <div className="card bg-dark h-100 overflow-hidden border-0 travel-story-card" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                  <div
                    style={{
                      height: '220px',
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: '#111'
                    }}
                  >
                    <img
                      src={dest.image}
                      alt={dest.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.55))'
                      }}
                    />
                    <div className="travel-card-flag">
                      <FlagIcon country={dest.flag} size={44} />
                    </div>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{dest.name}</h5>
                    <p className="card-text">{dest.description}</p>
                    <div className="d-flex justify-content-between align-items-center gap-3">
                      <small className="travel-photo-count">{dest.imageCount} {c.photos}</small>
                      <a
                        href={`#${dest.id}`}
                        className="btn btn-sm btn-brand rounded-pill px-3"
                      >
                        {c.viewGallery}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          {destinations.map((dest) => (
            <div
              key={`${dest.id}-gallery`}
              id={dest.id}
              className="mb-5"
              style={{ scrollMarginTop: '90px' }}
            >
              <h3 className="mb-3 d-flex align-items-center gap-2">
                <FlagIcon country={dest.flag} size={22} />
                {dest.name}
              </h3>
              <div className="travel-scatter">
                {dest.gallery.map((image, index) => (
                  <div key={`${dest.id}-${index}`} className="travel-polaroid">
                    <img
                      src={image}
                      alt={`${dest.name} gallery ${index + 1}`}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
