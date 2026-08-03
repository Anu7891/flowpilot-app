import { prisma } from '../db/client';
import { PUBLIC_USER } from '../db/helpers';
import type { AuthProvider } from '@prisma/client';

/** Data access only. passwordHash stays inside this module's callers (auth.service). */
export const userRepo = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  findPublicById: (id: string) => prisma.user.findUnique({ where: { id }, select: PUBLIC_USER }),

  create: (data: { name: string; email: string; passwordHash: string; provider?: AuthProvider }) =>
    prisma.user.create({ data, select: PUBLIC_USER }),

  /** Own-session shape: public fields + private preferences (never for other users). */
  findSessionById: (id: string) =>
    prisma.user.findUnique({ where: { id }, select: { ...PUBLIC_USER, lastWorkspaceId: true } }),

  touchActivity: (id: string, lastWorkspaceId?: string) =>
    prisma.user.update({
      where: { id },
      data: { lastActiveAt: new Date(), ...(lastWorkspaceId ? { lastWorkspaceId } : {}) },
      select: { id: true },
    }),
};
