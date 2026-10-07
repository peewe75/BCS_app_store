import type { AppRecord } from './catalog';
import { getPublicApps } from './catalog';
export const SWA_URL = 'https://www.socialautomation.app';
export const contactHref = (topic: string) => 'https://wa.me/393477196603?text=' + encodeURIComponent('Ciao SWA, vorrei ' + topic);
export type ToolCopy = {
 name:string; category:string; summary:string; headline:string; intro:string; audience:string; icon:string; action:string;
 benefits:[string,string][]; steps:[string,string][]; faq:[string,string][];
};
const COPY: Record<string,ToolCopy> = {
 ugc:{name:'UGC Video Creator',category:'Marketing & contenuti',icon:'video',summary:'Da una foto del tuo prodotto a un video da condividere.',
 headline:'Il tuo prodotto. Una nuova storia da raccontare.',
 intro:'Parti dalle foto del tuo prodotto, scegli il messaggio e costruisci un video in stile UGC con l’intelligenza artificiale. È il primo strumento che Odino ti presenta nel marketplace SWA.',
 audience:'Per negozi, e-commerce, brand e professionisti che vogliono sperimentare nuovi contenuti per i social.',action:'Richiedi la tua prova',
 benefits:[['Parti da ciò che hai','Usa le foto del tuo prodotto come riferimento per creare una scena.'],['Scegli come raccontarlo','Definisci pubblico, stile e lingua. Rivedi il messaggio prima di generare.'],['Dai movimento all’idea','Trasforma la scena in video e scarica il risultato per valutarlo.']],
 steps:[['Carica il prodotto','Scegli fino a tre fotografie nitide, con dettagli riconoscibili.'],['Costruisci la scena','Imposta il tuo obiettivo e rivedi la proposta creativa.'],['Genera e controlla','Crea il video, verifica il risultato e prepara la pubblicazione.']],
 faq:[['Odino è il nome del generatore UGC?','Odino è la mascotte di SWA e presenta tutti gli strumenti del marketplace. UGC Video Creator è il protagonista del suo primo video.'],['Che cosa comprende la prova gratuita?','Richiedi un esempio per un prodotto. Il team SWA conferma materiale necessario, contenuto incluso e tempi prima di avviare la lavorazione.'],['È un video girato da un cliente reale?','No. È un contenuto in stile UGC generato con AI. Non va presentato come una recensione o una testimonianza autentica.'],['Posso chiedere una campagna completa?','Sì. SWA può affiancare la produzione dei contenuti alla strategia editoriale e alla gestione dei tuoi social.']]},
 trading:{name:'Trading Fiscale',category:'Fisco & finanza',icon:'chart',summary:'Dai movimenti del broker a un report più facile da leggere.',
 headline:'Metti ordine nei dati del tuo trading.',intro:'Raccogli i movimenti del broker e prepara un riepilogo delle operazioni. Una base strutturata da controllare e condividere con il tuo professionista.',audience:'Per investitori e studi che devono organizzare i dati dei conti trading.',action:'Prepara il tuo report',
 benefits:[['Dati raccolti','Importa i file supportati e consulta le operazioni.'],['Riepilogo leggibile','Riunisci risultati e movimenti in un documento ordinato.'],['Confronto più semplice','Porta al professionista una base su cui lavorare.']],
 steps:[['Importa','Carica il file del broker nel formato supportato.'],['Controlla','Verifica periodo, operazioni e dati riconosciuti.'],['Prepara il report','Esporta il riepilogo per la verifica finale.']],
 faq:[['Supporta qualsiasi broker?','Controlla nel tool i formati e i broker disponibili prima di acquistare un report.'],['Sostituisce il commercialista?','No. Dati, trattamento fiscale e dichiarazione vanno verificati dal professionista.']]},
 'ai-crisi':{name:'AI Crisi',category:'Studio & professioni',icon:'scale',summary:'Fascicoli, documenti e bozze per la gestione della crisi d’impresa.',
 headline:'Più ordine nel fascicolo. Più spazio al lavoro professionale.',intro:'Organizza documenti e materiali delle procedure di crisi d’impresa. Usa la ricerca e la generazione assistita per preparare le bozze da verificare.',audience:'Per avvocati, OCC, advisor e studi che seguono procedure di crisi d’impresa e sovraindebitamento.',action:'Esplora AI Crisi',
 benefits:[['Fascicolo organizzato','Raccogli i documenti della pratica in un ambiente dedicato.'],['Ricerca assistita','Lavora sui materiali e sulle fonti disponibili nel tool.'],['Bozze da revisionare','Prepara una prima stesura mantenendo il controllo professionale.']],
 steps:[['Organizza la pratica','Raccogli i documenti e definisci il contesto.'],['Lavora sulle fonti','Consulta i materiali e verifica i riferimenti.'],['Rivedi la bozza','Completa e valida il documento prima dell’utilizzo.']],
 faq:[['Chi verifica gli atti?','Il professionista mantiene la responsabilità di verificare fonti, riferimenti e contenuti delle bozze.'],['Dove si usa?','Il pulsante di accesso apre l’applicazione dedicata.']]},
 'legal-ai-penale':{name:'Legal AI Penale',category:'Studio & professioni',icon:'folder',summary:'Documenti, trascrizioni e timeline in un fascicolo digitale.',
 headline:'Ritrova il filo del tuo fascicolo penale.',intro:'Riunisci i materiali della pratica, consulta trascrizioni e segmenti audio e ricostruisci la sequenza degli eventi in uno spazio di lavoro dedicato.',audience:'Per avvocati penalisti e studi che lavorano con fascicoli, registrazioni e documenti.',action:'Esplora il fascicolo digitale',
 benefits:[['Materiali collegati','Mantieni il contesto tra documenti e registrazioni.'],['Audio consultabile','Lavora sulle trascrizioni e sui segmenti della pratica.'],['Timeline della pratica','Organizza gli eventi per supportare l’analisi.']],
 steps:[['Apri il fascicolo','Organizza una pratica e i suoi materiali.'],['Esamina i documenti','Consulta i contenuti e confrontali con gli originali.'],['Ricostruisci gli eventi','Usa la timeline come supporto al tuo lavoro.']],
 faq:[['Le trascrizioni sono definitive?','Verifica sempre la corrispondenza con le registrazioni originali.'],['Come accedo?','Dal marketplace puoi proseguire nell’app dedicata, con le condizioni di accesso previste dal servizio.']]},
 ravvedimento:{name:'RavvedimentoFacile',category:'Fisco & finanza',icon:'calculator',summary:'Organizza il calcolo di sanzioni, interessi e importi.',
 headline:'Un calcolo più ordinato, dal tributo al riepilogo.',intro:'Inserisci tributo, importo e date per preparare un prospetto di ravvedimento operoso. Ritrova le voci in un riepilogo da controllare prima del versamento.',audience:'Per studi, professionisti e attività che devono preparare un calcolo di ravvedimento.',action:'Apri il calcolatore',
 benefits:[['Inserimento guidato','Raccogli i dati utili al calcolo.'],['Voci separate','Consulta imposta, sanzioni e interessi.'],['Riepilogo esportabile','Conserva un prospetto per la verifica.']],
 steps:[['Inserisci i dati','Indica tributo, importo e date corrette.'],['Controlla il calcolo','Verifica le voci e le condizioni applicate.'],['Conserva il riepilogo','Esporta il risultato per la verifica professionale.']],
 faq:[['Posso usare subito il risultato per pagare?','Prima del versamento verifica aliquote, date, fattispecie e normativa applicabile con il professionista.'],['Il tool esegue il pagamento?','La funzione presentata è il calcolo e la preparazione del riepilogo, non il versamento.']]},
 forf:{name:'Forfettari AI',category:'Fisco & finanza',icon:'calculator',summary:'Simula imposte, contributi e netto della tua attività.',
 headline:'Dai numeri della tua attività a una stima comprensibile.',intro:'Esplora una simulazione del regime forfettario a partire da ricavi e parametri della tua attività. Confronta le voci e prepara le domande per il commercialista.',audience:'Per freelance, partite IVA e professionisti che vogliono orientarsi tra ricavi, imposte e contributi.',action:'Avvia la simulazione',
 benefits:[['Scenario di partenza','Inserisci ricavi e parametri della tua attività.'],['Voci comprensibili','Consulta la stima di imposte e contributi.'],['Più consapevolezza','Usa il riepilogo per pianificare il confronto professionale.']],
 steps:[['Descrivi l’attività','Seleziona i parametri pertinenti.'],['Inserisci i ricavi','Costruisci il tuo scenario di simulazione.'],['Leggi la stima','Verifica i risultati con il tuo consulente.']],
 faq:[['È una dichiarazione fiscale?','No. È una simulazione da verificare rispetto alla tua situazione specifica.'],['Posso confrontare più scenari?','Puoi modificare i dati inseriti e osservare come cambia la stima.']]},
 'crypto-fiscale':{name:'Crypto Fiscale',category:'Fisco & finanza',icon:'chart',summary:'Raccogli e controlla le operazioni dei tuoi exchange.',
 headline:'Una vista più chiara delle tue operazioni crypto.',intro:'Importa i report supportati, consulta le transazioni e prepara un riepilogo per la verifica fiscale. Parti da dati organizzati, mantenendo visibili i passaggi da controllare.',audience:'Per chi opera su exchange e per i professionisti che ne verificano la documentazione.',action:'Organizza le transazioni',
 benefits:[['Importazione dei dati','Raccogli i report degli exchange supportati.'],['Operazioni consultabili','Controlla transazioni e possibili incongruenze.'],['Riepilogo da verificare','Prepara i materiali per il professionista.']],
 steps:[['Carica il report','Usa uno dei formati supportati.'],['Rivedi le operazioni','Controlla transazioni, trasferimenti e dati mancanti.'],['Prepara il riepilogo','Esamina gli output prima dell’uso fiscale.']],
 faq:[['Sono supportati tutti gli exchange?','Verifica i parser disponibili nel tool prima di importare i dati.'],['La dichiarazione è automatica?','Il tool aiuta a organizzare e analizzare i dati; l’applicabilità dei risultati alla dichiarazione richiede una verifica professionale.']]},
 softi:{name:'Mercati Finanziari Analyzer',category:'Fisco & finanza',icon:'chart',summary:'Segui asset, dati e scenari in uno spazio dedicato all’analisi.',
 headline:'Dai dati di mercato a una lettura più chiara.',intro:'Consulta gli strumenti disponibili per monitorare asset, analisi e report. Mercati Finanziari Analyzer raccoglie le informazioni in un ambiente dedicato, a supporto della tua valutazione.',audience:'Per chi svolge analisi di mercato e vuole organizzare informazioni, asset e scenari.',action:'Apri Mercati Finanziari Analyzer',
 benefits:[['Asset organizzati','Segui gli strumenti di tuo interesse.'],['Analisi consultabili','Raccogli i risultati disponibili nel tuo piano.'],['Report di supporto','Confronta informazioni e scenari di mercato.']],
 steps:[['Scegli gli asset','Definisci il tuo ambito di analisi.'],['Consulta gli strumenti','Esamina dati e report disponibili.'],['Valuta gli scenari','Mantieni il controllo sulle tue decisioni.']],
 faq:[['È lo strumento precedentemente chiamato Softi AI Analyzer?','Sì. Nel marketplace SWA viene presentato come Mercati Finanziari Analyzer. Il collegamento apre l’applicazione esistente.'],['Garantisce risultati di investimento?','No. Analisi e scenari non garantiscono rendimenti e non sostituiscono una valutazione dei rischi.']]},
 consenso:{name:'App del Consenso',category:'Studio & professioni',icon:'shield',summary:'Un percorso digitale per documentare dichiarazioni tra adulti.',
 headline:'Un percorso di documentazione consapevole.',intro:'Uno strumento dedicato alla raccolta di dichiarazioni tra adulti. Consulta funzionamento, trattamento dei dati e limiti prima dell’utilizzo.',audience:'Per adulti che desiderano conoscere il percorso di documentazione proposto dall’app.',action:'Scopri come funziona',
 benefits:[['Percorso dedicato','Consulta le modalità di compilazione.'],['Informazioni esplicite','Leggi condizioni e trattamento dei dati.'],['Accesso da mobile','Accedi all’applicazione dal browser.']],
 steps:[['Leggi le condizioni','Comprendi il servizio e i suoi limiti.'],['Segui il percorso','Compila consapevolmente le informazioni richieste.'],['Gestisci i documenti','Consulta le opzioni offerte dall’app.']],
 faq:[['Il documento sostituisce il consenso attuale?','No. Il consenso deve essere libero, specifico, attuale e revocabile. Un documento non autorizza comportamenti futuri né sostituisce la volontà della persona.']]},
 bot:{name:'Bot AI',category:'AI & automazioni',icon:'bot',summary:'Assistenti per rendere più semplice il dialogo con i clienti.',
 headline:'Più continuità nelle risposte ai tuoi clienti.',intro:'Stiamo preparando uno strumento per costruire assistenti AI dedicati al supporto clienti. Raccontaci il tuo caso d’uso per valutare le possibilità con SWA.',audience:'Per attività e team che vogliono organizzare le richieste ricorrenti.',action:'Parliamone con SWA',
 benefits:[['Il tuo caso d’uso','Partiamo dalle domande che ricevi più spesso.'],['Una base di risposte','Organizziamo le informazioni della tua attività.'],['Un flusso controllato','Definiamo quando interviene il team.']],
 steps:[['Raccontaci l’esigenza','Descrivi come gestisci oggi le richieste.'],['Definiamo il percorso','Valutiamo fonti e canali.'],['Segui lo sviluppo','Il tool sarà accessibile quando disponibile.']],
 faq:[['È già disponibile?','Il tool è in preparazione. Puoi contattare SWA per discutere le tue esigenze.']]},
 prompt:{name:'Prompt Lab',category:'AI & automazioni',icon:'spark',summary:'Uno spazio per mettere a punto le tue istruzioni all’AI.',
 headline:'Dai una direzione più chiara alle tue idee.',intro:'Stiamo preparando un ambiente per lavorare su istruzioni, obiettivi e contesto dei prompt. Nel frattempo SWA può aiutarti a definire il tuo metodo di lavoro.',audience:'Per professionisti e team che usano l’AI nelle attività quotidiane.',action:'Parliamone con SWA',
 benefits:[['Obiettivo esplicito','Definisci il risultato che cerchi.'],['Contesto utile','Organizza le informazioni da fornire.'],['Iterazione consapevole','Valuta e migliora le istruzioni.']],
 steps:[['Scegli un caso d’uso','Parti da un’attività concreta.'],['Descrivi il risultato','Chiarisci cosa deve produrre l’AI.'],['Confrontati con SWA','Valuta come rendere ripetibile il tuo processo.']],
 faq:[['Posso già usare Prompt Lab?','Il tool è in preparazione. La pagina presenta il progetto e il contatto con SWA.']]},
};
export type SwaTool = AppRecord & {copy:ToolCopy};
export {toolSlug, toolHref} from './marketplace-paths';
export async function getSwaTools():Promise<SwaTool[]> {
 const apps = await getPublicApps();
 const records = apps.some(a=>a.id==='consenso') ? apps : [...apps, {
 id:'consenso',name:'App del Consenso',tagline:'',description:'',category:'Legal',badge:'',features:[],
 accent_color:'#153B32',bg_color:'#FFFDF7',bg_gradient:null,pricing_badge:null,pricing_model:'free',price_label:null,
 cta_text:'Apri',cta_href:'https://app-del-consenso-git.netlify.app/',is_internal:false,internal_route:null,video_src:null,
 poster_src:'/tools/images/Consenso.png',layout:'text-left' as const,sort_order:10,is_active:true,is_coming_soon:false,created_at:null
 }];
 return records.filter(a=>a.is_active).map(app=>({...app,copy:COPY[app.id] ?? {
 name:app.name,category:app.category??'AI & automazioni',summary:app.tagline??'',headline:app.name,intro:app.description??'',
 audience:'Scopri lo strumento e confrontati con SWA sul tuo caso d’uso.',icon:'spark',action:'Scopri lo strumento',benefits:[],steps:[],faq:[]
 }}));
}
