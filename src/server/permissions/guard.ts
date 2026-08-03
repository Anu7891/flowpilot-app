import type { WorkspaceRole } from '@prisma/client';
import { prisma } from '../db/client';
import { getSessionUserId } from '../auth/session';
import { forbidden, notFound, unauthorized } from '../utils/errors';
import { can, type Permission } from './roles';
import type { Actor, MemberContext } from '../types/context';

/** AuthN: valid session or 401. */
export async function requireUser(): Promise<Actor> {
  const userId = await getSessionUserId();
  if (!userId) throw unauthorized();
  return { userId };
}

/**
 * AuthZ step 1: actor must be a member of the workspace.
 * Non-members get 404 (not 403) - existence of a workspace is itself tenant data.
 */
export async function requireMembership(actor: Actor, workspaceId: string): Promise<MemberContext> {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: actor.userId } },
    select: { role: true },
  });
  if (!member) throw notFound('Workspace');
  return { userId: actor.userId, workspaceId, role: member.role };
}

/** AuthZ step 2: role must grant the permission, else 403. */
export function requirePermission(role: WorkspaceRole, permission: Permission): void {
  if (!can(role, permission)) throw forbidden();
}
