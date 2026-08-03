'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Role, type WorkspaceSummary } from '../api';
import { useUpdateWorkspace, useDeleteWorkspace } from '../hooks';
import { useToast } from '../ui';

type WS = WorkspaceSummary & { role: Role };

export default function DangerTab({ ws, isOwner, onArchived }: { ws: WS; isOwner: boolean; onArchived: (w: WS) => void }) {
  const router = useRouter();
  const toast = useToast();
  const updateMut = useUpdateWorkspace(ws.slug);
  const deleteMut = useDeleteWorkspace(ws.slug);
  const busy: 'archive' | 'delete' | null = updateMut.isPending ? 'archive' : deleteMut.isPending ? 'delete' : null;
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const archived = !!ws.archivedAt;

  function toggleArchive() {
    updateMut.mutate(
      { archived: !archived },
      {
        onSuccess: (updated) => {
          onArchived({ ...ws, ...updated });
          toast({ msg: archived ? 'Workspace unarchived.' : 'Workspace archived.' });
        },
        onError: (e) => toast({ msg: e instanceof Error ? e.message : 'Could not update.', err: true }),
      },
    );
  }

  function doDelete() {
    deleteMut.mutate(undefined, {
      onSuccess: () => { toast({ msg: 'Workspace deleted.' }); router.push('/dashboard'); },
      onError: (e) => toast({ msg: e instanceof Error ? e.message : 'Could not delete.', err: true }),
    });
  }

  return (
    <div className="card danger-card">
      <h3>Danger zone</h3>
      <p className="sub">Irreversible and destructive actions.</p>

      <div className="danger-item">
        <div className="txt">
          <strong>{archived ? 'Unarchive workspace' : 'Archive workspace'}</strong>
          <span>{archived ? 'Restore this workspace and make it active again.' : 'Make it read-only and hide it from the switcher. Restorable anytime.'}</span>
        </div>
        <button className="btn btn-secondary" disabled={busy !== null} onClick={toggleArchive}>
          {busy === 'archive' ? <><span className="spinner" /> …</> : archived ? 'Unarchive' : 'Archive'}
        </button>
      </div>

      {isOwner && (
        <div className="danger-item">
          <div className="txt">
            <strong>Delete workspace</strong>
            <span>Permanently remove this workspace and its projects. This cannot be undone.</span>
          </div>
          <button className="btn btn-danger" disabled={busy !== null} onClick={() => { setShowDelete(true); setConfirmText(''); }}>Delete</button>
        </div>
      )}

      {showDelete && (
        <div className="modal-scrim" onClick={() => setShowDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete “{ws.name}”?</h3>
            <p>This removes the workspace for everyone. Type <strong>{ws.slug}</strong> to confirm.</p>
            <input className="input" value={confirmText} placeholder={ws.slug} onChange={(e) => setConfirmText(e.target.value)} autoFocus />
            <div className="card-actions">
              <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn btn-danger" disabled={confirmText !== ws.slug || busy === 'delete'} onClick={doDelete}>
                {busy === 'delete' ? <><span className="spinner" /> Deleting…</> : 'Delete forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
