import { route, ok, noContent, parseBody } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { updateProjectSchema } from '@/src/server/validators/project.schema';
import { projectService } from '@/src/server/services/project.service';

type P = { id: string };

export const GET = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  return ok(await projectService.get(actor, params.id));
});

export const PATCH = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const dto = await parseBody(req, updateProjectSchema);
  return ok(await projectService.update(actor, params.id, dto));
});

export const DELETE = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  await projectService.softDelete(actor, params.id);
  return noContent();
});
