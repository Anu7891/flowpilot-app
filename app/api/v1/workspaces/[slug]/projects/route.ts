import { route, ok, created, parseBody, query } from '@/src/server/utils/http';
import { requireUser } from '@/src/server/permissions/guard';
import { createProjectSchema } from '@/src/server/validators/project.schema';
import { projectService } from '@/src/server/services/project.service';

type P = { slug: string };

export const GET = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const archivedParam = query(req).get('archived');
  const archived = archivedParam === null ? undefined : archivedParam === 'true';
  return ok(await projectService.list(actor, params.slug, { archived }));
});

export const POST = route<P>(async (req, { params }) => {
  const actor = await requireUser();
  const dto = await parseBody(req, createProjectSchema);
  return created(await projectService.create(actor, params.slug, dto));
});
