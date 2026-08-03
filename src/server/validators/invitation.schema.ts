import { z } from 'zod';
import { ASSIGNABLE_ROLES, INVITATION_STATUS_VALUES } from '@/src/shared/enums';

export const createInvitationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(ASSIGNABLE_ROLES).default('MEMBER'), // OWNER is never invitable
}).strict();
export type CreateInvitationDto = z.infer<typeof createInvitationSchema>;

export const listInvitationsQuerySchema = z.object({
  status: z.enum(INVITATION_STATUS_VALUES).optional(),
});
