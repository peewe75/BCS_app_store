export enum SocialManagementType {
  INPS_SEPARATA = "INPS_SEPARATA",
  INPS_ARTIGIANI = "INPS_ARTIGIANI",
  CASSA_PROFESSIONALE = "CASSA_PROFESSIONALE"
}

export interface AtecoCode {
  code: string;
  description: string;
  coeff: number;
}

export interface ProfessionalFund {
  id: string;
  name: string;
  aliq: number; // Aliquota soggettiva standard
  min: number; // Minimale soggettivo (approx)
  description?: string;
}

export interface CalculatorFormData {
  nome: string;
  cognome: string;
  email: string;
  incasso: number | "";
  ateco: AtecoCode | null;
  manualCoeff: number | ""; // Usato se non si seleziona un ATECO
  aliqImposta: 0.05 | 0.15;
  gestione: SocialManagementType;
  selectedFundId?: string; // ID della cassa specifica selezionata
  aliqContributi: number | ""; // Per cassa professionale
  minContributi: number | ""; // Opzionale
  applyMinContributi: boolean;
  deduzioneContributi: boolean;
}

// Payload inviato al server
export interface WebhookPayload {
  nome: string;
  cognome: string;
  email: string;
  incasso: number;
  ateco: string; // Codice o "MANUALE"
  coeff_ateco: number;
  aliq_imposta: number;
  aliq_contributi?: number;
  min_contributi?: number;
  gestione: string;
  nome_cassa?: string; // Nome della cassa specifica
  deduzione_contributi: boolean;
  fonte: string;
  api_key?: string;
  model?: string;
}

// Risposta attesa dal server (facoltativa, se il server fa il calcolo)
export interface WebhookResponse {
  success: boolean;
  data?: {
    netto: number;
    imposta: number;
    contributi: number;
    imponibile?: number;
  };
  message?: string;
}