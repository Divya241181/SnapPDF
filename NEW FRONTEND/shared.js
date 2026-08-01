/* SnapPDF — shared behavior: theme toggle, nav scroll, reveal-on-scroll, nav injection */

(function () {
  // ---- Theme ----
  const STORAGE_KEY = 'snappdf-theme';
  const root = document.documentElement;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') {
    root.setAttribute('data-theme', saved);
  } else {
    root.setAttribute('data-theme', 'light');
  }

  function toggleTheme() {
    const cur = root.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  // ---- Nav injection ----
  const PAGES = [
    { href: 'features.html', label: 'Features' },
    { href: 'security.html', label: 'Security' },
    { href: 'mission.html', label: 'Mission' },
    { href: 'about.html', label: 'About' },
    { href: 'contact.html', label: 'Contact' },
  ];

  function currentPage() {
    const p = location.pathname.split('/').pop() || 'index.html';
    return p;
  }

  function buildNav() {
    const wrap = document.querySelector('[data-nav]');
    if (!wrap) return;
    const cur = currentPage();
    wrap.innerHTML = `
      <div class="nav-wrap" id="navWrap">
        <nav class="nav">
          <a href="index.html" class="nav-brand" aria-label="SnapPDF home">
            <span class="nav-brand-mark">S</span>
            <span>SnapPDF</span>
          </a>
          <div class="nav-links">
            ${PAGES.map(p => `<a href="${p.href}" class="nav-link ${cur === p.href ? 'active' : ''}">${p.label}</a>`).join('')}
          </div>
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
            <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          </button>
          <a href="index.html#try" class="nav-cta">Try free</a>
          <button class="nav-mobile-toggle" id="mobileMenuBtn" aria-label="Menu" aria-expanded="false">
            <svg id="menuIconOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
          </button>
        </nav>
      </div>

      <div class="mobile-menu-backdrop" id="mobileMenuBackdrop"></div>
      <aside class="mobile-menu" id="mobileMenu" aria-hidden="true">
        <div class="mobile-menu-links">
          <a href="index.html" class="mobile-menu-link ${cur === 'index.html' ? 'active' : ''}">
            <span>Home</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </a>
          ${PAGES.map(p => `<a href="${p.href}" class="mobile-menu-link ${cur === p.href ? 'active' : ''}">
            <span>${p.label}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </a>`).join('')}
        </div>
        <a href="index.html#try" class="mobile-menu-cta">Start scanning free →</a>
      </aside>
    `;
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    const navWrap = document.getElementById('navWrap');
    const onScroll = () => {
      if (window.scrollY > 20) navWrap.classList.add('scrolled');
      else navWrap.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu logic
    const mBtn = document.getElementById('mobileMenuBtn');
    const mMenu = document.getElementById('mobileMenu');
    const mBackdrop = document.getElementById('mobileMenuBackdrop');
    function closeMenu() {
      mMenu.classList.remove('open');
      mBackdrop.classList.remove('open');
      mBtn.setAttribute('aria-expanded', 'false');
      mMenu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
      mBtn.querySelector('svg').innerHTML = '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>';
    }
    function openMenu() {
      mMenu.classList.add('open');
      mBackdrop.classList.add('open');
      mBtn.setAttribute('aria-expanded', 'true');
      mMenu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
      mBtn.querySelector('svg').innerHTML = '<line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/>';
    }
    mBtn.addEventListener('click', () => {
      if (mMenu.classList.contains('open')) closeMenu();
      else openMenu();
    });
    mBackdrop.addEventListener('click', closeMenu);
    mMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  // ---- Footer injection ----
  function buildFooter() {
    const wrap = document.querySelector('[data-footer]');
    if (!wrap) return;
    wrap.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="index.html" class="nav-brand">
                <span class="nav-brand-mark">S</span>
                <span>SnapPDF</span>
              </a>
              <p>Instant PDFs from any camera, any device. Built for the modern desk.</p>
            </div>
            <div class="footer-col">
              <h4>Product</h4>
              <a href="features.html">Features</a>
              <a href="security.html">Security</a>
              <a href="index.html#pricing">Pricing</a>
              <a href="index.html#changelog">Changelog</a>
            </div>
            <div class="footer-col">
              <h4>Company</h4>
              <a href="about.html">About</a>
              <a href="mission.html">Mission</a>
              <a href="contact.html">Contact</a>
              <a href="index.html#careers">Careers</a>
            </div>
            <div class="footer-col">
              <h4>Legal</h4>
              <a href="privacy.html">Privacy</a>
              <a href="terms.html">Terms</a>
              <a href="security.html">Security</a>
              <a href="index.html#dpa">DPA</a>
            </div>
            <div class="footer-col">
              <h4>Resources</h4>
              <a href="index.html#docs">Docs</a>
              <a href="index.html#api">API</a>
              <a href="index.html#status">Status</a>
              <a href="contact.html">Support</a>
            </div>
          </div>
          <div class="footer-bottom">
            <div>© 2026 SnapPDF Labs, Inc. · Made with precision.</div>
            <div class="footer-social">
              <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
              <a href="#" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-1.97c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.02 11.02 0 015.79 0c2.2-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .31.21.68.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"/></svg></a>
              <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.4v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg></a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // ---- Reveal on scroll ----
  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 80px 0px' });
    els.forEach(e => io.observe(e));

    // Safety net: fire reveal after 400ms for anything in/near view
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 200) el.classList.add('in');
      });
    }, 400);

    // Scroll safety net: on any scroll, sweep for near-viewport reveals
    let scrollRaf = null;
    window.addEventListener('scroll', () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        document.querySelectorAll('.reveal:not(.in)').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight - 40) el.classList.add('in');
        });
      });
    }, { passive: true });
  }

  // ---- Init ----
  function init() {
    buildNav();
    buildFooter();
    setupReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for pages
  window.SnapPDF = { toggleTheme, setupReveal };
})();
