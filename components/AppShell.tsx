'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 backdrop-blur bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-foreground/90 transition hover:bg-card/80 lg:hidden"
            aria-label="Open sidebar"
          >
            <span className="text-lg">☰</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg flex items-center justify-center text-xl">
              🦖
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Todo Raptor</h1>
              <p className="text-xs text-foreground/70">Organize your day with speed and style</p>
            </div>
          </div>
        </div>

        <ThemeToggle />
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="hidden lg:flex flex-col rounded-3xl bg-card border border-border backdrop-blur p-5 shadow-[var(--shadow-soft)] max-h-[calc(100vh-160px)]">
          <div className="flex-1 min-h-0 overflow-y-auto pb-4">
            <Sidebar />
          </div>
        </aside>

        <main className="rounded-3xl bg-card border border-border backdrop-blur p-6 shadow-[var(--shadow-soft)]">
          {children}
        </main>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-full rounded-r-3xl bg-card/70 border border-border p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Navigation</h2>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg px-2 py-1 text-foreground/80 hover:bg-card/80"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>
            <div className="mt-5 max-h-[calc(100vh-160px)] overflow-y-auto">
              <Sidebar />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
