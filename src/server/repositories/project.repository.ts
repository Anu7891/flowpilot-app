import { prisma } from '../db/client';
import { notDeleted } from '../db/helpers';
import type { ProjectStatus } from '@prisma/client';

const BASE = {
  id: true, workspaceId: true, name: true, description: true, status: true,
  icon: true, archived: true, createdBy: true, createdAt: true, updatedAt: true,
} as const;

export const projectRepo = {
  listByWorkspace: (workspaceId: string, opts: { archived?: boolean } = {}) =>
    prisma.project.findMany({
      where: { workspaceId, ...notDeleted, ...(opts.archived === undefined ? {} : { archived: opts.archived }) },
      select: { ...BASE, _count: { select: { tasks: { where: { deletedAt: null } } } } },
      orderBy: { createdAt: 'asc' },
    }),

  /** Live project + its workspaceId - the tenancy anchor for everything task-side. */
  findLiveById: (id: string) =>
    prisma.project.findFirst({ where: { id, ...notDeleted }, select: BASE }),

  create: (data: { workspaceId: string; name: string; description?: string; icon?: string; createdBy: string }) =>
    prisma.project.create({ data, select: BASE }),

  update: (id: string, data: Partial<{ name: string; description: string | null; icon: string | null; status: ProjectStatus; archived: boolean }>) =>
    prisma.project.update({ where: { id }, data, select: BASE }),

  softDelete: (id: string) =>
    prisma.project.update({ where: { id }, data: { deletedAt: new Date() }, select: { id: true } }),
};
