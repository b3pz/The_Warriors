# Riprendere The Warriors · Night Run

Checkpoint aggiornato il 29 ottobre 2026 (notte), versione 0.5. Questo file serve a continuare da qualsiasi chat o assistente senza ricostruire le decisioni.

## Decisioni dell'autore

- Grafica approvata: la pixel art della Raccolta 04 (`assets/source/raccolta_04`). Il lotto **non è definitivo**: l'autore manderà circa 2.000 immagini da sostituire o aggiungere.
- Titolo e menu usano la copertina fornita dall'autore (`assets/menu/cover.jpg`).
- Sviluppare tutta la storia. Le transizioni video si fanno con gli sprite; l'autore potrà sostituirle con video fatti con altri strumenti, e se quelli fatti qui vengono bene restano.

## Stato verificato

- Progettazione baseline 1.0: invariata (docs/, design/campaign.json).
- **Campagna completa giocabile**: prologo e otto capitoli, tutte le 35 aree di LEVELS.md (`js/campaign.js`), dal ritrovo ai crediti. Tipi d'area: attraversamento con dialoghi, allenamento, arena a ondate, fuga a tempo con inseguitori, bus dei Turnbull come pericolo, trappola delle Lizzies (pannello e tiratrici), confronto finale ed epilogo.
- 15 archetipi nemici di CAST.md con comportamenti distinti: carica dei Turnbull, presa dei Punks, tiro a corsie delle Lizzies con linea di mira, bottiglie dei Rogues, inseguitori, élite con fasi (veterano Fury, capo Punks).
- Nove Warriors giocabili nelle finestre narrative; Cleon esce dopo C1, Fox dopo C3, Ajax dopo C4; selezione del Warrior a inizio capitolo e quando il personaggio esce. Mercy come PNG che segue, o secondo giocatore in C5-04 e C7-01.
- 31 scene con le battute di NARRATIVE.md: sottotitoli, scelta di risposta in C3-01, saltabili da Esc. Ogni scena può essere sostituita da un video: `docs/SCENE_E_VIDEO.md`.
- Menu: Continua, Nuova storia, Capitoli sbloccati, Come si gioca, Opzioni. Salvataggio `warriors-story-v1` (versione 2) all'inizio di ogni area, sblocchi `warriors-unlocks-v1`.
- Moduli: `config.js`, `input.js`, `sim.js`, `story.js` (PNG, scene, video), `campaign.js` (aree e scene), `areas.js` (esecuzione aree), `render.js`, `audio.js`, `main.js`; dati generati `atlas_px.js`, `backgrounds_px.js`; elenco video `videos.js`.

## Verifiche eseguite

- `node tools/qa.js`: Q01, Q02, Q05, Q06, Q09, Q18 e coordinatore, tutti PASS.
- `node tools/qa_campaign.js`: campagna intera dal prologo ai crediti con giocatori CPU, senza errori JS e senza blocchi (circa 15 minuti di gioco simulato; il bot va KO e riprova in alcune arene di C4).
- `node tools/qa_exits.js`: tutte le uscite delle aree senza combattimento, provate con tasti veri.
- Correzione segnalata dall'autore (29 ottobre): in C1-04 «Sali la scala» non si attivava perché la zona era troppo stretta; ora le uscite a interazione hanno una zona larga e anche le uscite a piedi si attivano con il tasto d'interazione.
- Correzioni emerse dai test: compagno di allenamento troppo lontano, Mercy che non raggiungeva la porta di C5-04, segnaposto dei tasti negli obiettivi.
- Non eseguito: playtest umano, bilanciamento, controller fisici, due tastiere, browser diversi da Chromium.

## Grafica nel gioco

- Personaggi da `personaggi_nemici_fondali_04.png` (26 set) e 12 fondali dai ritagli della Raccolta 04 e del pacchetto 02.
- L'associazione figura → personaggio in `tools/pixel_frames.json` è **provvisoria** (dedotta da abiti e capelli). Da confermare con l'autore.
- Ripieghi: vagone, bagno, appartamento e spiaggia usano fondali di altri ambienti; mancano pose di rialzata, presa, lancio e armi impugnate (la mazza dei Warriors è disegnata sopra lo sprite); Luther, Cyrus, Masai e il testimone usano figure generiche delle tavole.
- Procedura e formato consigliato per le immagini in arrivo: `docs/GRAFICA_IN_ARRIVO.md`.
- Le tavole illustrate della prima prova (de893e, ff5f23, parco illustrato) sono superate e restano in `assets/source` come storico; `js/atlas_data.js` non è più caricato.

## Prossime azioni

1. Ricevere il lotto grafico completo e integrarlo con `tools/build_pixel_sprites.py` e `tools/build_backgrounds.py`; confermare l'associazione figura → personaggio.
2. Video delle transizioni dove l'autore li prepara: basta aggiungerli a `js/videos.js`.
3. Playtest umano e bilanciamento; musica e voci reali al posto dei suoni sintetizzati.
4. Estensioni dopo la campagna: Arcade fino a quattro, online, touch.

## Regole di continuità

Salvare ogni lotto su GitHub e aggiornare questo checkpoint. Distinguere source, processed, integrated e verified. Non ricominciare la progettazione. Non spacciare ripieghi per asset finali.
