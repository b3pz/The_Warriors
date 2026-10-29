# The Warriors · Night Run — progetto completo

Baseline di progettazione 1.0 · 29 ottobre 2026

**Fase attuale: progettazione completa di prima stesura, non gioco implementato.** L'autore ha richiesto di definire personaggi, location e struttura di ogni livello prima di costruire. Questa baseline sviluppa tutti questi blocchi e sostituisce la bozza 0.1, compresa la sua vecchia numerazione dei capitoli.

## Mandato e scelte

Beat ’em up 2D a scorrimento e profondità, con personaggi/ambientazioni fedeli a The Warriors, dal ritrovo a Coney Island al ritorno all'alba. L'autore dichiara di possedere la licenza. Reference tecnica indicata: [Primal Sentinels II](https://github.com/b3pz/Primal_sentinel_II). Grafica, musica e audio devono diventare asset reali della repo nella fase produttiva.

Confermati dall'autore: genere, reference, fedeltà, repository di destinazione, progettazione prima dell'implementazione; prologo e otto capitoli come base proposta dall'autore. Le soluzioni dettagliate, i numeri, le battute e le modalità qui sotto sono **proposte sviluppate dall'assistente**, non approvazioni attribuite all'autore.

La prima stesura prende decisioni pratiche in tutti i blocchi: non lascia il design in attesa di una domanda per ogni oggetto. Bilanciamento, montaggio visivo e materiali effettivi richiedono comunque verifica produttiva. Non esiste un'approvazione implicita di un asset soltanto perché è elencato.

## Documenti da leggere

| Documento | Contenuto |
|---|---|
| [CAST.md](CAST.md) | Nove Warriors, disponibilità, mosse distintive, Mercy/personaggi narrativi, 15 archetipi nemici |
| [COMBAT_AND_SYSTEMS.md](COMBAT_AND_SYSTEMS.md) | Input, attacchi, prese, armi, nemici, compagni, KO, difficoltà, save, modalità e UI |
| [LEVELS.md](LEVELS.md) | Tutti i nove capitoli, 35 aree, eventi, nemici, obiettivi, risorse e checkpoint |
| [NARRATIVE.md](NARRATIVE.md) | Regia e prima sceneggiatura italiana originale per tutti i capitoli |
| [ART_AND_AUDIO.md](ART_AND_AUDIO.md) | Stile, pacchetti animazione, ambienti, props, musica, voci e interfaccia |
| [ASSET_PLAN.md](ASSET_PLAN.md) | Inventario di produzione, conteggi e distinzione materiali ricevuti/mancanti |
| [PRODUCTION_AND_QA.md](PRODUCTION_AND_QA.md) | Adattamento della reference, architettura, dipendenze, piano e verifiche |
| [PROJECT_MEMORY.md](PROJECT_MEMORY.md) | Decisioni dell'autore, provenienza e stato reale |
| [campaign.json](../design/campaign.json) | Dati di progettazione delle 35 aree e transizioni; non motore del gioco |
| [asset_catalog.json](../design/asset_catalog.json) | Pacchetti asset pianificati, percorsi futuri e stato di disponibilità |

## Campagna corrente

| ID | Capitolo | Funzione | Durata indicativa |
|---|---|---|---|
| P0 | Coney Island | Presentazione e tutorial con Cleon | 5–7 min |
| C1 | Il raduno | Cyrus, accusa e fuga dal caos | 7–9 min |
| C2 | Braccati | Turnbull AC’s e corsa al treno | 8–10 min |
| C3 | Territorio nemico | Orphans, Mercy e separazione della polizia | 9–11 min |
| C4 | Baseball Furies | Caccia e scontro nel parco | 10–12 min |
| C5 | La banda divisa | Ajax, Lizzies e Swan/Mercy | 10–13 min |
| C6 | Union Square | Ricongiungimento e Punks nei bagni | 9–11 min |
| C7 | L'ultimo treno | Silenzio, dialoghi e alba | 4–6 min |
| C8 | Coney Island | Rogues, Luther, Riffs ed epilogo | 7–9 min |

69–88 minuti di budget narrativo/ludico, non durata misurata. Le fughe non richiedono di eliminare tutta la gang, il treno non contiene un boss aggiunto, il finale non diventa un duello a colpi di barra salute contro Luther.

## Decisioni strutturali di questa baseline

- Storia 1–2 giocatori, gruppi coerenti con i capitoli; Arcade fino a quattro come modalità distinta. Questa scelta restringe la proposta precedente di Storia 1–4 per risolvere le sezioni con pochi protagonisti.
- Tutti e nove Warriors hanno un pacchetto giocabile, con limiti di disponibilità nella Storia. Cleon nel prologo, Fox fino a C3, Ajax fino a C4. Nessuno viene escluso dalla sessione quando il suo personaggio esce di scena.
- Mercy mantiene un ruolo narrativo e di attraversamento, anche per il secondo giocatore in C5C/C7. Nessuna barra salute da scorta o moveset inventato da combattente.
- Combattimento fisico: leggeri, pesanti, prese, lanci, salto, schivata, armi improvvisate e furia locale; niente superpoteri, titani o pistola del protagonista.
- Niente negozio, monete, progressione RPG, mondo aperto o trama a bivi in questa campagna. Un finale fedele, poi extra sbloccabili.
- Scene, pause e risse hanno contratti di ingresso/uscita espliciti; il montaggio delle uscite di Cleon, Fox e Ajax non dipende dai KO ludici.

## Audit della reference e limiti

Commit letto: 7817d4c2cf121dd43ded6d72532f47b3ed7a154f. Analisi statica, non playtest.

| Sistema presente | File della reference | Destinazione |
|---|---|---|
| Input, audio, canvas e sprite con pivot piedi | js/core.js, js/atlas.js | Input astratto, mixer e renderer con nuovi atlas |
| Simulazione, mosse, prese, armi, KO e eventi impatto | js/sim.js | Estrarre le routine utili; sostituire dati e dipendenze |
| Zone, camera, ondate e personaggi | js/data.js, js/sim.js | Dati di campagna separati da eventi del film |
| Menu, flusso e selezione | js/main.js | Stato del gruppo/slot Warriors |
| Save capitolo/zona e valutazioni | js/save.js | Schema nuovo warriors-* |
| Controlli CPU e recupero blocchi | js/cpu.js | Compagno opzionale e diagnosi |
| Host autorevole e input remoti | js/net.js | Rete successiva, versione nuova e test su reti differenti |
| Musica sintetizzata/file | js/music.js, js/core.js | Mixer da adattare, cue e master Warriors nuovi |

Non copiare l'intero progetto: sim.js dipende da stepExtra, stepII, stepTeam, stepMech e dati globali. Prima estrarre confini e dipendenze. Rimuovere trasformazioni, titani, droni, pistole dei protagonisti, negozio e bonus del vecchio mondo.

## Cosa significa completato

**Design:** cast, regole, 35 percorsi, condizioni eventi, conseguenze e fabbisogno asset scritti; controlli incrociati sui dati eseguiti. Questa consegna è il primo progetto completo e rivedibile.

**Produzione:** ancora da fare. Occorrono codebase, file artistici/audio effettivi, integrazione e verifica giocabile. Nessun documento o JSON equivale a un gioco finito. Gli asset ricevuti restano sorgenti esterni, non animazioni pronte.
