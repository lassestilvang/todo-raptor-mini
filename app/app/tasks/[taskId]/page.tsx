'use client';

import React from 'react';

type Props = { params: { taskId: string } };

export default function TaskDetail({ params }: Props) {
  const { taskId } = params;

  const [task, setTask] = React.useState<any | null>(null);
  const [activity, setActivity] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
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
      <div>
        <h1 className="text-2xl font-semibold mb-2">{task.title}</h1>
        <p className="text-muted-foreground">{task.notes || 'No additional notes.'}</p>
      </div>

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
    </div>
  );
}
