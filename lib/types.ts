export type Priority = 'high' | 'medium' | 'low' | 'none'

export interface List {
  id: string
  title: string
  color?: string
  emoji?: string
}

export interface Subtask {
  id: string
  taskId: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  listId?: string
  title: string
  notes?: string
  dueDate?: string | null
  deadline?: string | null
  reminders?: string[]
  estimateMinutes?: number
  actualMinutes?: number
  labels?: string[]
  priority?: Priority
  subtasks?: Subtask[]
  recurrence?: any
  attachments?: any[]
  createdAt?: string
  updatedAt?: string
  completedAt?: string | null
}
