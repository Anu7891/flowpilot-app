'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { get, post, patch, TASK_STATUSES, type Project, type Task, type TaskStatus, type Member } from '../api';
import { Icon, initials, useToast } from '../ui';
import { PriorityPill, DueLabel, pos } from './shared';
import TaskPanel from './TaskPanel';

const GAP = 1024;
type View = 'board' | 'list';

export default function BoardPage({ slug, projectId }: { slug: string; projectId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [addIn, setAddIn] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [view, setView] = useState<View>('board');
  const dragId = useRef<string | null>(null);
  const [drop, setDrop] = useState<{ status: TaskStatus; beforeId: string | null } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [p, t] = await Promise.all([
          get<Project>(`/projects/${projectId}`),
          get<Task[]>(`/projects/${projectId}/tasks?limit=200`),
        ]);
        if (!alive) return;
        setProject(p); setTasks(t);
        get<Member[]>(`/workspaces/${slug}/members`).then((m) => alive && setMembers(m)).catch(() => {});
      } catch (e: any) {
        if (alive) setError(e.message ?? 'Could not load board.');
      }
    })();
    return () => { alive = false; };
  }, [projectId, slug]);

  const byStatus = useMemo(() => {
    const map = new Map<TaskStatus, Task[]>();
    for (const s of TASK_STATUSES) map.set(s.key, []);
    (tasks ?? []).forEach((t) => map.get(t.status)?.push(t));
    map.forEach((arr) => arr.sort((a, b) => pos(a.position) - pos(b.position)));
    return map;
  }, [tasks]);

  const openTask = tasks?.find((t) => t.id === openId) ?? null;

  const computePosition = useCallback((status: TaskStatus, beforeId: string | null, draggedId: string) => {
    const list = (tasks ?? []).filter((t) => t.status === status && t.id !== draggedId).sort((a, b) => pos(a.position) - pos(b.position));
    if (beforeId == null) return list.length ? pos(list[list.length - 1].position) + GAP : GAP;
    const idx = list.findIndex((t) => t.id === beforeId);
    if (idx === -1) return list.length ? pos(list[list.length - 1].position) + GAP : GAP;
    const target = pos(list[idx].position);
    if (idx === 0) return target / 2;
    return (pos(list[idx - 1].position) + target) / 2;
  }, [tasks]);

  const isNoop = useCallback((status: TaskStatus, beforeId: string | null, id: string) => {
    const task = tasks?.find((t) => t.id === id);
    if (!task || task.status !== status) return false;
    const col = (tasks ?? []).filter((t) => t.status === status).sort((a, b) => pos(a.position) - pos(b.position));
    const curIdx = col.findIndex((t) => t.id === id);
    let tgtIdx = beforeId == null ? col.length - 1 : col.findIndex((t) => t.id === beforeId);
    if (beforeId != null && tgtIdx > curIdx) tgtIdx -= 1;
    return tgtIdx === curIdx;
  }, [tasks]);

  async function move(status: TaskStatus, beforeId: string | null) {
    const id = dragId.current;
    dragId.current = null;
    setDrop(null);
    if (!id || beforeId === id) return;
    // Guard: dropping in the same slot changes nothing — no API call. (Keeps writes to real moves only.)
    if (isNoop(status, beforeId, id)) return;
    const task = tasks?.find((t) => t.id === id);
    if (!task) return;
    const position = computePosition(status, beforeId, id);
    const prev = tasks!;
    setTasks((ts) => ts!.map((t) => (t.id === id ? { ...t, status, position } : t)));
    try {
      await patch<Task>(`/tasks/${id}`, { status, position });
    } catch (e: any) {
      setTasks(prev);
      toast({ msg: e.message ?? 'Could not move task.', err: true });
    }
  }

  async function addTask(status: TaskStatus) {
    const title = newTitle.trim();
    if (!title) { setAddIn(null); return; }
    setNewTitle('');
    try {
      const t = await post<Task>(`/projects/${projectId}/tasks`, { title, status });
      setTasks((ts) => [...(ts ?? []), t]);
      setProject((p) => (p ? { ...p, _count: { tasks: (p._count?.tasks ?? 0) + 1 } } : p));
    } catch (e: any) {
      toast({ msg: e.message ?? 'Could not add task.', err: true });
    }
  }

  function onTaskChanged(updated: Task) { setTasks((ts) => ts!.map((t) => (t.id === updated.id ? updated : t))); }
  function onTaskDeleted(id: string) {
    setTasks((ts) => ts!.filter((t) => t.id !== id));
    setProject((p) => (p ? { ...p, _count: { tasks: Math.max(0, (p._count?.tasks ?? 1) - 1) } } : p));
    setOpenId(null);
  }

  function AddBox({ status }: { status: TaskStatus }) {
    return (
      <textarea
        className="input" autoFocus placeholder="Task title — Enter to add, Esc to cancel"
        style={{ minHeight: 56, padding: '8px 10px', fontFamily: 'inherit', resize: 'none' }}
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addTask(status); }
          if (e.key === 'Escape') { setAddIn(null); setNewTitle(''); }
        }}
        onBlur={() => addTask(status)}
      />
    );
  }

  if (error) {
    return <div className="page"><div className="center-state"><Icon name="i-warn" className="ic" /><h2>Board unavailable</h2><p>{error}</p>
      <button className="btn btn-secondary" onClick={() => router.push(`/w/${slug}/projects`)}>Back to projects</button></div></div>;
  }
  if (!project || !tasks) return <div className="page"><div className="loading"><span className="spinner" /> Loading board…</div></div>;

  return (
    <>
      <div className="content-head">
        <div className="crumb">
          <button className="side-proj" style={{ width: 'auto', padding: '2px 6px' }} onClick={() => router.push(`/w/${slug}/projects`)}>
            <span className="pic">{project.icon ?? <Icon name="i-layers" />}</span>
          </button>
          <span>{project.name}</span>
          <span className="sep"><Icon name="i-chev-r" /></span>
          <span className="muted" style={{ fontWeight: 500 }}>Work items</span>
          <span className="count">{tasks.length}</span>
        </div>
        <span style={{ flex: 1 }} />
        <div className="view-toggle">
          <button className={view === 'list' ? 'on' : ''} title="List" onClick={() => setView('list')}><Icon name="i-inbox" /></button>
          <button className={view === 'board' ? 'on' : ''} title="Board" onClick={() => setView('board')}><Icon name="i-board" /></button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setView('board'); setAddIn('BACKLOG'); setNewTitle(''); }}>
          <Icon name="i-plus" /> Add work item
        </button>
      </div>

      <div className="board-wrap">
        {view === 'board' ? (
          <div className="board">
            {TASK_STATUSES.map((s) => {
              const list = byStatus.get(s.key)!;
              const isDropCol = drop?.status === s.key;
              return (
                <div
                  key={s.key}
                  className={`col ${isDropCol && drop?.beforeId == null ? 'drop' : ''}`}
                  onDragOver={(e) => { if (dragId.current) { e.preventDefault(); setDrop({ status: s.key, beforeId: null }); } }}
                  onDrop={(e) => { e.preventDefault(); move(s.key, drop?.status === s.key ? drop.beforeId : null); }}
                >
                  <div className="col-head">
                    <span className={`dot st-${s.key}`} />
                    <span className="t">{s.label}</span>
                    <span className="n">{list.length}</span>
                    <button className="add" title="Add task" onClick={() => { setAddIn(s.key); setNewTitle(''); }}><Icon name="i-plus" /></button>
                  </div>
                  <div className="col-body">
                    {addIn === s.key && <AddBox status={s.key} />}
                    {list.map((t) => (
                      <div
                        key={t.id}
                        className={`task-card ${dragId.current === t.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={() => { dragId.current = t.id; }}
                        onDragEnd={() => { dragId.current = null; setDrop(null); }}
                        onDragOver={(e) => { if (dragId.current) { e.preventDefault(); e.stopPropagation(); setDrop({ status: s.key, beforeId: t.id }); } }}
                        onClick={() => setOpenId(t.id)}
                      >
                        <span className={`strip st-${t.status}`} />
                        <div className="card-in">
                          {drop?.status === s.key && drop.beforeId === t.id && <div className="drop-line" />}
                          <div className="tt">{t.title}</div>
                          <div className="meta">
                            <PriorityPill priority={t.priority} />
                            <DueLabel due={t.dueDate} />
                            {t.assignee && (
                              <span className="assignees">
                                <span className="avatar-xs" title={t.assignee.name}>
                                  {t.assignee.avatar ? <img src={t.assignee.avatar} alt="" /> : initials(t.assignee.name)}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {list.length === 0 && addIn !== s.key && (
                      <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => { setAddIn(s.key); setNewTitle(''); }}>
                        <Icon name="i-plus" /> Add task
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="list-view">
            {TASK_STATUSES.map((s) => {
              const list = byStatus.get(s.key)!;
              return (
                <div key={s.key}>
                  <div className="list-group-head"><span className={`dot st-${s.key}`} /> {s.label} <span className="n">{list.length}</span></div>
                  {list.map((t) => (
                    <div key={t.id} className="list-row" onClick={() => setOpenId(t.id)}>
                      <span className={`dot st-${t.status}`} />
                      <span className="tt">{t.title}</span>
                      <PriorityPill priority={t.priority} />
                      <DueLabel due={t.dueDate} />
                      {t.assignee && <span className="avatar-xs" title={t.assignee.name}>{t.assignee.avatar ? <img src={t.assignee.avatar} alt="" /> : initials(t.assignee.name)}</span>}
                    </div>
                  ))}
                  {addIn === s.key
                    ? <div style={{ padding: 10 }}><AddBox status={s.key} /></div>
                    : <button className="list-add" onClick={() => { setAddIn(s.key); setNewTitle(''); }}><Icon name="i-plus" /> New work item</button>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {openTask && (
        <TaskPanel
          task={openTask}
          members={members}
          onClose={() => setOpenId(null)}
          onChanged={onTaskChanged}
          onDeleted={() => onTaskDeleted(openTask.id)}
        />
      )}
    </>
  );
}
