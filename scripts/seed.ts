#!/usr/bin/env bun
import fs from 'fs';
import path from 'path';
import { initDb } from '../lib/db';

const conn = new (require('better-sqlite3'))(':memory:');
const migrationsSql = fs.readFileSync(
  path.join(process.cwd(), 'db', 'migrations', '001_initial.sql'),
  'utf8'
);
conn.exec(migrationsSql);
initDb(conn);
(async () => {
  const { createList } = await import('../lib/list-service.server');
  const { createTask } = await import('../lib/task-service.server');

  const inbox = await createList({ title: 'Inbox', emoji: '📥', color: '#64748b' });
  const work = await createList({ title: 'Work', emoji: '💼', color: '#7c3aed' });

  await createTask({
    title: 'Welcome to Todo Raptor',
    notes: 'This is your inbox task. Edit or delete it.',
    listId: inbox.id,
  });
  await createTask({
    title: 'Plan project',
    notes: 'Create milestones and schedule user interviews.',
    listId: work.id,
  });

  console.log(
    'Seeded sample lists and tasks (in-memory). To persist, run a similar script against your DB file.'
  );
})();
