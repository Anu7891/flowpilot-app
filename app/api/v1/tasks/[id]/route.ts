import { route, ok, noContent, parseBody } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { updateTaskSchema } from '@/src/server/validators/task.schema';
import { taskService } from '@/src/server/services/task.service';

type P = { id: string };

export const GET = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  return ok(await taskService.get(actor, params.id));
});

/** Doubles as the drag-and-drop move endpoint: send { status, position }. */
export const PATCH = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const dto = await parseBody(req, updateTaskSchema);
  return ok(await taskService.update(actor, params.id, dto));
});

export const DELETE = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  await taskService.softDelete(actor, params.id);
  return noContent();
});
