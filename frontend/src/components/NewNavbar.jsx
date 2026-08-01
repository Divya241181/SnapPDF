import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import axios from 'axios';
import { LayoutDashboard, PlusCircle, LogOut, LogIn, UserPlus, User } from 'lucide-react';

const PAGES = [
  { path: '/features', label: 'Features' },
  { path: '/security', label: 'Security' },
  { path: '/mission', label: 'Mission' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

export default function NewNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className={`nav-wrap ${scrolled ? 'scrolled' : ''}`}>
        <nav className="nav">
          <Link to="/" className="nav-brand" aria-label="SnapPDF home" onClick={closeMenu}>
            <span className="nav-brand-mark">S</span>
            <span>SnapPDF</span>
          </Link>
          
          <div className="nav-links">
            {PAGES.map(p => (
              <Link 
                key={p.path} 
                to={p.path} 
                className={`nav-link ${location.pathname === p.path ? 'active' : ''}`}
              >
                {p.label}
              </Link>
            ))}
          </div>

          {/* We can use the global themeStore to toggle */}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            ) : (
              <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/dashboard" className="nav-link" style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link to="/create" className="btn-primary" style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                <PlusCircle className="w-4 h-4" /> Create PDF
              </Link>
            </div>
          ) : (
            <Link to="/login" className="nav-cta">Log in</Link>
          )}

          <button 
            className="nav-mobile-toggle" 
            aria-label="Menu" 
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            )}
          </button>
        </nav>
      </div>

      <div className={`mobile-menu-backdrop ${menuOpen ? 'open' : ''}`} onClick={closeMenu}></div>
      <aside className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-links">
          <Link to="/" className={`mobile-menu-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMenu}>
            <span>Home</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </Link>
          {PAGES.map(p => (
            <Link key={p.path} to={p.path} className={`mobile-menu-link ${location.pathname === p.path ? 'active' : ''}`} onClick={closeMenu}>
              <span>{p.label}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="mobile-menu-link" onClick={closeMenu}>
                <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4"/> Dashboard</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/profile" className="mobile-menu-link" onClick={closeMenu}>
                <span className="flex items-center gap-2"><User className="w-4 h-4"/> Profile</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Link>
              <div className="mobile-menu-link text-rose-500 cursor-pointer" onClick={handleLogout}>
                <span className="flex items-center gap-2"><LogOut className="w-4 h-4"/> Logout</span>
              </div>
            </>
          )}
        </div>
        {!isAuthenticated ? (
          <Link to="/login" className="mobile-menu-cta" onClick={closeMenu}>Log in →</Link>
        ) : (
          <Link to="/create" className="mobile-menu-cta" onClick={closeMenu}>Create PDF →</Link>
        )}
      </aside>
    </>
  );
}
