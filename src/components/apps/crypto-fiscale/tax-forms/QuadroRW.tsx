'use client';

import { QuadroRWEntry } from '@/src/apps/crypto-fiscale/types';

interface QuadroRWProps {
  entries: QuadroRWEntry[];
}

export function QuadroRW({ entries }: QuadroRWProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Quadro RW - Monitoraggio</h3>
        <p className="text-xs text-gray-500 mt-1">
          Valore iniziale e finale delle detenute cripto-attività
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Asset</th>
              <th className="px-4 py-2 text-right">Qta Iniziale</th>
              <th className="px-4 py-2 text-right">Val. Iniziale (EUR)</th>
              <th className="px-4 py-2 text-right">Qta Finale</th>
              <th className="px-4 py-2 text-right">Val. Finale (EUR)</th>
              <th className="px-4 py-2 text-right">Giorni</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entries.map((entry, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{entry.asset}</td>
                <td className="px-4 py-2 text-right">{entry.quantitaIniziale.toFixed(8)}</td>
                <td className="px-4 py-2 text-right">
                  EUR {entry.valoreInizialeEUR.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">{entry.quantitaFinale.toFixed(8)}</td>
                <td className="px-4 py-2 text-right">
                  EUR {entry.valoreFinaleEUR.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">{entry.giorniPossesso}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Nessun dato da monitorare
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
