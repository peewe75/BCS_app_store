import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { id } = await params
  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database non disponibile.' }, { status: 500 })
  }

  const { data: report, error } = await supabase
    .from('trading_reports')
    .select('status, net_profit, tax_due')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !report) {
    return NextResponse.json({ error: 'Report non trovato.' }, { status: 404 })
  }

  return NextResponse.json({
    status: report.status,
    net_profit: report.net_profit,
    tax_due: report.tax_due,
  })
}
