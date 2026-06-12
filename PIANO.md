# Piano d'Azione — "Adriana e i Cuoricini" 💗

Gioco mobile 2D platformer (stile Super Mario Bros). Adriana lancia cuoricini contro bambini arrabbiati per trasformarli in bambini buoni. Nessuna registrazione: entra e gioca.

## Stack tecnologico

- **Nuxt 4** (SPA, `ssr: false`) — shell dell'app, menu, routing
- **Phaser 3** — motore di gioco 2D (fisica arcade, sprite, animazioni)
- **Capacitor 6** — build nativa iOS/Android dalla web app

## Regole di gioco

- **3 livelli**, sempre più lunghi e affollati
- Adriana ha **3 stelline** per partita (si conservano tra i livelli)
- Colpita da un nemico o dalla **cacca** che lanciano (una al secondo) → **perde 1 stellina**
- 0 stelline → **Game Over** → si ricomincia tutto da capo (livello 1)
- Cuoricino colpisce un bambino arrabbiato → diventa **bambino buono** (non più ostile)
- Livello completato **entrando nella casetta** alla fine, che spara **fuochi d'artificio** 🎆
- I bambini buoni diventano **ostacoli solidi**: bloccano i cuoricini e vanno superati con un salto
- Dopo il 3° livello: **Boss finale** — la **Cacca Gigante** 💩 che salta e lancia raffiche di cacche; servono **100 cuoricini** per abbatterla

## Fasi e milestone

### Fase 1 — Setup progetto ✅ (questa sessione)
Scaffold Nuxt 4 + Phaser + Capacitor, struttura cartelle, pagine base (menu, gioco), composable per lo stato (stelline, punteggio).

**Milestone:** `npm install && npm run dev` mostra menu e canvas di gioco.

### Fase 2 — Core gameplay (1-2 settimane)
Movimento di Adriana (corsa, salto, controlli touch), fisica e collisioni, lancio cuoricini, nemici con pattern di movimento, trasformazione arrabbiato → buono, sistema stelline e Game Over.

**Milestone:** un livello giocabile da inizio a fine su browser.

### Fase 3 — Contenuti e level design (1 settimana)
Tilemap del livello (piattaforme, ostacoli), 2-3 tipi di nemici, asset grafici definitivi (sprite Adriana, bambini, cuoricini, stelline), HUD (stelline, contatore bambini convertiti).

**Milestone:** livello completo con grafica e HUD.

### Fase 4 — Polish (3-5 giorni)
Suoni ed effetti (lancio, conversione, colpo subito), animazioni, schermate Game Over / Vittoria, parallax background, juice (particelle cuoricini).

**Milestone:** esperienza fluida e piacevole su mobile browser.

### Fase 5 — Build mobile con Capacitor (3-5 giorni)
`npx cap add android/ios`, configurazione orientamento landscape, fullscreen, safe area, test su dispositivi reali, ottimizzazione touch.

**Milestone:** APK/IPA installabile e giocabile.

### Fase 6 — Release (opzionale)
Icone, splash screen, store listing, pubblicazione su Play Store / App Store.

## Struttura progetto

```
Adri/
├── PIANO.md
├── package.json
├── nuxt.config.ts
├── capacitor.config.ts
├── app/
│   ├── app.vue
│   ├── pages/
│   │   ├── index.vue        # menu principale
│   │   └── game.vue         # pagina di gioco
│   └── components/
│       └── GameCanvas.client.vue   # mount Phaser (solo client)
├── game/
│   ├── config.ts            # configurazione Phaser
│   ├── state.ts             # stato condiviso (stelline, score)
│   └── scenes/
│       ├── BootScene.ts     # caricamento asset
│       ├── GameScene.ts     # gameplay principale
│       └── GameOverScene.ts # game over + restart
└── public/
    └── assets/              # sprite, audio, tilemap
```

## Comandi

```bash
npm install          # installa dipendenze
npm run dev          # sviluppo su browser
npm run generate     # build statica per Capacitor
npx cap add android  # aggiunge piattaforma Android (Fase 5)
npx cap sync         # sincronizza build con nativo
```
