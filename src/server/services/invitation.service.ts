import { randomBytes } from 'crypto';
import type { InvitationStatus } from '@prisma/client';
import { invitationRepo } from '../repositories/invitation.repository';
import { memberRepo } from '../repositories/member.repository';
import { userRepo } from '../repositories/user.repository';
import { activityRepo } from '../repositories/activity.repository';
import { notificationRepo } from '../repositories/notification.repository';
import { requirePermission } from '../permissions/guard';
import { workspaceService } from './workspace.service';
import { allowRequest } from '../utils/ratelimit';
import { conflict, forbidden, notFound, rateLimited, unauthorized } from '../utils/errors';
import type { Actor } from '../types/context';
import type { CreateInvitationDto } from '../validators/invitation.schema';

const EXPIRY_DAYS = 7;
const newToken = () => randomBytes(32).toString('base64url');
const expiry = () => new Date(Date.now() + EXPIRY_DAYS * 86_400_000);
export const inviteUrl = (token: string) => `/invite/${token}`;

/** Lazy expiry: PENDING past its expiresAt reads as EXPIRED (and is persisted opportunistically). */
function effectiveStatus(inv: { status: InvitationStatus; expiresAt: Date; id: string }): InvitationStatus {
  if (inv.status === 'PENDING' && inv.expiresAt < new Date()) {
    void invitationRepo.setStatus(inv.id, 'EXPIRED').catch(() => {});
    return 'EXPIRED';
  }
  return inv.status;
}

export const invitationService = {
  async list(actor: Actor, slug: string, status?: InvitationStatus) {
    const { workspace, ctx } = await workspaceService.resolveMember(actor, slug);
    requirePermission(ctx.role, 'manage_members');
    const rows = await invitationRepo.listByWorkspace(workspace.id, status);
    return rows.map((r) => ({ ...r, status: effectiveStatus(r) }));
  },

  async create(actor: Actor, slug: string, dto: CreateInvitationDto) {
    const { workspace, ctx } = await workspaceService.resolveMember(actor, slug);
    requirePermission(ctx.role, 'manage_members');
    if (!allowRequest(`invite:${workspace.id}`, 20, 3_600_000)) throw rateLimited();

    const invitee = await userRepo.findByEmail(dto.email);
    if (invitee && (await memberRepo.find(workspace.id, invitee.id))) {
      throw conflict('Already a member of this workspace.');
    }
    const pending = await invitationRepo.findPending(workspace.id, dto.email);
    if (pending && effectiveStatus(pending) === 'PENDING') {
      throw conflict('An invitation for this email is already pending. Resend it instead.');
    }

    const invitation = await invitationRepo.create({
      workspaceId: workspace.id, email: dto.email, role: dto.role,
      token: newToken(), invitedBy: actor.userId, expiresAt: expiry(),
    });
    void activityRepo.log({ workspaceId: workspace.id, userId: actor.userId, entityType: 'MEMBER', entityId: invitation.id, action: 'invitation.sent', metadata: { email: dto.email, role: dto.role } });
    if (invitee) {
      void notificationRepo.create({ userId: invitee.id, type: 'WORKSPACE_INVITE', title: `You're invited to join ${workspace.name}`, metadata: { token: invitation.token, workspaceSlug: workspace.slug } });
    }
    return { invitation, inviteUrl: inviteUrl(invitation.token) };
  },

  /** Public preview - token possession is the capability, so no auth required. */
  async preview(token: string) {
    const inv = await invitationRepo.findByToken(token);
    if (!inv || inv.workspace.deletedAt) throw notFound('Invitation');
    return {
      status: effectiveStatus(inv),
      email: inv.email,
      role: inv.role,
      invitedBy: inv.inviter?.name ?? 'A teammate',
      workspace: { name: inv.workspace.name, slug: inv.workspace.slug, logo: inv.workspace.logo, color: inv.workspace.color, icon: inv.workspace.icon },
    };
  },

  async accept(actor: Actor, token: string) {
    const inv = await invitationRepo.findByToken(token);
    if (!inv || inv.workspace.deletedAt) throw notFound('Invitation');
    if (effectiveStatus(inv) !== 'PENDING') throw conflict(`This invitation is ${effectiveStatus(inv).toLowerCase()}.`);
    const user = await userRepo.findSessionById(actor.userId);
    if (!user) throw unauthorized();
    if (user.email !== inv.email) {
      throw forbidden(`This invitation was sent to ${inv.email}. Sign in with that email to accept it.`);
    }
    if (await memberRepo.find(inv.workspaceId, actor.userId)) {
      await invitationRepo.setStatus(inv.id, 'ACCEPTED');
      return { workspaceSlug: inv.workspace.slug, alreadyMember: true };
    }
    await memberRepo.add({ workspaceId: inv.workspaceId, userId: actor.userId, role: inv.role, invitedBy: inv.inviter?.id ?? actor.userId });
    await invitationRepo.setStatus(inv.id, 'ACCEPTED');
    await userRepo.touchActivity(actor.userId, inv.workspaceId);
    void activityRepo.log({ workspaceId: inv.workspaceId, userId: actor.userId, entityType: 'MEMBER', entityId: actor.userId, action: 'invitation.accepted' });
    if (inv.inviter) {
      void notificationRepo.create({ userId: inv.inviter.id, type: 'INVITE_ACCEPTED', title: `${user.name} accepted your invite to ${inv.workspace.name}`, metadata: { workspaceSlug: inv.workspace.slug } });
    }
    return { workspaceSlug: inv.workspace.slug, alreadyMember: false };
  },

  async reject(actor: Actor, token: string) {
    const inv = await invitationRepo.findByToken(token);
    if (!inv || inv.workspace.deletedAt) throw notFound('Invitation');
    if (effectiveStatus(inv) !== 'PENDING') throw conflict(`This invitation is ${effectiveStatus(inv).toLowerCase()}.`);
    const user = await userRepo.findSessionById(actor.userId);
    if (!user || user.email !== inv.email) throw forbidden('This invitation was sent to a different email.');
    await invitationRepo.setStatus(inv.id, 'REJECTED');
  },

  async revoke(actor: Actor, slug: string, invitationId: string) {
    const { workspace, ctx } = await workspaceService.resolveMember(actor, slug);
    requirePermission(ctx.role, 'manage_members');
    const inv = await invitationRepo.findById(invitationId);
    if (!inv || inv.workspaceId !== workspace.id) throw notFound('Invitation');
    if (inv.status === 'ACCEPTED') throw conflict('Already accepted - remove the member instead.');
    await invitationRepo.setStatus(invitationId, 'REVOKED');
    void activityRepo.log({ workspaceId: workspace.id, userId: actor.userId, entityType: 'MEMBER', entityId: invitationId, action: 'invitation.revoked', metadata: { email: inv.email } });
  },

  async resend(actor: Actor, slug: string, invitationId: string) {
    const { workspace, ctx } = await workspaceService.resolveMember(actor, slug);
    requirePermission(ctx.role, 'manage_members');
    if (!allowRequest(`invite:${workspace.id}`, 20, 3_600_000)) throw rateLimited();
    const inv = await invitationRepo.findById(invitationId);
    if (!inv || inv.workspaceId !== workspace.id) throw notFound('Invitation');
    if (inv.status === 'ACCEPTED' || inv.status === 'REJECTED' || inv.status === 'REVOKED') {
      throw conflict(`This invitation is ${inv.status.toLowerCase()} and can't be resent.`);
    }
    const refreshed = await invitationRepo.refresh(invitationId, newToken(), expiry());
    return { invitation: refreshed, inviteUrl: inviteUrl(refreshed.token) };
  },
};
