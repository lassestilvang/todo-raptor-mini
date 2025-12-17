import { NextResponse } from 'next/server'
import { getActivityForEntity } from '../../../../lib/activity-service.server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url)
  // next.js route param is available via params
  const id = params.id
  const activities = await getActivityForEntity('task', id)
  return NextResponse.json({ activities })
}
