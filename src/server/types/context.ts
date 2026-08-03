import type { WorkspaceRole } from '@prisma/client';

/** The authenticated actor for a request. */
export type Actor = { userId: string };

/** Actor + resolved workspace membership. */
export type MemberContext = Actor & { workspaceId: string; role: WorkspaceRole };
