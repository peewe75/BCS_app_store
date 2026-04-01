import { RawTransaction, NormalizedTransaction, TransactionMapping } from '../types';
import { getTransactionMapping } from '../config/transaction-mapping';
import { getAssetInfo, isEMTAsset } from '../config/asset-registry';

export function normalizeTransactions(
  rawTransactions: RawTransaction[],
  annoFiscale: number,
): NormalizedTransaction[] {
  return rawTransactions.map((raw) => {
    const mapping = getTransactionMapping(raw.causaleRaw);
    const asset = raw.assetIn || raw.assetOut || '';
    const qty = raw.qtyIn !== null ? raw.qtyIn || 0 : Math.abs(raw.qtyOut || 0);
    const direzione = getDirezione(mapping, raw);
    const assetInfo = getAssetInfo(asset);
    const aliquota = getAliquotaApplicabile(annoFiscale, assetInfo.isEMT);

    const feeEUR = calcolaFeeEUR(raw);
    const feeCapitalizzata = mapping?.trattamentoFee === 'capitalizza' ? feeEUR : 0;
    const costoUnitario = calcolaCostoUnitario(raw, qty, feeCapitalizzata);
    const corrispettivoNetto = calcolaCorrispettivoNetto(raw, mapping);

    return {
      id: raw.id,
      timestampUTC: raw.timestampUTC,
      exchange: raw.exchange,
      causaleRaw: raw.causaleRaw,
      mapping,
      asset,
      qty,
      direzione,
      valoreEUR: raw.valoreEUR,
      feeEUR,
      feeCapitalizzata,
      costoUnitario,
      corrispettivoNetto,
      aliquotaApplicabile: aliquota,
      isEMT: assetInfo.isEMT,
      transferKey: generateTransferKey(raw, mapping),
      isTransferMatched: false,
      sourceFile: raw.sourceFile,
      rigaSorgente: raw.rigaSorgente,
    };
  });
}

function getDirezione(
  mapping: TransactionMapping | null,
  raw: RawTransaction,
): NormalizedTransaction['direzione'] {
  if (!mapping) return 'nessuno';
  if (mapping.direzioneLotto === 'carico') return 'entrata';
  if (mapping.direzioneLotto === 'scarico') return 'uscita';
  if (raw.causaleRaw.includes('TRANSFER')) return 'trasferimento';
  return 'nessuno';
}

function getAliquotaApplicabile(annoFiscale: number, isEMT: boolean): number {
  if (isEMT) return 0.26;
  if (annoFiscale >= 2026) return 0.33;
  return 0.26;
}

function calcolaFeeEUR(raw: RawTransaction): number {
  if (raw.feeQty !== null && raw.feeQty !== undefined) {
    return 0;
  }
  return 0;
}

function calcolaCostoUnitario(
  raw: RawTransaction,
  qty: number,
  feeCapitalizzata: number,
): number | null {
  if (!raw.valoreEUR || qty === 0) return null;
  return (raw.valoreEUR + feeCapitalizzata) / qty;
}

function calcolaCorrispettivoNetto(
  raw: RawTransaction,
  mapping: TransactionMapping | null,
): number | null {
  if (!raw.valoreEUR) return null;
  if (mapping?.trattamentoFee === 'deduci') {
    return raw.valoreEUR;
  }
  return raw.valoreEUR;
}

function generateTransferKey(
  raw: RawTransaction,
  mapping: TransactionMapping | null,
): string | null {
  if (!mapping || !mapping.categoriaNormalizzata.includes('trasferimento')) return null;
  const asset = raw.assetIn || raw.assetOut || '';
  const qty = raw.qtyIn || Math.abs(raw.qtyOut || 0);
  const date = raw.timestampUTC ? raw.timestampUTC.toISOString().split('T')[0] : '';
  return `${asset}_${qty}_${date}`;
}
