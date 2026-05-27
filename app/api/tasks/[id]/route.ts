import { NextResponse } from 'next/server';
import { getTaskById } from '../../../../lib/task-service.server';
import { ensureSqlJsInitialized } from '../../../../lib/db';

export async function GET(req: Request, { params }: { params: any }) {
  const resolvedParams =
    params && typeof (params as any).then === 'function' ? await params : params;
  const id = resolvedParams?.id;

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
