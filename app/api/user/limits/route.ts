import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { hasClerkServerConfig, hasSupabaseAdminConfig } from '@/src/lib/env';

// GET /api/user/limits?app_id=softi
export async function GET(req: NextRequest) {
  try {
    if (!hasClerkServerConfig() || !hasSupabaseAdminConfig()) {
      return NextResponse.json({ error: 'Configurazione server mancante.' }, { status: 503 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
    }

    const appId = req.nextUrl.searchParams.get('app_id');
    if (!appId) {
      return NextResponse.json({ error: 'app_id è obbligatorio.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin non disponibile.' }, { status: 503 });
    }

    // Get user's grant
    const { data: grant } = await supabase
      .from('user_apps')
      .select('plan')
      .eq('user_id', userId)
      .eq('app_id', appId)
      .maybeSingle();

    if (!grant?.plan) {
      return NextResponse.json({ plan: null, limits: {}, usage: {} });
    }

    // Get plan limits
    const { data: planRow } = await supabase
      .from('app_billing_plans')
      .select('limits')
      .eq('app_id', appId)
      .eq('plan_code', grant.plan)
      .eq('is_active', true)
      .maybeSingle();

    const limits = (planRow?.limits as Record<string, unknown>) ?? {};

    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    const { data: usageRows } = await supabase
      .from('user_usage')
      .select('action, count')
      .eq('user_id', userId)
      .eq('app_id', appId)
      .eq('period', today);

    const usage: Record<string, number> = {};
    for (const row of usageRows ?? []) {
      usage[row.action as string] = row.count as number;
    }

    return NextResponse.json({ plan: grant.plan, limits, usage });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore imprevisto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
