'use client';
import { useEffect, useRef, useState } from 'react';
import { get, post, patch, del, TASK_STATUSES, TASK_PRIORITIES, type Task, type Member, type Comment } from '../api';
import { Icon, initials, timeAgo, useToast } from '../ui';

const toDateInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

export default function TaskPanel({
  task, members, onClose, onChanged, onDeleted,
}: {
  task: Task; members: Member[]; onClose: () => void; onChanged: (t: Task) => void; onDeleted: () => void;
}) {
  const toast = useToast();
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description ?? '');
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[] | null>(null);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const listEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { setTitle(task.title); setDesc(task.description ?? ''); }, [task.id]);

  useEffect(() => {
    get<{ user: { id: string } | null }>('/auth/session').then((s) => setMeId(s.user?.id ?? null)).catch(() => {});
  }, []);

  useEffect(() => {
    setComments(null);
    get<Comment[]>(`/tasks/${task.id}/comments?limit=100`).then((c) => setComments([...c].reverse())).catch(() => setComments([]));
  }, [task.id]);

  async function save(patchObj: Record<string, unknown>) {
    setSaving(true);
    try {
      const updated = await patch<Task>(`/tasks/${task.id}`, patchObj);
      onChanged(updated);
    } catch (e: any) {
      toast({ msg: e.message ?? 'Could not save.', err: true });
    } finally { setSaving(false); }
  }

  async function remove() {
    try { await del(`/tasks/${task.id}`); toast({ msg: 'Task deleted.' }); onDeleted(); }
    catch (e: any) { toast({ msg: e.message ?? 'Could not delete.', err: true }); }
  }

  async function addComment() {
    const message = draft.trim();
    if (!message) return;
    setPosting(true); setDraft('');
    try {
      const c = await post<Comment>(`/tasks/${task.id}/comments`, { message });
      setComments((cs) => [...(cs ?? []), c]);
      setTimeout(() => listEnd.current?.scrollIntoView({ behavior: 'smooth' }), 40);
    } catch (e: any) {
      toast({ msg: e.message ?? 'Could not post comment.', err: true }); setDraft(message);
    } finally { setPosting(false); }
  }

  async function saveEdit(id: string) {
    const message = editText.trim();
    if (!message) return;
    try {
      const c = await patch<Comment>(`/comments/${id}`, { message });
      setComments((cs) => cs!.map((x) => (x.id === id ? c : x)));
      setEditId(null);
    } catch (e: any) { toast({ msg: e.message ?? 'Could not edit.', err: true }); }
  }

  async function delComment(id: string) {
    try { await del(`/comments/${id}`); setComments((cs) => cs!.filter((x) => x.id !== id)); }
    catch (e: any) { toast({ msg: e.message ?? 'Could not delete comment.', err: true }); }
  }

  return (
    <div className="panel-scrim" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-head">
          <span className={`dot st-${task.status}`} style={{ width: 10, height: 10, borderRadius: 999 }} />
          <span className="muted" style={{ fontSize: 13 }}>{saving ? 'Saving…' : 'Task'}</span>
          <span className="spacer" />
          <button className="icon-btn" title="Delete task" onClick={() => setConfirmDel(true)}><Icon name="i-trash" /></button>
          <button className="icon-btn" title="Close" onClick={onClose}><Icon name="i-x" /></button>
        </div>

        <div className="panel-body">
          <input
            className="title-input" value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && title !== task.title && save({ title: title.trim() })}
          />

          <div className="field-grid">
            <label>Status</label>
            <select className="select" value={task.status} onChange={(e) => save({ status: e.target.value })}>
              {TASK_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>

            <label>Priority</label>
            <select className="select" value={task.priority} onChange={(e) => save({ priority: e.target.value })}>
              {TASK_PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>

            <label>Assignee</label>
            <select className="select" value={task.assigneeId ?? ''} onChange={(e) => save({ assigneeId: e.target.value || null })}>
              <option value="">Unassigned</option>
              {members.map((m) => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
            </select>

            <label>Due date</label>
            <input type="date" className="select" value={toDateInput(task.dueDate)}
              onChange={(e) => save({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          </div>

          <div className="field">
            <label style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500, marginBottom: 6 }}>Description</label>
            <textarea className="input" placeholder="Add more detail…" value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onBlur={() => desc !== (task.description ?? '') && save({ description: desc || null })} />
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Comments</label>
            <div className="comments">
              {comments === null && <div className="muted" style={{ fontSize: 13 }}>Loading…</div>}
              {comments?.length === 0 && <div className="muted" style={{ fontSize: 13 }}>No comments yet.</div>}
              {comments?.map((c) => (
                <div className="comment" key={c.id}>
                  <span className="avatar">{c.user.avatar ? <img src={c.user.avatar} alt="" /> : initials(c.user.name)}</span>
                  <div className="body">
                    <div className="chead"><span className="nm">{c.user.name}</span><span className="tm">{timeAgo(c.createdAt)}{c.updatedAt !== c.createdAt ? ' · edited' : ''}</span></div>
                    {editId === c.id ? (
                      <>
                        <textarea className="input" style={{ minHeight: 56, padding: '8px 10px', fontFamily: 'inherit' }} value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus />
                        <div className="actions">
                          <button onClick={() => saveEdit(c.id)}>Save</button>
                          <button onClick={() => setEditId(null)}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="msg">{c.message}</div>
                        {meId === c.user.id && (
                          <div className="actions">
                            <button onClick={() => { setEditId(c.id); setEditText(c.message); }}>Edit</button>
                            <button onClick={() => delComment(c.id)}>Delete</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={listEnd} />
            </div>

            <div className="comment-box">
              <textarea className="input" placeholder="Write a comment… (Enter to send)" value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment(); } }} />
              <button className="btn btn-primary" disabled={posting || !draft.trim()} onClick={addComment}>
                {posting ? <span className="spinner" /> : <Icon name="i-send" />}
              </button>
            </div>
          </div>
        </div>

        {confirmDel && (
          <div className="modal-scrim" onClick={() => setConfirmDel(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete this task?</h3>
              <p>“{task.title}” will be removed. This can’t be undone.</p>
              <div className="card-actions">
                <button className="btn btn-secondary" onClick={() => setConfirmDel(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={remove}>Delete task</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
