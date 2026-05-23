# Custom Email MCP Server (Provider-Agnostic)

Server MCP custom in TypeScript per interagire con provider email in modo agnostico.

## Obiettivi

- Esporre tool MCP stabili e indipendenti dal provider.
- Incapsulare la logica provider in adapter separati.
- Configurare il provider attivo via variabili ambiente.

## Architettura

- `src/index.ts`: entrypoint server MCP e registrazione tool.
- `src/types/email.ts`: contratti comuni (`EmailProvider`, DTO input/output).
- `src/providers/mockProvider.ts`: provider in-memory per sviluppo/test.
- `src/providers/stubs.ts`: placeholder per provider reali (`imap-smtp`, `gmail`, `outlook`).
- `src/providerFactory.ts`: selezione provider tramite `EMAIL_PROVIDER`.
- `src/config.ts`: parsing/validazione variabili ambiente.
- `tests/mockProvider.test.ts`: test base del provider mock.

## Tool MCP disponibili

- `email_list_messages`: elenco messaggi con filtri opzionali.
- `email_list_folders`: elenco cartelle con conteggi aggregati.
- `email_get_message`: dettaglio messaggio per id.
- `email_update_message`: aggiorna cartella o stato letto/non letto.
- `email_send`: invio messaggio email.

### Estensioni introdotte

- Supporto reale al filtro `folder` gia presente in `email_list_messages`.
- Nuovo filtro `unreadOnly` per leggere solo messaggi non letti.
- Metadati comuni `folder` e `isRead` sia nel summary sia nel dettaglio messaggio.
- Il provider `mock` usa `EMAIL_DEFAULT_FROM` come fallback per l'invio.

## Setup

1. Installa dipendenze:
   ```bash
   npm install
   ```
2. Copia il file ambiente:
   ```bash
   copy .env.example .env
   ```
3. Scegli provider in `.env`:
   - `EMAIL_PROVIDER=mock` (default pronto all'uso)
   - `EMAIL_PROVIDER=imap-smtp`
   - `EMAIL_PROVIDER=gmail`
   - `EMAIL_PROVIDER=outlook`

## Comandi

- Dev mode: `npm run dev`
- Build: `npm run build`
- Start build: `npm run start`
- Test: `npm run test`
- Type check: `npm run lint`

## Estensione provider reali

Per rendere operativo un provider reale:

1. Crea una classe in `src/providers/` che implementa `EmailProvider`.
2. Implementa `listMessages`, `listFolders`, `getMessage`, `updateMessage`, `sendEmail` con l'SDK API del provider.
3. Aggiorna `src/providerFactory.ts` per istanziare la nuova classe.
4. Aggiungi eventuali nuove variabili ambiente in `.env.example` e `src/config.ts`.

## Note

- Il provider `mock` e pensato per sviluppo rapido e integrazione MCP immediata.
- I provider reali sono predisposti come stub per mantenere il design agnostico.
