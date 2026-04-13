'use client';
import React from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<'light' | 'dark' | null>(null);

  React.useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage?.getItem?.('theme') ?? null;
    } catch {
      // Some environments (tests, insecure contexts) may disable localStorage.
      stored = null;
    }

    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = (stored as 'light' | 'dark') ?? (prefersDark ? 'dark' : 'light');

    setTheme(initial);
    if (initial === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);

    try {
      window.localStorage?.setItem?.('theme', next);
    } catch {
      // ignore
    }

    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }

  const emoji = theme === 'dark' ? '🌙' : '☀️';
  const label = theme === 'dark' ? 'Dark mode' : 'Light mode';

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-2xl bg-card px-3 py-2 text-sm font-medium text-foreground/90 transition hover:bg-card/80"
      aria-label={`${emoji} Toggle theme (${label})`}
    >
      {emoji}
    </button>
  );
}
