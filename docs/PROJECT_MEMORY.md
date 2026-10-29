# Memoria del progetto — The Warriors · Night Run
Aggiornamento: 29 ottobre 2026. Riepilogo delle decisioni e dello stato della conversazione.

## Regola principale esplicita dell’autore
**Completare prima tutta la progettazione: personaggi, location e struttura di ogni livello, precisando quello che succede e quello che serve. Solo dopo iniziare a costruire il gioco.**
L’autore ha corretto la precedente proposta dell’assistente di passare subito alla prima rissa giocabile. Non riproporre il prototipo come passo immediato: il prossimo lavoro è il cast completo e poi il dettaglio dei capitoli.

## Identità e riferimento
- Autore: b3pz / Giuseppe.
- Repo di destinazione: https://github.com/b3pz/The_Warriors.
- Progetto ripartito da zero perché il precedente non sembrava funzionare.
- Beat ’em up: riferimento tecnico esplicitamente scelto dall’autore https://github.com/b3pz/Primal_sentinel_II.
- Riprendere i sistemi validi della reference, adattandoli al mondo di The Warriors.
- Personaggi e ambientazioni fedeli; l’autore dichiara di possedere la licenza.
- Musica, grafica e altri materiali dovranno essere effettivamente caricati nella repo, non soltanto descritti.
- Titolo di lavoro recuperato: The Warriors · Night Run.
- Il vecchio prototipo era singolo, prova 0.2, Swan/Ajax e Baseball Furies. Non confondere quel prototipo con lo stato della nuova repo.

## Scaletta più recente proposta dall’autore
Questa è la base corrente di discussione e sostituisce la diversa numerazione della prima bozza GAME_DESIGN.md. I dettagli restano da sviluppare; non considerarli tutti approvati.

| Capitolo | Parte della storia | Gameplay indicato dall’autore |
|---|---|---|
| Prologo — Coney Island | Presentazione della banda e partenza | Tutorial breve con Cleon e gli altri |
| 1 — Il raduno | Discorso di Cyrus, omicidio e caos | Fuga tra folla, gang e polizia |
| 2 — Braccati | I Warriors cercano di raggiungere la metro | Inseguimento dei Turnbull AC’s, ostacoli e corsa al treno |
| 3 — Territorio nemico | Incontro con gli Orphans e Mercy | Tensione nei dialoghi, rissa e fuga |
| 4 — Baseball Furies | Inseguimento notturno e scontro nel parco | Nemici con mazze, schivate e disarmo |
| 5 — La banda divisa | Percorsi separati verso il punto di ritrovo | Brevi sezioni con gruppi diversi |
| 6 — Union Square | Ricongiungimento e scontro con i Punks | Combattimento ravvicinato nei bagni della stazione |
| 7 — L’ultimo treno | Ritorno verso casa | Pausa narrativa: stanchezza, dialoghi e alba |
| 8 — Coney Island | Confronto con Luther e arrivo dei Riffs | Finale sulla spiaggia seguito dall’epilogo |

Proposte dell’assistente ancora da dettagliare con l’autore:
- Prologo con allenamento fra compagni per insegnare i comandi.
- Capitolo 5: sezioni alternate con trappola delle Lizzies, conseguenze della scelta/arresto di Ajax e percorso di Swan e Mercy. Rispettare la cronologia nel dettaglio.
- Gang, fughe e scene con obiettivi differenti; nessun boss obbligatorio a ogni capitolo.
- Finale di Luther narrativo e coerente, evitando di convertirlo automaticamente in un boss con enorme salute.
- Gestire i cambi di gruppo senza escludere partecipanti in cooperativa.
- Parco/Furies candidato al primo sviluppo tecnico soltanto dopo la progettazione completa.

## Materiali ricevuti e osservati
Tre immagini allegate, non ancora importate nella repo:
1. de893e_Ji78XOeZR7qVOtHvm4h-Aw_image.png — tavola di un Warrior con gilet marrone, capelli lunghi e jeans; otto pose. Identità del personaggio da confermare prima di assegnare un nome nel manifest.
2. ff5f23_u-HyQjCyQ2SlXXmuL7RWHw_image.png — tavola Baseball Fury con divisa da baseball, trucco giallo/nero e mazza; otto pose.
3. 65bc58_MCatdEcrTfWSAvto3TAplg_image.png — parco notturno sul lungofiume, lampioni, panchine, cestini e terreno bagnato.

Osservazioni tecniche preliminari: pose limitate, alcune vicine ai bordi, ritagli/trasparenza/ancoraggi ancora da verificare. Le panchine e i cestini dipinti nel fondale richiedono una scelta di integrazione per diventare interattivi.
Non dichiarare immagini già animate, ritagliate, caricate o verificate nel gioco. Non identificare automaticamente il Warrior come Swan o Ajax.
Lo stile illustrato è un candidato di riferimento; la sua approvazione definitiva non è stata esplicitata dall’autore.

## Stato verificato della repo prima di questo riepilogo
Solo README.md, docs/GAME_DESIGN.md e docs/ASSET_PLAN.md.
Nessun codice del motore, livello giocabile, sprite importato o musica caricata.
GAME_DESIGN.md è la prima bozza tecnica, basata sull’audit statico della reference al commit 7817d4c2cf121dd43ded6d72532f47b3ed7a154f. Presenza nel codice non equivale a verifica in esecuzione.
Cooperativa 1–4, online, durata, roster giocabile, salvataggi e comandi dettagliati presenti in quella bozza sono proposte dell’assistente, da distinguere dalle richieste esplicite dell’autore.
La scaletta iniziale di GAME_DESIGN.md non è stata ancora riscritta: usare la tabella corrente qui sopra per il prossimo aggiornamento.

## Lavoro di progettazione ancora necessario
1. Cast completo: nove Warriors (Cleon, Swan, Ajax, Snow, Cowboy, Cochise, Vermin, Rembrandt, Fox), personaggi narrativi, avversari. Definire ruolo, disponibilità, giocabilità, mosse, relazioni e uscite di scena.
2. Gang: archetipi, varianti, comportamento, armi, punti deboli ed eventuali capi.
3. Regole comuni: combattimento, armi, raccolte, salute/risorse, difficoltà, KO, compagni, coop e progressione.
4. Location: ambienti specifici, collegamenti, accessi, uscite, atmosfera, oggetti e superfici interattive.
5. Scheda completa per ciascuno dei nove capitoli:
   - situazione iniziale e obiettivo;
   - personaggi presenti e controllabili;
   - percorso area per area;
   - sequenza degli eventi e condizioni di attivazione;
   - gameplay, nemici, incontri, ostacoli e interazioni;
   - scene, dialoghi e conclusione;
   - vittoria/sconfitta, checkpoint e gestione cooperativa;
   - elenco esatto di sprite, animazioni, fondali, props, illustrazioni e audio.
6. Presentazione: stile, HUD, menu, cinematiche, musica, suoni e voci.
7. Inventario complessivo degli asset, distinguendo ricevuto, da creare, integrato e verificato.

## Criterio per considerare finita la progettazione
Ogni capitolo ha un percorso completo; ogni personaggio ha un ruolo e regole di disponibilità; ogni evento ha condizioni e conseguenze; ciascun capitolo elenca tutto il materiale necessario.
Le questioni aperte sono esplicite: non inventare un’approvazione dell’autore e non presentare proposte come funzionalità già implementate.
