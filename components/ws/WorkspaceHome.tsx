'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from './api';
import { useWorkspace, useProjects, useMembers, useSession, useCreateProject, usePrefetchProject } from './hooks';
import { Icon, initials, useToast } from './ui';
import Tour, { type TourStep } from './Tour';

const TOUR_STEPS: TourStep[] = [
  { anchor: 'switcher', title: 'Your workspace', body: 'Each workspace holds its own team, projects, and settings. Switch between them or create a new one from here.' },
  { anchor: 'projects', title: 'Projects & boards', body: 'All your projects live here. Every project gets its own Kanban board where tasks move by drag and drop.' },
  { anchor: 'new-project', title: 'Start a project', body: 'Create a project, then add tasks on the board and set their priority, assignee, and due date.' },
  { anchor: 'settings', title: 'Team & settings', body: 'Invite members, assign roles, and manage workspace settings from here.' },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function WorkspaceHome({ slug }: { slug: string }) {
  const router = useRouter();
  const toast = useToast();
  const wsQuery = useWorkspace(slug);
  const projectsQuery = useProjects(slug);
  const membersQuery = useMembers(slug);
  const sessionQuery = useSession();
  const createProjectMut = useCreateProject(slug);
  const prefetchProject = usePrefetchProject();

  const ws = wsQuery.data ?? null;
  // Child lists fail soft (empty) so one flaky list never blanks the whole page.
  const projects = projectsQuery.isError ? [] : projectsQuery.data ?? null;
  const members = membersQuery.isError ? [] : membersQuery.data ?? null;
  const name = sessionQuery.data?.user?.name.split(' ')[0] ?? 'there';
  const error = wsQuery.isError
    ? wsQuery.error instanceof ApiError
      ? wsQuery.error.message
      : 'Could not load workspace.'
    : null;

  const [tour, setTour] = useState(false);

  // create project modal
  const [creating, setCreating] = useState(false);
  const [pName, setPName] = useState('');
  const [pIcon, setPIcon] = useState('');
  const saving = createProjectMut.isPending;

  // auto-start tour once per browser
  useEffect(() => {
    if (ws && projects && typeof window !== 'undefined' && !localStorage.getItem('fp_tour_done')) {
      const t = setTimeout(() => setTour(true), 500);
      return () => clearTimeout(t);
    }
  }, [ws, projects]);

  function endTour() { setTour(false); try { localStorage.setItem('fp_tour_done', '1'); } catch {} }

  function createProject(e: React.FormEvent) {
    e.preventDefault();
    createProjectMut.mutate(
      { name: pName, icon: pIcon.trim() || undefined },
      {
        onSuccess: (p) => {
          toast({ msg: 'Project created.' });
          router.push(`/w/${slug}/projects/${p.id}`);
        },
        onError: (err) => {
          toast({ msg: err instanceof Error ? err.message : 'Could not create project.', err: true });
        },
      },
    );
  }

  if (error) {
    return <div className="page"><div className="center-state"><Icon name="i-warn" className="ic" /><h2>Workspace unavailable</h2><p>{error}</p>
      <button className="btn btn-secondary" onClick={() => router.push('/login')}>Go to login</button></div></div>;
  }
  if (!ws) return <div className="page"><div className="loading"><span className="spinner" /> Loading…</div></div>;

  const canManage = ws.role === 'OWNER' || ws.role === 'ADMIN';
  const recent = (projects ?? []).slice(0, 5);

  return (
    <div className="page">
      <div className="page-head" style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h1>{greeting()}, {name}</h1>
          <p>{ws.name} · flowpilot.app/{ws.slug}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setTour(true)}><Icon name="i-info" /> Take a tour</button>
        <button className="btn btn-primary" data-tour="new-project" onClick={() => { setCreating(true); setPName(''); setPIcon(''); }}>
          <Icon name="i-plus" /> New project
        </button>
      </div>

      <div className="proj-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
        {/* Projects card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s-1)' }}>
            <h3>Projects</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/w/${slug}/projects`)}>View all</button>
          </div>
          {!projects && <div className="loading" style={{ padding: 'var(--s-3)' }}><span className="spinner" /></div>}
          {projects && recent.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--s-2) 0' }}>
              <p className="muted" style={{ fontSize: 13 }}>No projects yet. Create your first one to get a board.</p>
              <button className="btn btn-primary btn-sm" onClick={() => { setCreating(true); setPName(''); setPIcon(''); }}><Icon name="i-plus" /> Create project</button>
            </div>
          )}
          {recent.map((p) => (
            <button key={p.id} className="ws-item" style={{ padding: '8px 8px' }} onMouseEnter={() => prefetchProject(p.id)} onClick={() => router.push(`/w/${slug}/projects/${p.id}`)}>
              <span className="proj-ic" style={{ width: 30, height: 30, fontSize: 14 }}>{p.icon ?? <Icon name="i-layers" />}</span>
              <span className="meta"><span className="nm">{p.name}</span><span className="rl">{p._count?.tasks ?? 0} tasks</span></span>
              <span className="tick"><Icon name="i-chev-r" /></span>
            </button>
          ))}
        </div>

        {/* Team card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s-1)' }}>
            <h3>Team</h3>
            {canManage && <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/w/${slug}/settings`)}>Manage</button>}
          </div>
          <p className="sub">{members ? `${members.length} ${members.length === 1 ? 'member' : 'members'}` : 'Loading…'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {members?.slice(0, 5).map((m) => (
              <div key={m.id} className="cell-user" style={{ padding: '4px 0' }}>
                <span className="avatar">{m.user.avatar ? <img src={m.user.avatar} alt="" /> : initials(m.user.name)}</span>
                <span><span className="nm">{m.user.name}</span> <span className="muted" style={{ fontSize: 12, textTransform: 'capitalize' }}>· {m.role.toLowerCase()}</span></span>
              </div>
            ))}
          </div>
          {canManage && (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--s-1)' }} onClick={() => router.push(`/w/${slug}/settings`)}>
              <Icon name="i-mail" /> Invite teammates
            </button>
          )}
        </div>

        {/* Getting started card */}
        <div className="card">
          <h3>Getting started</h3>
          <p className="sub">Get the hang of FlowPilot in about 30 seconds.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => setTour(true)}><Icon name="i-info" /> Take the guided tour</button>
            <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => { setCreating(true); setPName(''); setPIcon(''); }}><Icon name="i-plus" /> Create a project</button>
            <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => router.push(`/w/${slug}/projects`)}><Icon name="i-board" /> Open the board</button>
            {canManage && <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => router.push(`/w/${slug}/settings`)}><Icon name="i-settings" /> Workspace settings</button>}
          </div>
        </div>
      </div>

      {creating && (
        <div className="modal-scrim" onClick={() => setCreating(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={createProject}>
            <h3>Create project</h3>
            <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'flex-end' }}>
              <div className="field" style={{ maxWidth: 90 }}>
                <label htmlFor="h-picon">Icon</label>
                <input id="h-picon" className="input" value={pIcon} maxLength={2} placeholder="🗂️" onChange={(e) => setPIcon(e.target.value)} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="h-pname">Name</label>
                <input id="h-pname" className="input" required autoFocus value={pName} placeholder="Website redesign" onChange={(e) => setPName(e.target.value)} />
              </div>
            </div>
            <div className="card-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || !pName.trim()}>{saving ? <><span className="spinner" /> Creating…</> : 'Create project'}</button>
            </div>
          </form>
        </div>
      )}

      {tour && <Tour steps={TOUR_STEPS} onDone={endTour} />}
    </div>
  );
}
