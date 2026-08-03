'use client';
// Ported from flowpilot-auth-onboarding.html - the full 16-screen prototype.
// Each route mounts this with a different initial screen; in-flow transitions stay
// client-side. Next step: split screens into their own components + real routing.
import { useEffect } from 'react';

export default function FlowApp({ initial = 's-welcome' }) {
  useEffect(() => {
    const INITIAL = initial;
    const _doc = [];
    const _win = [];
    const docAdd = (t, f) => { document.addEventListener(t, f); _doc.push([t, f]); };
    const winAdd = (t, f) => { window.addEventListener(t, f); _win.push([t, f]); };
    var $ = function(s, r){ return (r||document).querySelector(s); };
      var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };

      /* ------- state ------- */
      var state = {
        name:'Mara', email:'mara@acme.com',
        ws:'Acme Inc.', url:'acme', size:'1–10', ind:'Software & SaaS',
        invites:[], goals:[], startedAt:null
      };

      /* ------- API helper (real backend at /api/v1) ------- */
      async function api(path, opts){
        var res = await fetch('/api/v1' + path, Object.assign({
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
        }, opts));
        var body = null;
        try { body = await res.json(); } catch (e) { /* 204 etc. */ }
        if (!res.ok) {
          var err = new Error((body && body.error && body.error.message) || 'Something went wrong.');
          err.code = body && body.error && body.error.code;
          err.status = res.status;
          throw err;
        }
        return body ? body.data : null;
      }
      function showFieldError(el, message){
        el.innerHTML = '<svg width="12" height="12"><use href="#i-warn"/></svg>' + message;
        el.hidden = false;
      }

      /* ------- screen router ------- */
      var current = INITIAL;
      var _init = document.getElementById(INITIAL); if (_init) _init.classList.add('on');
      function go(id){
        var from = $('#'+current), to = $('#'+id);
        if (!to || from === to) return;
        from.classList.remove('on');
        to.classList.add('on');
        current = id;
        window.scrollTo(0,0);
        // restart check animations
        $$('.bc-circle, .bc-tick', to).forEach(function(p){
          p.style.animation='none'; void p.getBoundingClientRect(); p.style.animation='';
        });
        if (id === 's-ob1' && !state.startedAt) state.startedAt = Date.now();
        if (id === 's-dash') loadDash();
      }
      docAdd('click', function(e){
        var t = e.target.closest('[data-go]');
        if (t){ e.preventDefault(); go(t.getAttribute('data-go')); }
      });

      /* ------- prototype menu ------- */
      var pBtn = $('#protoBtn'), pMenu = $('#protoMenu');
      pBtn.addEventListener('click', function(){
        var open = pMenu.classList.toggle('open');
        pBtn.setAttribute('aria-expanded', String(open));
      });
      docAdd('click', function(e){
        if (!e.target.closest('.proto')) { pMenu.classList.remove('open'); pBtn.setAttribute('aria-expanded','false'); }
      });

      /* ------- password peek ------- */
      $$('[data-peek]').forEach(function(b){
        b.addEventListener('click', function(){
          var i = $('#'+b.getAttribute('data-peek'));
          i.type = i.type === 'password' ? 'text' : 'password';
        });
      });

      /* ------- signup: strength + validation ------- */
      var suPass = $('#su-pass'), suStr = $('#su-strength');
      function strength(v){
        if (!v) return 0;
        var s = 0;
        if (v.length >= 8) s++;
        if (v.length >= 12) s++;
        if (/[0-9]/.test(v) && /[a-zA-Z]/.test(v)) s++;
        if (/[^a-zA-Z0-9]/.test(v)) s++;
        return Math.max(1, Math.min(4, v.length < 8 ? 1 : s));
      }
      var strLabels = ['Use 8+ characters with a mix of letters, numbers & symbols','Weak — add more characters','Fair — add numbers or symbols','Strong password','Very strong password'];
      suPass.addEventListener('input', function(){
        var lv = strength(suPass.value);
        suStr.setAttribute('data-level', String(lv));
        $('.str-label', suStr).textContent = strLabels[lv];
        matchCheck();
      });
      var suPass2 = $('#su-pass2');
      function matchCheck(){
        var err = $('#su-pass2-err'), ok = $('#su-pass2-ok');
        if (!suPass2.value){ err.hidden = true; ok.hidden = true; suPass2.classList.remove('is-invalid'); return; }
        var m = suPass2.value === suPass.value;
        err.hidden = m; ok.hidden = !m;
        suPass2.classList.toggle('is-invalid', !m);
      }
      suPass2.addEventListener('input', matchCheck);

      var suEmail = $('#su-email');
      function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
      suEmail.addEventListener('blur', function(){
        var bad = suEmail.value && !validEmail(suEmail.value);
        $('#su-email-err').hidden = !bad;
        suEmail.classList.toggle('is-invalid', bad);
      });
      suEmail.addEventListener('input', function(){
        if (!suEmail.value || validEmail(suEmail.value)){ $('#su-email-err').hidden = true; suEmail.classList.remove('is-invalid'); }
      });

      $('#signupForm').addEventListener('submit', function(e){
        e.preventDefault();
        var okEmail = validEmail(suEmail.value);
        $('#su-email-err').hidden = okEmail;
        suEmail.classList.toggle('is-invalid', !okEmail);
        if (!okEmail){ suEmail.focus(); return; }
        if (strength(suPass.value) < 2){ suStr.setAttribute('data-level','1'); $('.str-label', suStr).textContent = strLabels[1]; suPass.focus(); return; }
        if (suPass2.value !== suPass.value){ matchCheck(); suPass2.focus(); return; }
        if (!$('#su-terms').checked){ $('#su-terms').focus(); return; }
        var fullName = $('#su-name').value.trim();
        if (!fullName){ $('#su-name').classList.add('is-invalid'); $('#su-name').focus(); return; }
        $('#su-name').classList.remove('is-invalid');
        var btn = $('#su-submit');
        btn.innerHTML = '<span class="spinner"></span>Creating account…'; btn.disabled = true;
        api('/auth/signup', { method: 'POST', body: JSON.stringify({ name: fullName, email: suEmail.value, password: suPass.value }) })
          .then(function(res){
            state.name = res.user.name.split(' ')[0];
            state.email = res.user.email;
            btn.innerHTML = 'Create account'; btn.disabled = false;
            $('#vf-email').textContent = state.email;
            $('#cr-name').textContent = state.name;
            go('s-verify');
          })
          .catch(function(err){
            btn.innerHTML = 'Create account'; btn.disabled = false;
            var msg = err.status ? err.message : "Network error — we couldn't reach FlowPilot. Try again.";
            showFieldError($('#su-email-err'), msg);
            suEmail.classList.add('is-invalid');
            if (err.code === 'CONFLICT') suEmail.focus();
          });
      });

      /* ------- login ------- */
      $('#loginForm').addEventListener('submit', function(e){
        e.preventDefault();
        var email = $('#li-email').value, pass = $('#li-pass').value;
        var alertBox = $('#li-alert'), msg = $('#li-alert-msg');
        var btn = $('#li-submit');
        btn.innerHTML = '<span class="spinner"></span>Signing in…'; btn.disabled = true;
        api('/auth/login', { method: 'POST', body: JSON.stringify({ email: email, password: pass }) })
          .then(function(res){
            alertBox.hidden = true;
            state.email = res.user.email;
            state.name = (res.user.name || '').split(' ')[0] || 'there';
            btn.innerHTML = '<svg width="16" height="16"><use href="#i-check"/></svg>Signed in';
            setTimeout(function(){ btn.innerHTML = 'Sign in'; btn.disabled = false; window.location.href = '/dashboard'; }, 400);
          })
          .catch(function(err){
            btn.disabled = false; btn.innerHTML = 'Sign in';
            msg.textContent = err.status
              ? err.message
              : "Network error — we couldn't reach FlowPilot. Check your connection and try again.";
            alertBox.hidden = false;
          });
      });

      /* ------- forgot password ------- */
      $('#forgotForm').addEventListener('submit', function(e){
        e.preventDefault();
        var em = $('#fp-email');
        if (!validEmail(em.value)){ em.classList.add('is-invalid'); em.focus(); return; }
        em.classList.remove('is-invalid');
        var btn = $('#fp-submit');
        btn.innerHTML = '<span class="spinner"></span>Sending…'; btn.disabled = true;
        setTimeout(function(){
          btn.innerHTML = 'Send reset link'; btn.disabled = false;
          $('#fp-sent-to').textContent = em.value;
          $('#fp-ask').hidden = true; $('#fp-done').hidden = false;
          $$('#fp-done .bc-circle, #fp-done .bc-tick').forEach(function(p){ p.style.animation='none'; void p.getBoundingClientRect(); p.style.animation=''; });
        }, 800);
      });
      $('#fp-again').addEventListener('click', function(e){
        e.preventDefault(); $('#fp-done').hidden = true; $('#fp-ask').hidden = false;
      });

      /* ------- step 2: workspace ------- */
      var wsName = $('#ws-name'), wsUrl = $('#ws-url');
      var taken = ['acme','test','flowpilot'];
      function slug(v){ return v.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
      var urlTouched = false;
      function syncPreview(){
        var n = wsName.value.trim() || 'Acme Inc.';
        var u = wsUrl.value.trim() || 'acme';
        state.ws = n; state.url = u;
        $('#pv-name').textContent = n;
        $('#pv-url').textContent = 'flowpilot.com/' + u;
        var initial = (n[0]||'A').toUpperCase();
        $('#pv-logo').textContent = initial; $('#ws-logo').textContent = initial;
        var isTaken = taken.indexOf(slug(n)) > -1 && slug(n) !== '';
        $('#ws-name-err').hidden = !isTaken;
        wsName.classList.toggle('is-invalid', isTaken);
        $('#ws-url-ok').hidden = !(u && taken.indexOf(u) === -1);
        $('#ws-continue').disabled = isTaken;
      }
      wsName.addEventListener('input', function(){
        if (!urlTouched) wsUrl.value = slug(wsName.value);
        syncPreview();
      });
      wsUrl.addEventListener('input', function(){ urlTouched = true; wsUrl.value = slug(wsUrl.value) || wsUrl.value.toLowerCase(); syncPreview(); });
      $('#ws-suggest').addEventListener('click', function(e){
        e.preventDefault(); wsName.value = wsName.value.trim() + ' HQ'; urlTouched = false; wsUrl.value = slug(wsName.value); syncPreview(); wsName.focus();
      });
      $('#ws-ind').addEventListener('change', function(){ state.ind = this.value; $('#pv-ind').textContent = this.value; });
      $$('#ws-size button').forEach(function(b){
        b.addEventListener('click', function(){
          $$('#ws-size button').forEach(function(x){ x.classList.remove('active'); });
          b.classList.add('active'); state.size = b.textContent; $('#pv-size').textContent = b.textContent;
        });
      });

      /* ------- step 3: invites ------- */
      var invEmail = $('#inv-email'), invChips = $('#inv-chips');
      function addInvite(){
        var v = invEmail.value.trim();
        if (!validEmail(v)){ $('#inv-err').hidden = false; invEmail.classList.add('is-invalid'); return; }
        $('#inv-err').hidden = true; invEmail.classList.remove('is-invalid');
        if (state.invites.indexOf(v) > -1){ invEmail.value=''; return; }
        state.invites.push(v);
        renderChips(); invEmail.value = ''; invEmail.focus();
      }
      function renderChips(){
        invChips.innerHTML = '';
        state.invites.forEach(function(em, idx){
          var c = document.createElement('span');
          c.className = 'chip-inv';
          var ini = em.slice(0,2).toUpperCase();
          c.innerHTML = '<span class="avatar">'+ini+'</span>'+em+'<button aria-label="Remove '+em+'"><svg><use href="#i-x"/></svg></button>';
          c.querySelector('button').addEventListener('click', function(){ state.invites.splice(idx,1); renderChips(); });
          invChips.appendChild(c);
        });
        $('#inv-continue').textContent = state.invites.length ? 'Send '+state.invites.length+' invite'+(state.invites.length>1?'s':'')+' & continue' : 'Continue';
      }
      $('#inv-add').addEventListener('click', addInvite);
      invEmail.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ','){ e.preventDefault(); addInvite(); }
      });

      /* ------- step 4/5: option cards ------- */
      function wireOpts(rootSel){
        $$(rootSel + ' .opt').forEach(function(o){
          var i = o.querySelector('input');
          function sync(){
            if (i.type === 'radio'){
              $$(rootSel + ' .opt').forEach(function(x){ x.classList.toggle('sel', x.querySelector('input').checked); });
            } else {
              o.classList.toggle('sel', i.checked);
            }
          }
          i.addEventListener('change', sync); sync();
        });
      }
      wireOpts('#role-grid'); wireOpts('#goal-grid');

      /* ------- step 6: theme + accent ------- */
      var lp = $('#lp');
      $$('.theme-opt').forEach(function(t){
        t.querySelector('input').addEventListener('change', function(){
          $$('.theme-opt').forEach(function(x){ x.classList.remove('sel'); });
          t.classList.add('sel');
          var v = t.getAttribute('data-theme-opt');
          var dark = v === 'dark' || (v === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          lp.classList.toggle('dark', dark);
        });
      });
      $$('.accent-row .acc').forEach(function(a){
        a.addEventListener('click', function(){
          $$('.accent-row .acc').forEach(function(x){ x.classList.remove('sel'); });
          a.classList.add('sel');
          lp.style.setProperty('--lp-acc', a.getAttribute('data-acc'));
        });
      });

      /* ------- finish: building sequence (REAL workspace creation) ------- */
      $('#finish-setup').addEventListener('click', function(){
        $('#bld-ws').textContent = state.ws;
        go('s-building');
        var steps = $$('#b-steps .b-step');
        steps.forEach(function(s){ s.classList.remove('doing','did'); s.querySelector('.b-ico').innerHTML = '<span style="color:var(--n-300)">•</span>'; });
        function doing(i){ steps[i].classList.add('doing'); steps[i].querySelector('.b-ico').innerHTML = '<span class="spinner" style="width:12px;height:12px;border-width:1.5px"></span>'; }
        function did(i){ steps[i].classList.remove('doing'); steps[i].classList.add('did'); steps[i].querySelector('.b-ico').innerHTML = '<svg width="13" height="13"><use href="#i-check"/></svg>'; }
        var pause = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };

        doing(0);
        api('/workspaces', { method: 'POST', body: JSON.stringify({ name: state.ws, slug: state.url }) })
          .then(function(ws){
            state.wsId = ws.id; state.url = ws.slug;
            did(0); doing(1);
            // invites: existing accounts join instantly; unknown emails are skipped silently in v1
            return state.invites.reduce(function(chain, em){
              return chain.then(function(){
                return api('/workspaces/' + state.url + '/members', { method: 'POST', body: JSON.stringify({ email: em }) })
                  .catch(function(){ /* no account with that email yet - ignore */ });
              });
            }, Promise.resolve());
          })
          .then(function(){ did(1); doing(2); return pause(450); })
          .then(function(){ did(2); doing(3); return pause(450); })
          .then(function(){ did(3); finishSummary(); go('s-ob8'); })
          .catch(function(err){
            go('s-ob2');
            showFieldError($('#ws-name-err'), err.status ? err.message : "Network error — couldn't reach FlowPilot.");
            wsName.classList.add('is-invalid');
          });
      });

      function finishSummary(){
        $('#dn-ws').textContent = state.ws;
        $('#dn-url').textContent = 'flowpilot.com/' + state.url;
        $('#dn-inv').textContent = String(state.invites.length);
        var goals = $$('#goal-grid input:checked').map(function(i){ return i.value; });
        state.goals = goals;
        $('#dn-goals').textContent = String(goals.length);
        $('#dn-goals-list').textContent = goals.length ? goals.slice(0,3).join(', ') + (goals.length>3 ? ' +'+(goals.length-3) : '') : 'None selected';
        if (state.startedAt){
          var secs = Math.max(20, Math.round((Date.now() - state.startedAt)/1000));
          $('#dn-time').textContent = secs < 60 ? secs+'s' : Math.floor(secs/60)+'m '+(secs%60)+'s';
        }
      }

      /* ------- dashboard ------- */
      $('#go-dash').addEventListener('click', function(){ window.location.href = '/dashboard'; });
      function loadDash(){
        $('#dash-sk').hidden = false;
        $('#dash-real').hidden = true;
        Promise.all([
          api('/auth/session'),
          api('/workspaces').catch(function(){ return []; }),
        ]).then(function(results){
          var user = results[0] && results[0].user;
          if (!user){ go('s-login'); return; } // not signed in -> back to login
          state.name = (user.name || '').split(' ')[0] || 'there';
          var list = results[1] || [];
          var ws = list.length ? list[0] : null;
          if (ws){ state.ws = ws.name; state.url = ws.slug; }
          $('#dash-ws').textContent = ws ? ws.name : 'FlowPilot';
          $('#dash-name').textContent = state.name;
          $('#dash-av').textContent = (user.name || 'U').split(' ').map(function(w){ return w[0]; }).join('').slice(0,2).toUpperCase();
          var membersReq = ws
            ? api('/workspaces/' + ws.slug + '/members').catch(function(){ return []; })
            : Promise.resolve([]);
          return membersReq.then(function(members){
            var others = Math.max(0, (members || []).length - 1);
            $('#team-empty').hidden = others > 0;
            $('#team-some').hidden = others === 0;
            $('#team-count').textContent = String(others);
            $('#dash-sk').hidden = true;
            $('#dash-real').hidden = false;
          });
        }).catch(function(){
          // API unreachable -> show the prototype view instead of a dead end
          $('#dash-ws').textContent = state.ws;
          $('#dash-name').textContent = state.name;
          $('#dash-sk').hidden = true;
          $('#dash-real').hidden = false;
        });
      }

      /* ------- init ------- */
      syncPreview();
      renderChips();
    return () => {
      _doc.forEach(([t, f]) => document.removeEventListener(t, f));
      _win.forEach(([t, f]) => window.removeEventListener(t, f));
    };
  }, [initial]);

  return (
    <div className="pg-flow">

      <section className="screen" id="s-welcome" aria-label="Welcome">
        <div className="welcome">
          <span className="logo" style={{fontSize:'18px'}}><span className="logo-mark" style={{width:'36px', height:'36px', borderRadius:'10px'}}><svg style={{width:'20px', height:'20px'}}><use href="#i-flow"/></svg></span>FlowPilot</span>
          <h1>Plan smarter. Build faster.<br />Deliver with confidence.</h1>
          <p className="tag">The AI-powered workspace for modern software teams.</p>
          <p className="desc">Projects, sprints, analytics, and an AI copilot — together in one calm place. Set up takes less than two minutes.</p>
          <div className="w-ctas">
            <button className="btn btn-primary btn-lg" data-go="s-signup">Get started<svg><use href="#i-arrow"/></svg></button>
            <button className="btn btn-secondary btn-lg" data-go="s-login">Sign in</button>
          </div>
          <div className="w-trust">
            <span style={{display:'inline-flex'}}>
              <span className="avatar" style={{border:'2px solid var(--bg-surface)'}}>MK</span>
              <span className="avatar a-teal" style={{marginLeft:'-8px', border:'2px solid var(--bg-surface)'}}>JR</span>
              <span className="avatar a-warm" style={{marginLeft:'-8px', border:'2px solid var(--bg-surface)'}}>AO</span>
            </span>
            Trusted by 50,000+ professionals
          </div>
          <div className="mock" role="img" aria-label="Preview of the FlowPilot dashboard">
            <div className="mock-bar"><span className="dots"><i></i><i></i><i></i></span><span>app.flowpilot.com</span></div>
            <div className="mock-body">
              <div className="mock-side">
                <div className="mock-item on"><svg><use href="#i-home"/></svg>Home</div>
                <div className="mock-item"><svg><use href="#i-layers"/></svg>Sprint 24</div>
                <div className="mock-item"><svg><use href="#i-map"/></svg>Roadmap</div>
                <div className="mock-item"><svg><use href="#i-chart"/></svg>Analytics</div>
                <div className="mock-item"><svg><use href="#i-bot"/></svg>AI Assistant</div>
              </div>
              <div className="mock-main">
                <div className="mock-kpis">
                  <div className="mock-kpi"><b>42</b><span>Committed</span></div>
                  <div className="mock-kpi"><b>27</b><span>Completed</span></div>
                  <div className="mock-kpi"><b>2.4d</b><span>Cycle time</span></div>
                </div>
                <div className="mock-panel">
                  <div className="mock-row"><span className="mock-dot" style={{background:'var(--primary-400)'}}></span><span className="nm">Payment retry logic</span><span>Mara</span></div>
                  <div className="mock-row"><span className="mock-dot" style={{background:'var(--warning)'}}></span><span className="nm">Apple Pay review notes</span><span>Jonas</span></div>
                  <div className="mock-row"><span className="mock-dot" style={{background:'var(--success)'}}></span><span className="nm">Checkout A/B experiment</span><span>Amara</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="screen" id="s-signup" aria-label="Create your account">
        <div className="auth">
          <div className="auth-form">
            <div className="af-top">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot</span>
              <span className="aux">Have an account? <a href="#" data-go="s-login">Sign in</a></span>
            </div>
            <div className="auth-card">
              <h1>Create your account</h1>
              <p className="sub">Free for teams up to 10. No credit card required.</p>
              <div className="sso">
                <button className="btn btn-secondary" type="button"><svg><use href="#i-google"/></svg>Google</button>
                <button className="btn btn-secondary" type="button"><svg><use href="#i-gh"/></svg>GitHub</button>
              </div>
              <div className="divider">or with email</div>
              <form id="signupForm" noValidate>
                <div className="field">
                  <label htmlFor="su-name">Full name</label>
                  <input className="input" id="su-name" autoComplete="name" placeholder="Mara Kis" />
                </div>
                <div className="field">
                  <label htmlFor="su-email">Work email</label>
                  <div className="input-wrap">
                    <svg><use href="#i-mail"/></svg>
                    <input className="input" id="su-email" type="email" autoComplete="email" placeholder="you@company.com" aria-describedby="su-email-err" />
                  </div>
                  <span className="err-msg" id="su-email-err" hidden><svg><use href="#i-warn"/></svg>That doesn't look like a valid email — check for typos.</span>
                </div>
                <div className="field">
                  <label htmlFor="su-pass">Password</label>
                  <div className="input-wrap">
                    <svg><use href="#i-lock"/></svg>
                    <input className="input" id="su-pass" type="password" autoComplete="new-password" placeholder="8+ characters" aria-describedby="su-strength" style={{paddingRight:'36px'}} />
                    <span className="trail"><button type="button" data-peek="su-pass" aria-label="Show password"><svg><use href="#i-eye"/></svg></button></span>
                  </div>
                  <div className="strength" id="su-strength" data-level="0" aria-live="polite">
                    <div className="str-bars"><i></i><i></i><i></i><i></i></div>
                    <span className="str-label">Use 8+ characters with a mix of letters, numbers &amp; symbols</span>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="su-pass2">Confirm password</label>
                  <div className="input-wrap">
                    <svg><use href="#i-lock"/></svg>
                    <input className="input" id="su-pass2" type="password" autoComplete="new-password" placeholder="Repeat password" aria-describedby="su-pass2-err" />
                  </div>
                  <span className="err-msg" id="su-pass2-err" hidden><svg><use href="#i-warn"/></svg>Passwords don't match yet.</span>
                  <span className="ok-msg" id="su-pass2-ok" hidden><svg><use href="#i-check-c"/></svg>Passwords match</span>
                </div>
                <label className="check" style={{marginTop:'2px'}}>
                  <input type="checkbox" id="su-terms" />
                  <span className="box"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
                  <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
                </label>
                <button className="btn btn-primary btn-lg w-full" type="submit" id="su-submit">Create account</button>
              </form>
            </div>
            <p className="af-foot">Protected by SOC 2 Type II controls · Data encrypted at rest and in transit</p>
          </div>
          <div className="auth-panel">
            <figure className="quote" style={{marginLeft:'0'}}>
              <p>"We cut sprint planning from three hours to twenty minutes. FlowPilot drafts, we adjust, we start."</p>
              <figcaption className="q-who"><span className="avatar">SC</span><span><b>Sarah Chen</b>VP of Engineering, Basalt</span></figcaption>
            </figure>
            <div className="mock" style={{maxWidth:'460px'}}>
              <div className="mock-bar"><span className="dots"><i></i><i></i><i></i></span><span>app.flowpilot.com/acme</span></div>
              <div className="mock-body">
                <div className="mock-side">
                  <div className="mock-item"><svg><use href="#i-home"/></svg>Home</div>
                  <div className="mock-item on"><svg><use href="#i-layers"/></svg>Sprint 24</div>
                  <div className="mock-item"><svg><use href="#i-chart"/></svg>Analytics</div>
                  <div className="mock-item"><svg><use href="#i-bot"/></svg>AI Assistant</div>
                </div>
                <div className="mock-main">
                  <div className="mock-kpis">
                    <div className="mock-kpi"><b>94%</b><span>On-time</span></div>
                    <div className="mock-kpi"><b>▲18%</b><span>Velocity</span></div>
                    <div className="mock-kpi"><b>6.5h</b><span>Saved / sprint</span></div>
                  </div>
                  <div className="mock-panel">
                    <div className="mock-row"><span className="mock-dot" style={{background:'var(--primary-400)'}}></span><span className="nm">AI drafted Sprint 25 · 38 pts</span></div>
                    <div className="mock-row"><span className="mock-dot" style={{background:'var(--success)'}}></span><span className="nm">Risk cleared: Apple Pay review</span></div>
                    <div className="mock-row"><span className="mock-dot" style={{background:'var(--accent-500)'}}></span><span className="nm">Velocity trend updated</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="screen" id="s-login" aria-label="Sign in">
        <div className="auth">
          <div className="auth-form">
            <div className="af-top">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot</span>
              <span className="aux">New here? <a href="#" data-go="s-signup">Create account</a></span>
            </div>
            <div className="auth-card">
              <h1>Welcome back</h1>
              <p className="sub">Sign in to your workspace.</p>
              <div className="alert alert-danger" id="li-alert" hidden role="alert">
                <svg><use href="#i-warn"/></svg>
                <div><b>Couldn't sign you in</b><p id="li-alert-msg">Incorrect email or password. Try again or reset your password.</p></div>
              </div>
              <div className="sso" style={{marginTop:'4px'}}>
                <button className="btn btn-secondary" type="button"><svg><use href="#i-google"/></svg>Google</button>
                <button className="btn btn-secondary" type="button"><svg><use href="#i-gh"/></svg>GitHub</button>
              </div>
              <div className="divider">or with email</div>
              <form id="loginForm" noValidate>
                <div className="field">
                  <label htmlFor="li-email">Email</label>
                  <div className="input-wrap">
                    <svg><use href="#i-mail"/></svg>
                    <input className="input" id="li-email" type="email" autoComplete="email" placeholder="you@company.com" />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="li-pass">Password <a className="lbl-aux" href="#" data-go="s-forgot">Forgot password?</a></label>
                  <div className="input-wrap">
                    <svg><use href="#i-lock"/></svg>
                    <input className="input" id="li-pass" type="password" autoComplete="current-password" placeholder="Your password" style={{paddingRight:'36px'}} />
                    <span className="trail"><button type="button" data-peek="li-pass" aria-label="Show password"><svg><use href="#i-eye"/></svg></button></span>
                  </div>
                </div>
                <label className="check">
                  <input type="checkbox" defaultChecked />
                  <span className="box"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
                  Remember me for 30 days
                </label>
                <button className="btn btn-primary btn-lg w-full" type="submit" id="li-submit">Sign in</button>
              </form>
            </div>
            <p className="af-foot">Single sign-on (SAML) available on Enterprise — <a href="#">use SSO instead</a></p>
          </div>
          <div className="auth-panel">
            <figure className="quote" style={{marginLeft:'0'}}>
              <p>"My favorite part is what's gone: no status meetings, no 'quick sync', no chasing updates."</p>
              <figcaption className="q-who"><span className="avatar a-warm">EM</span><span><b>Elena Marchetti</b>Engineering Manager, Fjord Labs</span></figcaption>
            </figure>
            <div className="mock" style={{maxWidth:'460px'}}>
              <div className="mock-bar"><span className="dots"><i></i><i></i><i></i></span><span>app.flowpilot.com/acme</span></div>
              <div className="mock-body">
                <div className="mock-side">
                  <div className="mock-item on"><svg><use href="#i-home"/></svg>Home</div>
                  <div className="mock-item"><svg><use href="#i-board"/></svg>Board</div>
                  <div className="mock-item"><svg><use href="#i-cal"/></svg>Calendar</div>
                  <div className="mock-item"><svg><use href="#i-bell"/></svg>Inbox</div>
                </div>
                <div className="mock-main">
                  <div className="mock-panel" style={{marginBottom:'6px'}}>
                    <div className="mock-row"><span className="avatar" style={{width:'16px', height:'16px', fontSize:'8px'}}>JR</span><span className="nm">Jonas closed FP-791</span><span>2m</span></div>
                    <div className="mock-row"><span className="avatar a-teal" style={{width:'16px', height:'16px', fontSize:'8px'}}>AO</span><span className="nm">Amara moved 3 tasks to Review</span><span>14m</span></div>
                    <div className="mock-row"><span className="avatar a-warm" style={{width:'16px', height:'16px', fontSize:'8px'}}>TP</span><span className="nm">Theo started Sprint 25 draft</span><span>1h</span></div>
                  </div>
                  <div className="mock-kpis">
                    <div className="mock-kpi"><b>12</b><span>Projects</span></div>
                    <div className="mock-kpi"><b>23</b><span>Due this week</span></div>
                    <div className="mock-kpi"><b>3</b><span>At risk</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="screen" id="s-forgot" aria-label="Reset your password">
        <div className="auth">
          <div className="auth-form">
            <div className="af-top">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot</span>
              <span className="aux"><a href="#" data-go="s-login">← Back to sign in</a></span>
            </div>
            <div className="auth-card">
              <div id="fp-ask">
                <h1>Reset your password</h1>
                <p className="sub">Enter the email you use for FlowPilot and we'll send you a reset link.</p>
                <form id="forgotForm" noValidate>
                  <div className="field">
                    <label htmlFor="fp-email">Email</label>
                    <div className="input-wrap">
                      <svg><use href="#i-mail"/></svg>
                      <input className="input" id="fp-email" type="email" autoComplete="email" placeholder="you@company.com" />
                    </div>
                  </div>
                  <button className="btn btn-primary btn-lg w-full" type="submit" id="fp-submit">Send reset link</button>
                </form>
              </div>
              <div id="fp-done" hidden>
                <svg className="big-check" viewBox="0 0 72 72" aria-hidden="true">
                  <circle className="bc-circle" cx="36" cy="36" r="31"/>
                  <path className="bc-tick" d="M24 37l8 8 16-16"/>
                </svg>
                <h1 style={{textAlign:'center'}}>Check your inbox</h1>
                <p className="sub" style={{textAlign:'center'}}>We sent a reset link to <b id="fp-sent-to" style={{color:'var(--text-1)'}}>you@company.com</b>. The link expires in 30 minutes.</p>
                <button className="btn btn-secondary w-full" data-go="s-login">Return to sign in</button>
                <p className="hint" style={{textAlign:'center', marginTop:'12px'}}>Didn't get it? Check spam or <a href="#" id="fp-again">resend</a>.</p>
              </div>
            </div>
            <p className="af-foot">For security, reset links are single-use.</p>
          </div>
          <div className="auth-panel">
            <figure className="quote" style={{marginLeft:'0'}}>
              <p>"Set up took our team eleven minutes, including the Jira import. That was the whole migration."</p>
              <figcaption className="q-who"><span className="avatar a-teal">DO</span><span><b>David Okafor</b>Head of Product, Meridian Systems</span></figcaption>
            </figure>
          </div>
        </div>
      </section>


      <section className="screen" id="s-verify" aria-label="Email verified">
        <div className="welcome" style={{justifyContent:'center'}}>
          <div style={{maxWidth:'400px'}}>
            <svg className="big-check pulse-ring" style={{borderRadius:'99px'}} viewBox="0 0 72 72" aria-hidden="true">
              <circle className="bc-circle" cx="36" cy="36" r="31"/>
              <path className="bc-tick" d="M24 37l8 8 16-16"/>
            </svg>
            <h1 style={{fontSize:'28px', lineHeight:'36px', margin:'0 0 8px'}}>Email verified</h1>
            <p className="desc" style={{marginBottom:'32px'}}>Your email <b style={{color:'var(--text-2)'}} id="vf-email">mara@acme.com</b> is confirmed. You're seconds away from your new workspace.</p>
            <button className="btn btn-primary btn-lg" data-go="s-created">Continue<svg><use href="#i-arrow"/></svg></button>
          </div>
        </div>
      </section>


      <section className="screen" id="s-created" aria-label="Account created">
        <div className="welcome" style={{justifyContent:'center'}}>
          <div style={{maxWidth:'460px'}}>
            <span className="logo" style={{marginBottom:'24px'}}><span className="logo-mark" style={{width:'36px', height:'36px', borderRadius:'10px'}}><svg style={{width:'20px', height:'20px'}}><use href="#i-flow"/></svg></span></span>
            <h1 style={{fontSize:'28px', lineHeight:'36px', margin:'0 0 8px'}}>Welcome to FlowPilot, <span id="cr-name">Mara</span> 👋</h1>
            <p className="desc" style={{marginBottom:'24px'}}>Your account is ready. Next we'll set up your workspace — it takes under two minutes, and you can invite your team along the way.</p>
            <div className="ob-panel" style={{textAlign:'left', marginBottom:'32px', padding:'24px'}}>
              <ul className="setup-list">
                <li><span className="sl-num">1</span><span><b>Create your workspace</b> — name, URL, and a few basics</span></li>
                <li><span className="sl-num">2</span><span><b>Invite your team</b> — or skip and do it later</span></li>
                <li><span className="sl-num">3</span><span><b>Personalize</b> — role, goals, theme, notifications</span></li>
              </ul>
            </div>
            <button className="btn btn-primary btn-lg" data-go="s-ob1">Set up workspace<svg><use href="#i-arrow"/></svg></button>
          </div>
        </div>
      </section>

      <section className="screen" id="s-ob1" aria-label="Onboarding — welcome" data-step="1">
        <div className="ob">
          <div className="ob-top">
            <div className="ob-top-in">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot</span>
              <span className="ob-meta"><span className="step-lbl">Step 1 of 8</span>·<span>Under 2 minutes</span></span>
            </div>
            <div className="ob-prog"><i style={{width:'12.5%'}}></i></div>
          </div>
          <div className="ob-body">
            <div className="ob-card" style={{textAlign:'center', maxWidth:'520px'}}>
              <h1>Let's set up your workspace</h1>
              <p className="sub" style={{marginLeft:'auto', marginRight:'auto'}}>A few quick questions so FlowPilot fits how your team works. Everything can be changed later in Settings.</p>
              <div className="illus" role="img" aria-label="Workspace setup illustration">
                <span className="il-node"><svg><use href="#i-layers"/></svg></span>
                <span className="il-line"></span>
                <span className="il-node"><svg><use href="#i-users"/></svg></span>
                <span className="il-line"></span>
                <span className="il-node"><svg><use href="#i-spark"/></svg></span>
              </div>
              <button className="btn btn-primary btn-lg" data-go="s-ob2">Continue<svg><use href="#i-arrow"/></svg></button>
            </div>
          </div>
        </div>
      </section>


      <section className="screen" id="s-ob2" aria-label="Onboarding — create workspace" data-step="2">
        <div className="ob">
          <div className="ob-top">
            <div className="ob-top-in">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot</span>
              <span className="ob-meta"><span className="step-lbl">Step 2 of 8</span>·<span>Under 2 minutes</span></span>
            </div>
            <div className="ob-prog"><i style={{width:'25%'}}></i></div>
          </div>
          <div className="ob-body">
            <div className="ob-card wide">
              <h1>Create your workspace</h1>
              <p className="sub">This is your team's shared home. The URL is how teammates will find it.</p>
              <div className="ws-grid">
                <div className="ob-panel">
                  <div className="ws-form">
                    <div className="field">
                      <label htmlFor="ws-name">Workspace name</label>
                      <input className="input" id="ws-name" placeholder="Acme Inc." />
                      <span className="err-msg" id="ws-name-err" hidden><svg><use href="#i-warn"/></svg><span>That workspace name is taken. Try <a href="#" id="ws-suggest">Acme HQ</a>?</span></span>
                    </div>
                    <div className="field">
                      <label htmlFor="ws-url">Workspace URL</label>
                      <div className="url-wrap">
                        <span className="url-pre">flowpilot.com/</span>
                        <input className="input" id="ws-url" placeholder="acme" spellCheck="false" />
                      </div>
                      <span className="ok-msg" id="ws-url-ok" hidden><svg><use href="#i-check-c"/></svg>URL is available</span>
                    </div>
                    <div className="field">
                      <label>Workspace logo <span className="lbl-aux" style={{color:'var(--text-3)'}}>Optional</span></label>
                      <div className="upload" role="button" tabIndex="0" aria-label="Upload workspace logo">
                        <span className="up-mark" id="ws-logo">A</span>
                        <span><b>Upload a logo</b><span>PNG or SVG, at least 128×128 — or keep the monogram</span></span>
                      </div>
                    </div>
                    <div className="two-col">
                      <div className="field">
                        <label htmlFor="ws-ind">Industry</label>
                        <select className="select" id="ws-ind">
                          <option>Software &amp; SaaS</option>
                          <option>Fintech</option>
                          <option>E-commerce</option>
                          <option>Healthcare</option>
                          <option>Agency &amp; consulting</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Team size</label>
                        <div className="seg-sm" role="radiogroup" aria-label="Team size" id="ws-size">
                          <button type="button" className="active">1–10</button>
                          <button type="button">11–50</button>
                          <button type="button">51–200</button>
                          <button type="button">200+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <aside className="ws-preview" aria-label="Workspace preview">
                  <p className="pv-label">Preview</p>
                  <div className="pv-card">
                    <div className="pv-head">
                      <span className="up-mark" id="pv-logo">A</span>
                      <span><b id="pv-name">Acme Inc.</b><span id="pv-url">flowpilot.com/acme</span></span>
                    </div>
                    <div className="pv-rows">
                      <div className="pv-row"><span>Industry</span><span id="pv-ind">Software &amp; SaaS</span></div>
                      <div className="pv-row"><span>Team size</span><span id="pv-size">1–10</span></div>
                      <div className="pv-row"><span>Plan</span><span>Free</span></div>
                    </div>
                  </div>
                </aside>
              </div>
              <div className="ob-actions">
                <button className="btn btn-ghost" data-go="s-ob1"><svg><use href="#i-back"/></svg>Back</button>
                <div className="right"><button className="btn btn-primary" id="ws-continue" data-go="s-ob3">Continue<svg><use href="#i-arrow"/></svg></button></div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="screen" id="s-ob3" aria-label="Onboarding — invite team" data-step="3">
        <div className="ob">
          <div className="ob-top">
            <div className="ob-top-in">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot</span>
              <span className="ob-meta"><span className="step-lbl">Step 3 of 8</span>·<span>Under 2 minutes</span></span>
            </div>
            <div className="ob-prog"><i style={{width:'37.5%'}}></i></div>
          </div>
          <div className="ob-body">
            <div className="ob-card">
              <h1>Invite your team</h1>
              <p className="sub">FlowPilot is better together — teammates see plans, boards, and updates instantly. You can always invite people later.</p>
              <div className="ob-panel">
                <div className="field">
                  <label htmlFor="inv-email">Invite by email</label>
                  <div className="invite-row">
                    <div className="input-wrap">
                      <svg><use href="#i-mail"/></svg>
                      <input className="input" id="inv-email" type="email" placeholder="teammate@acme.com — press Enter to add" />
                    </div>
                    <button className="btn btn-secondary" id="inv-add" type="button"><svg><use href="#i-plus"/></svg>Add</button>
                  </div>
                  <span className="err-msg" id="inv-err" hidden><svg><use href="#i-warn"/></svg>Enter a valid email address.</span>
                  <span className="hint">Invitees join as Members. You can change roles in Settings → People.</span>
                </div>
                <div className="chips" id="inv-chips" aria-live="polite"></div>
              </div>
              <div className="ob-actions">
                <button className="btn btn-ghost" data-go="s-ob2"><svg><use href="#i-back"/></svg>Back</button>
                <div className="right">
                  <button className="btn btn-ghost" data-go="s-ob4">Skip for now</button>
                  <button className="btn btn-primary" data-go="s-ob4" id="inv-continue">Continue<svg><use href="#i-arrow"/></svg></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="screen" id="s-ob4" aria-label="Onboarding — choose role" data-step="4">
        <div className="ob">
          <div className="ob-top">
            <div className="ob-top-in">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot</span>
              <span className="ob-meta"><span className="step-lbl">Step 4 of 8</span>·<span>Under 2 minutes</span></span>
            </div>
            <div className="ob-prog"><i style={{width:'50%'}}></i></div>
          </div>
          <div className="ob-body">
            <div className="ob-card wide">
              <h1>What best describes your role?</h1>
              <p className="sub">We'll tune default views and templates to match. This only affects you.</p>
              <div className="opt-grid" role="radiogroup" aria-label="Your role" id="role-grid">
                <label className="opt"><input type="radio" name="role" defaultValue="Founder" /><span className="opt-ico"><svg><use href="#i-rocket"/></svg></span><b>Founder</b><span>Big picture, many hats</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
                <label className="opt"><input type="radio" name="role" defaultValue="Project Manager" defaultChecked /><span className="opt-ico"><svg><use href="#i-cal"/></svg></span><b>Project Manager</b><span>Plans, timelines, delivery</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
                <label className="opt"><input type="radio" name="role" defaultValue="Developer" /><span className="opt-ico"><svg><use href="#i-zap"/></svg></span><b>Developer</b><span>Building and shipping</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
                <label className="opt"><input type="radio" name="role" defaultValue="Designer" /><span className="opt-ico"><svg><use href="#i-pen"/></svg></span><b>Designer</b><span>UX, UI, and systems</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
                <label className="opt"><input type="radio" name="role" defaultValue="QA" /><span className="opt-ico"><svg><use href="#i-bug"/></svg></span><b>QA</b><span>Quality and testing</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
                <label className="opt"><input type="radio" name="role" defaultValue="Product Manager" /><span className="opt-ico"><svg><use href="#i-target"/></svg></span><b>Product Manager</b><span>Roadmaps and outcomes</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
                <label className="opt"><input type="radio" name="role" defaultValue="Other" /><span className="opt-ico"><svg><use href="#i-user"/></svg></span><b>Other</b><span>Something else entirely</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
              </div>
              <div className="ob-actions">
                <button className="btn btn-ghost" data-go="s-ob3"><svg><use href="#i-back"/></svg>Back</button>
                <div className="right"><button className="btn btn-primary" data-go="s-ob5">Continue<svg><use href="#i-arrow"/></svg></button></div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="screen" id="s-ob5" aria-label="Onboarding — choose goals" data-step="5">
        <div className="ob">
          <div className="ob-top">
            <div className="ob-top-in">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot</span>
              <span className="ob-meta"><span className="step-lbl">Step 5 of 8</span>·<span>Under 2 minutes</span></span>
            </div>
            <div className="ob-prog"><i style={{width:'62.5%'}}></i></div>
          </div>
          <div className="ob-body">
            <div className="ob-card wide">
              <h1>What do you want to do with FlowPilot?</h1>
              <p className="sub">Pick as many as you like — we'll set up your home view around them.</p>
              <div className="opt-grid" id="goal-grid" role="group" aria-label="Your goals">
                <label className="opt"><input type="checkbox" defaultValue="Manage projects" defaultChecked /><span className="opt-ico"><svg><use href="#i-layers"/></svg></span><b>Manage projects</b><span>Plans, owners, status</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
                <label className="opt"><input type="checkbox" defaultValue="Sprint planning" defaultChecked /><span className="opt-ico"><svg><use href="#i-cal"/></svg></span><b>Sprint planning</b><span>Capacity, commitment</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
                <label className="opt"><input type="checkbox" defaultValue="Task tracking" /><span className="opt-ico"><svg><use href="#i-board"/></svg></span><b>Task tracking</b><span>Boards and workflows</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
                <label className="opt"><input type="checkbox" defaultValue="Roadmaps" /><span className="opt-ico"><svg><use href="#i-map"/></svg></span><b>Roadmaps</b><span>Quarters and milestones</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
                <label className="opt"><input type="checkbox" defaultValue="AI assistance" defaultChecked /><span className="opt-ico"><svg><use href="#i-spark"/></svg></span><b>AI assistance</b><span>Drafts, estimates, risks</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
                <label className="opt"><input type="checkbox" defaultValue="Analytics" /><span className="opt-ico"><svg><use href="#i-chart"/></svg></span><b>Analytics</b><span>Velocity and cycle time</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
                <label className="opt"><input type="checkbox" defaultValue="Documentation" /><span className="opt-ico"><svg><use href="#i-doc"/></svg></span><b>Documentation</b><span>Specs next to the work</span><span className="opt-check"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label>
              </div>
              <div className="ob-actions">
                <button className="btn btn-ghost" data-go="s-ob4"><svg><use href="#i-back"/></svg>Back</button>
                <div className="right"><button className="btn btn-primary" data-go="s-ob6">Continue<svg><use href="#i-arrow"/></svg></button></div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="screen" id="s-ob6" aria-label="Onboarding — choose theme" data-step="6">
        <div className="ob">
          <div className="ob-top">
            <div className="ob-top-in">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot</span>
              <span className="ob-meta"><span className="step-lbl">Step 6 of 8</span>·<span>Under 2 minutes</span></span>
            </div>
            <div className="ob-prog"><i style={{width:'75%'}}></i></div>
          </div>
          <div className="ob-body">
            <div className="ob-card wide">
              <h1>Make it yours</h1>
              <p className="sub">Choose a theme and accent. The preview below updates live — change it any time.</p>
              <div className="theme-grid" role="radiogroup" aria-label="Theme">
                <figure className="theme-opt sel" data-theme-opt="light" style={{margin:'0'}}>
                  <input type="radio" name="theme" defaultValue="light" defaultChecked aria-label="Light theme" />
                  <div className="theme-thumb" style={{background:'#F6F7F9'}}>
                    <div className="tt-side" style={{background:'#FFFFFF', borderColor:'#E3E5EB'}}></div>
                    <div className="tt-main">
                      <div className="tt-bar" style={{width:'70%', background:'#E3E5EB'}}></div>
                      <div className="tt-bar" style={{width:'45%', background:'#EFF0F4'}}></div>
                      <div className="tt-bar" style={{width:'26%', background:'var(--primary-300)'}}></div>
                    </div>
                  </div>
                  <figcaption><svg width="13" height="13" style={{color:'var(--text-3)'}}><use href="#i-sun"/></svg>Light</figcaption>
                </figure>
                <figure className="theme-opt" data-theme-opt="dark" style={{margin:'0'}}>
                  <input type="radio" name="theme" defaultValue="dark" aria-label="Dark theme" />
                  <div className="theme-thumb" style={{background:'#0D0E12'}}>
                    <div className="tt-side" style={{background:'#15161C', borderColor:'#282B36'}}></div>
                    <div className="tt-main">
                      <div className="tt-bar" style={{width:'70%', background:'#282B36'}}></div>
                      <div className="tt-bar" style={{width:'45%', background:'#22242E'}}></div>
                      <div className="tt-bar" style={{width:'26%', background:'var(--primary-500)'}}></div>
                    </div>
                  </div>
                  <figcaption><svg width="13" height="13" style={{color:'var(--text-3)'}}><use href="#i-moon"/></svg>Dark</figcaption>
                </figure>
                <figure className="theme-opt" data-theme-opt="system" style={{margin:'0'}}>
                  <input type="radio" name="theme" defaultValue="system" aria-label="System theme" />
                  <div className="theme-thumb" style={{background:'linear-gradient(105deg,#F6F7F9 50%,#0D0E12 50.5%)'}}>
                    <div className="tt-side" style={{background:'#FFFFFF', borderColor:'#E3E5EB'}}></div>
                    <div className="tt-main">
                      <div className="tt-bar" style={{width:'70%', background:'linear-gradient(90deg,#E3E5EB 55%,#282B36 56%)'}}></div>
                      <div className="tt-bar" style={{width:'45%', background:'linear-gradient(90deg,#EFF0F4 70%,#22242E 71%)'}}></div>
                      <div className="tt-bar" style={{width:'26%', background:'var(--primary-400)'}}></div>
                    </div>
                  </div>
                  <figcaption><svg width="13" height="13" style={{color:'var(--text-3)'}}><use href="#i-monitor"/></svg>System</figcaption>
                </figure>
              </div>
              <div className="accent-row" role="radiogroup" aria-label="Accent color">
                <span style={{fontSize:'13px', fontWeight:'500', marginRight:'4px'}}>Accent</span>
                <button className="acc sel" style={{background:'#4650C7'}} data-acc="#4650C7" aria-label="Indigo accent"></button>
                <button className="acc" style={{background:'#0F8A75'}} data-acc="#0F8A75" aria-label="Teal accent"></button>
                <button className="acc" style={{background:'#B26205'}} data-acc="#B26205" aria-label="Amber accent"></button>
                <button className="acc" style={{background:'#A62D31'}} data-acc="#A62D31" aria-label="Crimson accent"></button>
                <button className="acc" style={{background:'#3B4053'}} data-acc="#3B4053" aria-label="Graphite accent"></button>
              </div>
              <div className="live-pv lp" id="lp">
                <div className="lp-top"><span className="lp-mark"></span><span id="lp-ws">Acme Inc.</span></div>
                <div className="lp-wrap">
                  <div className="lp-side">
                    <div className="lp-item on"><i></i>Home</div>
                    <div className="lp-item"><i></i>Sprint 24</div>
                    <div className="lp-item"><i></i>Roadmap</div>
                    <div className="lp-item"><i></i>Analytics</div>
                  </div>
                  <div className="lp-main">
                    <div className="lp-kpis">
                      <div className="lp-kpi"><b>42</b><span>Committed</span></div>
                      <div className="lp-kpi"><b>27</b><span>Completed</span></div>
                      <div className="lp-kpi"><b>2.4d</b><span>Cycle time</span></div>
                    </div>
                    <div className="lp-chart">
                      <svg viewBox="0 0 300 44" width="100%" aria-hidden="true">
                        <path d="M4,36 L40,32 L76,34 L112,24 L148,27 L184,18 L220,21 L256,10 L296,6" fill="none" stroke="var(--lp-acc)" strokeWidth="2" strokeLinejoin="round"/>
                      </svg>
                      <span className="lp-btn">+ New task</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ob-actions">
                <button className="btn btn-ghost" data-go="s-ob5"><svg><use href="#i-back"/></svg>Back</button>
                <div className="right"><button className="btn btn-primary" data-go="s-ob7">Continue<svg><use href="#i-arrow"/></svg></button></div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="screen" id="s-ob7" aria-label="Onboarding — notifications" data-step="7">
        <div className="ob">
          <div className="ob-top">
            <div className="ob-top-in">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot</span>
              <span className="ob-meta"><span className="step-lbl">Step 7 of 8</span>·<span>Under 2 minutes</span></span>
            </div>
            <div className="ob-prog"><i style={{width:'87.5%'}}></i></div>
          </div>
          <div className="ob-body">
            <div className="ob-card">
              <h1>Stay in the loop — your way</h1>
              <p className="sub">Only what matters: mentions, assignments, and at-risk work. Never marketing.</p>
              <div className="notif-list">
                <div className="notif">
                  <span className="n-ico"><svg><use href="#i-mail"/></svg></span>
                  <span><b>Email</b><span>Daily digest + immediate mentions</span></span>
                  <label className="toggle"><input type="checkbox" defaultChecked aria-label="Email notifications" /><span className="track"></span></label>
                </div>
                <div className="notif">
                  <span className="n-ico"><svg><use href="#i-monitor"/></svg></span>
                  <span><b>Desktop</b><span>Real-time, only while FlowPilot is open</span></span>
                  <label className="toggle"><input type="checkbox" defaultChecked aria-label="Desktop notifications" /><span className="track"></span></label>
                </div>
                <div className="notif">
                  <span className="n-ico"><svg><use href="#i-phone"/></svg></span>
                  <span><b>Mobile</b><span>Push for mentions and blockers</span></span>
                  <label className="toggle"><input type="checkbox" aria-label="Mobile notifications" /><span className="track"></span></label>
                </div>
                <div className="notif soon">
                  <span className="n-ico"><svg><use href="#i-slack"/></svg></span>
                  <span><b>Slack <span className="badge badge-neutral" style={{marginLeft:'6px'}}>Coming soon</span></b><span>Updates in your team channels</span></span>
                  <label className="toggle is-disabled"><input type="checkbox" disabled aria-label="Slack notifications, coming soon" /><span className="track"></span></label>
                </div>
              </div>
              <div className="ob-actions">
                <button className="btn btn-ghost" data-go="s-ob6"><svg><use href="#i-back"/></svg>Back</button>
                <div className="right"><button className="btn btn-primary" id="finish-setup">Finish setup<svg><use href="#i-arrow"/></svg></button></div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="screen" id="s-building" aria-label="Creating workspace">
        <div className="building">
          <div className="b-card">
            <span className="logo" style={{marginBottom:'16px'}}><span className="logo-mark"><svg><use href="#i-flow"/></svg></span></span>
            <h1 style={{margin:'0 0 4px', fontSize:'20px', lineHeight:'28px', fontWeight:'600', letterSpacing:'-.01em'}}>Setting up <span id="bld-ws">Acme Inc.</span>…</h1>
            <p style={{margin:'0', fontSize:'13px', color:'var(--text-2)'}}>This takes a few seconds.</p>
            <div className="b-steps" id="b-steps">
              <div className="b-step" data-b="0"><span className="b-ico"><span className="spinner" style={{width:'12px', height:'12px', borderWidth:'1.5px'}}></span></span>Creating workspace</div>
              <div className="b-step" data-b="1"><span className="b-ico" style={{color:'var(--n-300)'}}>•</span>Sending invitations</div>
              <div className="b-step" data-b="2"><span className="b-ico" style={{color:'var(--n-300)'}}>•</span>Preparing your home view</div>
              <div className="b-step" data-b="3"><span className="b-ico" style={{color:'var(--n-300)'}}>•</span>Warming up the AI assistant</div>
            </div>
            <div style={{marginTop:'20px', display:'flex', flexDirection:'column', gap:'8px'}} aria-hidden="true">
              <div className="sk" style={{height:'10px', width:'100%'}}></div>
              <div className="sk" style={{height:'10px', width:'82%'}}></div>
              <div className="sk" style={{height:'10px', width:'64%'}}></div>
            </div>
          </div>
        </div>
      </section>


      <section className="screen" id="s-ob8" aria-label="Setup complete" data-step="8">
        <div className="ob">
          <div className="ob-top">
            <div className="ob-top-in">
              <span className="logo"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span>FlowPilot</span>
              <span className="ob-meta"><span className="step-lbl">Step 8 of 8</span>·<span>Done</span></span>
            </div>
            <div className="ob-prog"><i style={{width:'100%'}}></i></div>
          </div>
          <div className="ob-body">
            <div className="ob-card wide done-wrap">
              <svg className="big-check" viewBox="0 0 72 72" aria-hidden="true">
                <circle className="bc-circle" cx="36" cy="36" r="31"/>
                <path className="bc-tick" d="M24 37l8 8 16-16"/>
              </svg>
              <h1>Your workspace is ready 🎉</h1>
              <p className="sub" style={{marginLeft:'auto', marginRight:'auto'}}>Nice work — that took you <b id="dn-time" style={{color:'var(--text-1)'}}>1m 40s</b>. Here's what you set up:</p>
              <div className="sum-grid">
                <div className="sum"><div className="s-l">Workspace</div><b id="dn-ws">Acme Inc.</b><span id="dn-url">flowpilot.com/acme</span></div>
                <div className="sum"><div className="s-l">Members invited</div><b id="dn-inv">2</b><span>invites sent</span></div>
                <div className="sum"><div className="s-l">Goals selected</div><b id="dn-goals">3</b><span id="dn-goals-list">Projects, Sprints, AI</span></div>
                <div className="sum"><div className="s-l">Est. time saved</div><b>6.5 hrs</b><span>per sprint, per team</span></div>
              </div>
              <button className="btn btn-primary btn-lg" id="go-dash">Go to dashboard<svg><use href="#i-arrow"/></svg></button>
              <p className="hint" style={{marginTop:'12px'}}>Tip: press <b style={{color:'var(--text-2)'}}>⌘K</b> anywhere to search or create.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="screen" id="s-dash" aria-label="Dashboard">
        <div className="dash">
          <div className="dash-top">
            <span className="logo"><span className="logo-mark"><svg><use href="#i-flow"/></svg></span><span id="dash-ws">Acme Inc.</span></span>
            <span className="spacer"></span>
            <div className="input-wrap" style={{maxWidth:'280px'}}>
              <svg><use href="#i-search"/></svg>
              <input className="input" placeholder="Search… ⌘K" style={{height:'32px', background:'var(--bg-subtle)', borderColor:'transparent'}} aria-label="Search" />
            </div>
            <button className="btn btn-ghost" style={{width:'36px', padding:'0'}} aria-label="Notifications"><svg><use href="#i-bell"/></svg></button>
            <span className="avatar" id="dash-av">MK</span>
          </div>
          <div className="dash-wrap">
            <nav className="dash-side" aria-label="Workspace">
              <div className="snav on"><svg><use href="#i-home"/></svg>Home</div>
              <div className="snav"><svg><use href="#i-bell"/></svg>Inbox</div>
              <div className="snav"><svg><use href="#i-layers"/></svg>Projects</div>
              <div className="snav"><svg><use href="#i-board"/></svg>Tasks</div>
              <div className="snav"><svg><use href="#i-cal"/></svg>Calendar</div>
              <div className="snav"><svg><use href="#i-chart"/></svg>Analytics</div>
              <div className="snav"><svg><use href="#i-bot"/></svg>AI Assistant</div>
            </nav>
            <div className="dash-main">
        
              <div id="dash-sk" aria-hidden="true">
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'24px'}}>
                  <div><div className="sk" style={{width:'220px', height:'20px', marginBottom:'8px'}}></div><div className="sk" style={{width:'140px', height:'12px'}}></div></div>
                  <div className="sk" style={{width:'104px', height:'36px', borderRadius:'6px'}}></div>
                </div>
                <div className="dash-grid">
                  <div className="dpanel" style={{padding:'16px'}}><div className="sk" style={{width:'40%', height:'12px', marginBottom:'14px'}}></div><div className="sk" style={{height:'10px', marginBottom:'8px'}}></div><div className="sk" style={{height:'10px', width:'88%', marginBottom:'8px'}}></div><div className="sk" style={{height:'10px', width:'64%'}}></div></div>
                  <div className="dpanel" style={{padding:'16px'}}><div className="sk" style={{width:'40%', height:'12px', marginBottom:'14px'}}></div><div style={{display:'flex', gap:'10px', alignItems:'center', marginBottom:'10px'}}><div className="sk" style={{width:'28px', height:'28px', borderRadius:'99px'}}></div><div className="sk" style={{flex:'1', height:'10px'}}></div></div><div style={{display:'flex', gap:'10px', alignItems:'center', marginBottom:'10px'}}><div className="sk" style={{width:'28px', height:'28px', borderRadius:'99px'}}></div><div className="sk" style={{flex:'1', height:'10px'}}></div></div><div style={{display:'flex', gap:'10px', alignItems:'center'}}><div className="sk" style={{width:'28px', height:'28px', borderRadius:'99px'}}></div><div className="sk" style={{flex:'1', height:'10px'}}></div></div></div>
                  <div className="dpanel" style={{padding:'16px'}}><div className="sk" style={{width:'40%', height:'12px', marginBottom:'14px'}}></div><div className="sk" style={{height:'64px'}}></div></div>
                  <div className="dpanel" style={{padding:'16px'}}><div className="sk" style={{width:'40%', height:'12px', marginBottom:'14px'}}></div><div className="sk" style={{height:'10px', marginBottom:'8px'}}></div><div className="sk" style={{height:'10px', width:'74%'}}></div></div>
                </div>
              </div>
        
              <div id="dash-real" hidden>
                <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'16px', marginBottom:'24px', flexWrap:'wrap'}}>
                  <div>
                    <h1 style={{margin:'0 0 2px', fontSize:'20px', lineHeight:'28px', fontWeight:'600', letterSpacing:'-.01em'}}>Good morning, <span id="dash-name">Mara</span></h1>
                    <p style={{margin:'0', fontSize:'13px', color:'var(--text-3)'}}>Your workspace is brand new — here's how to get moving.</p>
                  </div>
                  <button className="btn btn-primary"><svg><use href="#i-plus"/></svg>New project</button>
                </div>
                <div className="dash-grid">
                  <div className="dpanel">
                    <div className="dpanel-h">Projects</div>
                    <div className="empty-sm">
                      <span className="e-ico"><svg><use href="#i-folder"/></svg></span>
                      <b>No projects yet</b>
                      <p>Projects keep related work, docs, and goals together. Start blank or from a template.</p>
                      <div style={{display:'flex', gap:'8px'}}>
                        <button className="btn btn-primary" style={{height:'32px'}}><svg><use href="#i-plus"/></svg>Create project</button>
                        <button className="btn btn-secondary" style={{height:'32px'}}>Use template</button>
                      </div>
                    </div>
                  </div>
                  <div className="dpanel">
                    <div className="dpanel-h">Team</div>
                    <div className="empty-sm" id="team-empty">
                      <span className="e-ico"><svg><use href="#i-users"/></svg></span>
                      <b>It's just you so far</b>
                      <p>FlowPilot clicks when your team is here — plans, boards, and updates stay in sync for everyone.</p>
                      <button className="btn btn-secondary" style={{height:'32px'}}><svg><use href="#i-mail"/></svg>Invite teammates</button>
                    </div>
                    <div className="empty-sm" id="team-some" hidden>
                      <span className="e-ico" style={{background:'var(--success-bg)', borderColor:'var(--success-border)', color:'var(--success)'}}><svg><use href="#i-check-c"/></svg></span>
                      <b><span id="team-count">2</span> invites on their way</b>
                      <p>We'll let you know when teammates join. Meanwhile, set up your first project so they land somewhere useful.</p>
                      <button className="btn btn-secondary" style={{height:'32px'}}><svg><use href="#i-mail"/></svg>Invite more</button>
                    </div>
                  </div>
                  <div className="dpanel">
                    <div className="dpanel-h">Notifications</div>
                    <div className="empty-sm">
                      <span className="e-ico"><svg><use href="#i-bell"/></svg></span>
                      <b>All clear</b>
                      <p>Mentions, assignments, and at-risk work will show up here — only the signal, never noise.</p>
                      <button className="btn btn-ghost" style={{height:'32px'}}>Notification settings</button>
                    </div>
                  </div>
                  <div className="dpanel">
                    <div className="dpanel-h">Recent activity</div>
                    <div className="empty-sm">
                      <span className="e-ico"><svg><use href="#i-activity"/></svg></span>
                      <b>Nothing here yet</b>
                      <p>As your team plans and ships, a live feed of changes appears here. Create a task to see it in action.</p>
                      <button className="btn btn-secondary" style={{height:'32px'}}><svg><use href="#i-plus"/></svg>Create first task</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className="proto">
        <div className="proto-menu" id="protoMenu" role="menu" aria-label="Jump to screen">
          <div className="pm-l">Auth</div>
          <button data-go="s-welcome" role="menuitem">1 · Welcome</button>
          <button data-go="s-signup" role="menuitem">2 · Sign up</button>
          <button data-go="s-login" role="menuitem">3 · Login</button>
          <button data-go="s-forgot" role="menuitem">4 · Forgot password</button>
          <button data-go="s-verify" role="menuitem">5 · Email verification</button>
          <button data-go="s-created" role="menuitem">6 · Account created</button>
          <div className="pm-l">Onboarding</div>
          <button data-go="s-ob1" role="menuitem">Step 1 · Welcome</button>
          <button data-go="s-ob2" role="menuitem">Step 2 · Workspace</button>
          <button data-go="s-ob3" role="menuitem">Step 3 · Invite team</button>
          <button data-go="s-ob4" role="menuitem">Step 4 · Role</button>
          <button data-go="s-ob5" role="menuitem">Step 5 · Goals</button>
          <button data-go="s-ob6" role="menuitem">Step 6 · Theme</button>
          <button data-go="s-ob7" role="menuitem">Step 7 · Notifications</button>
          <button data-go="s-building" role="menuitem">Loading · Creating workspace</button>
          <button data-go="s-ob8" role="menuitem">Step 8 · Complete</button>
          <button data-go="s-dash" role="menuitem">Dashboard · Empty states</button>
          <div className="hint-l">Demo hooks: workspace names “acme”, “test” &amp; “flowpilot” are taken · login email “offline@demo.com” triggers a network error · any password under 8 chars fails login.</div>
        </div>
        <button className="btn btn-secondary" id="protoBtn" aria-expanded="false" aria-controls="protoMenu">Screens</button>
      </div>


    </div>
  );
}
