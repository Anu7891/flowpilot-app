import { z } from 'zod';

export const idSchema = z.string().min(10).max(40);

export const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
export type ListQuery = z.infer<typeof listQuerySchema>;
