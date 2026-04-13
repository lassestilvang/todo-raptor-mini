'use client';

import React, { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import SearchBar from './SearchBar';

export default function TaskList({ listId = 'inbox' }: { listId?: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchTasks() {
    setLoading(true);
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.tasks || []);
    setLoading(false);
  }

  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [listId]);

  const filtered = React.useMemo(() => {
    if (!query) return tasks;
    try {
      // lazy import fuse to keep bundle light
      const Fuse = require('fuse.js');
      const fuse = new Fuse(tasks, { keys: ['title', 'notes'], threshold: 0.3 });
      return fuse.search(query).map((r: any) => r.item);
    } catch (_err) {
      void _err;
      return tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));
    }
  }, [tasks, query]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Tasks</h2>
          <p className="text-sm text-foreground/70">
            {filtered.length === 0 && !loading
              ? 'No tasks yet — your day is clear!'
              : `Showing ${filtered.length} task${filtered.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </header>

      <section className="rounded-3xl bg-card border border-border p-5 shadow-[var(--shadow-soft)]">
        <TaskForm onCreate={fetchTasks} initialListId={listId} />
      </section>

      <section className="space-y-3">
        {loading ? (
          <div className="text-foreground/60">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 animate-pulse">
              <span className="text-2xl">🦖</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No tasks yet</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Add a task to start tracking your day.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t: any) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
