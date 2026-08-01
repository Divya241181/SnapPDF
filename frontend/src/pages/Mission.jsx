import React from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal';

export default function Mission() {
  useReveal();

  return (
    <>
      <section className="split-hero">
        <div className="container split-hero-inner">
          <div className="split-hero-text reveal">
            <p className="eyebrow">Mission</p>
            <h1 className="h1"><span className="gradient-text">Democratizing</span><br/>digital documentation.</h1>
            <p className="lede">The plumbing of paperwork should not cost anyone their afternoon. We're closing the gap between paper and pixels.</p>
            <div className="split-hero-cta">
              <a href="#journey" className="btn btn-glow">
                Our journey
                <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
              <Link to="/about" className="btn btn-ghost">Meet the team</Link>
            </div>
          </div>
          <div className="split-hero-visual reveal reveal-delay-1">
            <div className="anim-timeline">
              <div className="timeline-track">
                <div className="timeline-line"></div>
                <div className="timeline-node tn-1">
                  <div className="timeline-node-doc">
                    <div className="doc-line" style={{width:'70%'}}></div>
                    <div className="doc-line" style={{width:'85%'}}></div>
                    <div className="doc-line" style={{width:'60%'}}></div>
                  </div>
                  <span>19</span>
                  <div className="timeline-node-label">START</div>
                </div>
                <div className="timeline-node tn-2">
                  <div className="timeline-node-doc">
                    <div className="doc-line" style={{width:'80%', background:'var(--primary)', opacity:0.6}}></div>
                    <div className="doc-line" style={{width:'70%', background:'var(--primary)', opacity:0.6}}></div>
                    <div className="doc-line" style={{width:'65%', background:'var(--primary)', opacity:0.6}}></div>
                  </div>
                  <span>21</span>
                  <div className="timeline-node-label">SOC 2</div>
                </div>
                <div className="timeline-node tn-3">
                  <div className="timeline-node-doc">
                    <div className="doc-line" style={{width:'75%'}}></div>
                    <div className="doc-line" style={{width:'80%'}}></div>
                    <div className="doc-line" style={{width:'65%'}}></div>
                  </div>
                  <span>24</span>
                  <div className="timeline-node-label">LAN SYNC</div>
                </div>
                <div className="timeline-node tn-4">
                  <div className="timeline-node-doc" style={{background:'var(--primary)', borderColor:'transparent'}}>
                    <div className="doc-line" style={{width:'75%', background:'#fff', opacity:0.5}}></div>
                    <div className="doc-line" style={{width:'85%', background:'#fff', opacity:0.5}}></div>
                    <div className="doc-line" style={{width:'60%', background:'#fff', opacity:0.5}}></div>
                  </div>
                  <span>26</span>
                  <div className="timeline-node-label">v3.2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial narrative */}
      <section className="section">
        <div className="container">
          <div className="mission-narrative reveal">
            <p className="drop-cap">A billion people still keep their most important documents on paper — passports, prescriptions, contracts, receipts. Every one of them, at some point this week, will need that paper in digital form. Right now, that means finding a scanner, or emailing a blurry photo, or paying someone to do it. It shouldn't.</p>
            <p>Our mission is to make document transformation as instant as taking a photo. To close the gap between the physical world and the digital one. To ship a tool so simple that no one has to think about it, and so precise that professionals trust it with their most sensitive files.</p>
            <p>We measure success in seconds saved and afternoons reclaimed — not in features shipped or logos on a wall.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">Progress</p>
            <h2 className="h1 reveal reveal-delay-1">What we've done<br/>in six years.</h2>
          </div>
          <div className="mission-stats">
            <div className="mission-stat reveal">
              <div className="mission-stat-num">82</div>
              <div className="mission-stat-label">Countries served daily</div>
            </div>
            <div className="mission-stat reveal reveal-delay-1">
              <div className="mission-stat-num">4.1B</div>
              <div className="mission-stat-label">Pages processed to date</div>
            </div>
            <div className="mission-stat reveal reveal-delay-2">
              <div className="mission-stat-num">12M</div>
              <div className="mission-stat-label">Active monthly users</div>
            </div>
            <div className="mission-stat reveal reveal-delay-3">
              <div className="mission-stat-num">0</div>
              <div className="mission-stat-label">Reported data leaks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" id="journey">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">Journey</p>
            <h2 className="h1 reveal reveal-delay-1">Six years,<br/>one direction.</h2>
          </div>

          <div className="timeline">
            <div className="timeline-item reveal">
              <div className="timeline-year mono">2019 · SPRING</div>
              <h3>The weekend it started</h3>
              <p>Kalyani and Diego spend a rainy Saturday photographing 4,000 patient charts. Realize the tool they need doesn't exist. Start prototyping the same night.</p>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-year mono">2019 · WINTER</div>
              <h3>First release</h3>
              <p>SnapPDF 0.1 ships as a free iPhone app. 400 downloads in the first week — mostly friends. One of them is a lawyer who won't stop emailing feature requests.</p>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-year mono">2021 · JUNE</div>
              <h3>Enterprise-grade encryption</h3>
              <p>Rewrite the storage layer for zero-knowledge encryption. First SOC 2 audit passed. First clinic customer signs up.</p>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-year mono">2022 · OCTOBER</div>
              <h3>1 million users</h3>
              <p>Cross the million-user line without a single marketing campaign. Word of mouth in law firms, clinics, and freelance networks.</p>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-year mono">2024 · MARCH</div>
              <h3>LAN sync ships</h3>
              <p>Field teams and auditors can finally work with SnapPDF fully offline. Peer-to-peer over local network. Zero cloud required.</p>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-year mono">2026 · TODAY</div>
              <h3>Real-time OCR</h3>
              <p>Text becomes selectable the moment you scan. On-device, no upload. Version 3.2 rolls out to every user this month.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">What's next</p>
            <h2 className="h1 reveal reveal-delay-1">Where we're going.</h2>
          </div>

          <div className="values-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
            <div className="value-card reveal">
              <div className="value-num mono">GOAL · 2026</div>
              <h3>100 million pages a day</h3>
              <p>Scale the pipeline for 10× current volume without adding infrastructure cost per user. Currently at 34M/day.</p>
            </div>
            <div className="value-card reveal reveal-delay-1">
              <div className="value-num mono">GOAL · 2027</div>
              <h3>Offline-first for every feature</h3>
              <p>Every capability — including team libraries and sharing — should work without an internet connection. Cloud is a nice-to-have, not a requirement.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
