export interface InputCalcolo {
  importoOriginale: number;
  dataScadenza: Date;
  dataVersamento: Date;
  codiceTributo?: string;
  nomeTributo?: string;
  sezioneF24?: string;
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
  regime: RegimeSanzionatorio;
  sanzioneBasePercentuale: number;
  noteCalcolo: string[];
  calcolatoIl: Date;
}

export type TipoRavvedimento =
  | 'sprint'
  | 'breve'
  | 'intermedio'
  | 'lungo'
  | 'ultrannuale'
  | 'lunghissimo'
  | 'post_pvc'
  | 'post_schema';

export type RegimeSanzionatorio = 'PRE_2024' | 'POST_2024';

export type CategoriaTributo =
  | 'IRPEF'
  | 'IRES'
  | 'IVA'
  | 'IRAP'
  | 'IMU'
  | 'CEDOLARE_SECCA'
  | 'ADD_REGIONALE'
  | 'ADD_COMUNALE'
  | 'SOSTITUTIVA'
  | 'RITENUTE'
  | 'BOLLO'
  | 'REGISTRO'
  | 'CAMERALE'
  | 'TOBIN'
  | 'IVAFE_IVIE'
  | 'PLUSVALENZE'
  | 'INPS'
  | 'ALTRO';

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
  regime: RegimeSanzionatorio;
  validoDa: string;
}
