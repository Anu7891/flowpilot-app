import { prisma } from '../db/client';
import { PUBLIC_USER } from '../db/helpers';
import type { InvitationStatus, WorkspaceRole } from '@prisma/client';

const BASE = {
  id: true, workspaceId: true, email: true, role: true, status: true,
  expiresAt: true, createdAt: true,
  inviter: { select: PUBLIC_USER },
} as const;

export const invitationRepo = {
  listByWorkspace: (workspaceId: string, status?: InvitationStatus) =>
    prisma.workspaceInvitation.findMany({
      where: { workspaceId, ...(status ? { status } : {}) },
      select: BASE,
      orderBy: { createdAt: 'desc' },
    }),

  findPending: (workspaceId: string, email: string) =>
    prisma.workspaceInvitation.findFirst({ where: { workspaceId, email, status: 'PENDING' } }),

  findById: (id: string) => prisma.workspaceInvitation.findUnique({ select: { ...BASE, token: true }, where: { id } }),

  /** Token-side lookup: includes workspace preview data for the public accept page. */
  findByToken: (token: string) =>
    prisma.workspaceInvitation.findUnique({
      where: { token },
      select: {
        ...BASE, token: true,
        workspace: { select: { id: true, name: true, slug: true, logo: true, color: true, icon: true, deletedAt: true, archivedAt: true } },
      },
    }),

  create: (data: { workspaceId: string; email: string; token: string; role: WorkspaceRole; invitedBy: string; expiresAt: Date }) =>
    prisma.workspaceInvitation.create({ data, select: { ...BASE, token: true } }),

  setStatus: (id: string, status: InvitationStatus) =>
    prisma.workspaceInvitation.update({ where: { id }, data: { status }, select: BASE }),

  /** Resend = new token + fresh expiry; old link dies with the old token. */
  refresh: (id: string, token: string, expiresAt: Date) =>
    prisma.workspaceInvitation.update({ where: { id }, data: { token, expiresAt, status: 'PENDING' }, select: { ...BASE, token: true } }),
};
