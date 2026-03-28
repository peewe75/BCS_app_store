import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/src/lib/auth/admin-server';

// GET /api/admin/apps — full app list
export async function GET() {
  const check = await verifyAdminAccess();
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { data, error } = await check.supabase
    .from('apps')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ apps: data });
}

// POST /api/admin/apps — create new app
export async function POST(req: NextRequest) {
  const check = await verifyAdminAccess();
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const body = await req.json();
  const { id, name, ...rest } = body;

  if (!id || !name) {
    return NextResponse.json({ error: 'id e name sono obbligatori.' }, { status: 400 });
  }

  const { data, error } = await check.supabase
    .from('apps')
    .insert({ id, name, ...rest })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ app: data }, { status: 201 });
}
