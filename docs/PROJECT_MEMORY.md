# Memoria del progetto — The Warriors · Night Run

29 ottobre 2026 · aggiornata dopo la richiesta «ok da ora sviluppa tutto».

## Mandato dell'autore

- Giuseppe / b3pz vuole ricominciare il progetto cancellato perché non sembrava funzionare.
- Repo di destinazione: https://github.com/b3pz/The_Warriors.
- Beat ’em up con riferimento esplicito https://github.com/b3pz/Primal_sentinel_II: riprendere i sistemi validi, adattati a Warriors.
- Personaggi e location fedeli; l'autore dichiara di possedere la licenza.
- Grafica, musica e altri materiali dovranno essere effettivamente caricati nella repo durante la produzione.
- **Prima definire tutto: personaggi, location, struttura di ogni livello, quello che succede e quello che serve. Solo dopo costruire il gioco.** L'autore ha esplicitamente corretto l'anticipazione dell'assistente verso un prototipo immediato.
- «Memorizza tutto»: salvare decisioni e stato nella repo; non affidarsi soltanto alla continuità della chat.
- «Da ora sviluppa tutto» si applica alla progettazione appena concordata. Questa consegna completa la prima stesura dei blocchi; non dichiara autorizzata una nuova direzione che scavalchi il design.

## Base narrativa proposta dall'autore e mantenuta

P0 Coney Island (banda/partenza/tutorial Cleon); C1 raduno (Cyrus, omicidio, caos/fuga); C2 braccati (Turnbull e metro); C3 territorio nemico (Orphans e Mercy); C4 Furies (parco, mazze/disarmo); C5 banda divisa (gruppi separati); C6 Union Square (ricongiungimento/Punks nei bagni); C7 ultimo treno (stanchezza, dialoghi, alba); C8 Coney Island (Luther/Riffs/spiaggia/epilogo).

Questa scaletta sostituisce la prima bozza che aveva P0 al raduno. C5 sviluppato nella baseline con arresto Ajax, Lizzies e Swan/Mercy; raccordi e cronologia di dettaglio da verificare sul materiale autorizzato in produzione.

## Materiali ricevuti

Tre allegati osservati: de893e_Ji78XOeZR7qVOtHvm4h-Aw_image.png (Warrior non identificato, otto pose); ff5f23_u-HyQjCyQ2SlXXmuL7RWHw_image.png (Fury, otto pose); 65bc58_MCatdEcrTfWSAvto3TAplg_image.png (parco notturno con panchine e cestini dipinti).

Non identificare la prima tavola come Swan o Ajax senza confronto. Non dichiarare immagini già ritagliate/animate/caricate. Stile illustrato usato come candidato di lavoro fino al 29 ottobre 2026, poi superato (vedi sotto). Bordi, trasparenza, ancoraggi e separazione dei props richiedono verifica.

## Prima stesura completa sviluppata dall'assistente

Baseline 1.0: nove Warriors caratterizzati, otto NPC, 15 archetipi nemici, nove capitoli e 35 aree; combattimento e sistemi comuni; regia e 30 unità di dialogo; 22 pacchetti cinematici; inventario di 267 pacchetti con percorsi futuri; piano produttivo e QA.

Scelte di adattamento proposte, non approvazioni dell'autore: Storia 1–2 e Arcade fino a quattro; tutti e nove giocabili nelle finestre narrative; Mercy ruolo contestuale nei raccordi a due; nessun negozio/RPG/superpotere; un solo finale fedele; valori di mosse e risorse, durate e numero nemici.

Queste scelte sostituiscono ipotesi precedenti dell'assistente (Storia 1–4, Cleon/Fox solo narrativi). Restano modificabili, ma sono definite in modo da non bloccare ogni scheda in attesa di una domanda.

## Stato reale dopo la consegna

Solo documentazione e dati di design. Nessun motore trasferito, gioco eseguibile, musica o nuovo asset binario importato. Tre reference esterne con stato source; 264 pacchetti ancora missing, zero integrated/verified. I JSON in design/ non sono una build.

Analisi della reference: statica, commit 7817d4c2cf121dd43ded6d72532f47b3ed7a154f; non playtest. Il vecchio prototipo 0.2, singolo e senza save, non è il nuovo stato della repo.

## Continuità e prossima fase

Leggere GAME_DESIGN.md come indice e i documenti collegati per dettagli. Per cambi dell'autore aggiornare insieme LEVELS.md, campaign.json, asset_catalog.json e riepiloghi; mai tenere una seconda scaletta incompatibile nel README.

Il lavoro successivo alla progettazione è produzione e implementazione, partendo da scala/animazioni e nucleo Furies. Non promettere che il design statico garantisca la qualità: colpi, animazioni e ritmo richiedono verifiche vere. Non chiedere di nuovo decisioni già espresse; distinguere modifiche creative dell'autore da controlli tecnici ordinari.

## Decisione grafica (29 ottobre 2026, sera)

L'autore ha approvato come grafica giusta le tavole della Raccolta 04 (`assets/source/raccolta_04`): lo stile del gioco è la loro pixel art. Le tavole illustrate integrate nella prima prova C4 sono provvisorie e vanno sostituite. Le note del lotto sono state riscritte di conseguenza.

## Indicazioni dell'autore sul film (30 ottobre 2026, notte)

- Il gioco aveva un'aria diversa dal film: l'autore ha approvato tutte le correzioni proposte (notte desaturata, DJ alla radio, synth cupi e silenzi, meno arcade, transizioni a fumetto).
- Gli eventi in contemporanea vanno resi chiari: aggiunte le vignette «Intanto…» con lo stato dei gruppi nel capitolo 5.
- La scena del bagno dei Punks diventa un minigioco: pattinatore che controlla le porte, silenzio, spruzzo in faccia, poi tutti escono nella confusione (C6-02). Lo spruzzo è affidato a Rembrandt perché è il graffitaro del gruppo; da cambiare se l'autore indica un altro Warrior.
- Cast indicato dall'autore: Swan capo temporaneo, Cleon fondatore ucciso all'inizio, Ajax il più forte e impulsivo, Cochise grintoso, Cowboy con lo Stetson, Rembrandt graffitaro, Snow appassionato di musica, Vermin spalla comica, Fox lo scout ucciso nella fuga in metro. Riffs: Cyrus e Masai. Rogues: Luther. Turnbull: capo senza nome, bus verde. Orphans: Sully, provocato da Mercy. Furies: capo truccato sconfitto da Ajax e Swan. Lizzies: capo senza nome che attira Vermin, Cochise e Rembrandt.
- Sostituisce la prudenza della baseline sulla sorte di Cleon e Fox: ora le scene la dichiarano.
