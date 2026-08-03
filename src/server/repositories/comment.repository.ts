import { prisma } from '../db/client';
import { notDeleted, PUBLIC_USER } from '../db/helpers';

const BASE = { id: true, taskId: true, message: true, createdAt: true, updatedAt: true, user: { select: PUBLIC_USER } } as const;

export const commentRepo = {
  listByTask: (taskId: string, opts: { where?: object; limit: number }) =>
    prisma.comment.findMany({
      where: { taskId, ...notDeleted, ...(opts.where ?? {}) },
      select: BASE,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: opts.limit + 1,
    }),

  /** Live comment + full tenancy chain (comment -> task -> project -> workspace). */
  findLiveById: (id: string) =>
    prisma.comment.findFirst({
      where: { id, ...notDeleted },
      select: {
        ...BASE, userId: true,
        task: { select: { id: true, deletedAt: true, project: { select: { workspaceId: true, deletedAt: true } } } },
      },
    }),

  create: (data: { taskId: string; userId: string; message: string }) =>
    prisma.comment.create({ data, select: BASE }),

  update: (id: string, message: string) =>
    prisma.comment.update({ where: { id }, data: { message }, select: BASE }),

  /** Tombstone - thread keeps its shape, UI shows "message deleted". */
  softDelete: (id: string) =>
    prisma.comment.update({ where: { id }, data: { deletedAt: new Date() }, select: { id: true } }),
};
