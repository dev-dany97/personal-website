'use client';

import { useEffect, useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { PigeonBackground } from '@/app/components/backgrounds/PigeonBackground';
import { socialLinks } from '@/app/components/Icons';

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
}

interface ResumeContent {
  eyebrow: string;
  title: string;
  lead: string;
  experienceTitle: string;
  educationTitle: string;
  skillsTitle: string;
  certificatesTitle: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  certificates: string[];
}

interface ResumeResponse {
  en: ResumeContent;
  de: ResumeContent;
  skills: string[];
}

export default function Contact() {
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const honeypot = (e.currentTarget.elements.namedItem('company') as HTMLInputElement | null)?.value;
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
              <img
                src="/images/contact-portrait.jpg"
                alt="Daniel Mohles"
                className="contact-portrait"
              />

              <div className="contact-profile-body">
                <h3 className="contact-profile-name">Daniel Mohles</h3>
                <p className="contact-profile-tagline">{c.professionalTitle}</p>

                <div className="contact-social">
                  {socialLinks
                    .filter((link) => CONTACT_SOCIAL_LABELS.includes(link.label))
                    .map(({ label, href, Icon }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="social-icon-btn"
                      >
                        <Icon />
                      </a>
                    ))}
                </div>
              </div>
            </aside>

            <div className="contact-form-card">
              <h3>{c.sendMessage}</h3>

              {state.succeeded ? (
                <p className="contact-form-note contact-form-note--success">{c.successMessage}</p>
              ) : (
                <form onSubmit={onFormSubmit}>
                  {/* Honeypot: hidden from real users, but bots tend to fill every field. */}
                  <input
                    type="text"
                    name="company"
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
                        {item.note && <p className="timeline-note">{item.note}</p>}
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
                    <li key={cert}>{cert}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
