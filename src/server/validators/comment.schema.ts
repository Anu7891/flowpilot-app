import { z } from 'zod';

export const createCommentSchema = z.object({
  message: z.string().trim().min(1, 'Comment cannot be empty.').max(4000),
}).strict();
export type CreateCommentDto = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = createCommentSchema;
export type UpdateCommentDto = CreateCommentDto;
