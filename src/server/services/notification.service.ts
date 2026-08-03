import { notificationRepo } from '../repositories/notification.repository';
import { decodeCursor, afterCursor, page } from '../utils/pagination';
import type { Actor } from '../types/context';
import type { MarkReadDto } from '../validators/notification.schema';

export const notificationService = {
  async list(actor: Actor, q: { unreadOnly?: boolean; cursor?: string; limit: number }) {
    const rows = await notificationRepo.listForUser(actor.userId, {
      unreadOnly: q.unreadOnly, where: afterCursor(decodeCursor(q.cursor)), limit: q.limit,
    });
    const { items, nextCursor } = page(rows, q.limit);
    const unreadCount = await notificationRepo.unreadCount(actor.userId);
    return { items, nextCursor, unreadCount };
  },

  async markRead(actor: Actor, dto: MarkReadDto) {
    const result = 'all' in dto
      ? await notificationRepo.markAllRead(actor.userId)
      : await notificationRepo.markRead(actor.userId, dto.ids); // scoped to own rows by design
    return { updated: result.count };
  },
};
