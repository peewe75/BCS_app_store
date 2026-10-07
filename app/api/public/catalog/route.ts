import { NextResponse } from 'next/server';
import { getSwaTools } from '@/src/lib/swa-marketplace';

export async function GET() {
  const tools = (await getSwaTools()).map(({ id, is_internal, is_coming_soon, cta_href, copy }) => ({
    id, is_internal, is_coming_soon, cta_href, copy,
  }));
  return NextResponse.json({ tools }, { headers: { 'Cache-Control': 'public, max-age=60' } });
}
