'use client';
import { useEffect, useState } from 'react';
import { type Settings } from '../api';
import { useSettings, useSaveSettings } from '../hooks';
import { Icon, useToast } from '../ui';

const TIMEZONES = ['UTC', 'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Singapore', 'Australia/Sydney'];
const DATE_FORMATS = ['DD MMM YYYY', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
const VIEWS = ['board', 'list', 'timeline'];
const NOTIF_KEYS: { key: string; label: string }[] = [
  { key: 'taskAssigned', label: 'When a task is assigned to me' },
  { key: 'mentions', label: 'When I’m mentioned in a comment' },
  { key: 'invites', label: 'Invitation activity' },
  { key: 'weeklyDigest', label: 'Weekly workspace digest' },
];

export default function PreferencesTab({ slug, canEdit }: { slug: string; canEdit: boolean }) {
  const toast = useToast();
  const settingsQuery = useSettings(slug);
  const saveMut = useSaveSettings(slug);
  const saving = saveMut.isPending;
  // Local editable copy, seeded from the server settings once they arrive.
  const [s, setS] = useState<Settings | null>(null);
  useEffect(() => { if (settingsQuery.data) setS(settingsQuery.data); }, [settingsQuery.data]);

  if (!s) return <div className="card"><div className="loading"><span className="spinner" /> Loading preferences…</div></div>;

  const prefs = s.notificationPrefs ?? {};
  function setField<K extends keyof Settings>(k: K, v: Settings[K]) { setS((p) => (p ? { ...p, [k]: v } : p)); }
  function toggle(key: string) { setS((p) => (p ? { ...p, notificationPrefs: { ...p.notificationPrefs, [key]: !p.notificationPrefs?.[key] } } : p)); }

  function save() {
    if (!s) return;
    saveMut.mutate(
      { timezone: s.timezone, dateFormat: s.dateFormat, defaultView: s.defaultView, notificationPrefs: s.notificationPrefs ?? {} },
      {
        onSuccess: (updated) => { setS(updated); toast({ msg: 'Preferences saved.' }); },
        onError: (e) => toast({ msg: e instanceof Error ? e.message : 'Could not save.', err: true }),
      },
    );
  }

  return (
    <div className="card">
      <h3>Preferences</h3>
      <p className="sub">Defaults for how this workspace looks and notifies.</p>

      <div className="row">
        <div className="field">
          <label htmlFor="pf-tz">Timezone</label>
          <select id="pf-tz" className="select" value={s.timezone} disabled={!canEdit} onChange={(e) => setField('timezone', e.target.value)}>
            {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pf-df">Date format</label>
          <select id="pf-df" className="select" value={s.dateFormat} disabled={!canEdit} onChange={(e) => setField('dateFormat', e.target.value)}>
            {DATE_FORMATS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pf-dv">Default view</label>
          <select id="pf-dv" className="select" value={s.defaultView} disabled={!canEdit} onChange={(e) => setField('defaultView', e.target.value)}>
            {VIEWS.map((t) => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 'var(--s-3)' }}>
        <label style={{ fontSize: 13, fontWeight: 500 }}>Notifications</label>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NOTIF_KEYS.map((n) => (
            <label key={n.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: canEdit ? 'pointer' : 'default' }}>
              <input type="checkbox" checked={!!prefs[n.key]} disabled={!canEdit} onChange={() => toggle(n.key)} />
              <span>{n.label}</span>
            </label>
          ))}
        </div>
      </div>

      {canEdit && (
        <div className="card-actions">
          <button className="btn btn-primary" disabled={saving} onClick={save}>
            {saving ? <><span className="spinner" /> Saving…</> : <><Icon name="i-check" /> Save preferences</>}
          </button>
        </div>
      )}
    </div>
  );
}
