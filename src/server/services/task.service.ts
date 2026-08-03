import { taskRepo } from '../repositories/task.repository';
import { activityRepo } from '../repositories/activity.repository';
import { notificationRepo } from '../repositories/notification.repository';
import { memberRepo } from '../repositories/member.repository';
import { requireMembership, requirePermission } from '../permissions/guard';
import { projectService } from './project.service';
import { forbidden, notFound } from '../utils/errors';
import type { Actor } from '../types/context';
import type { CreateTaskDto, ListTasksQuery, UpdateTaskDto } from '../validators/task.schema';

const POSITION_GAP = 1024;

async function resolveTask(actor: Actor, taskId: string) {
  const task = await taskRepo.findLiveById(taskId);
  if (!task || task.project.deletedAt) throw notFound('Task');
  const ctx = await requireMembership(actor, task.project.workspaceId);
  return { task, ctx };
}

export const taskService = {
  async list(actor: Actor, projectId: string, q: ListTasksQuery) {
    await projectService.resolveProject(actor, projectId); // membership check
    const rows = await taskRepo.listByProject(projectId, {
      status: q.status, assigneeId: q.assigneeId, afterPosition: q.cursor, limit: q.limit,
    });
    const items = rows.slice(0, q.limit);
    const nextCursor = rows.length > q.limit ? String(items[items.length - 1].position) : null;
    return { items, nextCursor };
  },

  async create(actor: Actor, projectId: string, dto: CreateTaskDto) {
    const { project, ctx } = await projectService.resolveProject(actor, projectId);
    requirePermission(ctx.role, 'create_task');
    if (dto.assigneeId && !(await memberRepo.find(project.workspaceId, dto.assigneeId))) {
      throw notFound('Assignee'); // assignee must belong to the same workspace
    }
    const position = (await taskRepo.maxPosition(projectId, dto.status)) + POSITION_GAP;
    const task = await taskRepo.create({ ...dto, projectId, reporterId: actor.userId, position });
    void activityRepo.log({ workspaceId: project.workspaceId, userId: actor.userId, entityType: 'TASK', entityId: task.id, action: 'task.created', metadata: { title: task.title } });
    if (task.assigneeId && task.assigneeId !== actor.userId) {
      void notificationRepo.create({ userId: task.assigneeId, type: 'TASK_ASSIGNED', title: `You were assigned "${task.title}"`, metadata: { taskId: task.id, projectId } });
    }
    return task;
  },

  async get(actor: Actor, taskId: string) {
    const { task } = await resolveTask(actor, taskId);
    return task;
  },

  async update(actor: Actor, taskId: string, dto: UpdateTaskDto) {
    const { task, ctx } = await resolveTask(actor, taskId);
    requirePermission(ctx.role, 'edit_task');
    if (dto.assigneeId && !(await memberRepo.find(task.project.workspaceId, dto.assigneeId))) {
      throw notFound('Assignee');
    }
    const moved = dto.status !== undefined || dto.position !== undefined;
    const updated = await taskRepo.update(task.id, dto);
    void activityRepo.log({
      workspaceId: task.project.workspaceId, userId: actor.userId, entityType: 'TASK', entityId: task.id,
      action: moved && dto.status && dto.status !== task.status ? 'task.status_changed' : moved ? 'task.moved' : 'task.updated',
      metadata: { from: task.status, to: updated.status },
    });
    if (dto.assigneeId && dto.assigneeId !== task.assigneeId && dto.assigneeId !== actor.userId) {
      void notificationRepo.create({ userId: dto.assigneeId, type: 'TASK_ASSIGNED', title: `You were assigned "${updated.title}"`, metadata: { taskId: task.id } });
    }
    return updated;
  },

  async softDelete(actor: Actor, taskId: string) {
    const { task, ctx } = await resolveTask(actor, taskId);
    requirePermission(ctx.role, 'delete_task');
    // Resource rule: MEMBERs may only delete tasks they reported. ADMIN/OWNER delete any.
    if (ctx.role === 'MEMBER' && task.reporterId !== actor.userId) {
      throw forbidden('You can only delete tasks you created.');
    }
    await taskRepo.softDelete(task.id);
    void activityRepo.log({ workspaceId: task.project.workspaceId, userId: actor.userId, entityType: 'TASK', entityId: task.id, action: 'task.deleted', metadata: { title: task.title } });
  },
};
