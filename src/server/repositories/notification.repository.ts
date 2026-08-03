import { prisma } from '../db/client';
import type { NotificationType, Prisma } from '@prisma/client';

export const notificationRepo = {
  listForUser: (userId: string, opts: { unreadOnly?: boolean; where?: object; limit: number }) =>
    prisma.notification.findMany({
      where: { userId, ...(opts.unreadOnly ? { isRead: false } : {}), ...(opts.where ?? {}) },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: opts.limit + 1,
    }),

  unreadCount: (userId: string) => prisma.notification.count({ where: { userId, isRead: false } }),

  markRead: (userId: string, ids: string[]) =>
    prisma.notification.updateMany({ where: { userId, id: { in: ids } }, data: { isRead: true } }),

  markAllRead: (userId: string) =>
    prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } }),

  create: (data: { userId: string; type: NotificationType; title: string; description?: string; metadata?: Prisma.InputJsonValue }) =>
    prisma.notification.create({ data }),

  /** Fan-out to many users (e.g. workspace archived). */
  createMany: (rows: { userId: string; type: NotificationType; title: string; description?: string; metadata?: Prisma.InputJsonValue }[]) =>
    prisma.notification.createMany({ data: rows }),
};
