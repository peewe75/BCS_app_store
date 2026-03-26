# Fase 2: Semplificazione Accesso e Rimozione Email

## Obiettivo

Rendere l'app di libero utilizzo "plug & play", rimuovendo i colli di bottiglia attuali (login e invio email).

## Istruzioni per l'AI

1. **Rimozione Sistema di Login/Autenticazione:**
   - Individua e rimuovi l'eventuale logica di registrazione, login utente e gestione delle sessioni. L'app deve caricarsi ed essere usabile immediatamente da qualsiasi utente anonimo.
   - Pulisci la UI da bottoni o menu relativi al profilo utente.

2. **Rimozione Invio Email:**
   - L'azione principale "Calcola Netto" (o simili) **NON** deve più raccogliere l'indirizzo email dell'utente per l'invio del report.
   - Individua e disabilita/rimuovi i webhook (es. N8N) o le funzioni backend responsabili dell'invio della mail.
   - Modifica i form della UI rimuovendo campi come "Email per ricevere il report".
