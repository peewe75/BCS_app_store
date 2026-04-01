import { NormalizedTransaction, CostLot, Realizzo, QuadroRWEntry, QuadroRTEntry } from '../types';

export function generateQuadroRW(
  transactions: NormalizedTransaction[],
  lots: CostLot[],
): QuadroRWEntry[] {
  const assetMap = new Map<string, {
    asset: string;
    quantitaIniziale: number;
    valoreInizialeEUR: number;
    quantitaFinale: number;
    valoreFinaleEUR: number;
    exchange: string;
  }>();

  for (const tx of transactions) {
    if (!assetMap.has(tx.asset)) {
      assetMap.set(tx.asset, {
        asset: tx.asset,
        quantitaIniziale: 0,
        valoreInizialeEUR: 0,
        quantitaFinale: 0,
        valoreFinaleEUR: 0,
        exchange: tx.exchange,
      });
    }
    const entry = assetMap.get(tx.asset)!;
    if (tx.direzione === 'entrata') {
      entry.quantitaFinale += tx.qty;
      if (tx.valoreEUR) entry.valoreFinaleEUR += tx.valoreEUR;
    } else if (tx.direzione === 'uscita') {
      entry.quantitaFinale -= tx.qty;
      if (tx.valoreEUR) entry.valoreFinaleEUR -= tx.valoreEUR;
    }
  }

  const entries: QuadroRWEntry[] = [];
  for (const [asset, data] of assetMap) {
    const remainingLots = lots.filter((l) => l.asset === asset);
    const totaleLotti = remainingLots.reduce((sum, l) => sum + l.qtyRemaining, 0);

    entries.push({
      asset,
      quantitaIniziale: data.quantitaFinale - totaleLotti,
      valoreInizialeEUR: data.valoreFinaleEUR - remainingLots.reduce((s, l) => s + (l.qtyRemaining * l.costoUnitario), 0),
      quantitaFinale: data.quantitaFinale,
      valoreFinaleEUR: data.valoreFinaleEUR,
      giorniPossesso: 365,
      exchange: data.exchange,
    });
  }

  return entries;
}

export function generateQuadroRT(
  realizzi: Realizzo[],
): QuadroRTEntry[] {
  const assetMap = new Map<string, {
    asset: string;
    corrispettivoTotale: number;
    costoTotale: number;
    plusMinusValenza: number;
    aliquota: number;
    imposta: number;
  }>();

  for (const r of realizzi) {
    if (!assetMap.has(r.asset)) {
      assetMap.set(r.asset, {
        asset: r.asset,
        corrispettivoTotale: 0,
        costoTotale: 0,
        plusMinusValenza: 0,
        aliquota: r.aliquota,
        imposta: 0,
      });
    }
    const entry = assetMap.get(r.asset)!;
    entry.corrispettivoTotale += r.corrispettivoNetto;
    entry.costoTotale += r.costoFiscaleAllocato;
    entry.plusMinusValenza += r.plusMinusValenza;
    entry.imposta += r.impostaTeorica;
  }

  return Array.from(assetMap.values());
}
