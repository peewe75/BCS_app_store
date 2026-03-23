'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Plan } from '@/src/apps/trading/types'

type UploadClientProps = {
  allowedYears: number[]
  plan: Plan
  onReportReady?: (reportId: string) => void
}

type ReportStatusResponse = {
  status: 'processing' | 'ready' | 'error'
  net_profit: number | null
  tax_due: number | null
}

function parseYearFromCell(value: string) {
  const match = value.trim().match(/^(\d{4})\.\d{2}\.\d{2}(?:\s+\d{2}:\d{2}(?::\d{2})?)?$/)
  if (!match) return null
  const year = Number(match[1])
  return Number.isFinite(year) ? year : null
}

function normalizeCellText(value: string) {
  return value.replace(/\s+/g, ' ').trim().replaceAll('\t', ' ')
}

function normalizeBrokerReport(source: string) {
  const parser = new DOMParser()
  const document = parser.parseFromString(source, 'text/html')
  const rows = Array.from(document.querySelectorAll('tr'))

  if (!rows.length) return source

  const normalizedRows = rows
    .map(row => {
      const cells: string[] = []
      Array.from(row.querySelectorAll('th, td')).forEach(cell => {
        const colspan = Number(cell.getAttribute('colspan') ?? '1')
        const text = normalizeCellText(cell.textContent ?? '')
        const safeColspan = Number.isFinite(colspan) && colspan > 0 ? colspan : 1
        cells.push(text)
        for (let index = 1; index < safeColspan; index += 1) {
          cells.push('')
        }
      })
      return cells.join('\t')
    })
    .join('\n')

  return `ATF_TSV_V1\n${normalizedRows}`
}

function extractReportYears(source: string) {
  const parser = new DOMParser()
  const document = parser.parseFromString(source, 'text/html')
  const rows = Array.from(document.querySelectorAll('tr')).map(row => {
    const cells: string[] = []
    Array.from(row.querySelectorAll('th, td')).forEach(cell => {
      const colspan = Number(cell.getAttribute('colspan') ?? '1')
      const text = normalizeCellText(cell.textContent ?? '')
      const safeColspan = Number.isFinite(colspan) && colspan > 0 ? colspan : 1
      cells.push(text)
      for (let index = 1; index < safeColspan; index += 1) {
        cells.push('')
      }
    })
    return cells
  })

  const headerIndex = rows.findIndex(
    row => row.some(cell => cell.includes('Ticket')) && row.some(cell => cell.includes('Profit'))
  )

  if (headerIndex === -1) return []

  return Array.from(
    new Set(
      rows
        .slice(headerIndex + 1)
        .flatMap(row => {
          const rowType = (row[2] ?? '').trim().toLowerCase()
          if (rowType === 'buy' || rowType === 'sell') return [parseYearFromCell(row[8] ?? '')]
          if (rowType === 'balance') return [parseYearFromCell(row[1] ?? '')]
          return []
        })
        .filter((year): year is number => year !== null)
    )
  ).sort((left, right) => right - left)
}

async function readJsonResponse<T>(response: Response): Promise<T & { error?: string }> {
  const text = await response.text()
  if (!text) return {} as T & { error?: string }

  try {
    return JSON.parse(text) as T & { error?: string }
  } catch {
    return {
      error: text.startsWith('Internal Error')
        ? 'Il file e troppo pesante per l elaborazione diretta. Riprova con un export HTML piu leggero.'
        : text,
    } as T & { error?: string }
  }
}

const formatCurrencyValue = (value: number | null) => {
  if (value === null || value === undefined) return '-'
  return `EUR ${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`
}

export function UploadClient({ allowedYears, plan, onReportReady }: UploadClientProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [year, setYear] = useState(allowedYears[0] ?? new Date().getFullYear())
  const [detectedYears, setDetectedYears] = useState<number[]>([])
  const [yearMessage, setYearMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [reportId, setReportId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<ReportStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processing = loading || (!!reportId && status?.status !== 'ready' && status?.status !== 'error')

  useEffect(() => {
    if (!processing) return
    const timer = window.setInterval(() => {
      setProgress(current => Math.min(current + 7, 92))
    }, 1200)
    return () => window.clearInterval(timer)
  }, [processing])

  useEffect(() => {
    if (!reportId) return
    let active = true

    const poll = async () => {
      try {
        const response = await fetch(`/api/trading/reports/${reportId}/status`, { cache: 'no-store' })
        const data = (await response.json()) as ReportStatusResponse & { error?: string }
        if (!response.ok) throw new Error(data.error ?? 'Errore nel recupero dello stato')
        if (!active) return

        setStatus(data)

        if (data.status === 'ready') {
          setProgress(100)
          setLoading(false)
          onReportReady?.(reportId)
          return
        }

        if (data.status === 'error') {
          setLoading(false)
          setError('Elaborazione non completata. Verifica il file e riprova.')
          return
        }

        window.setTimeout(poll, 3000)
      } catch (pollError) {
        if (!active) return
        setLoading(false)
        setError(pollError instanceof Error ? pollError.message : 'Errore durante il polling del report')
      }
    }

    void poll()
    return () => { active = false }
  }, [reportId, onReportReady])

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null
    setFile(nextFile)
    setError(null)

    if (!nextFile) {
      setDetectedYears([])
      setYearMessage(null)
      return
    }

    const sourceHtml = await nextFile.text()
    const years = extractReportYears(sourceHtml)
    setDetectedYears(years)

    if (!years.length) {
      setYearMessage('Non sono riuscito a rilevare automaticamente l anno fiscale dal file selezionato.')
      return
    }

    const allowedDetectedYears = years.filter(candidate => allowedYears.includes(candidate))

    if (!allowedDetectedYears.length) {
      setYearMessage(`Il file contiene movimenti per ${years.join(', ')}, ma il piano attivo non consente questi anni.`)
      return
    }

    if (!allowedDetectedYears.includes(year)) {
      const suggestedYear = allowedDetectedYears[0]
      setYear(suggestedYear)
      setYearMessage(`Anni rilevati nel file: ${years.join(', ')}. Ho selezionato automaticamente il ${suggestedYear}.`)
      return
    }

    setYearMessage(`Anni rilevati nel file: ${years.join(', ')}.`)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return

    setError(null)
    setStatus(null)
    setReportId(null)
    setProgress(10)
    setLoading(true)

    try {
      const sourceHtml = await file.text()
      const availableYears = extractReportYears(sourceHtml)

      if (availableYears.length > 0 && !availableYears.includes(year)) {
        throw new Error(`Il file caricato non contiene movimenti per il ${year}. Anni rilevati nel report: ${availableYears.join(', ')}.`)
      }

      const normalizedReport = normalizeBrokerReport(sourceHtml)
      const uploadFile = new File([normalizedReport], file.name, { type: 'text/plain' })
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('year', String(year))

      const response = await fetch('/api/trading/upload', { method: 'POST', body: formData })
      const data = await readJsonResponse<{ reportId?: string }>(response)

      if (!response.ok || !data.reportId) {
        throw new Error(data.error ?? 'Errore durante l elaborazione del file')
      }

      setProgress(25)
      setReportId(data.reportId)
    } catch (submitError) {
      setLoading(false)
      setError(submitError instanceof Error ? submitError.message : 'Errore sconosciuto')
    }
  }

  const helperText = useMemo(() => {
    if (!status || status.status === 'processing') {
      return 'La funzione fiscale puo richiedere fino a 30 secondi. Mantieni aperta questa pagina.'
    }
    if (status.status === 'ready') {
      return `Report pronto. Netto ${formatCurrencyValue(status.net_profit)} - imposta ${formatCurrencyValue(status.tax_due)}`
    }
    return 'Il report e terminato con errore.'
  }, [status])

  const card: React.CSSProperties = { padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }
  const accent = '#10b981'

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={card}>
        <p style={{ margin: '0 0 8px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.06em' }}>Upload fiscale</p>
        <h2 style={{ margin: '0 0 10px', fontSize: 24, fontFamily: 'var(--font-display)' }}>Carica il report HTML del broker</h2>
        <p style={{ margin: 0, color: '#6E6E73', lineHeight: 1.6, fontSize: 14 }}>
          Supporto per report MetaTrader 4 e 5. Piano attivo: <strong>{plan}</strong>.
        </p>
      </section>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Anno fiscale</label>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', fontSize: 14, background: '#FAFAFA' }}
            >
              {allowedYears.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#999' }}>Base e Standard consentono solo anno corrente e precedente.</p>
            {yearMessage && <p style={{ margin: '6px 0 0', fontSize: 13, color: '#334155' }}>{yearMessage}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>File report broker</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".htm,.html"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              required
              tabIndex={-1}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '10px 20px', borderRadius: 100, background: '#F5F5F7', color: '#333', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
              >
                Seleziona file
              </button>
              <span style={{ fontSize: 13, color: '#64748b' }}>{file ? file.name : 'Nessun file selezionato'}</span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#999' }}>Formati ammessi: .htm e .html esportati dal broker.</p>
            {detectedYears.length > 0 && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>Anni rilevati: {detectedYears.join(', ')}.</p>
            )}
          </div>

          {error && (
            <div style={{ padding: 14, borderRadius: 14, background: '#FEF2F2', color: '#991B1B', fontSize: 13 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            style={{
              padding: '12px 28px',
              borderRadius: 100,
              background: file && !loading ? accent : '#E5E7EB',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: 14,
              cursor: file && !loading ? 'pointer' : 'not-allowed',
              alignSelf: 'flex-start',
            }}
          >
            {loading ? 'Invio in corso...' : 'Elabora e genera PDF'}
          </button>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>Stato elaborazione</p>
              <p style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: '#0f172a' }}>
                {!status ? 'In attesa' : status.status === 'ready' ? 'Completato' : status.status === 'error' ? 'Interrotto' : 'In esecuzione'}
              </p>
            </div>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${processing ? '#cbd5e1' : '#a7f3d0'}`,
              background: processing ? '#f1f5f9' : '#ecfdf5',
              color: processing ? '#475569' : '#065f46',
              fontSize: 14,
              fontWeight: 700,
            }}>
              {progress}%
            </div>
          </div>

          <div style={{ marginTop: 20, height: 10, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 999, background: '#0f172a', transition: 'width 0.7s', width: `${progress}%` }} />
          </div>

          <p style={{ marginTop: 16, fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{helperText}</p>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 16, borderRadius: 16, background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>Netto fiscale</p>
              <p style={{ margin: '10px 0 0', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{formatCurrencyValue(status?.net_profit ?? null)}</p>
            </div>
            <div style={{ padding: 16, borderRadius: 16, background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>Imposta 26%</p>
              <p style={{ margin: '10px 0 0', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{formatCurrencyValue(status?.tax_due ?? null)}</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
