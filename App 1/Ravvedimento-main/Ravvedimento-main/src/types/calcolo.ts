export interface InputCalcolo {
  importoOriginale: number;
  dataScadenza: Date;
  dataVersamento: Date;
  codiceTributo?: string;
  nomeTributo?: string;
}

export interface DettaglioInteressi {
  anno: number;
  giorniInAnno: number;
  importoSuCuiCalcolato: number;
  tassoPercentuale: number;
  interessiAnno: number;
}

export interface RisultatoCalcolo {
  input: InputCalcolo;
  giorniRitardo: number;
  tipoRavvedimento: TipoRavvedimento;
  nomeTipoRavvedimento: string;
  
  sanzioneMassima: number;
  percentualeSanzioneRidotta: number;
  sanzioneRidotta: number;
  
  dettaglioInteressi: DettaglioInteressi[];
  totaleInteressi: number;
  
  totaleRavvedimento: number;
  totaleDaVersare: number;
  
  riferimentoNormativo: string;
  noteCalcolo: string[];
  
  calcolatoIl: Date;
}

export type TipoRavvedimento = 
  | 'sprint_15'
  | 'breve'
  | 'intermedio'
  | 'lungo'
  | 'lunghissimo';

export type CategoriaTributo = 'IRPEF' | 'IVA' | 'IRAP' | 'IMU' | 'INPS' | 'ALTRO';

export interface Tributo {
  codiceTributo: string;
  nome: string;
  categoria: CategoriaTributo;
  descrizione?: string;
  sezioneF24: string;
  attivo: boolean;
}

export interface TassoInteresse {
  anno: number;
  tassoPercentuale: number;
  dataDecorrenza: string;
  dataFine?: string;
  riferimentoNormativo: string;
  gazzettaUfficiale?: string;
  note?: string;
}

export interface ScaglioneSanzione {
  tipoRavvedimento: TipoRavvedimento;
  nomeDisplay: string;
  giorniDa: number;
  giorniA: number | null;
  riduzioneSanzione: number;
  descrizioneRiduzione: string;
  sanzioneBasePercentuale: number;
  riferimentoNormativo?: string;
  regime: 'PRE_2024' | 'POST_2024';
  validoDa: string;
  validoFino?: string;
}
