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
  Task,
  Role,
  Invitation,
  Settings,
  Comment,
} from './api';

/** Centralized, hierarchical query keys — invalidate a whole subtree by prefix. */
export const qk = {
  session: ['session'] as const,
  workspaces: ['workspaces'] as const,
  workspace: (slug: string) => ['workspace', slug] as const,
  projects: (slug: string) => ['workspace', slug, 'projects'] as const,
  members: (slug: string) => ['workspace', slug, 'members'] as const,
  invitations: (slug: string) => ['workspace', slug, 'invitations'] as const,
  settings: (slug: string) => ['workspace', slug, 'settings'] as const,
  project: (projectId: string) => ['project', projectId] as const,
  tasks: (projectId: string) => ['project', projectId, 'tasks'] as const,
  comments: (taskId: string) => ['task', taskId, 'comments'] as const,
};

type WorkspaceDetail = WorkspaceSummary & { role: Role };

export function useSession() {
  return useQuery({
    queryKey: qk.session,
    queryFn: () => get<{ user: { id: string; name: string; email: string } | null }>('/auth/session'),
    staleTime: 5 * 60_000, // identity rarely changes within a session
  });
}

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => get<WorkspaceSummary[]>('/workspaces'),
  });
}

/** Persist the active workspace server-side, then refresh session (lastWorkspaceId). */
export function useSwitchWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (targetSlug: string) => post(`/workspaces/${targetSlug}/switch`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.session });
    },
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

export function useProject(projectId: string) {
  return useQuery({
    queryKey: qk.project(projectId),
    queryFn: () => get<Project>(`/projects/${projectId}`),
  });
}

/** Board tasks — high limit so the whole board loads in one query, grouped client-side. */
export function useTasks(projectId: string) {
  return useQuery({
    queryKey: qk.tasks(projectId),
    queryFn: () => get<Task[]>(`/projects/${projectId}/tasks?limit=200`),
  });
}

/** Create a project, then refresh the workspace's project list. */
export function useCreateProject(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; icon?: string; description?: string }) =>
      post<Project>(`/workspaces/${slug}/projects`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.projects(slug) });
    },
  });
}

// ---- Members ----
export function useChangeMemberRole(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      patch<Member>(`/workspaces/${slug}/members/${userId}`, { role }),
    onSuccess: (updated) => {
      qc.setQueryData<Member[]>(qk.members(slug), (old) =>
        old?.map((m) => (m.user.id === updated.user.id ? { ...m, role: updated.role } : m)) ?? old,
      );
    },
  });
}

export function useRemoveMember(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => del(`/workspaces/${slug}/members/${userId}`),
    onSuccess: (_r, userId) => {
      qc.setQueryData<Member[]>(qk.members(slug), (old) => old?.filter((m) => m.user.id !== userId) ?? old);
    },
  });
}

// ---- Invitations ----
type InviteResult = { invitation: Invitation; inviteUrl: string };

export function useInvitations(slug: string) {
  return useQuery({
    queryKey: qk.invitations(slug),
    queryFn: () => get<Invitation[]>(`/workspaces/${slug}/invitations`),
  });
}

export function useCreateInvite(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; role: Role }) =>
      post<InviteResult>(`/workspaces/${slug}/invitations`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.invitations(slug) }),
  });
}

export function useResendInvite(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => post<InviteResult>(`/workspaces/${slug}/invitations/${id}/resend`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.invitations(slug) }),
  });
}

export function useRevokeInvite(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/workspaces/${slug}/invitations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.invitations(slug) }),
  });
}

// ---- Settings ----
export function useSettings(slug: string) {
  return useQuery({
    queryKey: qk.settings(slug),
    queryFn: () => get<Settings>(`/workspaces/${slug}/settings`),
  });
}

export function useSaveSettings(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Settings>) => patch<Settings>(`/workspaces/${slug}/settings`, input),
    onSuccess: (updated) => qc.setQueryData(qk.settings(slug), updated),
  });
}

// ---- Workspace update / delete (General + Danger tabs) ----
export function useUpdateWorkspace(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => patch<WorkspaceDetail>(`/workspaces/${slug}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.workspaces });
    },
  });
}

export function useDeleteWorkspace(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => del(`/workspaces/${slug}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.workspaces }),
  });
}

// ---- Comments (task panel) ----
export function useComments(taskId: string) {
  return useQuery({
    queryKey: qk.comments(taskId),
    // API returns newest-first; the panel renders oldest-first.
    queryFn: async () => [...(await get<Comment[]>(`/tasks/${taskId}/comments?limit=100`))].reverse(),
  });
}

export function useAddComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => post<Comment>(`/tasks/${taskId}/comments`, { message }),
    onSuccess: (c) => qc.setQueryData<Comment[]>(qk.comments(taskId), (old) => [...(old ?? []), c]),
  });
}

export function useEditComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => patch<Comment>(`/comments/${id}`, { message }),
    onSuccess: (c) => qc.setQueryData<Comment[]>(qk.comments(taskId), (old) => old?.map((x) => (x.id === c.id ? c : x)) ?? old),
  });
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/comments/${id}`),
    onSuccess: (_r, id) => qc.setQueryData<Comment[]>(qk.comments(taskId), (old) => old?.filter((x) => x.id !== id) ?? old),
  });
}

// Re-export the low-level verbs for screens still mid-migration.
export { get, post, patch, del };
