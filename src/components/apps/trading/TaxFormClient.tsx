'use client'

import { useEffect, useMemo, useState } from 'react'
import type { TaxFormFieldSource, TaxFormManualOverrides, TaxFormPreview } from '@/src/apps/trading/types'

type TaxFormPayload = {
  report: TaxFormPreview['report']
  preview: TaxFormPreview
  savedAt: string | null
  generatedAt: string | null
  error?: string
}

type TaxFormClientProps = {
  reportId: string
  onBack?: () => void
}

type SummaryRow = [string, string]

const formatEur = (n: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('it-IT') } catch { return d }
}

function sourceLabel(source: TaxFormFieldSource | undefined) {
  switch (source) {
    case 'html': return 'HTML broker'
    case 'profile': return 'Profilo utente'
    case 'mapping': return 'Mapping broker'
    case 'manual': return 'Manuale utente'
    case 'derived': return 'Derivato'
    default: return 'Fallback'
  }
}

export function TaxFormClient({ reportId, onBack }: TaxFormClientProps) {
  const [payload, setPayload] = useState<TaxFormPayload | null>(null)
  const [manualOverrides, setManualOverrides] = useState<TaxFormManualOverrides>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/trading/reports/${reportId}/tax-form`, { cache: 'no-store' })
        const data = (await response.json()) as TaxFormPayload
        if (!response.ok) throw new Error(data.error ?? 'Errore nel caricamento del facsimile.')
        if (!active) return
        setPayload(data)
        setManualOverrides(data.preview.manual_overrides ?? {})
      } catch (loadError) {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : 'Errore sconosciuto.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [reportId])

  const preview = payload?.preview ?? null

  const summaryCards = useMemo(() => {
    if (!preview) return []
    return [
      { label: 'Corrispettivo RT', value: formatEur(preview.rt_summary.rt23TotalCorrispettivi) },
      { label: 'Costo RT', value: formatEur(preview.rt_summary.rt24TotalCosti) },
      { label: 'Netto imponibile RT', value: formatEur(preview.rt_summary.rt27ImponibileNetto) },
      { label: 'IVAFE stimata RW', value: formatEur(preview.rw_summary.rwIvafeDueEur) },
    ]
  }, [preview])

  async function refreshPreview() {
    setRefreshing(true)
    setMessage(null)
    setError(null)
    try {
      const response = await fetch(`/api/trading/reports/${reportId}/tax-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualOverrides }),
      })
      const data = (await response.json()) as TaxFormPayload
      if (!response.ok) throw new Error(data.error ?? 'Errore nel refresh dei dati RW/RT.')
      setPayload(data)
      setManualOverrides(data.preview.manual_overrides ?? {})
      setMessage('Dati RW/RT rigenerati dal report HTML caricato.')
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Errore sconosciuto.')
    } finally {
      setRefreshing(false)
    }
  }

  async function generatePdfs() {
    setGenerating(true)
    setMessage(null)
    setError(null)
    try {
      const response = await fetch(`/api/trading/reports/${reportId}/tax-form/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualOverrides }),
      })
      const data = (await response.json()) as TaxFormPayload
      if (!response.ok) throw new Error(data.error ?? 'Errore nella generazione del PDF RW/RT.')
      setPayload(data)
      setManualOverrides(data.preview.manual_overrides ?? {})
      setMessage('PDF di controllo e facsimile RW/RT generati correttamente.')
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Errore sconosciuto.')
    } finally {
      setGenerating(false)
    }
  }

  const card: React.CSSProperties = { padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }
  const accent = '#10b981'

  if (loading) {
    return (
      <div style={card}>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Analisi automatica del conto in corso...</p>
      </div>
    )
  }

  if (error && !payload) {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ ...card, background: '#FEF2F2', borderColor: '#FECACA' }}>
          <p style={{ margin: 0, color: '#991B1B', fontSize: 14 }}>{error}</p>
        </div>
        {onBack && (
          <button type="button" onClick={onBack} style={{ padding: '10px 20px', borderRadius: 100, background: '#F5F5F7', color: '#333', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
            Torna ai report
          </button>
        )}
      </div>
    )
  }

  if (!payload || !preview) return null

  const rtRows: SummaryRow[] = [
    ['RT23 corrispettivi', formatEur(preview.rt_summary.rt23TotalCorrispettivi)],
    ['RT24 costi', formatEur(preview.rt_summary.rt24TotalCosti)],
    ['RT25 plusvalenze', formatEur(preview.rt_summary.rt25Plusvalenze)],
    ['RT26 minusvalenze compensate', formatEur(preview.rt_summary.rt26MinusvalenzeCompensate)],
    ['RT27 imponibile netto', formatEur(preview.rt_summary.rt27ImponibileNetto)],
    ['Imposta teorica 26%', formatEur(preview.rt_summary.rtTaxDue)],
  ]

  const rwRows: SummaryRow[] = [
    ['Codice titolare RW', preview.rw_summary.rwOwnerCode],
    ['Codice attivita RW', preview.rw_summary.rwAssetCode],
    ['Paese broker', preview.rw_summary.brokerCountryCode ?? '-'],
    ['Valore iniziale RW', formatEur(preview.rw_summary.rwInitialValueEur)],
    ['Valore finale RW', formatEur(preview.rw_summary.rwFinalValueEur)],
    ['Valore massimo RW', formatEur(preview.rw_summary.rwMaxValueEur)],
    ['Giorni possesso', String(preview.rw_summary.rwPossessionDays)],
    ['IVAFE stimata', formatEur(preview.rw_summary.rwIvafeDueEur)],
  ]

  const editableFields = [
    { key: 'ownerName' as const, label: 'Intestatario manuale', placeholder: 'Compila solo se il nome non e ricavabile dal report.', visible: preview.field_sources.owner_name !== 'html' },
    { key: 'taxCode' as const, label: 'Codice fiscale manuale', placeholder: 'Correggi o integra il codice fiscale se serve.', visible: true },
    { key: 'brokerName' as const, label: 'Nome broker manuale', placeholder: 'Compila se il broker non e ricavabile in modo affidabile.', visible: preview.field_sources.broker_name !== 'html' },
    { key: 'brokerCountryCode' as const, label: 'Paese broker manuale', placeholder: 'Sigla ISO a 2 lettere, es. CY, SC, MU.', visible: preview.field_sources.broker_country_code !== 'html' },
  ].filter(f => f.visible)

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Header */}
      <div style={card}>
        <p style={{ margin: '0 0 8px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.06em' }}>RW / RT</p>
        <h2 style={{ margin: '0 0 10px', fontSize: 24, fontFamily: 'var(--font-display)' }}>Facsimile operativo quadro RW e RT</h2>
        <p style={{ margin: 0, color: '#6E6E73', lineHeight: 1.6, fontSize: 14 }}>
          Estrazione automatica dal file HTML del broker. Documento di supporto personale per il commercialista.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {summaryCards.map(c => (
          <div key={c.label} style={{ ...card, padding: 18, borderRadius: 18 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>{c.label}</p>
            <p style={{ margin: '10px 0 0', fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* RT & RW sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SummaryPanel title="Quadro RT" rows={rtRows} />
        <SummaryPanel title="Quadro RW" rows={rwRows} />
      </div>

      {/* Warnings */}
      {preview.warnings.length > 0 && (
        <div style={{ ...card, background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#92400E', fontSize: 12, textTransform: 'uppercase' }}>Avvertenze</p>
          {preview.warnings.map(w => (
            <p key={w.code} style={{ margin: '4px 0', fontSize: 13, color: '#92400E' }}>- {w.message}</p>
          ))}
        </div>
      )}

      {/* Blocking issues */}
      {preview.blocking_issues.length > 0 && (
        <div style={{ ...card, background: '#FEF2F2', borderColor: '#FECACA' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#991B1B', fontSize: 12, textTransform: 'uppercase' }}>Problemi bloccanti</p>
          {preview.blocking_issues.map(i => (
            <p key={i.code} style={{ margin: '4px 0', fontSize: 13, color: '#991B1B' }}>- {i.message}</p>
          ))}
        </div>
      )}

      {/* Manual overrides */}
      {editableFields.length > 0 && (
        <div style={card}>
          <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Integrazione manuale</p>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>I calcoli fiscali restano automatici. Qui puoi completare solo i dati non economici.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {editableFields.map(f => (
              <label key={f.key} style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>{f.label}</span>
                <input
                  value={manualOverrides[f.key] ?? ''}
                  placeholder={f.placeholder}
                  maxLength={f.key === 'brokerCountryCode' ? 2 : undefined}
                  onChange={e => setManualOverrides(curr => ({
                    ...curr,
                    [f.key]: f.key === 'brokerCountryCode' ? e.target.value.toUpperCase() : e.target.value,
                  }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', fontSize: 14, background: '#FAFAFA' }}
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {onBack && (
          <button type="button" onClick={onBack} style={{ padding: '10px 20px', borderRadius: 100, background: '#F5F5F7', color: '#333', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600, cursor: 'pointer' }}>
            Torna ai report
          </button>
        )}
        <button type="button" disabled={refreshing || generating} onClick={() => void refreshPreview()} style={{ padding: '10px 20px', borderRadius: 100, background: '#F5F5F7', color: '#333', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600, cursor: refreshing ? 'wait' : 'pointer' }}>
          {refreshing ? 'Aggiornamento...' : 'Rigenera dati'}
        </button>
        <button type="button" disabled={refreshing || generating || !preview.can_generate_facsimile_pdf} onClick={() => void generatePdfs()} style={{ padding: '10px 20px', borderRadius: 100, background: accent, color: '#fff', border: 'none', fontWeight: 700, cursor: generating ? 'wait' : 'pointer', opacity: preview.can_generate_facsimile_pdf ? 1 : 0.5 }}>
          {generating ? 'Generazione...' : 'Genera PDF'}
        </button>
        {preview.internal_pdf_available && (
          <a href={preview.internal_download_url} style={{ padding: '10px 20px', borderRadius: 100, background: '#F5F5F7', color: '#333', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
            PDF di controllo
          </a>
        )}
        {preview.facsimile_pdf_available && (
          <a href={preview.facsimile_download_url} style={{ padding: '10px 20px', borderRadius: 100, background: '#F5F5F7', color: '#333', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
            Facsimile RW/RT
          </a>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div style={{ padding: 14, borderRadius: 14, background: '#ECFDF5', color: '#065F46', fontSize: 13, border: '1px solid #A7F3D0' }}>{message}</div>
      )}
      {error && (
        <div style={{ padding: 14, borderRadius: 14, background: '#FEF2F2', color: '#991B1B', fontSize: 13, border: '1px solid #FECACA' }}>{error}</div>
      )}
    </div>
  )
}

function SummaryPanel({ title, rows }: { title: string; rows: SummaryRow[] }) {
  return (
    <div style={{ padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
      <p style={{ margin: '0 0 12px', fontWeight: 700, color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</p>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 14, background: '#f8fafc', border: '1px solid rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
