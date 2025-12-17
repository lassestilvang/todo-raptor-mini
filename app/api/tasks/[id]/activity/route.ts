import { NextResponse, NextRequest } from 'next/server'
import { getActivityForEntity } from '../../../../../lib/activity-service.server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  // next.js route param may be a Promise in types; handle both
  const resolvedParams = params && typeof (params as any).then === 'function' ? await params : params
  const id = resolvedParams?.id
  const activities = await getActivityForEntity('task', id)
  return NextResponse.json({ activities })
}
