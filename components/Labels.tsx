'use client';

import { useCachedResource } from '../lib/client-cache';

export default function Labels() {
  const labels = useCachedResource('labels');

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((l: any) => (
        <div
          key={l.id}
          className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/90"
          style={{ backgroundColor: l.color ? l.color : undefined }}
        >
          {l.icon ? <span>{l.icon}</span> : null}
          <span>{l.name}</span>
        </div>
      ))}
    </div>
  );
}
