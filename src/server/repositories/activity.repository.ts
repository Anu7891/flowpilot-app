import { prisma } from '../db/client';
import { PUBLIC_USER } from '../db/helpers';
import type { EntityType, Prisma } from '@prisma/client';

export const activityRepo = {
  /** Fire-and-forget style append; failures are logged, never break the main flow. */
  log: async (entry: {
    workspaceId: string; userId: string; entityType: EntityType; entityId: string;
    action: string; metadata?: Prisma.InputJsonValue;
  }) => {
    try {
      await prisma.activityLog.create({ data: entry });
    } catch (e) {
      console.error('[activity] failed to record', entry.action, e);
    }
  },

  listByWorkspace: (workspaceId: string, opts: { where?: object; limit: number }) =>
    prisma.activityLog.findMany({
      where: { workspaceId, ...(opts.where ?? {}) },
      include: { user: { select: PUBLIC_USER } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: opts.limit + 1,
    }),
};
