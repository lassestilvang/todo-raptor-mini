'use client';

import Link from 'next/link';
import React from 'react';
import type { Task } from '../lib/types';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

type MotionComponent = React.ComponentType<any>;
let MotionDiv: MotionComponent | null = null;

function getMotionDiv(): MotionComponent {
  if (MotionDiv) return MotionDiv;
  try {
    const fm = require('framer-motion');
    MotionDiv = fm.motion?.div || ((props: any) => <div {...props} />);
  } catch (_err) {
    void _err;
    MotionDiv = (props: any) => <div {...props} />;
  }
  return MotionDiv as MotionComponent;
}

function TaskItem({ task, onUpdate }: { task: Task; onUpdate?: () => void }) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const MotionComponent = getMotionDiv();
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const now = new Date();
  const isOverdue = dueDate ? dueDate < now : false;
  const completed = Boolean(task.completedAt);

  const dueLabel = dueDate ? dateFormatter.format(dueDate) : null;

  const toggleCompleted = React.useCallback(async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });

      if (res.ok) {
        onUpdate?.();
      } else {
        const body = await res.json();
        console.warn('Unable to update task:', body.error || res.statusText);
      }
    } catch (err) {
      console.error('Task update failed', err);
    } finally {
      setIsUpdating(false);
    }
  }, [completed, isUpdating, onUpdate, task.id]);

  return (
    <MotionComponent
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:bg-card/80"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 text-sm font-semibold text-foreground/90">
            {completed ? '✅' : '📝'}
          </div>
          <div>
            <Link
              href={`/app/tasks/${task.id}`}
              className="text-sm font-semibold text-foreground transition hover:text-indigo-300"
            >
              {task.title}
            </Link>
            {task.notes ? (
              <div className="mt-1 text-xs text-foreground/60 max-h-10 overflow-hidden">{task.notes}</div>
            ) : null}
            {task.labels?.length ? (
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.15em] text-foreground/70">
                {task.labels.map((label: string) => (
                  <span
                    key={label}
                    className="rounded-full bg-slate-700/70 px-2.5 py-0.5 text-xs text-slate-100"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-xs font-medium sm:text-right">
          <div className="flex flex-wrap items-center gap-2">
            {task.priority && task.priority !== 'none' ? (
              <span
                className={`rounded-full px-3 py-1 ${
                  task.priority === 'high'
                    ? 'bg-rose-500/20 text-rose-200'
                    : task.priority === 'medium'
                    ? 'bg-amber-500/20 text-amber-100'
                    : 'bg-slate-500/20 text-slate-100'
                }`}
              >
                {task.priority}
              </span>
            ) : null}
            {dueLabel ? (
              <span
                className={`rounded-full px-3 py-1 ${
                  isOverdue ? 'bg-red-500/20 text-red-200' : 'bg-card/80 text-foreground/70'
                }`}
              >
                {dueLabel}
              </span>
            ) : null}
            {completed ? (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100">
                Completed
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={toggleCompleted}
            disabled={isUpdating}
            className="rounded-2xl bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/90 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={completed ? 'Mark task as incomplete' : 'Mark task as complete'}
          >
            {isUpdating ? 'Saving…' : completed ? 'Undo' : 'Complete'}
          </button>
        </div>
      </div>
    </MotionComponent>
  );
}

export default React.memo(TaskItem);
