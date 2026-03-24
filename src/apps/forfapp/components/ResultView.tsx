import React, { useRef } from 'react';
import { CONFIG } from '../constants';
import { CalculationResult, formatCurrency } from '../utils/calculation';
import { trackEvent } from '../utils/analytics';
import { Printer } from 'lucide-react';

interface ResultViewProps {
  data: CalculationResult;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ data, onReset }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const pressioneFiscale = ((data.imposta + data.contributi) / data.incasso) * 100;

  const handlePrint = () => {
    trackEvent('print_pdf_click', { location: 'result_view' });
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #forfapp-result, #forfapp-result * { visibility: visible !important; }
          #forfapp-result { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div id="forfapp-result" ref={printRef} className="w-full max-w-3xl mx-auto animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-emerald-600 px-6 py-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-1">Riepilogo Fiscale Forfettario</h2>
            <p className="text-emerald-100">Stima basata sul regime forfettario aggiornata 2026</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Netto Annuo Stimato</p>
                <p className="text-4xl font-extrabold text-slate-800">{formatCurrency(data.netto)}</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 text-center">
                <p className="text-emerald-600 text-xs font-medium uppercase tracking-wider mb-2">Netto Mensile Stimato</p>
                <p className="text-4xl font-extrabold text-emerald-700">{formatCurrency(data.netto / 12)}</p>
              </div>
            </div>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left px-4 py-3 font-semibold text-slate-700 rounded-tl-lg">Voce</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-700 rounded-tr-lg">Importo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.dettagli.map((item, index) => {
                    const isNetto = item.label.toLowerCase().includes('netto');
                    return (
                      <tr key={index} className={isNetto ? 'bg-emerald-50 font-semibold' : 'hover:bg-slate-50'}>
                        <td className={`px-4 py-3 ${isNetto ? 'text-emerald-800' : 'text-slate-600'}`}>
                          {item.label}
                        </td>
                        <td className={`px-4 py-3 text-right ${isNetto ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {item.value}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-700">Pressione Fiscale Totale</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      {pressioneFiscale.toFixed(1)}%
                    </td>
                  </tr>
                  {data.nomeCassa && (
                    <tr className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-500 text-xs">Gestione Previdenziale</td>
                      <td className="px-4 py-3 text-right text-xs text-slate-600 font-medium">{data.nomeCassa}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
              <p className="text-sm text-amber-800">
                <strong>Nota Bene:</strong> Questo calcolo e una stima indicativa a fini orientativi aggiornata al 2026.
                Le deduzioni, gli acconti e i saldi reali possono variare in base alla situazione specifica.
                Si consiglia sempre una verifica con un professionista abilitato.
              </p>
            </div>

            <div className="no-print flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <Printer className="w-5 h-5" />
                Stampa / Salva PDF
              </button>

              <a
                href={CONFIG.BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('cta_prenota_click', { location: 'result_view' })}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
              >
                Prenota Consulenza Gratuita
              </a>
            </div>

            <div className="no-print">
              <button
                onClick={onReset}
                className="w-full bg-white border-2 border-slate-200 text-slate-600 font-semibold py-3 px-6 rounded-xl hover:bg-slate-50 transition-colors"
              >
                ← Nuovo Calcolo
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
