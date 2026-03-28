import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import { getBlob } from '@/src/apps/trading/storage'
import { isServerUserAdmin } from '@/src/lib/auth/admin-server'

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
    .select('storage_key, filename, user_id')
    .eq('id', id)
    .single()

  if (error || !report) {
    return NextResponse.json({ error: 'Report non trovato.' }, { status: 404 })
  }

  // Check admin or owner
  const clerkUser = await currentUser()
  const isAdmin = await isServerUserAdmin(userId, clerkUser?.publicMetadata?.role, supabase)
  if (report.user_id !== userId && !isAdmin) {
    return NextResponse.json({ error: 'Accesso negato.' }, { status: 403 })
  }

  if (!report.storage_key) {
    return NextResponse.json({ error: 'PDF non ancora disponibile.' }, { status: 404 })
  }

  const pdfData = await getBlob(report.storage_key)
  if (!pdfData) {
    return NextResponse.json({ error: 'File PDF non trovato nello storage.' }, { status: 404 })
  }

  const filename = report.filename?.replace(/\.(htm|html)$/i, '.pdf') ?? 'report.pdf'

  return new NextResponse(pdfData, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
