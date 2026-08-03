import { route, ok, parseBody } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { markReadSchema } from '@/src/server/validators/notification.schema';
import { notificationService } from '@/src/server/services/notification.service';

export const POST = route(async (req) => {
  const actor = await requireUser();
  const dto = await parseBody(req, markReadSchema);
  return ok(await notificationService.markRead(actor, dto));
});
