'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { get, type WorkspaceSummary } from './api';
import { Icon } from './ui';

/** Real entry point: send the user to their active workspace (or login/onboarding). */
export default function DashboardRedirect() {
  const router = useRouter();
  const [msg, setMsg] = useState('Loading your workspace…');

  useEffect(() => {
    (async () => {
      try {
        const { user } = await get<{ user: { id: string; lastWorkspaceId: string | null } | null }>('/auth/session');
        if (!user) { router.replace('/login'); return; }

        const workspaces = await get<WorkspaceSummary[]>('/workspaces');
        const active = workspaces.filter((w) => !w.archivedAt);
        if (active.length === 0) {
          setMsg('No workspace yet — taking you to setup…');
          router.replace('/onboarding');
          return;
        }
        const target = active.find((w) => w.id === user.lastWorkspaceId) ?? active[0];
        router.replace(`/w/${target.slug}`);
      } catch {
        router.replace('/login');
      }
    })();
  }, [router]);

  return (
    <div className="pg-flow pg-ws">
      <div className="page"><div className="loading"><span className="spinner" /> {msg}</div></div>
    </div>
  );
}
