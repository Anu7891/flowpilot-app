'use client';
import { useMemo, useState } from 'react';
import { type Member, type Role } from '../api';
import { useMembers, useChangeMemberRole, useRemoveMember } from '../hooks';
import { Icon, initials, timeAgo, fmtDate, useToast } from '../ui';

const ASSIGNABLE: Role[] = ['ADMIN', 'MEMBER', 'GUEST'];

export default function MembersTab({ slug, myRole }: { slug: string; myRole: Role }) {
  const toast = useToast();
  const membersQuery = useMembers(slug);
  const members = membersQuery.isError ? [] : membersQuery.data ?? null;
  const changeRoleMut = useChangeMemberRole(slug);
  const removeMut = useRemoveMember(slug);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | Role>('');
  // Which member row is mid-request — drives per-row disabled/spinner state.
  const busy = changeRoleMut.isPending
    ? changeRoleMut.variables.userId
    : removeMut.isPending
      ? removeMut.variables
      : null;
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (members ?? []).filter((m) =>
      (!roleFilter || m.role === roleFilter) &&
      (!term || m.user.name.toLowerCase().includes(term) || m.user.email.toLowerCase().includes(term)));
  }, [members, q, roleFilter]);

  function changeRole(m: Member, role: Role) {
    changeRoleMut.mutate(
      { userId: m.user.id, role },
      {
        onSuccess: () => toast({ msg: `${m.user.name} is now ${role.toLowerCase()}.` }),
        onError: (e) => toast({ msg: e instanceof Error ? e.message : 'Could not change role.', err: true }),
      },
    );
  }

  function remove(m: Member) {
    removeMut.mutate(m.user.id, {
      onSuccess: () => { toast({ msg: `${m.user.name} removed.` }); setConfirmRemove(null); },
      onError: (e) => { toast({ msg: e instanceof Error ? e.message : 'Could not remove member.', err: true }); setConfirmRemove(null); },
    });
  }

  return (
    <div>
      <div className="toolbar">
        <div className="search">
          <Icon name="i-search" />
          <input placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
          <option value="">All roles</option>
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
          <option value="GUEST">Guest</option>
        </select>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Member</th><th>Role</th><th>Joined</th><th>Last active</th><th className="right">Actions</th></tr></thead>
          <tbody>
            {!members && <tr><td colSpan={5} className="empty-row">Loading members…</td></tr>}
            {members && rows.length === 0 && <tr><td colSpan={5} className="empty-row">No members match your filters.</td></tr>}
            {rows.map((m) => {
              const isOwner = m.role === 'OWNER';
              return (
                <tr key={m.id}>
                  <td>
                    <span className="cell-user">
                      <span className="avatar">{m.user.avatar ? <img src={m.user.avatar} alt="" /> : initials(m.user.name)}</span>
                      <span><span className="nm">{m.user.name}</span><br /><span className="em">{m.user.email}</span></span>
                    </span>
                  </td>
                  <td>
                    {isOwner ? (
                      <span style={{ textTransform: 'capitalize' }}>Owner</span>
                    ) : (
                      <select className="select" value={m.role} disabled={busy === m.user.id}
                        onChange={(e) => changeRole(m, e.target.value as Role)}>
                        {ASSIGNABLE.map((r) => <option key={r} value={r}>{r[0] + r.slice(1).toLowerCase()}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="muted">{fmtDate(m.joinedAt)}</td>
                  <td className="muted">{timeAgo(m.user.lastActiveAt)}</td>
                  <td className="right">
                    {isOwner ? <span className="muted">—</span> : (
                      <button className="btn btn-ghost btn-sm" disabled={busy === m.user.id} onClick={() => setConfirmRemove(m)} title="Remove">
                        <Icon name="i-trash" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirmRemove && (
        <div className="modal-scrim" onClick={() => setConfirmRemove(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Remove {confirmRemove.user.name}?</h3>
            <p>They’ll immediately lose access to this workspace. This can’t be undone, but you can re-invite them later.</p>
            <div className="card-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmRemove(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={busy === confirmRemove.user.id} onClick={() => remove(confirmRemove)}>
                {busy === confirmRemove.user.id ? <><span className="spinner" /> Removing…</> : 'Remove member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
