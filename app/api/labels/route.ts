import { NextResponse } from 'next/server';
import { createLabel, getLabels } from '../../../lib/label-service.server';
import { ensureSqlJsInitialized } from '../../../lib/db';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export async function GET() {
  await ensureSqlJsInitialized();
  const labels = await getLabels();
  return NextResponse.json({ labels });
}

export async function POST(req: Request) {
  try {
    await ensureSqlJsInitialized();
    const body = await req.json();
    const parsed = createSchema.parse(body);
    const label = await createLabel(parsed);
    return NextResponse.json({ label }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid' }, { status: 400 });
  }
}
