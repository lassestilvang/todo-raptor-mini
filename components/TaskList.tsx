'use client';

import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { Task } from '../lib/types';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import SearchBar from './SearchBar';

let cachedFuse: any = null;
function getFuse() {
  if (cachedFuse) return cachedFuse;
  try {
    cachedFuse = require('fuse.js');
    return cachedFuse;
  } catch (_err) {
    void _err;
    return null;
  }
}

export default function TaskList({ listId }: { listId?: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query);

  async function fetchTasks(signal?: AbortSignal) {
    setLoading(true);
    setError(null);
    const queryParam = listId ? `?listId=${encodeURIComponent(listId)}` : '';

    try {
      const res = await fetch(`/api/tasks${queryParam}`, { signal });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Unable to load tasks');
      }
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to load tasks');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void fetchTasks(controller.signal);
    return () => controller.abort();
  }, [listId]);

  useEffect(() => {
    const handler = window.setTimeout(() => setQuery(search), 150);
    return () => window.clearTimeout(handler);
  }, [search]);

  const filtered = useMemo(() => {
    if (!deferredQuery) return tasks;
    try {
      const Fuse = getFuse();
      if (!Fuse) throw new Error('Fuse unavailable');
      const fuse = new Fuse(tasks, { keys: ['title', 'notes'], threshold: 0.3 });
      return fuse.search(deferredQuery).map((r: any) => r.item);
    } catch (_err) {
      void _err;
      return tasks.filter((t) => t.title.toLowerCase().includes(deferredQuery.toLowerCase()));
    }
  }, [tasks, deferredQuery]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Tasks</h2>
          <p className="text-sm text-foreground/70" aria-live="polite">
            {loading
              ? 'Loading tasks…'
              : filtered.length === 0
              ? 'No tasks yet — your day is clear!'
              : `Showing ${filtered.length} task${filtered.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </header>

      <section className="rounded-3xl bg-card border border-border p-5 shadow-[var(--shadow-soft)]">
        <TaskForm onCreate={fetchTasks} initialListId={listId} />
      </section>

      {error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <section className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-3xl bg-slate-800/70 animate-pulse"
              />
            ))}
          </div>
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
              <TaskItem key={t.id} task={t} onUpdate={fetchTasks} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
