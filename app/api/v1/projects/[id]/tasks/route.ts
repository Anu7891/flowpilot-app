import { route, ok, created, parseBody, query } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { createTaskSchema, listTasksQuerySchema } from '@/src/server/validators/task.schema';
import { taskService } from '@/src/server/services/task.service';

type P = { id: string };

export const GET = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const q = listTasksQuerySchema.parse(Object.fromEntries(query(req)));
  const { items, nextCursor } = await taskService.list(actor, params.id, q);
  return ok(items, { nextCursor });
});

export const POST = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const dto = await parseBody(req, createTaskSchema);
  return created(await taskService.create(actor, params.id, dto));
});
