'use client';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Icon } from './ui';

export type TourStep = { anchor: string; title: string; body: string };

type Rect = { top: number; left: number; width: number; height: number };

export default function Tour({ steps, onDone }: { steps: TourStep[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = steps[i];

  useLayoutEffect(() => {
    if (!step) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.anchor}"]`);
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    const t = setTimeout(measure, 260); // after scroll settles
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => { clearTimeout(t); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [i, step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone();
      if (e.key === 'ArrowRight') setI((x) => Math.min(steps.length - 1, x + 1));
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [steps.length, onDone]);

  if (!step) return null;
  const last = i === steps.length - 1;
  const pad = 6;

  // Tooltip placement: below the anchor, flipped above if not enough room.
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  let tipTop = 0, tipLeft = 0, below = true;
  if (rect) {
    below = rect.top + rect.height + 180 < vh;
    tipTop = below ? rect.top + rect.height + pad + 8 : rect.top - pad - 8 - 168;
    tipLeft = Math.min(Math.max(12, rect.left + rect.width / 2 - 160), vw - 332);
  } else {
    tipTop = vh / 2 - 90; tipLeft = vw / 2 - 160;
  }

  return (
    <div className="tour">
      {/* Spotlight — a transparent box with a huge shadow that dims everything else. */}
      {rect && (
        <div
          className="tour-spot"
          style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
        />
      )}
      {!rect && <div className="tour-dim" onClick={onDone} />}

      <div className="tour-tip" style={{ top: tipTop, left: tipLeft }}>
        <div className="tour-tip-head">
          <span className="step-n">{i + 1} / {steps.length}</span>
          <button className="tour-skip" onClick={onDone}>Skip <Icon name="i-x" /></button>
        </div>
        <h4>{step.title}</h4>
        <p>{step.body}</p>
        <div className="tour-actions">
          {i > 0 && <button className="btn btn-secondary btn-sm" onClick={() => setI(i - 1)}>Back</button>}
          <span style={{ flex: 1 }} />
          {last
            ? <button className="btn btn-primary btn-sm" onClick={onDone}><Icon name="i-check" /> Got it</button>
            : <button className="btn btn-primary btn-sm" onClick={() => setI(i + 1)}>Next</button>}
        </div>
      </div>
    </div>
  );
}
