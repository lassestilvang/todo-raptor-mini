'use client';

import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import type { Task } from '../../../../lib/types';

type ActivityEntry = {
  id: string;
  action: string;
  createdAt: string;
};

type TaskDetailProps = {
  params: { taskId: string };
};

export default function TaskDetail({ params }: TaskDetailProps) {
  const { taskId } = params;

  const [task, setTask] = React.useState<Task | null>(null);
  const [activity, setActivity] = React.useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadTask() {
      try {
        setIsLoading(true);
        setError(null);

        const [taskRes, activityRes] = await Promise.all([
          fetch(`/api/tasks/${taskId}`, { signal: controller.signal }),
          fetch(`/api/tasks/${taskId}/activity`, { signal: controller.signal }),
        ]);

        if (!taskRes.ok) {
          const body = await taskRes.json();
          throw new Error(body.error || 'Task not found');
        }

        const taskJson = await taskRes.json();
        const activityJson = await activityRes.json();

        setTask(taskJson.task ?? null);
        setActivity(activityJson.activities ?? []);
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'AbortError') return;
        setError(e instanceof Error ? e.message : 'Could not load task');
        setTask(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadTask();
    return () => controller.abort();
  }, [taskId]);

  const toggleCompleted = React.useCallback(async () => {
    if (!task || isSaving) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completedAt }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || 'Unable to update task status');
      }

      const data = await response.json();
      setTask(data.task);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to update task');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, task, taskId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-700" />
        <div className="h-4 w-2/3 animate-pulse rounded-lg bg-slate-700" />
        <div className="space-y-3 pt-6">
          <div className="h-5 w-1/4 animate-pulse rounded bg-slate-700" />
          <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-700" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
      >
        {error}
      </motion.div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-4">🔍</span>
        <p className="text-foreground/70">Task not found.</p>
        <Link
          href="/app"
          className="mt-4 inline-flex items-center rounded-2xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-card/80"
        >
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const priorityColors: Record<string, string> = {
    high: 'bg-rose-500/20 text-rose-100',
    medium: 'bg-amber-500/20 text-amber-100',
    low: 'bg-slate-500/20 text-slate-100',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1
            className={`text-2xl font-semibold mb-2 ${task.completedAt ? 'line-through text-foreground/50' : ''}`}
          >
            {task.title}
          </h1>
          {task.notes ? (
            <p className="text-muted-foreground whitespace-pre-wrap">{task.notes}</p>
          ) : (
            <p className="text-muted-foreground/50 italic">No additional notes.</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {task.priority && task.priority !== 'none' ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${priorityColors[task.priority] || ''}`}
              >
                {task.priority}
              </span>
            ) : null}
            {task.labels?.length
              ? task.labels.map((label: string) => (
                  <span
                    key={label}
                    className="rounded-full bg-slate-700/70 px-3 py-1 text-xs font-medium text-slate-100"
                  >
                    {label}
                  </span>
                ))
              : null}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:items-end shrink-0">
          <button
            type="button"
            onClick={toggleCompleted}
            disabled={isSaving}
            className="inline-flex items-center rounded-2xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : task.completedAt ? 'Mark incomplete' : 'Mark complete'}
          </button>
          <Link
            href="/app"
            className="inline-flex items-center rounded-2xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-card/80"
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="rounded-3xl border border-border bg-card p-5"
        >
          <h3 className="text-sm font-medium text-foreground/80">Activity</h3>
          <ul className="mt-4 space-y-3">
            {activity.length === 0 ? (
              <li className="text-sm text-foreground/70">No recent activity.</li>
            ) : (
              activity.map((a) => (
                <li key={a.id} className="text-sm text-foreground/90 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span className="font-medium text-foreground capitalize">{a.action}</span>
                  <span className="text-foreground/60">
                    {new Date(a.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </li>
              ))
            )}
          </ul>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
          className="rounded-3xl border border-border bg-card p-5 text-sm text-foreground/80 space-y-3"
        >
          <div>
            <span className="font-semibold text-foreground">List:</span>{' '}
            {task.listId === 'inbox' ? 'Inbox' : (task.listId ?? 'Inbox')}
          </div>
          {task.dueDate ? (
            <div>
              <span className="font-semibold text-foreground">Due:</span>{' '}
              <span
                className={
                  new Date(task.dueDate) < new Date() && !task.completedAt ? 'text-red-300' : ''
                }
              >
                {new Date(task.dueDate).toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ) : null}
          <div>
            <span className="font-semibold text-foreground">Status:</span>{' '}
            <span className={task.completedAt ? 'text-emerald-300' : 'text-amber-300'}>
              {task.completedAt ? 'Completed' : 'In progress'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-foreground">Priority:</span>{' '}
            <span className="capitalize">{task.priority || 'none'}</span>
          </div>
          {task.estimateMinutes ? (
            <div>
              <span className="font-semibold text-foreground">Estimate:</span>{' '}
              {task.estimateMinutes} min
            </div>
          ) : null}
          <div>
            <span className="font-semibold text-foreground">Created:</span>{' '}
            {task.createdAt
              ? new Date(task.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}
