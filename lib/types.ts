export type Priority = 'high' | 'medium' | 'low' | 'none';

export interface List {
  id: string;
  title: string;
  color?: string;
  emoji?: string;
}

export interface Label {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
}

export type RecurrenceFrequency = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly';

export interface Recurrence {
  frequency: RecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  month?: number;
  endDate?: string;
  count?: number;
}

export interface Attachment {
  id: string;
  taskId: string;
  filename: string;
  size: number;
  mime: string;
  storageKey: string;
  createdAt: string;
}

export interface Task {
  id: string;
  listId?: string;
  title: string;
  notes?: string;
  dueDate?: string | null;
  deadline?: string | null;
  reminders?: string[];
  estimateMinutes?: number;
  actualMinutes?: number;
  labels?: string[];
  priority?: Priority;
  subtasks?: Subtask[];
  recurrence?: Recurrence | null;
  attachments?: Attachment[];
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
}
