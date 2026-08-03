import { route, noContent } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { invitationService } from '@/src/server/services/invitation.service';

type P = { slug: string; id: string };

export const DELETE = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  await invitationService.revoke(actor, params.slug, params.id);
  return noContent();
});
