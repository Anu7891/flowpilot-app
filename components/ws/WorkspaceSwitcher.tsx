'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { get, post, type WorkspaceSummary } from './api';
import { Icon, initials, useToast } from './ui';

function accent(w: WorkspaceSummary) {
  return w.color ?? 'var(--primary)';
}

export default function WorkspaceSwitcher({ activeSlug }: { activeSlug: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[] | null>(null);
  const [q, setQ] = useState('');
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    get<WorkspaceSummary[]>('/workspaces').then(setWorkspaces).catch(() => setWorkspaces([]));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const active = workspaces?.find((w) => w.slug === activeSlug);
  const list = useMemo(() => {
    const active = workspaces?.filter((w) => !w.archivedAt) ?? [];
    const term = q.trim().toLowerCase();
    const filtered = term ? active.filter((w) => w.name.toLowerCase().includes(term) || w.slug.includes(term)) : active;
    // current workspace first, rest keep server order
    return [...filtered].sort((a, b) => (a.slug === activeSlug ? -1 : b.slug === activeSlug ? 1 : 0));
  }, [workspaces, q, activeSlug]);

  async function switchTo(w: WorkspaceSummary) {
    setOpen(false);
    if (w.slug === activeSlug) return;
    setSwitching(true);
    try {
      await post(`/workspaces/${w.slug}/switch`);
      router.push(`/w/${w.slug}`);
    } catch (e: any) {
      toast({ msg: e.message ?? 'Could not switch workspace.', err: true });
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="switcher" ref={ref}>
      <button className="switcher-trigger" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        <span className="ws-badge" style={{ background: active ? accent(active) : 'var(--primary)' }}>
          {active?.icon ?? (active ? initials(active.name) : '·')}
        </span>
        <span className="ws-name">{active?.name ?? 'Select workspace'}</span>
        <span className="chev">{switching ? <span className="spinner" /> : <Icon name="i-chev-d" />}</span>
      </button>

      {open && (
        <div className="switcher-menu" role="menu">
          <div className="switcher-search">
            <Icon name="i-search" />
            <input autoFocus placeholder="Search workspaces" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="switcher-label">Workspaces</div>
          <div className="ws-list">
            {workspaces === null && <div className="switcher-empty">Loading…</div>}
            {workspaces !== null && list.length === 0 && <div className="switcher-empty">No workspaces found</div>}
            {list.map((w) => (
              <button key={w.id} className={`ws-item ${w.slug === activeSlug ? 'active' : ''}`} onClick={() => switchTo(w)} role="menuitem">
                <span className="ws-badge" style={{ background: accent(w) }}>{w.icon ?? initials(w.name)}</span>
                <span className="meta">
                  <span className="nm">{w.name}</span>
                  <span className="rl">{w.role.toLowerCase()}</span>
                </span>
                {w.slug === activeSlug && <span className="tick"><Icon name="i-check" /></span>}
              </button>
            ))}
          </div>
          <div className="switcher-divider" />
          <button className="switcher-cta" onClick={() => { setOpen(false); router.push('/onboarding'); }}>
            <Icon name="i-plus" /> Create workspace
          </button>
        </div>
      )}
    </div>
  );
}
