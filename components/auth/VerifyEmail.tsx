'use client';
/**
 * "Email verified" confirmation screen. Standalone/static now — the live
 * signup flow goes straight to onboarding, so this route is kept only for the
 * URL; it links onward rather than reading in-flow prototype state.
 */
import Link from 'next/link';

export default function VerifyEmail() {
  return (
    <div className="pg-flow">
      <section className="screen on" aria-label="Email verified">
        <div className="welcome" style={{ justifyContent: 'center' }}>
          <div style={{ maxWidth: '400px' }}>
            <svg className="big-check pulse-ring" style={{ borderRadius: '99px' }} viewBox="0 0 72 72" aria-hidden="true">
              <circle className="bc-circle" cx="36" cy="36" r="31" />
              <path className="bc-tick" d="M24 37l8 8 16-16" />
            </svg>
            <h1 style={{ fontSize: '28px', lineHeight: '36px', margin: '0 0 8px' }}>Email verified</h1>
            <p className="desc" style={{ marginBottom: '32px' }}>Your email is confirmed. You're seconds away from your new workspace.</p>
            <Link className="btn btn-primary btn-lg" href="/onboarding">Continue<svg><use href="#i-arrow" /></svg></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
