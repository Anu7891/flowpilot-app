/**
 * Single source of truth for FlowPilot's enum string values.
 *
 * Dependency-free ON PURPOSE — imports neither Prisma nor Zod — so it is safe
 * to pull into the client bundle *and* the server validators. Prisma still owns
 * the database enums; `src/server/enum-parity.ts` asserts at compile time that
 * these tuples stay identical to Prisma's, so the two can never drift apart.
 */

export const WORKSPACE_ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'GUEST'] as const;
export type Role = (typeof WORKSPACE_ROLES)[number];

/** Roles that can be invited/assigned — OWNER is never one of these. */
export const ASSIGNABLE_ROLES = ['ADMIN', 'MEMBER', 'GUEST'] as const;

export const PROJECT_STATUS_VALUES = ['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED'] as const;
export type ProjectStatus = (typeof PROJECT_STATUS_VALUES)[number];

export const TASK_STATUS_VALUES = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'] as const;
export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];

export const TASK_PRIORITY_VALUES = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type TaskPriority = (typeof TASK_PRIORITY_VALUES)[number];

export const INVITATION_STATUS_VALUES = ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'REVOKED'] as const;
export type InvitationStatus = (typeof INVITATION_STATUS_VALUES)[number];
