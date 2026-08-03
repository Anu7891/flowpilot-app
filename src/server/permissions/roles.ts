import { WorkspaceRole } from '@prisma/client';

export const PERMISSIONS = [
  'view',
  'comment',
  'create_task',
  'edit_task',
  'delete_task',
  'create_project',
  'delete_project',
  'manage_members',
  'update_workspace', // Phase 4: split from manage_workspace - Owner + Admin
  'delete_workspace', // Phase 4: Owner only
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: readonly Permission[] = PERMISSIONS;

/**
 * Static role -> permission matrix (Phase 4 v2).
 * MEMBER's delete_task is narrowed to "own tasks" as a resource rule in task.service.
 */
const MATRIX: Record<WorkspaceRole, ReadonlySet<Permission>> = {
  OWNER: new Set(ALL),
  ADMIN: new Set(ALL.filter((p) => p !== 'delete_workspace')),
  MEMBER: new Set<Permission>(['view', 'comment', 'create_task', 'edit_task', 'delete_task', 'create_project']),
  GUEST: new Set<Permission>(['view', 'comment']),
};

export const can = (role: WorkspaceRole, permission: Permission): boolean => MATRIX[role].has(permission);
