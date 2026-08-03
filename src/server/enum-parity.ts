/**
 * Compile-time guard: the dependency-free enum tuples in `src/shared/enums.ts`
 * MUST match Prisma's generated DB enums exactly. If anyone edits the Prisma
 * schema (or the shared tuples) and they fall out of sync, `tsc` fails here —
 * long before a bad value can reach the database or the client.
 *
 * This file has no runtime output; it exists purely for its type assertions.
 */
import type {
  WorkspaceRole as PWorkspaceRole,
  ProjectStatus as PProjectStatus,
  TaskStatus as PTaskStatus,
  TaskPriority as PTaskPriority,
  InvitationStatus as PInvitationStatus,
} from '@prisma/client';
import type { Role, ProjectStatus, TaskStatus, TaskPriority, InvitationStatus } from '@/src/shared/enums';

type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Expect<T extends true> = T;

// Each line errors if the shared union and the Prisma enum are not identical.
export type _RoleParity = Expect<Equal<Role, PWorkspaceRole>>;
export type _ProjectStatusParity = Expect<Equal<ProjectStatus, PProjectStatus>>;
export type _TaskStatusParity = Expect<Equal<TaskStatus, PTaskStatus>>;
export type _TaskPriorityParity = Expect<Equal<TaskPriority, PTaskPriority>>;
export type _InvitationStatusParity = Expect<Equal<InvitationStatus, PInvitationStatus>>;
