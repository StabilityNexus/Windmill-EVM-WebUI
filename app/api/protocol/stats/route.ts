import { NextResponse } from 'next/server';
import { getProtocolStats } from '@/lib/windmill';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.WINDMILL_RPC_URL || !process.env.WINDMILL_CONTRACT_ADDRESS) {
      const url = (process.env.KEEPER_TELEMETRY_URLS ?? '').split(',').map((value) => value.trim()).find(Boolean);
      if (!url) throw new Error('Configure WINDMILL_RPC_URL and WINDMILL_CONTRACT_ADDRESS, or set KEEPER_TELEMETRY_URLS for local telemetry mode.');
      const response = await fetch(`${url.replace(/\/$/, '')}/stats`, { cache: 'no-store', signal: AbortSignal.timeout(3_000) });
      if (!response.ok) throw new Error(`Local Keeper responded with ${response.status}.`);
      return NextResponse.json(await response.json());
    }
    return NextResponse.json(await getProtocolStats());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load protocol statistics.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
