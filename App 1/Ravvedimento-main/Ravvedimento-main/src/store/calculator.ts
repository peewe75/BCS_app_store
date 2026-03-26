import { create } from 'zustand';
import type { InputCalcolo, RisultatoCalcolo, Tributo } from '@/types/calcolo';
import { calcolaRavvedimento, TASSI_INTERESSE_STORICI } from '@/lib/calcoli/ravvedimento';

export const TRIBUTI: Tributo[] = [
  { codiceTributo: '4001', nome: 'IRPEF saldo', categoria: 'IRPEF', descrizione: 'IRPEF saldo', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '4033', nome: 'IRPEF acconto prima rata', categoria: 'IRPEF', descrizione: 'IRPEF acconto prima rata', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '4034', nome: 'IRPEF acconto seconda rata o unica', categoria: 'IRPEF', descrizione: 'IRPEF acconto seconda rata', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6001', nome: 'IVA mensile gennaio', categoria: 'IVA', descrizione: 'IVA mensile gennaio', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6002', nome: 'IVA mensile febbraio', categoria: 'IVA', descrizione: 'IVA mensile febbraio', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6003', nome: 'IVA mensile marzo', categoria: 'IVA', descrizione: 'IVA mensile marzo', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6004', nome: 'IVA mensile aprile', categoria: 'IVA', descrizione: 'IVA mensile aprile', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6005', nome: 'IVA mensile maggio', categoria: 'IVA', descrizione: 'IVA mensile maggio', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6006', nome: 'IVA mensile giugno', categoria: 'IVA', descrizione: 'IVA mensile giugno', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6007', nome: 'IVA mensile luglio', categoria: 'IVA', descrizione: 'IVA mensile luglio', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6008', nome: 'IVA mensile agosto', categoria: 'IVA', descrizione: 'IVA mensile agosto', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6009', nome: 'IVA mensile settembre', categoria: 'IVA', descrizione: 'IVA mensile settembre', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6010', nome: 'IVA mensile ottobre', categoria: 'IVA', descrizione: 'IVA mensile ottobre', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6011', nome: 'IVA mensile novembre', categoria: 'IVA', descrizione: 'IVA mensile novembre', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6012', nome: 'IVA mensile dicembre', categoria: 'IVA', descrizione: 'IVA mensile dicembre', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6031', nome: 'IVA trimestrale 1° trimestre', categoria: 'IVA', descrizione: 'IVA trimestrale 1° trimestre', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6032', nome: 'IVA trimestrale 2° trimestre', categoria: 'IVA', descrizione: 'IVA trimestrale 2° trimestre', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6033', nome: 'IVA trimestrale 3° trimestre', categoria: 'IVA', descrizione: 'IVA trimestrale 3° trimestre', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '3812', nome: 'IRAP saldo', categoria: 'IRAP', descrizione: 'IRAP saldo', sezioneF24: 'REGIONI', attivo: true },
  { codiceTributo: '3813', nome: 'IRAP acconto prima rata', categoria: 'IRAP', descrizione: 'IRAP acconto prima rata', sezioneF24: 'REGIONI', attivo: true },
  { codiceTributo: '3843', nome: 'IRAP acconto seconda rata', categoria: 'IRAP', descrizione: 'IRAP acconto seconda rata', sezioneF24: 'REGIONI', attivo: true },
  { codiceTributo: '3800', nome: 'IMU abitazione principale', categoria: 'IMU', descrizione: 'IMU abitazione principale', sezioneF24: 'ICI_IMU', attivo: true },
  { codiceTributo: '3918', nome: 'IMU altri fabbricati', categoria: 'IMU', descrizione: 'IMU altri fabbricati', sezioneF24: 'ICI_IMU', attivo: true },
];

interface CalculatorState {
  step: number;
  input: InputCalcolo;
  risultato: RisultatoCalcolo | null;
  isCalculating: boolean;
  error: string | null;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setInput: (input: Partial<InputCalcolo>) => void;
  calculate: () => void;
  reset: () => void;
}

const initialInput: InputCalcolo = {
  importoOriginale: 0,
  dataScadenza: new Date(),
  dataVersamento: new Date(),
  codiceTributo: '',
  nomeTributo: '',
};

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  step: 1,
  input: initialInput,
  risultato: null,
  isCalculating: false,
  error: null,

  setStep: (step) => set({ step, error: null }),

  nextStep: () => {
    const { step } = get();
    if (step < 3) set({ step: step + 1 });
  },

  prevStep: () => {
    const { step } = get();
    if (step > 1) set({ step: step - 1 });
  },

  setInput: (newInput) => {
    const { input } = get();
    set({ input: { ...input, ...newInput } });
  },

  calculate: () => {
    const { input } = get();
    set({ isCalculating: true, error: null });

    try {
      const risultato = calcolaRavvedimento(input, TASSI_INTERESSE_STORICI);
      set({ risultato, isCalculating: false, step: 3 });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Errore nel calcolo',
        isCalculating: false
      });
    }
  },

  reset: () => set({
    step: 1,
    input: initialInput,
    risultato: null,
    error: null
  }),
}));
