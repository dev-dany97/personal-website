'use client';

import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';

export default function Impressum() {
  return (
    <main className="legacy-imprint">
      <Navbar currentPage="/impressum" />

      <section className="legacy-imprint-content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <h1>Impressum</h1>

              <h3>Angaben gemäß § 5 TMG</h3>
              <p>
                <strong>Daniel Mohles</strong>
                <br />
                Regensburg
                <br />
                Germany
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
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
