import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/src/lib/auth/admin-server';

// DELETE /api/admin/access-codes/[code]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const check = await verifyAdminAccess();
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { supabase } = check;
    const { code } = await params;

    const { error } = await supabase
      .from('access_codes')
      .update({ is_active: false })
      .eq('code', code);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
