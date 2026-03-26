import React from 'react';
import { CONFIG } from '../constants';
import { CalculationResult, formatCurrency } from '../utils/calculation';
import { trackEvent } from '../utils/analytics';

interface ResultViewProps {
  data: CalculationResult;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ data, onReset }) => {
  const pressioneFiscale = ((data.imposta + data.contributi) / (data.incasso)) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-emerald-600 px-6 py-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-1">Ecco il tuo Netto</h2>
          <p className="text-emerald-100">Stima basata sul regime forfettario</p>
        </div>

        <div className="p-8">
          {/* Main Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Netto Annuo</p>
              <p className="text-4xl font-extrabold text-slate-800">{formatCurrency(data.netto)}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Netto Mensile</p>
              <p className="text-4xl font-extrabold text-primary-600">{formatCurrency(data.netto / 12)}</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left px-4 py-3 font-semibold text-slate-700 rounded-tl-lg">Voce</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700 rounded-tr-lg">Importo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.dettagli.map((item, index) => (
                  <tr key={index} className={item.label.includes('Netto') ? 'bg-primary-50 font-semibold' : ''}>
                    <td className={`px-4 py-3 ${item.label.includes('Netto') ? 'text-primary-800' : 'text-slate-600'}`}>
                      {item.label}
                    </td>
                    <td className={`px-4 py-3 text-right ${item.label.includes('Netto') ? 'text-primary-700' : 'text-slate-800'}`}>
                      {item.value}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-200">
                  <td className="px-4 py-3 font-bold text-slate-800">Pressione Fiscale Totale</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">{pressioneFiscale.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <p className="text-sm text-yellow-700">
              <strong>Nota Bene:</strong> Questo calcolo è una stima indicativa. Le deduzioni, acconti e saldi reali possono variare.
            </p>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 mb-6 text-center">
            <h3 className="text-white text-xl font-bold mb-2">Vuoi un'analisi più approfondita?</h3>
            <p className="text-primary-100 mb-4">Prenota una verifica gratuita con i nostri esperti fiscali.</p>
            <a 
              href={CONFIG.BOOKING_URL}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackEvent('cta_prenota_click', { location: 'result_view' })}
              className="inline-block bg-white text-primary-700 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-slate-50 transition-all"
            >
              Prenota Ora
            </a>
          </div>

          {/* Container for Future Calendar Widget */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
            <p className="text-slate-400 text-sm">
              {/* TODO: Inserire qui il widget del Calendario / Modulo prenota ora */}
              [Spazio per widget calendario - prenotazione]
            </p>
          </div>

          {/* Reset Button */}
          <div className="mt-8">
            <button 
              onClick={onReset}
              className="w-full bg-white border-2 border-slate-200 text-slate-600 font-semibold py-3 px-6 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Nuovo Calcolo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
