import { create } from 'zustand';
import type { InputCalcolo, RisultatoCalcolo, Tributo } from './types';
import { calcolaRavvedimento, TASSI_INTERESSE_STORICI } from './calcolo';

export const TRIBUTI: Tributo[] = [
  { codiceTributo: '4001', nome: 'IRPEF saldo', categoria: 'IRPEF', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '4033', nome: 'IRPEF acconto prima rata', categoria: 'IRPEF', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '4034', nome: 'IRPEF acconto seconda rata o unica', categoria: 'IRPEF', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6001', nome: 'IVA mensile gennaio', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6002', nome: 'IVA mensile febbraio', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6003', nome: 'IVA mensile marzo', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6004', nome: 'IVA mensile aprile', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6005', nome: 'IVA mensile maggio', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6006', nome: 'IVA mensile giugno', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6007', nome: 'IVA mensile luglio', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6008', nome: 'IVA mensile agosto', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6009', nome: 'IVA mensile settembre', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6010', nome: 'IVA mensile ottobre', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6011', nome: 'IVA mensile novembre', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6012', nome: 'IVA mensile dicembre', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6031', nome: 'IVA trimestrale 1\u00B0 trimestre', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6032', nome: 'IVA trimestrale 2\u00B0 trimestre', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6033', nome: 'IVA trimestrale 3\u00B0 trimestre', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '3812', nome: 'IRAP saldo', categoria: 'IRAP', sezioneF24: 'REGIONI', attivo: true },
  { codiceTributo: '3813', nome: 'IRAP acconto prima rata', categoria: 'IRAP', sezioneF24: 'REGIONI', attivo: true },
  { codiceTributo: '3843', nome: 'IRAP acconto seconda rata', categoria: 'IRAP', sezioneF24: 'REGIONI', attivo: true },
  { codiceTributo: '3800', nome: 'IMU abitazione principale', categoria: 'IMU', sezioneF24: 'ICI_IMU', attivo: true },
  { codiceTributo: '3918', nome: 'IMU altri fabbricati', categoria: 'IMU', sezioneF24: 'ICI_IMU', attivo: true },
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
  nextStep: () => { const { step } = get(); if (step < 3) set({ step: step + 1 }); },
  prevStep: () => { const { step } = get(); if (step > 1) set({ step: step - 1 }); },
  setInput: (newInput) => { const { input } = get(); set({ input: { ...input, ...newInput } }); },
  calculate: () => {
    const { input } = get();
    set({ isCalculating: true, error: null });
    try {
      const risultato = calcolaRavvedimento(input, TASSI_INTERESSE_STORICI);
      set({ risultato, isCalculating: false, step: 3 });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Errore nel calcolo', isCalculating: false });
    }
  },
  reset: () => set({ step: 1, input: initialInput, risultato: null, error: null }),
}));
