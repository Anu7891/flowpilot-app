import { route, ok } from '@/src/server/utils/http';
import { getSessionUserId } from '@/src/server/auth/session';
import { userRepo } from '@/src/server/repositories/user.repository';

export const GET = route(async () => {
  const userId = await getSessionUserId();
  // Own-session shape includes lastWorkspaceId (never exposed for other users).
  const user = userId ? await userRepo.findSessionById(userId) : null;
  return ok({ user });
});
