'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { getAllowedYears } from '@/src/apps/trading/plans'
import { UploadClient } from '@/src/components/apps/trading/UploadClient'
import { ReportsTable } from '@/src/components/apps/trading/ReportsTable'
import { TaxFormClient } from '@/src/components/apps/trading/TaxFormClient'
import { useAdminStatus } from '@/src/hooks/useAdminStatus'
import type { Plan } from '@/src/apps/trading/types'

type Tab = 'upload' | 'reports' | 'tax-form'

export default function TradingWorkspace() {
  const { userId } = useAuth()
  const { isAdmin } = useAdminStatus()
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [highlightId, setHighlightId] = useState<string | undefined>(undefined)

  // For admin, default to 'pro' plan. For regular users, we'll use 'base' as default
  // (the actual plan enforcement happens server-side in the API routes)
  const plan: Plan = isAdmin ? 'pro' : 'base'
  const allowedYears = getAllowedYears(plan)

  const handleReportReady = useCallback((reportId: string) => {
    setHighlightId(reportId)
    setActiveTab('reports')
  }, [])

  const handleSelectTaxForm = useCallback((reportId: string) => {
    setSelectedReportId(reportId)
    setActiveTab('tax-form')
  }, [])

  const handleBackToReports = useCallback(() => {
    setSelectedReportId(null)
    setActiveTab('reports')
  }, [])

  const accent = '#10b981'
  const tabs: { key: Tab; label: string }[] = [
    { key: 'upload', label: 'Upload' },
    { key: 'reports', label: 'Report' },
    { key: 'tax-form', label: 'Modulo Fiscale' },
  ]

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Header */}
      <section style={{ padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ margin: '0 0 8px', color: accent, fontWeight: 700, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.06em' }}>Trading Fiscale</p>
        <h1 style={{ margin: '0 0 10px', fontSize: 34, fontFamily: 'var(--font-display)' }}>Report fiscale automatico</h1>
        <p style={{ margin: 0, color: '#6E6E73', lineHeight: 1.6 }}>
          Carica il report HTML MetaTrader 4/5 del tuo broker, analizza plusvalenze e minusvalenze, genera PDF fiscale e facsimile RW/RT.
        </p>
      </section>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 100 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '10px 20px',
              borderRadius: 100,
              border: 'none',
              background: activeTab === tab.key ? '#fff' : 'transparent',
              color: activeTab === tab.key ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'upload' && (
        <UploadClient
          allowedYears={allowedYears}
          plan={plan}
          onReportReady={handleReportReady}
        />
      )}

      {activeTab === 'reports' && (
        <ReportsTable
          highlightId={highlightId}
          onSelectTaxForm={handleSelectTaxForm}
        />
      )}

      {activeTab === 'tax-form' && selectedReportId && (
        <TaxFormClient
          reportId={selectedReportId}
          onBack={handleBackToReports}
        />
      )}

      {activeTab === 'tax-form' && !selectedReportId && (
        <div style={{ padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            Seleziona un report dalla tab &quot;Report&quot; per visualizzare il facsimile RW/RT.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            style={{ marginTop: 16, padding: '10px 20px', borderRadius: 100, background: accent, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            Vai ai Report
          </button>
        </div>
      )}
    </div>
  )
}
