import { Realizzo, Provento } from '../types';

export interface GainsSummary {
  plusvalenzeTotali: number;
  minusvalenzeTotali: number;
  plusMinusNetta: number;
  impostaTeoricaTotale: number;
  realizzi: Realizzo[];
}

export function calculateGains(
  realizzi: Realizzo[],
): GainsSummary {
  let plusvalenzeTotali = 0;
  let minusvalenzeTotali = 0;
  let impostaTeoricaTotale = 0;

  for (const r of realizzi) {
    if (r.plusMinusValenza > 0) {
      plusvalenzeTotali += r.plusMinusValenza;
    } else {
      minusvalenzeTotali += Math.abs(r.plusMinusValenza);
    }
    impostaTeoricaTotale += r.impostaTeorica;
  }

  return {
    plusvalenzeTotali,
    minusvalenzeTotali,
    plusMinusNetta: plusvalenzeTotali - minusvalenzeTotali,
    impostaTeoricaTotale,
    realizzi,
  };
}

export interface IncomeSummary {
  proventiTotali: number;
  impostaProventi: number;
  proventi: Provento[];
  breakdownPerTipo: Record<string, number>;
}

export function calculateIncome(
  proventi: Provento[],
): IncomeSummary {
  let proventiTotali = 0;
  let impostaProventi = 0;
  const breakdownPerTipo: Record<string, number> = {};

  for (const p of proventi) {
    proventiTotali += p.valoreEUR;
    impostaProventi += p.impostaTeorica;

    if (!breakdownPerTipo[p.tipo]) {
      breakdownPerTipo[p.tipo] = 0;
    }
    breakdownPerTipo[p.tipo] += p.valoreEUR;
  }

  return {
    proventiTotali,
    impostaProventi,
    proventi,
    breakdownPerTipo,
  };
}
