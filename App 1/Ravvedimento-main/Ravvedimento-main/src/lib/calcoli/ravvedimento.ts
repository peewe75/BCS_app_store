import { differenceInDays, isAfter, isBefore, eachDayOfInterval, startOfYear, endOfYear, getYear } from "date-fns";
import type { 
  InputCalcolo, 
  RisultatoCalcolo, 
  TipoRavvedimento, 
  DettaglioInteressi,
  TassoInteresse,
  ScaglioneSanzione 
} from "@/types/calcolo";

export const TASSI_INTERESSE_STORICI: TassoInteresse[] = [
  { anno: 2000, tassoPercentuale: 3.50, dataDecorrenza: '2000-01-01', dataFine: '2000-12-31', riferimentoNormativo: 'D.M. 11 dicembre 1999' },
  { anno: 2001, tassoPercentuale: 3.50, dataDecorrenza: '2001-01-01', dataFine: '2001-12-31', riferimentoNormativo: 'D.M. 11 dicembre 1999' },
  { anno: 2002, tassoPercentuale: 3.00, dataDecorrenza: '2002-01-01', dataFine: '2002-12-31', riferimentoNormativo: 'D.M. 11 dicembre 2001' },
  { anno: 2003, tassoPercentuale: 2.50, dataDecorrenza: '2003-01-01', dataFine: '2003-12-31', riferimentoNormativo: 'D.M. 1 febbraio 2003' },
  { anno: 2004, tassoPercentuale: 2.50, dataDecorrenza: '2004-01-01', dataFine: '2004-12-31', riferimentoNormativo: 'D.M. 1 febbraio 2003' },
  { anno: 2005, tassoPercentuale: 2.50, dataDecorrenza: '2005-01-01', dataFine: '2005-12-31', riferimentoNormativo: 'D.M. 1 febbraio 2003' },
  { anno: 2006, tassoPercentuale: 2.50, dataDecorrenza: '2006-01-01', dataFine: '2006-12-31', riferimentoNormativo: 'D.M. 1 febbraio 2003' },
  { anno: 2007, tassoPercentuale: 2.50, dataDecorrenza: '2007-01-01', dataFine: '2007-12-31', riferimentoNormativo: 'D.M. 1 febbraio 2003' },
  { anno: 2008, tassoPercentuale: 3.00, dataDecorrenza: '2008-01-01', dataFine: '2008-12-31', riferimentoNormativo: 'D.M. 12 dicembre 2007' },
  { anno: 2009, tassoPercentuale: 1.00, dataDecorrenza: '2009-01-01', dataFine: '2009-12-31', riferimentoNormativo: 'D.M. 4 dicembre 2008' },
  { anno: 2010, tassoPercentuale: 1.00, dataDecorrenza: '2010-01-01', dataFine: '2010-12-31', riferimentoNormativo: 'D.M. 4 dicembre 2009' },
  { anno: 2011, tassoPercentuale: 1.50, dataDecorrenza: '2011-01-01', dataFine: '2011-12-31', riferimentoNormativo: 'D.M. 7 dicembre 2010' },
  { anno: 2012, tassoPercentuale: 2.50, dataDecorrenza: '2012-01-01', dataFine: '2012-12-31', riferimentoNormativo: 'D.M. 12 dicembre 2011' },
  { anno: 2013, tassoPercentuale: 2.50, dataDecorrenza: '2013-01-01', dataFine: '2013-12-31', riferimentoNormativo: 'D.M. 12 dicembre 2011' },
  { anno: 2014, tassoPercentuale: 1.00, dataDecorrenza: '2014-01-01', dataFine: '2014-12-31', riferimentoNormativo: 'D.M. 12 dicembre 2013' },
  { anno: 2015, tassoPercentuale: 0.50, dataDecorrenza: '2015-01-01', dataFine: '2015-12-31', riferimentoNormativo: 'D.M. 11 dicembre 2014' },
  { anno: 2016, tassoPercentuale: 0.20, dataDecorrenza: '2016-01-01', dataFine: '2016-12-31', riferimentoNormativo: 'D.M. 11 dicembre 2015' },
  { anno: 2017, tassoPercentuale: 0.10, dataDecorrenza: '2017-01-01', dataFine: '2017-12-31', riferimentoNormativo: 'D.M. 7 dicembre 2016' },
  { anno: 2018, tassoPercentuale: 0.30, dataDecorrenza: '2018-01-01', dataFine: '2018-12-31', riferimentoNormativo: 'D.M. 13 dicembre 2017' },
  { anno: 2019, tassoPercentuale: 0.80, dataDecorrenza: '2019-01-01', dataFine: '2019-12-31', riferimentoNormativo: 'D.M. 12 dicembre 2018' },
  { anno: 2020, tassoPercentuale: 0.05, dataDecorrenza: '2020-01-01', dataFine: '2020-12-31', riferimentoNormativo: 'D.M. 12 dicembre 2019' },
  { anno: 2021, tassoPercentuale: 0.01, dataDecorrenza: '2021-01-01', dataFine: '2021-12-31', riferimentoNormativo: 'D.M. 11 dicembre 2020' },
  { anno: 2022, tassoPercentuale: 1.25, dataDecorrenza: '2022-01-01', dataFine: '2022-12-31', riferimentoNormativo: 'D.M. 13 dicembre 2021' },
  { anno: 2023, tassoPercentuale: 5.00, dataDecorrenza: '2023-01-01', dataFine: '2023-12-31', riferimentoNormativo: 'D.M. 13 dicembre 2022' },
  { anno: 2024, tassoPercentuale: 2.50, dataDecorrenza: '2024-01-01', dataFine: '2024-12-31', riferimentoNormativo: 'D.M. 29 novembre 2023' },
  { anno: 2025, tassoPercentuale: 2.00, dataDecorrenza: '2025-01-01', dataFine: '2025-12-31', riferimentoNormativo: 'D.M. 10 dicembre 2024' },
  { anno: 2026, tassoPercentuale: 1.60, dataDecorrenza: '2026-01-01', riferimentoNormativo: 'D.M. MEF 10 dicembre 2025 - G.U. 13/12/2025' },
];

export const SCAGLIONI_SANZIONI: ScaglioneSanzione[] = [
  {
    tipoRavvedimento: 'sprint_15',
    nomeDisplay: 'Ravvedimento Sprint (entro 15 giorni)',
    giorniDa: 1,
    giorniA: 15,
    riduzioneSanzione: 0.10,
    descrizioneRiduzione: '1/10 del minimo (3%)',
    sanzioneBasePercentuale: 30.00,
    riferimentoNormativo: 'Art. 13, c. 1, lett. a-bis) D.Lgs. 472/1997 mod. D.Lgs. 87/2024',
    regime: 'POST_2024',
    validoDa: '2024-09-01'
  },
  {
    tipoRavvedimento: 'breve',
    nomeDisplay: 'Ravvedimento Breve (16-90 giorni)',
    giorniDa: 16,
    giorniA: 90,
    riduzioneSanzione: 1/9,
    descrizioneRiduzione: '1/9 del minimo (3,33%)',
    sanzioneBasePercentuale: 30.00,
    riferimentoNormativo: 'Art. 13, c. 1, lett. a-bis) D.Lgs. 472/1997 mod. D.Lgs. 87/2024',
    regime: 'POST_2024',
    validoDa: '2024-09-01'
  },
  {
    tipoRavvedimento: 'intermedio',
    nomeDisplay: 'Ravvedimento Intermedio (91 gg - 1 anno)',
    giorniDa: 91,
    giorniA: 365,
    riduzioneSanzione: 0.125,
    descrizioneRiduzione: '1/8 del minimo (3,75%)',
    sanzioneBasePercentuale: 30.00,
    riferimentoNormativo: 'Art. 13, c. 1, lett. b) D.Lgs. 472/1997 mod. D.Lgs. 87/2024',
    regime: 'POST_2024',
    validoDa: '2024-09-01'
  },
  {
    tipoRavvedimento: 'lungo',
    nomeDisplay: 'Ravvedimento Lungo (1-2 anni)',
    giorniDa: 366,
    giorniA: 730,
    riduzioneSanzione: 1/6,
    descrizioneRiduzione: '1/6 del minimo (5%)',
    sanzioneBasePercentuale: 30.00,
    riferimentoNormativo: 'Art. 13, c. 1, lett. b-bis) D.Lgs. 472/1997 mod. D.Lgs. 87/2024',
    regime: 'POST_2024',
    validoDa: '2024-09-01'
  },
  {
    tipoRavvedimento: 'lunghissimo',
    nomeDisplay: 'Ravvedimento Lunghissimo (oltre 2 anni)',
    giorniDa: 731,
    giorniA: null,
    riduzioneSanzione: 0.20,
    descrizioneRiduzione: '1/5 del minimo (6%)',
    sanzioneBasePercentuale: 30.00,
    riferimentoNormativo: 'Art. 13, c. 1, lett. b-ter) D.Lgs. 472/1997 mod. D.Lgs. 87/2024',
    regime: 'POST_2024',
    validoDa: '2024-09-01'
  }
];

export function classificaRavvedimento(giorniRitardo: number): {
  tipo: TipoRavvedimento;
  nome: string;
  riduzione: number;
  percentualeSanzione: number;
  riferimento: string;
} {
  if (giorniRitardo <= 15) {
    return {
      tipo: 'sprint_15',
      nome: 'Ravvedimento Sprint (entro 15 giorni)',
      riduzione: 1/10,
      percentualeSanzione: 0.30 * (1/10) * 100,
      riferimento: 'Art. 13, c. 1, lett. a-bis) D.Lgs. 472/1997'
    };
  }
  if (giorniRitardo <= 90) {
    return {
      tipo: 'breve',
      nome: 'Ravvedimento Breve (16-90 giorni)',
      riduzione: 1/9,
      percentualeSanzione: 0.30 * (1/9) * 100,
      riferimento: 'Art. 13, c. 1, lett. a-bis) D.Lgs. 472/1997'
    };
  }
  if (giorniRitardo <= 365) {
    return {
      tipo: 'intermedio',
      nome: 'Ravvedimento Intermedio (91 gg - 1 anno)',
      riduzione: 1/8,
      percentualeSanzione: 0.30 * (1/8) * 100,
      riferimento: 'Art. 13, c. 1, lett. b) D.Lgs. 472/1997'
    };
  }
  if (giorniRitardo <= 730) {
    return {
      tipo: 'lungo',
      nome: 'Ravvedimento Lungo (1-2 anni)',
      riduzione: 1/6,
      percentualeSanzione: 0.30 * (1/6) * 100,
      riferimento: 'Art. 13, c. 1, lett. b-bis) D.Lgs. 472/1997'
    };
  }
  return {
    tipo: 'lunghissimo',
    nome: 'Ravvedimento Lunghissimo (oltre 2 anni)',
    riduzione: 1/5,
    percentualeSanzione: 0.30 * (1/5) * 100,
    riferimento: 'Art. 13, c. 1, lett. b-ter) D.Lgs. 472/1997'
  };
}

export function calcolaInteressi(
  importoOriginale: number,
  dataScadenza: Date,
  dataVersamento: Date,
  tassiStorici: TassoInteresse[] = TASSI_INTERESSE_STORICI
): { dettaglio: DettaglioInteressi[]; totale: number } {
  const dettaglio: DettaglioInteressi[] = [];
  let totaleInteressi = 0;
  
  let dataCorrente = new Date(dataScadenza);
  
  while (isBefore(dataCorrente, dataVersamento)) {
    const anno = getYear(dataCorrente);
    const inizioAnno = startOfYear(new Date(anno, 0, 1));
    const fineAnno = endOfYear(new Date(anno, 0, 1));
    
    const inizioPeriodo = isAfter(dataCorrente, inizioAnno) ? dataCorrente : inizioAnno;
    const finePeriodo = isBefore(fineAnno, dataVersamento) ? fineAnno : dataVersamento;
    
    const giorniInAnno = differenceInDays(finePeriodo, inizioPeriodo);
    
    if (giorniInAnno > 0) {
      const tassoAnno = tassiStorici.find(t => t.anno === anno)?.tassoPercentuale ?? 0;
      const interessiAnno = importoOriginale * (tassoAnno / 100) * (giorniInAnno / 365);
      
      dettaglio.push({
        anno,
        giorniInAnno,
        importoSuCuiCalcolato: importoOriginale,
        tassoPercentuale: tassoAnno,
        interessiAnno: Math.round(interessiAnno * 1000000) / 1000000
      });
      
      totaleInteressi += interessiAnno;
    }
    
    dataCorrente = new Date(anno + 1, 0, 1);
  }
  
  return {
    dettaglio,
    totale: Math.round(totaleInteressi * 100) / 100
  };
}

export function calcolaRavvedimento(
  input: InputCalcolo,
  tassiStorici: TassoInteresse[] = TASSI_INTERESSE_STORICI
): RisultatoCalcolo {
  const { importoOriginale, dataScadenza, dataVersamento } = input;
  const giorniRitardo = differenceInDays(dataVersamento, dataScadenza);
  
  if (giorniRitardo <= 0) {
    throw new Error('La data di versamento deve essere successiva alla data di scadenza');
  }
  
  if (importoOriginale <= 0) {
    throw new Error("L'importo deve essere maggiore di zero");
  }
  
  const classificazione = classificaRavvedimento(giorniRitardo);
  const sanzioneMassima = importoOriginale * 0.30;
  const sanzioneRidotta = importoOriginale * (classificazione.percentualeSanzione / 100);
  
  const { dettaglio: dettaglioInteressi, totale: totaleInteressi } = calcolaInteressi(
    importoOriginale,
    dataScadenza,
    dataVersamento,
    tassiStorici
  );
  
  const totaleRavvedimento = importoOriginale + sanzioneRidotta + totaleInteressi;
  const totaleDaVersare = Math.round(totaleRavvedimento * 100) / 100;
  
  const noteCalcolo = [
    `Sanzione base: 30% = € ${sanzioneMassima.toFixed(2)}`,
    `Riduzione applicata: ${classificazione.riduzione.toFixed(4)} (${classificazione.nome})`,
    `Sanzione ridotta: ${classificazione.percentualeSanzione.toFixed(4)}% = € ${sanzioneRidotta.toFixed(2)}`,
    `Interessi calcolati su € ${importoOriginale.toFixed(2)} per ${giorniRitardo} giorni`,
    `Base normativa: ${classificazione.riferimento}`,
    `Regime sanzionatorio: post D.Lgs. 87/2024 (vigente dal 01/09/2024)`
  ];
  
  return {
    input,
    giorniRitardo,
    tipoRavvedimento: classificazione.tipo,
    nomeTipoRavvedimento: classificazione.nome,
    sanzioneMassima,
    percentualeSanzioneRidotta: classificazione.percentualeSanzione,
    sanzioneRidotta,
    dettaglioInteressi,
    totaleInteressi,
    totaleRavvedimento,
    totaleDaVersare,
    riferimentoNormativo: classificazione.riferimento,
    noteCalcolo,
    calcolatoIl: new Date()
  };
}

export function getTassoInteresseAttuale(): TassoInteresse {
  const annoCorrente = new Date().getFullYear();
  return TASSI_INTERESSE_STORICI.find(t => t.anno === annoCorrente) ?? TASSI_INTERESSE_STORICI[TASSI_INTERESSE_STORICI.length - 1];
}
