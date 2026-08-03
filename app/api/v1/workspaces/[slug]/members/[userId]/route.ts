import { route, ok, noContent, parseBody } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { updateMemberSchema } from '@/src/server/validators/workspace.schema';
import { workspaceService } from '@/src/server/services/workspace.service';

type P = { slug: string; userId: string };

export const PATCH = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const dto = await parseBody(req, updateMemberSchema);
  return ok(await workspaceService.updateMemberRole(actor, params.slug, params.userId, dto));
});

export const DELETE = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  await workspaceService.removeMember(actor, params.slug, params.userId);
  return noContent();
});
