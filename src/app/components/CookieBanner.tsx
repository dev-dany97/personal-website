'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useLocalStorage, writeLocalStorage } from './useBrowserState';

const STORAGE_KEY = 'cookie-consent-ack';

export function CookieBanner() {
  const { t } = useTranslation();
  // null means "not acknowledged yet". Without localStorage (e.g. private
  // browsing) the hook returns a marker value, so the banner stays hidden
  // rather than breaking the page, as before.
  const ack = useLocalStorage(STORAGE_KEY);
  const [dismissed, setDismissed] = useState(false);
  const visible = ack === null && !dismissed;

  const dismiss = () => {
    writeLocalStorage(STORAGE_KEY, '1');
    setDismissed(true);
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
