'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { get, post, type Project } from '../api';
import { Icon, useToast } from '../ui';

export default function ProjectsPage({ slug }: { slug: string }) {
  const router = useRouter();
  const toast = useToast();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    get<Project[]>(`/workspaces/${slug}/projects`).then(setProjects).catch((e) => setError(e.message ?? 'Could not load projects.'));
  }, [slug]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const p = await post<Project>(`/workspaces/${slug}/projects`, { name, description: desc || undefined, icon: icon.trim() || undefined });
      setCreating(false); setName(''); setIcon(''); setDesc('');
      toast({ msg: 'Project created.' });
      router.push(`/w/${slug}/projects/${p.id}`);
    } catch (e: any) {
      toast({ msg: e.message ?? 'Could not create project.', err: true });
    } finally { setSaving(false); }
  }

  return (
    <div className="page">
      <div className="page-head" style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h1>Projects</h1>
          <p>Every project gets its own board. Click one to plan and track work.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}><Icon name="i-plus" /> New project</button>
      </div>

      {error && <div className="center-state"><Icon name="i-warn" className="ic" /><h2>Couldn’t load projects</h2><p>{error}</p></div>}

      {!error && (
        <div className="proj-grid">
          {!projects && <div className="loading"><span className="spinner" /> Loading…</div>}
          {projects?.map((p) => (
            <button key={p.id} className="proj-card" onClick={() => router.push(`/w/${slug}/projects/${p.id}`)}>
              <div className="top">
                <span className="proj-ic">{p.icon ?? <Icon name="i-layers" />}</span>
                <span className="nm">{p.name}</span>
              </div>
              <div className="desc">{p.description || 'No description yet.'}</div>
              <div className="foot">
                <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{p.status.toLowerCase()}</span>
                <span className="muted" style={{ fontSize: 12 }}>{p._count?.tasks ?? 0} tasks</span>
              </div>
            </button>
          ))}
          {projects && (
            <button className="proj-card new" onClick={() => setCreating(true)}><Icon name="i-plus" /> New project</button>
          )}
        </div>
      )}

      {creating && (
        <div className="modal-scrim" onClick={() => setCreating(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={create}>
            <h3>Create project</h3>
            <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'flex-end' }}>
              <div className="field" style={{ maxWidth: 90 }}>
                <label htmlFor="p-icon">Icon</label>
                <input id="p-icon" className="input" value={icon} maxLength={2} placeholder="🗂️" onChange={(e) => setIcon(e.target.value)} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="p-name">Name</label>
                <input id="p-name" className="input" required autoFocus value={name} placeholder="Website redesign" onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
            <div className="field" style={{ marginTop: 'var(--s-2)' }}>
              <label htmlFor="p-desc">Description <span className="muted">(optional)</span></label>
              <textarea id="p-desc" className="input" style={{ minHeight: 70, padding: '10px 12px', fontFamily: 'inherit' }} value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div className="card-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}>
                {saving ? <><span className="spinner" /> Creating…</> : 'Create project'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
