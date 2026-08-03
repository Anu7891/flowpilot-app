import { prisma } from '../db/client';
import { PUBLIC_USER } from '../db/helpers';
import type { WorkspaceRole } from '@prisma/client';

const WITH_USER = { id: true, role: true, joinedAt: true, invitedBy: true, user: { select: PUBLIC_USER } } as const;

export const memberRepo = {
  listByWorkspace: (workspaceId: string) =>
    prisma.workspaceMember.findMany({ where: { workspaceId }, select: WITH_USER, orderBy: { joinedAt: 'asc' } }),

  find: (workspaceId: string, userId: string) =>
    prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { id: true, role: true, userId: true },
    }),

  add: (data: { workspaceId: string; userId: string; role: WorkspaceRole; invitedBy: string }) =>
    prisma.workspaceMember.create({ data, select: WITH_USER }),

  updateRole: (workspaceId: string, userId: string, role: WorkspaceRole) =>
    prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId } },
      data: { role },
      select: WITH_USER,
    }),

  remove: (workspaceId: string, userId: string) =>
    prisma.workspaceMember.delete({ where: { workspaceId_userId: { workspaceId, userId } } }),
};
