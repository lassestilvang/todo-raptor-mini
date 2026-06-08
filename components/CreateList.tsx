'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { invalidateResource } from '../lib/client-cache';

const schema = z.object({
  title: z.string().min(1),
  emoji: z.string().optional(),
  color: z.string().optional(),
});

export default function CreateList() {
  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(schema) });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    reset();
    invalidateResource('lists');
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2" aria-busy={isSubmitting}>
      <div className="flex gap-2">
        <input
          {...register('emoji')}
          placeholder="Emoji (list)"
          disabled={isSubmitting}
          className="w-14 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <input
          {...register('title')}
          placeholder="New list"
          disabled={isSubmitting}
          className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Adding…' : 'Add'}
        </button>
      </div>
    </form>
  );
}
