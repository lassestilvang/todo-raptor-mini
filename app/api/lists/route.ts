import { NextResponse } from 'next/server';
import { createList, getLists } from '../../../lib/list-service.server';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1),
  color: z.string().optional(),
  emoji: z.string().optional(),
});

export async function GET() {
  const lists = await getLists();
  return NextResponse.json({ lists });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createSchema.parse(body);
    const list = await createList(parsed);
    return NextResponse.json({ list }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid' }, { status: 400 });
  }
}
