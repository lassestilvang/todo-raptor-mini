'use client';
import React from 'react';
import type { Label } from '../lib/types';

export default function LabelChip({ label }: { label: Label }) {
  return (
    <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-slate-800 text-sm">
      {label.icon ? <span>{label.icon}</span> : null}
      <span>{label.name}</span>
    </span>
  );
}
