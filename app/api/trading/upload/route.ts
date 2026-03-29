import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { isYearAllowedForPlan, normalizeTradingPlan, PLAN_DETAILS } from '@/src/apps/trading/plans'
import { buildUploadBlobKey, buildBlobKey, saveTextBlob, saveBlob } from '@/src/apps/trading/storage'
import {
  getReportYears,
  parseHtmlReport,
  calculateTax,
  generateReportPdf,
} from '@/src/apps/trading/report-engine'
import { extractTaxProfileFromClerkUser } from '@/src/apps/trading/tax-form-profile'
import { isServerUserAdmin } from '@/src/lib/auth/admin-server'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import type { Plan } from '@/src/apps/trading/types'

type AccountScalePreference = 'standard' | 'centesimale'

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

  const clerkUser = await currentUser()
  const taxProfile = extractTaxProfileFromClerkUser(clerkUser)
  const isAdmin = await isServerUserAdmin(userId, clerkUser?.publicMetadata?.role, supabase)
  const plan = normalizeTradingPlan(grant?.plan) ?? (isAdmin ? 'pro' : null)

  if (!plan) {
    return NextResponse.json(
      { error: 'Nessun piano attivo. Completa prima il pagamento.' },
      { status: 403 }
    )
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const year = Number(formData.get('year')) || new Date().getFullYear() - 1
  const accountScalePreference = normalizeAccountScalePreference(formData.get('accountScale'))

  if (!file) return NextResponse.json({ error: 'File mancante.' }, { status: 400 })
  if (!accountScalePreference) {
    return NextResponse.json({ error: 'Seleziona il tipo conto: standard o centesimale.' }, { status: 400 })
  }
  const MAX_FILE_SIZE = 15 * 1024 * 1024
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File troppo grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Massimo consentito: 15 MB.` },
      { status: 400 }
    )
  }
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

  await supabase
    .from('trading_reports')
    .update({ status: 'error' })
    .eq('user_id', userId)
    .eq('status', 'processing')
    .lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())

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

    // Calculate tax synchronously with explicit user-selected scale
    const scaleFactor = resolveScaleFactor(accountScalePreference)
    const results = calculateTax(parsedReport.trades, parsedReport.balances, year, scaleFactor)

    // Generate PDF
    const pdfBuffer = await generateReportPdf({
      results,
      trades: parsedReport.trades,
      balances: parsedReport.balances,
      userName: taxProfile.displayName,
      taxCode: taxProfile.taxCode,
      scaleFactor,
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
        report_data: {
          ...results,
          scaleFactor,
          accountScalePreference,
        },
      })
      .eq('id', report.id)

    return NextResponse.json({ reportId: report.id })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[trading/upload] elaborazione fallita:', errMsg)
    await supabase.from('trading_reports').update({ status: 'error' }).eq('id', report.id)

    return NextResponse.json(
      { error: `Errore elaborazione: ${errMsg}` },
      { status: 500 }
    )
  }
}

function normalizeAccountScalePreference(value: FormDataEntryValue | null): AccountScalePreference | null {
  if (value === 'standard' || value === 'centesimale') {
    return value
  }

  return null
}

function resolveScaleFactor(preference: AccountScalePreference) {
  return preference === 'centesimale' ? 100 : 1
}
