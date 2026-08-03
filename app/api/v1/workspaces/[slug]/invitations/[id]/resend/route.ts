import { route, ok } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { invitationService } from '@/src/server/services/invitation.service';

type P = { slug: string; id: string };

export const POST = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  return ok(await invitationService.resend(actor, params.slug, params.id));
});
