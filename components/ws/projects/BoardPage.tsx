'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { patch, post, TASK_STATUSES, type Task, type TaskStatus } from '../api';
import { qk, useProject, useTasks, useMembers } from '../hooks';
import { Icon, initials, useToast } from '../ui';
import Skeleton from '../Skeleton';
import { PriorityPill, DueLabel, pos } from './shared';
import TaskPanel from './TaskPanel';

const GAP = 1024;
type View = 'board' | 'list';

export default function BoardPage({ slug, projectId }: { slug: string; projectId: string }) {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();

  const projectQuery = useProject(projectId);
  const tasksQuery = useTasks(projectId);
  const membersQuery = useMembers(slug);

  const project = projectQuery.data ?? null;
  const tasks = tasksQuery.data ?? null;
  const members = membersQuery.data ?? [];
  const error = projectQuery.isError || tasksQuery.isError
    ? (projectQuery.error ?? tasksQuery.error) instanceof Error
      ? (projectQuery.error ?? tasksQuery.error)!.message
      : 'Could not load board.'
    : null;

  // Cache writers — replace the old local setState so optimistic updates land
  // in the shared query cache (and survive navigation / refetch).
  const setTasks = useCallback(
    (updater: (ts: Task[] | undefined) => Task[]) =>
      qc.setQueryData<Task[]>(qk.tasks(projectId), (old) => updater(old ?? [])),
    [qc, projectId],
  );
  const bumpTaskCount = useCallback(
    (delta: number) =>
      qc.setQueryData(qk.project(projectId), (p: any) =>
        p ? { ...p, _count: { tasks: Math.max(0, (p._count?.tasks ?? 0) + delta) } } : p,
      ),
    [qc, projectId],
  );

  const [openId, setOpenId] = useState<string | null>(null);
  const [addIn, setAddIn] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [view, setView] = useState<View>('board');
  const dragId = useRef<string | null>(null);
  const [drop, setDrop] = useState<{ status: TaskStatus; beforeId: string | null } | null>(null);

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
    const prev = qc.getQueryData<Task[]>(qk.tasks(projectId)) ?? tasks!;
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status, position } : t)));
    try {
      await patch<Task>(`/tasks/${id}`, { status, position });
    } catch (e: any) {
      qc.setQueryData(qk.tasks(projectId), prev); // rollback to pre-drag snapshot
      toast({ msg: e.message ?? 'Could not move task.', err: true });
    }
  }

  async function addTask(status: TaskStatus) {
    const title = newTitle.trim();
    if (!title) { setAddIn(null); return; }
    setNewTitle('');
    try {
      const t = await post<Task>(`/projects/${projectId}/tasks`, { title, status });
      setTasks((ts) => [...ts, t]);
      bumpTaskCount(+1);
    } catch (e: any) {
      toast({ msg: e.message ?? 'Could not add task.', err: true });
    }
  }

  function onTaskChanged(updated: Task) { setTasks((ts) => ts.map((t) => (t.id === updated.id ? updated : t))); }
  function onTaskDeleted(id: string) {
    setTasks((ts) => ts.filter((t) => t.id !== id));
    bumpTaskCount(-1);
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
  if (!project || !tasks) {
    // Skeleton board — mirrors the real layout so there's no jarring swap on load.
    return (
      <>
        <div className="content-head">
          <div className="crumb"><Skeleton w={22} h={22} r={6} /><Skeleton w={140} h={14} /></div>
        </div>
        <div className="board-wrap">
          <div className="board">
            {[0, 1, 2, 3].map((c) => (
              <div className="col" key={c}>
                <div className="col-head"><Skeleton w={90} h={12} /></div>
                <div className="col-body">
                  {Array.from({ length: 3 - (c % 2) }).map((_, i) => (
                    <div className="task-card" key={i} style={{ cursor: 'default' }}>
                      <div className="card-in">
                        <Skeleton h={13} style={{ marginBottom: 10 }} />
                        <Skeleton w="60%" h={11} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

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
