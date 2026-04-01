'use client';

import { useState } from 'react';
import { Download, Eye, FileDown } from 'lucide-react';
import { QuadroRWEntry, QuadroRTEntry, Realizzo, Provento, AuditAlert } from '@/src/apps/crypto-fiscale/types';

interface ReportGeneratorProps {
  annoFiscale: number;
  modello: string;
  userName: string;
  quadroRW: QuadroRWEntry[];
  quadroRT: QuadroRTEntry[];
  realizzi: Realizzo[];
  proventi: Provento[];
  auditAlerts: AuditAlert[];
}

export function ReportGenerator({
  annoFiscale,
  modello,
  userName,
  quadroRW,
  quadroRT,
  realizzi,
  proventi,
  auditAlerts,
}: ReportGeneratorProps) {
  const [preview, setPreview] = useState(false);

  const plusMinusNetta = realizzi.reduce((s, r) => s + r.plusMinusValenza, 0);
  const impostaTotale = realizzi.reduce((s, r) => s + r.impostaTeorica, 0) + proventi.reduce((s, p) => s + p.impostaTeorica, 0);
  const proventiTotali = proventi.reduce((s, p) => s + p.valoreEUR, 0);

  const generatePDF = () => {
    const content = buildReportContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) {
      w.print();
    }
    URL.revokeObjectURL(url);
  };

  const exportXLSX = () => {
    let csv = 'Sezione,Asset,Quantita,Valore EUR,Aliquota,Imposta\n';
    for (const rw of quadroRW) {
      csv += `RW,${rw.asset},${rw.quantitaFinale},${rw.valoreFinaleEUR},,\n`;
    }
    for (const rt of quadroRT) {
      csv += `RT,${rt.asset},,${rt.corrispettivoTotale},${rt.aliquota},${rt.imposta}\n`;
    }
    for (const p of proventi) {
      csv += `Provento,${p.asset},${p.qty},${p.valoreEUR},${p.aliquota},${p.impostaTeorica}\n`;
    }
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-fiscale-${annoFiscale}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildReportContent = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Report Crypto Fiscale ${annoFiscale}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; }
          h1 { font-size: 24px; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; }
          h2 { font-size: 18px; margin-top: 24px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f5f5f5; font-weight: bold; }
          .header { text-align: center; margin-bottom: 32px; }
          .kpi { display: flex; gap: 16px; margin: 16px 0; }
          .kpi-card { flex: 1; background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; }
          .kpi-value { font-size: 20px; font-weight: bold; }
          .kpi-label { font-size: 12px; color: #666; }
          .footer { margin-top: 48px; font-size: 10px; color: #999; text-align: center; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Report Fiscale Crypto-attivita</h1>
          <p><strong>${userName}</strong> - Anno Fiscale ${annoFiscale} - Modello ${modello}</p>
          <p>Generato il ${new Date().toLocaleDateString('it-IT')}</p>
        </div>

        <h2>Riepilogo KPI</h2>
        <div class="kpi">
          <div class="kpi-card">
            <div class="kpi-label">Plus/Minusvalenza Netta</div>
            <div class="kpi-value">EUR ${plusMinusNetta.toFixed(2)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Imposta Totale</div>
            <div class="kpi-value">EUR ${impostaTotale.toFixed(2)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Proventi Totali</div>
            <div class="kpi-value">EUR ${proventiTotali.toFixed(2)}</div>
          </div>
        </div>

        <h2>Quadro RW - Monitoraggio</h2>
        <table>
          <thead><tr><th>Asset</th><th>Qta Iniziale</th><th>Val. Iniziale</th><th>Qta Finale</th><th>Val. Finale</th><th>Giorni</th></tr></thead>
          <tbody>
            ${quadroRW.map(e => `<tr><td>${e.asset}</td><td>${e.quantitaIniziale.toFixed(8)}</td><td>EUR ${e.valoreInizialeEUR.toFixed(2)}</td><td>${e.quantitaFinale.toFixed(8)}</td><td>EUR ${e.valoreFinaleEUR.toFixed(2)}</td><td>${e.giorniPossesso}</td></tr>`).join('')}
          </tbody>
        </table>

        <h2>Quadro RT - Plus/Minusvalenze</h2>
        <table>
          <thead><tr><th>Asset</th><th>Corrispettivo</th><th>Costo</th><th>Plus/Minus</th><th>Aliquota</th><th>Imposta</th></tr></thead>
          <tbody>
            ${quadroRT.map(e => `<tr><td>${e.asset}</td><td>EUR ${e.corrispettivoTotale.toFixed(2)}</td><td>EUR ${e.costoTotale.toFixed(2)}</td><td>EUR ${e.plusMinusValenza.toFixed(2)}</td><td>${(e.aliquota*100).toFixed(0)}%</td><td>EUR ${e.imposta.toFixed(2)}</td></tr>`).join('')}
          </tbody>
        </table>

        <h2>Dettaglio Proventi</h2>
        <table>
          <thead><tr><th>Tipo</th><th>Asset</th><th>Quantita</th><th>Valore EUR</th><th>Aliquota</th><th>Imposta</th></tr></thead>
          <tbody>
            ${proventi.map(p => `<tr><td>${p.tipo}</td><td>${p.asset}</td><td>${p.qty}</td><td>EUR ${p.valoreEUR.toFixed(2)}</td><td>${(p.aliquota*100).toFixed(0)}%</td><td>EUR ${p.impostaTeorica.toFixed(2)}</td></tr>`).join('')}
          </tbody>
        </table>

        ${auditAlerts.length > 0 ? `
        <h2>Audit e Anomalie</h2>
        <table>
          <thead><tr><th>Tipo</th><th>Messaggio</th></tr></thead>
          <tbody>
            ${auditAlerts.map(a => `<tr><td>${a.tipo}</td><td>${a.messaggio}</td></tr>`).join('')}
          </tbody>
        </table>
        ` : ''}

        <div class="footer">
          <p>Report generato automaticamente da Crypto Fiscale - BCS AI Suite</p>
          <p>Questo report ha scopo informativo e non sostituisce la consulenza di un professionista abilitato.</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Esporta Report</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          <Eye className="h-4 w-4" />
          Anteprima
        </button>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="h-4 w-4" />
          Scarica PDF
        </button>
        <button
          onClick={exportXLSX}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <FileDown className="h-4 w-4" />
          Esporta CSV
        </button>
      </div>

      {preview && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border max-h-96 overflow-auto">
          <h4 className="font-medium mb-2">Anteprima Report</h4>
          <div className="text-sm space-y-2">
            <p><strong>Utente:</strong> {userName}</p>
            <p><strong>Anno Fiscale:</strong> {annoFiscale}</p>
            <p><strong>Modello:</strong> {modello}</p>
            <p><strong>Plus/Minus Netta:</strong> EUR {plusMinusNetta.toFixed(2)}</p>
            <p><strong>Imposta Totale:</strong> EUR {impostaTotale.toFixed(2)}</p>
            <p><strong>Proventi Totali:</strong> EUR {proventiTotali.toFixed(2)}</p>
            <p><strong>Asset in RW:</strong> {quadroRW.length}</p>
            <p><strong>Realizzi in RT:</strong> {quadroRT.length}</p>
            <p><strong>Proventi:</strong> {proventi.length}</p>
            <p><strong>Alert Audit:</strong> {auditAlerts.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
