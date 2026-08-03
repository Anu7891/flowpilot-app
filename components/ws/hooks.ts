'use client';
/**
 * React Query hooks for the FlowPilot API.
 *
 * These wrap the typed `api.ts` client so screens never call `fetch` or manage
 * loading/error booleans by hand. Two rules keep this scalable:
 *   1. Every query key comes from the `qk` factory below (no ad-hoc string keys)
 *      so mutations can invalidate precisely.
 *   2. Hooks return the raw React Query result — screens read `.data`,
 *      `.isPending`, `.error` and stay declarative.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from './api';
import type {
  WorkspaceSummary,
  Member,
  Project,
  Role,
} from './api';

/** Centralized, hierarchical query keys — invalidate a whole subtree by prefix. */
export const qk = {
  session: ['session'] as const,
  workspace: (slug: string) => ['workspace', slug] as const,
  projects: (slug: string) => ['workspace', slug, 'projects'] as const,
  members: (slug: string) => ['workspace', slug, 'members'] as const,
  project: (projectId: string) => ['project', projectId] as const,
  tasks: (projectId: string) => ['project', projectId, 'tasks'] as const,
};

type WorkspaceDetail = WorkspaceSummary & { role: Role };

export function useSession() {
  return useQuery({
    queryKey: qk.session,
    queryFn: () => get<{ user: { name: string; email: string } | null }>('/auth/session'),
    staleTime: 5 * 60_000, // identity rarely changes within a session
  });
}

export function useWorkspace(slug: string) {
  return useQuery({
    queryKey: qk.workspace(slug),
    queryFn: () => get<WorkspaceDetail>(`/workspaces/${slug}`),
  });
}

export function useProjects(slug: string) {
  return useQuery({
    queryKey: qk.projects(slug),
    queryFn: () => get<Project[]>(`/workspaces/${slug}/projects`),
  });
}

export function useMembers(slug: string) {
  return useQuery({
    queryKey: qk.members(slug),
    queryFn: () => get<Member[]>(`/workspaces/${slug}/members`),
  });
}

/** Create a project, then refresh the workspace's project list. */
export function useCreateProject(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; icon?: string }) =>
      post<Project>(`/workspaces/${slug}/projects`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.projects(slug) });
    },
  });
}

// Re-export the low-level verbs for screens still mid-migration.
export { get, post, patch, del };
