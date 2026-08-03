'use client';
import { useState } from 'react';
import { patch, type Role, type WorkspaceSummary } from '../api';
import { Icon, initials, useToast } from '../ui';

type WS = WorkspaceSummary & { role: Role };
const SWATCHES = ['#4650C7', '#12A38A', '#B26205', '#C13539', '#7681E1', '#0F8A75', '#555B6D'];

export default function GeneralTab({ ws, canEdit, onSaved }: { ws: WS; canEdit: boolean; onSaved: (w: WS) => void }) {
  const toast = useToast();
  const [name, setName] = useState(ws.name);
  const [slug, setSlug] = useState(ws.slug);
  const [color, setColor] = useState(ws.color ?? '#4650C7');
  const [icon, setIcon] = useState(ws.icon ?? '');
  const [saving, setSaving] = useState(false);

  const dirty = name !== ws.name || slug !== ws.slug || color !== (ws.color ?? '#4650C7') || icon !== (ws.icon ?? '');

  async function save() {
    setSaving(true);
    try {
      const updated = await patch<WS>(`/workspaces/${ws.slug}`, {
        name, slug, color, icon: icon.trim() || null,
      });
      onSaved({ ...ws, ...updated });
      toast({ msg: 'Workspace updated.' });
      if (updated.slug !== ws.slug) window.history.replaceState(null, '', `/w/${updated.slug}/settings`);
    } catch (e: any) {
      toast({ msg: e.message ?? 'Could not save.', err: true });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h3>General</h3>
      <p className="sub">Basic details for this workspace.</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 'var(--s-2)' }}>
        <span className="ws-badge" style={{ width: 48, height: 48, fontSize: 18, background: color }}>{icon || initials(name)}</span>
        <div className="field" style={{ maxWidth: 160 }}>
          <label htmlFor="ws-icon">Icon (emoji)</label>
          <input id="ws-icon" className="input" value={icon} disabled={!canEdit} maxLength={2} placeholder="🚀" onChange={(e) => setIcon(e.target.value)} />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="ws-name">Workspace name</label>
          <input id="ws-name" className="input" value={name} disabled={!canEdit} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ws-slug">URL slug</label>
          <input id="ws-slug" className="input" value={slug} disabled={!canEdit} onChange={(e) => setSlug(e.target.value.toLowerCase())} />
          <span className="hint">flowpilot.app/{slug || '…'}</span>
        </div>
      </div>

      <div className="field" style={{ marginTop: 'var(--s-2)' }}>
        <label>Accent color</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {SWATCHES.map((c) => (
            <button key={c} type="button" disabled={!canEdit} onClick={() => setColor(c)}
              aria-label={c}
              style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: canEdit ? 'pointer' : 'default',
                border: color.toLowerCase() === c.toLowerCase() ? '2px solid var(--text-1)' : '2px solid transparent',
                outline: color.toLowerCase() === c.toLowerCase() ? '2px solid var(--bg-surface)' : 'none' }} />
          ))}
        </div>
      </div>

      {canEdit && (
        <div className="card-actions">
          <button className="btn btn-primary" disabled={!dirty || saving} onClick={save}>
            {saving ? <><span className="spinner" /> Saving…</> : <><Icon name="i-check" /> Save changes</>}
          </button>
        </div>
      )}
    </div>
  );
}
