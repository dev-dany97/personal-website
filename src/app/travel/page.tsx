'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { GlobeBackground } from '@/app/components/backgrounds/GlobeBackground';
import { DestinationMiniGlobe } from '@/app/components/backgrounds/DestinationMiniGlobe';
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
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [activeFlag, setActiveFlag] = useState<FlagCode | null>(null);

  useEffect(() => {
    fetch('/api/travel')
      .then((res) => res.json())
      .then(setData);
  }, []);

  useEffect(() => {
    if (!data) return;
    const destinations = data[lang].destinations;
    const sections = destinations
      .map((dest) => document.getElementById(dest.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;
        const dest = destinations.find((d) => d.id === visible.target.id);
        if (dest) setActiveFlag(dest.flag);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [data, lang]);

  useEffect(() => {
    if (!lightboxImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxImage]);

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
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }}
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

      <section className="pb-5 travel-gallery-section">
        {activeFlag && (
          <div className="destination-mini-globe">
            <DestinationMiniGlobe countryCode={activeFlag} />
          </div>
        )}
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
                  <div
                    key={`${dest.id}-${index}`}
                    className="travel-polaroid"
                    onClick={() => setLightboxImage({ src: image, alt: `${dest.name} gallery ${index + 1}` })}
                  >
                    <Image
                      src={image}
                      alt={`${dest.name} gallery ${index + 1}`}
                      width={300}
                      height={190}
                      sizes="(max-width: 576px) 50vw, 200px"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {lightboxImage && (
        <div
          className="travel-lightbox"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="travel-lightbox-close"
            onClick={() => setLightboxImage(null)}
            aria-label="Close"
          >
            &times;
          </button>
          <Image
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            width={1200}
            height={900}
            className="travel-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </main>
  );
}
