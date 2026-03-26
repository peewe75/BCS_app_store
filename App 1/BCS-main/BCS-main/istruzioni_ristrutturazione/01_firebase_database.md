# Fase 1: Setup Firebase e Database Centralizzato

## Obiettivo

Creare e configurare un database Firebase per questa app e predisporre l'infrastruttura per collegare i dati a un database centrale.

## Istruzioni per l'AI

1. **Configurazione Iniziale Firebase:**
   - Inizializza un nuovo progetto Firebase utilizzando il server MCP già disponibile nell'ambiente.
   - Crea un database (Firestore preferibile, a meno di diverse indicazioni) per salvare le interazioni o i dati del calcolatore, se necessario ai fini del tracciamento (ricordando che l'app non ha login obbligatorio).

2. **Collegamento al Database Centrale:**
   - Predisponi una logica (es. una funzione o un service dedicato) che permetta di inviare/sincronizzare i dati raccolti da questa singola app verso un database preesistente esterno che funge da "collettore" per tutti i siti.
   - Per ora, crea il wrapper/interfaccia per questa connessione, lasciando documentato dove inserire i parametri di connessione esatti del DB centrale.

3. **Sicurezza (Firebase Rules):**
   - Assicurati che le regole del database Firebase permettano scritture pubbliche o anonime sicure, considerando che l'app sarà utilizzata senza autenticazione formale.
