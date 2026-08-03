import { z } from 'zod';

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/, 'Use lowercase letters, numbers and dashes (3-32 chars).');

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(60),
  slug: slugSchema,
}).strict();
export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  slug: slugSchema.optional(),
  logo: z.string().url().nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex color like #4650C7.').nullable().optional(),
  icon: z.string().trim().max(32).nullable().optional(),
  archived: z.boolean().optional(), // true -> archive, false -> unarchive
}).strict().refine((v) => Object.keys(v).length > 0, 'Nothing to update.');
export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'GUEST']).default('MEMBER'),
}).strict();
export type InviteMemberDto = z.infer<typeof inviteMemberSchema>;

export const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'GUEST']),
}).strict();
export type UpdateMemberDto = z.infer<typeof updateMemberSchema>;
