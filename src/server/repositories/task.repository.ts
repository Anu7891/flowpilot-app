import { Prisma, type TaskStatus } from '@prisma/client';
import { prisma } from '../db/client';
import { notDeleted, PUBLIC_USER } from '../db/helpers';
import type { CreateTaskDto, UpdateTaskDto } from '../validators/task.schema';

const BASE = {
  id: true, projectId: true, title: true, description: true, status: true, priority: true,
  assigneeId: true, reporterId: true, dueDate: true, estimatedHours: true, position: true,
  createdAt: true, updatedAt: true,
  assignee: { select: PUBLIC_USER },
  reporter: { select: PUBLIC_USER },
} as const;

export const taskRepo = {
  /** Board query - rides the (project_id, status, position) index. Cursor = last position. */
  listByProject: (projectId: string, opts: { status?: TaskStatus; assigneeId?: string; afterPosition?: string; limit: number }) =>
    prisma.task.findMany({
      where: {
        projectId,
        ...notDeleted,
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.assigneeId ? { assigneeId: opts.assigneeId } : {}),
        ...(opts.afterPosition ? { position: { gt: new Prisma.Decimal(opts.afterPosition) } } : {}),
      },
      select: BASE,
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
      take: opts.limit + 1,
    }),

  /** Live task + parent project's workspaceId (tenancy anchor). */
  findLiveById: (id: string) =>
    prisma.task.findFirst({
      where: { id, ...notDeleted },
      select: { ...BASE, project: { select: { id: true, workspaceId: true, deletedAt: true } } },
    }),

  maxPosition: async (projectId: string, status: TaskStatus): Promise<number> => {
    const agg = await prisma.task.aggregate({
      where: { projectId, status, ...notDeleted },
      _max: { position: true },
    });
    return agg._max.position ? Number(agg._max.position) : 0;
  },

  create: (data: CreateTaskDto & { projectId: string; reporterId: string; position: number }) =>
    prisma.task.create({ data, select: BASE }),

  update: (id: string, data: UpdateTaskDto) => prisma.task.update({ where: { id }, data, select: BASE }),

  softDelete: (id: string) =>
    prisma.task.update({ where: { id }, data: { deletedAt: new Date() }, select: { id: true } }),
};
