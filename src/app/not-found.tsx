'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <main className="legacy-home">
      <Navbar />

      <section className="legacy-hero" style={{ minHeight: '520px' }}>
        <div className="container legacy-hero-inner text-center">
          <h1 className="legacy-title" style={{ fontSize: 'clamp(2.6rem, 5vw, 5rem)' }}>
            {t('notFound.title')}
          </h1>
          <p className="legacy-subtitle">{t('notFound.text')}</p>
          <Link href="/" className="btn legacy-cta">
            {t('notFound.cta').toUpperCase()}
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
