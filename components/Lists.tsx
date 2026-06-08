'use client';

import Link from 'next/link';
import { useCachedResource } from '../lib/client-cache';

export default function Lists() {
  const lists = useCachedResource('lists');

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
