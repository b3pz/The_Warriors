# Riprendere The Warriors · Night Run

Checkpoint aggiornato il 29 ottobre 2026 (notte), versione 0.5. Questo file serve a continuare da qualsiasi chat o assistente senza ricostruire le decisioni.

## Decisioni dell'autore

- **Fedeltà al film al 100%** (30 ottobre 2026): quando le note dell'autore e il film non coincidono, vale il film. Verificare sempre sulla trama (Wikipedia e fonti sulle location) prima di scrivere una scena.

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
- `node tools/qa_campaign.js`: campagna intera dal prologo ai crediti con giocatori CPU, senza errori JS e senza blocchi (circa 15 minuti di gioco simulato, nessun KO dopo il recupero di salute tra le aree).
- `node tools/qa_exits.js`: tutte le uscite delle aree senza combattimento, provate con tasti veri.
- Correzione segnalata dall'autore (29 ottobre): in C1-04 «Sali la scala» non si attivava perché la zona era troppo stretta; ora le uscite a interazione hanno una zona larga e anche le uscite a piedi si attivano con il tasto d'interazione.
- Correzioni emerse dai test: compagno di allenamento troppo lontano, Mercy che non raggiungeva la porta di C5-04, segnaposto dei tasti negli obiettivi.
- Non eseguito: playtest umano, bilanciamento, controller fisici, due tastiere, browser diversi da Chromium.

## Aggiornamento 30 ottobre (notte)

- Atmosfera da film approvata dall'autore: correzione colore notturna, grana, DJ alla radio che racconta tutta la notte, synth cupi e silenzi, niente punteggio a schermo, risse brevi, transizioni a fumetto, vignette «Intanto…» con lo stato dei gruppi divisi.
- Minigioco del bagno dei Punks in C6-02 (`tools/qa_stealth.js`).
- Cronologia e cast del film forniti dall'autore integrati nelle scene (vedi `docs/PROJECT_MEMORY.md`).
- Sprite: filtro automatico contro pose di altri personaggi e figure doppie; associazioni corrette sulle descrizioni dell'autore; Ajax, Vermin e Cleon senza figura adatta.
- Prossimo passo concordato: i fondali definitivi e le ~2.000 immagini in arrivo («quando tutti gli sfondi sono fatti per bene c'è più pathos»).

## Aggiornamento 30 ottobre (notte, seconda parte)

- Fondali disegnati a codice in scala (`js/scenery.js`), allineati al piano calpestabile, con luce per ora del giorno; i ritagli delle tavole restano selezionabili in Opzioni. Provvisori fino alle scene vere.
- Ostacoli nei corridoi (transenne, tornelli, siepi da saltare, casse da sfondare, fuoco, treni con avviso) in 13 aree di attraversamento e fuga.
- Comandi rimappabili (Opzioni → Comandi, `warriors-keys-v1`). Compagni liberi, non più in fila.
- Game over: tentativi per capitolo (Facile 5, Normale 3, Difficile 2), poi si ricomincia dall'inizio del capitolo; il salvataggio torna all'inizio del capitolo.
- Mobile: joystick mobile (centro dove appoggi il pollice), tre tasti fissi COLPO (tenuto = forte), SALTO, SCHIVA; AZIONE (con il nome: PARLA, PRENDI, PRESA, AIUTA…), FURIA e LANCIA compaiono solo quando servono; pausa, menu con il joystick, richiesta di ruotare il telefono (`tools/qa_mobile.js`).
- Film: Rembrandt bloccato a terra dal Punk spruzza la vernice; Ajax senza gilet contro le mazze e la mazza strappata al capo dei Furies; radio delle Lizzies da spaccare (chi lo fa nel film è da confermare: l'autore ha indicato Snow, che però non è nel gruppo delle Lizzies).
- Duello: come nel film, Luther spara, Swan schiva e poi lancia il coltello. Rembrandt, se lo giochi e un Punk ti blocca, si libera con la bomboletta (tasto d'interazione).
- Elenco completo di sprite e fondali mancanti con le misure: `docs/SPRITE_MANCANTI.md`.

## Aggiornamento 30 ottobre (musiche)

- Pronto per le tracce originali: `js/musiche.js` (elenco) e `js/music.js` (lettore con dissolvenza). Chiavi per scena, area, situazione, capitolo e schermata; senza tracce resta il synth. Guida e tabella dei momenti: `docs/MUSICHE.md`. File in `assets/music/`.
- Il file unico include le tracce solo con `python3 tools/build_single.py --musica`.
- Favicon pixel art in tutti i formati (svg, png 16/32, ico, apple-touch 180) e `manifest.webmanifest` per aggiungere il gioco alla schermata del telefono.
- Bilanciamento: la salute non si ricaricava mai tra un'area e l'altra, così si arrivava ai Furies (C4) quasi a zero e si finiva in game over a ripetizione. Ora a inizio capitolo la salute è piena e tra un'area e l'altra risale almeno al 75 / 55 / 40 % (Facile / Normale / Difficile).
- Test della campagna: il bot guida solo il giocatore 1 come umano; `START=C4-01` e `STOP=C5-01` fanno partire o fermare il giro da un'area.

## Aggiornamento 30 ottobre (mattina)

- Transizioni a fumetto rifatte: a ogni nuovo capitolo una tavola di tre vignette (l'ultimo istante inchiostrato, la mappa delle bande fornita dall'autore `assets/menu/mappa_bande.jpg` che scorre dalla tappa precedente alla nuova con il percorso in rosso, il luogo successivo disegnato con il gruppo in posa e il titolo del capitolo); tra un'area e l'altra due vignette; per i gruppi divisi la vignetta del luogo e la tavola «Intanto…». L'ultimo istante si cattura senza HUD.
- Modalità Arcade (menu → «Arcade · risse fino a 4»): le sei risse della storia sbloccate, da 1 a 4 giocatori (tastiera WASD, tastiera frecce, controller 1–4, CPU), una rissa o tutte di fila, senza scene, nemici in più per 3 e 4 giocatori. Colori e segni per G3 (cerchio verde) e G4 (rombo viola), HUD a quattro. Configurazione salvata in `warriors-arcade-v1`. Test: `node tools/qa_arcade.js`.
- Soccorso a tre o quattro: il compagno soccorre chi è a terra più vicino.
- Revisione dei dialoghi approvata dall'autore e applicata (Docs «The Warriors · Night Run — Revisione dei dialoghi»): Orphans e gilet, Cyrus «Ci state?», Lizzies riordinate, Swan davanti al mare, doppioni tolti.
- Immagini fatte da un'AI: `IMMAGINI_PER_AI.md` (392 file in ordine di priorità, solo in `assets/incoming/`).
- `W.QA_NODRAW = true` salta il disegno nei test (il canvas senza GPU costa ~40 ms a fotogramma).

## Integrazione automatica delle immagini (30 ottobre)

- Un'AI legge `IMMAGINI_PER_AI.md`, genera le immagini e le carica in `assets/incoming/` con i nomi dell'elenco.
- A ogni caricamento l'azione `.github/workflows/integra_immagini.yml` lancia `tools/import_incoming.py`: toglie il magenta, ritaglia, scala ogni set sulla sua `idle_1`, allinea i piedi, affianca i pezzi dei fondali (pavimento al 65% → riga del pavimento dell'area) e scrive `assets/sprites_ai/`, `assets/backgrounds_ai/`, `assets/scenes_ai/`, `js/atlas_ai.js`, `js/art_ai.js` e `assets/incoming/RAPPORTO.md`.
- Il gioco usa da solo i set nuovi (sostituiscono interi quelli della Raccolta 04), i fondali nuovi area per area e le illustrazioni delle scene come sfondo della scena. Pose nuove già riconosciute: run, getup, grab, throw, dodge, jumpkick, bat_walk, bat_swing, pipe_swing, revive, pinned_spray, skate, charge, gun_aim, gun_shoot, bottle_throw, baton_swing, swing, windup.
- Niente approvazioni obbligatorie: l'autore scrive in `assets/incoming/modelli/RIFARE.md` ciò che va rifatto.

## Correzioni sul film (30 ottobre, pomeriggio)

- C1-04 è il cimitero di Woodlawn; raduno a Van Cortlandt Park; Fox testimone; taglia di Masai; Orphans esclusi dal raduno; Swan torna alla 96ª e trova Mercy (poliziotto, tunnel); Rembrandt ferito dalle Lizzies e medicato; Mercy combatte con i Punks; la frase di Swan all'arrivo a Stillwell Avenue.
- Niente risse che il film non ha: C2-02 «La strada del bus» (fuga dal bus, nessun Turnbull a piedi neanche in C2-03), C3-02 «Tra le fiamme» (bottiglia di Snow, auto in fiamme, fuga), C8-02 «Sotto il molo» (si raccolgono le armi, il carro dei Rogues li segue). Le tre risse tolte restano solo nell'Arcade come «Extra» (`W.ARCADE_EXTRA`).
- Duello: Luther punta la pistola, il coltello di Swan gli si pianta nel polso, il colpo parte a vuoto (versione di due fonti su tre).
- C2-04 «Stazione sopraelevata del Bronx» (Gun Hill Road non è confermato dalle fonti).
- L'uscita di un'area non aspetta più i compagni CPU rimasti indietro (2,5 s con i giocatori nella zona).

## Grafica nel gioco

- Personaggi da `personaggi_nemici_fondali_04.png` (26 set) e 12 fondali dai ritagli della Raccolta 04 e del pacchetto 02.
- L'associazione figura → personaggio in `tools/pixel_frames.json` è **provvisoria** (dedotta da abiti e capelli). Da confermare con l'autore.
- Ripieghi: vagone, bagno, appartamento e spiaggia usano fondali di altri ambienti; mancano pose di rialzata, presa, lancio e armi impugnate (la mazza dei Warriors è disegnata sopra lo sprite); Luther, Cyrus, Masai e il testimone usano figure generiche delle tavole.
- Procedura e formato consigliato per le immagini in arrivo: `docs/GRAFICA_IN_ARRIVO.md`.
- Le tavole illustrate della prima prova (de893e, ff5f23, parco illustrato) sono superate e restano in `assets/source` come storico; `js/atlas_data.js` non è più caricato.

## Prossime azioni

1. Ricevere il lotto grafico completo e integrarlo con `tools/build_pixel_sprites.py` e `tools/build_backgrounds.py`; confermare l'associazione figura → personaggio.
2. Video delle transizioni dove l'autore li prepara: basta aggiungerli a `js/videos.js`.
3. Playtest umano e bilanciamento; tracce originali in `assets/music/` (vedi `docs/MUSICHE.md`) e voci reali.
4. Applicare i dialoghi approvati dall'autore; estensioni: online.

## Regole di continuità

Salvare ogni lotto su GitHub e aggiornare questo checkpoint. Distinguere source, processed, integrated e verified. Non ricominciare la progettazione. Non spacciare ripieghi per asset finali.

## Video e sfondi animati (30 ottobre)

- 18 inserti video previsti, prompt in `VIDEO_PER_AI.md`; supporto nel gioco (`['clip', id]`, `W.ClipPlayer`, DJ in ciclo), importazione automatica da `assets/incoming/video/`. Dettagli in `docs/SCENE_E_VIDEO.md`.
- Discorso di Cyrus rifatto fedele al film: niente polizia tra la folla, volanti ai bordi del parco durante il discorso (`lights`), 60.000 contro 20.000, «Can you dig it?».
- Ajax: la poliziotta in borghese lo ammanetta alla panchina (come nel film).
- Dettagli animati sopra qualunque fondale (`drawAmbient`, `drawAmbientOver` in render.js): vapore dai tombini, nebbia nei parchi, neon, tubi al neon che sfarfallano, luce del treno in metro, fumo dalle Lizzies, gabbiani all'alba, lampeggianti quando c'è la polizia in campo.

## W di Rembrandt, Extra, suoni registrati, controller (31 ottobre)

- Collezionabili: `W.TAG_SPOTS` in campaign.js (11 muri + cimitero automatico = 12), salvati in localStorage `warriors_tags` (`W.Tags`). Interazione in areas.js (`tagSpot`, `sprayTag`), disegno in render.js (`drawWallTag`: muretto nel parco, pilone sotto il molo). Menu Extra: elenco, galleria (con 6 W), Mercy giocabile nell'Arcade (con 12 W; `W.MERCY_FIGHTER`, pose sostitutive `POSE_ALIAS` finché non arrivano le pose 504–509).
- Suoni registrati: `assets/incoming/suoni/` (nomi per evento o file del pacchetto Kenney «Impact Sounds», CC0) → `assets/sfx/` + `js/suoni_auto.js`; audio.js li usa al posto dei sintetizzati, con varianti casuali.
- Controller: `W.Pad` in input.js normalizza tutto sulla disposizione standard; profilo PlayStation Classic (mini PSX: tasti in altro ordine, croce sugli assi) e ripiego generico; il gioco usa l'n-esimo controller collegato, qualunque indice gli dia il browser.

## Cinema e demo (31 ottobre)

- `js/autopilot.js` (`W.AutoPilot`): la CPU guida il giocatore 1 con la stessa logica del test della campagna; dialoghi al ritmo di lettura; nessuno resta a terra.
- Menu «Cinema · guarda tutta la storia»: tutta la campagna fino ai titoli (circa 15 minuti), niente salvataggi, sblocchi, W o punteggi (`writeSave`, `unlock`, `W.Tags.add` non fanno niente col pilota attivo). Esc → pausa → Menu principale per uscire.
- Demo: 25 s fermi su titolo o menu → un'arena o una fuga a caso, al massimo 45 s; un tasto, un tocco o il controller la chiude.

## Rifiniture del 31 ottobre (sera)

- Compagni al seguito in formazione (story.js): posto fisso per fila e corsia, zona morta, separazione morbida da compagni e giocatori. Niente più mucchio e passetti avanti e indietro.
- Corsa: se un Warrior ha solo `run_1`/`run_2`, il ciclo usa 4 tempi con i passi intermedi della camminata e un piccolo rimbalzo; chiesti `run_3`/`run_4` a ChatGPT (510–527).
- Presentazione delle bande (`W.GANGS` in areas.js, `drawGangIntro` in render.js): alla prima apparizione di Turnbull, Orphans, Furies, Lizzies, Punks e Rogues il gioco si ferma su di loro con nome, territorio e logo (`oggetti/logo_<banda>.png`, punti 528–533). Invio la chiude; nella demo resta.
- Telecamera: con due giocatori troppo distanti resta al centro fra i due (prima rincorreva l'uno e l'altro e tremava).
- Set vecchi mappati sulle figure nuove (`SET_ALIAS` in render.js); Fury disarmato: pose `nobat_*` chieste a ChatGPT (534–538).
