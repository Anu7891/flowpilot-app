import { prisma } from '../db/client';

const BASE = { workspaceId: true, timezone: true, dateFormat: true, defaultView: true, notificationPrefs: true, updatedAt: true } as const;

export const settingsRepo = {
  /** Lazy-create on first read - existing workspaces need no backfill. */
  getOrCreate: (workspaceId: string) =>
    prisma.workspaceSettings.upsert({ where: { workspaceId }, update: {}, create: { workspaceId }, select: BASE }),

  update: (workspaceId: string, data: { timezone?: string; dateFormat?: string; defaultView?: string; notificationPrefs?: Record<string, boolean> }) =>
    prisma.workspaceSettings.upsert({ where: { workspaceId }, update: data, create: { workspaceId, ...data }, select: BASE }),
};
