import { z } from 'zod';
import { PROJECT_STATUS_VALUES } from '@/src/shared/enums';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).optional(),
  icon: z.string().trim().max(32).optional(),
}).strict();
export type CreateProjectDto = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  icon: z.string().trim().max(32).nullable().optional(),
  status: z.enum(PROJECT_STATUS_VALUES).optional(),
  archived: z.boolean().optional(),
}).strict().refine((v) => Object.keys(v).length > 0, 'Nothing to update.');
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
