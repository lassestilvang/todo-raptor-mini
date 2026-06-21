import { NextResponse, NextRequest } from 'next/server';
import { getActivityForEntity } from '../../../../../lib/activity-service.server';
import { resolveParams } from '../../../../../lib/api-utils.server';

export async function GET(
  req: NextRequest,
  { params }: { params: Record<string, string> | Promise<Record<string, string>> }
) {
  const { id } = await resolveParams(params);
  const activities = await getActivityForEntity('task', id);
  return NextResponse.json({ activities });
}
