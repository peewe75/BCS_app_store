import { NormalizedTransaction, CostLot } from '../types';

export function createLots(
  transactions: NormalizedTransaction[],
): CostLot[] {
  const lots: CostLot[] = [];

  for (const tx of transactions) {
    if (
      tx.mapping?.direzioneLotto !== 'carico' ||
      tx.direzione !== 'entrata'
    ) {
      continue;
    }

    const costoLordo = tx.valoreEUR || 0;
    const feeCap = tx.feeCapitalizzata;
    const costoTotale = costoLordo + feeCap;
    const costoUnitario = tx.qty > 0 ? costoTotale / tx.qty : 0;

    lots.push({
      id: `lot_${tx.id}`,
      asset: tx.asset,
      qty: tx.qty,
      qtyRemaining: tx.qty,
      costoLordo,
      feeCapitalizzata: feeCap,
      costoTotale,
      costoUnitario,
      timestampAcquisto: tx.timestampUTC,
      sourceTransactionId: tx.id,
    });
  }

  return lots;
}

export function getLotsByAsset(
  lots: CostLot[],
  asset: string,
): CostLot[] {
  return lots
    .filter((l) => l.asset === asset && l.qtyRemaining > 0)
    .sort((a, b) => {
      const tsA = a.timestampAcquisto?.getTime() || 0;
      const tsB = b.timestampAcquisto?.getTime() || 0;
      return tsB - tsA;
    });
}

export function consumeLot(
  lot: CostLot,
  qtyToConsume: number,
): { consumed: number; remaining: number; cost: number } {
  const consumed = Math.min(qtyToConsume, lot.qtyRemaining);
  const remaining = lot.qtyRemaining - consumed;
  const cost = consumed * lot.costoUnitario;

  lot.qtyRemaining = remaining;

  return { consumed, remaining, cost };
}
