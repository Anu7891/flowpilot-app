'use client';
import { Icon } from '../ui';
import type { TaskPriority } from '../api';

export function PriorityPill({ priority }: { priority: TaskPriority }) {
  if (priority === 'NONE') return null;
  const icon = priority === 'URGENT' ? 'i-zap' : priority === 'HIGH' ? 'i-warn' : 'i-target';
  const label = priority[0] + priority.slice(1).toLowerCase();
  return <span className={`prio prio-${priority}`}><Icon name={icon} /> {label}</span>;
}

export function DueLabel({ due }: { due: string | null }) {
  if (!due) return null;
  const d = new Date(due);
  const overdue = d.getTime() < Date.now() - 86_400_000;
  const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  return <span className={`due ${overdue ? 'overdue' : ''}`}><Icon name="i-cal" /> {label}</span>;
}

export const pos = (p: string | number) => (typeof p === 'number' ? p : parseFloat(p) || 0);
