import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const urls = (process.env.KEEPER_TELEMETRY_URLS ?? '').split(',').map((url) => url.trim()).filter(Boolean);
  if (urls.length === 0) return NextResponse.json({ error: 'KEEPER_TELEMETRY_URLS is not configured.' }, { status: 503 });

  const results = await Promise.allSettled(urls.map(async (url) => {
    const response = await fetch(`${url.replace(/\/$/, '')}/health`, { cache: 'no-store', signal: AbortSignal.timeout(3_000) });
    if (!response.ok) throw new Error(`Keeper responded with ${response.status}.`);
    return response.json();
  }));
  const keepers = results.map((result, index) => result.status === 'fulfilled'
    ? { ...result.value, status: 'online' }
    : { id: `keeper-${index + 1}`, status: 'offline', error: result.reason instanceof Error ? result.reason.message : 'Keeper unavailable' });
  return NextResponse.json({ updatedAt: new Date().toISOString(), keepers });
}
