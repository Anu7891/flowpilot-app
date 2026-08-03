import { route, ok, query } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { listQuerySchema } from '@/src/server/validators/common';
import { activityService } from '@/src/server/services/activity.service';

type P = { slug: string };

export const GET = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const q = listQuerySchema.parse(Object.fromEntries(query(req)));
  const { items, nextCursor } = await activityService.list(actor, params.slug, q);
  return ok(items, { nextCursor });
});
