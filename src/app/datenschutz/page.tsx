'use client';

import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';

export default function Datenschutz() {
  return (
    <main className="legacy-imprint">
      <Navbar currentPage="/datenschutz" />

      <section className="legacy-imprint-content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <h1>Datenschutzerklärung</h1>
              <p>Stand: April 2023</p>

              <p>
                Der Schutz Ihrer personenbezogenen Daten ist mir ein wichtiges Anliegen. Nachfolgend informiere ich
                Sie gemäß Art. 13 und Art. 14 der Datenschutz-Grundverordnung (DSGVO) sowie den einschlägigen
                Vorschriften des Bundesdatenschutzgesetzes (BDSG) über Art, Umfang und Zweck der Verarbeitung
                personenbezogener Daten im Rahmen des Betriebs dieser Website.
              </p>

              <h3>§ 1 Name und Kontaktdaten des Verantwortlichen</h3>
              <p>
                Verantwortlicher im Sinne der DSGVO und sonstiger nationaler Datenschutzgesetze der Mitgliedstaaten
                sowie sonstiger datenschutzrechtlicher Bestimmungen ist:
              </p>
              <p>
                Daniel Mohles
                <br />
                Regensburg
                <br />
                Deutschland
                <br />
                E-Mail:{' '}
                <a href="mailto:kontakt@d-mohles.de">kontakt@d-mohles.de</a>
              </p>

              <h3>§ 2 Allgemeines zur Datenverarbeitung</h3>
              <p>
                Ich verarbeite personenbezogene Daten meiner Nutzer grundsätzlich nur, soweit dies zur
                Bereitstellung einer funktionsfähigen Website sowie meiner Inhalte und Leistungen erforderlich ist.
                Die Verarbeitung personenbezogener Daten meiner Nutzer erfolgt regelmäßig nur nach Einwilligung des
                Nutzers. Eine Ausnahme gilt in solchen Fällen, in denen eine vorherige Einholung einer Einwilligung
                aus tatsächlichen Gründen nicht möglich ist und die Verarbeitung der Daten durch gesetzliche
                Vorschriften gestattet ist.
              </p>
              <p>
                Soweit ich für Verarbeitungsvorgänge personenbezogener Daten eine Einwilligung der betroffenen
                Person einhole, dient Art. 6 Abs. 1 lit. a EU-Datenschutzgrundverordnung (DSGVO) als Rechtsgrundlage.
                Bei der Verarbeitung personenbezogener Daten, die zur Wahrung eines berechtigten Interesses meiner
                Person oder eines Dritten erforderlich ist, dient Art. 6 Abs. 1 lit. f DSGVO als Rechtsgrundlage.
              </p>

              <h3>§ 3 Bereitstellung der Website und Erstellung von Logfiles</h3>
              <p>
                Diese Website wird auf einem Server bei Amazon Web Services (AWS), Region Frankfurt am Main,
                betrieben. Eine Übermittlung Ihrer Daten in ein Drittland außerhalb der Europäischen Union findet
                dadurch nicht statt. Bei jedem Aufruf dieser Website erfasst mein System automatisiert Daten und
                Informationen des aufrufenden Rechners. Folgende Daten werden hierbei erhoben:
              </p>
              <ol>
                <li>Informationen über den Browsertyp und die verwendete Version</li>
                <li>das Betriebssystem des Nutzers</li>
                <li>die IP-Adresse des Nutzers</li>
                <li>Datum und Uhrzeit des Zugriffs</li>
                <li>Websites, von denen das System des Nutzers auf diese Website gelangt (Referrer)</li>
              </ol>
              <p>
                Die vorübergehende Speicherung der IP-Adresse durch das System ist notwendig, um eine Auslieferung
                der Website an den Rechner des Nutzers zu ermöglichen. Die Rechtsgrundlage für die vorübergehende
                Speicherung der Daten ist Art. 6 Abs. 1 lit. f DSGVO. Die Daten werden gelöscht, sobald sie für die
                Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind; im Fall der Erfassung der Daten
                zur Bereitstellung der Website ist dies der Fall, wenn die jeweilige Sitzung beendet ist,
                spätestens jedoch nach 30 Tagen.
              </p>

              <h3>§ 4 Kontaktaufnahme</h3>
              <p>
                Bei der Kontaktaufnahme mit mir per Kontaktformular werden die Angaben des Nutzers zwecks
                Bearbeitung der Kontaktanfrage und für den Fall von Anschlussfragen verarbeitet. Rechtsgrundlage für
                die Verarbeitung der Daten ist Art. 6 Abs. 1 lit. b bzw., soweit es sich nicht um eine
                vertragsbezogene Anfrage handelt, Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
                Beantwortung von Anfragen).
              </p>
              <p>
                Zur technischen Abwicklung des Kontaktformulars nutze ich den Dienst Formspree (Formspree, Inc.,
                USA) als Auftragsverarbeiter. Die von Ihnen eingegebenen Daten werden dabei auf Grundlage von
                EU-Standardvertragsklauseln in die USA übermittelt.
              </p>

              <h3>§ 5 Eingesetzte Dienste und Diensteanbieter</h3>
              <p>
                Zur technischen Bereitstellung dieser Website binde ich die JavaScript-Bibliothek Bootstrap über das
                Content Delivery Network jsDelivr ein. Hierbei wird zwangsläufig Ihre IP-Adresse an den Anbieter
                übermittelt, damit die Datei ausgeliefert werden kann. Rechtsgrundlage ist mein berechtigtes
                Interesse an einer technisch einwandfreien Darstellung der Website (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
              <p>
                Darüber hinaus setze ich keine Cookies und keine Plug-ins sozialer Netzwerke ein.
              </p>

              <h3>§ 5a Reichweitenmessung mit Umami</h3>
              <p>
                Zur statistischen Auswertung der Zugriffe auf diese Website (Anzahl der Aufrufe und ungefähres
                Herkunftsland der Besucher) nutze ich den selbst gehosteten, quelloffenen Analysedienst Umami. Der
                zugehörige Server wird ebenfalls in der AWS-Region Frankfurt am Main betrieben. Umami setzt keine
                Cookies, erstellt keine geräteübergreifenden Nutzerprofile und speichert keine vollständigen
                IP-Adressen; die IP-Adresse wird lediglich kurzzeitig zur Bestimmung des Herkunftslands verarbeitet
                und anschließend verworfen. Gespeichert werden nur aggregierte, nicht auf einzelne Personen
                rückführbare Daten wie Land, Browsertyp, Betriebssystem, verwendetes Gerät, Referrer und aufgerufene
                Seite. Rechtsgrundlage ist mein berechtigtes Interesse an der bedarfsgerechten Gestaltung und
                statistischen Auswertung meiner Website (Art. 6 Abs. 1 lit. f DSGVO). Da kein Tracking über Cookies
                oder Geräte-Fingerprinting stattfindet, ist hierfür keine Einwilligung erforderlich.
              </p>

              <h3>§ 5b Regionale Zugriffsbeschränkung</h3>
              <p>
                Diese Website ist technisch so eingerichtet, dass sie ausschließlich von Aufrufen aus Deutschland aus
                erreichbar ist. Hierzu wird die Herkunft eines Zugriffs anhand der IP-Adresse mittels AWS WAF
                (Amazon Web Services) bereits am Netzwerkrand ermittelt; Zugriffe aus anderen Ländern werden
                automatisiert abgewiesen, bevor eine Verbindung zu dieser Website zustande kommt. Es findet dabei
                keine Speicherung der IP-Adresse über die Dauer der Anfrage hinaus statt. Rechtsgrundlage ist mein
                berechtigtes Interesse an einem auf mein Zielpublikum begrenzten und missbrauchsarmen Betrieb der
                Website (Art. 6 Abs. 1 lit. f DSGVO).
              </p>

              <h3>§ 6 Lokale Speicherung im Browser</h3>
              <p>
                Zur Wiedererkennung Ihrer gewählten Spracheinstellung sowie der Darstellung (helles/dunkles
                Farbschema) nutzt diese Website den sogenannten Local Storage Ihres Browsers. Hierbei handelt es
                sich nicht um Cookies im rechtlichen Sinne; es werden keine Daten an mich oder Dritte übertragen,
                keine Nutzerprofile erstellt und keine Wiedererkennung über Websitegrenzen hinweg vorgenommen. Eine
                Einwilligung ist für diese rein technische Funktion nicht erforderlich. Sie können die gespeicherten
                Daten jederzeit über die Einstellungen Ihres Browsers löschen.
              </p>

              <h3>§ 7 Rechte der betroffenen Person</h3>
              <p>
                Ihnen stehen als Betroffener i.&nbsp;S.&nbsp;d. DSGVO die gesetzlichen Rechte auf Auskunft,
                Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art.
                15–21 DSGVO) sowie ein Beschwerderecht bei einer Aufsichtsbehörde zu. Zur Ausübung genügt eine
                formlose Mitteilung per E-Mail an{' '}
                <a href="mailto:kontakt@d-mohles.de">kontakt@d-mohles.de</a>.
              </p>

              <h3>§ 8 Aktualität und Änderung dieser Datenschutzerklärung</h3>
              <p>
                Diese Datenschutzerklärung ist aktuell gültig und hat den oben genannten Stand. Durch die
                Weiterentwicklung dieser Website und Angebote darüber oder aufgrund geänderter gesetzlicher
                beziehungsweise behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu
                ändern. Die jeweils aktuelle Datenschutzerklärung finden Sie stets an dieser Stelle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
