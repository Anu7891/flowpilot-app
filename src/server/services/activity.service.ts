import { activityRepo } from '../repositories/activity.repository';
import { workspaceService } from './workspace.service';
import { decodeCursor, afterCursor, page } from '../utils/pagination';
import type { Actor } from '../types/context';
import type { ListQuery } from '../validators/common';

export const activityService = {
  async list(actor: Actor, slug: string, q: ListQuery) {
    const { workspace } = await workspaceService.resolveMember(actor, slug);
    const rows = await activityRepo.listByWorkspace(workspace.id, { where: afterCursor(decodeCursor(q.cursor)), limit: q.limit });
    return page(rows, q.limit);
  },
};
