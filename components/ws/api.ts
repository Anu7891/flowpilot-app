'use client';

/** Thin client for the FlowPilot v1 API. Unwraps the { data } / { error } envelope. */
export class ApiError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  });
  if (res.status === 204) return undefined as T;
  let body: any = null;
  try { body = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    throw new ApiError(body?.error?.message ?? 'Something went wrong.', body?.error?.code, res.status);
  }
  return body?.data as T;
}

export const get = <T>(p: string) => api<T>(p);
export const post = <T>(p: string, body?: unknown) =>
  api<T>(p, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
export const patch = <T>(p: string, body: unknown) =>
  api<T>(p, { method: 'PATCH', body: JSON.stringify(body) });
export const del = (p: string) => api<void>(p, { method: 'DELETE' });

// ---- Shared types ----
export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';

export type WorkspaceSummary = {
  id: string; name: string; slug: string; logo: string | null;
  color: string | null; icon: string | null; archivedAt: string | null; role: Role;
};

export type PublicUser = {
  id: string; name: string; email: string; avatar: string | null; lastActiveAt: string | null; createdAt: string;
};

export type Member = { id: string; role: Role; joinedAt: string; user: PublicUser };

export type Invitation = {
  id: string; workspaceId: string; email: string; role: Role;
  status: InvitationStatus; expiresAt: string; createdAt: string;
  inviter: PublicUser | null;
};

export type Settings = {
  workspaceId: string; timezone: string; dateFormat: string;
  defaultView: string; notificationPrefs: Record<string, boolean>; updatedAt: string;
};

// ---- Projects & Tasks (Phase 5) ----
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELED';
export type TaskPriority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type Project = {
  id: string; workspaceId: string; name: string; description: string | null;
  status: ProjectStatus; icon: string | null; archived: boolean;
  createdBy: string; createdAt: string; updatedAt: string;
  _count?: { tasks: number };
};

export type Task = {
  id: string; projectId: string; title: string; description: string | null;
  status: TaskStatus; priority: TaskPriority;
  assigneeId: string | null; reporterId: string;
  dueDate: string | null; estimatedHours: number | null; position: string | number;
  createdAt: string; updatedAt: string;
  assignee: PublicUser | null; reporter: PublicUser | null;
};

export type Comment = {
  id: string; taskId: string; message: string;
  createdAt: string; updatedAt: string; user: PublicUser;
};

export const TASK_STATUSES: { key: TaskStatus; label: string }[] = [
  { key: 'BACKLOG', label: 'Backlog' },
  { key: 'TODO', label: 'To do' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'IN_REVIEW', label: 'In review' },
  { key: 'DONE', label: 'Done' },
  { key: 'CANCELED', label: 'Canceled' },
];

export const TASK_PRIORITIES: { key: TaskPriority; label: string }[] = [
  { key: 'NONE', label: 'None' },
  { key: 'LOW', label: 'Low' },
  { key: 'MEDIUM', label: 'Medium' },
  { key: 'HIGH', label: 'High' },
  { key: 'URGENT', label: 'Urgent' },
];
