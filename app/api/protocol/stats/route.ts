import { NextResponse } from 'next/server';
import { getProtocolStats } from '@/lib/windmill';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getProtocolStats());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load protocol statistics.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
