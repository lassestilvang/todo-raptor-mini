import React from 'react';

type Props = { params: { taskId: string } };

export default function TaskDetail({ params }: Props) {
  const { taskId } = params;

  const [task, setTask] = React.useState<any | null>(null);
  const [activity, setActivity] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch(`/api/tasks`)
      .then((r) => r.json())
      .then((d) => setTask((d.tasks || []).find((t: any) => t.id === taskId) || null));
    fetch(`/api/tasks/${taskId}/activity`)
      .then((r) => r.json())
      .then((d) => setActivity(d.activities || []));
  }, [taskId]);

  if (!task) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">{task.title}</h1>
      <p className="text-muted-foreground">{task.notes}</p>

      <div className="mt-6">
        <h3 className="text-sm font-medium">Activity</h3>
        <ul className="mt-2">
          {activity.map((a) => (
            <li key={a.id} className="text-sm text-muted-foreground">
              {a.action} — {a.createdAt}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
