import { prisma } from '../db/client';
import { notDeleted } from '../db/helpers';

const BASE = {
  id: true, name: true, slug: true, ownerId: true, logo: true,
  color: true, icon: true, archivedAt: true, createdAt: true, updatedAt: true,
} as const;

export const workspaceRepo = {
  /** Live workspace by slug (soft-deleted rows are invisible). */
  findLiveBySlug: (slug: string) =>
    prisma.workspace.findFirst({ where: { slug, ...notDeleted }, select: BASE }),

  /** Any row holding the slug, incl. soft-deleted - used for availability checks. */
  slugTaken: async (slug: string) => (await prisma.workspace.count({ where: { slug } })) > 0,

  findManyForUser: (userId: string) =>
    prisma.workspace.findMany({
      where: { ...notDeleted, members: { some: { userId } } },
      select: { ...BASE, members: { where: { userId }, select: { role: true } } },
      orderBy: { createdAt: 'asc' },
    }),

  /** Workspace + OWNER membership + first activity row, atomically. */
  createWithOwner: (data: { name: string; slug: string; ownerId: string }) =>
    prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({ data, select: BASE });
      await tx.workspaceMember.create({
        data: { workspaceId: ws.id, userId: data.ownerId, role: 'OWNER' },
      });
      await tx.activityLog.create({
        data: { workspaceId: ws.id, userId: data.ownerId, entityType: 'WORKSPACE', entityId: ws.id, action: 'workspace.created' },
      });
      return ws;
    }),

  update: (id: string, data: { name?: string; slug?: string; logo?: string | null; color?: string | null; icon?: string | null; archivedAt?: Date | null }) =>
    prisma.workspace.update({ where: { id }, data, select: BASE }),

  softDelete: (id: string) =>
    prisma.workspace.update({ where: { id }, data: { deletedAt: new Date() }, select: { id: true } }),
};
