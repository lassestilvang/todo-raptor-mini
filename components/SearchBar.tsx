'use client';
import React from 'react';

export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      placeholder="Search tasks"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded bg-slate-800 placeholder:text-muted-foreground"
    />
  );
}
