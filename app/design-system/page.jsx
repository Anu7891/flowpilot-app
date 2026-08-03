'use client';
// Ported from flowpilot-design-system.html - markup and behavior preserved 1:1.
// Interactions run as a DOM effect for now; extract into components as you build.
import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    const _doc = [];
    const _win = [];
    const docAdd = (t, f) => { document.addEventListener(t, f); _doc.push([t, f]); };
    const winAdd = (t, f) => { window.addEventListener(t, f); _win.push([t, f]); };
    // Theme toggle
      var root = document.documentElement;
      var btn = document.getElementById('themeBtn');
      var label = document.getElementById('themeLabel');
      btn.addEventListener('click', function(){
        var dark = root.getAttribute('data-theme') === 'dark';
        root.setAttribute('data-theme', dark ? 'light' : 'dark');
        label.textContent = dark ? 'Dark' : 'Light';
        btn.setAttribute('aria-pressed', String(!dark));
      });

      // Password visibility
      var pwBtn = document.getElementById('pwBtn');
      if (pwBtn) pwBtn.addEventListener('click', function(){
        var inp = document.getElementById('in6');
        inp.type = inp.type === 'password' ? 'text' : 'password';
      });

      // Live toast demo
      var toastBtn = document.getElementById('toastBtn');
      var host = document.getElementById('toastHost');
      if (toastBtn) toastBtn.addEventListener('click', function(){
        var t = document.createElement('div');
        t.className = 'toast';
        t.setAttribute('role','status');
        t.style.cssText = 'opacity:0; transform:translateY(4px); transition:all var(--dur-3) var(--ease)';
        t.innerHTML = '<svg class="status" style="color:var(--success)" width="16" height="16"><use href="#i-check-c"/></svg>'+
          '<div><b>Changes saved</b><p>Design tokens updated just now.</p></div>'+
          '<div class="t-act"><button class="t-close" aria-label="Dismiss"><svg width="14" height="14"><use href="#i-x"/></svg></button></div>';
        host.appendChild(t);
        while (host.children.length > 3) host.removeChild(host.firstChild);
        requestAnimationFrame(function(){ t.style.opacity = '1'; t.style.transform = 'none'; });
        var kill = function(){ t.style.opacity = '0'; t.style.transform = 'translateY(4px)'; setTimeout(function(){ t.remove(); }, 220); };
        t.querySelector('.t-close').addEventListener('click', kill);
        setTimeout(kill, 5000);
      });

      // Tabs + segmented control demos
      document.querySelectorAll('.tabs').forEach(function(g){
        g.querySelectorAll('.tab').forEach(function(tab){
          tab.addEventListener('click', function(){
            g.querySelectorAll('.tab').forEach(function(x){ x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
            tab.classList.add('active'); tab.setAttribute('aria-selected','true');
          });
        });
      });
      document.querySelectorAll('.seg').forEach(function(g){
        g.querySelectorAll('button').forEach(function(b){
          b.addEventListener('click', function(){
            g.querySelectorAll('button').forEach(function(x){ x.classList.remove('active'); });
            b.classList.add('active');
          });
        });
      });

      // Scrollspy for guide nav
      var links = Array.prototype.slice.call(document.querySelectorAll('.side a.nav-item'));
      var secs = links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
      var spy = function(){
        var y = window.scrollY + 120, cur = 0;
        secs.forEach(function(s, i){ if (s && s.offsetTop <= y) cur = i; });
        links.forEach(function(a, i){ a.classList.toggle('active', i === cur); });
      };
      winAdd('scroll', spy);
      spy();
    return () => {
      _doc.forEach(([t, f]) => document.removeEventListener(t, f));
      _win.forEach(([t, f]) => window.removeEventListener(t, f));
    };
  }, []);

  return (
    <div className="pg-ds">
      <button className="btn btn-secondary btn-sm theme-toggle" id="themeBtn" aria-pressed="false">
        <svg><use href="#i-sun"/></svg><span id="themeLabel">Dark</span>
      </button>

      <div className="shell">
  
        <nav className="side" aria-label="Design system sections">
          <div className="brand">
            <div className="brand-mark"><svg><use href="#i-flow"/></svg></div>
            <h1>FlowPilot<span>Design Foundation · v1.0</span></h1>
          </div>
          <div className="side-label">Foundations</div>
          <a className="nav-item" href="#color"><span className="num">01</span>Color</a>
          <a className="nav-item" href="#type"><span className="num">02</span>Typography</a>
          <a className="nav-item" href="#space"><span className="num">03</span>Spacing</a>
          <a className="nav-item" href="#radius"><span className="num">04</span>Border radius</a>
          <a className="nav-item" href="#elevation"><span className="num">05</span>Elevation</a>
          <a className="nav-item" href="#icons"><span className="num">06</span>Iconography</a>
          <div className="side-label">Components</div>
          <a className="nav-item" href="#buttons"><span className="num">07</span>Buttons</a>
          <a className="nav-item" href="#inputs"><span className="num">08</span>Inputs</a>
          <a className="nav-item" href="#forms"><span className="num">09</span>Form controls</a>
          <a className="nav-item" href="#nav"><span className="num">10</span>Navigation</a>
          <a className="nav-item" href="#data"><span className="num">11</span>Data display</a>
          <a className="nav-item" href="#feedback"><span className="num">12</span>Feedback</a>
          <div className="side-label">Guidelines</div>
          <a className="nav-item" href="#a11y"><span className="num">13</span>Accessibility</a>
          <a className="nav-item" href="#motion"><span className="num">14</span>Motion</a>
          <a className="nav-item" href="#grid"><span className="num">15</span>Grid</a>
        </nav>

        <main className="main"><div className="main-inner">

        <header className="page-head">
          <div>
            <h2>Design Foundation</h2>
            <p>The single visual language for every FlowPilot surface. Calm, precise, and built for daily enterprise use. Components consume tokens only — never raw values. Toggle the theme (top right) to inspect the dark token set.</p>
          </div>
        </header>

  
        <section className="section" id="color">
          <div className="sec-head"><span className="idx">01</span><h3>Color</h3></div>
          <p className="sec-intro">FlowPilot is a neutral-first product. Interfaces are built almost entirely from the gray ramp; indigo is reserved for the primary action and selected state on a screen. Status colors are muted and never decorative. If a screen feels colorful, it's wrong.</p>

          <p className="demo-label">Neutral · cool gray, blue undertone</p>
          <div className="scale">
            <div className="sw light" style={{background:'#FFFFFF'}}><span>0</span></div>
            <div className="sw light" style={{background:'#FAFBFC'}}><span>25</span></div>
            <div className="sw light" style={{background:'#F6F7F9'}}><span>50</span></div>
            <div className="sw light" style={{background:'#EFF0F4'}}><span>100</span></div>
            <div className="sw light" style={{background:'#E3E5EB'}}><span>200</span></div>
            <div className="sw light" style={{background:'#CDD0DA'}}><span>300</span></div>
            <div className="sw light" style={{background:'#A9AEBD'}}><span>400</span></div>
            <div className="sw dark" style={{background:'#7E8496'}}><span>500</span></div>
            <div className="sw dark" style={{background:'#555B6D'}}><span>600</span></div>
            <div className="sw dark" style={{background:'#171A26'}}><span>900</span></div>
          </div>
          <p className="scale-cap">Surfaces live in 0–100 · borders in 200–300 · text in 500–900</p>

          <p className="demo-label">Primary · FlowPilot Indigo</p>
          <div className="scale">
            <div className="sw light" style={{background:'#EEF0FD'}}><span>50</span></div>
            <div className="sw light" style={{background:'#DFE3FB'}}><span>100</span></div>
            <div className="sw light" style={{background:'#C3C9F4'}}><span>200</span></div>
            <div className="sw light" style={{background:'#9AA3EB'}}><span>300</span></div>
            <div className="sw dark" style={{background:'#7681E1'}}><span>400</span></div>
            <div className="sw dark" style={{background:'#5A66D9'}}><span>500</span></div>
            <div className="sw dark" style={{background:'#4650C7'}}><span>600</span></div>
            <div className="sw dark" style={{background:'#3A43AB'}}><span>700</span></div>
            <div className="sw dark" style={{background:'#30378D'}}><span>800</span></div>
            <div className="sw dark" style={{background:'#292F71'}}><span>900</span></div>
          </div>
          <p className="scale-cap">600 is the workhorse (buttons, links, selection) · 50/100 for tinted fills · 400 carries the brand in dark mode</p>

          <p className="demo-label">Status &amp; accent</p>
          <div className="scale scale-5">
            <div className="sw dark" style={{background:'#177E4D'}}><span>success</span></div>
            <div className="sw dark" style={{background:'#B26205'}}><span>warning</span></div>
            <div className="sw dark" style={{background:'#C13539'}}><span>error</span></div>
            <div className="sw dark" style={{background:'#4650C7'}}><span>info</span></div>
            <div className="sw dark" style={{background:'#0F8A75'}}><span>accent</span></div>
          </div>
          <p className="scale-cap">Each status ships as a triad: solid · tinted background · border. Accent teal is for data viz and highlights only — never for actions.</p>

          <div className="sub">Semantic roles</div>
          <table className="ttable">
            <thead><tr><th>Role</th><th>Token</th><th>Light</th><th>Dark</th><th>Usage</th></tr></thead>
            <tbody>
              <tr><td>Background</td><td><code>--bg-app</code></td><td><span className="chip" style={{background:'#F6F7F9'}}></span> #F6F7F9</td><td><span className="chip" style={{background:'#0D0E12'}}></span> #0D0E12</td><td>App canvas behind everything</td></tr>
              <tr><td>Surface</td><td><code>--bg-surface</code></td><td><span className="chip" style={{background:'#FFFFFF'}}></span> #FFFFFF</td><td><span className="chip" style={{background:'#15161C'}}></span> #15161C</td><td>Cards, panels, popovers, inputs</td></tr>
              <tr><td>Surface / subtle</td><td><code>--bg-subtle</code></td><td><span className="chip" style={{background:'#EFF0F4'}}></span> #EFF0F4</td><td><span className="chip" style={{background:'#1C1E26'}}></span> #1C1E26</td><td>Hover fills, wells, table header</td></tr>
              <tr><td>Surface / inset</td><td><code>--bg-inset</code></td><td><span className="chip" style={{background:'#E9EBF0'}}></span> #E9EBF0</td><td><span className="chip" style={{background:'#22242E'}}></span> #22242E</td><td>Pressed, disabled, code blocks</td></tr>
              <tr><td>Border</td><td><code>--border</code></td><td><span className="chip" style={{background:'#E3E5EB'}}></span> #E3E5EB</td><td><span className="chip" style={{background:'#282B36'}}></span> #282B36</td><td>Hairlines, dividers, cards</td></tr>
              <tr><td>Border / strong</td><td><code>--border-strong</code></td><td><span className="chip" style={{background:'#CDD0DA'}}></span> #CDD0DA</td><td><span className="chip" style={{background:'#383C4A'}}></span> #383C4A</td><td>Inputs and interactive outlines</td></tr>
              <tr><td>Text / primary</td><td><code>--text-1</code></td><td><span className="chip" style={{background:'#171A26'}}></span> #171A26</td><td><span className="chip" style={{background:'#EDEEF3'}}></span> #EDEEF3</td><td>Headings, body, values</td></tr>
              <tr><td>Text / secondary</td><td><code>--text-2</code></td><td><span className="chip" style={{background:'#555B6D'}}></span> #555B6D</td><td><span className="chip" style={{background:'#A7ADBD'}}></span> #A7ADBD</td><td>Supporting copy, labels</td></tr>
              <tr><td>Text / tertiary</td><td><code>--text-3</code></td><td><span className="chip" style={{background:'#7E8496'}}></span> #7E8496</td><td><span className="chip" style={{background:'#737A8C'}}></span> #737A8C</td><td>Meta, timestamps, placeholders — never body copy</td></tr>
            </tbody>
          </table>
          <p className="note"><strong>Rules.</strong> One primary action per view. Tinted status backgrounds always pair with their border token — no floating pastel fills. Pure black and pure saturated hues are never used; every color carries the blue undertone of the neutral ramp.</p>
        </section>

  
        <section className="section" id="type">
          <div className="sec-head"><span className="idx">02</span><h3>Typography</h3></div>
          <p className="sec-intro">One family: <strong>Inter</strong>, with JetBrains Mono for numbers, IDs, and code. The product default is 14px — dense enough for real work, generous enough to read all day. Hierarchy comes from weight and color before size.</p>
          <div className="demo">
            <div className="spec"><div className="meta"><b>Display</b>32 / 40 · 700 · -2%</div><div style={{fontSize:'32px', lineHeight:'40px', fontWeight:'700', letterSpacing:'-.02em'}}>Ship with confidence</div></div>
            <div className="spec"><div className="meta"><b>Heading 1</b>24 / 32 · 600 · -1.5%</div><div style={{fontSize:'24px', lineHeight:'32px', fontWeight:'600', letterSpacing:'-.015em'}}>Workflow overview</div></div>
            <div className="spec"><div className="meta"><b>Heading 2</b>20 / 28 · 600 · -1%</div><div style={{fontSize:'20px', lineHeight:'28px', fontWeight:'600', letterSpacing:'-.01em'}}>Pipeline settings</div></div>
            <div className="spec"><div className="meta"><b>Heading 3</b>16 / 24 · 600</div><div style={{fontSize:'16px', lineHeight:'24px', fontWeight:'600'}}>Connected sources</div></div>
            <div className="spec"><div className="meta"><b>Heading 4</b>14 / 20 · 600</div><div style={{fontSize:'14px', lineHeight:'20px', fontWeight:'600'}}>Retry policy</div></div>
            <div className="spec"><div className="meta"><b>Body large</b>16 / 26 · 400</div><div style={{fontSize:'16px', lineHeight:'26px'}}>Longer-form reading: onboarding, docs, and settings descriptions.</div></div>
            <div className="spec"><div className="meta"><b>Body</b>14 / 22 · 400</div><div style={{fontSize:'14px', lineHeight:'22px'}}>The product default. Tables, forms, panels, and everything in between.</div></div>
            <div className="spec"><div className="meta"><b>Body small</b>13 / 20 · 400</div><div style={{fontSize:'13px', lineHeight:'20px', color:'var(--text-2)'}}>Dense surfaces: sidebars, table cells, menu items.</div></div>
            <div className="spec"><div className="meta"><b>Caption</b>12 / 18 · 400</div><div style={{fontSize:'12px', lineHeight:'18px', color:'var(--text-3)'}}>Timestamps, helper text, footnotes.</div></div>
            <div className="spec"><div className="meta"><b>Overline</b>11 / 16 · 500 · +7%</div><div style={{fontSize:'11px', lineHeight:'16px', fontWeight:'500', letterSpacing:'.07em', textTransform:'uppercase', color:'var(--text-3)'}}>Section label</div></div>
            <div className="spec"><div className="meta"><b>Mono</b>13 / 20 · 400</div><div style={{fontFamily:'var(--font-mono)', fontSize:'13px', lineHeight:'20px'}}>run_2847 · 142ms · 99.98%</div></div>
          </div>
          <p className="note"><strong>Buttons</strong> use 14/20 at weight 500 (13/20 for small). <strong>Numbers in tables</strong> always use tabular figures (<code>font-variant-numeric: tabular-nums</code>) so columns align. Negative tracking applies only at 20px and above. Line length for reading copy caps at ~640px.</p>
        </section>

  
        <section className="section" id="space">
          <div className="sec-head"><span className="idx">03</span><h3>Spacing</h3></div>
          <p className="sec-intro">An 8px base grid with a single 4px half-step for fine-grained control inside components. Every margin, padding, and gap in the product is one of these nine values.</p>
          <div className="demo">
            <div className="space-row">
              <div className="space-item"><div className="bar" style={{width:'4px', height:'4px'}}></div><span>4</span></div>
              <div className="space-item"><div className="bar" style={{width:'8px', height:'8px'}}></div><span>8</span></div>
              <div className="space-item"><div className="bar" style={{width:'16px', height:'16px'}}></div><span>16</span></div>
              <div className="space-item"><div className="bar" style={{width:'24px', height:'24px'}}></div><span>24</span></div>
              <div className="space-item"><div className="bar" style={{width:'32px', height:'32px'}}></div><span>32</span></div>
              <div className="space-item"><div className="bar" style={{width:'40px', height:'40px'}}></div><span>40</span></div>
              <div className="space-item"><div className="bar" style={{width:'48px', height:'48px'}}></div><span>48</span></div>
              <div className="space-item"><div className="bar" style={{width:'64px', height:'64px'}}></div><span>64</span></div>
              <div className="space-item"><div className="bar" style={{width:'80px', height:'80px'}}></div><span>80</span></div>
            </div>
          </div>
          <table className="ttable" style={{marginTop:'16px'}}>
            <thead><tr><th>Token</th><th>Value</th><th>Typical use</th></tr></thead>
            <tbody>
              <tr><td><code>--s-05</code></td><td>4px</td><td>Icon-to-label gaps, badge padding, tight vertical rhythm</td></tr>
              <tr><td><code>--s-1</code></td><td>8px</td><td>Gaps inside controls, between related buttons</td></tr>
              <tr><td><code>--s-2</code></td><td>16px</td><td>Card padding (dense), gaps between form fields</td></tr>
              <tr><td><code>--s-3</code></td><td>24px</td><td>Card padding (default), gaps between component groups</td></tr>
              <tr><td><code>--s-4</code></td><td>32px</td><td>Section padding inside pages</td></tr>
              <tr><td><code>--s-5</code> / <code>--s-6</code></td><td>40 / 48px</td><td>Page gutters, space between major blocks</td></tr>
              <tr><td><code>--s-8</code> / <code>--s-10</code></td><td>64 / 80px</td><td>Page-level separation, empty-state breathing room</td></tr>
            </tbody>
          </table>
          <p className="note"><strong>Rule.</strong> Related elements sit 4–8px apart, groups 16–24px, sections 32px+. When in doubt, add space between groups — not inside them.</p>
        </section>

  
        <section className="section" id="radius">
          <div className="sec-head"><span className="idx">04</span><h3>Border radius</h3></div>
          <p className="sec-intro">Radii scale with surface size: small controls get small radii, floating surfaces get more. Nothing is a blob; nothing is a sharp rectangle.</p>
          <div className="demo">
            <div className="rad-row">
              <div className="rad-item"><div className="rad-box" style={{borderRadius:'4px'}}></div><em>xs · 4px</em><span>checkbox, tag, kbd</span></div>
              <div className="rad-item"><div className="rad-box" style={{borderRadius:'6px'}}></div><em>sm · 6px</em><span>button, input, menu item</span></div>
              <div className="rad-item"><div className="rad-box" style={{borderRadius:'8px'}}></div><em>md · 8px</em><span>card, dropdown, popover</span></div>
              <div className="rad-item"><div className="rad-box" style={{borderRadius:'12px'}}></div><em>lg · 12px</em><span>modal, dialog, large panel</span></div>
              <div className="rad-item"><div className="rad-box" style={{borderRadius:'999px', width:'64px'}}></div><em>full · 999px</em><span>avatar, badge, toggle</span></div>
            </div>
          </div>
          <p className="note"><strong>Rule.</strong> Never mix radii on sibling elements. A nested element's radius is its parent's radius minus the gap between them (a card at 8px with 2px inset content → 6px).</p>
        </section>

  
        <section className="section" id="elevation">
          <div className="sec-head"><span className="idx">05</span><h3>Elevation</h3></div>
          <p className="sec-intro">Shadows are barely-there and always paired with a 1px border — the border does the separating, the shadow adds depth. Four levels, each tied to a surface type. In dark mode shadows deepen and borders lighten to carry the separation.</p>
          <div className="demo" style={{background:'var(--bg-app)'}}>
            <div className="elev-row">
              <div className="elev-card" style={{boxShadow:'var(--shadow-xs)'}}><b>xs</b><span>buttons, inputs</span></div>
              <div className="elev-card" style={{boxShadow:'var(--shadow-sm)'}}><b>sm</b><span>cards, panels</span></div>
              <div className="elev-card" style={{boxShadow:'var(--shadow-md)'}}><b>md</b><span>dropdowns, popovers</span></div>
              <div className="elev-card" style={{boxShadow:'var(--shadow-lg)'}}><b>lg</b><span>modals, dialogs</span></div>
            </div>
          </div>
          <table className="ttable" style={{marginTop:'16px'}}>
            <thead><tr><th>Token</th><th>Value (light)</th></tr></thead>
            <tbody>
              <tr><td><code>--shadow-xs</code></td><td><code>0 1px 2px rgba(23,26,38,.05)</code></td></tr>
              <tr><td><code>--shadow-sm</code></td><td><code>0 1px 2px rgba(23,26,38,.04), 0 2px 8px rgba(23,26,38,.04)</code></td></tr>
              <tr><td><code>--shadow-md</code></td><td><code>0 2px 4px rgba(23,26,38,.04), 0 10px 24px -4px rgba(23,26,38,.12)</code></td></tr>
              <tr><td><code>--shadow-lg</code></td><td><code>0 8px 16px -6px rgba(23,26,38,.08), 0 24px 56px -12px rgba(23,26,38,.22)</code></td></tr>
            </tbody>
          </table>
          <p className="note"><strong>Rule.</strong> Elevation communicates layering, not importance. Static page content never exceeds <code>sm</code>. Only surfaces that float above the page (menus, modals) use <code>md</code> and <code>lg</code>.</p>
        </section>

  
        <section className="section" id="icons">
          <div className="sec-head"><span className="idx">06</span><h3>Iconography</h3></div>
          <p className="sec-intro">Outlined icons at a 1.5px stroke on a 24px grid — Lucide is the source library. Icons are monochrome, inherit <code>currentColor</code>, and are always functional, never decorative.</p>
          <div className="demo">
            <div className="icon-row">
              <div className="icon-cell"><svg width="16" height="16"><use href="#i-settings"/></svg><span>16 · inline</span></div>
              <div className="icon-cell"><svg width="20" height="20"><use href="#i-settings"/></svg><span>20 · default</span></div>
              <div className="icon-cell"><svg width="24" height="24"><use href="#i-settings"/></svg><span>24 · nav / empty</span></div>
              <div style={{width:'1px', height:'48px', background:'var(--border)'}}></div>
              <div className="icon-strip">
                <svg width="20" height="20"><use href="#i-home"/></svg>
                <svg width="20" height="20"><use href="#i-inbox"/></svg>
                <svg width="20" height="20"><use href="#i-layers"/></svg>
                <svg width="20" height="20"><use href="#i-chart"/></svg>
                <svg width="20" height="20"><use href="#i-users"/></svg>
                <svg width="20" height="20"><use href="#i-doc"/></svg>
                <svg width="20" height="20"><use href="#i-bell"/></svg>
                <svg width="20" height="20"><use href="#i-search"/></svg>
              </div>
            </div>
          </div>
          <table className="ttable" style={{marginTop:'16px'}}>
            <thead><tr><th>Size</th><th>Context</th><th>Color</th></tr></thead>
            <tbody>
              <tr><td>16px</td><td>Inside buttons, inputs, table cells, badges</td><td>Inherits text color of the control</td></tr>
              <tr><td>20px</td><td>Standalone icon buttons, navigation items</td><td><code>--text-2</code>, active state <code>--text-1</code> or <code>--primary</code></td></tr>
              <tr><td>24px</td><td>Empty states, feature markers, page headers</td><td><code>--text-3</code> unless status-colored</td></tr>
            </tbody>
          </table>
          <p className="note"><strong>Rules.</strong> Never scale icons to arbitrary sizes; use the three stops. Filled variants only for active navigation and status glyphs. Icons never appear without a label except in universally understood cases (×, search, settings) — and those still get <code>aria-label</code> and a tooltip.</p>
        </section>
  
        <section className="section" id="buttons">
          <div className="sec-head"><span className="idx">07</span><h3>Buttons</h3></div>
          <p className="sec-intro">Four variants, three sizes, one rule: a single primary button per view. Secondary is the default choice; ghost lives in toolbars and table rows; danger is reserved for destructive confirmation.</p>

          <div className="demo">
            <p className="demo-label">Variants · md 36px</p>
            <div className="demo-row">
              <button className="btn btn-primary">Create workflow</button>
              <button className="btn btn-secondary">Duplicate</button>
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-danger">Delete workflow</button>
              <button className="btn btn-secondary btn-icon" aria-label="Settings"><svg><use href="#i-settings"/></svg></button>
            </div>
            <p className="demo-label" style={{marginTop:'24px'}}>Sizes</p>
            <div className="demo-row">
              <button className="btn btn-primary btn-sm">Small · 28</button>
              <button className="btn btn-primary">Medium · 36</button>
              <button className="btn btn-primary btn-lg">Large · 40</button>
              <button className="btn btn-secondary"><svg><use href="#i-plus"/></svg>With icon</button>
            </div>
            <p className="demo-label" style={{marginTop:'24px'}}>States · primary</p>
            <div className="demo-row">
              <button className="btn btn-primary">Default</button>
              <button className="btn btn-primary f-hover">Hover</button>
              <button className="btn btn-primary f-active">Active</button>
              <button className="btn btn-primary f-focus">Focus</button>
              <button className="btn btn-primary is-loading"><span className="spinner"></span>Saving…</button>
              <button className="btn btn-primary" disabled>Disabled</button>
            </div>
            <p className="demo-label" style={{marginTop:'24px'}}>States · secondary</p>
            <div className="demo-row">
              <button className="btn btn-secondary">Default</button>
              <button className="btn btn-secondary f-hover">Hover</button>
              <button className="btn btn-secondary f-active">Active</button>
              <button className="btn btn-secondary f-focus">Focus</button>
              <button className="btn btn-secondary is-loading"><span className="spinner"></span>Loading…</button>
              <button className="btn btn-secondary" disabled>Disabled</button>
            </div>
            <p className="demo-label" style={{marginTop:'24px'}}>States · ghost &amp; danger</p>
            <div className="demo-row">
              <button className="btn btn-ghost">Default</button>
              <button className="btn btn-ghost f-hover">Hover</button>
              <button className="btn btn-ghost" disabled>Disabled</button>
              <span style={{width:'1px', height:'24px', background:'var(--border)'}}></span>
              <button className="btn btn-danger">Default</button>
              <button className="btn btn-danger f-hover">Hover</button>
              <button className="btn btn-danger f-focus">Focus</button>
              <button className="btn btn-danger" disabled>Disabled</button>
            </div>
          </div>
          <p className="note"><strong>Behavior.</strong> Hover darkens one step; active darkens two and drops the shadow. Loading replaces the leading icon with a spinner and keeps the label — width never jumps. Disabled uses the inset fill, not opacity. Focus is the global 2px offset ring. Destructive actions are always danger + confirmation dialog, never a lone red button.</p>
        </section>

  
        <section className="section" id="inputs">
          <div className="sec-head"><span className="idx">08</span><h3>Inputs</h3></div>
          <p className="sec-intro">All text controls share one anatomy: 36px height, 6px radius, strong border, and a 3px soft halo on focus. Labels sit above; help and errors sit below, and errors never rely on color alone.</p>

          <div className="demo">
            <div className="demo-grid" style={{gridTemplateColumns:'1fr 1fr', gap:'24px'}}>
              <div className="field">
                <label htmlFor="in1">Workspace name <span className="req">*</span></label>
                <input className="input" id="in1" placeholder="e.g. Acme Production" />
                <span className="hint">Visible to everyone in your organization.</span>
              </div>
              <div className="field">
                <label htmlFor="in2">Focused</label>
                <input className="input f-focus" id="in2" defaultValue="FlowPilot HQ" />
              </div>
              <div className="field">
                <label htmlFor="in3">Invalid</label>
                <input className="input is-invalid" id="in3" defaultValue="acme prod!" aria-invalid="true" aria-describedby="in3err" />
                <span className="err-msg" id="in3err"><svg width="12" height="12"><use href="#i-warn"/></svg>Only letters, numbers, and dashes.</span>
              </div>
              <div className="field">
                <label htmlFor="in4">Disabled</label>
                <input className="input" id="in4" defaultValue="Managed by SSO" disabled />
              </div>
              <div className="field">
                <label htmlFor="in5">Search</label>
                <div className="input-wrap">
                  <svg><use href="#i-search"/></svg>
                  <input className="input" id="in5" placeholder="Search workflows…" style={{paddingRight:'44px'}} />
                  <div className="trail"><kbd className="kbd">⌘K</kbd></div>
                </div>
              </div>
              <div className="field">
                <label htmlFor="in6">Password</label>
                <div className="input-wrap">
                  <input className="input" id="in6" type="password" defaultValue="correct-horse-battery" style={{paddingLeft:'12px', paddingRight:'36px'}} />
                  <div className="trail"><button className="btn btn-icon" id="pwBtn" aria-label="Show password"><svg width="16" height="16"><use href="#i-eye"/></svg></button></div>
                </div>
              </div>
              <div className="field">
                <label htmlFor="in7">Description</label>
                <textarea className="textarea" id="in7" placeholder="What does this workflow do?"></textarea>
                <span className="hint">Markdown supported.</span>
              </div>
              <div className="demo-col" style={{gap:'24px'}}>
                <div className="field">
                  <label htmlFor="in8">Region · select</label>
                  <select className="select" id="in8">
                    <option>US East (N. Virginia)</option>
                    <option>EU West (Frankfurt)</option>
                    <option>AP South (Mumbai)</option>
                  </select>
                </div>
                <div className="field">
                  <label>Assignee · combobox (open)</label>
                  <div className="input-wrap">
                    <svg><use href="#i-search"/></svg>
                    <input className="input f-focus" defaultValue="mar" aria-expanded="true" role="combobox" />
                  </div>
                  <div className="menu" style={{marginTop:'4px'}} role="listbox">
                    <div className="menu-label">People</div>
                    <div className="menu-item active sel" role="option" aria-selected="true"><span className="avatar a-sm">MK</span>Mara Kis <svg className="check"><use href="#i-check"/></svg></div>
                    <div className="menu-item" role="option"><span className="avatar a-sm a-teal">MR</span>Marcus Reid</div>
                    <div className="menu-item" role="option"><span className="avatar a-sm a-warm">AM</span>Amara Osei</div>
                    <div className="menu-sep"></div>
                    <div className="menu-item" style={{color:'var(--text-2)'}}><svg width="16" height="16"><use href="#i-plus"/></svg>Invite teammate…</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="note"><strong>Anatomy.</strong> Label 13/500 → 6px → control → 6px → help 12/400 in <code>--text-3</code>. Required fields mark the label, optional fields are unmarked (never "(optional)" on every field). Placeholder text shows format examples, never instructions. Error state: danger border + icon + message; the message replaces the hint rather than stacking.</p>
        </section>

  
        <section className="section" id="forms">
          <div className="sec-head"><span className="idx">09</span><h3>Form controls</h3></div>
          <p className="sec-intro">Selection controls are 16px, custom-drawn, and animate in 100ms. Checkboxes for multiple choice, radios for exclusive choice, toggles for instant on/off settings — a toggle never needs a Save button.</p>

          <div className="demo">
            <div className="demo-grid" style={{gridTemplateColumns:'1fr 1fr 1fr', gap:'24px'}}>
              <div className="demo-col">
                <p className="demo-label">Checkbox</p>
                <label className="check"><input type="checkbox" defaultChecked /><span className="box"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>Email me on failures</label>
                <label className="check"><input type="checkbox" /><span className="box"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span>Weekly digest<span className="sub-text">Sent Mondays at 9:00</span></span></label>
                <label className="check"><span className="box ind"></span>Indeterminate</label>
                <label className="check is-disabled"><input type="checkbox" disabled /><span className="box"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></span>Disabled</label>
              </div>
              <div className="demo-col">
                <p className="demo-label">Radio</p>
                <label className="radio"><input type="radio" name="r1" defaultChecked /><span className="dot"></span>Run immediately</label>
                <label className="radio"><input type="radio" name="r1" /><span className="dot"></span>Run on schedule</label>
                <label className="radio"><input type="radio" name="r1" /><span className="dot"></span>Manual trigger only</label>
              </div>
              <div className="demo-col">
                <p className="demo-label">Toggle</p>
                <label className="toggle"><input type="checkbox" defaultChecked /><span className="track"></span>Auto-retry failed runs</label>
                <label className="toggle"><input type="checkbox" /><span className="track"></span>Public status page</label>
                <label className="toggle is-disabled"><input type="checkbox" disabled /><span className="track"></span>SSO enforced by admin</label>
              </div>
            </div>

            <div className="demo-grid" style={{gridTemplateColumns:'1fr 1fr', gap:'24px', marginTop:'32px'}}>
              <div>
                <p className="demo-label">Slider</p>
                <div className="field" style={{maxWidth:'none'}}>
                  <label>Concurrency limit <span style={{float:'right', fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-2)'}}>12</span></label>
                  <input type="range" className="slider" min="0" max="20" defaultValue="12" aria-label="Concurrency limit" />
                  <span className="hint">Ticks snap to whole values; the current value is always shown.</span>
                </div>
              </div>
              <div>
                <p className="demo-label">Date picker</p>
                <div className="cal" role="grid" aria-label="July 2026">
                  <div className="cal-head">
                    <b>July 2026</b>
                    <div className="cal-nav">
                      <button aria-label="Previous month"><svg width="14" height="14"><use href="#i-chev-l"/></svg></button>
                      <button aria-label="Next month"><svg width="14" height="14"><use href="#i-chev-r"/></svg></button>
                    </div>
                  </div>
                  <div className="cal-grid">
                    <span className="dow">Mo</span><span className="dow">Tu</span><span className="dow">We</span><span className="dow">Th</span><span className="dow">Fr</span><span className="dow">Sa</span><span className="dow">Su</span>
                    <span className="day mute">29</span><span className="day mute">30</span><span className="day">1</span><span className="day">2</span><span className="day">3</span><span className="day">4</span><span className="day today">5</span>
                    <span className="day">6</span><span className="day">7</span><span className="day sel">8</span><span className="day in-range">9</span><span className="day in-range">10</span><span className="day sel">11</span><span className="day">12</span>
                    <span className="day">13</span><span className="day">14</span><span className="day">15</span><span className="day">16</span><span className="day">17</span><span className="day">18</span><span className="day">19</span>
                    <span className="day">20</span><span className="day">21</span><span className="day">22</span><span className="day">23</span><span className="day">24</span><span className="day">25</span><span className="day">26</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="note"><strong>Rules.</strong> Labels always sit to the right of checkboxes/radios and are part of the hit target. Today is outlined, selection is filled, ranges tint the span with <code>primary-50</code>. All controls expose the global focus ring via keyboard.</p>
        </section>
  
        <section className="section" id="nav">
          <div className="sec-head"><span className="idx">10</span><h3>Navigation</h3></div>
          <p className="sec-intro">A 56px top bar for global concerns (search, notifications, account) and a 240px sidebar for product structure. Location is communicated three ways at once: sidebar state, breadcrumb, and page title.</p>

          <p className="demo-label">Top navbar + sidebar</p>
          <div className="demo-frame">
            <div className="navbar">
              <div className="brand-mark"><svg><use href="#i-flow"/></svg></div>
              <strong style={{fontSize:'14px'}}>FlowPilot</strong>
              <div className="nav-search">
                <div className="input-wrap">
                  <svg><use href="#i-search"/></svg>
                  <input className="input" placeholder="Search…" style={{height:'32px', background:'var(--bg-subtle)', borderColor:'transparent', paddingRight:'44px'}} />
                  <div className="trail"><kbd className="kbd">⌘K</kbd></div>
                </div>
              </div>
              <div className="nav-right">
                <button className="btn btn-icon" aria-label="Notifications"><svg width="18" height="18"><use href="#i-bell"/></svg></button>
                <button className="btn btn-icon" aria-label="Settings"><svg width="18" height="18"><use href="#i-settings"/></svg></button>
                <span className="presence"><span className="avatar" style={{width:'28px', height:'28px', fontSize:'11px'}}>AS</span></span>
              </div>
            </div>
            <div style={{display:'flex', minHeight:'280px'}}>
              <div className="sidenav">
                <div className="snav-item"><svg><use href="#i-home"/></svg>Home</div>
                <div className="snav-item"><svg><use href="#i-inbox"/></svg>Inbox<span className="count">12</span></div>
                <div className="side-label">Workspace</div>
                <div className="snav-item active"><svg><use href="#i-layers"/></svg>Workflows<span className="count">48</span></div>
                <div className="snav-item"><svg><use href="#i-chart"/></svg>Analytics</div>
                <div className="snav-item"><svg><use href="#i-users"/></svg>Members</div>
                <div className="snav-item"><svg><use href="#i-doc"/></svg>Docs</div>
                <div className="side-label">System</div>
                <div className="snav-item"><svg><use href="#i-settings"/></svg>Settings</div>
              </div>
              <div style={{flex:'1', padding:'24px'}}>
                <div className="crumbs" style={{marginBottom:'16px'}}>
                  <a href="#nav">Workspace</a><span className="sep">/</span><a href="#nav">Workflows</a><span className="sep">/</span><span className="cur">Nightly ETL</span>
                </div>
                <div className="tabs" role="tablist">
                  <button className="tab active" role="tab" aria-selected="true">Overview</button>
                  <button className="tab" role="tab">Runs<span className="count">216</span></button>
                  <button className="tab" role="tab">Alerts<span className="count">3</span></button>
                  <button className="tab" role="tab">Settings</button>
                </div>
                <div style={{paddingTop:'24px', display:'flex', gap:'16px', alignItems:'center'}}>
                  <span className="seg" role="tablist" aria-label="Density">
                    <button className="active">Table</button><button>Board</button><button>Timeline</button>
                  </span>
                  <span style={{fontSize:'12px', color:'var(--text-3)'}}>Segmented control — view switching inside a page</span>
                </div>
              </div>
            </div>
          </div>
          <p className="note"><strong>Rules.</strong> Sidebar items are 32px tall, one icon + one label — no nesting beyond a single group level. Active state = subtle fill + primary icon, never a filled indigo row. Underline tabs navigate within a page; the segmented control switches views of the same data. Breadcrumbs appear at depth ≥ 2 and truncate the middle on overflow.</p>
        </section>

  
        <section className="section" id="data">
          <div className="sec-head"><span className="idx">11</span><h3>Data display</h3></div>
          <p className="sec-intro">Dense, quiet, scannable. Tables carry the product; cards summarize; badges state status in one word. Numbers are always tabular and right-aligned.</p>

          <p className="demo-label">Cards</p>
          <div className="demo-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <div className="card">
              <div className="card-body">
                <p style={{margin:'0 0 4px', fontSize:'12px', color:'var(--text-3)'}}>Runs · last 24h</p>
                <div style={{display:'flex', alignItems:'baseline', gap:'8px'}}>
                  <span className="metric">1,284</span><span className="delta-up">▲ 12.4%</span>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p style={{margin:'0 0 4px', fontSize:'12px', color:'var(--text-3)'}}>Success rate</p>
                <div style={{display:'flex', alignItems:'baseline', gap:'8px'}}>
                  <span className="metric">99.2%</span><span className="delta-down">▼ 0.3%</span>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-head" style={{borderBottom:'none', paddingBottom:'0'}}><h4>Nightly ETL</h4><span className="badge badge-success"><span className="bdot"></span>Healthy</span></div>
              <div className="card-body" style={{paddingTop:'8px'}}>
                <p style={{margin:'0', fontSize:'12px', color:'var(--text-3)'}}>Next run in 2h 14m</p>
              </div>
              <div className="card-foot">Updated 4 min ago</div>
            </div>
          </div>

          <p className="demo-label" style={{marginTop:'24px'}}>Table</p>
          <div className="demo-frame" style={{background:'var(--bg-surface)'}}>
            <table className="dtable">
              <thead><tr><th style={{width:'32px'}}><label className="check" style={{gap:'0'}}><input type="checkbox" /><span className="box" style={{marginTop:'0'}}><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label></th><th>Workflow</th><th>Status</th><th>Owner</th><th className="num">Runs</th><th className="num">P95</th><th>Last run</th></tr></thead>
              <tbody>
                <tr>
                  <td><label className="check" style={{gap:'0'}}><input type="checkbox" /><span className="box" style={{marginTop:'0'}}><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label></td>
                  <td className="strong">Nightly ETL</td><td><span className="badge badge-success"><span className="bdot"></span>Healthy</span></td>
                  <td><span style={{display:'inline-flex', alignItems:'center', gap:'8px'}}><span className="avatar a-sm">MK</span>Mara Kis</span></td>
                  <td className="num">1,284</td><td className="num">142 ms</td><td>4 min ago</td>
                </tr>
                <tr className="selected">
                  <td><label className="check" style={{gap:'0'}}><input type="checkbox" defaultChecked /><span className="box" style={{marginTop:'0'}}><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label></td>
                  <td className="strong">Invoice sync</td><td><span className="badge badge-warning"><span className="bdot"></span>Degraded</span></td>
                  <td><span style={{display:'inline-flex', alignItems:'center', gap:'8px'}}><span className="avatar a-sm a-teal">MR</span>Marcus Reid</span></td>
                  <td className="num">312</td><td className="num">1.8 s</td><td>18 min ago</td>
                </tr>
                <tr>
                  <td><label className="check" style={{gap:'0'}}><input type="checkbox" /><span className="box" style={{marginTop:'0'}}><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></label></td>
                  <td className="strong">Churn model refresh</td><td><span className="badge badge-danger"><span className="bdot"></span>Failing</span></td>
                  <td><span style={{display:'inline-flex', alignItems:'center', gap:'8px'}}><span className="avatar a-sm a-warm">AM</span>Amara Osei</span></td>
                  <td className="num">96</td><td className="num">—</td><td>2 h ago</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="demo-grid" style={{gridTemplateColumns:'1fr 1fr', marginTop:'24px', gap:'24px'}}>
            <div>
              <p className="demo-label">Badges · status in one word</p>
              <div className="demo">
                <div className="demo-row">
                  <span className="badge badge-neutral">Draft</span>
                  <span className="badge badge-primary">Running</span>
                  <span className="badge badge-success"><span className="bdot"></span>Healthy</span>
                  <span className="badge badge-warning"><span className="bdot"></span>Degraded</span>
                  <span className="badge badge-danger"><span className="bdot"></span>Failing</span>
                </div>
              </div>
              <p className="demo-label" style={{marginTop:'16px'}}>Tags · removable metadata</p>
              <div className="demo">
                <div className="demo-row">
                  <span className="tag">production<button className="tx" aria-label="Remove tag production"><svg><use href="#i-x"/></svg></button></span>
                  <span className="tag">etl<button className="tx" aria-label="Remove tag etl"><svg><use href="#i-x"/></svg></button></span>
                  <span className="tag">finance<button className="tx" aria-label="Remove tag finance"><svg><use href="#i-x"/></svg></button></span>
                  <span className="tag" style={{paddingRight:'8px'}}>+4</span>
                </div>
              </div>
              <p className="demo-label" style={{marginTop:'16px'}}>Avatars</p>
              <div className="demo">
                <div className="demo-row">
                  <span className="avatar a-sm">MK</span>
                  <span className="avatar">MR</span>
                  <span className="avatar a-lg a-teal">AM</span>
                  <span className="presence"><span className="avatar">JD</span></span>
                  <span className="av-stack">
                    <span className="avatar a-sm">MK</span><span className="avatar a-sm a-teal">MR</span><span className="avatar a-sm a-warm">AM</span>
                    <span className="avatar a-sm" style={{background:'var(--bg-subtle)', color:'var(--text-2)'}}>+5</span>
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p className="demo-label">Timeline</p>
              <div className="demo">
                <ul className="tl">
                  <li><span className="node done"></span><b>Run #2847 completed</b><p>All 14 steps succeeded.</p><time>09:41</time></li>
                  <li><span className="node done"></span><b>Retry succeeded</b><p>Step “Load to warehouse” recovered after 1 retry.</p><time>09:38</time></li>
                  <li><span className="node cur"></span><b>Run #2848 in progress</b><p>Step 6 of 14 — transforming records.</p><time>now</time></li>
                  <li><span className="node"></span><b>Scheduled</b><p>Run #2849 · 23:00 UTC</p></li>
                </ul>
              </div>
            </div>
          </div>

          <p className="demo-label" style={{marginTop:'24px'}}>Charts</p>
          <div className="chart-wrap">
            <div className="demo chart-card">
              <h5>Runs per day</h5>
              <p className="sub-t">Last 14 days</p>
              <svg viewBox="0 0 400 140" width="100%" role="img" aria-label="Line chart of runs per day">
                <g stroke="var(--border)" strokeWidth="1">
                  <line x1="0" y1="30" x2="400" y2="30"/><line x1="0" y1="70" x2="400" y2="70"/><line x1="0" y1="110" x2="400" y2="110"/>
                </g>
                <path d="M0,98 L31,92 L62,96 L93,80 L124,84 L155,66 L186,72 L217,58 L248,62 L279,44 L310,50 L341,34 L372,40 L400,28"
                      fill="none" stroke="var(--primary-500)" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M0,98 L31,92 L62,96 L93,80 L124,84 L155,66 L186,72 L217,58 L248,62 L279,44 L310,50 L341,34 L372,40 L400,28 L400,140 L0,140 Z"
                      fill="var(--primary-500)" opacity="0.08"/>
                <path d="M0,110 L31,108 L62,112 L93,104 L124,106 L155,98 L186,102 L217,94 L248,98 L279,88 L310,92 L341,84 L372,88 L400,80"
                      fill="none" stroke="var(--accent-500)" strokeWidth="2" strokeLinejoin="round" strokeDasharray="none"/>
                <circle cx="341" cy="34" r="3.5" fill="var(--bg-surface)" stroke="var(--primary-500)" strokeWidth="2"/>
              </svg>
              <div className="legend"><span><i style={{background:'var(--primary-500)'}}></i>Completed</span><span><i style={{background:'var(--accent-500)'}}></i>Scheduled</span></div>
            </div>
            <div className="demo chart-card">
              <h5>Failures by stage</h5>
              <p className="sub-t">This week</p>
              <svg viewBox="0 0 400 140" width="100%" role="img" aria-label="Bar chart of failures by stage">
                <g stroke="var(--border)" strokeWidth="1"><line x1="0" y1="120" x2="400" y2="120"/></g>
                <g fill="var(--primary-300)">
                  <rect x="24"  y="60" width="40" height="60" rx="3"/>
                  <rect x="100" y="84" width="40" height="36" rx="3"/>
                  <rect x="176" y="36" width="40" height="84" rx="3" fill="var(--primary-500)"/>
                  <rect x="252" y="98" width="40" height="22" rx="3"/>
                  <rect x="328" y="76" width="40" height="44" rx="3"/>
                </g>
                <g fontFamily="Inter" fontSize="10" fill="var(--text-3)" textAnchor="middle">
                  <text x="44" y="134">Extract</text><text x="120" y="134">Validate</text><text x="196" y="134">Transform</text><text x="272" y="134">Load</text><text x="348" y="134">Notify</text>
                </g>
              </svg>
              <div className="legend"><span><i style={{background:'var(--primary-500)'}}></i>Highlighted series</span><span><i style={{background:'var(--primary-300)'}}></i>Context</span></div>
            </div>
          </div>
          <p className="note"><strong>Chart rules.</strong> One highlighted series per chart; everything else recedes to <code>primary-300</code> or the accent teal. Horizontal gridlines only, in <code>--border</code>. No 3D, no drop shadows, no more than four series. Empty chart states use the standard empty-state pattern, not a blank axis.</p>
        </section>

  
        <section className="section" id="feedback">
          <div className="sec-head"><span className="idx">12</span><h3>Feedback</h3></div>
          <p className="sec-intro">Feedback is proportional to consequence: toasts for confirmations, alerts for persistent conditions, dialogs for decisions, modals for focused tasks. Nothing flashes, nothing bounces.</p>

          <p className="demo-label">Toast · bottom-right, auto-dismiss 5s, stack max 3</p>
          <div className="demo" style={{display:'flex', gap:'16px', flexWrap:'wrap'}}>
            <div className="toast" role="status">
              <svg className="status" style={{color:'var(--success)'}}><use href="#i-check-c"/></svg>
              <div><b>Workflow deployed</b><p>Nightly ETL v2.4 is live in production.</p></div>
              <div className="t-act"><a href="#feedback">View</a><button className="t-close" aria-label="Dismiss"><svg width="14" height="14"><use href="#i-x"/></svg></button></div>
            </div>
            <div className="toast" role="status">
              <svg className="status" style={{color:'var(--danger)'}}><use href="#i-x-c"/></svg>
              <div><b>Deploy failed</b><p>Step 3 timed out after 30s.</p></div>
              <div className="t-act"><a href="#feedback">Retry</a><button className="t-close" aria-label="Dismiss"><svg width="14" height="14"><use href="#i-x"/></svg></button></div>
            </div>
            <button className="btn btn-secondary btn-sm" id="toastBtn">Fire a live toast</button>
          </div>

          <p className="demo-label" style={{marginTop:'24px'}}>Alerts · inline, persistent until resolved</p>
          <div className="demo demo-col">
            <div className="alert alert-info"><svg><use href="#i-info"/></svg><div><b>Scheduled maintenance</b><p>API writes pause Sunday 02:00–02:30 UTC.</p></div></div>
            <div className="alert alert-success"><svg><use href="#i-check-c"/></svg><div><b>Backfill complete</b><p>All 1.2M historical records imported.</p></div></div>
            <div className="alert alert-warning"><svg><use href="#i-warn"/></svg><div><b>Approaching plan limit</b><p>82% of monthly runs used. Overage begins at 100%.</p></div></div>
            <div className="alert alert-danger"><svg><use href="#i-x-c"/></svg><div><b>Connection lost</b><p>Warehouse credentials expired. Runs are paused until reconnected.</p></div></div>
          </div>

          <div className="demo-grid" style={{gridTemplateColumns:'1fr 1fr', gap:'24px', marginTop:'24px'}}>
            <div>
              <p className="demo-label">Dialog · destructive confirmation, 400px</p>
              <div className="backdrop-demo">
                <div className="dialog" role="alertdialog" aria-labelledby="dlg-t">
                  <div className="d-icon"><svg><use href="#i-trash"/></svg></div>
                  <h5 id="dlg-t">Delete “Nightly ETL”?</h5>
                  <p>This permanently removes the workflow and its 216 run records. This can’t be undone.</p>
                  <div className="d-actions">
                    <button className="btn btn-secondary">Cancel</button>
                    <button className="btn btn-danger">Delete workflow</button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="demo-label">Modal · focused task, 520px</p>
              <div className="backdrop-demo">
                <div className="modal" role="dialog" aria-labelledby="mdl-t">
                  <div className="modal-head">
                    <h5 id="mdl-t">Invite teammate</h5>
                    <button className="t-close" aria-label="Close"><svg width="14" height="14"><use href="#i-x"/></svg></button>
                  </div>
                  <div className="modal-body">
                    <div className="field" style={{maxWidth:'none'}}>
                      <label>Email</label>
                      <input className="input" placeholder="name@company.com" />
                    </div>
                    <div className="field" style={{maxWidth:'none'}}>
                      <label>Role</label>
                      <select className="select"><option>Member — can edit workflows</option><option>Viewer — read only</option><option>Admin — full access</option></select>
                    </div>
                  </div>
                  <div className="modal-foot">
                    <button className="btn btn-ghost">Cancel</button>
                    <button className="btn btn-primary">Send invite</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="demo-grid" style={{gridTemplateColumns:'1fr 1fr', gap:'24px', marginTop:'24px'}}>
            <div>
              <p className="demo-label">Empty state</p>
              <div className="demo">
                <div className="empty">
                  <div className="e-icon"><svg><use href="#i-folder"/></svg></div>
                  <h5>No workflows yet</h5>
                  <p>Workflows automate your pipelines end to end. Create your first one or start from a template.</p>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button className="btn btn-primary"><svg><use href="#i-plus"/></svg>New workflow</button>
                    <button className="btn btn-secondary">Browse templates</button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="demo-label">Error state</p>
              <div className="demo">
                <div className="empty">
                  <div className="e-icon err"><svg><use href="#i-warn"/></svg></div>
                  <h5>Couldn’t load workflows</h5>
                  <p>The request timed out. Your data is safe — this is a display issue, not a data issue.</p>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button className="btn btn-secondary">Try again</button>
                    <button className="btn btn-ghost">Contact support</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="demo-label" style={{marginTop:'24px'}}>Loading skeleton · mirrors the layout it replaces</p>
          <div className="demo">
            <div style={{display:'flex', gap:'16px', alignItems:'center', marginBottom:'16px'}}>
              <div className="sk" style={{width:'32px', height:'32px', borderRadius:'999px'}}></div>
              <div style={{flex:'1', display:'flex', flexDirection:'column', gap:'8px'}}>
                <div className="sk" style={{width:'40%', height:'12px'}}></div>
                <div className="sk" style={{width:'24%', height:'10px'}}></div>
              </div>
              <div className="sk" style={{width:'64px', height:'20px', borderRadius:'999px'}}></div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              <div className="sk" style={{width:'100%', height:'12px'}}></div>
              <div className="sk" style={{width:'92%', height:'12px'}}></div>
              <div className="sk" style={{width:'66%', height:'12px'}}></div>
            </div>
          </div>
          <p className="note"><strong>Rules.</strong> Toasts never contain destructive actions and never block. Alerts sit at the top of the content area they describe. Dialogs name the object being acted on and label the confirm button with the verb (“Delete workflow”, never “OK”). Skeletons appear after 300ms — instant loads never flash one — and shimmer respects <code>prefers-reduced-motion</code>.</p>
        </section>
  
        <section className="section" id="a11y">
          <div className="sec-head"><span className="idx">13</span><h3>Accessibility</h3></div>
          <p className="sec-intro">WCAG 2.2 AA is the floor, not the target. Contrast is baked into the token pairs below — if you use the tokens as documented, you can't ship an inaccessible color combination.</p>

          <p className="demo-label">Verified contrast pairs (light theme)</p>
          <div className="demo">
            <div className="demo-row">
              <span className="contrast-pair" style={{background:'#fff', color:'#171A26'}}>text-1 / surface <span className="ratio">16.9:1</span></span>
              <span className="contrast-pair" style={{background:'#fff', color:'#555B6D'}}>text-2 / surface <span className="ratio">6.8:1</span></span>
              <span className="contrast-pair" style={{background:'#fff', color:'#7E8496'}}>text-3 / surface <span className="ratio">3.7:1 · large/meta only</span></span>
              <span className="contrast-pair" style={{background:'#4650C7', color:'#fff', borderColor:'transparent'}}>on-primary <span className="ratio">6.5:1</span></span>
            </div>
            <div className="demo-row">
              <span className="contrast-pair" style={{background:'#fff', color:'#C13539'}}>danger / surface <span className="ratio">5.5:1</span></span>
              <span className="contrast-pair" style={{background:'#fff', color:'#177E4D'}}>success / surface <span className="ratio">5.1:1</span></span>
              <span className="contrast-pair" style={{background:'#fff', color:'#B26205'}}>warning / surface <span className="ratio">4.5:1</span></span>
              <span className="contrast-pair" style={{background:'#15161C', color:'#EDEEF3', borderColor:'transparent'}}>dark text-1 <span className="ratio">15.8:1</span></span>
            </div>
          </div>

          <div className="sub">Keyboard &amp; focus</div>
          <div className="demo">
            <div className="demo-row" style={{alignItems:'flex-start'}}>
              <div style={{flex:'1', minWidth:'260px'}}>
                <p style={{fontSize:'13px', color:'var(--text-2)', margin:'0 0 12px'}}>Tab through these controls — every interactive element shows the same 2px offset ring. It is never removed, only re-styled on dark surfaces.</p>
                <div className="demo-row">
                  <button className="btn btn-primary">Button</button>
                  <input className="input" style={{width:'140px'}} placeholder="Input" />
                  <label className="check"><input type="checkbox" /><span className="box"><svg viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>Check</label>
                  <a href="#a11y">Link</a>
                </div>
              </div>
            </div>
          </div>
          <table className="ttable" style={{marginTop:'16px'}}>
            <thead><tr><th>Requirement</th><th>Standard</th></tr></thead>
            <tbody>
              <tr><td>Focus ring</td><td><code>0 0 0 2px surface, 0 0 0 4px primary-400</code> via <code>:focus-visible</code> — visible on every interactive element, 3:1 against adjacent colors</td></tr>
              <tr><td>Keyboard order</td><td>DOM order = visual order. Modals trap focus and return it on close. <kbd className="kbd">Esc</kbd> closes any overlay; arrow keys move within menus, tabs, and grids</td></tr>
              <tr><td>Hit targets</td><td>Minimum 24×24px interactive area (WCAG 2.2); controls are 28px+ with padding contributing to the target</td></tr>
              <tr><td>Type</td><td>Body ≥ 14px, meta ≥ 12px, line height ≥ 1.5 for paragraphs; text resizes to 200% without loss</td></tr>
              <tr><td>Not color alone</td><td>Status always pairs color with an icon or label (badge dot + word, error icon + message)</td></tr>
              <tr><td>Motion</td><td>All animation honors <code>prefers-reduced-motion</code>; nothing essential is conveyed by motion only</td></tr>
            </tbody>
          </table>
        </section>

  
        <section className="section" id="motion">
          <div className="sec-head"><span className="idx">14</span><h3>Motion</h3></div>
          <p className="sec-intro">Motion confirms, it never performs. One easing curve, four durations, and nothing on screen ever travels more than 8px. If a transition is noticeable, it's too slow.</p>
          <table className="ttable">
            <thead><tr><th>Token</th><th>Value</th><th>Used for</th></tr></thead>
            <tbody>
              <tr><td><code>--ease</code></td><td><code>cubic-bezier(.2, 0, 0, 1)</code></td><td>Everything. One curve, product-wide</td></tr>
              <tr><td><code>--dur-1</code></td><td>100ms</td><td>Micro feedback: checkbox, toggle knob, hover tint</td></tr>
              <tr><td><code>--dur-2</code></td><td>150ms</td><td>Buttons, inputs, menu items — the default</td></tr>
              <tr><td><code>--dur-3</code></td><td>200ms</td><td>Dropdowns, popovers, tooltips (fade + 4px rise)</td></tr>
              <tr><td><code>--dur-4</code></td><td>300ms</td><td>Modals, drawers, page-level surfaces (fade + subtle scale from .98)</td></tr>
            </tbody>
          </table>
          <div className="demo" style={{marginTop:'16px'}}>
            <p className="demo-label">Hover these — each uses its duration token</p>
            <div className="motion-demo">
              <span className="motion-chip m1">100ms · micro</span>
              <span className="motion-chip m2">150ms · default</span>
              <span className="motion-chip m3">200ms · overlay</span>
              <span className="motion-chip m4">300ms · surface</span>
            </div>
          </div>
          <p className="note"><strong>Never:</strong> bounce, spring overshoot, parallax, attention-seeking loops, staggered list entrances beyond 3 items, or any transition on page scroll. <strong>Always:</strong> transition <code>opacity</code> and <code>transform</code> only (compositor-friendly), and disable everything under <code>prefers-reduced-motion</code>.</p>
        </section>

  
        <section className="section" id="grid">
          <div className="sec-head"><span className="idx">15</span><h3>Grid &amp; layout</h3></div>
          <p className="sec-intro">The app frame is fixed chrome + fluid content: 56px top bar, 240px sidebar, and a content region on a column grid. Content is comfortable at any width but never stretches past 1200px for reading surfaces.</p>

          <p className="demo-label">Desktop ≥ 1280 · 12 columns · 24px gutter</p>
          <div className="grid-vis g12">
            <div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div>
          </div>
          <p className="demo-label" style={{marginTop:'16px'}}>Tablet 768–1279 · 8 columns · 24px gutter · sidebar collapses to 64px icon rail</p>
          <div className="grid-vis g8">
            <div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div>
          </div>
          <p className="demo-label" style={{marginTop:'16px'}}>Mobile &lt; 768 · 4 columns · 16px margins · sidebar becomes a drawer</p>
          <div className="grid-vis g4">
            <div className="gcol"></div><div className="gcol"></div><div className="gcol"></div><div className="gcol"></div>
          </div>

          <table className="ttable" style={{marginTop:'24px'}}>
            <thead><tr><th>Breakpoint</th><th>Range</th><th>Columns</th><th>Margins</th><th>Chrome</th></tr></thead>
            <tbody>
              <tr><td>Desktop</td><td>≥ 1280px</td><td>12 · 24px gutter</td><td>32px</td><td>Top bar 56 + sidebar 240 · content max 1200px</td></tr>
              <tr><td>Tablet</td><td>768–1279px</td><td>8 · 24px gutter</td><td>24px</td><td>Sidebar → 64px icon rail with tooltips</td></tr>
              <tr><td>Mobile</td><td>&lt; 768px</td><td>4 · 16px gutter</td><td>16px</td><td>Sidebar → drawer · tables → cards or horizontal scroll with pinned first column</td></tr>
            </tbody>
          </table>
          <p className="note"><strong>Rules.</strong> Cards span whole columns — never fractional widths. Forms are single-column at every breakpoint (two-column only for tightly-coupled pairs like first/last name). Modals: 400px (dialog), 520px (standard), 720px (wide); below 520px viewport width they become full-screen sheets.</p>
        </section>

        <footer style={{borderTop:'1px solid var(--border)', paddingTop:'24px', display:'flex', justifyContent:'space-between', fontSize:'12px', color:'var(--text-3)'}}>
          <span>FlowPilot Design Foundation · v1.0 · July 2026</span>
          <span>Tokens only — no raw values in product code</span>
        </footer>

        </div></main>
      </div>

      <div id="toastHost" style={{position:'fixed', right:'24px', bottom:'24px', display:'flex', flexDirection:'column', gap:'8px', zIndex:'100'}}></div>


    </div>
  );
}
