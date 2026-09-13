'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { GithubIcon, ExternalLinkIcon } from '@/app/components/Icons';
import { CodeEditorBackground } from '@/app/components/backgrounds/CodeEditorBackground';

type ProjectStatus = 'completed' | 'in-progress';

interface ProjectLink {
  label: string;
  url: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[];
  status: ProjectStatus;
  tags: string[];
  link?: ProjectLink;
}

interface ProjectsContent {
  eyebrow: string;
  title: string;
  lead: string;
  filterAriaLabel: string;
  statTotal: string;
  statCompleted: string;
  statInProgress: string;
  filters: { id: 'all' | ProjectStatus; label: string }[];
  statusLabel: Record<ProjectStatus, string>;
  photos: string;
  viewDetails: string;
  close: string;
  previousImage: string;
  nextImage: string;
  projects: Project[];
}

type ProjectsResponse = Record<'en' | 'de', ProjectsContent>;

const goToImageLabel = (lang: 'en' | 'de', i: number) => (lang === 'de' ? `Zu Bild ${i} springen` : `Go to image ${i}`);

export default function Projects() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'en';
  const [data, setData] = useState<ProjectsResponse | null>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then(setData);
  }, []);

  const [activeFilter, setActiveFilter] = useState<'all' | ProjectStatus>('all');
  const [selected, setSelected] = useState<Project | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const projects = data ? data[lang].projects : [];
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const inProgressCount = projects.filter((p) => p.status === 'in-progress').length;
  const filteredProjects = activeFilter === 'all' ? projects : projects.filter((p) => p.status === activeFilter);
  const gallery = selected ? selected.images ?? [selected.image] : [];

  useEffect(() => {
    setSlideIndex(0);
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
      if (e.key === 'ArrowRight') setSlideIndex((i) => (i + 1) % gallery.length);
      if (e.key === 'ArrowLeft') setSlideIndex((i) => (i - 1 + gallery.length) % gallery.length);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [selected, gallery.length]);

  if (!data) {
    return (
      <main className="projects-page">
        <Navbar currentPage="/projects" />
      </main>
    );
  }

  const c = data[lang];

  return (
    <main className="projects-page">
      <Navbar currentPage="/projects" />

      <section className="projects-hero">
        <CodeEditorBackground />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <p className="legacy-eyebrow">{c.eyebrow}</p>
          <h1>{c.title}</h1>
          <p className="projects-hero-lead">{c.lead}</p>
          <div className="projects-stats">
            <div className="projects-stat">
              <strong>{projects.length}</strong>
              <span>{c.statTotal}</span>
            </div>
            <div className="projects-stat">
              <strong>{completedCount}</strong>
              <span>{c.statCompleted}</span>
            </div>
            <div className="projects-stat">
              <strong>{inProgressCount}</strong>
              <span>{c.statInProgress}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="projects-section">
        <div className="container">
          <div className="projects-filter" role="tablist" aria-label={c.filterAriaLabel}>
            {c.filters.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={activeFilter === f.id}
                className={`projects-filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
                <span className="projects-filter-count">
                  {f.id === 'all' ? projects.length : projects.filter((p) => p.status === f.id).length}
                </span>
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="project-card"
                onClick={() => setSelected(project)}
              >
                <div className="project-card-media">
                  <img src={project.image} alt={project.title} loading="lazy" />
                  <span className={`project-status project-status--${project.status}`}>
                    {c.statusLabel[project.status]}
                  </span>
                  {project.images && (
                    <span className="project-gallery-badge">{project.images.length} {c.photos}</span>
                  )}
                </div>
                <div className="project-card-body">
                  <h3>{project.title}</h3>
                  <p className="project-card-desc">{project.description}</p>
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="project-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="project-card-footer">
                    <span className="project-card-cta">
                      {c.viewDetails} <span aria-hidden="true">&rarr;</span>
                    </span>
                    {project.link && (
                      <a
                        href={project.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link-btn"
                        aria-label={project.link.label}
                        title={project.link.label}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {project.link.url.includes('github.com') ? <GithubIcon /> : <ExternalLinkIcon />}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selected && (
        <div
          className="project-modal-overlay"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
        >
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="project-modal-close"
              onClick={() => setSelected(null)}
              aria-label={c.close}
            >
              &times;
            </button>
            <div className="project-modal-media">
              <img src={gallery[slideIndex]} alt={`${selected.title} ${slideIndex + 1}`} className="project-modal-image" />
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    className="project-modal-nav project-modal-nav--prev"
                    onClick={() => setSlideIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                    aria-label={c.previousImage}
                  >
                    &#8249;
                  </button>
                  <button
                    type="button"
                    className="project-modal-nav project-modal-nav--next"
                    onClick={() => setSlideIndex((i) => (i + 1) % gallery.length)}
                    aria-label={c.nextImage}
                  >
                    &#8250;
                  </button>
                  <div className="project-modal-dots">
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`project-modal-dot ${i === slideIndex ? 'active' : ''}`}
                        onClick={() => setSlideIndex(i)}
                        aria-label={goToImageLabel(lang, i + 1)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="project-modal-body">
              <span className={`project-status project-status--${selected.status}`}>
                {c.statusLabel[selected.status]}
              </span>
              <h2>{selected.title}</h2>
              <div className="project-tags">
                {selected.tags.map((tag) => (
                  <span key={tag} className="project-tag">{tag}</span>
                ))}
              </div>
              <p>{selected.description}</p>
              {selected.link && (
                <a
                  href={selected.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-modal-link"
                >
                  {selected.link.url.includes('github.com') ? <GithubIcon /> : <ExternalLinkIcon />}
                  {selected.link.label}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
