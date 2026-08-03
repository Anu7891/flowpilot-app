'use client';
/**
 * Signup screen extracted from the FlowApp prototype into real React.
 * Password strength, email validity, and the match check are derived from
 * state (no querySelector). Signup creates a session server-side, so on
 * success we go straight to /onboarding — dropping the prototype's fake
 * "verify your email" interstitial, which never actually sent anything.
 */
import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { post, ApiError } from '../ws/api';

type SignupResult = { user: { name: string; email: string } };

const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function strength(v: string): number {
  if (!v) return 0;
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 12) s++;
  if (/[0-9]/.test(v) && /[a-zA-Z]/.test(v)) s++;
  if (/[^a-zA-Z0-9]/.test(v)) s++;
  return Math.max(1, Math.min(4, v.length < 8 ? 1 : s));
}
const STR_LABELS = [
  'Use 8+ characters with a mix of letters, numbers & symbols',
  'Weak — add more characters',
  'Fair — add numbers or symbols',
  'Strong password',
  'Very strong password',
];

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [terms, setTerms] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const signup = useMutation({
    mutationFn: (input: { name: string; email: string; password: string }) =>
      post<SignupResult>('/auth/signup', input),
    onSuccess: () => window.location.assign('/onboarding'),
  });

  const level = strength(pass);
  const emailInvalid = emailTouched && !!email && !validEmail(email);
  const pass2Mismatch = !!pass2 && pass2 !== pass;
  const pass2Match = !!pass2 && pass2 === pass;
  const canSubmit = validEmail(email) && level >= 2 && pass2Match && terms && !!name.trim() && !signup.isPending;

  const apiErr = signup.isError
    ? signup.error instanceof ApiError && signup.error.status
      ? signup.error.message
      : "Network error — we couldn't reach FlowPilot. Try again."
    : null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailTouched(true);
    if (!canSubmit) return;
    signup.mutate({ name: name.trim(), email, password: pass });
  }

  return (
    <div className="pg-flow">
      <section className="screen on" aria-label="Create your account">
        <div className="auth">
          <div className="auth-form">
            <div className="af-top">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow" /></svg></span>FlowPilot</span>
              <span className="aux">Have an account? <Link href="/login">Sign in</Link></span>
            </div>
            <div className="auth-card">
              <h1>Create your account</h1>
              <p className="sub">Free for teams up to 10. No credit card required.</p>
              <div className="sso">
                <button className="btn btn-secondary" type="button"><svg><use href="#i-google" /></svg>Google</button>
                <button className="btn btn-secondary" type="button"><svg><use href="#i-gh" /></svg>GitHub</button>
              </div>
              <div className="divider">or with email</div>
              <form onSubmit={onSubmit} noValidate>
                <div className="field">
                  <label htmlFor="su-name">Full name</label>
                  <input className="input" id="su-name" autoComplete="name" placeholder="Mara Kis"
                    value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="su-email">Work email</label>
                  <div className="input-wrap">
                    <svg><use href="#i-mail" /></svg>
                    <input className={`input ${emailInvalid || apiErr ? 'is-invalid' : ''}`} id="su-email" type="email" autoComplete="email"
                      placeholder="you@company.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmailTouched(true)} />
                  </div>
                  {(emailInvalid || apiErr) && (
                    <span className="err-msg"><svg><use href="#i-warn" /></svg>{apiErr ?? "That doesn't look like a valid email — check for typos."}</span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="su-pass">Password</label>
                  <div className="input-wrap">
                    <svg><use href="#i-lock" /></svg>
                    <input className="input" id="su-pass" type={showPass ? 'text' : 'password'} autoComplete="new-password"
                      placeholder="8+ characters" style={{ paddingRight: '36px' }}
                      value={pass} onChange={(e) => setPass(e.target.value)} />
                    <span className="trail">
                      <button type="button" aria-label={showPass ? 'Hide password' : 'Show password'} onClick={() => setShowPass((s) => !s)}><svg><use href="#i-eye" /></svg></button>
                    </span>
                  </div>
                  <div className="strength" data-level={String(level)} aria-live="polite">
                    <div className="str-bars"><i></i><i></i><i></i><i></i></div>
                    <span className="str-label">{STR_LABELS[level]}</span>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="su-pass2">Confirm password</label>
                  <div className="input-wrap">
                    <svg><use href="#i-lock" /></svg>
                    <input className={`input ${pass2Mismatch ? 'is-invalid' : ''}`} id="su-pass2" type={showPass ? 'text' : 'password'} autoComplete="new-password"
                      placeholder="Repeat password" value={pass2} onChange={(e) => setPass2(e.target.value)} />
                  </div>
                  {pass2Mismatch && <span className="err-msg"><svg><use href="#i-warn" /></svg>Passwords don't match yet.</span>}
                  {pass2Match && <span className="ok-msg"><svg><use href="#i-check-c" /></svg>Passwords match</span>}
                </div>
                <label className="check" style={{ marginTop: '2px' }}>
                  <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                  <span className="box"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
                  <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
                </label>
                <button className="btn btn-primary btn-lg w-full" type="submit" disabled={signup.isPending || signup.isSuccess}>
                  {signup.isPending ? <><span className="spinner" />Creating account…</> : 'Create account'}
                </button>
              </form>
            </div>
            <p className="af-foot">Protected by SOC 2 Type II controls · Data encrypted at rest and in transit</p>
          </div>
          <div className="auth-panel">
            <figure className="quote" style={{ marginLeft: '0' }}>
              <p>"We cut sprint planning from three hours to twenty minutes. FlowPilot drafts, we adjust, we start."</p>
              <figcaption className="q-who"><span className="avatar">SC</span><span><b>Sarah Chen</b>VP of Engineering, Basalt</span></figcaption>
            </figure>
          </div>
        </div>
      </section>
    </div>
  );
}
