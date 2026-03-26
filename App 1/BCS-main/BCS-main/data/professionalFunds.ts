import { ProfessionalFund } from "../types";

// Dati indicativi basati su valori medi 2024/2025.
// Nota: Alcune casse hanno regole complesse (agevolazioni under 35, scaglioni). 
// Qui usiamo i parametri standard per una stima realistica.

export const PROFESSIONAL_FUNDS: ProfessionalFund[] = [
  { 
    id: "INARCASSA", 
    name: "Inarcassa (Architetti e Ingegneri)", 
    aliq: 14.5, 
    min: 2640,
    description: "Contributo soggettivo 14.5% + minimale ~2.640€"
  },
  { 
    id: "CASSA_FORENSE", 
    name: "Cassa Forense (Avvocati)", 
    aliq: 15, 
    min: 3355, 
    description: "Contributo soggettivo 15% + minimale ~3.355€"
  },
  { 
    id: "ENPAP", 
    name: "ENPAP (Psicologi)", 
    aliq: 10, 
    min: 780,
    description: "Contributo 10% + minimale soggettivo ~780€"
  },
  { 
    id: "CNPADC", 
    name: "CNPADC (Dottori Commercialisti)", 
    aliq: 12, // Range 12-100%, usiamo base comune
    min: 2860,
    description: "Contributo variabile (min 12%) + minimale ~2.860€"
  },
  { 
    id: "ENPAM", 
    name: "ENPAM (Medici - Quota B)", 
    aliq: 19.5, 
    min: 0, // La Quota B spesso non ha minimale se reddito basso o coperto da Quota A, ma dipende. Mettiamo 0 e lasciamo calcolo %
    description: "Quota B libera professione: 19.5%"
  },
  { 
    id: "INPGI", 
    name: "INPGI / INPS (Giornalisti)", 
    aliq: 26.07, // Passati sotto INPS gestione separata ex-INPGI
    min: 0,
    description: "Gestione previdenziale giornalisti (ex INPGI)"
  },
  { 
    id: "ENPAPI", 
    name: "ENPAPI (Infermieri)", 
    aliq: 16, 
    min: 1600,
    description: "Contributo soggettivo 16% + minimale ~1.600€"
  },
  { 
    id: "EPAP", 
    name: "EPAP (Pluricategoriale - Agronomi, Geologi, ecc.)", 
    aliq: 10, 
    min: 1000, // Approx
    description: "Contributo 10%"
  },
  { 
    id: "ENPAV", 
    name: "ENPAV (Veterinari)", 
    aliq: 16, // Sale progressivamente
    min: 1800, // Approx ridotto
    description: "Contributo soggettivo ~16%"
  },
  { 
    id: "CIPAG", 
    name: "CIPAG (Geometri)", 
    aliq: 18, 
    min: 3350,
    description: "Contributo soggettivo 18%"
  },
  {
    id: "ALTRO",
    name: "Altra Cassa Professionale",
    aliq: 0,
    min: 0,
    description: "Inserimento manuale aliquote"
  }
];