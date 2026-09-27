'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

interface NavbarProps {
  currentPage?: string;
}

export function Navbar({ currentPage }: NavbarProps) {
  const { i18n, t } = useTranslation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
      const nextTheme = savedTheme || 'dark';
      setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/projects', label: t('nav.projects') },
    { href: '/setup', label: t('nav.setup') },
    { href: '/travel', label: t('nav.travel') },
    { href: '/finance', label: t('nav.finance') },
    { href: '/contact', label: t('nav.contact') },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === 'de' ? 'en' : 'de';
    i18n.changeLanguage(newLang);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <>
    <nav className="navbar navbar-expand-lg sticky-top legacy-navbar">
      <div className="container px-4 px-lg-5">
        <Link href="/" className="navbar-brand fw-bold d-flex align-items-center gap-2" onClick={() => setMenuOpen(false)}>
          <img
            src="/favicon.ico"
            alt="Daniel Mohles logo"
            className="navbar-logo"
            style={{
              width: '28px',
              height: '28px',
              objectFit: 'contain'
            }}
          />
          <span>Daniel Mohles</span>
        </Link>
        <button
          className={`navbar-toggler ${menuOpen ? 'navbar-toggler--open' : ''}`}
          type="button"
          aria-controls="navbarNav"
          aria-expanded={menuOpen}
          aria-label={t('nav.toggleMenu')}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="navbar-toggler-bar" />
          <span className="navbar-toggler-bar" />
          <span className="navbar-toggler-bar" />
        </button>
        <div className={`navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {navItems.map((item) => (
              <li key={item.href} className="nav-item">
                <Link
                  href={item.href}
                  className={`nav-link ${currentPage === item.href ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="navbar-utility">
            <button
              onClick={toggleLanguage}
              className="btn btn-sm btn-outline-light theme-button"
              title={t('nav.toggleLanguage')}
            >
              {i18n.language === 'de' ? 'DE' : 'EN'}
            </button>
            <button
              onClick={toggleTheme}
              className="btn btn-sm btn-outline-light theme-button"
              title={t('nav.toggleTheme')}
              aria-label={t('nav.toggleTheme')}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
    {menuOpen && <div className="navbar-scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
    </>
  );
}
