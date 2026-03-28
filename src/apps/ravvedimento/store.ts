import { create } from 'zustand';
import type { InputCalcolo, RisultatoCalcolo, Tributo } from './types';
import { calcolaRavvedimento, TASSI_INTERESSE_STORICI } from './calcolo';

export const TRIBUTI: Tributo[] = [
  { codiceTributo: '4001', nome: 'IRPEF saldo', categoria: 'IRPEF', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '4033', nome: 'IRPEF acconto prima rata', categoria: 'IRPEF', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '4034', nome: 'IRPEF acconto seconda rata o unica', categoria: 'IRPEF', sezioneF24: 'ERARIO', attivo: true },

  { codiceTributo: '2003', nome: 'IRES saldo', categoria: 'IRES', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '2001', nome: 'IRES acconto prima rata', categoria: 'IRES', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '2002', nome: 'IRES acconto seconda rata o unica', categoria: 'IRES', sezioneF24: 'ERARIO', attivo: true },

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
  { codiceTributo: '6031', nome: 'IVA trimestrale 1° trimestre', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6032', nome: 'IVA trimestrale 2° trimestre', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6033', nome: 'IVA trimestrale 3° trimestre', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6099', nome: 'IVA annuale', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6013', nome: 'IVA acconto dicembre', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6034', nome: 'IVA 4° trimestre autotrasportatori', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '6035', nome: 'IVA annuale contribuenti trimestrali', categoria: 'IVA', sezioneF24: 'ERARIO', attivo: true },

  { codiceTributo: '3812', nome: 'IRAP saldo', categoria: 'IRAP', sezioneF24: 'REGIONI', attivo: true },
  { codiceTributo: '3813', nome: 'IRAP acconto prima rata', categoria: 'IRAP', sezioneF24: 'REGIONI', attivo: true },
  { codiceTributo: '3843', nome: 'IRAP acconto seconda rata', categoria: 'IRAP', sezioneF24: 'REGIONI', attivo: true },

  { codiceTributo: '3800', nome: 'IMU abitazione principale', categoria: 'IMU', sezioneF24: 'ICI_IMU', attivo: true },
  { codiceTributo: '3918', nome: 'IMU altri fabbricati', categoria: 'IMU', sezioneF24: 'ICI_IMU', attivo: true },
  { codiceTributo: '3914', nome: 'IMU terreni agricoli', categoria: 'IMU', sezioneF24: 'ICI_IMU', attivo: true },
  { codiceTributo: '3916', nome: 'IMU aree fabbricabili', categoria: 'IMU', sezioneF24: 'ICI_IMU', attivo: true },
  { codiceTributo: '3925', nome: 'IMU immobili cat. D - quota stato', categoria: 'IMU', sezioneF24: 'ICI_IMU', attivo: true },
  { codiceTributo: '3930', nome: 'IMU immobili cat. D - incremento comune', categoria: 'IMU', sezioneF24: 'ICI_IMU', attivo: true },

  { codiceTributo: '1840', nome: 'Cedolare secca acconto prima rata', categoria: 'CEDOLARE_SECCA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1841', nome: 'Cedolare secca acconto seconda rata o unica', categoria: 'CEDOLARE_SECCA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1842', nome: 'Cedolare secca saldo', categoria: 'CEDOLARE_SECCA', sezioneF24: 'ERARIO', attivo: true },

  { codiceTributo: '3801', nome: 'Addizionale regionale IRPEF saldo', categoria: 'ADD_REGIONALE', sezioneF24: 'REGIONI', attivo: true },
  { codiceTributo: '3805', nome: 'Addizionale regionale IRPEF autotassazione', categoria: 'ADD_REGIONALE', sezioneF24: 'REGIONI', attivo: true },

  { codiceTributo: '3843', nome: 'Addizionale comunale IRPEF acconto', categoria: 'ADD_COMUNALE', sezioneF24: 'EL', attivo: true },
  { codiceTributo: '3844', nome: 'Addizionale comunale IRPEF saldo', categoria: 'ADD_COMUNALE', sezioneF24: 'EL', attivo: true },
  { codiceTributo: '3845', nome: 'Addizionale comunale IRPEF autotassazione', categoria: 'ADD_COMUNALE', sezioneF24: 'EL', attivo: true },

  { codiceTributo: '1790', nome: 'Imposta sostitutiva regime forfettario acconto I rata', categoria: 'SOSTITUTIVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1791', nome: 'Imposta sostitutiva regime forfettario acconto II rata o unica', categoria: 'SOSTITUTIVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1792', nome: 'Imposta sostitutiva regime forfettario saldo', categoria: 'SOSTITUTIVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1793', nome: 'Imposta sostitutiva contribuenti minimi saldo', categoria: 'SOSTITUTIVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1794', nome: 'Imposta sostitutiva contribuenti minimi acconto I rata', categoria: 'SOSTITUTIVA', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1795', nome: 'Imposta sostitutiva contribuenti minimi acconto II rata o unica', categoria: 'SOSTITUTIVA', sezioneF24: 'ERARIO', attivo: true },

  { codiceTributo: '1001', nome: "Ritenute retribuzioni, pensioni, trasferte, mensilita aggiuntive", categoria: 'RITENUTE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1002', nome: 'Ritenute emolumenti arretrati', categoria: 'RITENUTE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1012', nome: 'Ritenute indennita cessazione rapporto di lavoro', categoria: 'RITENUTE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1040', nome: 'Ritenute lavoro autonomo, provvigioni e redditi diversi', categoria: 'RITENUTE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1038', nome: 'Ritenute provvigioni per rapporti di commissione, agenzia, mediazione', categoria: 'RITENUTE', sezioneF24: 'ERARIO', attivo: true },

  { codiceTributo: '2501', nome: 'Imposta di bollo', categoria: 'BOLLO', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '2502', nome: 'Imposta di bollo fatture elettroniche I trimestre', categoria: 'BOLLO', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '2503', nome: 'Imposta di bollo fatture elettroniche II trimestre', categoria: 'BOLLO', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '2504', nome: 'Imposta di bollo fatture elettroniche III trimestre', categoria: 'BOLLO', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '2505', nome: 'Imposta di bollo fatture elettroniche IV trimestre', categoria: 'BOLLO', sezioneF24: 'ERARIO', attivo: true },

  { codiceTributo: '1550', nome: 'Imposta di registro locazioni', categoria: 'REGISTRO', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1501', nome: 'Imposta di registro atti privati', categoria: 'REGISTRO', sezioneF24: 'ERARIO', attivo: true },

  { codiceTributo: '3850', nome: 'Diritto camerale annuale', categoria: 'CAMERALE', sezioneF24: 'ALTRI_ENTI', attivo: true },

  { codiceTributo: '4059', nome: 'Imposta transazioni finanziarie - azioni', categoria: 'TOBIN', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '4060', nome: 'Imposta transazioni finanziarie - derivati', categoria: 'TOBIN', sezioneF24: 'ERARIO', attivo: true },

  { codiceTributo: '4043', nome: 'IVAFE saldo', categoria: 'IVAFE_IVIE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '4047', nome: 'IVAFE acconto prima rata', categoria: 'IVAFE_IVIE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '4048', nome: 'IVAFE acconto seconda rata o unica', categoria: 'IVAFE_IVIE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '4041', nome: 'IVIE saldo', categoria: 'IVAFE_IVIE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '4044', nome: 'IVIE acconto prima rata', categoria: 'IVAFE_IVIE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '4045', nome: 'IVIE acconto seconda rata o unica', categoria: 'IVAFE_IVIE', sezioneF24: 'ERARIO', attivo: true },

  { codiceTributo: '1100', nome: 'Imposta sostitutiva plusvalenze partecipazioni non qualificate', categoria: 'PLUSVALENZE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1108', nome: 'Imposta sostitutiva plusvalenze partecipazioni (dichiarativo)', categoria: 'PLUSVALENZE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1715', nome: 'Imposta sostitutiva plusvalenze e redditi cripto-attivita', categoria: 'PLUSVALENZE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1242', nome: 'Imposta sostitutiva redditi capitale da fonte estera', categoria: 'PLUSVALENZE', sezioneF24: 'ERARIO', attivo: true },
  { codiceTributo: '1864', nome: 'Imposta sostitutiva plusvalenze partecipazioni qualificate (non residenti)', categoria: 'PLUSVALENZE', sezioneF24: 'ERARIO', attivo: true },
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
  sezioneF24: '',
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
    if (step < 3) {
      set({ step: step + 1 });
    }
  },
  prevStep: () => {
    const { step } = get();
    if (step > 1) {
      set({ step: step - 1 });
    }
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
      set({ error: err instanceof Error ? err.message : 'Errore nel calcolo', isCalculating: false });
    }
  },
  reset: () => set({ step: 1, input: initialInput, risultato: null, error: null }),
}));
