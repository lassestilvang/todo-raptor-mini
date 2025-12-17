import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({ title: z.string().min(1), notes: z.string().optional(), listId: z.string().optional(), labels: z.any().optional() })
type FormData = z.infer<typeof schema>

export default function TaskForm({ onCreate, initialListId }: { onCreate?: () => void; initialListId?: string }) {
  const { register, handleSubmit, reset } = useForm<FormData>({ resolver: zodResolver(schema) })
  const [lists, setLists] = React.useState<any[]>([])
  const [labels, setLabels] = React.useState<any[]>([])

  React.useEffect(() => {
    fetch('/api/lists').then(r => r.json()).then(d => setLists(d.lists || []))
    fetch('/api/labels').then(r => r.json()).then(d => setLabels(d.labels || []))
  }, [])

  async function onSubmit(data: FormData) {
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, listId: data.listId ?? initialListId, labels: data.labels ? (Array.isArray(data.labels) ? data.labels : [data.labels]) : [] }) })
    reset()
    onCreate?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 flex-col">
      <div className="flex gap-2">
        <input {...register('title')} className="flex-1 px-3 py-2 rounded bg-slate-800 placeholder:text-muted-foreground" placeholder="Add a task" />
        <select {...register('listId')} defaultValue={initialListId} className="px-2 py-2 rounded bg-slate-800">
          <option value="">Inbox</option>
          {lists.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <button type="submit" className="px-3 py-2 rounded bg-blue-600">Add</button>
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-sm text-muted-foreground">Labels:</label>
        <div className="flex gap-2">
          {labels.map(l => (
            <label key={l.id} className="text-sm flex items-center gap-1"><input type="checkbox" value={l.id} {...register('labels')} /> {l.icon ? `${l.icon} ` : ''}{l.name}</label>
          ))}
        </div>
      </div>

      <div className="mt-2">
        <label className="text-sm text-muted-foreground">Notes</label>
        <textarea {...register('notes')} className="w-full mt-1 p-2 rounded bg-slate-800" />
      </div>
    </form>
  )
}
