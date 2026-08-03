import { settingsRepo } from '../repositories/settings.repository';
import { activityRepo } from '../repositories/activity.repository';
import { requirePermission } from '../permissions/guard';
import { workspaceService } from './workspace.service';
import type { Actor } from '../types/context';
import type { UpdateSettingsDto } from '../validators/settings.schema';

export const settingsService = {
  /** Any member can read settings (timezone/date format affect rendering for everyone). */
  async get(actor: Actor, slug: string) {
    const { workspace } = await workspaceService.resolveMember(actor, slug);
    return settingsRepo.getOrCreate(workspace.id);
  },

  async update(actor: Actor, slug: string, dto: UpdateSettingsDto) {
    const { workspace, ctx } = await workspaceService.resolveMember(actor, slug);
    requirePermission(ctx.role, 'update_workspace');
    const updated = await settingsRepo.update(workspace.id, dto);
    void activityRepo.log({ workspaceId: workspace.id, userId: actor.userId, entityType: 'WORKSPACE', entityId: workspace.id, action: 'workspace.settings_updated', metadata: dto });
    return updated;
  },
};
