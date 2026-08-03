'use client';
/**
 * Login screen — first slice of the FlowApp.jsx prototype extracted into a real
 * stateful React component. No querySelector/DOM listeners: fields, password
 * visibility, and the error alert are all `useState`; the request goes through
 * the React Query mutation layer. Self-contained because login redirects to
 * /dashboard rather than transitioning to another in-flow prototype screen.
 */
import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { post, ApiError } from '../ws/api';

type LoginResult = { user: { name: string; email: string } };

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  const login = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      post<LoginResult>('/auth/login', input),
    onSuccess: () => {
      // Full navigation so the freshly-set session cookie is picked up.
      window.location.assign('/dashboard');
    },
  });

  const errorMsg = login.isError
    ? login.error instanceof ApiError && login.error.status
      ? login.error.message
      : "Network error — we couldn't reach FlowPilot. Check your connection and try again."
    : null;
  // Keep the button in its success state through the redirect.
  const busy = login.isPending || login.isSuccess;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div className="pg-flow">
      <section className="screen on" aria-label="Sign in">
        <div className="auth">
          <div className="auth-form">
            <div className="af-top">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow" /></svg></span>FlowPilot</span>
              <span className="aux">New here? <Link href="/signup">Create account</Link></span>
            </div>
            <div className="auth-card">
              <h1>Welcome back</h1>
              <p className="sub">Sign in to your workspace.</p>

              {errorMsg && (
                <div className="alert alert-danger" role="alert">
                  <svg><use href="#i-warn" /></svg>
                  <div><b>Couldn't sign you in</b><p>{errorMsg}</p></div>
                </div>
              )}

              <div className="sso" style={{ marginTop: '4px' }}>
                <button className="btn btn-secondary" type="button"><svg><use href="#i-google" /></svg>Google</button>
                <button className="btn btn-secondary" type="button"><svg><use href="#i-gh" /></svg>GitHub</button>
              </div>
              <div className="divider">or with email</div>

              <form onSubmit={onSubmit} noValidate>
                <div className="field">
                  <label htmlFor="li-email">Email</label>
                  <div className="input-wrap">
                    <svg><use href="#i-mail" /></svg>
                    <input className="input" id="li-email" type="email" autoComplete="email"
                      placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="li-pass">Password <Link className="lbl-aux" href="/forgot-password">Forgot password?</Link></label>
                  <div className="input-wrap">
                    <svg><use href="#i-lock" /></svg>
                    <input className="input" id="li-pass" type={showPass ? 'text' : 'password'} autoComplete="current-password"
                      placeholder="Your password" style={{ paddingRight: '36px' }}
                      value={password} onChange={(e) => setPassword(e.target.value)} />
                    <span className="trail">
                      <button type="button" aria-label={showPass ? 'Hide password' : 'Show password'} onClick={() => setShowPass((s) => !s)}>
                        <svg><use href="#i-eye" /></svg>
                      </button>
                    </span>
                  </div>
                </div>
                <label className="check">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span className="box"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
                  Remember me for 30 days
                </label>
                <button className="btn btn-primary btn-lg w-full" type="submit" disabled={busy}>
                  {login.isPending ? <><span className="spinner" />Signing in…</>
                    : login.isSuccess ? <><svg width="16" height="16"><use href="#i-check" /></svg>Signed in</>
                      : 'Sign in'}
                </button>
              </form>
            </div>
            <p className="af-foot">Single sign-on (SAML) available on Enterprise — <a href="#">use SSO instead</a></p>
          </div>

          <div className="auth-panel">
            <figure className="quote" style={{ marginLeft: '0' }}>
              <p>"My favorite part is what's gone: no status meetings, no 'quick sync', no chasing updates."</p>
              <figcaption className="q-who"><span className="avatar a-warm">EM</span><span><b>Elena Marchetti</b>Engineering Manager, Fjord Labs</span></figcaption>
            </figure>
          </div>
        </div>
      </section>
    </div>
  );
}
