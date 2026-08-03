import { route, ok, parseBody } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { updateSettingsSchema } from '@/src/server/validators/settings.schema';
import { settingsService } from '@/src/server/services/settings.service';

type P = { slug: string };

export const GET = route<P>(async (_req, { params }) => {
  const actor = await requireUser();
  return ok(await settingsService.get(actor, params.slug));
});

export const PATCH = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const dto = await parseBody(req, updateSettingsSchema);
  return ok(await settingsService.update(actor, params.slug, dto));
});
