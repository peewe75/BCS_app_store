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

// GET /api/admin/plan-features?app_id=softi
// Returns all billing plans for an app, including their features arrays
export async function GET(req: NextRequest) {
  try {
    const check = await verifyAdmin();
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { supabase } = check;

    const appId = req.nextUrl.searchParams.get('app_id');
    if (!appId) {
      return NextResponse.json({ error: 'app_id è obbligatorio.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('app_billing_plans')
      .select('app_id, plan_code, billing_type, stripe_price_id, grant_plan, features, is_active')
      .eq('app_id', appId)
      .order('plan_code');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plans: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/admin/plan-features
// Body: { app_id, plan_code, features: string[] }
// Updates the features array for a specific plan
export async function PUT(req: NextRequest) {
  try {
    const check = await verifyAdmin();
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { supabase } = check;

    const body = (await req.json()) as {
      app_id?: string;
      plan_code?: string;
      features?: string[];
    };
    const { app_id, plan_code, features } = body;

    if (!app_id || !plan_code || !Array.isArray(features)) {
      return NextResponse.json(
        { error: 'app_id, plan_code e features sono obbligatori.' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('app_billing_plans')
      .update({ features })
      .eq('app_id', app_id)
      .eq('plan_code', plan_code);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
