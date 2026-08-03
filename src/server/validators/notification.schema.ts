import { z } from 'zod';
import { idSchema } from './common';

export const markReadSchema = z.union([
  z.object({ ids: z.array(idSchema).min(1).max(100) }).strict(),
  z.object({ all: z.literal(true) }).strict(),
]);
export type MarkReadDto = z.infer<typeof markReadSchema>;
