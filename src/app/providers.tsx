'use client';

import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
const de = {
  'nav.home': 'Startseite',
  'nav.projects': 'Projekte',
  'nav.setup': 'Gaming',
  'nav.finance': 'Finanzen',
  'nav.travel': 'Reisen',
  'nav.contact': 'Kontakt',
  'nav.impressum': 'Impressum',
  'hero.welcome': 'Willkommen auf meinem Portfolio',
  'hero.subtitle': 'Drohnen-Fotografie | PC-Setup | Investments | Reisen',
  'hero.cta': 'Mehr über mich',
  'about.title': 'Über mich',
  'about.text': 'Ich bin Daniel Mohles, ein Enthusiast für Technologie, Fotografie und Reisen.',
  'projects.title': 'Meine Drohnen-Fotografie Projekte',
  'projects.viewProject': 'Projekt anschauen',
  'setup.title': 'Mein PC-Setup',
  'finance.title': 'Meine Investment-Reise',
  'finance.resources': 'Ressourcen, die ich nutze:',
  'travel.title': 'Reise-Geschichten & Abenteuer',
  'travel.viewGallery': 'Galerie anschauen',
  'contact.title': 'Kontakt',
  'contact.social': 'Soziale Medien',
  'footer.copyright': 'Urheberrecht',
  'footer.tagline': 'Hobby-Drohnenfotograf | Gamer | Software-Entwickler | Segler | Enthusiastischer Trader',
  'footer.location': 'Regensburg, Deutschland',
  'notFound.title': 'Seite nicht gefunden',
  'notFound.text': 'Du hast eine Seite gefunden, die es nicht gibt. Atme kurz durch und versuche es noch einmal.',
  'notFound.cta': 'Zurück zur Startseite',
  'nav.toggleMenu': 'Navigation ein-/ausblenden',
  'nav.toggleLanguage': 'Sprache wechseln',
  'nav.toggleTheme': 'Hellen/dunklen Modus wechseln',
  'cookie.text': 'Diese Website nutzt nur technisch notwendige Daten (z.B. deine Sprach- und Theme-Einstellung) — kein Tracking, keine Cookies von Drittanbietern.',
  'cookie.privacyLink': 'Datenschutzerklärung',
  'cookie.accept': 'Verstanden',
};

const en = {
  'nav.home': 'Home',
  'nav.projects': 'Projects',
  'nav.setup': 'Gaming',
  'nav.finance': 'Finance',
  'nav.travel': 'Travel',
  'nav.contact': 'Contact',
  'nav.impressum': 'Imprint',
  'hero.welcome': 'Welcome to My Portfolio',
  'hero.subtitle': 'Drone Photography | PC Setup | Investments | Travel',
  'hero.cta': 'Learn More',
  'about.title': 'About Me',
  'about.text': 'I am Daniel Mohles, an enthusiast for technology, photography, and travel.',
  'projects.title': 'My Drone Photography Projects',
  'projects.viewProject': 'View Project',
  'setup.title': 'My PC Setup',
  'finance.title': 'My Investment Journey',
  'finance.resources': 'Resources I Use:',
  'travel.title': 'Travel Stories & Adventures',
  'travel.viewGallery': 'View Gallery',
  'contact.title': 'Contact',
  'contact.social': 'Social Media',
  'footer.copyright': 'Copyright',
  'footer.tagline': 'Hobby Drone Photographer | Gamer | Software Engineer | Sailor | Enthusiastic Trader',
  'footer.location': 'Regensburg, Germany',
  'notFound.title': 'Page not found',
  'notFound.text': "This page doesn't exist. Let's go back and try again.",
  'notFound.cta': 'Return to the homepage',
  'nav.toggleMenu': 'Toggle navigation',
  'nav.toggleLanguage': 'Toggle language',
  'nav.toggleTheme': 'Toggle light and dark mode',
  'cookie.text': 'This site only uses technically necessary data (e.g. your language and theme preference) to work — no tracking, no third-party cookies.',
  'cookie.privacyLink': 'Privacy policy',
  'cookie.accept': 'Got it',
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        de: { translation: de },
        en: { translation: en },
      },
      // Fixed default so the server-rendered markup always matches the client's first render;
      // the persisted preference is applied after mount in Providers below.
      lng: 'de',
      fallbackLng: 'de',
      interpolation: {
        escapeValue: false,
      },
    });

  // Single source of truth for persistence, avoids races with other effects reading/writing it.
  i18n.on('languageChanged', (lng) => {
    localStorage.setItem('language', lng);
  });
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
