import { NormalizedTransaction, Provento } from '../types';

const PROVENTO_CATEGORIE = new Set([
  'provento_staking',
  'provento_airdrop',
  'provento_referral',
  'provento_interessi',
  'provento_earn',
  'provento_launchpool',
  'provento_cashback',
  'distribuzione',
  'rimborso',
  'funding_futures',
]);

export function classifyIncome(
  transactions: NormalizedTransaction[],
): Provento[] {
  const proventi: Provento[] = [];

  for (const tx of transactions) {
    if (!tx.mapping || !PROVENTO_CATEGORIE.has(tx.mapping.categoriaNormalizzata)) {
      continue;
    }

    const valoreEUR = tx.valoreEUR || 0;
    const aliquota = tx.aliquotaApplicabile;
    const impostaTeorica = Math.max(valoreEUR, 0) * aliquota;

    proventi.push({
      id: `provento_${tx.id}`,
      asset: tx.asset,
      tipo: tx.mapping.categoriaNormalizzata,
      qty: tx.qty,
      valoreEUR,
      aliquota,
      impostaTeorica,
      timestamp: tx.timestampUTC,
      sourceTransactionId: tx.id,
    });
  }

  return proventi;
}
