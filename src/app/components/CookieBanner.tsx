'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'cookie-consent-ack';

export function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (e.g. private browsing) — skip the banner rather than break the page.
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label={t('cookie.accept')}>
      <div className="container cookie-banner-inner">
        <p>
          {t('cookie.text')}{' '}
          <Link href="/datenschutz">{t('cookie.privacyLink')}</Link>
        </p>
        <button type="button" className="btn legacy-cta cookie-banner-btn" onClick={dismiss}>
          {t('cookie.accept')}
        </button>
      </div>
    </div>
  );
}
