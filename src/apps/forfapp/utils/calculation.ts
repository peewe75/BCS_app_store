import { SocialManagementType, CalculatorFormData, ProfessionalFund } from '../types';

export interface AtecoSuggestion {
  code: string;
  description: string;
  coeff: number;
}

export interface CalculationResult {
  incasso: number;
  coefficiente: number;
  redditoImponibile: number;
  contributi: number;
  imponibileReddito: number;
  imposta: number;
  netto: number;
  nomeCassa: string;
  dettagli: {
    label: string;
    value: string;
  }[];
}

export function calculateNetto(
  formData: CalculatorFormData,
  professionalFunds: ProfessionalFund[]
): CalculationResult {
  const incasso = Number(formData.incasso);
  const coefficiente = formData.ateco
    ? formData.ateco.coeff
    : (Number(formData.manualCoeff) / 100);

  const redditoImponibile = incasso * coefficiente;

  let contributi = 0;
  let minContributi = 0;
  let nomeCassa = '';
  let aliqContributi = 0;

  if (formData.gestione === SocialManagementType.INPS_SEPARATA) {
    aliqContributi = 0.2607;
    nomeCassa = 'Gestione Separata INPS';
    contributi = redditoImponibile * aliqContributi;
  } else if (formData.gestione === SocialManagementType.INPS_ARTIGIANI) {
    aliqContributi = 0.24;
    nomeCassa = 'INPS Artigiani/Commercianti';
    minContributi = Number(formData.minContributi) || 4515;
    contributi = Math.max(redditoImponibile * aliqContributi, minContributi);
  } else if (formData.gestione === SocialManagementType.CASSA_PROFESSIONALE) {
    const selectedFund = professionalFunds.find(f => f.id === formData.selectedFundId);
    nomeCassa = selectedFund ? selectedFund.name : 'Cassa Professionale';
    aliqContributi = (Number(formData.aliqContributi) / 100) || 0;
    minContributi = formData.applyMinContributi ? Number(formData.minContributi) : 0;

    const contributiCalcolati = redditoImponibile * aliqContributi;
    contributi = minContributi > 0 ? Math.max(contributiCalcolati, minContributi) : contributiCalcolati;
  }

  let imponibileReddito = redditoImponibile;
  if (formData.deduzioneContributi) {
    imponibileReddito = Math.max(0, redditoImponibile - contributi);
  }

  const imposta = imponibileReddito * formData.aliqImposta;
  const netto = Math.max(0, incasso - contributi - imposta);

  const dettagli = [
    { label: 'Incasso Annuo', value: formatCurrency(incasso) },
    { label: 'Coefficiente Redditività', value: `${(coefficiente * 100).toFixed(0)}%` },
    { label: 'Reddito Imponibile', value: formatCurrency(redditoImponibile) },
    { label: 'Contributi', value: formatCurrency(contributi) + (minContributi > 0 ? ' (minimo applicato)' : '') },
    { label: 'Imposta Sostitutiva', value: formatCurrency(imposta) + ` (${(formData.aliqImposta * 100)}%)` },
    { label: 'Netto Annuo', value: formatCurrency(netto) },
    { label: 'Netto Mensile', value: formatCurrency(netto / 12) },
  ];

  return {
    incasso,
    coefficiente,
    redditoImponibile,
    contributi,
    imponibileReddito,
    imposta,
    netto,
    nomeCassa,
    dettagli,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export async function findAtecoCodes(activityDescription: string): Promise<AtecoSuggestion[]> {
  const response = await fetch('/api/forfapp/ateco', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activityDescription }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Errore nella ricerca AI');
  }

  const data = await response.json();
  if (!data.suggestions) throw new Error('Risposta AI non valida');

  return data.suggestions;
}
