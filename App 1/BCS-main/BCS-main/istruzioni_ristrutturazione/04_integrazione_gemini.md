# Fase 4: Integrazione Google Gemini API

## Obiettivo

Sostituire la logica di chiamata all'AI per far usare Google Gemini al posto di OpenRouter, sfruttando la chiave gratuita fornita.

## Istruzioni per l'AI

1. **Chiave e Endpoint:**
   - La chiave API da utilizzare è: `AIzaSyBEdkvfqO3H-_rJjtl1_Tfm29A-ty6PPHg`.
   - Modifica l'endpoint delle chiamate fetch per richiamare direttamente le API di Google Gemini (es. `@google/genai` sdk o REST endpoint `generativelanguage.googleapis.com`).

2. **Rimozione Configurazioni OpenRouter:**
   - Pulisci il file `constants.ts` (e ovunque vengano usate) dalle vecchie costanti `OPENROUTER_API_KEY` e `OPENROUTER_MODEL`.
   - Rimuovi qualsiasi vecchia logica legata all'API Key inseribile dall'utente, o selettori di modello. Dobbiamo usare fissa e solo la suddetta chiave Gemini.

3. **Prompting e Payload:**
   - Modifica la struttura del payload inviato all'API per adeguarlo al formato richiesto da Gemini (invio `contents`, `parts`, ecc. invece di standard OpenAI format).
   - Accertati che il JSON del calcolo sia correttamente codificato e inviato a Gemini, e che la riposta sia parsata conformemente.
