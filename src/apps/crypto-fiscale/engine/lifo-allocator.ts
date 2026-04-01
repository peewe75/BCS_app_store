import { NormalizedTransaction, CostLot, LIFOAllocation, Realizzo } from '../types';
import { createLots, getLotsByAsset, consumeLot } from './lot-manager';

export function allocateLIFO(
  transactions: NormalizedTransaction[],
): { lots: CostLot[]; realizzi: Realizzo[] } {
  const lots = createLots(transactions);
  const realizzi: Realizzo[] = [];

  const vendite = transactions.filter(
    (t) =>
      t.mapping?.generaRealizzo &&
      (t.direzione === 'uscita' || t.mapping.direzioneLotto === 'scarico'),
  );

  for (const vendita of vendite) {
    const assetLots = getLotsByAsset(lots, vendita.asset);
    if (assetLots.length === 0) {
      continue;
    }

    let qtyRemaining = vendita.qty;
    let costoTotaleAllocato = 0;
    const allocazioni: LIFOAllocation[] = [];

    for (const lot of assetLots) {
      if (qtyRemaining <= 0) break;

      const { consumed, cost } = consumeLot(lot, qtyRemaining);
      qtyRemaining -= consumed;
      costoTotaleAllocato += cost;

      allocazioni.push({
        lotId: lot.id,
        qtyAllocata: consumed,
        costoUnitario: lot.costoUnitario,
        costoTotale: cost,
        timestampAcquisto: lot.timestampAcquisto,
      });
    }

    const corrispettivoNetto = vendita.corrispettivoNetto || vendita.valoreEUR || 0;
    const plusMinusValenza = corrispettivoNetto - costoTotaleAllocato;
    const aliquota = vendita.aliquotaApplicabile;
    const impostaTeorica = Math.max(plusMinusValenza, 0) * aliquota;

    realizzi.push({
      id: `realizzo_${vendita.id}`,
      asset: vendita.asset,
      timestampVendita: vendita.timestampUTC,
      qtyVenduta: vendita.qty,
      corrispettivoNetto,
      costoFiscaleAllocato: costoTotaleAllocato,
      plusMinusValenza,
      aliquota,
      impostaTeorica,
      allocazioni,
      sourceTransactionId: vendita.id,
    });
  }

  return { lots, realizzi };
}
