# Fase 6: Ottimizzazione Form Gestione Previdenziale

## Obiettivo

Rendere l'applicazione del minimale annuo automatica e precompilata per ogni selezione della Gestione Previdenziale, migliorando l'usabilità.

## Istruzioni per l'AI

1. **Analisi Logica Attuale:** Controlla come il componente `Calculator.tsx` (sezione Gestione Previdenziale) gestisce i campi `minContributi` e la checkbox `applyMinContributi` per le diverse opzioni (INPS Separata, INPS Artigiani, Cassa Professionale).
2. **Automazione del Minimale:**
   - La checkbox "Applica Minimale (€)" dovrebbe essere controllata (checked) di default ogni volta che si seleziona una gestione che prevede un minimale.
   - Il campo numerico del minimale annuo deve essere precompilato con i valori standard corretti in base alla gestione selezionata (es. per INPS Artigiani/Commercianti l'attuale minimo è circa 4.515€, per le casse professionali varia, quindi assicurati che i default per le opzioni scelte siano correttamente popolati o richiesti come obbligatori se `applyMinContributi` è true).
   - Se l'utente cambia gestione, i dati del minimale devono aggiornarsi automaticamente.
3. **Miglioramento UI:** Se un minimale fisso è imposto dalla legge per quella specifica gestione (es. Inps Commercianti), rendi il campo di input in sola lettura (read-only) o mostralo chiaramente come valore fisso, disabilitando la possibilità di deselezionare la checkbox se non ha senso farlo. Per le casse professionali in cui varia, mantieni l'input editabile ma precompilato con un valore medio/suggerito e la checkbox attiva di default.
