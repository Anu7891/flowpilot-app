'use client';
/**
 * "Account created" welcome screen. Standalone/static now — kept for the URL;
 * links onward to onboarding rather than reading in-flow prototype state.
 */
import Link from 'next/link';

export default function AccountCreated() {
  return (
    <div className="pg-flow">
      <section className="screen on" aria-label="Account created">
        <div className="welcome" style={{ justifyContent: 'center' }}>
          <div style={{ maxWidth: '460px' }}>
            <span className="logo" style={{ marginBottom: '24px' }}>
              <span className="logo-mark" style={{ width: '36px', height: '36px', borderRadius: '10px' }}><svg style={{ width: '20px', height: '20px' }}><use href="#i-flow" /></svg></span>
            </span>
            <h1 style={{ fontSize: '28px', lineHeight: '36px', margin: '0 0 8px' }}>Welcome to FlowPilot 👋</h1>
            <p className="desc" style={{ marginBottom: '24px' }}>Your account is ready. Next we'll set up your workspace — it takes under two minutes, and you can invite your team along the way.</p>
            <div className="ob-panel" style={{ textAlign: 'left', marginBottom: '32px', padding: '24px' }}>
              <ul className="setup-list">
                <li><span className="sl-num">1</span><span><b>Create your workspace</b> — name, URL, and a few basics</span></li>
                <li><span className="sl-num">2</span><span><b>Invite your team</b> — or skip and do it later</span></li>
                <li><span className="sl-num">3</span><span><b>Personalize</b> — role, goals, theme, notifications</span></li>
              </ul>
            </div>
            <Link className="btn btn-primary btn-lg" href="/onboarding">Set up workspace<svg><use href="#i-arrow" /></svg></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
