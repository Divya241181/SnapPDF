import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '48px' }}>
          <div className="footer-brand" style={{ maxWidth: '320px' }}>
            <Link to="/" className="nav-brand">
              <span className="nav-brand-mark">S</span>
              <span>SnapPDF</span>
            </Link>
            <p>Instant PDFs from any camera, any device. Built for the modern desk.</p>
          </div>
          <div style={{ display: 'flex', gap: '80px', flexWrap: 'wrap' }}>
            <div className="footer-col">
              <h4>PRODUCT</h4>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/create">Create PDF</Link>
              <Link to="/features">Features</Link>
              <Link to="/security">Security</Link>
            </div>
            <div className="footer-col">
              <h4>COMPANY</h4>
              <Link to="/about">About</Link>
              <Link to="/mission">Mission</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="footer-col">
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '24px' }}>Contact</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                <a href="mailto:team.snappdf@gmail.com" style={{ color: 'var(--text-muted)', fontSize: '15px', textDecoration: 'none', margin: 0, padding: 0, display: 'inline' }}>team.snappdf@gmail.com</a>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#022c22', padding: '10px 16px', borderRadius: '100px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', lineHeight: 1.2 }}>SYSTEM</span>
                  <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', lineHeight: 1.2 }}>OPERATIONAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div style={{ color: 'var(--text-muted)' }}>© 2026 SnapPDF. All rights reserved. Made with ❤️ by SnapPDF Team.</div>
          <div className="footer-social">
            <a href="#" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-1.97c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.02 11.02 0 015.79 0c2.2-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .31.21.68.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"/>
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.4v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
