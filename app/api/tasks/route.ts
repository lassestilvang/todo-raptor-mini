import { NextResponse } from 'next/server';
import { getTasks, createTask } from '../../../lib/task-service.server';
import { ensureSqlJsInitialized } from '../../../lib/db';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
  listId: z.string().optional(),
});

export async function GET(req: Request) {
  await ensureSqlJsInitialized();
  const url = new URL(req.url);
  const listId = url.searchParams.get('listId') || undefined;
  const tasks = await getTasks(listId);
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  try {
    await ensureSqlJsInitialized();
    const body = await req.json();
    const parsed = createTaskSchema.parse(body);
    const task = await createTask(parsed);
    return NextResponse.json({ task }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid input' }, { status: 400 });
  }
}
