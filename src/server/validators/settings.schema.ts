import { z } from 'zod';

export const updateSettingsSchema = z.object({
  timezone: z.string().min(1).max(64).optional(),
  dateFormat: z.enum(['DD MMM YYYY', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
  defaultView: z.enum(['board', 'list', 'timeline']).optional(),
  notificationPrefs: z.record(z.boolean()).optional(),
}).strict().refine((v) => Object.keys(v).length > 0, 'Nothing to update.');
export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;
