'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { parseExchangeHtml, detectExchange, getSupportedExchanges } from '@/src/apps/crypto-fiscale/parsers/parser-registry';
import { normalizeTransactions } from '@/src/apps/crypto-fiscale/engine/normalizer';
import { matchTransfers } from '@/src/apps/crypto-fiscale/engine/transfer-matcher';
import { classifyIncome } from '@/src/apps/crypto-fiscale/engine/income-classifier';
import { allocateLIFO } from '@/src/apps/crypto-fiscale/engine/lifo-allocator';
import { calculateGains, calculateIncome } from '@/src/apps/crypto-fiscale/engine/gains-calculator';
import { generateQuadroRW, generateQuadroRT } from '@/src/apps/crypto-fiscale/engine/tax-schedule';
import { runAudit } from '@/src/apps/crypto-fiscale/engine/audit';
import { RawTransaction, NormalizedTransaction, Realizzo, Provento, QuadroRWEntry, QuadroRTEntry, AuditAlert } from '@/src/apps/crypto-fiscale/types';
import { FileDropZone } from './upload/FileDropZone';
import { ParseProgress } from './upload/ParseProgress';
import { Dashboard } from './dashboard/Dashboard';
import { TransactionTable } from './transactions/TransactionTable';
import { QuadroRW } from './tax-forms/QuadroRW';
import { QuadroRT } from './tax-forms/QuadroRT';
import { ReportGenerator } from './report/ReportGenerator';

type ProcessingStep = 'upload' | 'config' | 'processing' | 'results';

export default function CryptoFiscaleApp() {
  const { user } = useUser();
  const [step, setStep] = useState<ProcessingStep>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [annoFiscale, setAnnoFiscale] = useState(2025);
  const [modello, setModello] = useState<'730' | 'Redditi PF'>('Redditi PF');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const [rawTransactions, setRawTransactions] = useState<RawTransaction[]>([]);
  const [normalizedTransactions, setNormalizedTransactions] = useState<NormalizedTransaction[]>([]);
  const [realizzi, setRealizzi] = useState<Realizzo[]>([]);
  const [proventi, setProventi] = useState<Provento[]>([]);
  const [quadroRW, setQuadroRW] = useState<QuadroRWEntry[]>([]);
  const [quadroRT, setQuadroRT] = useState<QuadroRTEntry[]>([]);
  const [auditAlerts, setAuditAlerts] = useState<AuditAlert[]>([]);
  const [unmatchedTransfers, setUnmatchedTransfers] = useState<number>(0);

  const handleFilesDrop = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const startProcessing = useCallback(async () => {
    setStep('processing');

    setProgress(10);
    setProgressMessage('Parsing file HTML...');
    await new Promise((r) => setTimeout(r, 300));

    const allRaw: RawTransaction[] = [];
    for (const file of files) {
      const html = await file.text();
      const parsed = parseExchangeHtml(html, file.name);
      allRaw.push(...parsed);
    }
    setRawTransactions(allRaw);
    setProgress(30);
    setProgressMessage('Normalizzazione transazioni...');
    await new Promise((r) => setTimeout(r, 200));

    const normalized = normalizeTransactions(allRaw, annoFiscale);
    setNormalizedTransactions(normalized);
    setProgress(50);
    setProgressMessage('Riconciliazione trasferimenti...');
    await new Promise((r) => setTimeout(r, 200));

    const { matched, unmatched } = matchTransfers(normalized);
    setNormalizedTransactions(matched);
    setUnmatchedTransfers(unmatched.length);
    setProgress(60);
    setProgressMessage('Classificazione proventi...');
    await new Promise((r) => setTimeout(r, 200));

    const income = classifyIncome(matched);
    setProventi(income);
    setProgress(70);
    setProgressMessage('Calcolo LIFO e plusvalenze...');
    await new Promise((r) => setTimeout(r, 200));

    const { lots, realizzi: lz } = allocateLIFO(matched);
    setRealizzi(lz);
    setProgress(80);
    setProgressMessage('Generazione quadri fiscali...');
    await new Promise((r) => setTimeout(r, 200));

    const rw = generateQuadroRW(matched, lots);
    const rt = generateQuadroRT(lz);
    setQuadroRW(rw);
    setQuadroRT(rt);
    setProgress(90);
    setProgressMessage('Controlli audit...');
    await new Promise((r) => setTimeout(r, 200));

    const alerts = runAudit(matched, lz, unmatched);
    setAuditAlerts(alerts);
    setProgress(100);
    setProgressMessage('Elaborazione completata!');
    await new Promise((r) => setTimeout(r, 500));

    setStep('results');
  }, [files, annoFiscale]);

  const resetAll = useCallback(() => {
    setStep('upload');
    setFiles([]);
    setRawTransactions([]);
    setNormalizedTransactions([]);
    setRealizzi([]);
    setProventi([]);
    setQuadroRW([]);
    setQuadroRT([]);
    setAuditAlerts([]);
    setUnmatchedTransfers(0);
    setProgress(0);
  }, []);

  if (step === 'upload' || step === 'config') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crypto Fiscale</h1>
          <p className="text-gray-500 mt-1">
            Carica i report HTML dei tuoi exchange e ottieni i quadri fiscali compilati.
          </p>
        </div>

        <FileDropZone
          onFilesDrop={handleFilesDrop}
          files={files}
          supportedExchanges={getSupportedExchanges()}
        />

        {files.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Configurazione</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anno Fiscale
                </label>
                <select
                  value={annoFiscale}
                  onChange={(e) => setAnnoFiscale(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modello Dichiarazione
                </label>
                <select
                  value={modello}
                  onChange={(e) => setModello(e.target.value as '730' | 'Redditi PF')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="Redditi PF">Redditi PF</option>
                  <option value="730">730</option>
                </select>
              </div>
            </div>
            <button
              onClick={startProcessing}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Elabora Dichiarazione
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="max-w-2xl mx-auto">
        <ParseProgress progress={progress} message={progressMessage} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risultati Elaborazione</h1>
          <p className="text-gray-500 mt-1">
            Anno fiscale {annoFiscale} - Modello {modello}
          </p>
        </div>
        <button
          onClick={resetAll}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Nuova Elaborazione
        </button>
      </div>

      <Dashboard
        righeImportate={rawTransactions.length}
        movimentiRilevanti={normalizedTransactions.filter((t) => t.mapping?.fiscalmenteRilevante).length}
        realizzi={realizzi.length}
        proventi={proventi.length}
        trasferimentiDaVerificare={unmatchedTransfers}
        anomalie={auditAlerts.filter((a) => a.tipo === 'error').length}
        plusMinusNetta={realizzi.reduce((s, r) => s + r.plusMinusValenza, 0)}
        impostaTeorica={realizzi.reduce((s, r) => s + r.impostaTeorica, 0)}
      />

      <TransactionTable transactions={normalizedTransactions} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuadroRW entries={quadroRW} />
        <QuadroRT entries={quadroRT} />
      </div>

      <ReportGenerator
        annoFiscale={annoFiscale}
        modello={modello}
        userName={user?.fullName || 'Utente'}
        quadroRW={quadroRW}
        quadroRT={quadroRT}
        realizzi={realizzi}
        proventi={proventi}
        auditAlerts={auditAlerts}
      />
    </div>
  );
}
