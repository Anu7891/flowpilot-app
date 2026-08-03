import { route, ok, created, parseBody } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { inviteMemberSchema } from '@/src/server/validators/workspace.schema';
import { workspaceService } from '@/src/server/services/workspace.service';

type P = { slug: string };

export const GET = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  return ok(await workspaceService.listMembers(actor, params.slug));
});

export const POST = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const dto = await parseBody(req, inviteMemberSchema);
  return created(await workspaceService.inviteMember(actor, params.slug, dto));
});
