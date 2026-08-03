'use client';
/**
 * 8-step onboarding wizard — the last and largest slice extracted from the
 * FlowApp.jsx prototype. The prototype's single `state` object + `data-go`
 * screen transitions + querySelector DOM writes become React state and a
 * `step` switch. Only steps 2 (workspace) and 3 (invites) hit the backend;
 * role/goals/theme/notifications are local personalization that feeds the
 * final summary. Finish creates the workspace, sends invites best-effort,
 * then routes to /dashboard.
 */
import { useEffect, useState } from 'react';
import { post, ApiError, type WorkspaceSummary } from '../ws/api';

const I = ({ n }: { n: string }) => <svg><use href={`#${n}`} /></svg>;
const CHECK = (
  <span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
);

const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

const ROLES = [
  { v: 'Founder', ic: 'i-rocket', d: 'Big picture, many hats' },
  { v: 'Project Manager', ic: 'i-cal', d: 'Plans, timelines, delivery' },
  { v: 'Developer', ic: 'i-zap', d: 'Building and shipping' },
  { v: 'Designer', ic: 'i-pen', d: 'UX, UI, and systems' },
  { v: 'QA', ic: 'i-bug', d: 'Quality and testing' },
  { v: 'Product Manager', ic: 'i-target', d: 'Roadmaps and outcomes' },
  { v: 'Other', ic: 'i-user', d: 'Something else entirely' },
];
const GOALS = [
  { v: 'Manage projects', ic: 'i-layers', d: 'Plans, owners, status' },
  { v: 'Sprint planning', ic: 'i-cal', d: 'Capacity, commitment' },
  { v: 'Task tracking', ic: 'i-board', d: 'Boards and workflows' },
  { v: 'Roadmaps', ic: 'i-map', d: 'Quarters and milestones' },
  { v: 'AI assistance', ic: 'i-spark', d: 'Drafts, estimates, risks' },
  { v: 'Analytics', ic: 'i-chart', d: 'Velocity and cycle time' },
  { v: 'Documentation', ic: 'i-doc', d: 'Specs next to the work' },
];
const ACCENTS = ['#4650C7', '#0F8A75', '#B26205', '#A62D31', '#3B4053'];
const BUILD_STEPS = ['Creating workspace', 'Sending invitations', 'Preparing your home view', 'Warming up the AI assistant'];
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Onboarding() {
  const [step, setStep] = useState(1); // 1..8
  const [startedAt] = useState(() => Date.now());

  // Step 2 — workspace
  const [wsName, setWsName] = useState('');
  const [wsUrl, setWsUrl] = useState('');
  const [urlTouched, setUrlTouched] = useState(false);
  const [industry, setIndustry] = useState('Software & SaaS');
  const [size, setSize] = useState('1–10');
  const [wsError, setWsError] = useState<string | null>(null);

  // Step 3 — invites
  const [invites, setInvites] = useState<string[]>([]);
  const [invEmail, setInvEmail] = useState('');
  const [invErr, setInvErr] = useState(false);

  // Steps 4–7 — personalization (local)
  const [role, setRole] = useState('Project Manager');
  const [goals, setGoals] = useState<string[]>(['Manage projects', 'Sprint planning', 'AI assistance']);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [notifs, setNotifs] = useState({ email: true, desktop: true, mobile: false });

  // Building + summary
  const [building, setBuilding] = useState(false);
  const [bDone, setBDone] = useState(0);
  const [bDoing, setBDoing] = useState(0);
  const [elapsed, setElapsed] = useState('');

  const [previewDark, setPreviewDark] = useState(false);
  useEffect(() => {
    setPreviewDark(theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  }, [theme]);

  const nameOrDefault = wsName.trim() || 'Acme Inc.';
  const urlOrDefault = wsUrl.trim() || 'acme';
  const logoInitial = (nameOrDefault[0] || 'A').toUpperCase();

  function onNameChange(v: string) {
    setWsName(v);
    if (!urlTouched) setWsUrl(slugify(v));
    if (wsError) setWsError(null);
  }
  function addInvite() {
    const v = invEmail.trim();
    if (!validEmail(v)) { setInvErr(true); return; }
    setInvErr(false);
    if (!invites.includes(v)) setInvites((xs) => [...xs, v]);
    setInvEmail('');
  }
  const toggleGoal = (g: string) => setGoals((xs) => (xs.includes(g) ? xs.filter((x) => x !== g) : [...xs, g]));

  async function finish() {
    setBuilding(true); setBDone(0); setBDoing(0); setWsError(null);
    try {
      const ws = await post<WorkspaceSummary>('/workspaces', { name: nameOrDefault, slug: urlOrDefault });
      setBDone(1); setBDoing(1);
      // Existing accounts join instantly; unknown emails are skipped silently (v1).
      for (const em of invites) {
        await post(`/workspaces/${ws.slug}/members`, { email: em }).catch(() => {});
      }
      setBDone(2); setBDoing(2); await pause(450);
      setBDone(3); setBDoing(3); await pause(450);
      setBDone(4);
      const secs = Math.max(20, Math.round((Date.now() - startedAt) / 1000));
      setElapsed(secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`);
      setBuilding(false); setStep(8);
    } catch (e) {
      setBuilding(false); setStep(2);
      setWsError(e instanceof ApiError ? e.message : "Network error — couldn't reach FlowPilot.");
    }
  }

  const Header = ({ n, label = 'Under 2 minutes' }: { n: number; label?: string }) => (
    <div className="ob-top">
      <div className="ob-top-in">
        <span className="logo"><span className="logo-mark"><I n="i-flow" /></span>FlowPilot</span>
        <span className="ob-meta"><span className="step-lbl">Step {n} of 8</span>·<span>{label}</span></span>
      </div>
      <div className="ob-prog"><i style={{ width: `${(n / 8) * 100}%` }} /></div>
    </div>
  );
  const Actions = ({ back, children }: { back?: () => void; children: React.ReactNode }) => (
    <div className="ob-actions">
      {back ? <button className="btn btn-ghost" onClick={back}><I n="i-back" />Back</button> : <span />}
      <div className="right">{children}</div>
    </div>
  );

  if (building) {
    return (
      <div className="pg-flow">
        <section className="screen on" aria-label="Creating workspace">
          <div className="building">
            <div className="b-card">
              <span className="logo" style={{ marginBottom: '16px' }}><span className="logo-mark"><I n="i-flow" /></span></span>
              <h1 style={{ margin: '0 0 4px', fontSize: '20px', lineHeight: '28px', fontWeight: 600 }}>Setting up {nameOrDefault}…</h1>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-2)' }}>This takes a few seconds.</p>
              <div className="b-steps">
                {BUILD_STEPS.map((s, i) => (
                  <div className={`b-step ${i < bDone ? 'did' : i === bDoing ? 'doing' : ''}`} key={s}>
                    <span className="b-ico">
                      {i < bDone ? <svg width="13" height="13"><use href="#i-check" /></svg>
                        : i === bDoing ? <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />
                          : <span style={{ color: 'var(--n-300)' }}>•</span>}
                    </span>{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pg-flow">
      <section className="screen on" aria-label="Onboarding">
        <div className="ob">
          <Header n={step === 8 ? 8 : step} label={step === 8 ? 'Done' : 'Under 2 minutes'} />
          <div className="ob-body">

            {step === 1 && (
              <div className="ob-card" style={{ textAlign: 'center', maxWidth: '520px' }}>
                <h1>Let's set up your workspace</h1>
                <p className="sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>A few quick questions so FlowPilot fits how your team works. Everything can be changed later in Settings.</p>
                <div className="illus" role="img" aria-label="Workspace setup illustration">
                  <span className="il-node"><I n="i-layers" /></span><span className="il-line" />
                  <span className="il-node"><I n="i-users" /></span><span className="il-line" />
                  <span className="il-node"><I n="i-spark" /></span>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Continue<I n="i-arrow" /></button>
              </div>
            )}

            {step === 2 && (
              <div className="ob-card wide">
                <h1>Create your workspace</h1>
                <p className="sub">This is your team's shared home. The URL is how teammates will find it.</p>
                <div className="ws-grid">
                  <div className="ob-panel">
                    <div className="ws-form">
                      <div className="field">
                        <label htmlFor="ws-name">Workspace name</label>
                        <input className={`input ${wsError ? 'is-invalid' : ''}`} id="ws-name" placeholder="Acme Inc." value={wsName} onChange={(e) => onNameChange(e.target.value)} />
                        {wsError && <span className="err-msg"><I n="i-warn" />{wsError}</span>}
                      </div>
                      <div className="field">
                        <label htmlFor="ws-url">Workspace URL</label>
                        <div className="url-wrap">
                          <span className="url-pre">flowpilot.com/</span>
                          <input className="input" id="ws-url" placeholder="acme" spellCheck={false} value={wsUrl}
                            onChange={(e) => { setUrlTouched(true); setWsUrl(slugify(e.target.value)); }} />
                        </div>
                      </div>
                      <div className="two-col">
                        <div className="field">
                          <label htmlFor="ws-ind">Industry</label>
                          <select className="select" id="ws-ind" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                            {['Software & SaaS', 'Fintech', 'E-commerce', 'Healthcare', 'Agency & consulting', 'Other'].map((o) => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                        <div className="field">
                          <label>Team size</label>
                          <div className="seg-sm" role="radiogroup" aria-label="Team size">
                            {['1–10', '11–50', '51–200', '200+'].map((s) => (
                              <button type="button" key={s} className={size === s ? 'active' : ''} onClick={() => setSize(s)}>{s}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <aside className="ws-preview" aria-label="Workspace preview">
                    <p className="pv-label">Preview</p>
                    <div className="pv-card">
                      <div className="pv-head">
                        <span className="up-mark">{logoInitial}</span>
                        <span><b>{nameOrDefault}</b><span>flowpilot.com/{urlOrDefault}</span></span>
                      </div>
                      <div className="pv-rows">
                        <div className="pv-row"><span>Industry</span><span>{industry}</span></div>
                        <div className="pv-row"><span>Team size</span><span>{size}</span></div>
                        <div className="pv-row"><span>Plan</span><span>Free</span></div>
                      </div>
                    </div>
                  </aside>
                </div>
                <Actions back={() => setStep(1)}>
                  <button className="btn btn-primary" disabled={!wsName.trim() || !wsUrl.trim()} onClick={() => setStep(3)}>Continue<I n="i-arrow" /></button>
                </Actions>
              </div>
            )}

            {step === 3 && (
              <div className="ob-card">
                <h1>Invite your team</h1>
                <p className="sub">FlowPilot is better together — teammates see plans, boards, and updates instantly. You can always invite people later.</p>
                <div className="ob-panel">
                  <div className="field">
                    <label htmlFor="inv-email">Invite by email</label>
                    <div className="invite-row">
                      <div className="input-wrap">
                        <I n="i-mail" />
                        <input className={`input ${invErr ? 'is-invalid' : ''}`} id="inv-email" type="email" placeholder="teammate@acme.com — press Enter to add"
                          value={invEmail} onChange={(e) => { setInvEmail(e.target.value); if (invErr) setInvErr(false); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addInvite(); } }} />
                      </div>
                      <button className="btn btn-secondary" type="button" onClick={addInvite}><I n="i-plus" />Add</button>
                    </div>
                    {invErr && <span className="err-msg"><I n="i-warn" />Enter a valid email address.</span>}
                    <span className="hint">Invitees join as Members. You can change roles in Settings → People.</span>
                  </div>
                  <div className="chips" aria-live="polite">
                    {invites.map((em) => (
                      <span className="chip-inv" key={em}>
                        <span className="avatar">{em.slice(0, 2).toUpperCase()}</span>{em}
                        <button aria-label={`Remove ${em}`} onClick={() => setInvites((xs) => xs.filter((x) => x !== em))}><I n="i-x" /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <Actions back={() => setStep(2)}>
                  <button className="btn btn-ghost" onClick={() => setStep(4)}>Skip for now</button>
                  <button className="btn btn-primary" onClick={() => setStep(4)}>
                    {invites.length ? `Send ${invites.length} invite${invites.length > 1 ? 's' : ''} & continue` : 'Continue'}<I n="i-arrow" />
                  </button>
                </Actions>
              </div>
            )}

            {step === 4 && (
              <div className="ob-card wide">
                <h1>What best describes your role?</h1>
                <p className="sub">We'll tune default views and templates to match. This only affects you.</p>
                <div className="opt-grid" role="radiogroup" aria-label="Your role">
                  {ROLES.map((r) => (
                    <label className={`opt ${role === r.v ? 'sel' : ''}`} key={r.v}>
                      <input type="radio" name="role" checked={role === r.v} onChange={() => setRole(r.v)} />
                      <span className="opt-ico"><I n={r.ic} /></span><b>{r.v}</b><span>{r.d}</span>{CHECK}
                    </label>
                  ))}
                </div>
                <Actions back={() => setStep(3)}>
                  <button className="btn btn-primary" onClick={() => setStep(5)}>Continue<I n="i-arrow" /></button>
                </Actions>
              </div>
            )}

            {step === 5 && (
              <div className="ob-card wide">
                <h1>What do you want to do with FlowPilot?</h1>
                <p className="sub">Pick as many as you like — we'll set up your home view around them.</p>
                <div className="opt-grid" role="group" aria-label="Your goals">
                  {GOALS.map((g) => (
                    <label className={`opt ${goals.includes(g.v) ? 'sel' : ''}`} key={g.v}>
                      <input type="checkbox" checked={goals.includes(g.v)} onChange={() => toggleGoal(g.v)} />
                      <span className="opt-ico"><I n={g.ic} /></span><b>{g.v}</b><span>{g.d}</span>{CHECK}
                    </label>
                  ))}
                </div>
                <Actions back={() => setStep(4)}>
                  <button className="btn btn-primary" onClick={() => setStep(6)}>Continue<I n="i-arrow" /></button>
                </Actions>
              </div>
            )}

            {step === 6 && (
              <div className="ob-card wide">
                <h1>Make it yours</h1>
                <p className="sub">Choose a theme and accent. The preview below updates live — change it any time.</p>
                <div className="theme-grid" role="radiogroup" aria-label="Theme">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <figure className={`theme-opt ${theme === t ? 'sel' : ''}`} key={t} style={{ margin: 0 }} onClick={() => setTheme(t)}>
                      <input type="radio" name="theme" checked={theme === t} onChange={() => setTheme(t)} aria-label={`${t} theme`} />
                      <div className="theme-thumb" style={{ background: t === 'light' ? '#F6F7F9' : t === 'dark' ? '#0D0E12' : 'linear-gradient(105deg,#F6F7F9 50%,#0D0E12 50.5%)' }}>
                        <div className="tt-side" style={{ background: t === 'dark' ? '#15161C' : '#FFFFFF', borderColor: t === 'dark' ? '#282B36' : '#E3E5EB' }} />
                        <div className="tt-main">
                          <div className="tt-bar" style={{ width: '70%', background: t === 'dark' ? '#282B36' : '#E3E5EB' }} />
                          <div className="tt-bar" style={{ width: '45%', background: t === 'dark' ? '#22242E' : '#EFF0F4' }} />
                          <div className="tt-bar" style={{ width: '26%', background: 'var(--primary-400)' }} />
                        </div>
                      </div>
                      <figcaption><svg width="13" height="13" style={{ color: 'var(--text-3)' }}><use href={`#i-${t === 'light' ? 'sun' : t === 'dark' ? 'moon' : 'monitor'}`} /></svg>{t[0].toUpperCase() + t.slice(1)}</figcaption>
                    </figure>
                  ))}
                </div>
                <div className="accent-row" role="radiogroup" aria-label="Accent color">
                  <span style={{ fontSize: '13px', fontWeight: 500, marginRight: '4px' }}>Accent</span>
                  {ACCENTS.map((c) => (
                    <button className={`acc ${accent === c ? 'sel' : ''}`} key={c} style={{ background: c }} onClick={() => setAccent(c)} aria-label={`${c} accent`} />
                  ))}
                </div>
                <div className={`live-pv lp ${previewDark ? 'dark' : ''}`} style={{ ['--lp-acc' as string]: accent } as React.CSSProperties}>
                  <div className="lp-top"><span className="lp-mark" />{nameOrDefault}</div>
                  <div className="lp-wrap">
                    <div className="lp-side">
                      {['Home', 'Sprint 24', 'Roadmap', 'Analytics'].map((x, i) => <div className={`lp-item ${i === 0 ? 'on' : ''}`} key={x}><i />{x}</div>)}
                    </div>
                    <div className="lp-main">
                      <div className="lp-kpis">
                        <div className="lp-kpi"><b>42</b><span>Committed</span></div>
                        <div className="lp-kpi"><b>27</b><span>Completed</span></div>
                        <div className="lp-kpi"><b>2.4d</b><span>Cycle time</span></div>
                      </div>
                      <div className="lp-chart">
                        <svg viewBox="0 0 300 44" width="100%" aria-hidden="true">
                          <path d="M4,36 L40,32 L76,34 L112,24 L148,27 L184,18 L220,21 L256,10 L296,6" fill="none" stroke="var(--lp-acc)" strokeWidth="2" strokeLinejoin="round" />
                        </svg>
                        <span className="lp-btn">+ New task</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Actions back={() => setStep(5)}>
                  <button className="btn btn-primary" onClick={() => setStep(7)}>Continue<I n="i-arrow" /></button>
                </Actions>
              </div>
            )}

            {step === 7 && (
              <div className="ob-card">
                <h1>Stay in the loop — your way</h1>
                <p className="sub">Only what matters: mentions, assignments, and at-risk work. Never marketing.</p>
                <div className="notif-list">
                  {([
                    ['email', 'i-mail', 'Email', 'Daily digest + immediate mentions'],
                    ['desktop', 'i-monitor', 'Desktop', 'Real-time, only while FlowPilot is open'],
                    ['mobile', 'i-phone', 'Mobile', 'Push for mentions and blockers'],
                  ] as const).map(([k, ic, title, desc]) => (
                    <div className="notif" key={k}>
                      <span className="n-ico"><I n={ic} /></span>
                      <span><b>{title}</b><span>{desc}</span></span>
                      <label className="toggle">
                        <input type="checkbox" checked={notifs[k]} onChange={(e) => setNotifs((p) => ({ ...p, [k]: e.target.checked }))} aria-label={`${title} notifications`} />
                        <span className="track" />
                      </label>
                    </div>
                  ))}
                  <div className="notif soon">
                    <span className="n-ico"><I n="i-slack" /></span>
                    <span><b>Slack <span className="badge badge-neutral" style={{ marginLeft: '6px' }}>Coming soon</span></b><span>Updates in your team channels</span></span>
                    <label className="toggle is-disabled"><input type="checkbox" disabled aria-label="Slack notifications, coming soon" /><span className="track" /></label>
                  </div>
                </div>
                <Actions back={() => setStep(6)}>
                  <button className="btn btn-primary" onClick={finish}>Finish setup<I n="i-arrow" /></button>
                </Actions>
              </div>
            )}

            {step === 8 && (
              <div className="ob-card wide done-wrap">
                <svg className="big-check" viewBox="0 0 72 72" aria-hidden="true">
                  <circle className="bc-circle" cx="36" cy="36" r="31" />
                  <path className="bc-tick" d="M24 37l8 8 16-16" />
                </svg>
                <h1>Your workspace is ready 🎉</h1>
                <p className="sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>Nice work — that took you <b style={{ color: 'var(--text-1)' }}>{elapsed}</b>. Here's what you set up:</p>
                <div className="sum-grid">
                  <div className="sum"><div className="s-l">Workspace</div><b>{nameOrDefault}</b><span>flowpilot.com/{urlOrDefault}</span></div>
                  <div className="sum"><div className="s-l">Members invited</div><b>{invites.length}</b><span>invites sent</span></div>
                  <div className="sum"><div className="s-l">Goals selected</div><b>{goals.length}</b><span>{goals.length ? goals.slice(0, 3).join(', ') + (goals.length > 3 ? ` +${goals.length - 3}` : '') : 'None selected'}</span></div>
                  <div className="sum"><div className="s-l">Est. time saved</div><b>6.5 hrs</b><span>per sprint, per team</span></div>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => window.location.assign(`/w/${urlOrDefault}`)}>Go to dashboard<I n="i-arrow" /></button>
                <p className="hint" style={{ marginTop: '12px' }}>Tip: press <b style={{ color: 'var(--text-2)' }}>⌘K</b> anywhere to search or create.</p>
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  );
}
