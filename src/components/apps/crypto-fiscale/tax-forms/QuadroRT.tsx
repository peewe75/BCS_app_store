'use client';

import { QuadroRTEntry } from '@/src/apps/crypto-fiscale/types';

interface QuadroRTProps {
  entries: QuadroRTEntry[];
}

export function QuadroRT({ entries }: QuadroRTProps) {
  const totali = {
    corrispettivo: entries.reduce((s, e) => s + e.corrispettivoTotale, 0),
    costo: entries.reduce((s, e) => s + e.costoTotale, 0),
    plusMinus: entries.reduce((s, e) => s + e.plusMinusValenza, 0),
    imposta: entries.reduce((s, e) => s + e.imposta, 0),
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Quadro RT - Plus/Minusvalenze</h3>
        <p className="text-xs text-gray-500 mt-1">
          Dettaglio realizzi e imposta dovuta
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Asset</th>
              <th className="px-4 py-2 text-right">Corrispettivo (EUR)</th>
              <th className="px-4 py-2 text-right">Costo (EUR)</th>
              <th className="px-4 py-2 text-right">Plus/Minus (EUR)</th>
              <th className="px-4 py-2 text-right">Aliquota</th>
              <th className="px-4 py-2 text-right">Imposta (EUR)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entries.map((entry, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{entry.asset}</td>
                <td className="px-4 py-2 text-right">
                  {entry.corrispettivoTotale.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">{entry.costoTotale.toFixed(2)}</td>
                <td
                  className={`px-4 py-2 text-right font-medium ${
                    entry.plusMinusValenza >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {entry.plusMinusValenza.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">
                  {(entry.aliquota * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-2 text-right">{entry.imposta.toFixed(2)}</td>
              </tr>
            ))}
            {entries.length > 0 && (
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-2">TOTALE</td>
                <td className="px-4 py-2 text-right">{totali.corrispettivo.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{totali.costo.toFixed(2)}</td>
                <td
                  className={`px-4 py-2 text-right ${
                    totali.plusMinus >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {totali.plusMinus.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">-</td>
                <td className="px-4 py-2 text-right">{totali.imposta.toFixed(2)}</td>
              </tr>
            )}
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Nessun realizzo da dichiarare
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
