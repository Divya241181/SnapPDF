import React from 'react';
import useReveal from '../hooks/useReveal';

export default function Security() {
  useReveal();

  return (
    <>
      <section className="split-hero">
        <div className="container split-hero-inner">
          <div className="split-hero-text reveal">
            <p className="eyebrow">Security</p>
            <h1 className="h1">Your documents.<br/><span className="gradient-text">Fort Knox secure.</span></h1>
            <p className="lede">Zero-knowledge architecture, on-device encryption, and audited compliance. Built so we couldn't read your files even if we tried.</p>
            <div className="split-hero-cta">
              <a href="#pillars" className="btn btn-glow">
                Explore the pillars
                <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
              <a href="#faq" className="btn btn-ghost">Read the FAQ</a>
            </div>
          </div>
          <div className="split-hero-visual reveal reveal-delay-1">
            <div className="anim-pillars">
              <div className="pillar-doc-stack">
                <div className="pillar-orbit">
                  <div className="pillar-orbit-item item-1"><span className="dot"></span>SOC 2</div>
                  <div className="pillar-orbit-item item-2"><span className="dot"></span>HIPAA</div>
                  <div className="pillar-orbit-item item-3"><span className="dot"></span>GDPR</div>
                  <div className="pillar-orbit-item item-4"><span className="dot"></span>ISO 27001</div>
                </div>
                <div className="pillar-orbit pillar-orbit-2">
                  <div className="pillar-orbit-item item-1">TLS 1.3</div>
                  <div className="pillar-orbit-item item-2">AES-256</div>
                  <div className="pillar-orbit-item item-3">Argon2</div>
                  <div className="pillar-orbit-item item-4">HKDF</div>
                </div>
                <div className="pillar-shield-core">
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="section" id="pillars">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">Pillars</p>
            <h2 className="h1 reveal reveal-delay-1">Three layers.<br/>One promise.</h2>
          </div>

          <div className="security-pillars">
            <div className="pillar-card reveal">
              <div className="pillar-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="16" height="12" rx="2"/>
                  <path d="M8 10V7a4 4 0 018 0v3"/>
                </svg>
              </div>
              <h3>Encryption everywhere</h3>
              <p>AES-256-GCM at rest, TLS 1.3 in transit. Every byte encrypted on your device before it moves.</p>
            </div>
            <div className="pillar-card reveal reveal-delay-1">
              <div className="pillar-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <h3>Compliance, audited</h3>
              <p>SOC 2 Type II. GDPR. HIPAA-ready. CCPA. Annual pen tests by third-party auditors.</p>
            </div>
            <div className="pillar-card reveal reveal-delay-2">
              <div className="pillar-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </div>
              <h3>Data privacy, by design</h3>
              <p>Zero-knowledge keys. Files auto-purge after export. We never see, sell, or share your documents.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Encryption diagram */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">How it flows</p>
            <h2 className="h1 reveal reveal-delay-1">Your file's journey.</h2>
          </div>
          <div className="encryption-diagram reveal">
            <div className="enc-node">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
              <div className="enc-node-label">Your device</div>
              <div className="enc-node-sub mono">PLAINTEXT</div>
            </div>
            <div className="enc-arrow">
              <span>→</span>
              <span className="enc-arrow-label">ENCRYPT</span>
            </div>
            <div className="enc-node enc-node-primary">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="12" rx="2"/>
                <path d="M8 10V7a4 4 0 018 0v3"/>
              </svg>
              <div className="enc-node-label">SnapPDF cloud</div>
              <div className="enc-node-sub mono">AES-256 CIPHERTEXT</div>
            </div>
            <div className="enc-arrow">
              <span>→</span>
              <span className="enc-arrow-label">DECRYPT</span>
            </div>
            <div className="enc-node">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div className="enc-node-label">Recipient</div>
              <div className="enc-node-sub mono">PLAINTEXT</div>
            </div>
          </div>
          <p className="text-muted text-center reveal" style={{maxWidth:'520px', margin:'24px auto 0', fontSize:'14px'}}>
            Keys live only on your devices. Our servers store encrypted blobs — even a full database dump would be worthless.
          </p>
        </div>
      </section>

      {/* Certifications */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">Certified</p>
            <h2 className="h1 reveal reveal-delay-1">Audited by people<br/>who don't take shortcuts.</h2>
          </div>
          <div className="badges-grid reveal">
            <div className="badge-cert"><div><div className="badge-cert-name">SOC 2</div><div className="badge-cert-sub">TYPE II</div></div></div>
            <div className="badge-cert"><div><div className="badge-cert-name">GDPR</div><div className="badge-cert-sub">COMPLIANT</div></div></div>
            <div className="badge-cert"><div><div className="badge-cert-name">HIPAA</div><div className="badge-cert-sub">READY</div></div></div>
            <div className="badge-cert"><div><div className="badge-cert-name">CCPA</div><div className="badge-cert-sub">COMPLIANT</div></div></div>
            <div className="badge-cert"><div><div className="badge-cert-name">ISO 27001</div><div className="badge-cert-sub">CERTIFIED</div></div></div>
            <div className="badge-cert"><div><div className="badge-cert-name">PCI DSS</div><div className="badge-cert-sub">LEVEL 1</div></div></div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-dark" id="faq">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">Deep dives</p>
            <h2 className="h1 reveal reveal-delay-1">Questions people ask<br/>before signing up.</h2>
          </div>

          <div style={{maxWidth:'800px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'14px'}}>
            <details className="pillar-card reveal" style={{padding:'22px 28px'}}>
              <summary style={{fontWeight:600, fontSize:'16px', cursor:'pointer', listStyle:'none', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                Where is my data physically stored?
                <span style={{fontSize:'22px', color:'var(--text-muted)'}}>+</span>
              </summary>
              <p style={{marginTop:'14px', color:'var(--text-muted)', fontSize:'14px'}}>
                Encrypted blobs live in ISO 27001–certified data centers in your chosen region: US-East, EU-Frankfurt, or AP-Singapore. Enterprise customers can pin data to a single region contractually.
              </p>
            </details>

            <details className="pillar-card reveal reveal-delay-1" style={{padding:'22px 28px'}}>
              <summary style={{fontWeight:600, fontSize:'16px', cursor:'pointer', listStyle:'none', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                What happens if I lose my device?
                <span style={{fontSize:'22px', color:'var(--text-muted)'}}>+</span>
              </summary>
              <p style={{marginTop:'14px', color:'var(--text-muted)', fontSize:'14px'}}>
                Your recovery kit (generated at signup) restores encrypted access on a new device. If both your device AND recovery kit are lost, files are unrecoverable — that's the trade-off for zero-knowledge encryption.
              </p>
            </details>

            <details className="pillar-card reveal reveal-delay-2" style={{padding:'22px 28px'}}>
              <summary style={{fontWeight:600, fontSize:'16px', cursor:'pointer', listStyle:'none', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                Can law enforcement request my files?
                <span style={{fontSize:'22px', color:'var(--text-muted)'}}>+</span>
              </summary>
              <p style={{marginTop:'14px', color:'var(--text-muted)', fontSize:'14px'}}>
                They can request encrypted blobs (which we're legally required to produce under valid subpoena), but the plaintext keys never leave your devices. We publish a transparency report every quarter.
              </p>
            </details>

            <details className="pillar-card reveal reveal-delay-3" style={{padding:'22px 28px'}}>
              <summary style={{fontWeight:600, fontSize:'16px', cursor:'pointer', listStyle:'none', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                Do you offer a bug bounty?
                <span style={{fontSize:'22px', color:'var(--text-muted)'}}>+</span>
              </summary>
              <p style={{marginTop:'14px', color:'var(--text-muted)', fontSize:'14px'}}>
                Yes — up to $50,000 for critical vulnerabilities. Managed through HackerOne. Every submission is triaged within 48 hours.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
