'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { createClerkSupabaseBrowserClient, publicSupabase } from '@/src/lib/supabase/public'

type ReportRow = {
  id: string
  filename: string
  year: number
  net_profit: number | null
  tax_due: number | null
  status: 'processing' | 'ready' | 'error'
  created_at: string
}

type ReportsTableProps = {
  highlightId?: string
  onSelectTaxForm?: (reportId: string) => void
}

const formatEur = (n: number | null) => {
  if (n === null || n === undefined) return '-'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return d
  }
}

export function ReportsTable({ highlightId, onSelectTaxForm }: ReportsTableProps) {
  const { getToken, userId } = useAuth()
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadReports = useCallback(async () => {
    if (!userId) return
    const client = createClerkSupabaseBrowserClient(getToken) ?? publicSupabase
    if (!client) return

    const { data } = await client
      .from('trading_reports')
      .select('id, filename, year, net_profit, tax_due, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setReports((data as ReportRow[] | null) ?? [])
    setLoading(false)
  }, [getToken, userId])

  useEffect(() => {
    void loadReports()
  }, [loadReports])

  // Auto-refresh if any report is processing
  const hasProcessing = reports.some(r => r.status === 'processing')
  useEffect(() => {
    if (!hasProcessing) return
    const timer = window.setInterval(() => {
      void loadReports()
    }, 3000)
    return () => window.clearInterval(timer)
  }, [hasProcessing, loadReports])

  const handleDelete = useCallback(async (reportId: string) => {
    if (!window.confirm('Eliminare questo report? L\'azione è irreversibile.')) return
    setDeletingId(reportId)
    const client = createClerkSupabaseBrowserClient(getToken) ?? publicSupabase
    if (client) {
      await client.from('trading_reports').delete().eq('id', reportId).eq('user_id', userId!)
      setReports(prev => prev.filter(r => r.id !== reportId))
    }
    setDeletingId(null)
  }, [getToken, userId])

  const card: React.CSSProperties = { padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }
  const accent = '#10b981'

  if (loading) {
    return (
      <div style={card}>
        <p style={{ color: '#64748b', fontSize: 14 }}>Caricamento report...</p>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div style={card}>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Nessun report salvato. Carica il report HTML del tuo broker per iniziare.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {hasProcessing && (
        <div style={{ padding: 14, borderRadius: 14, background: '#FFFBEB', color: '#92400E', fontSize: 13, border: '1px solid #FDE68A' }}>
          Sono presenti report in elaborazione. La tabella si aggiorna automaticamente.
        </div>
      )}

      <div style={card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Data</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>File</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Anno</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Netto</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Stato</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr
                  key={report.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: highlightId === report.id ? '#f0fdf4' : undefined,
                  }}
                >
                  <td style={{ padding: '12px', color: '#64748b' }}>{formatDate(report.created_at)}</td>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#0f172a' }}>{report.filename}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{report.year}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: (report.net_profit ?? 0) >= 0 ? '#065f46' : '#991b1b' }}>
                    {formatEur(report.net_profit)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 100,
                      fontSize: 11,
                      fontWeight: 700,
                      background: report.status === 'ready' ? '#D1FAE5' : report.status === 'error' ? '#FEE2E2' : '#FEF3C7',
                      color: report.status === 'ready' ? '#065F46' : report.status === 'error' ? '#991B1B' : '#92400E',
                    }}>
                      {report.status === 'ready' ? 'Pronto' : report.status === 'error' ? 'Errore' : 'In corso'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
                      {report.status === 'ready' && (
                        <>
                          <a
                            href={`/api/trading/reports/${report.id}/download`}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 100,
                              background: '#F5F5F7',
                              color: '#333',
                              border: '1px solid rgba(0,0,0,0.08)',
                              fontWeight: 600,
                              fontSize: 12,
                              textDecoration: 'none',
                            }}
                          >
                            PDF
                          </a>
                          <button
                            type="button"
                            onClick={() => onSelectTaxForm?.(report.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 100,
                              background: accent,
                              color: '#fff',
                              border: 'none',
                              fontWeight: 600,
                              fontSize: 12,
                              cursor: 'pointer',
                            }}
                          >
                            RW/RT
                          </button>
                        </>
                      )}
                      {report.status !== 'ready' && (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>In attesa</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(report.id)}
                        disabled={deletingId === report.id}
                        title="Elimina report"
                        style={{
                          padding: '6px 10px',
                          borderRadius: 100,
                          background: '#FEE2E2',
                          color: '#991B1B',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: deletingId === report.id ? 'wait' : 'pointer',
                          opacity: deletingId === report.id ? 0.5 : 1,
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
