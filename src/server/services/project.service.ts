import { projectRepo } from '../repositories/project.repository';
import { activityRepo } from '../repositories/activity.repository';
import { requireMembership, requirePermission } from '../permissions/guard';
import { workspaceService } from './workspace.service';
import { notFound } from '../utils/errors';
import type { Actor, MemberContext } from '../types/context';
import type { CreateProjectDto, UpdateProjectDto } from '../validators/project.schema';

/** id -> live project + verified membership on its workspace (cross-tenant ids look like 404s). */
async function resolveProject(actor: Actor, projectId: string) {
  const project = await projectRepo.findLiveById(projectId);
  if (!project) throw notFound('Project');
  const ctx: MemberContext = await requireMembership(actor, project.workspaceId);
  return { project, ctx };
}

export const projectService = {
  resolveProject,

  async list(actor: Actor, slug: string, opts: { archived?: boolean } = {}) {
    const { workspace } = await workspaceService.resolveMember(actor, slug);
    return projectRepo.listByWorkspace(workspace.id, opts);
  },

  async create(actor: Actor, slug: string, dto: CreateProjectDto) {
    const { workspace, ctx } = await workspaceService.resolveMember(actor, slug);
    requirePermission(ctx.role, 'create_project');
    const project = await projectRepo.create({ ...dto, workspaceId: workspace.id, createdBy: actor.userId });
    void activityRepo.log({ workspaceId: workspace.id, userId: actor.userId, entityType: 'PROJECT', entityId: project.id, action: 'project.created', metadata: { name: project.name } });
    return project;
  },

  async get(actor: Actor, projectId: string) {
    const { project } = await resolveProject(actor, projectId);
    return project;
  },

  async update(actor: Actor, projectId: string, dto: UpdateProjectDto) {
    const { project, ctx } = await resolveProject(actor, projectId);
    requirePermission(ctx.role, 'create_project'); // edit rights follow create rights in v1
    const updated = await projectRepo.update(project.id, dto);
    void activityRepo.log({ workspaceId: project.workspaceId, userId: actor.userId, entityType: 'PROJECT', entityId: project.id, action: 'project.updated', metadata: dto });
    return updated;
  },

  async softDelete(actor: Actor, projectId: string) {
    const { project, ctx } = await resolveProject(actor, projectId);
    requirePermission(ctx.role, 'delete_project');
    await projectRepo.softDelete(project.id);
    void activityRepo.log({ workspaceId: project.workspaceId, userId: actor.userId, entityType: 'PROJECT', entityId: project.id, action: 'project.deleted', metadata: { name: project.name } });
  },
};
