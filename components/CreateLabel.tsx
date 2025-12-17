'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export default function CreateLabel() {
  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data: any) {
    await fetch('/api/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    reset();
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mt-2">
      <input
        {...register('icon')}
        placeholder="Icon"
        className="w-12 px-2 py-1 rounded bg-slate-800"
      />
      <input
        {...register('name')}
        placeholder="Label"
        className="flex-1 px-2 py-1 rounded bg-slate-800"
      />
      <button className="px-2 py-1 rounded bg-amber-600">Add</button>
    </form>
  );
}
