import { workspaceRepo } from '../repositories/workspace.repository';
import { memberRepo } from '../repositories/member.repository';
import { userRepo } from '../repositories/user.repository';
import { activityRepo } from '../repositories/activity.repository';
import { notificationRepo } from '../repositories/notification.repository';
import { requireMembership, requirePermission } from '../permissions/guard';
import { conflict, forbidden, notFound } from '../utils/errors';
import type { Actor } from '../types/context';
import type { CreateWorkspaceDto, InviteMemberDto, UpdateMemberDto, UpdateWorkspaceDto } from '../validators/workspace.schema';

/** Resolve slug -> live workspace + verify membership. Shared entry for all slug routes. */
async function resolveMember(actor: Actor, slug: string) {
  const workspace = await workspaceRepo.findLiveBySlug(slug);
  if (!workspace) throw notFound('Workspace');
  const ctx = await requireMembership(actor, workspace.id);
  return { workspace, ctx };
}

export const workspaceService = {
  resolveMember,

  async listForUser(actor: Actor) {
    const rows = await workspaceRepo.findManyForUser(actor.userId);
    return rows.map(({ members, ...ws }) => ({ ...ws, role: members[0]?.role ?? 'MEMBER' }));
  },

  async create(actor: Actor, dto: CreateWorkspaceDto) {
    if (await workspaceRepo.slugTaken(dto.slug)) throw conflict('That workspace URL is taken.');
    return workspaceRepo.createWithOwner({ ...dto, ownerId: actor.userId });
  },

  async get(actor: Actor, slug: string) {
    const { workspace, ctx } = await resolveMember(actor, slug);
    return { ...workspace, role: ctx.role };
  },

  async update(actor: Actor, slug: string, dto: UpdateWorkspaceDto) {
    const { workspace, ctx } = await resolveMember(actor, slug);
    requirePermission(ctx.role, 'update_workspace');
    if (dto.slug && dto.slug !== workspace.slug && (await workspaceRepo.slugTaken(dto.slug))) {
      throw conflict('That workspace URL is taken.');
    }
    const { archived, ...fields } = dto as typeof dto & { archived?: boolean };
    const data = {
      ...fields,
      ...(archived === undefined ? {} : { archivedAt: archived ? new Date() : null }),
    };
    const updated = await workspaceRepo.update(workspace.id, data);
    void activityRepo.log({ workspaceId: workspace.id, userId: actor.userId, entityType: 'WORKSPACE', entityId: workspace.id, action: archived ? 'workspace.archived' : 'workspace.updated', metadata: dto });
    if (archived) {
      const members = await memberRepo.listByWorkspace(workspace.id);
      void notificationRepo.createMany(members
        .filter((m) => m.user.id !== actor.userId)
        .map((m) => ({ userId: m.user.id, type: 'WORKSPACE_ARCHIVED' as const, title: `${workspace.name} was archived`, metadata: { workspaceSlug: workspace.slug } })));
    }
    return updated;
  },

  async softDelete(actor: Actor, slug: string) {
    const { workspace, ctx } = await resolveMember(actor, slug);
    requirePermission(ctx.role, 'delete_workspace');
    await workspaceRepo.softDelete(workspace.id);
    void activityRepo.log({ workspaceId: workspace.id, userId: actor.userId, entityType: 'WORKSPACE', entityId: workspace.id, action: 'workspace.deleted' });
  },

  async listMembers(actor: Actor, slug: string) {
    const { workspace } = await resolveMember(actor, slug);
    return memberRepo.listByWorkspace(workspace.id);
  },

  /** v1: only existing FlowPilot accounts can be added directly (invite-by-email tokens come later). */
  async inviteMember(actor: Actor, slug: string, dto: InviteMemberDto) {
    const { workspace, ctx } = await resolveMember(actor, slug);
    requirePermission(ctx.role, 'manage_members');
    const invitee = await userRepo.findByEmail(dto.email);
    if (!invitee) throw notFound('No FlowPilot account with that email');
    if (await memberRepo.find(workspace.id, invitee.id)) throw conflict('Already a member of this workspace.');
    const member = await memberRepo.add({ workspaceId: workspace.id, userId: invitee.id, role: dto.role, invitedBy: actor.userId });
    void activityRepo.log({ workspaceId: workspace.id, userId: actor.userId, entityType: 'MEMBER', entityId: invitee.id, action: 'member.invited', metadata: { role: dto.role } });
    void notificationRepo.create({ userId: invitee.id, type: 'MEMBER_JOINED', title: `You were added to ${workspace.name}`, metadata: { workspaceSlug: workspace.slug } });
    return member;
  },

  async updateMemberRole(actor: Actor, slug: string, targetUserId: string, dto: UpdateMemberDto) {
    const { workspace, ctx } = await resolveMember(actor, slug);
    requirePermission(ctx.role, 'manage_members');
    const target = await memberRepo.find(workspace.id, targetUserId);
    if (!target) throw notFound('Member');
    if (target.role === 'OWNER') throw forbidden("The owner's role can't be changed. Transfer ownership first.");
    const updated = await memberRepo.updateRole(workspace.id, targetUserId, dto.role);
    void activityRepo.log({ workspaceId: workspace.id, userId: actor.userId, entityType: 'MEMBER', entityId: targetUserId, action: 'member.role_changed', metadata: { from: target.role, to: dto.role } });
    void notificationRepo.create({ userId: targetUserId, type: 'ROLE_CHANGED', title: `Your role in ${workspace.name} is now ${dto.role.toLowerCase()}`, metadata: { workspaceSlug: workspace.slug } });
    return updated;
  },

  async removeMember(actor: Actor, slug: string, targetUserId: string) {
    const { workspace, ctx } = await resolveMember(actor, slug);
    const leavingSelf = targetUserId === actor.userId;
    if (!leavingSelf) requirePermission(ctx.role, 'manage_members');
    const target = await memberRepo.find(workspace.id, targetUserId);
    if (!target) throw notFound('Member');
    if (target.role === 'OWNER') throw forbidden("The owner can't be removed. Transfer ownership first.");
    await memberRepo.remove(workspace.id, targetUserId);
    void activityRepo.log({ workspaceId: workspace.id, userId: actor.userId, entityType: 'MEMBER', entityId: targetUserId, action: leavingSelf ? 'member.left' : 'member.removed' });
    if (!leavingSelf) {
      void notificationRepo.create({ userId: targetUserId, type: 'MEMBER_REMOVED', title: `You were removed from ${workspace.name}`, metadata: {} });
    }
  },

  /** Phase 4: switch active workspace - persists server-side so it follows the user across devices. */
  async switch(actor: Actor, slug: string) {
    const { workspace } = await resolveMember(actor, slug);
    if (workspace.archivedAt) throw forbidden('This workspace is archived. Unarchive it first.');
    await userRepo.touchActivity(actor.userId, workspace.id);
    return workspace;
  },
};
