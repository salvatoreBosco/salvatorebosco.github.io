# Salvatore Bosco — Portfolio

Portfolio/CV bilingue (EN/IT), React + TypeScript + Vite, senza backend. Dark/light theme, griglia Bento, filtri, case study, command palette (Ctrl/Cmd+K), terminale con comandi simulati, PDF e supporto reduced motion. Nessun tracking. I diagrammi sono illustrazioni CSS, non screenshot reali.

## Avvio locale

Node.js 22 consigliato.

```sh
npm install
npm run dev
npm run build
npm run preview
```

Il primo `npm install` genera `package-lock.json`: committarlo e sostituire `npm install --no-audit --no-fund` nel workflow con `npm ci` dopo aver verificato la build.

## GitHub Pages

1. Crea un repository pubblico `salvatorebosco.github.io` (o usa quello esistente solo dopo aver controllato i file).
2. Carica il contenuto della directory, incluso `.github/workflows/pages.yml`.
3. In Settings → Pages → Build and deployment → Source scegli GitHub Actions.
4. Push su `main` e controlla la pipeline Actions; dopo il deploy apri `https://salvatorebosco.github.io/`.

## Aggiornamento contenuti

- `src/data.ts`: testi bilingui, case study, competenze.
- `src/main.tsx`: struttura, interazioni e contatti.
- `src/styles.css`: design system, responsive e animazioni.
- `public/cv`: copie dei CV v3 2026 con numero di telefono rimosso mediante redazione PDF. Contengono ancora email e foto: verificare prima di pubblicare.

Prima di pubblicare: verificare i testi dei case study professionali con l'azienda; confermare il link LinkedIn, le informazioni personali, eventuali link diretti ai repository personali e l'autorizzazione alla pubblicazione dei CV. Non sono inclusi codice, screenshot, nomi di clienti o dati riservati aziendali. I risultati Lighthouse e WCAG non sono dichiarati: misurarli dopo la build effettiva. La palette, il design delle illustrazioni e i testi derivano dal brief; non attribuire il codice a un lavoro esclusivamente manuale se è stato sviluppato con assistenza AI.

## Checklist di verifica prima del deploy

- `npm run build`: TypeScript e Vite senza errori.
- `npm run preview`: verificare i 7 progetti, filtri combinati, apertura/chiusura case study, Ctrl/Cmd+K, ricerca e Invio, Escape, terminale (`help`, `skills`, `clear`), entrambe le lingue, entrambi i temi, download PDF e link social.
- Verificare layout a 320, 390, 768 e 1440 px, tabulazione, focus e reduced motion; eseguire Lighthouse.
- Verificare il deploy reale con refresh e download CV.

Stato di consegna: analisi sintattica TypeScript senza diagnostiche; installazione npm, type-check completo, build Vite e test browser non eseguiti a causa dell'indisponibilità del registro npm nell'ambiente di creazione.
