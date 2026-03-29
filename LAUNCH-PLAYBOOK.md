# BCS AI Suite — Launch Playbook
### Mercato italiano · Lancio 90 giorni

---

## Panoramica strategica

**Tipo di lancio:** Hybrid Launch (multi-canale, mercato professionale italiano)
**Obiettivo primario:** 500 utenti registrati + 50 abbonamenti paganti entro 90 giorni
**Budget:** Bootstrapped / organico-first (LinkedIn ads secondario da mese 2)
**Canali primari:** LinkedIn organico, community professionali italiane, SEO contenuti
**Offerta di lancio:** Early bird AI Crisi — primi 3 mesi a €20/mese (anziché €30)

---

## Target audience per app

| App | Target primario | Canale preferenziale |
|---|---|---|
| AI Crisi | Avvocati, OCC, advisor crisi d'impresa | LinkedIn, gruppi avvocati, Il Sole 24 Ore |
| Trading Fiscale | Trader retail, commercialisti con clienti trader | Reddit r/ItalyFinance, community trading |
| RavvedimentoFacile | Commercialisti, CAF, partite IVA | LinkedIn commercialisti, Facebook Partite IVA |
| Forfettari AI | Freelancer, chi apre P.IVA, commercialisti | TikTok, Instagram, community freelancer |
| UGC Ad Creator | Creator, agenzie social, e-commerce DTC | TikTok, Instagram, LinkedIn marketing |

---

## Settimana 1–2: Fondamenta

### Tecnico
- [x] Fix SEO metadata root (layout.tsx) — già eseguito
- [x] generateMetadata per ogni app (apps/[slug]/page.tsx) — già eseguito
- [x] JSON-LD structured data (src/components/JsonLd.tsx) — già eseguito
- [x] CTA action-verb nelle card prodotto — già eseguito
- [x] Copy upgrade catalogo (tagline + features) — già eseguito
- [ ] Creare OG images (6 PNG, 1200×630) in /public/og/ — 1 per la suite, 1 per ogni app
- [ ] Installare Google Analytics 4 + impostare eventi conversione (sign-up, checkout)
- [ ] Aggiungere JSON-LD al layout e alle pagine app

### Marketing
- [ ] Configurare Google Search Console con il dominio definitivo
- [ ] Creare UTM parameter matrix per tutti i canali (LinkedIn, email, community)
- [ ] Identificare 15 community italiane target (vedi sezione Community Channels)
- [ ] Creare lista email iniziale da contatti esistenti BCS Advisory
- [ ] Preparare kit immagini per i post social (template Canva brandizzato BCS AI)

---

## Settimana 3–4: Costruzione audience

### Contenuti LinkedIn (3 post/settimana)
**Lunedì — Problem awareness:**
> "Ogni anno migliaia di trader italiani perdono 4–6 ore a costruire il report fiscale dal file del broker. Nel 2025 non dovrebbe essere così."

**Mercoledì — Educational/how-to:**
> "Come si calcola il ravvedimento operoso correttamente nel 2025 (con i nuovi tassi legali) — guida in 5 punti"

**Venerdì — Product reveal soft:**
> "Abbiamo costruito un tool che fa questo calcolo in 90 secondi. Ecco come funziona." + screenshot

### SEO — 2 articoli blog target (alta intensità commerciale)
1. **"Come calcolare il ravvedimento operoso 2025: guida completa con esempi"**
   - Target keyword: "ravvedimento operoso 2025 calcolo" (~1.200 ricerche/mese IT)
   - Integra link a RavvedimentoFacile come strumento
2. **"Dichiarazione redditi trading 2025: come calcolare plusvalenze e imposte"**
   - Target keyword: "dichiarazione redditi trading 2025" (~900 ricerche/mese IT)
   - Integra link a Trading Fiscale

### Attività di outreach
- Identificare 5 beta user per AI Crisi per raccogliere testimonianze
- Contattare 3 newsletter di settore italiane (legale, fiscale, marketing) per proposta di collaborazione
- Attivare i contatti degli studi partner BCS Advisory per test early access

---

## Settimana 5–6: Pre-lancio intensivo

### Sequenza email pre-lancio (3 email, 1/settimana)

**Email 1 — Teaser (2 settimane prima)**
```
Oggetto: Stiamo costruendo qualcosa per i professionisti italiani

Ciao [Nome],

da mesi stiamo lavorando a qualcosa di diverso.
Non un altro tool generico di AI.
Qualcosa costruito specificamente per chi lavora in Italia,
con la normativa italiana, per i problemi reali di ogni giorno.

La prossima settimana ti racconto tutto.

BCS AI Team
```

**Email 2 — Reveal (1 settimana prima)**
```
Oggetto: Ecco cosa abbiamo costruito — BCS AI Suite

Ciao [Nome],

cinque strumenti AI costruiti per il mercato italiano:

→ AI Crisi: fascicoli CCII e procedure legali
→ Trading Fiscale: report P&L per trader
→ RavvedimentoFacile: calcolo sanzioni automatico
→ Forfettari AI: tasse regime forfettario
→ UGC Ad Creator: video promozionali da foto

Tutto su bcs-ai.com — lancio il [DATA].

Offerta di lancio: AI Crisi a €20/mese per i primi 3 mesi
(anziché €30). Solo per chi si registra nella prima settimana.

→ Registrati adesso [LINK]
```

**Email 3 — Social proof (3 giorni prima)**
```
Oggetto: "[Beta user] ha generato il suo report fiscale in 4 minuti"

Ciao [Nome],

[Nome beta user], commercialista a Milano, ha usato Trading Fiscale
per la prima volta due settimane fa:

"Ho caricato il file di rendiconto di DEGIRO e in 4 minuti avevo
il report completo. Prima ci mettevo 3 ore." — [Nome], Commercialista

Tra 3 giorni è live per tutti.

→ Registrati prima del lancio [LINK]
```

### Azioni pre-lancio
- Contattare partner (Studio Legale BCS, BCS Advisory, SBM) per condivisione annuncio
- Finalizare pagine prezzi e verificare tutti i checkout Stripe/Supabase
- Impostare live chat (Crisp o Intercom) per primo giorno di lancio
- Preparare le prime 3 risposte alle obiezioni più comuni (FAQ)
- Creare evento LinkedIn "Lancio BCS AI Suite" con data confermata

---

## Settimana 7: LAUNCH WEEK

| Giorno | Azione | Canale |
|---|---|---|
| **Lunedì** | Email VIP/early access alla lista costruita nelle settimane precedenti | Email |
| **Martedì** | Lancio pubblico ufficiale — email broadcast | Email + LinkedIn + X |
| **Martedì** | Submission Product Hunt (categoria italiana/business) | Product Hunt |
| **Mercoledì** | Push social proof — prime reazioni utenti + screenshot | Tutti i social |
| **Giovedì** | Email obiezioni + LinkedIn AMA (Ask Me Anything) | Email + LinkedIn Live |
| **Venerdì** | Email "ultimi 2 giorni offerta lancio" | Email |
| **Sabato** | Recap + post di ringraziamento | Tutti i social |

### Post LinkedIn annuncio lancio (copia-incolla ready)
```
Dopo mesi di sviluppo, oggi lancio BCS AI Suite.

5 strumenti AI verticali costruiti per il mercato italiano:

→ AI Crisi — fascicoli e procedure CCII per avvocati e OCC
→ Trading Fiscale — report P&L con calcolo imposte per trader
→ RavvedimentoFacile — calcolo sanzioni ravvedimento operoso 2025
→ Forfettari AI — tasse regime forfettario, completamente gratuito
→ UGC Ad Creator — video pubblicitari da foto in 60 secondi

Perché l'AI per i professionisti italiani deve parlare italiano,
conoscere il CCII, i codici ATECO e il regime forfettario.
Non solo il mercato americano.

Tutto su bcs-ai.com

Offerta di lancio per AI Crisi (€20/mese per 3 mesi) valida questa settimana.
Link nei commenti ↓
```

### Thread X/Twitter lancio
```
Tweet 1: Lancio oggi BCS AI Suite su bcs-ai.com
5 tool AI verticali per professionisti italiani.
Il perché li ho costruiti e cosa fanno: [thread]

Tweet 2: AI Crisi → per avvocati e OCC.
Fascicolo digitale + knowledge base CCII + generazione atti.
€30/mese, 14gg gratis. bcs-ai.com/apps/ai-crisi

Tweet 3: Trading Fiscale → per chi fa trading.
Carica il file del broker → report fiscale professionale.
Da €9,90 una tantum. bcs-ai.com/apps/trading

Tweet 4: RavvedimentoFacile → per commercialisti e P.IVA.
Calcolo ravvedimento operoso in 90 secondi.
Gratis (3 calcoli) poi €19/mese. bcs-ai.com/apps/ravvedimento

Tweet 5: Forfettari AI → per freelancer e partite IVA.
Tasse forfettario calcolate in 30 secondi.
Completamente gratis. bcs-ai.com/apps/forf

Tweet 6: UGC Ad Creator → per brand e creator.
Da una foto a un video TikTok in 60 secondi.
1 video gratis, poi da €9,60 per 1000 crediti. bcs-ai.com/apps/ugc
```

---

## Settimana 8: Post-lancio

### Analisi
- [ ] Survey post-lancio agli utenti registrati (3 domande max, Google Form)
- [ ] Retrospettiva: obiettivo vs risultato (utenti, paganti, CR per app)
- [ ] Identificare la app con il CTR più alto e raddoppiare il contenuto su quella
- [ ] Analisi qualitativa: quali domande arrivano al supporto? → FAQ da aggiornare

### Operativo
- [ ] Transizione da offerta lancio a pricing standard
- [ ] Attivare sequenza email onboarding per utenti paganti (3 email, settimana 1)
- [ ] Pianificare calendario contenuti per mese 2 (blog SEO + LinkedIn)
- [ ] Valutare attivazione LinkedIn Ads in retargeting (budget: 10% del piano)

---

## Community Channels italiane

| Community | Piattaforma | Audience | Approccio |
|---|---|---|---|
| Avvocati Italiani | LinkedIn Group | Avvocati | Post AI Crisi, problem-awareness |
| Commercialisti e Fiscalisti | LinkedIn Group | Commercialisti | Post Trading/Ravvedimento |
| Partite IVA Italia | Facebook Group | Freelancer | Annuncio Forfettari AI |
| Ecommerce Italia | Facebook Group | Seller/creator | Demo UGC Ad Creator |
| Trading Italia | Facebook Group | Trader | Post Trading Fiscale |
| r/italy + r/italyinformatica | Reddit | Tech-savvy italiani | AMA / product post |
| Freelancecamp Italia | Slack/community | Freelancer | Forfettari AI + UGC |
| Il Sole 24 Ore AI newsletter | PR/Press | Professionisti | Media pitch AI Crisi |
| Corriere Economia | PR/Press | Business | Media pitch suite |
| StartupItalia | PR/Digital | Startup ecosystem | Press release lancio |
| Ninja Marketing | PR/Digital | Marketing/creator | UGC Ad Creator pitch |

---

## Metrics Dashboard

| Metrica | Target sett. 1 | Target mese 1 | Target mese 3 |
|---|---|---|---|
| Utenti registrati | 100 | 300 | 500 |
| Abbonamenti AI Crisi | 10 | 30 | 50 |
| Acquisti one-time (Trading) | 20 | 60 | 120 |
| CR homepage → registrazione | 3% | 4% | 5% |
| Follower LinkedIn | +200 | +500 | +1.000 |
| Impressioni organiche GSC | — | 5.000/mese | 15.000/mese |
| Lista email | 200 | 500 | 1.000 |

---

## Budget allocation (Bootstrapped)

| Canale | % | Note |
|---|---|---|
| SEO content (blog) | 40% | 2 articoli/settimana, keyword ad alta intensità commerciale italiana |
| LinkedIn organico + newsletter | 30% | Gratuito, alto ROI per il B2B professionale italiano |
| Community engagement | 20% | Solo costo di tempo — forum legali/fiscali italiani |
| Paid (LinkedIn Ads) | 10% | Solo retargeting, da attivare dal mese 2 |

---

## OG Images da creare (1200×630px)

File da creare in `/public/og/`:

| File | Contenuto |
|---|---|
| `og-default.png` | BCS AI Suite — headline suite + logo |
| `og-ugc.png` | UGC Ad Creator — "Video AI in 60 secondi" |
| `og-ai-crisi.png` | AI Crisi — "Gestione CCII con AI" |
| `og-trading.png` | Trading Fiscale — "Report fiscale in minuti" |
| `og-ravvedimento.png` | RavvedimentoFacile — "Calcolo sanzioni 2025" |
| `og-forf.png` | Forfettari AI — "Tasse forfettario gratis" |

Formato consigliato: sfondo bianco o degradé brand, logo BCS AI, headline app, URL bcs-ai.com

---

## Verifica pre-lancio (checklist)

### SEO
- [ ] `<title>` di ogni pagina app corretta in browser dev tools
- [ ] Meta description unica per ogni pagina
- [ ] JSON-LD validato su https://search.google.com/test/rich-results
- [ ] Sitemap.xml generata e registrata in Google Search Console
- [ ] OG images presenti e corrette su https://developers.facebook.com/tools/debug/

### Funzionale
- [ ] Flusso registrazione → primo accesso funzionante
- [ ] Checkout Stripe per AI Crisi, Trading Fiscale e RavvedimentoFacile testato
- [ ] Link Privacy Policy (/privacy) e Termini (/termini) raggiungibili dal footer
- [ ] Email transazionali (benvenuto, conferma) ricevute correttamente
- [ ] Live chat (Crisp/Intercom) attiva e monitorata

### Copy
- [ ] CTA action-verb attive su tutte le card prodotto
- [ ] Microcopy trust ("Nessuna carta", "GDPR", ecc.) presente sotto ogni CTA principale
- [ ] Meta title e description corrispondono alla keyword target per ogni app
