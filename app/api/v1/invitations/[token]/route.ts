import { route, ok } from '@/src/server/utils/http';
import { invitationService } from '@/src/server/services/invitation.service';

type P = { token: string };

/** Public preview — token possession is the capability, so no auth required. */
export const GET = route<P>(async (_req, { params }) => {
  return ok(await invitationService.preview(params.token));
});
