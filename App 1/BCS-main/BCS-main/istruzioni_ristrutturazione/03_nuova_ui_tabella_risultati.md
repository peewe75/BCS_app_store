# Fase 3: Nuova UI e Tabella dei Risultati

## Obiettivo

Mostrare i risultati del calcolo istantaneamente a schermo, in un formato tabellare chiaro e leggibile.

## Istruzioni per l'AI

1. **Risultati a Schermo (In Linea):**
   - Una volta che l'utente clicca su "Calcola" e l'elaborazione è completata, rendi visibile un nuovo componente React (o aggiorna il layout esistente) per mostrare i risultati.
   - I risultati non appariranno più in alert o popup generici, e tanto meno via email.

2. **Formato Tabella:**
   - Struttura i dati restituiti dal calcolo (es. Fatturato, Tasse, Inps, Coefficiente, Netto, ecc.) all'interno di una tabella responsive HTML/Tailwind.
   - Mantieni la coerenza grafica con l'applicazione (usa i colori definiti nel progetto, come `primary-600` e varianti).
   - Assicurati che le cifre siano formattate correttamente come valuta (es. €).

3. **Logica di Reset:**
   - Aggiungi la possibilità all'utente di effettuare un "Nuovo Calcolo" che svuoti la tabella e riporti il form allo stato iniziale pronto per nuovi input.
