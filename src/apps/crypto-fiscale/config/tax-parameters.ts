import { TaxParameters } from '../types';

export const TAX_PARAMETERS_2025: TaxParameters = {
  annoFiscale: 2025,
  aliquotaStandard: 0.26,
  aliquota2025: 0.26,
  aliquota2026Plus: 0.33,
  aliquotaEMT: 0.26,
  metodoLotti: 'LIFO',
  anniRetention: 10,
  modelloDefault: 'Redditi PF',
};

export const TAX_PARAMETERS_2026: TaxParameters = {
  annoFiscale: 2026,
  aliquotaStandard: 0.33,
  aliquota2025: 0.26,
  aliquota2026Plus: 0.33,
  aliquotaEMT: 0.26,
  metodoLotti: 'LIFO',
  anniRetention: 10,
  modelloDefault: 'Redditi PF',
};

export function getTaxParameters(annoFiscale: number): TaxParameters {
  if (annoFiscale >= 2026) {
    return TAX_PARAMETERS_2026;
  }
  return TAX_PARAMETERS_2025;
}

export function getAliquotaPerAnno(annoFiscale: number, isEMT: boolean): number {
  if (isEMT) {
    return TAX_PARAMETERS_2026.aliquotaEMT;
  }
  if (annoFiscale >= 2026) {
    return TAX_PARAMETERS_2026.aliquotaStandard;
  }
  return TAX_PARAMETERS_2025.aliquota2025;
}
