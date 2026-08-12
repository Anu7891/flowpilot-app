'use client';
import { useRouter, usePathname } from 'next/navigation';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import ThemeToggle from './ThemeToggle';
import { Icon } from './ui';
import { useProjects } from './hooks';

export default function Sidebar({ slug }: { slug: string }) {
  const router = useRouter();
  const pathname = usePathname() || '';
  // Shared cache with the projects pages — creating a project anywhere refreshes
  // this list automatically (no more refetch-on-navigation hack).
  const projectsQuery = useProjects(slug);
  const projects = projectsQuery.isError ? [] : projectsQuery.data ?? null;

  const isHome = pathname === `/w/${slug}`;
  const onProjects = pathname === `/w/${slug}/projects`;
  const activeProjectId = pathname.startsWith(`/w/${slug}/projects/`) ? pathname.split('/').pop() : null;

  return (
    <aside className="sidebar">
      <div className="side-top">
        <div className="side-brand"><Icon name="i-flow" /> FlowPilot</div>
        <span data-tour="switcher"><WorkspaceSwitcher activeSlug={slug} /></span>
      </div>

      <nav className="side-nav">
        <button className={`side-link ${isHome ? 'active' : ''}`} onClick={() => router.push(`/w/${slug}`)}><Icon name="i-home" /> Home</button>
        <button className="side-link" onClick={() => router.push('/dashboard')}><Icon name="i-inbox" /> Inbox</button>
        <button className={`side-link ${onProjects ? 'active' : ''}`} data-tour="projects" onClick={() => router.push(`/w/${slug}/projects`)}><Icon name="i-layers" /> Projects</button>

        <div className="side-sec">
          <span>Projects</span>
          <button title="New project" onClick={() => router.push(`/w/${slug}/projects`)}><Icon name="i-plus" /></button>
        </div>
        {!projects && <div className="side-proj muted" style={{ fontSize: 12 }}>Loading…</div>}
        {projects?.length === 0 && <div className="muted" style={{ fontSize: 12.5, padding: '4px 10px' }}>No projects yet.</div>}
        {projects?.map((p) => (
          <button key={p.id} className={`side-proj ${activeProjectId === p.id ? 'active' : ''}`} onClick={() => router.push(`/w/${slug}/projects/${p.id}`)}>
            <span className="pic">{p.icon ?? <Icon name="i-layers" />}</span>
            <span className="nm">{p.name}</span>
            <span className="ct">{p._count?.tasks ?? 0}</span>
          </button>
        ))}
      </nav>

      <div className="side-bottom">
        <ThemeToggle />
        <button className="side-link" data-tour="settings" onClick={() => router.push(`/w/${slug}/settings`)}><Icon name="i-settings" /> Settings</button>
      </div>
    </aside>
  );
}
