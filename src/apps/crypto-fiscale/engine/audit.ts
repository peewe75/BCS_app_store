import { NormalizedTransaction, Realizzo, TransferMatch, AuditAlert } from '../types';

export function runAudit(
  transactions: NormalizedTransaction[],
  realizzi: Realizzo[],
  unmatchedTransfers: TransferMatch[],
): AuditAlert[] {
  const alerts: AuditAlert[] = [];

  for (const tx of transactions) {
    if (!tx.valoreEUR && tx.mapping?.fiscalmenteRilevante) {
      alerts.push({
        tipo: 'warning',
        messaggio: `Transazione ${tx.id} (${tx.causaleRaw}) senza valore EUR`,
        transazioneId: tx.id,
        codice: 'MISSING_EUR_VALUE',
      });
    }

    if (!tx.mapping) {
      alerts.push({
        tipo: 'error',
        messaggio: `Causale non mappata: ${tx.causaleRaw}`,
        transazioneId: tx.id,
        codice: 'UNMAPPED_CAUSALE',
      });
    }
  }

  for (const ut of unmatchedTransfers) {
    alerts.push({
      tipo: 'warning',
      messaggio: `Trasferimento non matchato: ${ut.asset} ${ut.qty} da ${ut.exchangeDa}`,
      codice: 'UNMATCHED_TRANSFER',
    });
  }

  const qtyTolerance = 0.00000001;
  for (const r of realizzi) {
    const qtyAllocata = r.allocazioni.reduce((sum, a) => sum + a.qtyAllocata, 0);
    if (Math.abs(qtyAllocata - r.qtyVenduta) > qtyTolerance) {
      alerts.push({
        tipo: 'error',
        messaggio: `Allocazione incompleta per ${r.asset}: venduto ${r.qtyVenduta}, allocato ${qtyAllocata}`,
        codice: 'INCOMPLETE_ALLOCATION',
      });
    }
  }

  return alerts;
}
