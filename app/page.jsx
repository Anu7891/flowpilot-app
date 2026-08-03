'use client';
// Ported from flowpilot-landing.html - markup and behavior preserved 1:1.
// Interactions run as a DOM effect for now; extract into components as you build.
import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    const _doc = [];
    const _win = [];
    const docAdd = (t, f) => { document.addEventListener(t, f); _doc.push([t, f]); };
    const winAdd = (t, f) => { window.addEventListener(t, f); _win.push([t, f]); };
    // Scroll reveal — subtle fade + 8px rise, once, honors reduced motion
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var els = document.querySelectorAll('.rv');
      if (reduce || !('IntersectionObserver' in window)) {
        els.forEach(function(e){ e.classList.add('in'); });
      } else {
        var io = new IntersectionObserver(function(entries){
          entries.forEach(function(en){
            if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
          });
        }, {rootMargin:'0px 0px -10% 0px', threshold:0.1});
        els.forEach(function(e){ io.observe(e); });
      }

      // FAQ: close others when one opens (accordion behavior)
      var faqs = Array.prototype.slice.call(document.querySelectorAll('.faq'));
      faqs.forEach(function(f){
        f.addEventListener('toggle', function(){
          if (f.open) faqs.forEach(function(o){ if (o !== f) o.open = false; });
        });
      });

      // AI chips: echo prompt into the input (demo only)
      var input = document.querySelector('.ai-input input');
      document.querySelectorAll('.ai-chip').forEach(function(c){
        c.addEventListener('click', function(){
          if (input){ input.value = c.textContent + ' for Sprint 25'; input.focus(); }
        });
      });

    // keep demo forms from reloading the page
    document.querySelectorAll('.pg-landing form').forEach(function(f){ f.addEventListener('submit', function(e){ e.preventDefault(); }); });
    return () => {
      _doc.forEach(([t, f]) => document.removeEventListener(t, f));
      _win.forEach(([t, f]) => window.removeEventListener(t, f));
    };
  }, []);

  return (
    <div className="pg-landing">
      <a className="skip" href="#main">Skip to content</a>


      <header className="nav">
        <div className="nav-in">
          <a className="logo" href="#" aria-label="FlowPilot home">
            <span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot
          </a>
          <nav className="nav-links" aria-label="Main">
            <a href="#features">Features</a>
            <a href="#showcase">Product</a>
            <a href="#ai">AI</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">Docs</a>
          </nav>
          <div className="nav-cta">
            <a className="btn btn-ghost" href="/login">Log in</a>
            <a className="btn btn-primary" href="/signup">Get started</a>
            <button className="btn btn-secondary menu-btn" style={{width:'36px', padding:'0'}} aria-label="Open menu"><svg><use href="#i-menu"/></svg></button>
          </div>
        </div>
      </header>

      <main id="main">


      <section className="hero">
        <div className="hero-in">
          <div className="hero-copy">
            <span className="hero-badge"><span className="pill">New</span>Trusted by modern product teams</span>
            <h1 className="hero-h">Plan smarter.<br />Build faster.<br /><span className="accent">Deliver with confidence.</span></h1>
            <p className="hero-p">FlowPilot brings planning, sprints, analytics, and an AI copilot into one calm workspace — so your team spends less time managing work and more time shipping it.</p>
            <div className="hero-ctas">
              <a className="btn btn-primary btn-lg" href="#pricing">Start for free<svg><use href="#i-arrow"/></svg></a>
              <a className="btn btn-secondary btn-lg" href="#showcase">See the product</a>
            </div>
            <p className="hero-ctas fine" style={{margin:'-16px 0 32px'}}>Free for teams up to 10 · No credit card required</p>
            <div className="hero-trust">
              <span className="av-stack">
                <span className="avatar">MK</span><span className="avatar a-teal">JR</span><span className="avatar a-warm">AO</span><span className="avatar a-rose">TP</span>
              </span>
              <span><b>4,200+ teams</b> plan their sprints in FlowPilot</span>
            </div>
          </div>

          <div className="shot" role="img" aria-label="FlowPilot dashboard showing sprint overview, metrics, and active tasks">
            <div className="shot-bar">
              <span className="dots"><i></i><i></i><i></i></span>
              <span className="url">app.flowpilot.com/acme/sprint-24</span>
              <span style={{width:'46px'}}></span>
            </div>
            <div className="app">
              <div className="app-side">
                <div className="ws"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>Acme Inc.</div>
                <div className="app-item"><svg><use href="#i-home"/></svg>Home</div>
                <div className="app-item"><svg><use href="#i-inbox"/></svg>Inbox<span className="ct">8</span></div>
                <div className="app-lbl">Workspace</div>
                <div className="app-item on"><svg><use href="#i-layers"/></svg>Sprint 24<span className="ct">32</span></div>
                <div className="app-item"><svg><use href="#i-map"/></svg>Roadmap</div>
                <div className="app-item"><svg><use href="#i-cal"/></svg>Calendar</div>
                <div className="app-item"><svg><use href="#i-chart"/></svg>Analytics</div>
                <div className="app-lbl">Teams</div>
                <div className="app-item"><svg><use href="#i-users"/></svg>Platform</div>
                <div className="app-item"><svg><use href="#i-users"/></svg>Mobile</div>
              </div>
              <div className="app-main">
                <div className="app-head">
                  <div>
                    <div className="crumb">Acme Inc. / Sprints</div>
                    <h4>Sprint 24 — Checkout revamp</h4>
                  </div>
                  <div className="chipset">
                    <span className="chip-sm">Day 6 of 10</span>
                    <span className="chip-sm pri">+ New task</span>
                  </div>
                </div>
                <div className="kpis">
                  <div className="kpi"><div className="k-l">Committed</div><div className="k-v">42 <span className="up">on track</span></div></div>
                  <div className="kpi"><div className="k-l">Completed</div><div className="k-v">27 <span className="up">▲ 64%</span></div></div>
                  <div className="kpi"><div className="k-l">At risk</div><div className="k-v">3 <span className="down">2 blocked</span></div></div>
                </div>
                <div className="panel">
                  <div className="panel-h">Burndown <span>updated 2m ago</span></div>
                  <svg viewBox="0 0 360 84" width="100%" role="img" aria-label="Sprint burndown chart">
                    <g stroke="var(--border)" strokeWidth="1"><line x1="0" y1="22" x2="360" y2="22"/><line x1="0" y1="48" x2="360" y2="48"/><line x1="0" y1="74" x2="360" y2="74"/></g>
                    <path d="M8,10 L352,74" stroke="var(--n-300)" strokeWidth="1.5" strokeDasharray="4 4" fill="none"/>
                    <path d="M8,10 L60,16 L112,18 L164,30 L216,34 L268,48 L310,52" stroke="var(--primary-500)" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                    <circle cx="310" cy="52" r="3" fill="var(--bg-surface)" stroke="var(--primary-500)" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="panel">
                  <div className="panel-h">In progress <span>12 tasks</span></div>
                  <div className="rowline"><span className="mono">FP-812</span><span className="nm">Payment retry logic for failed cards</span><span className="badge badge-primary badge-xs">In progress</span><span className="avatar avatar-xs">MK</span></div>
                  <div className="rowline"><span className="mono">FP-807</span><span className="nm">Apple Pay entitlement + review notes</span><span className="badge badge-warning badge-xs">Blocked</span><span className="avatar avatar-xs a-teal">JR</span></div>
                  <div className="rowline"><span className="mono">FP-799</span><span className="nm">Checkout A/B: one-page vs stepped</span><span className="badge badge-success badge-xs">Review</span><span className="avatar avatar-xs a-warm">AO</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="proof">
        <div className="wrap">
          <p className="proof-label">Engineering teams at fast-moving companies run on FlowPilot</p>
          <div className="logo-row" aria-label="Customer logos">
            <span className="wordmark"><svg><use href="#i-hex"/></svg>Basalt</span>
            <span className="wordmark wm-wide"><svg><use href="#i-tri"/></svg>Meridian</span>
            <span className="wordmark wm-serifish"><svg><use href="#i-ring"/></svg>Octave</span>
            <span className="wordmark wm-mono"><svg><use href="#i-sq"/></svg>fjordlabs</span>
            <span className="wordmark"><svg><use href="#i-wave"/></svg>Driftline</span>
            <span className="wordmark wm-wide">Arcadia</span>
          </div>
          <div className="stats">
            <div className="stat rv"><b>50K+</b><span>Active users</span></div>
            <div className="stat rv" style={{transitionDelay:'60ms'}}><b>10M+</b><span>Tasks managed</span></div>
            <div className="stat rv" style={{transitionDelay:'120ms'}}><b>99.9%</b><span>Uptime SLA</span></div>
            <div className="stat rv" style={{transitionDelay:'180ms'}}><b>120+</b><span>Countries</span></div>
          </div>
        </div>
      </section>

      <section className="sec" id="features">
        <div className="wrap">
          <div className="sec-head-row">
            <div>
              <p className="eyebrow">Everything in one place</p>
              <h2 className="sec-h">The whole delivery loop, without the tool sprawl</h2>
              <p className="sec-p">Planning in one tool, sprints in another, reports in a third. FlowPilot replaces the patchwork with a single source of truth your whole team actually opens.</p>
            </div>
          </div>
          <div className="feat-grid">
            <article className="feat rv">
              <div className="feat-ico"><svg><use href="#i-spark"/></svg></div>
              <h3>AI sprint planning</h3>
              <p>Drafts a sprint from your backlog in seconds — scoped to capacity, balanced across the team, ready to edit.</p>
              <div className="feat-mini">
                <div className="mini-chat">
                  <span className="mini-bub user">Plan Sprint 25 for 5 engineers</span>
                  <span className="mini-bub ai">Drafted 38 pts across 14 tasks. 2 carry-overs flagged. Review →</span>
                </div>
              </div>
            </article>
            <article className="feat rv" style={{transitionDelay:'50ms'}}>
              <div className="feat-ico"><svg><use href="#i-board"/></svg></div>
              <h3>Kanban boards</h3>
              <p>Fast, keyboard-first boards with WIP limits, swimlanes, and filters that remember how each team works.</p>
              <div className="feat-mini">
                <div className="mini-cols">
                  <div className="mini-col"><b>Todo · 4</b>
                    <div className="mini-card">Rate limiting<div className="mc-meta"><span className="mini-dot" style={{background:'var(--n-400)'}}></span><span className="avatar avatar-xs">MK</span></div></div>
                    <div className="mini-card">Audit log UI</div>
                  </div>
                  <div className="mini-col"><b>Doing · 2</b>
                    <div className="mini-card">SSO callback<div className="mc-meta"><span className="mini-dot" style={{background:'var(--primary-500)'}}></span><span className="avatar avatar-xs a-teal">JR</span></div></div>
                  </div>
                  <div className="mini-col"><b>Done · 7</b>
                    <div className="mini-card" style={{color:'var(--text-3)'}}>Webhooks v2</div>
                    <div className="mini-card" style={{color:'var(--text-3)'}}>Dark mode</div>
                  </div>
                </div>
              </div>
            </article>
            <article className="feat rv" style={{transitionDelay:'100ms'}}>
              <div className="feat-ico"><svg><use href="#i-map"/></svg></div>
              <h3>Project roadmaps</h3>
              <p>Quarter-level timelines that stay honest — roll-ups come straight from sprint data, not status theater.</p>
              <div className="feat-mini">
                <div className="gantt">
                  <div className="g-row"><span className="g-name">Checkout v2</span><span className="g-track"><span className="g-bar" style={{left:'0', width:'55%', background:'var(--primary-400)'}}></span></span></div>
                  <div className="g-row"><span className="g-name">Mobile beta</span><span className="g-track"><span className="g-bar" style={{left:'30%', width:'45%', background:'var(--accent-500)'}}></span></span></div>
                  <div className="g-row"><span className="g-name">SOC 2</span><span className="g-track"><span className="g-bar" style={{left:'55%', width:'40%', background:'var(--n-300)'}}></span></span></div>
                </div>
              </div>
            </article>
            <article className="feat rv">
              <div className="feat-ico"><svg><use href="#i-users"/></svg></div>
              <h3>Real-time collaboration</h3>
              <p>Live cursors, threaded comments, and presence on every board and doc. No refresh button, no merge conflicts.</p>
              <div className="feat-mini">
                <div className="mini-card" style={{marginBottom:'6px'}}>Estimate: payment retries<div className="mc-meta"><span style={{fontSize:'9px', color:'var(--text-3)'}}>3 comments</span><span className="av-stack"><span className="avatar avatar-xs">MK</span><span className="avatar avatar-xs a-teal">JR</span></span></div></div>
                <div className="mini-presence">
                  <span className="cursor-tag" style={{background:'var(--primary-500)'}}>▲ Mara</span>
                  <span className="cursor-tag" style={{background:'var(--accent-600)'}}>▲ Jonas</span>
                  <span>editing now</span>
                </div>
              </div>
            </article>
            <article className="feat rv" style={{transitionDelay:'50ms'}}>
              <div className="feat-ico"><svg><use href="#i-chart"/></svg></div>
              <h3>Analytics dashboard</h3>
              <p>Velocity, cycle time, and scope creep — measured continuously, explained plainly, exportable anywhere.</p>
              <div className="feat-mini">
                <svg className="spark" viewBox="0 0 260 56" role="img" aria-label="Velocity trend sparkline">
                  <path d="M4,44 L36,40 L68,42 L100,32 L132,35 L164,24 L196,27 L228,16 L256,12" fill="none" stroke="var(--primary-500)" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M4,44 L36,40 L68,42 L100,32 L132,35 L164,24 L196,27 L228,16 L256,12 L256,56 L4,56 Z" fill="var(--primary-500)" opacity=".08"/>
                  <circle cx="256" cy="12" r="3" fill="var(--bg-surface)" stroke="var(--primary-500)" strokeWidth="2"/>
                </svg>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'var(--text-3)', marginTop:'4px'}}><span>Velocity · 6 sprints</span><span style={{color:'var(--success)', fontWeight:'500'}}>▲ 18%</span></div>
              </div>
            </article>
            <article className="feat rv" style={{transitionDelay:'100ms'}}>
              <div className="feat-ico"><svg><use href="#i-bot"/></svg></div>
              <h3>AI task assistant</h3>
              <p>Turns rough notes into structured tasks with owners, estimates, and acceptance criteria you can trust.</p>
              <div className="feat-mini">
                <div className="mini-list">
                  <div className="rowline" style={{borderBottom:'1px solid var(--border)'}}><svg width="11" height="11" style={{color:'var(--success)'}}><use href="#i-check"/></svg><span className="nm">Add retry banner to checkout</span><span className="mono">3 pts</span></div>
                  <div className="rowline" style={{borderBottom:'1px solid var(--border)'}}><svg width="11" height="11" style={{color:'var(--success)'}}><use href="#i-check"/></svg><span className="nm">Log declined-card reasons</span><span className="mono">2 pts</span></div>
                  <div className="rowline"><svg width="11" height="11" style={{color:'var(--success)'}}><use href="#i-check"/></svg><span className="nm">Alert on &gt;2% failure rate</span><span className="mono">5 pts</span></div>
                </div>
                <div style={{fontSize:'10px', color:'var(--text-3)', marginTop:'6px'}}>Generated from meeting notes · 0.8s</div>
              </div>
            </article>
          </div>
        </div>
      </section>


      <section className="sec sec-alt" id="showcase">
        <div className="wrap center">
          <p className="eyebrow">A calm command center</p>
          <h2 className="sec-h" style={{maxWidth:'640px'}}>One workspace, six jobs done well</h2>
          <p className="sec-p" style={{marginBottom:'var(--s-6)', maxWidth:'600px'}}>Projects, tasks, calendar, analytics, AI, and team activity share one surface — so context never lives in another tab.</p>

          <div className="showcase-frame rv">
            <span className="callout" style={{top:'88px', left:'-56px'}}><span className="co-dot"></span>Projects &amp; sprints</span>
            <span className="callout" style={{top:'36%', right:'-48px'}}><span className="co-dot"></span>Team activity, live</span>
            <span className="callout" style={{bottom:'26%', left:'-72px'}}><span className="co-dot"></span>Analytics without exports</span>
            <span className="callout" style={{bottom:'-14px', right:'96px'}}><span className="co-dot"></span>AI assistant in context</span>

            <div className="shot">
              <div className="shot-bar">
                <span className="dots"><i></i><i></i><i></i></span>
                <span className="url">app.flowpilot.com/acme/overview</span>
                <span style={{width:'46px'}}></span>
              </div>
              <div className="app">
                <div className="app-side">
                  <div className="ws"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>Acme Inc.</div>
                  <div className="app-item on"><svg><use href="#i-home"/></svg>Overview</div>
                  <div className="app-item"><svg><use href="#i-inbox"/></svg>Inbox<span className="ct">8</span></div>
                  <div className="app-lbl">Workspace</div>
                  <div className="app-item"><svg><use href="#i-layers"/></svg>Projects<span className="ct">12</span></div>
                  <div className="app-item"><svg><use href="#i-board"/></svg>Tasks</div>
                  <div className="app-item"><svg><use href="#i-cal"/></svg>Calendar</div>
                  <div className="app-item"><svg><use href="#i-chart"/></svg>Analytics</div>
                  <div className="app-item"><svg><use href="#i-bot"/></svg>AI Assistant</div>
                  <div className="app-lbl">Teams</div>
                  <div className="app-item"><svg><use href="#i-users"/></svg>Platform</div>
                  <div className="app-item"><svg><use href="#i-users"/></svg>Growth</div>
                </div>
                <div className="app-main">
                  <div className="app-head">
                    <div>
                      <div className="crumb">Tuesday, July 7</div>
                      <h4>Good morning, Mara</h4>
                    </div>
                    <div className="chipset"><span className="chip-sm">This week</span><span className="chip-sm pri">+ New</span></div>
                  </div>
                  <div className="kpis">
                    <div className="kpi"><div className="k-l">Active projects</div><div className="k-v">12</div></div>
                    <div className="kpi"><div className="k-l">Due this week</div><div className="k-v">23 <span className="up">on pace</span></div></div>
                    <div className="kpi"><div className="k-l">Cycle time</div><div className="k-v">2.4d <span className="up">▼ 0.6d</span></div></div>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'10px'}}>
                    <div>
                      <div className="panel">
                        <div className="panel-h">Projects <span>4 of 12</span></div>
                        <div className="rowline"><span className="nm">Checkout revamp</span><span className="bar-track"><span className="bar-fill" style={{width:'72%'}}></span></span><span className="badge badge-success badge-xs">On track</span></div>
                        <div className="rowline"><span className="nm">Mobile app beta</span><span className="bar-track"><span className="bar-fill" style={{width:'41%'}}></span></span><span className="badge badge-warning badge-xs">At risk</span></div>
                        <div className="rowline"><span className="nm">SOC 2 readiness</span><span className="bar-track"><span className="bar-fill" style={{width:'88%'}}></span></span><span className="badge badge-success badge-xs">On track</span></div>
                        <div className="rowline"><span className="nm">Design system v2</span><span className="bar-track"><span className="bar-fill" style={{width:'15%'}}></span></span><span className="badge badge-neutral badge-xs">Planning</span></div>
                      </div>
                      <div className="panel">
                        <div className="panel-h">Throughput <span>last 8 weeks</span></div>
                        <svg viewBox="0 0 320 64" width="100%" role="img" aria-label="Weekly throughput bar chart">
                          <g fill="var(--primary-300)">
                            <rect x="10" y="34" width="24" height="24" rx="2"/><rect x="48" y="28" width="24" height="30" rx="2"/>
                            <rect x="86" y="38" width="24" height="20" rx="2"/><rect x="124" y="22" width="24" height="36" rx="2"/>
                            <rect x="162" y="26" width="24" height="32" rx="2"/><rect x="200" y="16" width="24" height="42" rx="2"/>
                            <rect x="238" y="20" width="24" height="38" rx="2"/>
                          </g>
                          <rect x="276" y="10" width="24" height="48" rx="2" fill="var(--primary-500)"/>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="panel">
                        <div className="panel-h">Activity</div>
                        <div className="rowline"><span className="avatar avatar-xs a-teal">JR</span><span className="nm" style={{fontWeight:'400'}}>Jonas closed <b style={{color:'var(--text-1)'}}>FP-791</b></span><span className="mono">2m</span></div>
                        <div className="rowline"><span className="avatar avatar-xs">MK</span><span className="nm" style={{fontWeight:'400'}}>Mara commented on <b style={{color:'var(--text-1)'}}>FP-812</b></span><span className="mono">9m</span></div>
                        <div className="rowline"><span className="avatar avatar-xs a-warm">AO</span><span className="nm" style={{fontWeight:'400'}}>Amara moved 3 tasks to <b style={{color:'var(--text-1)'}}>Review</b></span><span className="mono">14m</span></div>
                        <div className="rowline"><span className="avatar avatar-xs a-rose">TP</span><span className="nm" style={{fontWeight:'400'}}>Theo started <b style={{color:'var(--text-1)'}}>Sprint 25</b> draft</span><span className="mono">1h</span></div>
                      </div>
                      <div className="panel">
                        <div className="panel-h">AI Assistant</div>
                        <div style={{padding:'10px 12px', fontSize:'11px', lineHeight:'16px', color:'var(--text-2)'}}>
                          <div style={{display:'flex', gap:'6px', marginBottom:'8px'}}><svg width="12" height="12" style={{color:'var(--primary)', flex:'none', marginTop:'1px'}}><use href="#i-spark"/></svg><span><b style={{color:'var(--text-1)'}}>Heads up:</b> Mobile beta is trending 4 days late. Two tasks have no owner.</span></div>
                          <span className="chip-sm" style={{height:'20px', fontSize:'10px'}}>Fix suggestions →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="showcase-legend" aria-label="Areas of the product shown above">
            <span className="legend-chip"><i></i>Projects</span>
            <span className="legend-chip"><i></i>Tasks</span>
            <span className="legend-chip"><i></i>Calendar</span>
            <span className="legend-chip"><i></i>Analytics</span>
            <span className="legend-chip"><i></i>AI Assistant</span>
            <span className="legend-chip"><i></i>Team activity</span>
          </div>
        </div>
      </section>


      <section className="sec">
        <div className="wrap">
          <div className="sec-head-row">
            <div>
              <p className="eyebrow">Why teams switch</p>
              <h2 className="sec-h">Built for outcomes, not activity</h2>
              <p className="sec-p">Features are table stakes. What changes with FlowPilot is what your team gets back: time, foresight, and the confidence to commit to a date.</p>
            </div>
          </div>
          <div className="why-grid">
            <article className="why rv">
              <div className="w-vis"><span className="w-metric">6.5 hrs<small>saved / sprint</small></span></div>
              <h3>Save hours every sprint</h3>
              <p>Planning, estimation, and stand-up prep collapse from meetings into minutes. The average team reclaims most of a working day per sprint.</p>
            </article>
            <article className="why rv" style={{transitionDelay:'50ms'}}>
              <div className="w-vis">
                <div className="risk-pills">
                  <span className="risk-pill" style={{background:'var(--danger-bg)', color:'var(--danger-text)', border:'1px solid var(--danger-border)'}}>3 risks</span>
                  <svg width="16" height="16" style={{color:'var(--text-3)'}}><use href="#i-arrow"/></svg>
                  <span className="risk-pill" style={{background:'var(--success-bg)', color:'var(--success-text)', border:'1px solid var(--success-border)'}}>flagged day 2, not day 9</span>
                </div>
              </div>
              <h3>Catch risks before they land</h3>
              <p>FlowPilot watches scope, velocity, and blockers continuously — and tells you a project is slipping while there's still time to act.</p>
            </article>
            <article className="why rv" style={{transitionDelay:'100ms'}}>
              <div className="w-vis">
                <span className="av-stack" style={{marginRight:'12px'}}>
                  <span className="avatar">MK</span><span className="avatar a-teal">JR</span><span className="avatar a-warm">AO</span><span className="avatar a-rose">TP</span>
                </span>
                <span className="badge badge-primary">1 shared source of truth</span>
              </div>
              <h3>Collaboration without ceremony</h3>
              <p>Comments live on the work, decisions stay attached to tasks, and nobody writes a Monday status update ever again.</p>
            </article>
            <article className="why rv">
              <div className="w-vis">
                <svg width="180" height="52" viewBox="0 0 180 52" role="img" aria-label="Progress trend">
                  <path d="M4,44 L40,38 L76,40 L112,26 L148,20 L176,10" fill="none" stroke="var(--accent-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="176" cy="10" r="3.5" fill="var(--bg-surface)" stroke="var(--accent-500)" strokeWidth="2.5"/>
                </svg>
              </div>
              <h3>See progress, don't chase it</h3>
              <p>Burndowns, roadmap roll-ups, and cycle-time trends update themselves from real work — visible to everyone, argued by no one.</p>
            </article>
            <article className="why rv" style={{transitionDelay:'50ms'}}>
              <div className="w-vis">
                <span className="badge badge-neutral" style={{textDecoration:'line-through', opacity:'.7'}}>Manual triage</span>
                <svg width="16" height="16" style={{color:'var(--text-3)', margin:'0 10px'}}><use href="#i-arrow"/></svg>
                <span className="badge badge-primary"><svg width="11" height="11" style={{marginRight:'2px'}}><use href="#i-zap"/></svg>Automated</span>
              </div>
              <h3>Automate the repetitive 30%</h3>
              <p>Routing, labeling, estimates, reminders, release notes — the busywork runs itself with rules and AI actions you approve once.</p>
            </article>
            <article className="why rv" style={{transitionDelay:'100ms'}}>
              <div className="w-vis">
                <svg width="52" height="52" viewBox="0 0 52 52" role="img" aria-label="94 percent on-time delivery">
                  <circle cx="26" cy="26" r="21" fill="none" stroke="var(--bg-inset)" strokeWidth="6"/>
                  <circle className="ring" cx="26" cy="26" r="21" fill="none" stroke="var(--success)" strokeWidth="6" strokeLinecap="round" strokeDasharray="124 132" transform="rotate(-90 26 26)"/>
                </svg>
                <span style={{marginLeft:'12px'}}><b style={{fontSize:'20px', letterSpacing:'-.01em'}}>94%</b><span style={{display:'block', fontSize:'12px', color:'var(--text-3)'}}>sprints delivered on time</span></span>
              </div>
              <h3>Commit to dates with confidence</h3>
              <p>When estimates come from your own delivery history, "when will it ship?" finally has an answer you can stand behind.</p>
            </article>
          </div>
        </div>
      </section>


      <section className="sec ai-band" id="ai">
        <div className="wrap">
          <div className="ai-grid">
            <div>
              <p className="eyebrow">FlowPilot AI</p>
              <h2 className="sec-h">A copilot that knows your project, not just your prompt</h2>
              <p className="sec-p">FlowPilot AI works from your actual backlog, velocity, and history — every suggestion is grounded in your team's data and every action needs your approval.</p>
              <ul className="ai-points">
                <li><span className="pt-ico"><svg><use href="#i-spark"/></svg></span><span><b>Generate sprint plans</b>Scoped to real capacity, balanced across the team.</span></li>
                <li><span className="pt-ico"><svg><use href="#i-doc"/></svg></span><span><b>Summarize meetings &amp; write user stories</b>Notes in, structured tickets with acceptance criteria out.</span></li>
                <li><span className="pt-ico"><svg><use href="#i-clock"/></svg></span><span><b>Estimate tasks from history</b>Estimates based on how long similar work actually took.</span></li>
                <li><span className="pt-ico"><svg><use href="#i-shield"/></svg></span><span><b>Predict project risks</b>Early warnings on scope creep, blockers, and silent slippage.</span></li>
              </ul>
            </div>

            <div className="ai-panel rv" role="group" aria-label="FlowPilot AI assistant demo">
              <div className="ai-head">
                <span className="ai-dot"><svg><use href="#i-flow"/></svg></span>
                <div><b>FlowPilot AI</b><span>Workspace: Acme Inc. · Sprint 24</span></div>
                <span className="ai-live"><i></i>Grounded in your data</span>
              </div>
              <div className="ai-body">
                <div className="bub user">Draft Sprint 25. Prioritize checkout work, keep 20% capacity for bugs.</div>
                <div className="bub ai">Done — here's a draft based on 5 engineers at ~42 pts velocity, with <b>8 pts reserved for bugs</b>:
                  <div className="plan-card">
                    <div className="plan-row"><span className="nm">Payment retry logic (carry-over)</span><span className="est">5 pts · Mara</span></div>
                    <div className="plan-row"><span className="nm">Apple Pay review fixes</span><span className="est">3 pts · Jonas</span></div>
                    <div className="plan-row"><span className="nm">One-page checkout rollout — 50%</span><span className="est">8 pts · Amara</span></div>
                    <div className="plan-row"><span className="nm">Decline-reason analytics</span><span className="est">5 pts · Theo</span></div>
                    <div className="plan-row"><span className="nm">+ 9 more tasks</span><span className="est">13 pts</span></div>
                  </div>
                </div>
                <div className="bub ai"><b>One risk:</b> Apple Pay review has a 2-week external dependency. Want me to move it to the front of the sprint?</div>
              </div>
              <div className="ai-chips" aria-label="Suggested prompts">
                <button className="ai-chip">Summarize meeting notes</button>
                <button className="ai-chip">Create user stories</button>
                <button className="ai-chip">Estimate tasks</button>
                <button className="ai-chip">Predict risks</button>
              </div>
              <div className="ai-input">
                <input type="text" placeholder="Ask about your project…" aria-label="Ask FlowPilot AI" />
                <button className="ai-send" aria-label="Send"><svg><use href="#i-send"/></svg></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap center">
          <p className="eyebrow">What teams say</p>
          <h2 className="sec-h" style={{maxWidth:'560px'}}>Trusted where delivery actually matters</h2>
          <p className="sec-p" style={{marginBottom:'var(--s-6)'}}>From seed-stage squads to 200-person engineering orgs.</p>
          <div className="testi-grid" style={{textAlign:'left'}}>
            <figure className="testi rv">
              <div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
              <blockquote>"We cut sprint planning from three hours to about twenty minutes. The AI drafts, we adjust, we start. Two quarters in and we haven't missed a release date."</blockquote>
              <figcaption className="who">
                <span className="avatar">SC</span>
                <span><b>Sarah Chen</b><span>VP of Engineering · Basalt</span></span>
              </figcaption>
            </figure>
            <figure className="testi rv" style={{transitionDelay:'60ms'}}>
              <div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
              <blockquote>"The risk predictions felt like a gimmick until FlowPilot flagged a dependency two weeks before it would've blown up our launch. It paid for the year right there."</blockquote>
              <figcaption className="who">
                <span className="avatar a-teal">DO</span>
                <span><b>David Okafor</b><span>Head of Product · Meridian Systems</span></span>
              </figcaption>
            </figure>
            <figure className="testi rv" style={{transitionDelay:'120ms'}}>
              <div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
              <blockquote>"We replaced three tools and a pile of spreadsheets. My favorite part is what's gone: no status meetings, no 'quick sync', no chasing updates across tabs."</blockquote>
              <figcaption className="who">
                <span className="avatar a-warm">EM</span>
                <span><b>Elena Marchetti</b><span>Engineering Manager · Fjord Labs</span></span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>


      <section className="sec sec-alt" id="pricing">
        <div className="wrap center">
          <p className="eyebrow">Pricing</p>
          <h2 className="sec-h" style={{maxWidth:'520px'}}>Simple pricing that scales with you</h2>
          <p className="sec-p" style={{marginBottom:'var(--s-6)'}}>Start free, upgrade when your team does. Every paid plan has a 14-day trial — no credit card.</p>

          <div className="price-grid" style={{textAlign:'left'}}>
            <div className="plan rv">
              <h3>Free</h3>
              <p className="p-for">For small teams getting organized</p>
              <div className="p-price"><b>$0</b><span>forever</span></div>
              <p className="p-bill">Up to 10 members</p>
              <ul>
                <li><svg><use href="#i-check"/></svg>Unlimited projects &amp; tasks</li>
                <li><svg><use href="#i-check"/></svg>Kanban boards &amp; sprints</li>
                <li><svg><use href="#i-check"/></svg>Basic analytics</li>
                <li><svg><use href="#i-check"/></svg>50 AI actions / month</li>
                <li className="dim"><svg><use href="#i-check"/></svg>Community support</li>
              </ul>
              <a className="btn btn-secondary" href="#">Start for free</a>
            </div>

            <div className="plan hot rv" style={{transitionDelay:'60ms'}}>
              <span className="p-tag badge badge-primary">Most popular</span>
              <h3>Pro</h3>
              <p className="p-for">For teams shipping every sprint</p>
              <div className="p-price"><b>$12</b><span>per user / month</span></div>
              <p className="p-bill">Billed annually · $15 monthly</p>
              <ul>
                <li><svg><use href="#i-check"/></svg>Everything in Free</li>
                <li><svg><use href="#i-check"/></svg>Unlimited AI actions</li>
                <li><svg><use href="#i-check"/></svg>Roadmaps &amp; advanced analytics</li>
                <li><svg><use href="#i-check"/></svg>Risk predictions &amp; automations</li>
                <li><svg><use href="#i-check"/></svg>Guest access &amp; integrations</li>
                <li><svg><use href="#i-check"/></svg>Priority support</li>
              </ul>
              <a className="btn btn-primary" href="#">Start 14-day trial</a>
            </div>

            <div className="plan rv" style={{transitionDelay:'120ms'}}>
              <h3>Enterprise</h3>
              <p className="p-for">For orgs with security &amp; scale needs</p>
              <div className="p-price"><b>Custom</b></div>
              <p className="p-bill">Annual agreement</p>
              <ul>
                <li><svg><use href="#i-check"/></svg>Everything in Pro</li>
                <li><svg><use href="#i-check"/></svg>SAML SSO &amp; SCIM provisioning</li>
                <li><svg><use href="#i-check"/></svg>Audit logs &amp; data residency</li>
                <li><svg><use href="#i-check"/></svg>99.9% uptime SLA</li>
                <li><svg><use href="#i-check"/></svg>Dedicated success manager</li>
              </ul>
              <a className="btn btn-secondary" href="#">Talk to sales</a>
            </div>
          </div>
          <p className="price-note">Nonprofits and open-source projects get Pro free — <a href="#" style={{color:'var(--text-link)'}}>apply here</a>.</p>
        </div>
      </section>


      <section className="sec" id="faq">
        <div className="wrap">
          <div className="center" style={{marginBottom:'var(--s-6)'}}>
            <p className="eyebrow">FAQ</p>
            <h2 className="sec-h">Questions, answered plainly</h2>
          </div>
          <div className="faq-wrap">
            <details className="faq" open>
              <summary>Is our project data used to train AI models?<svg><use href="#i-plus"/></svg></summary>
              <div className="faq-a">No. Your workspace data is never used to train foundation models — ours or anyone else's. AI features run on isolated infrastructure, prompts and outputs are encrypted in transit and at rest, and Enterprise customers can disable AI features entirely, per workspace or per team.</div>
            </details>
            <details className="faq">
              <summary>How is FlowPilot secured?<svg><use href="#i-plus"/></svg></summary>
              <div className="faq-a">FlowPilot is SOC 2 Type II certified and GDPR compliant. Data is encrypted with AES-256 at rest and TLS 1.3 in transit, with role-based access control on every object. Enterprise plans add SAML SSO, SCIM, audit logs, and EU or US data residency.</div>
            </details>
            <details className="faq">
              <summary>What happens when we outgrow the Free plan?<svg><use href="#i-plus"/></svg></summary>
              <div className="faq-a">Nothing breaks. Your data stays intact past 10 members — you just can't add more until you upgrade. Pro is $12 per user per month billed annually, prorated when people join mid-cycle, and you can downgrade any time and keep read access to everything.</div>
            </details>
            <details className="faq">
              <summary>Can we invite clients or contractors?<svg><use href="#i-plus"/></svg></summary>
              <div className="faq-a">Yes. Pro includes free guest seats with scoped access — guests see only the projects you share, and you control whether they can comment or edit. Most agencies run every client engagement in a shared FlowPilot project.</div>
            </details>
            <details className="faq">
              <summary>How accurate are the AI estimates and risk predictions?<svg><use href="#i-plus"/></svg></summary>
              <div className="faq-a">They improve with your history. Estimates are grounded in how long similar work took your team — not generic averages — and every AI suggestion shows its reasoning. After ~3 sprints of data, teams typically see estimates land within 15% of actuals. You always approve before anything changes.</div>
            </details>
            <details className="faq">
              <summary>Can we migrate from Jira, Linear, or Asana?<svg><use href="#i-plus"/></svg></summary>
              <div className="faq-a">One-click importers bring over projects, tasks, comments, attachments, and history with mappings you can review before committing. Most teams migrate in under an hour; Enterprise migrations get a dedicated engineer.</div>
            </details>
          </div>
        </div>
      </section>


      <section className="sec cta-band">
        <div className="wrap" style={{position:'relative'}}>
          <h2 className="rv">Ready to build better projects?</h2>
          <p className="rv" style={{transitionDelay:'60ms'}}>Join 4,200+ teams planning smarter, shipping faster, and hitting the dates they commit to.</p>
          <div className="rv" style={{display:'flex', gap:'16px', justifyContent:'center', transitionDelay:'120ms'}}>
            <a className="btn btn-inverse btn-lg" href="#pricing">Start for free<svg><use href="#i-arrow"/></svg></a>
            <a className="btn btn-outline-inverse btn-lg" href="#">Book a demo</a>
          </div>
          <p className="fine rv" style={{transitionDelay:'180ms'}}>Free for teams up to 10 · No credit card · Set up in 5 minutes</p>
        </div>
      </section>

      </main>


      <footer className="footer">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="logo" href="#" aria-label="FlowPilot home">
                <span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot
              </a>
              <p>The AI-powered project management platform for modern software teams.</p>
              <p className="status-pill" style={{marginTop:'14px'}}><i></i>All systems operational</p>
            </div>
            <div className="foot-col">
              <b>Product</b>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#">Integrations</a>
              <a href="#">Changelog</a>
              <a href="#">Roadmap</a>
            </div>
            <div className="foot-col">
              <b>Company</b>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Customers</a>
              <a href="#">Contact</a>
            </div>
            <div className="foot-col">
              <b>Resources</b>
              <a href="#">Docs</a>
              <a href="#">API reference</a>
              <a href="#">Guides</a>
              <a href="#">Community</a>
              <a href="#">Status</a>
            </div>
            <div className="foot-col news">
              <b>Stay in the loop</b>
              <p>Product updates and delivery best practices. Monthly, no noise.</p>
              <form className="news-form">
                <input type="email" placeholder="you@company.com" aria-label="Email address" />
                <button className="btn btn-primary" type="submit">Subscribe</button>
              </form>
            </div>
          </div>
          <div className="foot-base">
            <span>© 2026 FlowPilot, Inc. All rights reserved.</span>
            <div className="foot-legal">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
              <a href="#">DPA</a>
            </div>
            <div className="socials">
              <a href="#" aria-label="FlowPilot on X"><svg><use href="#i-x-soc"/></svg></a>
              <a href="#" aria-label="FlowPilot on GitHub"><svg><use href="#i-gh"/></svg></a>
              <a href="#" aria-label="FlowPilot on LinkedIn"><svg><use href="#i-li"/></svg></a>
            </div>
          </div>
        </div>
      </footer>


    </div>
  );
}
