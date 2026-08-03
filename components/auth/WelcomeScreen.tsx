'use client';
/**
 * Welcome / hero screen extracted from the FlowApp prototype. Purely
 * presentational now — the two CTAs are real <Link>s to /signup and /login
 * instead of prototype data-go transitions.
 */
import Link from 'next/link';

const I = ({ n }: { n: string }) => <svg><use href={`#${n}`} /></svg>;

export default function WelcomeScreen() {
  return (
    <div className="pg-flow">
      <section className="screen on" aria-label="Welcome">
        <div className="welcome">
          <span className="logo" style={{ fontSize: '18px' }}>
            <span className="logo-mark" style={{ width: '36px', height: '36px', borderRadius: '10px' }}><svg style={{ width: '20px', height: '20px' }}><use href="#i-flow" /></svg></span>FlowPilot
          </span>
          <h1>Plan smarter. Build faster.<br />Deliver with confidence.</h1>
          <p className="tag">The AI-powered workspace for modern software teams.</p>
          <p className="desc">Projects, sprints, analytics, and an AI copilot — together in one calm place. Set up takes less than two minutes.</p>
          <div className="w-ctas">
            <Link className="btn btn-primary btn-lg" href="/signup">Get started<I n="i-arrow" /></Link>
            <Link className="btn btn-secondary btn-lg" href="/login">Sign in</Link>
          </div>
          <div className="w-trust">
            <span style={{ display: 'inline-flex' }}>
              <span className="avatar" style={{ border: '2px solid var(--bg-surface)' }}>MK</span>
              <span className="avatar a-teal" style={{ marginLeft: '-8px', border: '2px solid var(--bg-surface)' }}>JR</span>
              <span className="avatar a-warm" style={{ marginLeft: '-8px', border: '2px solid var(--bg-surface)' }}>AO</span>
            </span>
            Trusted by 50,000+ professionals
          </div>
          <div className="mock" role="img" aria-label="Preview of the FlowPilot dashboard">
            <div className="mock-bar"><span className="dots"><i /><i /><i /></span><span>app.flowpilot.com</span></div>
            <div className="mock-body">
              <div className="mock-side">
                <div className="mock-item on"><I n="i-home" />Home</div>
                <div className="mock-item"><I n="i-layers" />Sprint 24</div>
                <div className="mock-item"><I n="i-map" />Roadmap</div>
                <div className="mock-item"><I n="i-chart" />Analytics</div>
                <div className="mock-item"><I n="i-bot" />AI Assistant</div>
              </div>
              <div className="mock-main">
                <div className="mock-kpis">
                  <div className="mock-kpi"><b>42</b><span>Committed</span></div>
                  <div className="mock-kpi"><b>27</b><span>Completed</span></div>
                  <div className="mock-kpi"><b>2.4d</b><span>Cycle time</span></div>
                </div>
                <div className="mock-panel">
                  <div className="mock-row"><span className="mock-dot" style={{ background: 'var(--primary-400)' }} /><span className="nm">Payment retry logic</span><span>Mara</span></div>
                  <div className="mock-row"><span className="mock-dot" style={{ background: 'var(--warning)' }} /><span className="nm">Apple Pay review notes</span><span>Jonas</span></div>
                  <div className="mock-row"><span className="mock-dot" style={{ background: 'var(--success)' }} /><span className="nm">Checkout A/B experiment</span><span>Amara</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
