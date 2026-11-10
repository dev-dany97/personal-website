'use client';

import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';

export default function Datenschutz() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'en';

  return (
    <main className="legacy-imprint">
      <Navbar currentPage="/datenschutz" />

      <section className="legacy-imprint-content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {lang === 'de' ? (
                <>
                  <h1>Datenschutzerklärung</h1>
                  <p>Stand: November 2026</p>

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
                    Diese Website wird auf einem Server bei Amazon Web Services (Amazon Web Services EMEA SARL, 38
                    Avenue John F. Kennedy, L-1855 Luxemburg) in der Region Frankfurt am Main betrieben. Für die
                    Auslieferung nutze ich zusätzlich das Content Delivery Network Amazon CloudFront desselben Anbieters.
                    Aufrufe dieser Website werden dabei zunächst von einem CloudFront-Server entgegengenommen und an
                    meinen Server weitergeleitet; hierbei verarbeitet CloudFront insbesondere Ihre IP-Adresse sowie die
                    unten genannten Zugriffsdaten. CloudFront ist so eingestellt, dass nur Server in Europa und
                    Nordamerika eingesetzt werden; eine Verarbeitung in den USA kann daher nicht vollständig
                    ausgeschlossen werden. Amazon Web Services, Inc. ist nach dem EU-US Data Privacy Framework
                    zertifiziert; ergänzend gelten die EU-Standardvertragsklauseln aus dem Auftragsverarbeitungsvertrag
                    von AWS. Bei jedem Aufruf dieser Website erfasst mein System automatisiert Daten und Informationen
                    des aufrufenden Rechners. Folgende Daten werden hierbei erhoben:
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
                    Für das 3D-Modell meines Gaming-PCs auf der Setup-Seite binde ich die JavaScript-Bibliothek three.js
                    über das Content Delivery Network jsDelivr ein. Hierbei wird zwangsläufig Ihre IP-Adresse an den
                    Anbieter übermittelt, damit die Dateien ausgeliefert werden können. Rechtsgrundlage ist mein berechtigtes
                    Interesse an einer technisch einwandfreien Darstellung der Website (Art. 6 Abs. 1 lit. f DSGVO).
                  </p>
                  <p>
                    Abgesehen vom Spotify-Player (§ 5c), der erst nach Ihrem Klick geladen wird, setze ich keine
                    Cookies und keine Plug-ins sozialer Netzwerke ein.
                  </p>

                  <h3>§ 5a Reichweitenmessung mit Umami</h3>
                  <p>
                    Zur statistischen Auswertung der Zugriffe auf diese Website (Anzahl der Aufrufe und ungefähres
                    Herkunftsland der Besucher) nutze ich den quelloffenen Analysedienst Umami Cloud der Umami Software, Inc.,
                    28 Geary St, Suite 650 #243, San Francisco, Kalifornien, USA. Die Daten werden in der EU-Datenregion
                    von Umami Cloud gespeichert; mit dem Anbieter besteht ein Vertrag zur Auftragsverarbeitung nach
                    Art. 28 DSGVO. Soweit im Rahmen von Betrieb, Support oder Content-Delivery Daten in die USA
                    übermittelt werden, geschieht dies auf Grundlage der EU-Standardvertragsklauseln. Umami setzt keine
                    Cookies, erstellt keine geräteübergreifenden Nutzerprofile und speichert keine vollständigen
                    IP-Adressen; die IP-Adresse wird lediglich kurzzeitig zur Bestimmung des Herkunftslands verarbeitet
                    und anschließend verworfen. Gespeichert werden nur aggregierte, nicht auf einzelne Personen
                    rückführbare Daten wie Land, Browsertyp, Betriebssystem, verwendetes Gerät, Referrer und aufgerufene
                    Seite; sie werden nach sechs Monaten gelöscht. Rechtsgrundlage ist mein berechtigtes Interesse an der
                    bedarfsgerechten Gestaltung und statistischen Auswertung meiner Website (Art. 6 Abs. 1 lit. f
                    DSGVO). Da kein
                    Tracking über Cookies oder Geräte-Fingerprinting stattfindet, ist hierfür keine Einwilligung erforderlich.
                  </p>

                  <h3>§ 5b Regionale Zugriffsbeschränkung</h3>
                  <p>
                    Diese Website ist technisch so eingerichtet, dass sie ausschließlich von Aufrufen aus Deutschland aus
                    erreichbar ist. Hierzu ermittelt Amazon CloudFront (Amazon Web Services) die Herkunft eines Zugriffs
                    anhand der IP-Adresse bereits am Netzwerkrand; Zugriffe aus anderen Ländern werden automatisiert
                    abgewiesen, bevor eine Verbindung zu meinem Server zustande kommt. Es findet dabei
                    keine Speicherung der IP-Adresse über die Dauer der Anfrage hinaus statt. Rechtsgrundlage ist mein
                    berechtigtes Interesse an einem auf mein Zielpublikum begrenzten und missbrauchsarmen Betrieb der
                    Website (Art. 6 Abs. 1 lit. f DSGVO).
                  </p>

                  <h3>§ 5c Spotify-Player auf der Finance-Seite</h3>
                  <p>
                    Auf der Finance-Seite können Sie einen Song über den Player von Spotify abspielen (Anbieter: Spotify
                    AB, Regeringsgatan 19, 111 53 Stockholm, Schweden). Der Player wird erst geladen, wenn Sie auf
                    &bdquo;Song abspielen&ldquo; klicken; vorher werden keine Daten an Spotify übertragen. Nach dem Klick
                    stellt Ihr Browser eine Verbindung zu Servern von Spotify her. Dabei werden insbesondere Ihre
                    IP-Adresse, Informationen zu Browser und Gerät sowie die aufgerufene Seite an Spotify übermittelt,
                    und Spotify kann Cookies oder ähnliche Technologien einsetzen. Sind Sie bei Spotify angemeldet, kann
                    Spotify die Nutzung Ihrem Konto zuordnen. Eine Übermittlung in Drittländer wie die USA ist dabei
                    nicht ausgeschlossen. Rechtsgrundlage ist Ihre Einwilligung durch den Klick (Art. 6 Abs. 1 lit. a
                    DSGVO, § 25 Abs. 1 TDDDG). Sie können den Player jederzeit über das &times; schließen; für künftige
                    Besuche gilt die Einwilligung nicht fort. Näheres finden Sie in der Datenschutzerklärung von
                    Spotify unter{' '}
                    <a href="https://www.spotify.com/de/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">
                      spotify.com/de/legal/privacy-policy
                    </a>
                    .
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
                </>
              ) : (
                <>
                  <h1>Privacy Policy</h1>
                  <p>Last updated: November 2026</p>
                  <p className="legacy-imprint-note">
                    This is a courtesy translation. The German version of this privacy policy is legally binding.
                  </p>

                  <p>
                    Protecting your personal data is important to me. Below, in accordance with Art. 13 and Art. 14 of
                    the General Data Protection Regulation (GDPR) and the relevant provisions of the German Federal
                    Data Protection Act (BDSG), I inform you about the nature, scope, and purpose of the processing of
                    personal data in connection with the operation of this website.
                  </p>

                  <h3>§ 1 Name and Contact Details of the Controller</h3>
                  <p>
                    The controller within the meaning of the GDPR and other national data protection laws of the
                    member states, as well as other data protection regulations, is:
                  </p>
                  <p>
                    Daniel Mohles
                    <br />
                    Regensburg
                    <br />
                    Germany
                    <br />
                    Email:{' '}
                    <a href="mailto:kontakt@d-mohles.de">kontakt@d-mohles.de</a>
                  </p>

                  <h3>§ 2 General Information on Data Processing</h3>
                  <p>
                    I generally only process my users&rsquo; personal data to the extent necessary to provide a
                    functioning website along with my content and services. My users&rsquo; personal data is regularly
                    processed only with the user&rsquo;s consent. An exception applies in cases where obtaining prior
                    consent is not possible for factual reasons and the processing of the data is permitted by law.
                  </p>
                  <p>
                    Where I obtain consent from the data subject for processing operations involving personal data,
                    Art. 6(1)(a) GDPR serves as the legal basis. Where processing of personal data is necessary to
                    protect a legitimate interest of mine or of a third party, Art. 6(1)(f) GDPR serves as the legal
                    basis.
                  </p>

                  <h3>§ 3 Provision of the Website and Creation of Log Files</h3>
                  <p>
                    This website is operated on a server provided by Amazon Web Services (Amazon Web Services EMEA SARL,
                    38 Avenue John F. Kennedy, L-1855 Luxembourg) in the Frankfurt am Main region. In addition, I use
                    the Amazon CloudFront content delivery network from the same provider to deliver the website.
                    Requests to this website are first received by a CloudFront server and forwarded to my server; in
                    doing so, CloudFront processes in particular your IP address and the access data listed below.
                    CloudFront is configured to use only servers in Europe and North America, so processing in the USA
                    cannot be completely ruled out. Amazon Web Services, Inc. is certified under the EU-US Data Privacy
                    Framework; in addition, the EU Standard Contractual Clauses from the AWS data processing addendum
                    apply. Each time this website is accessed, my system automatically collects data and information
                    from the accessing computer. The following data is collected:
                  </p>
                  <ol>
                    <li>Information about the browser type and version used</li>
                    <li>the user&rsquo;s operating system</li>
                    <li>the user&rsquo;s IP address</li>
                    <li>date and time of access</li>
                    <li>the website from which the user&rsquo;s system reached this website (referrer)</li>
                  </ol>
                  <p>
                    The temporary storage of the IP address by the system is necessary to enable delivery of the
                    website to the user&rsquo;s computer. The legal basis for the temporary storage of the data is
                    Art. 6(1)(f) GDPR. The data is deleted as soon as it is no longer required to achieve the purpose
                    for which it was collected; in the case of data collected for providing the website, this is the
                    case once the respective session has ended, and at the latest after 30 days.
                  </p>

                  <h3>§ 4 Getting in Touch</h3>
                  <p>
                    When you contact me via the contact form, the information you provide is processed for the purpose
                    of handling your inquiry and for any follow-up questions. The legal basis for processing this data
                    is Art. 6(1)(b) GDPR, or, where the inquiry is not related to a contract, Art. 6(1)(f) GDPR
                    (legitimate interest in responding to inquiries).
                  </p>
                  <p>
                    For the technical handling of the contact form, I use the service Formspree (Formspree, Inc., USA)
                    as a processor. The data you enter is transferred to the USA on the basis of EU Standard
                    Contractual Clauses.
                  </p>

                  <h3>§ 5 Services and Service Providers Used</h3>
                  <p>
                    For the 3D model of my gaming PC on the setup page, I include the three.js JavaScript library via the
                    jsDelivr content delivery network. This necessarily transmits your IP address to the provider so that
                    the files can be delivered. The legal basis is my legitimate interest in the technically flawless
                    presentation of the website (Art. 6(1)(f) GDPR).
                  </p>
                  <p>
                    Apart from the Spotify player (§ 5c), which only loads after you click, I do not use any cookies
                    or social media plug-ins.
                  </p>

                  <h3>§ 5a Traffic Analysis with Umami</h3>
                  <p>
                    For statistical analysis of visits to this website (number of visits and approximate country of
                    origin of visitors), I use the open-source analytics service Umami Cloud provided by Umami Software, Inc.,
                    28 Geary St, Suite 650 #243, San Francisco, California, USA. The data is stored in the EU data region of
                    Umami Cloud; a data processing agreement pursuant to Art. 28 GDPR is in place with the provider. Where
                    data is transferred to the USA in the course of operations, support or content delivery, this is
                    based on the EU Standard Contractual Clauses. Umami does not set cookies, does not create
                    cross-device user profiles, and does not store full IP addresses; the IP address is only processed
                    briefly to determine the country of origin and is then discarded. Only aggregated data that cannot
                    be traced back to individuals is stored, such as country, browser type, operating system, device used, referrer, and
                    page visited; it is deleted after six months. The legal basis is my legitimate interest in the
                    needs-based design and statistical evaluation of my website (Art. 6(1)(f) GDPR). Since no tracking
                    via cookies or device fingerprinting takes place, no consent is required for this.
                  </p>

                  <h3>§ 5b Regional Access Restriction</h3>
                  <p>
                    This website is technically configured to be accessible exclusively from Germany. To this end, the
                    origin of a request is determined by Amazon CloudFront (Amazon Web Services) based on the IP
                    address already at the network edge; requests from other countries are automatically rejected
                    before a connection to my server is established. No storage of the IP address beyond the duration of the
                    request takes place. The legal basis is my legitimate interest in operating the website in a way
                    that is limited to my target audience and low in potential for abuse (Art. 6(1)(f) GDPR).
                  </p>

                  <h3>§ 5c Spotify Player on the Finance Page</h3>
                  <p>
                    On the finance page you can play a song through Spotify&rsquo;s player (provider: Spotify AB,
                    Regeringsgatan 19, 111 53 Stockholm, Sweden). The player only loads once you click &ldquo;Play the
                    song&rdquo;; before that, no data is sent to Spotify. After the click, your browser connects to
                    Spotify&rsquo;s servers. In particular, your IP address, information about your browser and device
                    and the page you are visiting are transmitted to Spotify, and Spotify may use cookies or similar
                    technologies. If you are logged in to Spotify, Spotify can link the use to your account. A transfer
                    to third countries such as the USA cannot be ruled out. The legal basis is your consent given by
                    the click (Art. 6(1)(a) GDPR, Section 25(1) TDDDG). You can close the player at any time using the
                    &times;; the consent does not carry over to future visits. For details, see Spotify&rsquo;s privacy
                    policy at{' '}
                    <a href="https://www.spotify.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">
                      spotify.com/legal/privacy-policy
                    </a>
                    .
                  </p>

                  <h3>§ 6 Local Storage in Your Browser</h3>
                  <p>
                    To remember your selected language setting as well as your display preference (light/dark color
                    scheme), this website uses your browser&rsquo;s so-called local storage. This is not a cookie in
                    the legal sense; no data is transmitted to me or third parties, no user profiles are created, and
                    no recognition across website boundaries takes place. Consent is not required for this purely
                    technical function. You can delete the stored data at any time via your browser settings.
                  </p>

                  <h3>§ 7 Rights of the Data Subject</h3>
                  <p>
                    As a data subject within the meaning of the GDPR, you have the statutory rights to access,
                    rectification, erasure, restriction of processing, data portability, and objection (Art. 15–21
                    GDPR), as well as the right to lodge a complaint with a supervisory authority. To exercise these
                    rights, an informal email to{' '}
                    <a href="mailto:kontakt@d-mohles.de">kontakt@d-mohles.de</a> is sufficient.
                  </p>

                  <h3>§ 8 Timeliness and Amendment of this Privacy Policy</h3>
                  <p>
                    This privacy policy is currently valid and has the status stated above. As this website and the
                    services offered through it continue to develop, or due to changed legal or regulatory
                    requirements, it may become necessary to amend this privacy policy. The current privacy policy can
                    always be found at this location.
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
