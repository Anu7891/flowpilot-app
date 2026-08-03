import { route, ok, noContent, parseBody } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { updateCommentSchema } from '@/src/server/validators/comment.schema';
import { commentService } from '@/src/server/services/comment.service';

type P = { id: string };

export const PATCH = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const dto = await parseBody(req, updateCommentSchema);
  return ok(await commentService.update(actor, params.id, dto));
});

export const DELETE = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  await commentService.softDelete(actor, params.id);
  return noContent();
});
