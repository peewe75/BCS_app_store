import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';

async function verifyAdmin() {
  if (!hasClerkServerConfig() || !hasSupabaseAdminConfig()) {
    return { error: 'Configurazione server mancante.', status: 503 as const };
  }
  const { userId } = await auth();
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  if (!userId || role !== 'admin') {
    return { error: 'Accesso admin richiesto.', status: 403 as const };
  }
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { error: 'Supabase admin non disponibile.', status: 503 as const };
  }
  return { supabase };
}

// DELETE /api/admin/access-codes/[code]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const check = await verifyAdmin();
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
