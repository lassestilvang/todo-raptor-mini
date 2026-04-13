'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Lists() {
  const [lists, setLists] = useState<any[]>([]);

  async function fetchLists() {
    const res = await fetch('/api/lists');
    const data = await res.json();
    setLists(data.lists || []);
  }

  useEffect(() => {
    fetchLists();
  }, []);

  return (
    <div className="flex flex-col gap-1">
      {lists.map((l) => (
        <Link
          key={l.id}
          href={`/app/lists/${l.id}`}
          className="text-sm rounded-lg px-3 py-2 transition-colors hover:bg-card/80 text-foreground/80"
        >
          {l.emoji ? `${l.emoji} ` : ''}
          {l.title}
        </Link>
      ))}
    </div>
  );
}
