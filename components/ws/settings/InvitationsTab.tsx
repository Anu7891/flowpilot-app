'use client';
import { useEffect, useState } from 'react';
import { get, post, del, type Invitation, type Role } from '../api';
import { Icon, fmtDate, useToast } from '../ui';

const STATUS_VARIANT: Record<string, string> = {
  PENDING: 'warning', ACCEPTED: 'success', EXPIRED: 'neutral', REVOKED: 'neutral', REJECTED: 'danger',
};

export default function InvitationsTab({ slug }: { slug: string }) {
  const toast = useToast();
  const [invites, setInvites] = useState<Invitation[] | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  function load() { get<Invitation[]>(`/workspaces/${slug}/invitations`).then(setInvites).catch(() => setInvites([])); }
  useEffect(load, [slug]);

  function fullLink(token: string) { return `${window.location.origin}/invite/${token}`; }

  async function copy(url: string) {
    try { await navigator.clipboard.writeText(url); toast({ msg: 'Invite link copied.' }); }
    catch { toast({ msg: 'Copy failed — select and copy manually.', err: true }); }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await post<{ invitation: Invitation; inviteUrl: string }>(`/workspaces/${slug}/invitations`, { email, role });
      setEmail('');
      load();
      await copy(`${window.location.origin}${res.inviteUrl}`);
      toast({ msg: `Invite created for ${res.invitation.email}. Link copied.` });
    } catch (e: any) {
      toast({ msg: e.message ?? 'Could not create invitation.', err: true });
    } finally {
      setSending(false);
    }
  }

  async function resend(inv: Invitation) {
    setBusy(inv.id);
    try {
      const res = await post<{ invitation: Invitation; inviteUrl: string }>(`/workspaces/${slug}/invitations/${inv.id}/resend`);
      load();
      await copy(`${window.location.origin}${res.inviteUrl}`);
    } catch (e: any) {
      toast({ msg: e.message ?? 'Could not resend.', err: true });
    } finally { setBusy(null); }
  }

  async function revoke(inv: Invitation) {
    setBusy(inv.id);
    try { await del(`/workspaces/${slug}/invitations/${inv.id}`); load(); toast({ msg: 'Invitation revoked.' }); }
    catch (e: any) { toast({ msg: e.message ?? 'Could not revoke.', err: true }); }
    finally { setBusy(null); }
  }

  return (
    <div>
      <div className="card">
        <h3>Invite by email</h3>
        <p className="sub">We generate a secure link — share it anywhere. Only the invited email can accept.</p>
        <form className="row" onSubmit={send}>
          <div className="field" style={{ flex: 2 }}>
            <label htmlFor="inv-email">Email address</label>
            <input id="inv-email" className="input" type="email" required placeholder="teammate@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="inv-role">Role</label>
            <select id="inv-role" className="select" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="GUEST">Guest</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={sending || !email} style={{ flex: 'none' }}>
            {sending ? <><span className="spinner" /> Sending…</> : <><Icon name="i-send" /> Invite</>}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Invitations</h3>
        <p className="sub">Pending and past invitations for this workspace.</p>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Email</th><th>Role</th><th>Status</th><th>Expires</th><th className="right">Actions</th></tr></thead>
            <tbody>
              {!invites && <tr><td colSpan={5} className="empty-row">Loading…</td></tr>}
              {invites && invites.length === 0 && <tr><td colSpan={5} className="empty-row">No invitations yet.</td></tr>}
              {invites?.map((inv) => {
                const canResend = inv.status === 'PENDING' || inv.status === 'EXPIRED';
                const canRevoke = inv.status === 'PENDING' || inv.status === 'EXPIRED';
                return (
                  <tr key={inv.id}>
                    <td>{inv.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{inv.role.toLowerCase()}</td>
                    <td><span className={`badge badge-${STATUS_VARIANT[inv.status] ?? 'neutral'}`} style={{ textTransform: 'capitalize' }}>{inv.status.toLowerCase()}</span></td>
                    <td className="muted">{fmtDate(inv.expiresAt)}</td>
                    <td className="right">
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {canResend && (
                          <button className="btn btn-ghost btn-sm" disabled={busy === inv.id} onClick={() => resend(inv)} title="Resend (new link)">
                            <Icon name="i-send" /> Resend
                          </button>
                        )}
                        {canRevoke && (
                          <button className="btn btn-ghost btn-sm" disabled={busy === inv.id} onClick={() => revoke(inv)} title="Revoke">
                            <Icon name="i-x" />
                          </button>
                        )}
                        {!canResend && !canRevoke && <span className="muted">—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
