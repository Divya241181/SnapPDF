import React from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal';

export default function Features() {
  useReveal();

  return (
    <>
      {/* Split hero */}
      <section className="split-hero">
        <div className="container split-hero-inner">
          <div className="split-hero-text reveal">
            <p className="eyebrow">Features</p>
            <h1 className="h1">Built for speed.<br/><span className="gradient-text">Designed for simplicity.</span></h1>
            <p className="lede">Every feature earns its place. No bloat, no learning curve — just the fastest path from paper to PDF.</p>
            <div className="split-hero-cta">
              <Link to="/#try" className="btn btn-glow">
                Try SnapPDF free
                <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Link>
              <a href="#compare" className="btn btn-ghost">See comparison</a>
            </div>
          </div>
          <div className="split-hero-visual reveal reveal-delay-1">
            <div className="anim-scanner">
              <div className="scanner-doc">
                <div className="scanner-doc-header">
                  <div className="pdf-badge">PDF</div>
                  <span className="mono">A4 · 300dpi</span>
                </div>
                <div className="doc-line" style={{width:'70%'}}></div>
                <div className="doc-line" style={{width:'85%'}}></div>
                <div className="doc-line" style={{width:'60%'}}></div>
                <div className="doc-line" style={{width:'80%'}}></div>
                <div className="doc-line" style={{width:'55%'}}></div>
                <div className="doc-line" style={{width:'75%'}}></div>
                <div className="doc-line" style={{width:'65%'}}></div>
              </div>
              <div className="scanner-corners">
                <span></span><span></span><span></span><span></span>
              </div>
              <div className="scanner-beam"></div>
              <div className="scanner-chip scanner-chip-1">
                <span className="dot"></span>EDGE·OK
              </div>
              <div className="scanner-chip scanner-chip-2">
                <span className="dot"></span>DESKEW·2°
              </div>
              <div className="scanner-chip scanner-chip-3">
                <span className="dot"></span>OCR·READY
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature spotlight 1: Real-time capture */}
      <section className="feature-spotlight">
        <div className="container">
          <div className="feature-spotlight-inner">
            <div className="fs-text reveal">
              <span className="fs-tag mono">01 · Capture</span>
              <h2 className="h2">Real-time capture that actually works.</h2>
              <p>Edge detection, deskewing, and exposure correction run on-device in under 100ms. Point, tap, done — no cropping, no fiddling, no "retake" loop.</p>
              <ul className="fs-bullets">
                <li>Auto-detects up to 12 documents in a single frame</li>
                <li>Handles glare, shadows, and low-light with dual-pass HDR</li>
                <li>Live OCR overlays selectable text as you scan</li>
                <li>Batch mode: 60+ pages a minute with continuous shutter</li>
              </ul>
            </div>
            <div className="fs-visual reveal reveal-delay-1">
              <div className="scan-doc" style={{width:'55%', padding:'20px 18px', transform:'rotate(-4deg)'}}>
                <div className="doc-line" style={{width:'70%'}}></div>
                <div className="doc-line" style={{width:'85%'}}></div>
                <div className="doc-line" style={{width:'60%'}}></div>
                <div className="doc-line" style={{width:'80%'}}></div>
                <div className="doc-line" style={{width:'55%'}}></div>
                <div className="doc-line" style={{width:'75%'}}></div>
                <div className="doc-line" style={{width:'65%'}}></div>
                <div className="doc-line" style={{width:'80%'}}></div>
              </div>
              <div className="scan-beam-fx"></div>
              <div className="scan-corners"><span></span><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature spotlight 2: Encryption */}
      <section className="feature-spotlight">
        <div className="container">
          <div className="feature-spotlight-inner reverse">
            <div className="fs-text reveal">
              <span className="fs-tag mono">02 · Secure</span>
              <h2 className="h2">Encryption that doesn't slow you down.</h2>
              <p>AES-256-GCM at rest. TLS 1.3 in transit. Zero-knowledge keys, so we can't read your files even if we wanted to.</p>
              <ul className="fs-bullets">
                <li>Client-side encryption before any byte leaves your device</li>
                <li>Optional per-document passphrase with Argon2 hashing</li>
                <li>SOC 2 Type II · GDPR · HIPAA-ready</li>
                <li>Zero data retention — files auto-purge after export</li>
              </ul>
            </div>
            <div className="fs-visual dark reveal reveal-delay-1">
              <div className="data-stream">
                <div className="data-stream-line"></div>
                <div className="data-stream-line"></div>
                <div className="data-stream-line"></div>
                <div className="data-stream-line"></div>
                <div style={{position:'relative', zIndex:1, textAlign:'center', paddingTop:'20%'}}>
                  <div style={{fontFamily:'Geist Mono, monospace', fontSize:'32px', fontWeight:600, color:'#0F0F17'}}>
                    AES-256
                  </div>
                  <div style={{fontFamily:'Geist Mono, monospace', fontSize:'11px', color:'#6a6a75', letterSpacing:'0.15em', marginTop:'4px'}}>
                    GCM · 4KB CHUNKS · <span style={{color:'#22C55E'}}>✓ VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature spotlight 3: LAN Sync */}
      <section className="feature-spotlight">
        <div className="container">
          <div className="feature-spotlight-inner">
            <div className="fs-text reveal">
              <span className="fs-tag mono">03 · Sync</span>
              <h2 className="h2">LAN sync for offline teams.</h2>
              <p>Cloud is optional. When it matters — audits, sensitive sites, spotty Wi-Fi — SnapPDF pairs devices peer-to-peer over your local network.</p>
              <ul className="fs-bullets">
                <li>Discovery via mDNS · zero configuration</li>
                <li>Files stay on-premises, encrypted with your device keys</li>
                <li>Resumable transfers up to 8GB per file</li>
                <li>Optional QR handoff for one-shot device pairing</li>
              </ul>
            </div>
            <div className="fs-visual reveal reveal-delay-1">
              <div className="cloud-nodes" style={{width:'260px', height:'180px'}}>
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
          </div>
        </div>
      </section>

      {/* Feature spotlight 4: Compression */}
      <section className="feature-spotlight">
        <div className="container">
          <div className="feature-spotlight-inner reverse">
            <div className="fs-text reveal">
              <span className="fs-tag mono">04 · Compress</span>
              <h2 className="h2">6× smaller. Zero visible loss.</h2>
              <p>Our compression pipeline separates text, images, and background — each gets its own encoder. Smaller than JPEG, sharper than PDF/A.</p>
              <ul className="fs-bullets">
                <li>Adaptive quantization based on content type</li>
                <li>Sub-pixel text rendering preserved</li>
                <li>Optional lossless mode for legal documents</li>
                <li>Streaming decode — instant preview even on 3G</li>
              </ul>
            </div>
            <div className="fs-visual reveal reveal-delay-1">
              <div className="compress-visual">
                <div style={{textAlign:'center'}}>
                  <div className="mono" style={{fontSize:'32px', fontWeight:600, color:'var(--text-muted)'}}>2.4</div>
                  <div className="mono" style={{fontSize:'11px', color:'var(--text-faint)', letterSpacing:'0.1em'}}>MB</div>
                </div>
                <div style={{color:'var(--primary)', fontSize:'24px'}}>→</div>
                <div style={{textAlign:'center'}}>
                  <div className="mono" style={{fontSize:'44px', fontWeight:600, color:'var(--primary)'}}>384</div>
                  <div className="mono" style={{fontSize:'11px', color:'var(--primary)', letterSpacing:'0.1em'}}>KB · 6.4× SMALLER</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="section section-dark" id="compare">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">Compared</p>
            <h2 className="h1 reveal reveal-delay-1">Why teams switch.</h2>
          </div>
          <div className="compare-table reveal">
            <div className="compare-row header">
              <div className="compare-feat">Capability</div>
              <div className="compare-brand">SnapPDF</div>
              <div className="compare-cell">Traditional scanner</div>
              <div className="compare-cell">Camera + email</div>
            </div>
            <div className="compare-row">
              <div className="compare-feat">Scan-to-PDF time</div>
              <div className="compare-cell compare-brand-cell mono">0.4s</div>
              <div className="compare-cell mono">18s</div>
              <div className="compare-cell mono">45s</div>
            </div>
            <div className="compare-row">
              <div className="compare-feat">Works offline</div>
              <div className="compare-cell compare-yes">✓</div>
              <div className="compare-cell compare-yes">✓</div>
              <div className="compare-cell compare-no">✕</div>
            </div>
            <div className="compare-row">
              <div className="compare-feat">Auto edge detection</div>
              <div className="compare-cell compare-yes">✓</div>
              <div className="compare-cell compare-no">✕</div>
              <div className="compare-cell compare-no">✕</div>
            </div>
            <div className="compare-row">
              <div className="compare-feat">End-to-end encryption</div>
              <div className="compare-cell compare-yes">✓</div>
              <div className="compare-cell compare-partial">Partial</div>
              <div className="compare-cell compare-no">✕</div>
            </div>
            <div className="compare-row">
              <div className="compare-feat">Multi-device sync</div>
              <div className="compare-cell compare-yes">✓</div>
              <div className="compare-cell compare-no">✕</div>
              <div className="compare-cell compare-partial">Manual</div>
            </div>
            <div className="compare-row">
              <div className="compare-feat">Team library</div>
              <div className="compare-cell compare-yes">✓</div>
              <div className="compare-cell compare-no">✕</div>
              <div className="compare-cell compare-no">✕</div>
            </div>
            <div className="compare-row">
              <div className="compare-feat">Cost per user / mo</div>
              <div className="compare-cell compare-brand-cell mono">$0–8</div>
              <div className="compare-cell mono">$32+</div>
              <div className="compare-cell mono">Free</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-final">
        <div className="container">
          <div className="cta-card reveal">
            <div className="cta-bg-mesh"></div>
            <p className="eyebrow" style={{color:'rgba(255,255,255,0.7)'}}>See it in action</p>
            <h2 className="h1" style={{color:'#fff'}}>Try SnapPDF free.<br/>No credit card required.</h2>
            <div className="split-hero-cta" style={{justifyContent:'center', marginTop:'28px'}}>
              <Link to="/#try" className="btn" style={{background:'#fff', color:'#0A0A0F'}}>
                Start scanning
                <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
