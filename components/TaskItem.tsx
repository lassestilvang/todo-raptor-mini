import React from 'react'

'use client'
import { motion } from 'framer-motion'

export default function TaskItem({ task }: { task: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 border-b border-slate-800 hover:bg-slate-800 rounded">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{task.title}</div>
          {task.notes ? <div className="text-sm text-muted-foreground">{task.notes}</div> : null}
        </div>
        <div className="text-sm text-muted-foreground">{task.dueDate ? new Date(task.dueDate).toLocaleString() : ''}</div>
      </div>
    </motion.div>
  )
}
