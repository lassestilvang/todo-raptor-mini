import { NextResponse } from 'next/server';
import { getTaskById, updateTask } from '../../../../lib/task-service.server';
import { ensureSqlJsInitialized } from '../../../../lib/db';
import { resolveParams } from '../../../../lib/api-utils.server';
import { z } from 'zod';

const patchSchema = z.object({
  completed: z.boolean().optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['none', 'low', 'medium', 'high']).optional(),
  listId: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

export async function GET(req: Request, { params }: { params: any }) {
  const { id } = await resolveParams(params);

  if (!id) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
  }

  await ensureSqlJsInitialized();
  const task = await getTaskById(id);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function PATCH(req: Request, { params }: { params: any }) {
  const { id } = await resolveParams(params);

  if (!id) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = patchSchema.parse(body);
    const completedAt = parsed.completed ? new Date().toISOString() : null;
    const task = await updateTask(id, {
      completedAt,
      notes: parsed.notes,
      dueDate: parsed.dueDate,
      priority: parsed.priority,
      listId: parsed.listId,
      labels: parsed.labels,
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 400 });
  }
}
