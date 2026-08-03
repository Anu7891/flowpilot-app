import { z } from 'zod';
import { route, ok, query } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { notificationService } from '@/src/server/services/notification.service';

const listSchema = z.object({
  unreadOnly: z.coerce.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const GET = route(async (req) => {
  const actor = await requireUser();
  const q = listSchema.parse(Object.fromEntries(query(req)));
  const { items, nextCursor, unreadCount } = await notificationService.list(actor, q);
  return ok(items, { nextCursor, unreadCount });
});
