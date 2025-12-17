'use client';
import React from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<'light' | 'dark' | null>(null);

  React.useEffect(() => {
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }

  return (
    <button onClick={toggle} className="px-2 py-1 rounded bg-slate-800">
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
