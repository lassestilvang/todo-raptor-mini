'use client';

import Link from 'next/link';
import React from 'react';

type Props = { params: { taskId: string } };

export default function TaskDetail({ params }: Props) {
  const { taskId } = params;

  const [task, setTask] = React.useState<any | null>(null);
  const [activity, setActivity] = React.useState<any[]>([]);
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
      } catch (e: any) {
        if (e.name === 'AbortError') return;
        setError(e.message || 'Could not load task');
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
    } catch (e: any) {
      setError(e.message || 'Unable to update task');
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
    return <div className="text-sm text-red-300">{error}</div>;
  }

  if (!task) {
    return <div className="text-sm text-foreground/70">Task not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">{task.title}</h1>
          <p className="text-muted-foreground">{task.notes || 'No additional notes.'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {task.priority && task.priority !== 'none' ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${
                  task.priority === 'high'
                    ? 'bg-rose-500/20 text-rose-100'
                    : task.priority === 'medium'
                    ? 'bg-amber-500/20 text-amber-100'
                    : 'bg-slate-500/20 text-slate-100'
                }`}
              >
                {task.priority}
              </span>
            ) : null}
            {task.labels?.length ? (
              task.labels.map((label: string) => (
                <span
                  key={label}
                  className="rounded-full bg-slate-700/70 px-3 py-1 text-xs font-medium text-slate-100"
                >
                  {label}
                </span>
              ))
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
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
            ← Back to dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-3xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground/80">Activity</h3>
          <ul className="mt-4 space-y-3">
            {activity.length === 0 ? (
              <li className="text-sm text-foreground/70">No recent activity.</li>
            ) : (
              activity.map((a) => (
                <li key={a.id} className="text-sm text-foreground/90">
                  <span className="font-medium text-foreground">{a.action}</span>
                  <span className="ml-2 text-foreground/60">{new Date(a.createdAt).toLocaleString()}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <aside className="rounded-3xl border border-border bg-card p-5 text-sm text-foreground/80">
          <p>
            <span className="font-semibold text-foreground">List:</span>{' '}
            {task.listId === 'inbox' ? 'Inbox' : task.listId ?? 'Inbox'}
          </p>
          {task.dueDate ? (
            <p className="mt-3">
              <span className="font-semibold text-foreground">Due:</span>{' '}
              {new Date(task.dueDate).toLocaleString()}
            </p>
          ) : null}
          <p className="mt-3">
            <span className="font-semibold text-foreground">Status:</span>{' '}
            {task.completedAt ? 'Completed' : 'In progress'}
          </p>
          <p className="mt-3">
            <span className="font-semibold text-foreground">Created:</span>{' '}
            {new Date(task.createdAt).toLocaleString()}
          </p>
        </aside>
      </div>
    </div>
  );
}
