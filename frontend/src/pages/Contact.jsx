import React, { useState } from 'react';
import useReveal from '../hooks/useReveal';

export default function Contact() {
  useReveal();
  const [btnText, setBtnText] = useState(<>Send message <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg></>);

  const handleSubmit = (e) => {
    e.preventDefault();
    setBtnText('Sent ✓');
    setTimeout(() => {
      setBtnText(<>Send message <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg></>);
    }, 2000);
  };

  return (
    <>
      <section className="split-hero">
        <div className="container split-hero-inner">
          <div className="split-hero-text reveal">
            <p className="eyebrow">Contact</p>
            <h1 className="h1">We're here<br/><span className="gradient-text">to help.</span></h1>
            <p className="lede">Real humans, real replies. Median response time: 4 hours. No chatbots, no ticket queues, no "we'll get back to you next week."</p>
            <div className="split-hero-cta">
              <a href="#form" className="btn btn-glow">
                Send a message
                <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
              <a href="mailto:hello@snappdf.app" className="btn btn-ghost">Email us directly</a>
            </div>
          </div>
          <div className="split-hero-visual reveal reveal-delay-1">
            <div className="anim-mailbox">
              <div className="mailbox-envelope"></div>
              <div className="mailbox-note">
                <div className="pdf-badge">MSG</div>
                <div className="doc-line" style={{width:'80%'}}></div>
                <div className="doc-line" style={{width:'70%'}}></div>
                <div className="doc-line" style={{width:'60%'}}></div>
                <div className="doc-line" style={{width:'75%'}}></div>
              </div>
              <div className="mailbox-particles">
                <span></span><span></span><span></span><span></span>
              </div>
              <div className="mailbox-chip">
                <span className="dot"></span>SENT · 4h avg
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="form" style={{paddingTop:'40px'}}>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info reveal">
              <h3>Ways to reach us</h3>
              <p className="text-muted">Pick whichever's fastest. We answer everything — sales, support, security disclosures, press.</p>

              <div className="contact-methods">
                <a className="contact-method" href="mailto:hello@snappdf.app">
                  <div className="contact-method-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <div className="contact-method-label mono">Email</div>
                    <div className="contact-method-value">hello@snappdf.app</div>
                  </div>
                </a>

                <a className="contact-method" href="tel:+18885550100">
                  <div className="contact-method-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="contact-method-label mono">Phone (US · 9–6 PT)</div>
                    <div className="contact-method-value">+1 (888) 555-0100</div>
                  </div>
                </a>

                <a className="contact-method" href="#">
                  <div className="contact-method-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="contact-method-label mono">Live chat</div>
                    <div className="contact-method-value">Available 24/7 in-app</div>
                  </div>
                </a>

                <a className="contact-method" href="mailto:security@snappdf.app">
                  <div className="contact-method-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="10" width="16" height="12" rx="2"/>
                      <path d="M8 10V7a4 4 0 018 0v3"/>
                    </svg>
                  </div>
                  <div>
                    <div className="contact-method-label mono">Security disclosures</div>
                    <div className="contact-method-value">security@snappdf.app · PGP</div>
                  </div>
                </a>
              </div>

              <div style={{marginTop:'32px', padding:'20px', background:'var(--bg-muted)', borderRadius:'14px'}}>
                <div className="mono" style={{fontSize:'11px', color:'var(--text-faint)', letterSpacing:'0.1em', marginBottom:'8px'}}>HQ · SAN FRANCISCO</div>
                <div style={{fontSize:'14px', color:'var(--text-muted)', lineHeight:'1.6'}}>
                  548 Market Street, Suite 720<br/>
                  San Francisco, CA 94104
                </div>
              </div>
            </div>

            <form className="contact-form reveal reveal-delay-1" onSubmit={handleSubmit}>
              <h3 style={{fontSize:'20px', marginBottom:'6px', letterSpacing:'-0.02em', fontWeight:600}}>Send us a message</h3>
              <p className="text-muted" style={{fontSize:'14px', marginBottom:'24px'}}>We reply to every message. Really.</p>

              <div className="form-field">
                <label>Full name</label>
                <input type="text" placeholder="Jane Doe" required />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" placeholder="jane@company.com" required />
              </div>
              <div className="form-field">
                <label>Topic</label>
                <select>
                  <option>General inquiry</option>
                  <option>Sales & enterprise</option>
                  <option>Support</option>
                  <option>Press & partnerships</option>
                  <option>Security</option>
                </select>
              </div>
              <div className="form-field">
                <label>Message</label>
                <textarea placeholder="Tell us what's on your mind…" required></textarea>
              </div>

              <div className="form-submit-row">
                <div className="form-note">🔒 Encrypted in transit · GDPR compliant</div>
                <button type="submit" className="btn btn-glow">
                  {btnText}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
