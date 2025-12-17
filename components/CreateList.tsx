"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({ title: z.string().min(1), emoji: z.string().optional(), color: z.string().optional() })

export default function CreateList() {
  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(data: any) {
    await fetch('/api/lists', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    reset()
    // no event bus yet; just reload page
    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mt-2">
      <input {...register('emoji')} placeholder="Emoji" className="w-12 px-2 py-1 rounded bg-slate-800" />
      <input {...register('title')} placeholder="New list" className="flex-1 px-2 py-1 rounded bg-slate-800" />
      <button className="px-2 py-1 rounded bg-indigo-600">Add</button>
    </form>
  )
}
