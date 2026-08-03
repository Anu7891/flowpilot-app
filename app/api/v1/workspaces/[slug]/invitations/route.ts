import { route, ok, created, parseBody, query } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { createInvitationSchema, listInvitationsQuerySchema } from '@/src/server/validators/invitation.schema';
import { invitationService } from '@/src/server/services/invitation.service';

type P = { slug: string };

export const GET = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const { status } = listInvitationsQuerySchema.parse({ status: query(req).get('status') ?? undefined });
  return ok(await invitationService.list(actor, params.slug, status));
});

export const POST = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const dto = await parseBody(req, createInvitationSchema);
  return created(await invitationService.create(actor, params.slug, dto));
});
