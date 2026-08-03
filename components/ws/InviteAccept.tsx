'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { get, post, ApiError } from './api';
import { Icon, initials, ToastProvider, useToast } from './ui';

type Preview = {
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';
  email: string; role: string; invitedBy: string;
  workspace: { name: string; slug: string; logo: string | null; color: string | null; icon: string | null };
};

function Inner({ token }: { token: string }) {
  const router = useRouter();
  const toast = useToast();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'accept' | 'reject' | null>(null);

  useEffect(() => {
    get<Preview>(`/invitations/${token}`)
      .then(setPreview)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Invitation not found.'));
  }, [token]);

  async function accept() {
    setBusy('accept');
    try {
      const res = await post<{ workspaceSlug: string }>(`/invitations/${token}/accept`);
      toast({ msg: 'Invitation accepted!' });
      router.push(`/w/${res.workspaceSlug}`);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 401) { router.push(`/login?next=/invite/${token}`); return; }
      toast({ msg: e.message ?? 'Could not accept.', err: true });
      setBusy(null);
    }
  }

  async function reject() {
    setBusy('reject');
    try {
      await post(`/invitations/${token}/reject`);
      toast({ msg: 'Invitation declined.' });
      router.push('/');
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 401) { router.push(`/login?next=/invite/${token}`); return; }
      toast({ msg: e.message ?? 'Could not decline.', err: true });
      setBusy(null);
    }
  }

  if (error) {
    return <div className="center-state"><Icon name="i-x-c" className="ic" /><h2>Invitation unavailable</h2><p>{error}</p>
      <button className="btn btn-secondary" onClick={() => router.push('/')}>Go home</button></div>;
  }
  if (!preview) return <div className="loading"><span className="spinner" /> Loading invitation…</div>;

  const w = preview.workspace;
  const active = preview.status === 'PENDING';

  return (
    <div className="center-state">
      <span className="ws-badge" style={{ width: 56, height: 56, fontSize: 22, margin: '0 auto var(--s-2)', background: w.color ?? 'var(--primary)' }}>
        {w.icon ?? initials(w.name)}
      </span>
      <h2>Join {w.name}</h2>
      <p><strong>{preview.invitedBy}</strong> invited <strong>{preview.email}</strong> to join as {preview.role.toLowerCase()}.</p>

      {active ? (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 'var(--s-1)' }}>
          <button className="btn btn-secondary" disabled={busy !== null} onClick={reject}>
            {busy === 'reject' ? <><span className="spinner" /> …</> : 'Decline'}
          </button>
          <button className="btn btn-primary" disabled={busy !== null} onClick={accept}>
            {busy === 'accept' ? <><span className="spinner" /> Joining…</> : <><Icon name="i-check" /> Accept invite</>}
          </button>
        </div>
      ) : (
        <p className="muted" style={{ textTransform: 'capitalize' }}>This invitation is {preview.status.toLowerCase()}.</p>
      )}
    </div>
  );
}

export default function InviteAccept({ token }: { token: string }) {
  return (
    <ToastProvider>
      <div className="pg-flow pg-ws"><div className="page"><Inner token={token} /></div></div>
    </ToastProvider>
  );
}
