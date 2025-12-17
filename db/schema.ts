import { sqliteTable, text, integer, boolean, timestamp, json } from 'drizzle-orm/sqlite-core'

export const lists = sqliteTable('lists', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  color: text('color'),
  emoji: text('emoji'),
  archived: boolean('archived').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  list_id: text('list_id').references(() => lists.id),
  title: text('title').notNull(),
  notes: text('notes'),
  status: text('status').default('todo'),
  priority: integer('priority').default(0),
  due_date: timestamp('due_date'),
  estimate_minutes: integer('estimate_minutes').default(0),
  actual_minutes: integer('actual_minutes').default(0),
  recurrence: json('recurrence'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  completed_at: timestamp('completed_at')
})

export const subtasks = sqliteTable('subtasks', {
  id: text('id').primaryKey(),
  task_id: text('task_id').references(() => tasks.id),
  title: text('title').notNull(),
  done: boolean('done').default(false),
  position: integer('position').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const labels = sqliteTable('labels', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
  icon: text('icon')
})

export const task_labels = sqliteTable('task_labels', {
  task_id: text('task_id').references(() => tasks.id),
  label_id: text('label_id').references(() => labels.id)
})

export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  task_id: text('task_id').references(() => tasks.id),
  filename: text('filename'),
  size: integer('size'),
  mime: text('mime'),
  storage_key: text('storage_key'),
  created_at: timestamp('created_at').defaultNow()
})

export const activity_log = sqliteTable('activity_log', {
  id: text('id').primaryKey(),
  entity_type: text('entity_type'),
  entity_id: text('entity_id'),
  action: text('action'),
  payload: json('payload'),
  performed_by: text('performed_by'),
  created_at: timestamp('created_at').defaultNow()
})
