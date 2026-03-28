import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/src/lib/auth/admin-server';

// GET /api/admin/plan-features?app_id=softi
// Returns all billing plans for an app, including their features arrays
export async function GET(req: NextRequest) {
  try {
    const check = await verifyAdminAccess();
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
      .select('app_id, plan_code, billing_type, stripe_price_id, grant_plan, features, is_active, limits, trial_days')
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
// Body: { app_id, plan_code, features: string[], limits?: Record<string,unknown>, trial_days?: number }
// Updates the features array (and optionally limits/trial_days) for a specific plan
export async function PUT(req: NextRequest) {
  try {
    const check = await verifyAdminAccess();
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { supabase } = check;

    const body = (await req.json()) as {
      app_id?: string;
      plan_code?: string;
      features?: string[];
      limits?: Record<string, unknown>;
      trial_days?: number;
    };
    const { app_id, plan_code, features, limits, trial_days } = body;

    if (!app_id || !plan_code || !Array.isArray(features)) {
      return NextResponse.json(
        { error: 'app_id, plan_code e features sono obbligatori.' },
        { status: 400 },
      );
    }

    const updateObj: Record<string, unknown> = { features };
    if (limits !== undefined) updateObj.limits = limits;
    if (trial_days !== undefined) updateObj.trial_days = trial_days;

    const { error } = await supabase
      .from('app_billing_plans')
      .update(updateObj)
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
