import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import { getTextBlob, saveTextBlob, saveBlob, buildUploadBlobKey, buildTaxFormDraftKey, buildTaxFormControlPdfKey, buildTaxFormFacsimilePdfKey } from '@/src/apps/trading/storage'
import { parseHtmlReport, calculateTax } from '@/src/apps/trading/report-engine'
import { createTaxFormPreview, createTaxFormPreviewRecord, generateTaxFormPdf } from '@/src/apps/trading/tax-form-engine'
import { extractTaxProfileFromClerkUser } from '@/src/apps/trading/tax-form-profile'
import type { TaxFormManualOverrides } from '@/src/apps/trading/types'

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
  const results = calculateTax(parsed.trades, parsed.balances, report.year)

  // Generate preview with PDF available flags
  const preview = createTaxFormPreview({
    report: { id: report.id, filename: report.filename, year: report.year, status: report.status, created_at: report.created_at },
    sourceHtml,
    results,
    profile,
    manualOverrides: body.manualOverrides,
    internalPdfAvailable: true,
    facsimilePdfAvailable: true,
  })

  if (!preview.can_generate_facsimile_pdf) {
    return NextResponse.json({ error: 'Il report presenta problemi bloccanti. Risolverli prima di generare il PDF.' }, { status: 400 })
  }

  // Generate both PDFs
  const controlPdfKey = buildTaxFormControlPdfKey(userId, reportId)
  const facsimilePdfKey = buildTaxFormFacsimilePdfKey(userId, reportId)

  const [controlPdf, facsimilePdf] = await Promise.all([
    generateTaxFormPdf({ preview, kind: 'control' }),
    generateTaxFormPdf({ preview, kind: 'facsimile' }),
  ])

  await Promise.all([
    saveBlob(controlPdfKey, controlPdf),
    saveBlob(facsimilePdfKey, facsimilePdf),
  ])

  // Save draft with generation info
  const generatedAt = new Date().toISOString()
  const draftKey = buildTaxFormDraftKey(userId, reportId)
  const record = createTaxFormPreviewRecord({
    reportId,
    preview,
    manualOverrides: body.manualOverrides,
    generatedAt,
    internalPdfBlobKey: controlPdfKey,
    facsimilePdfBlobKey: facsimilePdfKey,
  })
  await saveTextBlob(draftKey, JSON.stringify(record), 'application/json')

  return NextResponse.json({
    report: { id: report.id, filename: report.filename, year: report.year, status: report.status, created_at: report.created_at },
    preview,
    savedAt: record.savedAt,
    generatedAt,
  })
}
