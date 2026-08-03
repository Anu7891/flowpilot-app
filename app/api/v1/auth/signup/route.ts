import { route, created, parseBody } from '@/src/server/utils/http';
import { signupSchema } from '@/src/server/validators/auth.schema';
import { authService } from '@/src/server/services/auth.service';
import { createSession } from '@/src/server/auth/session';
import { allowRequest } from '@/src/server/utils/ratelimit';
import { rateLimited } from '@/src/server/utils/errors';

export const POST = route(async (req) => {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  if (!allowRequest(`signup:${ip}`, 10, 60_000)) throw rateLimited();
  const dto = await parseBody(req, signupSchema);
  const user = await authService.signup(dto);
  await createSession(user.id);
  return created({ user });
});
