import { z } from 'zod';
import { TASK_STATUS_VALUES, TASK_PRIORITY_VALUES } from '@/src/shared/enums';
import { idSchema } from './common';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(20_000).optional(),
  status: z.enum(TASK_STATUS_VALUES).default('BACKLOG'),
  priority: z.enum(TASK_PRIORITY_VALUES).default('NONE'),
  assigneeId: idSchema.nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  estimatedHours: z.number().positive().max(999).nullable().optional(),
}).strict();
export type CreateTaskDto = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(20_000).nullable().optional(),
  status: z.enum(TASK_STATUS_VALUES).optional(),
  priority: z.enum(TASK_PRIORITY_VALUES).optional(),
  assigneeId: idSchema.nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  estimatedHours: z.number().positive().max(999).nullable().optional(),
  /** Board ordering - send together with status when dragging across columns. */
  position: z.number().positive().optional(),
}).strict().refine((v) => Object.keys(v).length > 0, 'Nothing to update.');
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;

export const listTasksQuerySchema = z.object({
  status: z.enum(TASK_STATUS_VALUES).optional(),
  assigneeId: idSchema.optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
