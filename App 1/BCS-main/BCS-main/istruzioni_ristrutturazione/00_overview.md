# Overview della Ristrutturazione APP Forfettario

## Obiettivo Principale

Trasformare l'attuale calcolatore forfettario da uno strumento chiuso (con invio report via email) a uno strumento di **lead generation aperto e gratuito**, collegato direttamente al sito principale.

## Punti Chiave dell'Intervento

L'AI incaricata dello sviluppo dovrà seguire i successivi file markdown in ordine cronologico per completare le seguenti fasi:

1. **Infrastruttura Dati (`01_firebase_database.md`)**: Spostamento su Firebase e collegamento con un database centrale.
2. **Semplificazione Accesso (`02_rimozione_email_e_login.md`)**: Eliminazione di ogni barriera all'ingresso (niente login, niente form email per i risultati).
3. **Nuova Visualizzazione Risultati (`03_nuova_ui_tabella_risultati.md`)**: I risultati del calcolo dovranno apparire istantaneamente a schermo tramite una tabella riepilogativa.
4. **Integrazione Motore AI (`04_integrazione_gemini.md`)**: Sostituzione dell'attuale motore AI (OpenRouter) con Google Gemini (utilizzo di una API key fornita).
5. **Conversione e Layout (`05_cta_e_layout_futuro.md`)**: Inserimento di una Call to Action sotto i risultati e predisposizione del layout per un futuro widget di prenotazione (calendario).

## Regole Generali per l'AI

- Non stravolgere la grafica esistente se non per integrare i nuovi elementi (tabella, CTA).
- Procedere passo dopo passo e testare ogni singola fase.
- Mantenere il codice pulito e modulare, rimuovendo codice e dipendenze legacy (es. vecchi invii email o logiche di autenticazione rimosse).
