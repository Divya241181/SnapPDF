import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal';

export default function Landing() {
  useReveal();

  const [heroVariant, setHeroVariant] = useState('A');
  const [demoState, setDemoState] = useState('idle');
  const [processStage, setProcessStage] = useState('Detecting edges · Deskew · OCR');
  const [doneSize, setDoneSize] = useState('184 KB');
  const [statusRight, setStatusRight] = useState('Ready');
  const [downloadBtnText, setDownloadBtnText] = useState('Download');
  const [isDragOver, setIsDragOver] = useState(false);

  const processTimerRef = useRef(null);

  const stages = [
    { label: 'Detecting edges…', duration: 500 },
    { label: 'Deskewing image…', duration: 400 },
    { label: 'Enhancing contrast…', duration: 400 },
    { label: 'Running OCR…', duration: 500 },
    { label: 'Encrypting file…', duration: 400 },
  ];

  const runProcess = () => {
    setDemoState('processing');
    setStatusRight('Processing…');
    let i = 0;

    const step = () => {
      if (i >= stages.length) {
        const size = (120 + Math.floor(Math.random() * 200));
        setDoneSize(size + ' KB');
        setDemoState('done');
        setStatusRight('Complete · ' + size + ' KB');
        return;
      }
      const stage = stages[i];
      setProcessStage(stage.label);
      i++;
      processTimerRef.current = setTimeout(step, stage.duration);
    };
    step();
  };

  const resetProcess = () => {
    if (processTimerRef.current) {
      clearTimeout(processTimerRef.current);
      processTimerRef.current = null;
    }
    setDemoState('idle');
    setStatusRight('Ready');
  };

  const handleDownload = () => {
    setDownloadBtnText('Downloaded ✓');
    setTimeout(() => { setDownloadBtnText('Download'); }, 1400);
  };

  // Stats Animation
  const [pdfCount, setPdfCount] = useState(0);
  const [scanTime, setScanTime] = useState(0);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const animateValue = (setFn, end, decimals, duration) => {
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = end * eased;
        setFn(Number(val.toFixed(decimals)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateValue(setPdfCount, 12, 0, 1400);
          animateValue(setScanTime, 0.4, 1, 1400);
          animateValue(setUptime, 99.99, 2, 1400);
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });

    const statsSection = document.getElementById('stats-section');
    if (statsSection) observer.observe(statsSection);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-mesh"></div>
          <div className="grid-lines"></div>
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
        </div>

        <div className="container hero-inner">
          <div className="hero-badge reveal">
            <span className="dot"></span>
            <span>Now with real-time OCR · v3.2</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </div>

          <h1 className="display hero-title reveal reveal-delay-1">
            Create PDFs<br/>
            <span className="hero-title-accent">on the go.</span><br/>
            Anywhere, instantly.
          </h1>

          <p className="lede hero-lede reveal reveal-delay-2">
            Turn any photo or camera scan into a crisp, shareable PDF in one tap.<br/>
            Enterprise-grade encryption. No sign-up required.
          </p>

          <div className="hero-cta reveal reveal-delay-3">
            <a href="#try" className="btn btn-glow">
              Start scanning free
              <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
            <a href="#watch" className="btn btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Watch demo
              <span className="text-muted mono" style={{fontSize:'12px', marginLeft:'4px'}}>1:24</span>
            </a>
          </div>

          <div className="hero-showcase reveal reveal-delay-4" id="heroShowcase">
            {/* Variation A: Interactive drop-zone demo */}
            <div className="showcase-variant" data-variant="A" data-active={heroVariant === 'A' ? 'true' : 'false'}>
              <div className="demo-frame">
                <div className="demo-window">
                  <div className="demo-window-bar">
                    <div className="demo-dots"><span></span><span></span><span></span></div>
                    <div className="demo-url mono">snappdf.app/new</div>
                    <div className="demo-window-actions">
                      <div className="demo-icon-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg></div>
                    </div>
                  </div>
                  <div className="demo-body">
                    <div className="demo-sidebar">
                      <div className="demo-side-item active">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M8 8h8M8 16h5"/></svg>
                        <span>New scan</span>
                      </div>
                      <div className="demo-side-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M4 9h16"/></svg><span>Library</span></div>
                      <div className="demo-side-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>Recent</span></div>
                      <div className="demo-side-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H4v12h12"/><path d="M8 4h8M16 16l4 4M20 20l-4-4"/></svg><span>Shared</span></div>
                      <div className="demo-side-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="3"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg><span>Team</span></div>
                      <div className="demo-sidebar-footer">
                        <div className="demo-side-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6z"/></svg><span>Encrypted</span></div>
                      </div>
                    </div>
                    <div className="demo-canvas">
                      <div className="demo-toolbar">
                        <div className="demo-tabs">
                          <span className="demo-tab active">Upload</span>
                          <span className="demo-tab">Camera</span>
                          <span className="demo-tab">LAN sync</span>
                        </div>
                        <div className="demo-toolbar-right mono">72 dpi · A4</div>
                      </div>
                      <div 
                        className={`dropzone ${isDragOver ? 'drag-over' : ''}`}
                        onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); runProcess(); }}
                      >
                        <div className={`dropzone-state ${demoState === 'idle' ? 'active' : ''}`} data-state="idle">
                          <div className="dropzone-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                              <polyline points="17 8 12 3 7 8"/>
                              <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                          </div>
                          <h3 className="dropzone-title">Drop an image to make a PDF</h3>
                          <p className="dropzone-hint">JPG, PNG, HEIC · Up to 50MB · No account needed</p>
                          <button className="btn btn-primary dropzone-btn" onClick={runProcess}>
                            <span>Try with a sample</span>
                          </button>
                        </div>
                        
                        <div className={`dropzone-state ${demoState === 'processing' ? 'active' : ''}`} data-state="processing">
                          <div className="scanning">
                            <div className="scanning-doc">
                              <div className="doc-line" style={{width:'60%'}}></div>
                              <div className="doc-line" style={{width:'80%'}}></div>
                              <div className="doc-line" style={{width:'70%'}}></div>
                              <div className="doc-line" style={{width:'90%'}}></div>
                              <div className="doc-line" style={{width:'50%'}}></div>
                              <div className="doc-line" style={{width:'75%'}}></div>
                              <div className="doc-line" style={{width:'65%'}}></div>
                              <div className="scanning-beam"></div>
                            </div>
                          </div>
                          <h3 className="dropzone-title">Enhancing scan…</h3>
                          <p className="dropzone-hint mono">{processStage}</p>
                        </div>

                        <div className={`dropzone-state ${demoState === 'done' ? 'active' : ''}`} data-state="done">
                          <div className="done-preview">
                            <div className="done-pdf">
                              <div className="pdf-badge">PDF</div>
                              <div className="pdf-lines">
                                <div className="doc-line" style={{width:'70%'}}></div>
                                <div className="doc-line" style={{width:'90%'}}></div>
                                <div className="doc-line" style={{width:'55%'}}></div>
                                <div className="doc-line" style={{width:'80%'}}></div>
                                <div className="doc-line" style={{width:'65%'}}></div>
                              </div>
                            </div>
                            <div className="done-check">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                          </div>
                          <h3 className="dropzone-title">receipt-mar-2026.pdf</h3>
                          <p className="dropzone-hint mono"><span>{doneSize}</span> · Encrypted · Ready</p>
                          <div className="done-actions">
                            <button className="btn btn-glow dropzone-btn" onClick={handleDownload}>{downloadBtnText}</button>
                            <button className="btn btn-ghost dropzone-btn" onClick={resetProcess}>Scan another</button>
                          </div>
                        </div>
                      </div>
                      <div className="demo-statusbar mono">
                        <span><span className="status-dot"></span> Local processing · Zero uploads</span>
                        <span>{statusRight}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Variation B: Animated phone mockup */}
            <div className="showcase-variant" data-variant="B" data-active={heroVariant === 'B' ? 'true' : 'false'}>
              <div className="phone-showcase">
                <div className="phone-frame">
                  <div className="phone-notch"></div>
                  <div className="phone-screen">
                    <div className="phone-statusbar mono">
                      <span>9:41</span>
                      <span>◉ 5G ▮▮▮</span>
                    </div>
                    <div className="phone-header">
                      <div className="phone-title">Scan document</div>
                      <div className="phone-close">✕</div>
                    </div>
                    <div className="phone-viewfinder">
                      <div className="phone-doc">
                        <div className="doc-line" style={{width:'60%'}}></div>
                        <div className="doc-line" style={{width:'85%'}}></div>
                        <div className="doc-line" style={{width:'70%'}}></div>
                        <div className="doc-line" style={{width:'80%'}}></div>
                        <div className="doc-line" style={{width:'55%'}}></div>
                        <div className="doc-line" style={{width:'75%'}}></div>
                        <div className="doc-line" style={{width:'65%'}}></div>
                      </div>
                      <div className="phone-corners">
                        <span></span><span></span><span></span><span></span>
                      </div>
                      <div className="phone-beam"></div>
                    </div>
                    <div className="phone-actions">
                      <div className="phone-btn-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/></svg>
                      </div>
                      <div className="phone-btn-lg"><div className="phone-btn-inner"></div></div>
                      <div className="phone-btn-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="phone-float phone-float-1">
                  <div className="pdf-icon">
                    <div className="pdf-badge">PDF</div>
                  </div>
                  <div className="phone-float-text">
                    <div className="mono" style={{fontSize:'11px', color:'var(--text-faint)'}}>EXPORTED</div>
                    <div style={{fontWeight:600, fontSize:'13px'}}>invoice-042.pdf</div>
                  </div>
                </div>
                <div className="phone-float phone-float-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                  <span style={{fontSize:'13px', fontWeight:600}}>AES-256 · End-to-end</span>
                </div>
              </div>
            </div>

            {/* Variation C: Floating document stack */}
            <div className="showcase-variant" data-variant="C" data-active={heroVariant === 'C' ? 'true' : 'false'}>
              <div className="stack-showcase">
                <div className="stack-doc stack-doc-3">
                  <div className="pdf-badge">PDF</div>
                  <div className="pdf-lines">
                    <div className="doc-line" style={{width:'80%'}}></div>
                    <div className="doc-line" style={{width:'60%'}}></div>
                    <div className="doc-line" style={{width:'75%'}}></div>
                    <div className="doc-line" style={{width:'90%'}}></div>
                    <div className="doc-line" style={{width:'65%'}}></div>
                    <div className="doc-line" style={{width:'70%'}}></div>
                  </div>
                  <div className="stack-doc-label mono">contract-final.pdf</div>
                </div>
                <div className="stack-doc stack-doc-2">
                  <div className="pdf-badge">PDF</div>
                  <div className="pdf-lines">
                    <div className="doc-line" style={{width:'70%'}}></div>
                    <div className="doc-line" style={{width:'85%'}}></div>
                    <div className="doc-line" style={{width:'60%'}}></div>
                    <div className="doc-line" style={{width:'80%'}}></div>
                    <div className="doc-line" style={{width:'55%'}}></div>
                    <div className="doc-line" style={{width:'75%'}}></div>
                  </div>
                  <div className="stack-doc-label mono">receipt-jan.pdf</div>
                </div>
                <div className="stack-doc stack-doc-1">
                  <div className="pdf-badge">PDF</div>
                  <div className="pdf-lines">
                    <div className="doc-line" style={{width:'60%'}}></div>
                    <div className="doc-line" style={{width:'80%'}}></div>
                    <div className="doc-line" style={{width:'70%'}}></div>
                    <div className="doc-line" style={{width:'90%'}}></div>
                    <div className="doc-line" style={{width:'50%'}}></div>
                    <div className="doc-line" style={{width:'75%'}}></div>
                    <div className="doc-line" style={{width:'65%'}}></div>
                  </div>
                  <div className="stack-doc-label mono">passport-scan.pdf</div>
                  <div className="stack-pulse"></div>
                </div>
                <div className="stack-metric stack-metric-1 mono">
                  <div style={{fontSize:'11px', color:'var(--text-faint)'}}>SPEED</div>
                  <div style={{fontSize:'22px', fontWeight:600}}>0.4s</div>
                </div>
                <div className="stack-metric stack-metric-2 mono">
                  <div style={{fontSize:'11px', color:'var(--text-faint)'}}>SIZE</div>
                  <div style={{fontSize:'22px', fontWeight:600}}>184 KB</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO STRIP */}
      <section className="logos">
        <div className="container">
          <p className="logos-label mono reveal">Trusted by teams at</p>
          <div className="logos-track reveal">
            <div className="logos-inner">
              <span className="logo-item">Northwind</span><span className="logo-sep">·</span>
              <span className="logo-item">Acme Studios</span><span className="logo-sep">·</span>
              <span className="logo-item">Lumen Health</span><span className="logo-sep">·</span>
              <span className="logo-item">Vertex Labs</span><span className="logo-sep">·</span>
              <span className="logo-item">Fold & Co</span><span className="logo-sep">·</span>
              <span className="logo-item">Meridian</span><span className="logo-sep">·</span>
              <span className="logo-item">Halcyon</span><span className="logo-sep">·</span>
              <span className="logo-item">Fieldstone</span><span className="logo-sep">·</span>
              <span className="logo-item">Palladium</span><span className="logo-sep">·</span>
              <span className="logo-item">Ridgeline</span><span className="logo-sep">·</span>
              {/* duplicate for seamless scroll */}
              <span className="logo-item">Northwind</span><span className="logo-sep">·</span>
              <span className="logo-item">Acme Studios</span><span className="logo-sep">·</span>
              <span className="logo-item">Lumen Health</span><span className="logo-sep">·</span>
              <span className="logo-item">Vertex Labs</span><span className="logo-sep">·</span>
              <span className="logo-item">Fold & Co</span><span className="logo-sep">·</span>
              <span className="logo-item">Meridian</span><span className="logo-sep">·</span>
              <span className="logo-item">Halcyon</span><span className="logo-sep">·</span>
              <span className="logo-item">Fieldstone</span><span className="logo-sep">·</span>
              <span className="logo-item">Palladium</span><span className="logo-sep">·</span>
              <span className="logo-item">Ridgeline</span><span className="logo-sep">·</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">Feature set</p>
            <h2 className="h1 reveal reveal-delay-1">Everything you need.<br/><span className="text-muted">Nothing you don't.</span></h2>
          </div>

          <div className="features-grid">
            <div className="feature-card feature-card-lg reveal">
              <div className="feature-visual feature-visual-scan">
                <div className="scan-doc">
                  <div className="doc-line" style={{width:'60%'}}></div>
                  <div className="doc-line" style={{width:'80%'}}></div>
                  <div className="doc-line" style={{width:'70%'}}></div>
                  <div className="doc-line" style={{width:'85%'}}></div>
                  <div className="doc-line" style={{width:'55%'}}></div>
                  <div className="doc-line" style={{width:'75%'}}></div>
                </div>
                <div className="scan-beam-fx"></div>
                <div className="scan-corners"><span></span><span></span><span></span><span></span></div>
              </div>
              <div className="feature-body">
                <div className="feature-tag mono">01 · Capture</div>
                <h3 className="h3">Real-time capture</h3>
                <p className="text-muted">Auto-detect edges, deskew, and enhance in a single motion. Works with any camera — phone, webcam, or scanner.</p>
              </div>
            </div>

            <div className="feature-card reveal reveal-delay-1">
              <div className="feature-visual feature-visual-lock">
                <div className="lock-ring"></div>
                <div className="lock-ring lock-ring-2"></div>
                <svg className="lock-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="16" height="12" rx="2"/>
                  <path d="M8 10V7a4 4 0 018 0v3"/>
                </svg>
              </div>
              <div className="feature-body">
                <div className="feature-tag mono">02 · Secure</div>
                <h3 className="h3">AES-256 encryption</h3>
                <p className="text-muted">Every file, at rest and in transit. SOC 2 Type II. GDPR-ready.</p>
              </div>
            </div>

            <div className="feature-card reveal reveal-delay-2">
              <div className="feature-visual feature-visual-compress">
                <div className="compress-blocks">
                  <div className="compress-block b1"></div>
                  <div className="compress-block b2"></div>
                  <div className="compress-block b3"></div>
                  <div className="compress-arrow">→</div>
                  <div className="compress-out"></div>
                </div>
              </div>
              <div className="feature-body">
                <div className="feature-tag mono">03 · Compress</div>
                <h3 className="h3">Smart compression</h3>
                <p className="text-muted">6× smaller with no visible loss. Perfect for email, chat, and slow connections.</p>
              </div>
            </div>

            <div className="feature-card feature-card-lg reveal reveal-delay-1">
              <div className="feature-visual feature-visual-cloud">
                <div className="cloud-nodes">
                  <div className="cloud-node cn-1"></div>
                  <div className="cloud-node cn-2"></div>
                  <div className="cloud-node cn-3"></div>
                  <div className="cloud-node cn-4"></div>
                  <div className="cloud-node cn-center"></div>
                  <svg className="cloud-lines" viewBox="0 0 200 140">
                    <line x1="100" y1="70" x2="40" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3"/>
                    <line x1="100" y1="70" x2="160" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3"/>
                    <line x1="100" y1="70" x2="40" y2="110" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3"/>
                    <line x1="100" y1="70" x2="160" y2="110" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3"/>
                  </svg>
                </div>
              </div>
              <div className="feature-body">
                <div className="feature-tag mono">04 · Sync</div>
                <h3 className="h3">Cloud storage, done right</h3>
                <p className="text-muted">Instant sync across devices with LAN mode for offline teams. Your files, your keys.</p>
              </div>
            </div>
          </div>

          <div className="features-cta reveal">
            <Link to="/features" className="btn btn-ghost">
              See all features
              <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how section-dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">Workflow</p>
            <h2 className="h1 reveal reveal-delay-1">Three taps.<br/>One perfect PDF.</h2>
          </div>

          <div className="steps">
            <div className="step reveal">
              <div className="step-num mono">01</div>
              <div className="step-visual">
                <div className="step-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              </div>
              <h3 className="h3">Point & capture</h3>
              <p className="text-muted">Aim at any document. Edges snap. Angles correct. Motion blur disappears.</p>
            </div>

            <div className="step-arrow reveal reveal-delay-1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg></div>

            <div className="step reveal reveal-delay-1">
              <div className="step-num mono">02</div>
              <div className="step-visual">
                <div className="step-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>
                  </svg>
                </div>
              </div>
              <h3 className="h3">Auto-enhance</h3>
              <p className="text-muted">Lighting balanced. Text sharpened. Background cleaned — in 400ms.</p>
            </div>

            <div className="step-arrow reveal reveal-delay-2"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg></div>

            <div className="step reveal reveal-delay-2">
              <div className="step-num mono">03</div>
              <div className="step-visual">
                <div className="step-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
              </div>
              <h3 className="h3">Export & share</h3>
              <p className="text-muted">One tap — encrypted PDF ready for email, cloud, or QR handoff.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">Reviews</p>
            <h2 className="h1 reveal reveal-delay-1">Loved by people who<br/>hate scanners.</h2>
          </div>

          <div className="tm-grid">
            <div className="tm-card tm-card-featured reveal">
              <p className="tm-quote">"I used to keep a $400 scanner on my desk. SnapPDF made it worthless in a week. The auto-enhance is genuinely better than anything I've used."</p>
              <div className="tm-author">
                <div className="tm-avatar" style={{background:'linear-gradient(135deg,#5B4EE8,#FF6B4A)'}}>SL</div>
                <div>
                  <div className="tm-name">Sofia Lund</div>
                  <div className="tm-role">Head of Ops · Meridian</div>
                </div>
              </div>
            </div>

            <div className="tm-card reveal reveal-delay-1">
              <p className="tm-quote">"Filed 60 receipts in one lunch. Never going back."</p>
              <div className="tm-author">
                <div className="tm-avatar" style={{background:'linear-gradient(135deg,#06B6D4,#5B4EE8)'}}>MK</div>
                <div>
                  <div className="tm-name">Marcus Klein</div>
                  <div className="tm-role">Freelance · Berlin</div>
                </div>
              </div>
            </div>

            <div className="tm-card reveal reveal-delay-2">
              <p className="tm-quote">"The LAN sync saved us during a client audit. Zero internet, zero problem."</p>
              <div className="tm-author">
                <div className="tm-avatar" style={{background:'linear-gradient(135deg,#FF6B4A,#7C3AED)'}}>AR</div>
                <div>
                  <div className="tm-name">Anika Rao</div>
                  <div className="tm-role">Legal · Fold & Co</div>
                </div>
              </div>
            </div>

            <div className="tm-card reveal reveal-delay-1">
              <p className="tm-quote">"Compression is unreal. 8MB scans → 400KB with the text still crisp."</p>
              <div className="tm-author">
                <div className="tm-avatar" style={{background:'linear-gradient(135deg,#7C3AED,#06B6D4)'}}>JW</div>
                <div>
                  <div className="tm-name">James Wu</div>
                  <div className="tm-role">Engineer · Vertex Labs</div>
                </div>
              </div>
            </div>

            <div className="tm-card reveal reveal-delay-2">
              <p className="tm-quote">"Onboarded our whole clinic in an afternoon. HIPAA-ready out of the box."</p>
              <div className="tm-author">
                <div className="tm-avatar" style={{background:'linear-gradient(135deg,#5B4EE8,#06B6D4)'}}>DP</div>
                <div>
                  <div className="tm-name">Dr. Priya Nair</div>
                  <div className="tm-role">Practice Lead · Lumen Health</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats" id="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat reveal">
              <div className="stat-num">{pdfCount}<span className="stat-suffix">M+</span></div>
              <div className="stat-label">PDFs created<br/>this year</div>
            </div>
            <div className="stat reveal reveal-delay-1">
              <div className="stat-num">{scanTime}<span className="stat-suffix">s</span></div>
              <div className="stat-label">Average scan-to-PDF<br/>time</div>
            </div>
            <div className="stat reveal reveal-delay-2">
              <div className="stat-num">{uptime}<span className="stat-suffix">%</span></div>
              <div className="stat-label">Uptime last<br/>12 months</div>
            </div>
            <div className="stat reveal reveal-delay-3">
              <div className="stat-num">0<span className="stat-suffix"></span></div>
              <div className="stat-label">Files leaked.<br/>Ever.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-final" id="try">
        <div className="container">
          <div className="cta-card reveal">
            <div className="cta-bg-mesh"></div>
            <p className="eyebrow" style={{color:'rgba(255,255,255,0.7)'}}>Ready in 8 seconds</p>
            <h2 className="h1" style={{color:'#fff'}}>Start scanning.<br/>No sign-up required.</h2>
            <p className="lede" style={{color:'rgba(255,255,255,0.7)', maxWidth:'520px', margin:'0 auto'}}>Free forever for up to 10 pages a day. Upgrade only when you need teams and unlimited storage.</p>
            <div className="hero-cta" style={{justifyContent:'center', marginTop:'32px'}}>
              <a href="#" className="btn" style={{background:'#fff', color:'#0A0A0F'}}>
                Start scanning free
                <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
              <Link to="/contact" className="btn" style={{background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)'}}>
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
