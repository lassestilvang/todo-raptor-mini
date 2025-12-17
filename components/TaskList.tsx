import React, { useEffect, useState } from 'react'
import TaskItem from './TaskItem'
import TaskForm from './TaskForm'

export default function TaskList({ listId = 'inbox' }: { listId?: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchTasks() {
    setLoading(true)
    const res = await fetch('/api/tasks')
    const data = await res.json()
    setTasks(data.tasks ?? data.tasks ?? data.tasks ?? data.tasks || data.tasks || data.tasks || data.tasks || [])
    setLoading(false)
  }

  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [listId])

  const filtered = React.useMemo(() => {
    if (!query) return tasks
    try {
      // lazy import fuse to keep bundle light
      const Fuse = require('fuse.js')
      const fuse = new Fuse(tasks, { keys: ['title', 'notes'], threshold: 0.3 })
      return fuse.search(query).map((r: any) => r.item)
    } catch (e) {
      return tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    }
  }, [tasks, query])

  return (
    <div>
      <div className="flex gap-2 items-center">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="mt-3">
        <TaskForm onCreate={fetchTasks} initialListId={listId} />
      </div>

      <div className="mt-4 space-y-2">
        {loading ? <div className="text-muted-foreground">Loading...</div> : null}
        {filtered.map(t => (
          <TaskItem key={t.id} task={t} />
        ))}
        {filtered.length === 0 && !loading ? <div className="text-muted-foreground">No tasks</div> : null}
      </div>
    </div>
  )
}
