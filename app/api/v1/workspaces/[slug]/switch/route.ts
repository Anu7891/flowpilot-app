import { route, ok } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { workspaceService } from '@/src/server/services/workspace.service';

type P = { slug: string };

export const POST = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  return ok(await workspaceService.switch(actor, params.slug));
});
