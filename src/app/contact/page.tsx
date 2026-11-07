'use client';

import { useEffect, useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import Link from 'next/link';
import { PigeonBackground } from '@/app/components/backgrounds/PigeonBackground';
import { socialLinks } from '@/app/components/Icons';
import { SiteImage } from '@/app/components/SiteImage';
import { CertificateProofDialog, type CertificateProof } from '@/app/components/CertificateProofDialog';

const CONTACT_SOCIAL_LABELS = ['LinkedIn', 'Xing'];

const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || 'YOUR_FORM_ID';

interface ContactContent {
  eyebrow: string;
  title: string;
  lead: string;
  sendMessage: string;
  successMessage: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailErrorPrefix: string;
  messageLabel: string;
  messagePlaceholder: string;
  messageErrorPrefix: string;
  sending: string;
  send: string;
  professionalTitle: string;
}

type ContactResponse = Record<'en' | 'de', ContactContent>;

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
}

interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  note: string;
  thesis: string;
  proof: CertificateProof | null;
}

interface CertificateItem {
  name: string;
  proof: CertificateProof | null;
}

interface ResumeContent {
  eyebrow: string;
  title: string;
  lead: string;
  experienceTitle: string;
  educationTitle: string;
  skillsTitle: string;
  certificatesTitle: string;
  sailingTitle?: string;
  sailingLicenses?: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certificates: CertificateItem[];
}

interface ResumeResponse {
  en: ResumeContent;
  de: ResumeContent;
  skills: string[];
}

export default function Contact() {
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const honeypot = (e.currentTarget.elements.namedItem('_gotcha') as HTMLInputElement | null)?.value;
    if (honeypot) {
      e.preventDefault();
      return;
    }
    handleSubmit(e);
  };
  const { i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'en';

  const [contact, setContact] = useState<ContactResponse | null>(null);
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [openProof, setOpenProof] = useState<CertificateItem | null>(null);

  useEffect(() => {
    fetch('/api/contact').then((res) => res.json()).then(setContact);
    fetch('/api/resume').then((res) => res.json()).then(setResume);
  }, []);

  if (!contact || !resume) {
    return (
      <main className="contact-page">
        <Navbar currentPage="/contact" />
      </main>
    );
  }

  const c = contact[lang];
  const r = resume[lang];

  return (
    <main className="contact-page">
      <Navbar currentPage="/contact" />

      <section className="contact-hero">
        <PigeonBackground />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <p className="legacy-eyebrow">{c.eyebrow}</p>
          <h1>{c.title}</h1>
          <p className="contact-hero-lead">{c.lead}</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <aside className="contact-profile-card">
              <SiteImage
                src="/images/contact-portrait.jpg"
                alt="Daniel Mohles"
                width={900}
                height={1200}
                sizes="(max-width: 768px) 100vw, 360px"
                loading="eager"
                style={{ height: 'auto' }}
                className="contact-portrait"
              />

              <div className="contact-profile-body">
                <h3 className="contact-profile-name">Daniel Mohles</h3>
                <p className="contact-profile-tagline">{c.professionalTitle}</p>
              </div>
            </aside>

            <div className="contact-form-card">
              <h3>{c.sendMessage}</h3>
              <p className="contact-social-note">
                {lang === 'de' ? 'Du erreichst mich auch über ' : 'You can also reach me via '}
                {socialLinks
                  .filter((link) => CONTACT_SOCIAL_LABELS.includes(link.label))
                  .map((link, i, arr) => (
                    <span key={link.label}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                      {i < arr.length - 1 ? (lang === 'de' ? ' oder ' : ' or ') : '.'}
                    </span>
                  ))}
              </p>

              {state.succeeded ? (
                <p className="contact-form-note contact-form-note--success">{c.successMessage}</p>
              ) : (
                <form onSubmit={onFormSubmit}>
                  {/* Honeypot: hidden from real users, but bots tend to fill every field. Formspree also drops any submission with _gotcha set, so bots posting straight to Formspree are filtered too. */}
                  <input
                    type="text"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="contact-honeypot"
                  />

                  <div className="contact-field">
                    <label htmlFor="email">{c.emailLabel}</label>
                    <input id="email" type="email" name="email" placeholder={c.emailPlaceholder} required />
                    <ValidationError
                      className="contact-form-note contact-form-note--error"
                      prefix={c.emailErrorPrefix}
                      field="email"
                      errors={state.errors}
                    />
                  </div>

                  <div className="contact-field contact-field--grow">
                    <label htmlFor="message">{c.messageLabel}</label>
                    <textarea id="message" name="message" placeholder={c.messagePlaceholder} required />
                    <ValidationError
                      className="contact-form-note contact-form-note--error"
                      prefix={c.messageErrorPrefix}
                      field="message"
                      errors={state.errors}
                    />
                  </div>

                  <label className="contact-privacy-check">
                    <input type="checkbox" name="privacyConsent" required />
                    <span>
                      {lang === 'de' ? 'Ich habe die ' : 'I have read and accept the '}
                      <Link href="/datenschutz">
                        {lang === 'de' ? 'Datenschutzerklärung' : 'privacy policy'}
                      </Link>
                      {lang === 'de' ? ' gelesen und akzeptiere sie.' : '.'}
                    </span>
                  </label>

                  <ValidationError className="contact-form-note contact-form-note--error" errors={state.errors} />

                  <button type="submit" className="btn legacy-cta contact-submit-btn" disabled={state.submitting}>
                    {state.submitting ? c.sending : c.send}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="resume-section">
        <div className="container">
          <div className="resume-header">
            <p className="legacy-eyebrow">{r.eyebrow}</p>
            <h2>{r.title}</h2>
            <p className="resume-lead">{r.lead}</p>
          </div>

          <div className="resume-grid">
            <div className="resume-card">
              <h3>{r.experienceTitle}</h3>
              <div className="resume-timeline">
                {r.experience.map((item) => (
                  <div className="timeline-item" key={item.role + item.period}>
                    <span className="timeline-date">{item.period}</span>
                    <span className="timeline-rail">
                      <span className="timeline-marker" />
                    </span>
                    <div className="timeline-content">
                      <strong>{item.role}</strong>
                      <span className="timeline-company">{item.company}</span>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="resume-side">
              <div className="resume-card">
                <h3>{r.educationTitle}</h3>
                <div className="resume-timeline resume-timeline--compact">
                  {r.education.map((item) => (
                    <div className="timeline-item" key={item.degree}>
                      <span className="timeline-date">{item.period}</span>
                      <span className="timeline-rail">
                        <span className="timeline-marker" />
                      </span>
                      <div className="timeline-content">
                        <strong>{item.degree}</strong>
                        <span className="timeline-company">{item.institution}</span>
                        {item.note && (
                          <p className="timeline-note">
                            {item.proof ? (
                              <button
                                type="button"
                                className="resume-cert-proof"
                                onClick={() => setOpenProof({ name: `${item.degree}, ${item.institution}`, proof: item.proof })}
                                aria-haspopup="dialog"
                              >
                                {item.note}
                                <span className="resume-cert-proof-hint">{lang === 'de' ? 'Nachweis' : 'Proof'}</span>
                              </button>
                            ) : (
                              item.note
                            )}
                          </p>
                        )}
                        {item.thesis && <p className="timeline-thesis">{item.thesis}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="resume-card">
                <h3>{r.skillsTitle}</h3>
                <div className="resume-tags">
                  {resume.skills.map((skill) => (
                    <span key={skill} className="resume-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="resume-card">
                <h3>{r.certificatesTitle}</h3>
                <ul className="resume-cert-list">
                  {r.certificates.map((cert) => (
                    <li key={cert.name}>
                      {cert.proof ? (
                        <button
                          type="button"
                          className="resume-cert-proof"
                          onClick={() => setOpenProof(cert)}
                          aria-haspopup="dialog"
                        >
                          {cert.name}
                          <span className="resume-cert-proof-hint">{lang === 'de' ? 'Nachweis' : 'Proof'}</span>
                        </button>
                      ) : (
                        cert.name
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {r.sailingLicenses && r.sailingLicenses.length > 0 && (
                <div className="resume-card">
                  <h3>{r.sailingTitle}</h3>
                  <ul className="resume-cert-list">
                    {r.sailingLicenses.map((license) => (
                      <li key={license}>{license}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {openProof?.proof && (
        <CertificateProofDialog
          name={openProof.name}
          proof={openProof.proof}
          onClose={() => setOpenProof(null)}
          labels={
            lang === 'de'
              ? { close: 'Schließen', openPdf: 'PDF öffnen', previewAlt: 'Nachweis', page: 'Seite' }
              : { close: 'Close', openPdf: 'Open PDF', previewAlt: 'Proof', page: 'page' }
          }
        />
      )}

      <Footer />
    </main>
  );
}
