import { route, ok, created, parseBody } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { createWorkspaceSchema } from '@/src/server/validators/workspace.schema';
import { workspaceService } from '@/src/server/services/workspace.service';

export const GET = route(async () => {
  const actor = await requireUser();
  return ok(await workspaceService.listForUser(actor));
});

export const POST = route(async (req) => {
  const actor = await requireUser();
  const dto = await parseBody(req, createWorkspaceSchema);
  return created(await workspaceService.create(actor, dto));
});
