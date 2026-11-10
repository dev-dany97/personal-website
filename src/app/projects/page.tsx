'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize2 } from 'lucide-react';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { GithubIcon, ExternalLinkIcon } from '@/app/components/Icons';
import { CodeEditorBackground } from '@/app/components/backgrounds/CodeEditorBackground';
import { SiteImage } from '@/app/components/SiteImage';
import { ImageLightbox, useSwipe } from '@/app/components/ImageLightbox';

type ProjectStatus = 'completed' | 'active' | 'experimental';

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
  year: number | null;
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
  topicsAriaLabel: string;
  topicAll: string;
  searchLabel: string;
  searchPlaceholder: string;
  filterByTag: string;
  resultCount: string;
  emptyState: string;
  resetFilters: string;
  projects: Project[];
}

type ProjectsResponse = Record<'en' | 'de', ProjectsContent>;

// A tag counts as a topic chip once at least this many projects share it.
// Rarer tags stay reachable by clicking them on a project card.
const MIN_PROJECTS_PER_TOPIC = 2;

// Tags are translated per language. The English tag is the canonical key, so a
// chosen topic survives a language switch and works in a shared ?tag= link.
function buildTagMaps(data: ProjectsResponse) {
  const toEn = new Map<string, string>();
  const fromEn = { en: new Map<string, string>(), de: new Map<string, string>() };
  data.en.projects.forEach((p) => {
    const de = data.de.projects.find((d) => d.id === p.id);
    p.tags.forEach((tag, i) => {
      const deTag = de?.tags[i] ?? tag;
      toEn.set(tag.toLowerCase(), tag);
      toEn.set(deTag.toLowerCase(), tag);
      fromEn.en.set(tag, tag);
      fromEn.de.set(tag, deTag);
    });
  });
  return { toEn, fromEn };
}

const goToImageLabel = (lang: 'en' | 'de', i: number) => (lang === 'de' ? `Zu Bild ${i} springen` : `Go to image ${i}`);
const openFullscreenLabel = (lang: 'en' | 'de') => (lang === 'de' ? 'Bild im Vollbild anzeigen' : 'View image fullscreen');

export default function Projects() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'en';
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null); // canonical (English) tag

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((json: ProjectsResponse) => {
        setData(json);
        // Pick up a shared link such as /projects?tag=Raspberry%20Pi.
        const fromUrl = new URLSearchParams(window.location.search).get('tag');
        const canonical = fromUrl ? buildTagMaps(json).toEn.get(fromUrl.toLowerCase()) : undefined;
        if (canonical) setActiveTag(canonical);
      });
  }, []);

  const [activeFilter, setActiveFilter] = useState<'all' | ProjectStatus>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const tagMaps = useMemo(() => (data ? buildTagMaps(data) : null), [data]);

  // Keep the URL in sync so a filtered view can be shared.
  useEffect(() => {
    if (!tagMaps) return;
    const url = new URL(window.location.href);
    if (activeTag) url.searchParams.set('tag', activeTag);
    else url.searchParams.delete('tag');
    window.history.replaceState(null, '', url);
  }, [activeTag, tagMaps]);

  const projects = data ? data[lang].projects : [];
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const inProgressCount = projects.filter((p) => p.status === 'active').length;

  const activeTagLabel = activeTag && tagMaps ? tagMaps.fromEn[lang].get(activeTag) ?? activeTag : null;
  const normalizedQuery = query.trim().toLowerCase();
  const matchesTopicAndSearch = (p: Project) =>
    (!activeTagLabel || p.tags.includes(activeTagLabel)) &&
    (!normalizedQuery ||
      [p.title, p.description, ...p.tags].some((text) => text.toLowerCase().includes(normalizedQuery)));
  const matchesStatus = (p: Project) => activeFilter === 'all' || p.status === activeFilter;

  const filteredProjects = projects.filter((p) => matchesStatus(p) && matchesTopicAndSearch(p));
  const hasActiveFilters = activeFilter !== 'all' || activeTag !== null || normalizedQuery !== '';

  // Topics: tags shared by several projects, most common first. Counts follow the status filter.
  const tagCounts = new Map<string, number>();
  projects.forEach((p) => p.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)));
  const topics = [...tagCounts.entries()]
    .filter(([, n]) => n >= MIN_PROJECTS_PER_TOPIC)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], lang))
    .map(([tag]) => tag);
  // A tag picked from a card shows up as a chip too, even if it is rare.
  const topicChips = activeTagLabel && !topics.includes(activeTagLabel) ? [...topics, activeTagLabel] : topics;

  const toggleTag = (label: string) => {
    const canonical = tagMaps?.toEn.get(label.toLowerCase()) ?? label;
    setActiveTag((current) => (current === canonical ? null : canonical));
  };
  const resetFilters = () => {
    setActiveFilter('all');
    setActiveTag(null);
    setQuery('');
  };
  const gallery = selected ? selected.images ?? [selected.image] : [];
  const stepSlide = (step: 1 | -1) => setSlideIndex((i) => (i + step + gallery.length) % gallery.length);
  const modalSwipe = useSwipe((dir) => gallery.length > 1 && stepSlide(dir));
  const closeModal = () => { setFullscreen(false); setSelected(null); };

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
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
                  {projects.filter((p) => (f.id === 'all' || p.status === f.id) && matchesTopicAndSearch(p)).length}
                </span>
              </button>
            ))}
          </div>

          <div className="projects-topics" role="group" aria-label={c.topicsAriaLabel}>
            <button
              type="button"
              aria-pressed={activeTag === null}
              className={`projects-topic-btn ${activeTag === null ? 'active' : ''}`}
              onClick={() => setActiveTag(null)}
            >
              {c.topicAll}
            </button>
            {topicChips.map((tag) => {
              const isActive = tag === activeTagLabel;
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={isActive}
                  className={`projects-topic-btn ${isActive ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  <span className="projects-filter-count">
                    {projects.filter((p) => matchesStatus(p) && p.tags.includes(tag)).length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="projects-search-row">
            <input
              type="search"
              className="projects-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={c.searchPlaceholder}
              aria-label={c.searchLabel}
            />
            <p className="projects-result-count" aria-live="polite">
              {c.resultCount.replace('{count}', String(filteredProjects.length)).replace('{total}', String(projects.length))}
              {hasActiveFilters && (
                <button type="button" className="projects-reset-btn" onClick={resetFilters}>
                  {c.resetFilters}
                </button>
              )}
            </p>
          </div>

          {filteredProjects.length === 0 && (
            <div className="projects-empty">
              <p>{c.emptyState}</p>
              <button type="button" className="projects-filter-btn" onClick={resetFilters}>
                {c.resetFilters}
              </button>
            </div>
          )}

          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="project-card"
                onClick={() => { setSelected(project); setSlideIndex(0); }}
              >
                <div className="project-card-media">
                  <SiteImage src={project.image} alt={project.title} width={800} height={420} sizes="(max-width: 768px) 100vw, 400px" />
                  <span className={`project-status project-status--${project.status}`}>
                    {c.statusLabel[project.status]}
                    {project.year && <span className="project-status-year">{project.year}</span>}
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
                      <button
                        key={tag}
                        type="button"
                        className={`project-tag project-tag--button ${tag === activeTagLabel ? 'active' : ''}`}
                        title={c.filterByTag}
                        aria-pressed={tag === activeTagLabel}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTag(tag);
                        }}
                      >
                        {tag}
                      </button>
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
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
        >
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="project-modal-close"
              onClick={closeModal}
              aria-label={c.close}
            >
              &times;
            </button>
            <div className="project-modal-media" {...modalSwipe}>
              <button
                type="button"
                className="project-modal-zoom"
                onClick={() => setFullscreen(true)}
                aria-label={openFullscreenLabel(lang)}
                title={openFullscreenLabel(lang)}
              >
                <SiteImage src={gallery[slideIndex]} alt={`${selected.title} ${slideIndex + 1}`} className="project-modal-image" width={1200} height={800} sizes="(max-width: 800px) 100vw, 800px" style={{ height: 'auto' }} />
                <span className="project-modal-zoom-hint" aria-hidden="true">
                  <Maximize2 size={16} />
                </span>
              </button>
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    className="project-modal-nav project-modal-nav--prev"
                    onClick={() => stepSlide(-1)}
                    aria-label={c.previousImage}
                  >
                    &#8249;
                  </button>
                  <button
                    type="button"
                    className="project-modal-nav project-modal-nav--next"
                    onClick={() => stepSlide(1)}
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
                {selected.year && <span className="project-status-year">{selected.year}</span>}
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

      {selected && fullscreen && (
        <ImageLightbox
          images={gallery}
          index={slideIndex}
          alt={selected.title}
          onIndexChange={setSlideIndex}
          onClose={() => setFullscreen(false)}
          labels={{ close: c.close, previous: c.previousImage, next: c.nextImage }}
        />
      )}

      <Footer />
    </main>
  );
}
