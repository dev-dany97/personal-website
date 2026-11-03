'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { socialLinks } from '@/app/components/Icons';
import { SiteImage } from '@/app/components/SiteImage';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer-main">
          <div className="site-footer-brand">
            <div className="site-footer-brand-row">
              <SiteImage src="/favicon.ico" alt="" className="site-footer-logo" width={32} height={32} unoptimized />
              <span className="site-footer-name">Daniel Mohles</span>
            </div>
            <p className="site-footer-tagline">{t('footer.tagline')}</p>
          </div>

          <div className="site-footer-social">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label={label}
                title={label}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>&copy; {currentYear} Daniel Mohles &middot; {t('footer.location')}</p>
          <div className="site-footer-legal">
            <Link href="/impressum">{t('nav.impressum')}</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </div>
        </div>

        <p className="site-footer-credit">
          {t('footer.builtBy')} &middot; {t('footer.stack')}
        </p>
      </div>
    </footer>
  );
}
