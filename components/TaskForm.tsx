import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCachedResource } from '../lib/client-cache';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
  listId: z.string().optional(),
  labels: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['none', 'low', 'medium', 'high']).optional(),
});
type FormData = z.infer<typeof schema>;

export default function TaskForm({
  onCreate,
  initialListId,
}: {
  onCreate?: () => void;
  initialListId?: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { listId: initialListId ?? 'inbox' },
  });

  const lists = useCachedResource('lists');
  const labels = useCachedResource('labels');

  React.useEffect(() => {
    reset({ listId: initialListId ?? 'inbox' });
  }, [initialListId, reset]);

  async function onSubmit(data: FormData) {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        listId: data.listId || initialListId || 'inbox',
        labels: data.labels ? (Array.isArray(data.labels) ? data.labels : [data.labels]) : [],
      }),
    });
    reset({ listId: initialListId ?? 'inbox' });
    onCreate?.();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex gap-2 flex-col"
      aria-busy={isSubmitting}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="task-title" className="sr-only">
          Task title
        </label>
        <input
          id="task-title"
          {...register('title')}
          className="flex-1 px-3 py-2 rounded bg-slate-800 placeholder:text-muted-foreground"
          placeholder="Add a task"
          required
        />

        <label htmlFor="task-due" className="sr-only">
          Due date
        </label>
        <input
          id="task-due"
          type="datetime-local"
          {...register('dueDate')}
          className="w-44 rounded bg-slate-800 px-3 py-2 text-sm text-foreground"
        />

        <label htmlFor="task-priority" className="sr-only">
          Priority
        </label>
        <select
          id="task-priority"
          {...register('priority')}
          className="w-32 rounded bg-slate-800 px-3 py-2 text-sm text-foreground"
          defaultValue="none"
        >
          <option value="none">Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label htmlFor="task-list" className="sr-only">
          List
        </label>
        <select
          id="task-list"
          {...register('listId')}
          className="px-3 py-2 rounded bg-slate-800"
          defaultValue={initialListId ?? 'inbox'}
        >
          <option value="inbox">Inbox</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Adding…' : 'Add'}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Labels:</span>
          <div className="flex flex-wrap gap-2">
            {labels.length > 0 ? (
              labels.map((l) => (
                <label key={l.id} className="inline-flex items-center gap-2 text-foreground/80">
                  <input type="checkbox" value={l.id} {...register('labels')} />
                  <span>{l.icon ? `${l.icon} ` : ''}</span>
                  <span>{l.name}</span>
                </label>
              ))
            ) : (
              <span className="text-foreground/50">No labels yet</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <label htmlFor="task-notes" className="block text-sm text-muted-foreground">
          Notes
        </label>
        <textarea
          id="task-notes"
          {...register('notes')}
          className="w-full mt-1 p-2 rounded bg-slate-800"
          rows={3}
        />
      </div>
    </form>
  );
}
