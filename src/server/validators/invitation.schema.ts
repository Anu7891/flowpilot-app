import { z } from 'zod';
import { InvitationStatus } from '@prisma/client';

export const createInvitationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'GUEST']).default('MEMBER'), // OWNER is never invitable
}).strict();
export type CreateInvitationDto = z.infer<typeof createInvitationSchema>;

export const listInvitationsQuerySchema = z.object({
  status: z.nativeEnum(InvitationStatus).optional(),
});
