'use client';
/**
 * Forgot-password screen extracted from the FlowApp prototype.
 * There is no reset endpoint yet, so the "email sent" state is simulated
 * (same as the prototype) — but now via useState, not DOM toggling.
 */
import { useState } from 'react';
import Link from 'next/link';

const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export default function ForgotForm() {
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validEmail(email)) { setInvalid(true); return; }
    setInvalid(false);
    setSending(true);
    // No reset endpoint yet — simulate the send, then show the confirmation.
    setTimeout(() => { setSending(false); setSent(true); }, 800);
  }

  return (
    <div className="pg-flow">
      <section className="screen on" aria-label="Reset your password">
        <div className="auth">
          <div className="auth-form">
            <div className="af-top">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow" /></svg></span>FlowPilot</span>
              <span className="aux"><Link href="/login">← Back to sign in</Link></span>
            </div>
            <div className="auth-card">
              {!sent ? (
                <>
                  <h1>Reset your password</h1>
                  <p className="sub">Enter the email you use for FlowPilot and we'll send you a reset link.</p>
                  <form onSubmit={onSubmit} noValidate>
                    <div className="field">
                      <label htmlFor="fp-email">Email</label>
                      <div className="input-wrap">
                        <svg><use href="#i-mail" /></svg>
                        <input className={`input ${invalid ? 'is-invalid' : ''}`} id="fp-email" type="email" autoComplete="email"
                          placeholder="you@company.com" value={email}
                          onChange={(e) => { setEmail(e.target.value); if (invalid) setInvalid(false); }} />
                      </div>
                    </div>
                    <button className="btn btn-primary btn-lg w-full" type="submit" disabled={sending}>
                      {sending ? <><span className="spinner" />Sending…</> : 'Send reset link'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <svg className="big-check" viewBox="0 0 72 72" aria-hidden="true">
                    <circle className="bc-circle" cx="36" cy="36" r="31" />
                    <path className="bc-tick" d="M24 37l8 8 16-16" />
                  </svg>
                  <h1 style={{ textAlign: 'center' }}>Check your inbox</h1>
                  <p className="sub" style={{ textAlign: 'center' }}>We sent a reset link to <b style={{ color: 'var(--text-1)' }}>{email}</b>. The link expires in 30 minutes.</p>
                  <Link className="btn btn-secondary w-full" href="/login">Return to sign in</Link>
                  <p className="hint" style={{ textAlign: 'center', marginTop: '12px' }}>
                    Didn't get it? Check spam or <a href="#" onClick={(e) => { e.preventDefault(); setSent(false); }}>resend</a>.
                  </p>
                </>
              )}
            </div>
            <p className="af-foot">For security, reset links are single-use.</p>
          </div>
          <div className="auth-panel">
            <figure className="quote" style={{ marginLeft: '0' }}>
              <p>"Set up took our team eleven minutes, including the Jira import. That was the whole migration."</p>
              <figcaption className="q-who"><span className="avatar a-teal">DO</span><span><b>David Okafor</b>Head of Product, Meridian Systems</span></figcaption>
            </figure>
          </div>
        </div>
      </section>
    </div>
  );
}
