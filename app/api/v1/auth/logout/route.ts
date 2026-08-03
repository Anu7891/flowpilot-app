import { route, noContent } from '@/src/server/utils/http';
import { destroySession } from '@/src/server/auth/session';

export const POST = route(async () => {
  destroySession();
  return noContent();
});
