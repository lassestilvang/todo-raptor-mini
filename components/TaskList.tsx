'use client';

import React, { useDeferredValue, useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

export default function TaskList({ listId, view }: { listId?: string; view?: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query);

  const fetchTasks = useCallback(
    async (signal?: AbortSignal) => {
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
    },
    [listId]
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchTasks(controller.signal);
    return () => controller.abort();
  }, [fetchTasks]);

  useEffect(() => {
    const handler = window.setTimeout(() => setQuery(search), 150);
    return () => window.clearTimeout(handler);
  }, [search]);

  const viewFiltered = useMemo(() => {
    if (!view || view === 'all') return tasks;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);
    const next7End = new Date(todayStart.getTime() + 7 * 86400000);

    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      switch (view) {
        case 'today':
          return due >= todayStart && due < todayEnd;
        case 'next7':
          return due >= todayStart && due < next7End;
        case 'upcoming':
          return due >= todayStart;
        default:
          return true;
      }
    });
  }, [tasks, view]);

  const filtered = useMemo(() => {
    const source = view ? viewFiltered : tasks;
    if (!deferredQuery) return source;
    try {
      const Fuse = getFuse();
      if (!Fuse) throw new Error('Fuse unavailable');
      const fuse = new Fuse(source, { keys: ['title', 'notes'], threshold: 0.3 });
      return fuse.search(deferredQuery).map((r: any) => r.item);
    } catch (_err) {
      void _err;
      return source.filter((t) => t.title.toLowerCase().includes(deferredQuery.toLowerCase()));
    }
  }, [tasks, viewFiltered, view, deferredQuery]);

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
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100"
        >
          {error}
        </motion.div>
      ) : null}

      <section className="space-y-3">
        {loading && tasks.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 rounded-3xl bg-slate-800/70 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-border bg-card px-6 py-10 text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
              <span className="text-2xl">🦖</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No tasks yet</h3>
            <p className="mt-2 text-sm text-foreground/70">
              {deferredQuery
                ? 'No tasks match your search.'
                : 'Add a task above to start tracking your day.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((t) => (
                <TaskItem key={t.id} task={t} onUpdate={fetchTasks} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
