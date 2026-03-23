import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import { getBlob, getTextBlob, buildTaxFormDraftKey, buildTaxFormControlPdfKey } from '@/src/apps/trading/storage'
import { parseTaxFormPreviewRecord } from '@/src/apps/trading/tax-form-engine'

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
    .select('user_id, filename')
    .eq('id', reportId)
    .eq('user_id', userId)
    .single()

  if (error || !report) {
    return NextResponse.json({ error: 'Report non trovato.' }, { status: 404 })
  }

  const draftKey = buildTaxFormDraftKey(userId, reportId)
  const savedDraft = await getTextBlob(draftKey)
  const record = parseTaxFormPreviewRecord(savedDraft)

  const blobKey = record?.internalPdfBlobKey ?? buildTaxFormControlPdfKey(userId, reportId)
  const pdfData = await getBlob(blobKey)

  if (!pdfData) {
    return NextResponse.json({ error: 'PDF di controllo non ancora generato.' }, { status: 404 })
  }

  const filename = `controllo-rw-rt-${report.filename?.replace(/\.(htm|html)$/i, '') ?? reportId}.pdf`

  return new NextResponse(pdfData, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
