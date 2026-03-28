import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import { getTextBlob, saveTextBlob, buildUploadBlobKey, buildTaxFormDraftKey, buildTaxFormControlPdfKey, buildTaxFormFacsimilePdfKey } from '@/src/apps/trading/storage'
import { parseHtmlReport, calculateTax } from '@/src/apps/trading/report-engine'
import { createTaxFormPreview, createTaxFormPreviewRecord, parseTaxFormPreviewRecord } from '@/src/apps/trading/tax-form-engine'
import { extractTaxProfileFromClerkUser } from '@/src/apps/trading/tax-form-profile'
import type { TaxFormManualOverrides } from '@/src/apps/trading/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { id: reportId } = await params
  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database non disponibile.' }, { status: 500 })
  }

  const { data: report, error } = await supabase
    .from('trading_reports')
    .select('*')
    .eq('id', reportId)
    .eq('user_id', userId)
    .single()

  if (error || !report) {
    return NextResponse.json({ error: 'Report non trovato.' }, { status: 404 })
  }

  if (report.status !== 'ready') {
    return NextResponse.json({ error: 'Il report non e ancora pronto.' }, { status: 400 })
  }

  const htmlBlobKey = buildUploadBlobKey(userId, reportId)
  const sourceHtml = await getTextBlob(htmlBlobKey)

  if (!sourceHtml) {
    return NextResponse.json({ error: 'File sorgente HTML non trovato.' }, { status: 404 })
  }

  const parsed = parseHtmlReport(sourceHtml)
  const storedScaleFactor = readStoredScaleFactor(report.report_data, parsed.trades, parsed.balances, report.year)

  // Try to load saved draft
  const draftKey = buildTaxFormDraftKey(userId, reportId)
  const savedDraft = await getTextBlob(draftKey)
  const existingRecord = parseTaxFormPreviewRecord(savedDraft)

  if (
    existingRecord &&
    (!storedScaleFactor || existingRecord.preview.account_extraction.scaleFactor === storedScaleFactor)
  ) {
    return NextResponse.json({
      report: { id: report.id, filename: report.filename, year: report.year, status: report.status, created_at: report.created_at },
      preview: existingRecord.preview,
      savedAt: existingRecord.savedAt,
      generatedAt: existingRecord.generatedAt,
    })
  }

  // Generate fresh preview
  const clerkUser = await currentUser()
  const profile = extractTaxProfileFromClerkUser(clerkUser)
  const results = calculateTax(parsed.trades, parsed.balances, report.year, storedScaleFactor ?? undefined)

  const controlPdfKey = buildTaxFormControlPdfKey(userId, reportId)
  const facsimilePdfKey = buildTaxFormFacsimilePdfKey(userId, reportId)

  const preview = createTaxFormPreview({
    report: { id: report.id, filename: report.filename, year: report.year, status: report.status, created_at: report.created_at },
    sourceHtml,
    results,
    profile,
    scaleFactorOverride: storedScaleFactor ?? undefined,
    internalPdfAvailable: false,
    facsimilePdfAvailable: false,
  })

  // Save draft
  const record = createTaxFormPreviewRecord({ reportId, preview })
  await saveTextBlob(draftKey, JSON.stringify(record), 'application/json')

  return NextResponse.json({
    report: { id: report.id, filename: report.filename, year: report.year, status: report.status, created_at: report.created_at },
    preview,
    savedAt: record.savedAt,
    generatedAt: record.generatedAt,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { id: reportId } = await params
  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database non disponibile.' }, { status: 500 })
  }

  const { data: report, error } = await supabase
    .from('trading_reports')
    .select('*')
    .eq('id', reportId)
    .eq('user_id', userId)
    .single()

  if (error || !report) {
    return NextResponse.json({ error: 'Report non trovato.' }, { status: 404 })
  }

  const body = await req.json() as { manualOverrides?: TaxFormManualOverrides }
  const clerkUser = await currentUser()
  const profile = extractTaxProfileFromClerkUser(clerkUser)
  const htmlBlobKey = buildUploadBlobKey(userId, reportId)
  const sourceHtml = await getTextBlob(htmlBlobKey)

  if (!sourceHtml) {
    return NextResponse.json({ error: 'File sorgente HTML non trovato.' }, { status: 404 })
  }

  const parsed = parseHtmlReport(sourceHtml)
  const storedScaleFactor = readStoredScaleFactor(report.report_data, parsed.trades, parsed.balances, report.year)
  const results = calculateTax(parsed.trades, parsed.balances, report.year, storedScaleFactor ?? undefined)

  const preview = createTaxFormPreview({
    report: { id: report.id, filename: report.filename, year: report.year, status: report.status, created_at: report.created_at },
    sourceHtml,
    results,
    profile,
    scaleFactorOverride: storedScaleFactor ?? undefined,
    manualOverrides: body.manualOverrides,
    internalPdfAvailable: false,
    facsimilePdfAvailable: false,
  })

  const draftKey = buildTaxFormDraftKey(userId, reportId)
  const record = createTaxFormPreviewRecord({ reportId, preview, manualOverrides: body.manualOverrides })
  await saveTextBlob(draftKey, JSON.stringify(record), 'application/json')

  return NextResponse.json({
    report: { id: report.id, filename: report.filename, year: report.year, status: report.status, created_at: report.created_at },
    preview,
    savedAt: record.savedAt,
    generatedAt: record.generatedAt,
  })
}

function readStoredScaleFactor(
  reportData: unknown,
  trades: Parameters<typeof calculateTax>[0],
  balances: Parameters<typeof calculateTax>[1],
  year: number
) {
  if (!reportData || typeof reportData !== 'object') {
    return null
  }

  const stored = reportData as {
    scaleFactor?: unknown
    corrispettivo?: unknown
    costo?: unknown
    netProfit?: unknown
    totalInterest?: unknown
    taxDue?: unknown
  }

  if (stored.scaleFactor === 1 || stored.scaleFactor === 100) {
    return stored.scaleFactor
  }

  const snapshot = {
    corrispettivo: toFiniteNumber(stored.corrispettivo),
    costo: toFiniteNumber(stored.costo),
    netProfit: toFiniteNumber(stored.netProfit),
    totalInterest: toFiniteNumber(stored.totalInterest),
    taxDue: toFiniteNumber(stored.taxDue),
  }

  const comparableValues = Object.values(snapshot).filter((value) => value !== null)
  if (comparableValues.length === 0) {
    return null
  }

  const standardResults = calculateTax(trades, balances, year, 1)
  const centResults = calculateTax(trades, balances, year, 100)

  return scoreStoredResults(snapshot, centResults) < scoreStoredResults(snapshot, standardResults) ? 100 : 1
}

function scoreStoredResults(
  snapshot: {
    corrispettivo: number | null
    costo: number | null
    netProfit: number | null
    totalInterest: number | null
    taxDue: number | null
  },
  results: ReturnType<typeof calculateTax>
) {
  let score = 0

  if (snapshot.corrispettivo !== null) {
    score += Math.abs(snapshot.corrispettivo - results.corrispettivo)
  }
  if (snapshot.costo !== null) {
    score += Math.abs(snapshot.costo - results.costo)
  }
  if (snapshot.netProfit !== null) {
    score += Math.abs(snapshot.netProfit - results.netProfit)
  }
  if (snapshot.totalInterest !== null) {
    score += Math.abs(snapshot.totalInterest - results.totalInterest)
  }
  if (snapshot.taxDue !== null) {
    score += Math.abs(snapshot.taxDue - results.taxDue)
  }

  return score
}

function toFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}
