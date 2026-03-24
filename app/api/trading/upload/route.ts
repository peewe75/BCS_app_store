import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { isYearAllowedForPlan, PLAN_DETAILS } from '@/src/apps/trading/plans'
import { buildUploadBlobKey, buildBlobKey, saveTextBlob, saveBlob } from '@/src/apps/trading/storage'
import { getReportYears, parseHtmlReport, calculateTax, generateReportPdf } from '@/src/apps/trading/report-engine'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import type { Plan } from '@/src/apps/trading/types'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Configurazione database non disponibile.' }, { status: 500 })
  }

  // Get user's grant for the trading app to determine plan
  const { data: grant } = await supabase
    .from('user_apps')
    .select('plan')
    .eq('user_id', userId)
    .eq('app_id', 'trading')
    .maybeSingle()

  // Check if admin via Clerk publicMetadata (reliable, no Supabase dependency)
  const clerkUser = await currentUser()
  const isAdmin = (clerkUser?.publicMetadata?.role as string | undefined) === 'admin'
  const plan = (grant?.plan as Plan) ?? (isAdmin ? 'pro' : null)

  if (!plan) {
    return NextResponse.json(
      { error: 'Nessun piano attivo. Completa prima il pagamento.' },
      { status: 403 }
    )
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const year = Number(formData.get('year')) || new Date().getFullYear() - 1

  if (!file) return NextResponse.json({ error: 'File mancante.' }, { status: 400 })
  if (!file.name.match(/\.(htm|html)$/i)) {
    return NextResponse.json(
      { error: 'Formato non supportato. Carica un file .htm o .html.' },
      { status: 400 }
    )
  }

  if (!isYearAllowedForPlan(plan, year)) {
    return NextResponse.json(
      { error: 'Il piano attivo consente upload solo per anno corrente e precedente.' },
      { status: 403 }
    )
  }

  const maxReportsPerYear = PLAN_DETAILS[plan].maxReportsPerYear

  if (maxReportsPerYear !== null) {
    const { count } = await supabase
      .from('trading_reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('year', year)
      .in('status', ['processing', 'ready'])

    if ((count ?? 0) >= maxReportsPerYear) {
      return NextResponse.json(
        {
          error: `Limite raggiunto per il piano ${plan}: massimo ${maxReportsPerYear} report per l anno fiscale ${year}.`,
        },
        { status: 403 }
      )
    }
  }

  const htmlContent = await file.text()
  const parsedReport = parseHtmlReport(htmlContent)
  const availableYears = getReportYears(parsedReport.trades, parsedReport.balances)

  if (availableYears.length > 0 && !availableYears.includes(year)) {
    return NextResponse.json(
      {
        error: `Il file caricato non contiene movimenti per il ${year}. Anni rilevati nel report: ${availableYears.join(', ')}.`,
      },
      { status: 400 }
    )
  }

  // Create report record
  const { data: report, error: reportError } = await supabase
    .from('trading_reports')
    .insert({
      user_id: userId,
      filename: file.name,
      storage_key: '',
      plan,
      status: 'processing',
      year,
    })
    .select()
    .single()

  if (reportError || !report) {
    return NextResponse.json({ error: 'Errore in creazione report.' }, { status: 500 })
  }

  try {
    // Save HTML source to storage
    const htmlBlobKey = buildUploadBlobKey(userId, report.id)
    await saveTextBlob(htmlBlobKey, htmlContent, 'text/html; charset=utf-8')

    // Calculate tax synchronously (no background functions needed on Vercel)
    const results = calculateTax(parsedReport.trades, parsedReport.balances, year)

    // Generate PDF
    const pdfBuffer = await generateReportPdf({
      results,
      trades: parsedReport.trades,
      balances: parsedReport.balances,
    })

    // Save PDF to storage
    const pdfBlobKey = buildBlobKey(userId, report.id)
    await saveBlob(pdfBlobKey, pdfBuffer)

    // Update report with results
    await supabase
      .from('trading_reports')
      .update({
        storage_key: pdfBlobKey,
        status: 'ready',
        net_profit: results.netProfit,
        tax_due: results.taxDue,
        report_data: results,
      })
      .eq('id', report.id)

    return NextResponse.json({ reportId: report.id })
  } catch (err) {
    await supabase.from('trading_reports').update({ status: 'error' }).eq('id', report.id)

    return NextResponse.json(
      { error: 'Errore durante l elaborazione del report.' },
      { status: 500 }
    )
  }
}
