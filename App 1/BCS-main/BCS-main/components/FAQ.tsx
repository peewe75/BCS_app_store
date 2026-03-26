import React, { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: "Come funziona il regime forfettario?",
    a: "Il regime forfettario è un regime agevolato che prevede una tassazione flat (5% o 15%) calcolata su una percentuale fissa del fatturato (coefficiente di redditività), senza la possibilità di scaricare le spese analiticamente."
  },
  {
    q: "Quanto pago di contributi?",
    a: "Dipende dalla cassa di appartenenza. Se sei in Gestione Separata INPS paghi circa il 26,07% sul reddito. Artigiani e Commercianti hanno minimali fissi e aliquote variabili. Le Casse Professionali (es. Inarcassa) hanno regole specifiche."
  },
  {
    q: "Qual è la differenza tra 5% e 15%?",
    a: "L'aliquota ridotta al 5% si applica per i primi 5 anni se avvii una nuova attività e rispetti determinati requisiti di novità (non mera prosecuzione). Dal 6° anno o in mancanza di requisiti, l'aliquota è al 15%."
  },
  {
    q: "Devo pagare l'IVA sulle fatture?",
    a: "No, il regime forfettario è esente IVA. Non devi aggiungerla in fattura e non devi versarla trimestralmente. Tuttavia, devi assolvere l'imposta di bollo di 2€ per fatture superiori a 77,47€."
  },
  {
    q: "Questa stima è vincolante?",
    a: "Assolutamente no. Questo calcolatore fornisce una stima basata su parametri standard. Per un calcolo preciso che tenga conto di acconti, saldi pregressi e deduzioni specifiche, è necessaria una consulenza fiscale."
  },
  {
    q: "Come funziona la verifica gratuita?",
    a: "Prenotando una call di 20 minuti, analizzeremo il tuo codice ATECO e la tua situazione previdenziale per confermarti la fattibilità del regime forfettario e rispondere ai tuoi dubbi specifici."
  }
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Domande Frequenti</h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-left bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-slate-800">{item.q}</span>
                <span className={`transform transition-transform duration-200 text-primary-600 ${openIndex === index ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 py-4 text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};