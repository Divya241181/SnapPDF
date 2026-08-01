import React from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal';

export default function About() {
  useReveal();

  return (
    <>
      <section className="split-hero">
        <div className="container split-hero-inner">
          <div className="split-hero-text reveal">
            <p className="eyebrow">About</p>
            <h1 className="h1">The story behind<br/><span className="gradient-text">the snap.</span></h1>
            <p className="lede">A small team obsessed with the moment a piece of paper becomes searchable, shareable, and safe.</p>
            <div className="split-hero-cta">
              <Link to="/mission" className="btn btn-glow">
                Our mission
                <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/contact" className="btn btn-ghost">Get in touch</Link>
            </div>
          </div>
          <div className="split-hero-visual reveal reveal-delay-1">
            <div className="anim-pages-flow">
              <div className="pages-flow-doc pf-1">
                <div className="pdf-badge">PDF</div>
                <div className="doc-line" style={{width:'70%'}}></div>
                <div className="doc-line" style={{width:'85%'}}></div>
                <div className="doc-line" style={{width:'60%'}}></div>
                <div className="doc-line" style={{width:'75%'}}></div>
                <div className="doc-line" style={{width:'55%'}}></div>
              </div>
              <div className="pages-flow-doc pf-2">
                <div className="pdf-badge">PDF</div>
                <div className="doc-line" style={{width:'80%'}}></div>
                <div className="doc-line" style={{width:'65%'}}></div>
                <div className="doc-line" style={{width:'75%'}}></div>
                <div className="doc-line" style={{width:'55%'}}></div>
              </div>
              <div className="pages-flow-doc pf-3">
                <div className="pdf-badge">PDF</div>
                <div className="doc-line" style={{width:'65%'}}></div>
                <div className="doc-line" style={{width:'80%'}}></div>
                <div className="doc-line" style={{width:'70%'}}></div>
                <div className="doc-line" style={{width:'60%'}}></div>
              </div>
              <div className="pages-flow-doc pf-4">
                <div className="pdf-badge">PDF</div>
                <div className="doc-line" style={{width:'75%'}}></div>
                <div className="doc-line" style={{width:'60%'}}></div>
                <div className="doc-line" style={{width:'80%'}}></div>
                <div className="doc-line" style={{width:'65%'}}></div>
              </div>
              <div className="pages-flow-line pfl-1"></div>
              <div className="pages-flow-line pfl-2"></div>
              <div className="pages-flow-line pfl-3"></div>
              <div className="pages-flow-line pfl-4"></div>
              <div className="pages-flow-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder block */}
      <section className="section">
        <div className="container">
          <div className="reveal" style={{maxWidth: '960px', margin: '0 auto', textAlign:'center'}}>
            <p className="eyebrow" style={{marginBottom:'14px', display:'inline-block'}}>Founder note</p>
            <h2 className="h2" style={{marginBottom:'24px'}}>"We built the tool we wished existed<br/>the day our clinic went paperless."</h2>
            <p className="text-muted" style={{fontSize:'17px', lineHeight:1.7, maxWidth:'680px', margin:'0 auto'}}>
              In 2019, my partner spent an entire weekend photographing 4,000 patient charts, then another week wrestling them into a PDF workflow that half-worked. There had to be something faster — and there wasn't. So we made SnapPDF. Six years later, it's used in 82 countries, and we still ship features driven by the same question: <em>what would make this an eight-second job instead of a two-hour one?</em>
            </p>
            <div style={{marginTop:'32px', display:'flex', justifyContent:'center', alignItems:'center', gap:'14px'}}>
              <div className="team-avatar" style={{width:'52px', height:'52px', background:'linear-gradient(135deg,#5B4EE8,#FF6B4A)', borderRadius:'50%', fontSize:'18px', fontWeight:500}}>
                <span>KM</span>
              </div>
              <div style={{textAlign:'left'}}>
                <p style={{fontWeight:600}}>Kalyani Menon</p>
                <p className="text-muted" style={{fontSize:'13px'}}>Co-founder & CEO</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">What we believe</p>
            <h2 className="h1 reveal reveal-delay-1">Four values.<br/>Non-negotiable.</h2>
          </div>
          <div className="values-grid">
            <div className="value-card reveal">
              <div className="value-num mono">01</div>
              <div className="value-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
                </svg>
              </div>
              <h3>Speed as respect</h3>
              <p>Every millisecond we save is time you spend on something that matters.</p>
            </div>
            <div className="value-card reveal reveal-delay-1">
              <div className="value-num mono">02</div>
              <div className="value-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Trust, not trade</h3>
              <p>Your files aren't a product. We don't scan, sell, or train on them. Ever.</p>
            </div>
            <div className="value-card reveal reveal-delay-2">
              <div className="value-num mono">03</div>
              <div className="value-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>
                </svg>
              </div>
              <h3>Simplicity wins</h3>
              <p>Two-tap workflows beat ten-tap perfection. We add features slowly, on purpose.</p>
            </div>
            <div className="value-card reveal reveal-delay-3">
              <div className="value-num mono">04</div>
              <div className="value-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3>Ship weekly</h3>
              <p>New builds every Thursday for six straight years. Small changes, compounding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">People</p>
            <h2 className="h1 reveal reveal-delay-1">Small team.<br/>Big surface area.</h2>
          </div>
          <div className="team-grid">
            <div className="team-member reveal">
              <div className="team-avatar" style={{background:'linear-gradient(135deg,#5B4EE8,#8B7FFF)'}}><span>K</span></div>
              <div className="team-name">Kalyani Menon</div>
              <div className="team-role">Co-founder & CEO</div>
            </div>
            <div className="team-member reveal reveal-delay-1">
              <div className="team-avatar" style={{background:'linear-gradient(135deg,#FF6B4A,#F43F5E)'}}><span>D</span></div>
              <div className="team-name">Diego Salas</div>
              <div className="team-role">Co-founder & CTO</div>
            </div>
            <div className="team-member reveal reveal-delay-2">
              <div className="team-avatar" style={{background:'linear-gradient(135deg,#06B6D4,#5B4EE8)'}}><span>N</span></div>
              <div className="team-name">Nadia Osei</div>
              <div className="team-role">Head of Design</div>
            </div>
            <div className="team-member reveal reveal-delay-3">
              <div className="team-avatar" style={{background:'linear-gradient(135deg,#7C3AED,#06B6D4)'}}><span>Y</span></div>
              <div className="team-name">Yuki Tanaka</div>
              <div className="team-role">Head of Security</div>
            </div>
            <div className="team-member reveal">
              <div className="team-avatar" style={{background:'linear-gradient(135deg,#F43F5E,#5B4EE8)'}}><span>M</span></div>
              <div className="team-name">Marcus Reid</div>
              <div className="team-role">Engineering</div>
            </div>
            <div className="team-member reveal reveal-delay-1">
              <div className="team-avatar" style={{background:'linear-gradient(135deg,#5B4EE8,#F43F5E)'}}><span>L</span></div>
              <div className="team-name">Lena Björk</div>
              <div className="team-role">Engineering</div>
            </div>
            <div className="team-member reveal reveal-delay-2">
              <div className="team-avatar" style={{background:'linear-gradient(135deg,#06B6D4,#FF6B4A)'}}><span>R</span></div>
              <div className="team-name">Ravi Chandra</div>
              <div className="team-role">Support Lead</div>
            </div>
            <div className="team-member reveal reveal-delay-3">
              <div className="team-avatar" style={{background:'linear-gradient(135deg,#8B7FFF,#06B6D4)'}}><span>+</span></div>
              <div className="team-name">You?</div>
              <div className="team-role"><Link to="/contact" style={{color:'var(--primary)'}}>We're hiring →</Link></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
