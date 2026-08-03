import { route, ok, noContent, parseBody } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { updateWorkspaceSchema } from '@/src/server/validators/workspace.schema';
import { workspaceService } from '@/src/server/services/workspace.service';

type P = { slug: string };

export const GET = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  return ok(await workspaceService.get(actor, params.slug));
});

export const PATCH = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const dto = await parseBody(req, updateWorkspaceSchema);
  return ok(await workspaceService.update(actor, params.slug, dto));
});

export const DELETE = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  await workspaceService.softDelete(actor, params.slug);
  return noContent();
});
