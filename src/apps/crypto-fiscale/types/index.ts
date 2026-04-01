export interface TaxParameters {
  annoFiscale: number;
  aliquotaStandard: number;
  aliquota2025: number;
  aliquota2026Plus: number;
  aliquotaEMT: number;
  metodoLotti: 'LIFO' | 'FIFO';
  anniRetention: number;
  modelloDefault: '730' | 'Redditi PF';
}

export interface TransactionMapping {
  causale: string;
  categoriaNormalizzata: string;
  fiscalmenteRilevante: boolean;
  generaRealizzo: boolean;
  generaProvento: boolean;
  aggiornaMonitoraggio: boolean;
  direzioneLotto: 'carico' | 'scarico' | 'nessuno';
  trattamentoFee: 'capitalizza' | 'deduci' | 'ignora';
}

export interface AssetInfo {
  symbol: string;
  name: string;
  isEMT: boolean;
  categoria: 'crypto' | 'stablecoin' | 'token' | 'fiat';
}

export interface RawTransaction {
  id: string;
  exchange: string;
  timestampUTC: Date | null;
  causaleRaw: string;
  assetIn: string | null;
  qtyIn: number | null;
  assetOut: string | null;
  qtyOut: number | null;
  feeAsset: string | null;
  feeQty: number | null;
  valoreEUR: number | null;
  orderID: string | null;
  txHash: string | null;
  sourceFile: string;
  rigaSorgente: number;
  rawData: Record<string, unknown>;
}

export interface NormalizedTransaction {
  id: string;
  timestampUTC: Date | null;
  exchange: string;
  causaleRaw: string;
  mapping: TransactionMapping | null;
  asset: string;
  qty: number;
  direzione: 'entrata' | 'uscita' | 'trasferimento' | 'nessuno';
  valoreEUR: number | null;
  feeEUR: number | null;
  feeCapitalizzata: number;
  costoUnitario: number | null;
  corrispettivoNetto: number | null;
  aliquotaApplicabile: number;
  isEMT: boolean;
  transferKey: string | null;
  isTransferMatched: boolean;
  sourceFile: string;
  rigaSorgente: number;
}

export interface CostLot {
  id: string;
  asset: string;
  qty: number;
  qtyRemaining: number;
  costoLordo: number;
  feeCapitalizzata: number;
  costoTotale: number;
  costoUnitario: number;
  timestampAcquisto: Date | null;
  sourceTransactionId: string;
}

export interface LIFOAllocation {
  lotId: string;
  qtyAllocata: number;
  costoUnitario: number;
  costoTotale: number;
  timestampAcquisto: Date | null;
}

export interface Realizzo {
  id: string;
  asset: string;
  timestampVendita: Date | null;
  qtyVenduta: number;
  corrispettivoNetto: number;
  costoFiscaleAllocato: number;
  plusMinusValenza: number;
  aliquota: number;
  impostaTeorica: number;
  allocazioni: LIFOAllocation[];
  sourceTransactionId: string;
}

export interface Provento {
  id: string;
  asset: string;
  tipo: string;
  qty: number;
  valoreEUR: number;
  aliquota: number;
  impostaTeorica: number;
  timestamp: Date | null;
  sourceTransactionId: string;
}

export interface TransferMatch {
  asset: string;
  qty: number;
  timestampDa: Date | null;
  timestampA: Date | null;
  exchangeDa: string;
  exchangeA: string;
  matched: boolean;
  transazioneDaId: string;
  transazioneAId: string;
}

export interface QuadroRWEntry {
  asset: string;
  quantitaIniziale: number;
  valoreInizialeEUR: number;
  quantitaFinale: number;
  valoreFinaleEUR: number;
  giorniPossesso: number;
  exchange: string;
}

export interface QuadroRTEntry {
  asset: string;
  corrispettivoTotale: number;
  costoTotale: number;
  plusMinusValenza: number;
  aliquota: number;
  imposta: number;
}

export interface AuditAlert {
  tipo: 'error' | 'warning' | 'info';
  messaggio: string;
  transazioneId?: string;
  codice: string;
}

export interface CryptoSession {
  id: string;
  userId: string;
  annoFiscale: number;
  modello: '730' | 'Redditi PF';
  status: 'draft' | 'processing' | 'completed' | 'error';
  summary: {
    righeImportate: number;
    movimentiRilevanti: number;
    realizzi: number;
    proventi: number;
    trasferimentiDaVerificare: number;
    anomalie: number;
    plusMinusNetta: number;
    impostaTeorica: number;
  };
  createdAt: string;
  updatedAt: string;
}
