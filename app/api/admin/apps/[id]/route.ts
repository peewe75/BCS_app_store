import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/src/lib/auth/admin-server';

// PUT /api/admin/apps/[id] — update app
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await verifyAdminAccess();
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await params;
  const body = await req.json();

  // Don't allow changing the primary key
  delete body.id;

  const { data, error } = await check.supabase
    .from('apps')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'App non trovata.' }, { status: 404 });
  }

  return NextResponse.json({ app: data });
}

// DELETE /api/admin/apps/[id] — delete app
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await verifyAdminAccess();
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await params;

  const { error } = await check.supabase
    .from('apps')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
