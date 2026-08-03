import { route, ok, created, parseBody, query } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { listQuerySchema } from '@/src/server/validators/common';
import { createCommentSchema } from '@/src/server/validators/comment.schema';
import { commentService } from '@/src/server/services/comment.service';

type P = { id: string };

export const GET = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const q = listQuerySchema.parse(Object.fromEntries(query(req)));
  const { items, nextCursor } = await commentService.list(actor, params.id, q);
  return ok(items, { nextCursor });
});

export const POST = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const dto = await parseBody(req, createCommentSchema);
  return created(await commentService.create(actor, params.id, dto));
});
