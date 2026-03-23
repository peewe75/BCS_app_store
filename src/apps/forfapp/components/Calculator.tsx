import React, { useState, useMemo } from 'react';
import { ATECO_CODES } from '../data/atecoCodes';
import { PROFESSIONAL_FUNDS } from '../data/professionalFunds';
import { CalculatorFormData, SocialManagementType } from '../types';
import { calculateNetto, CalculationResult, findAtecoCodes, AtecoSuggestion } from '../utils/calculation';
import { Tooltip } from './ui/Tooltip';
import { trackEvent } from '../utils/analytics';

interface CalculatorProps {
  onCalculationComplete: (result: CalculationResult, formData: CalculatorFormData) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onCalculationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [atecoQuery, setAtecoQuery] = useState('');
  const [showAtecoDropdown, setShowAtecoDropdown] = useState(false);
  
  // AI ATECO states
  const [activityDescription, setActivityDescription] = useState('');
  const [atecoSuggestions, setAtecoSuggestions] = useState<AtecoSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CalculatorFormData>({
    nome: '',
    cognome: '',
    email: '',
    incasso: '',
    ateco: null,
    manualCoeff: '',
    aliqImposta: 0.05,
    gestione: SocialManagementType.INPS_SEPARATA,
    selectedFundId: '',
    aliqContributi: '',
    minContributi: '',
    applyMinContributi: false,
    deduzioneContributi: true,
  });

  const filteredAteco = useMemo(() => {
    if (!atecoQuery) return [];
    const lowerQ = atecoQuery.toLowerCase();
    return ATECO_CODES.filter(
      (a) => a.code.includes(lowerQ) || a.description.toLowerCase().includes(lowerQ)
    );
  }, [atecoQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;

    if (type === 'number') {
      val = value === '' ? '' : parseFloat(value);
    } else if (type === 'checkbox') {
      val = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => {
      const newState = { ...prev, [name]: val };

      // Logica specifica quando cambia la Gestione principale
      if (name === 'gestione') {
        if (val === SocialManagementType.INPS_SEPARATA) {
          newState.aliqContributi = '';
          newState.minContributi = '';
          newState.applyMinContributi = false;
          newState.selectedFundId = '';
        } else if (val === SocialManagementType.INPS_ARTIGIANI) {
          newState.aliqContributi = '';
          newState.minContributi = 4515; // Approx minimale artigiani 2024
          newState.applyMinContributi = true;
          newState.selectedFundId = '';
        }
      }

      return newState;
    });
  };

  const handleFundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fundId = e.target.value;
    const fund = PROFESSIONAL_FUNDS.find(f => f.id === fundId);

    if (fund) {
      setFormData(prev => ({
        ...prev,
        selectedFundId: fundId,
        aliqContributi: fund.aliq > 0 ? fund.aliq : '', // Se 0 (Altro), lascia vuoto per input manuale
        minContributi: fund.min > 0 ? fund.min : '',
        applyMinContributi: fund.min > 0 // Se c'è un minimale definito, lo attiviamo di default
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedFundId: '',
        aliqContributi: '',
        minContributi: '',
        applyMinContributi: false
      }));
    }
  };

  const selectAteco = (code: typeof ATECO_CODES[0]) => {
    setFormData((prev) => ({ ...prev, ateco: code, manualCoeff: '' }));
    setAtecoQuery(`${code.code} - ${code.description}`);
    setShowAtecoDropdown(false);
  };

  const handleAIFindAteco = async () => {
    if (!activityDescription.trim()) {
      setAiError("Inserisci una descrizione dell'attività");
      return;
    }
    
    setAiLoading(true);
    setAiError(null);
    setAtecoSuggestions([]);
    
    try {
      const suggestions = await findAtecoCodes(activityDescription);
      setAtecoSuggestions(suggestions);
      if (suggestions.length === 0) {
        setAiError("Nessun codice ATECO trovato. Prova con una descrizione diversa.");
      }
    } catch (err: any) {
      setAiError(err.message || "Errore nella ricerca. Riprova.");
    } finally {
      setAiLoading(false);
    }
  };

  const selectAtecoSuggestion = (suggestion: AtecoSuggestion) => {
    const atecoCode = {
      code: suggestion.code,
      description: suggestion.description,
      coeff: suggestion.coeff
    };
    setFormData((prev) => ({ ...prev, ateco: atecoCode, manualCoeff: '' }));
    setAtecoQuery(`${suggestion.code} - ${suggestion.description}`);
    setAtecoSuggestions([]);
    setActivityDescription('');
  };

  const validate = () => {
    if (!formData.incasso || formData.incasso <= 0) return "Inserisci un incasso valido";
    if (!formData.ateco && (!formData.manualCoeff || formData.manualCoeff <= 0)) {
      return "Seleziona un codice ATECO o inserisci un coefficiente manuale";
    }

    // Validazione specifica Cassa
    if (formData.gestione === SocialManagementType.CASSA_PROFESSIONALE) {
      if (!formData.selectedFundId) return "Seleziona la tua Cassa Professionale di appartenenza";
      if (!formData.aliqContributi) return "Inserisci l'aliquota della tua Cassa Professionale";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    // Tracking Event: Click su Calcola
    trackEvent('calcola_click', {
      incasso: formData.incasso,
      ateco_code: formData.ateco?.code || 'MANUALE',
      gestione: formData.gestione,
      cassa: formData.selectedFundId || 'N/A',
      imposta: formData.aliqImposta
    });

    setLoading(true);

    try {
      const result = calculateNetto(formData, PROFESSIONAL_FUNDS);
      onCalculationComplete(result, formData);
    } catch (err: any) {
      console.error(err);
      setError("Si è verificato un errore. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="calcolatore" className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-primary-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          Calcolatore Netto
        </h2>
        <p className="text-primary-100 text-sm">Inserisci i tuoi dati per una stima immediata.</p>
      </div>



      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Incasso */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Incasso Annuo (€) <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="incasso"
              required
              min="0"
              step="100"
              placeholder="es. 45000"
              value={formData.incasso}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          {/* Imposta Sostitutiva */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-slate-700">Imposta Sostitutiva</label>
              <Tooltip text="5% per i primi 5 anni se nuova attività, altrimenti 15%.">
                <span className="text-slate-400 hover:text-primary-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
              </Tooltip>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, aliqImposta: 0.05 }))}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.aliqImposta === 0.05 ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Start-up (5%)
              </button>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, aliqImposta: 0.15 }))}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.aliqImposta === 0.15 ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Standard (15%)
              </button>
            </div>
          </div>
        </div>

        {/* AI ATECO Search */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4 border border-primary-100">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-semibold text-primary-700">Trova codice ATECO con AI</span>
          </div>
          <p className="text-xs text-slate-600 mb-3">Descrivi la tua attività e l'AI ti suggerirà il codice ATECO più adatto.</p>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="es. sviluppo siti web, consulenza marketing..."
              value={activityDescription}
              onChange={(e) => setActivityDescription(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAIFindAteco}
              disabled={aiLoading}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {aiLoading ? 'Cercando...' : 'Trova'}
            </button>
          </div>

          {aiError && (
            <p className="text-red-600 text-xs mt-2">{aiError}</p>
          )}

          {atecoSuggestions.length > 0 && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Seleziona il codice ATECO:</label>
              <select
                aria-label="Seleziona ATECO consigliato"
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  if (idx >= 0) selectAtecoSuggestion(atecoSuggestions[idx]);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                defaultValue=""
              >
                <option value="" disabled>-- Scegli il codice --</option>
                {atecoSuggestions.map((s, idx) => (
                  <option key={idx} value={idx}>
                    {s.code} - {s.description} (coef. {(s.coeff * 100).toFixed(0)}%)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ATECO Autocomplete */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-sm font-medium text-slate-700">Codice ATECO <span className="text-red-500">*</span></label>
            <Tooltip text="Il Codice ATECO definisce il coefficiente di redditività. Se non trovi il tuo codice, puoi inserire la percentuale manualmente.">
              <span className="text-slate-400 hover:text-primary-600 cursor-help">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
            </Tooltip>
          </div>
          <input
            type="text"
            placeholder="Cerca codice o descrizione (es. 62.01 o Software)"
            value={atecoQuery}
            onChange={(e) => {
              setAtecoQuery(e.target.value);
              setShowAtecoDropdown(true);
              if (!e.target.value) setFormData(p => ({ ...p, ateco: null }));
            }}
            onFocus={() => setShowAtecoDropdown(true)}
            onBlur={() => setTimeout(() => setShowAtecoDropdown(false), 200)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          />

          {showAtecoDropdown && atecoQuery && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 max-h-60 overflow-y-auto">
              {filteredAteco.length > 0 ? (
                filteredAteco.map(code => (
                  <div
                    key={code.code}
                    className="px-4 py-2 hover:bg-primary-50 cursor-pointer text-sm border-b border-slate-50 last:border-0"
                    onMouseDown={() => selectAteco(code)}
                  >
                    <span className="font-bold text-primary-700">{code.code}</span> - {code.description}
                    <div className="text-xs text-slate-500">Coeff. Redditività: {code.coeff * 100}%</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500">
                  Nessun codice trovato.
                  <button type="button" onMouseDown={() => setShowAtecoDropdown(false)} className="text-primary-600 hover:underline ml-1">
                    Chiudi
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Fallback Manual Coeff */}
          {!formData.ateco && (
            <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-sm">
              <p className="text-yellow-800 mb-2">Non trovi il tuo codice? Inserisci il coefficiente manualmente:</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="manualCoeff"
                  placeholder="es. 78"
                  min="1"
                  max="100"
                  value={formData.manualCoeff}
                  onChange={handleInputChange}
                  className="w-24 px-2 py-1 rounded border border-yellow-300 focus:ring-1 focus:ring-yellow-500 outline-none"
                />
                <span className="text-slate-600">%</span>
              </div>
            </div>
          )}
          {formData.ateco && (
            <div className="mt-1 text-xs text-green-700 font-medium">
              Selezionato: {formData.ateco.code} (Coeff: {formData.ateco.coeff * 100}%)
            </div>
          )}
        </div>

        {/* Gestione Previdenziale */}
        <div className="border-t border-slate-200 pt-4 bg-slate-50/50 -mx-6 px-6 pb-6">
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Gestione Previdenziale</label>
            <select
              aria-label="Gestione Previdenziale"
              name="gestione"
              value={formData.gestione}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white mb-4"
            >
              <option value={SocialManagementType.INPS_SEPARATA}>INPS Gestione Separata (Freelance senza cassa)</option>
              <option value={SocialManagementType.INPS_ARTIGIANI}>INPS Artigiani/Commercianti</option>
              <option value={SocialManagementType.CASSA_PROFESSIONALE}>Cassa Professionale (Albo)</option>
            </select>

            {/* Sub-Selection for Cassa Professionale */}
            {formData.gestione === SocialManagementType.CASSA_PROFESSIONALE && (
              <div className="mb-4 animate-fade-in-down">
                <label className="block text-sm font-medium text-primary-700 mb-2">Seleziona il tuo Ente (Albo)</label>
                <select
                  aria-label="Seleziona Cassa Professionale"
                  name="selectedFundId"
                  value={formData.selectedFundId}
                  onChange={handleFundChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-white font-medium"
                >
                  <option value="" disabled>-- Seleziona Cassa --</option>
                  {PROFESSIONAL_FUNDS.map(fund => (
                    <option key={fund.id} value={fund.id}>{fund.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dettagli Contributi (Auto-filled or Manual) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">

              {/* Aliquota */}
              <div className={formData.gestione === SocialManagementType.INPS_SEPARATA ? "opacity-50 pointer-events-none" : ""}>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Aliquota Contributiva (%)
                  {formData.gestione === SocialManagementType.CASSA_PROFESSIONALE && formData.selectedFundId && " (Auto)"}
                </label>
                <input
                  type="number"
                  name="aliqContributi"
                  placeholder={formData.gestione === SocialManagementType.INPS_SEPARATA ? "26.07% (Standard)" : "es. 14.5"}
                  value={formData.gestione === SocialManagementType.INPS_SEPARATA ? 26.07 : formData.aliqContributi}
                  onChange={handleInputChange}
                  readOnly={formData.gestione === SocialManagementType.INPS_SEPARATA}
                  className="w-full px-3 py-2 text-sm rounded border border-slate-300 focus:ring-1 focus:ring-primary-500 outline-none bg-white"
                />
              </div>

              {/* Minimale */}
              <div>
                <div className="flex items-center gap-2 mb-1 min-h-[1.25rem]">
                  <input
                    type="checkbox"
                    id="applyMin"
                    name="applyMinContributi"
                    checked={formData.applyMinContributi}
                    onChange={handleInputChange}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  // Disable manual toggle if a specific fund enforces logic, strictly speaking we allow override but default is set
                  />
                  <label htmlFor="applyMin" className="text-xs font-medium text-slate-600 cursor-pointer select-none">Applica Minimale (€)</label>
                </div>
                <input
                  type="number"
                  name="minContributi"
                  placeholder="€ Minimo annuo"
                  value={formData.minContributi}
                  onChange={handleInputChange}
                  disabled={!formData.applyMinContributi}
                  className={`w-full px-3 py-2 text-sm rounded border border-slate-300 focus:ring-1 focus:ring-primary-500 outline-none transition-colors ${!formData.applyMinContributi ? 'bg-slate-100 text-slate-400' : 'bg-white'}`}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 px-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="deduzione"
                name="deduzioneContributi"
                checked={formData.deduzioneContributi}
                onChange={handleInputChange}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="deduzione" className="text-sm text-slate-700 select-none cursor-pointer">
                Deduzione contributi dal reddito (Consigliato: Sì)
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calcolo in corso...
            </>
          ) : (
            "Calcola il Netto"
          )}
        </button>
        <p className="text-center text-xs text-slate-400">Cliccando accetti la privacy policy dello studio.</p>
      </form>
    </div>
  );
};