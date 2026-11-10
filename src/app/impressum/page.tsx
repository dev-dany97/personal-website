'use client';

import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';

export default function Impressum() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'en';

  return (
    <main className="legacy-imprint">
      <Navbar currentPage="/impressum" />

      <section className="legacy-imprint-content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {lang === 'de' ? (
                <>
                  <h1>Impressum</h1>

                  <h3>Angaben gemäß § 5 TMG</h3>
                  <p>
                    <strong>Daniel Mohles</strong>
                    <br />
                    Regensburg
                    <br />
                    Deutschland
                  </p>

                  <h4>Kontakt</h4>
                  <p>
                    E-Mail:{' '}
                    <a href="mailto:kontakt@d-mohles.de">kontakt@d-mohles.de</a>
                  </p>

                  <h4>Datenschutz</h4>
                  <p>
                    Informationen darüber, welche personenbezogenen Daten ich verarbeite und welche Rechte Ihnen
                    zustehen, finden Sie in meiner{' '}
                    <a href="/datenschutz">Datenschutzerklärung</a>.
                  </p>
                </>
              ) : (
                <>
                  <h1>Imprint</h1>

                  <h3>Information pursuant to § 5 TMG (German Telemedia Act)</h3>
                  <p>
                    <strong>Daniel Mohles</strong>
                    <br />
                    Regensburg
                    <br />
                    Germany
                  </p>

                  <h4>Contact</h4>
                  <p>
                    Email:{' '}
                    <a href="mailto:kontakt@d-mohles.de">kontakt@d-mohles.de</a>
                  </p>

                  <h4>Privacy</h4>
                  <p>
                    For information on which personal data I process and what rights you have, please see my{' '}
                    <a href="/datenschutz">privacy policy</a>.
                  </p>

                  <p className="legacy-imprint-note">
                    This is a courtesy translation. The German version of this imprint is legally binding.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
