'use client';

import React, { useEffect, useState } from 'react';

export default function Labels() {
  const [labels, setLabels] = useState<any[]>([]);

  async function fetchLabels() {
    const res = await fetch('/api/labels');
    const data = await res.json();
    setLabels(data.labels || []);
  }

  useEffect(() => {
    fetchLabels();
  }, []);

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((l) => (
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
