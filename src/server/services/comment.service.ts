import { commentRepo } from '../repositories/comment.repository';
import { taskRepo } from '../repositories/task.repository';
import { activityRepo } from '../repositories/activity.repository';
import { notificationRepo } from '../repositories/notification.repository';
import { requireMembership, requirePermission } from '../permissions/guard';
import { decodeCursor, afterCursor, page } from '../utils/pagination';
import { forbidden, notFound } from '../utils/errors';
import type { Actor } from '../types/context';
import type { ListQuery } from '../validators/common';
import type { CreateCommentDto, UpdateCommentDto } from '../validators/comment.schema';

async function resolveTaskForComment(actor: Actor, taskId: string) {
  const task = await taskRepo.findLiveById(taskId);
  if (!task || task.project.deletedAt) throw notFound('Task');
  const ctx = await requireMembership(actor, task.project.workspaceId);
  return { task, ctx };
}

async function resolveComment(actor: Actor, commentId: string) {
  const comment = await commentRepo.findLiveById(commentId);
  if (!comment || comment.task.deletedAt || comment.task.project.deletedAt) throw notFound('Comment');
  const ctx = await requireMembership(actor, comment.task.project.workspaceId);
  return { comment, ctx };
}

export const commentService = {
  async list(actor: Actor, taskId: string, q: ListQuery) {
    await resolveTaskForComment(actor, taskId);
    const rows = await commentRepo.listByTask(taskId, { where: afterCursor(decodeCursor(q.cursor)), limit: q.limit });
    return page(rows, q.limit);
  },

  async create(actor: Actor, taskId: string, dto: CreateCommentDto) {
    const { task, ctx } = await resolveTaskForComment(actor, taskId);
    requirePermission(ctx.role, 'comment');
    const comment = await commentRepo.create({ taskId, userId: actor.userId, message: dto.message });
    void activityRepo.log({ workspaceId: task.project.workspaceId, userId: actor.userId, entityType: 'COMMENT', entityId: task.id, action: 'comment.added' });
    // Notify the task's people (reporter + assignee), never the commenter themselves.
    const recipients = new Set([task.reporterId, task.assigneeId].filter((id): id is string => !!id && id !== actor.userId));
    for (const userId of recipients) {
      void notificationRepo.create({ userId, type: 'COMMENT_ADDED', title: `New comment on "${task.title}"`, metadata: { taskId: task.id, commentId: comment.id } });
    }
    return comment;
  },

  async update(actor: Actor, commentId: string, dto: UpdateCommentDto) {
    const { comment } = await resolveComment(actor, commentId);
    if (comment.userId !== actor.userId) throw forbidden('Only the author can edit a comment.');
    return commentRepo.update(comment.id, dto.message);
  },

  /** Author may always delete their own; ADMIN/OWNER may moderate any. */
  async softDelete(actor: Actor, commentId: string) {
    const { comment, ctx } = await resolveComment(actor, commentId);
    const isAuthor = comment.userId === actor.userId;
    const isModerator = ctx.role === 'OWNER' || ctx.role === 'ADMIN';
    if (!isAuthor && !isModerator) throw forbidden('Only the author or an admin can delete a comment.');
    await commentRepo.softDelete(comment.id);
  },
};
