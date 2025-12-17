-- Initial schema for todo-raptor-mini

CREATE TABLE IF NOT EXISTS lists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  color TEXT,
  emoji TEXT,
  archived INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  list_id TEXT REFERENCES lists(id),
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'todo',
  priority INTEGER DEFAULT 0,
  due_date TEXT,
  estimate_minutes INTEGER DEFAULT 0,
  actual_minutes INTEGER DEFAULT 0,
  recurrence TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id),
  title TEXT NOT NULL,
  done INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS task_labels (
  task_id TEXT REFERENCES tasks(id),
  label_id TEXT REFERENCES labels(id),
  PRIMARY KEY (task_id, label_id)
);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id),
  filename TEXT,
  size INTEGER,
  mime TEXT,
  storage_key TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  entity_type TEXT,
  entity_id TEXT,
  action TEXT,
  payload TEXT,
  performed_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recurrence_exceptions (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id),
  instance_date TEXT,
  is_skipped INTEGER DEFAULT 0,
  overrides TEXT
);
