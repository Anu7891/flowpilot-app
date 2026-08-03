import { route, ok, parseBody } from '@/src/server/utils/http';
import { loginSchema } from '@/src/server/validators/auth.schema';
import { authService } from '@/src/server/services/auth.service';
import { createSession } from '@/src/server/auth/session';
import { allowRequest } from '@/src/server/utils/ratelimit';
import { rateLimited } from '@/src/server/utils/errors';

export const POST = route(async (req) => {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  const dto = await parseBody(req, loginSchema);
  if (!allowRequest(`login:${ip}:${dto.email}`, 5, 60_000)) throw rateLimited();
  const user = await authService.login(dto);
  await createSession(user.id);
  return ok({ user });
});
