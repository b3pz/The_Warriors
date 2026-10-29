# THE WARRIORS · NIGHT RUN — Logica di gioco
Versione 0.1 · 29 ottobre 2026 · Specifica iniziale di progetto, non build giocabile.

## Mandato
Beat ’em up a scorrimento con profondità del piano di combattimento, ispirato alla struttura tecnica di Primal Sentinels II. Campagna dal raduno di Cyrus al ritorno a Coney Island, ambientazioni e personaggi fedeli al film. Il committente dichiara di possedere la licenza. Grafica, musica, dialoghi e suoni devono essere integrati come asset effettivi nel repository, con stato di consegna verificabile.

Le scelte di bilanciamento, durata, roster e modalità sotto sono proposte di progetto modificabili. Gli episodi narrativi forniti dall’autore sono la base della campagna; luoghi puntuali, aspetto, dialoghi e cronologia di dettaglio vanno confrontati con i materiali di riferimento prima di produrre asset definitivi.

## 1. Esperienza
- Una notte di ritorno a casa: avanzare, sopravvivere insieme, raggiungere la metro.
- Combattimento fisico leggibile: peso dei colpi, diverse distanze, prese, armi improvvisate, ambiente.
- Percorsi prevalentemente lineari con piccole deviazioni per risorse; niente mondo aperto necessario.
- Alternanza fra rissa, inseguimento, tensione e brevi scene narrative.
- Obiettivo indicativo prima partita: 60–90 minuti, da misurare con playtest.
- Desktop browser Mac/Windows, tastiera e controller come prima verifica. Touch previsto dopo la solidità del combattimento.

## 2. Cosa riprendere da Primal Sentinels II
Audit statico del commit 7817d4c2cf121dd43ded6d72532f47b3ed7a154f. La presenza nel sorgente non certifica la qualità in esecuzione.

| Sistema osservato | Sorgente | Adattamento Warriors |
|---|---|---|
| Simulazione distinta dalla vista serializzabile | js/sim.js, js/net.js | Conservare separazione input / simulazione / presentazione |
| Combo a fasi, attacchi aerei, corsa, prese e armi | js/sim.js: MOVES, stepPlayer | Riutilizzare principi e routine isolate, ribilanciare portate e tempi |
| Hitstop, eventi sonori, impatti, rallentamento | js/sim.js | Impatto breve e regolabile, senza effetti soprannaturali |
| Piano x/y e quota di salto z; oggetti solidi e piattaforme | js/sim.js: groundAt, tryMove | Piedi e ombre sul piano; salti separati dalla profondità |
| Zone, ondate, camera e checkpoint | js/sim.js, js/data.js | Incontri configurati per capitolo, uscite e fughe esplicite |
| KO e aiuto del compagno | js/sim.js: goDown, canBeRevived | Recupero cooperativo con interazione dedicata |
| Salvataggio capitolo/zona e valutazioni | js/save.js | Formato e chiavi nuovi; stato narrativo e roster persistenti |
| Input astratto e rimappatura; audio separato | js/core.js | Azioni Warriors, controller, menu accessibili da tastiera |
| Atlas con ancoraggio ai piedi | js/core.js, js/atlas.js | Nuovi atlas e animazioni, controlli contro tagli e slittamenti |
| Cooperativa locale e rete host autorevole | js/main.js, js/net.js | Stessa architettura candidata, protocollo e servizi da verificare |
| CPU con tentativi di sblocco | js/cpu.js | Base da adattare per compagno e test, non IA pronta |
| Musica da file con alternativa sintetizzata | js/core.js, js/music.js | Nuova scaletta, niente temi di Primal nel prodotto finale |

Non trasferire trasformazioni, titani, droni, proiettili dei protagonisti, magia, doppio salto, negozio e progressione delle armature. Il capitolo “senza armatura” è un riferimento utile per la fisicità, ma contiene dipendenze dagli altri sistemi: non basta copiarlo.

## 3. Regole del combattimento
### Spazio e colpi
Coordinate logiche: x avanzamento, y profondità, z altezza del salto. Ordinamento grafico per piedi sul terreno, non per testa. Un attacco colpisce soltanto nella propria finestra attiva, nella direzione e profondità consentite, una sola volta per bersaglio per swing salvo mosse dichiarate multicolpo.
Ogni mossa definisce preparazione, finestra attiva, recupero, danno, portata, tolleranza di profondità, spinta e costo. Le immagini non decidono da sole le collisioni.

### Azioni
- Attacco leggero: catena di tre colpi, finale con respinta; occorre colpire per mantenere il ritmo.
- Attacco pesante: calcio o colpo impegnativo, più lento e vulnerabile se va a vuoto.
- Salto e calcio volante; nessuna correzione illimitata in aria.
- Corsa con doppio tocco; attacco in corsa con recupero visibile.
- Schivata breve con finestra difensiva limitata e recupero, non ripetibile senza pausa.
- Presa tramite interazione vicino a un avversario vulnerabile: colpi corti, lancio direzionale o rilascio. Non automatica mentre si cammina.
- Interazione: raccogliere arma, aprire uscita, aiutare compagno. Un indicatore mostra l’azione disponibile.
- Furia: barra guadagnata combattendo; breve sequenza fisica specifica del personaggio. Nessuna invincibilità o danno globale automatico.
- L’arma raccolta sostituisce gli attacchi; non elimina salto e schivata. Lanciando o perdendo l’arma si torna a mani nude.

### Priorità dell’interazione
Compagno a terra → uscita attiva se il gruppo è pronto → arma → oggetto ambientale → presa del nemico vulnerabile.
Selezione per distanza e direzione con prompt stabile. Nessuna raccolta involontaria al posto del colpo. Nessuna uscita attivata mentre resta un compagno in soccorso.

### Nemici
Stati: ingresso, avvicinamento, posizionamento, preparazione, attacco, recupero, colpito, caduta, rialzata, KO.
Un coordinatore assegna posti attorno ai giocatori e limita gli attaccanti simultanei. Gli altri si riposizionano o minacciano; non restano sovrapposti. Gli attacchi hanno anticipazioni visive e sonore. Chi entra da fuori schermo non può infliggere subito danno.
Gang con comportamenti distinti: pressione di gruppo, portata delle mazze, blocchi e spintoni, fuga armata. Le varianti grafiche non bastano a creare un nemico diverso.

### Danno e leggibilità
Breve protezione dopo essere stati colpiti; limite alle catene che impediscono di reagire; rialzata protetta. Fuoco amico disattivato come default. Camera shake e lampi riducibili. Suoni e animazioni di impatto sincronizzati col contatto, non con la pressione del tasto.

## 4. Personaggi e fedeltà narrativa
Nove Warriors rappresentati: Cleon, Swan, Ajax, Snow, Cowboy, Cochise, Vermin, Rembrandt e Fox.
Mercy, Cyrus, Luther, i Riffs e la DJ hanno ruoli narrativi e asset dedicati.

Prima coppia da realizzare e provare: Swan (equilibrio/tecnica) e Ajax (potenza/resistenza). Roster giocabile esteso previsto: Snow, Cochise, Vermin, Rembrandt e Cowboy. Cleon e Fox inizialmente narrativi; eventuale giocabilità extra richiede animazioni e verifica aggiuntive.
Sono differenze di stile e tempi, non superpoteri. Valori numerici definitivi solo dopo test sulla stessa arena.

Due regole di selezione:
- Storia: disponibili soltanto i personaggi presenti nel segmento narrativo. Composizione dei gruppi e uscite di scena gestite da dati.
- Arcade libero, dopo la campagna di base: roster sbloccato senza vincoli cronologici, chiaramente distinto dalla Storia.

L’arresto di Ajax è una scena narrativa non interattiva con contesto e conseguenze, non una prova che premi il comportamento verso la donna. Chi lo controllava sceglie un Warrior disponibile al successivo punto sicuro; conserva dispositivo, slot e punteggio. Non perde una vita per un evento di trama.
Lo stesso principio vale per separazioni e uscite di scena di Cleon e Fox. Mai eliminare un partecipante dalla sessione.

## 5. Campagna proposta
Prologo narrativo + otto capitoli. La numerazione è una struttura di adattamento, non l’elenco delle scene del film.

| ID | Segmento | Gioco e obiettivo | Chiusura / evento |
|---|---|---|---|
| P0 | Il raduno nel Bronx | Introduzione, discorso, omicidio e accusa; controlli di combattimento bloccati nelle scene | Caos, separazione da Cleon, ordine di tornare a casa |
| C1 | Fuga dal Bronx | Tutorial contestuale e fuga verso la metro; pressione dei Turnbull ACs | Raggiungere il treno; incontro finale a obiettivo, non eliminazione obbligatoria di tutta la gang |
| C2 | Il territorio degli Orphans | Strade, prima vera sequenza di arene, risorse e armi improvvisate | Incontro con Mercy e uscita dal quartiere |
| C3 | La caccia | Stazione e accessi urbani; inseguimento della polizia, passaggi bloccati e ricongiungimenti | Fuga dalla zona; separazione di Fox trattata nella narrazione |
| C4 | Baseball Furies | Accesso al parco, inseguimento, radura di combattimento; mazze e avversari silenziosi | Scontro con Furies più esperti; successiva scena dell’arresto di Ajax |
| C5 | La trappola delle Lizzies | Breve calma, trappola rivelata, schivare linee di tiro e liberare la via | Fuga dalla finestra verso una zona sicura; nessun obbligo di mettere KO tutte |
| C6 | Union Square: i Punks | Stazione, corridoi, bagno con arene strette; porte e lavabi interattivi | Scontro corale e ricongiungimento; proseguimento con Mercy |
| C7 | L’ultimo treno | Trasferimento, tensione e dialoghi; breve attraversamento, pochi incontri di raccordo | Arrivo a Coney Island all’alba, spazio per respirare |
| C8 | Coney Island | Minaccia dei Rogues, bottiglie, accesso alla spiaggia e confronto finale | Swan disarma Luther nella scena conclusiva; arrivo dei Riffs e camminata finale |

I raccordi giocabili aggiunti sono adattamenti, da mantenere coerenti con il film. Il capitolo C7 deve essere breve: non inventare un’ondata enorme soltanto per aumentare la durata.
I bagni sono quelli pubblici della stazione: asset di cabine, porte e sanitari.
Il finale non è una lunga rissa contro un Luther con salute enorme: pressione breve dei Rogues e duello scenico a preparazione leggibile, risolto da Swan nella sequenza narrativa. In cooperativa gli altri mantengono un ruolo fino all’avvio della scena, poi nessun input può causare danni.

### Struttura degli incontri
Ogni capitolo contiene segmenti di tipo traversal, arena, escape, dialogue o cinematic. Un’arena si chiude solo sui nemici richiesti; una fuga sull’uscita del gruppo; una scena solo sul proprio evento conclusivo.
Stati incontro: inattivo → ingresso → attivo → risolto → transizione. Completamento idempotente: un evento non assegna due premi e non carica due volte il capitolo.
Un boss non è obbligatorio a ogni fine capitolo.

### Camera e compagni
Camera condivisa con area di combattimento leggibile. Blocco soltanto nelle arene dichiarate. In fuga deve accompagnare il gruppo senza spingere il ritardatario contro un muro invisibile.
Compagno CPU opzionale in singolo: segue, sceglie un bersaglio, evita pericoli e prova ad aiutare; non attiva uscite, non consuma risorse importanti senza regola esplicita. Recupero fuori campo solo in punto sicuro e mai attraverso un ostacolo durante un combattimento.

## 6. Modalità, progressione e cooperativa
Obiettivo finale: singolo, cooperativa locale 2–4, cooperativa online 2–4. Prima verifica su singolo e due locali; quattro giocatori e online arrivano dopo la medesima arena stabile. Non dichiarare online completato finché non passa un test fra dispositivi e reti differenti.

Storia: checkpoint per segmento sicuro, difficoltà Facile / Normale / Difficile, ripresa della campagna. Il salvataggio annota capitolo, incontro, flag narrativi, roster disponibile, personaggi scelti, risorse e versione dello schema.
Arcade: crediti e vite limitati, punteggio, niente ripresa del checkpoint di storia. Capitoli e Sopravvivenza come extra successivi.
La nuova richiesta estende il vecchio prototipo 0.2, che era soltanto singolo e senza salvataggio.

KO cooperativo: finestra di soccorso; interazione tenuta vicino al compagno; danno interrompe il soccorso. Se tutti sono a terra, schermata di sconfitta e ripartenza dal checkpoint. Il KO non cambia gli eventi della trama.
Difficoltà cooperativa: scalare avversari e posti di attacco con limiti, non moltiplicare soltanto la loro salute.
Valutazione fine capitolo: tempo, danni, combo e aiuti, senza penalizzare il tempo dei dialoghi.
Nuove chiavi warriors-* per opzioni e salvataggi; nessun uso di primal-*.

Online: host autorevole, client inviano input, viste serializzabili; lobby, versione protocollo, disconnessione e rientro da definire e provare. Le dipendenze PeerJS/STUN/TURN della reference non equivalgono a un’infrastruttura già verificata per Warriors. Credenziali permanenti e segreti non vanno inseriti nei sorgenti.

## 7. Comandi proposti
| Azione | Tastiera singolo | Controller standard |
|---|---|---|
| Movimento | WASD / frecce | Stick / croce |
| Attacco leggero | J | X |
| Attacco pesante | K | Y |
| Salto | Spazio | A |
| Schivata | Shift | RB |
| Interazione / presa / aiuto | E | B |
| Furia | L | LB |
| Lancia arma | Q | RT |
| Pausa | Esc | Start |

Rimappatura obbligatoria; seconda tastiera con schema separato senza collisioni. Prompt aggiornati al dispositivo reale. Il menu usa gli stessi dispositivi del gioco. Nessun tasto Pistola: le armi da fuoco restano minacce narrative o nemiche in segmenti specifici.

## 8. Ambiente e audio
Strade, metro, parco, appartamento delle Lizzies, bagni e Coney Island con piani separati: fondale, terreno leggibile, oggetti interattivi, primo piano che non copre gli attacchi.
Props con funzione distinta: decorazione, ostacolo, distruttibile, arma o uscita. Mazze, tubi, bottiglie e assi devono avere pose impugnate, pickup e collisioni.
Musica: titolo, raduno, fuga, strade, Furies, Lizzies, Punks, viaggio finale, Rogues, finale. Ambience: treni, rotaie, sirene, passi, folla, vento, mare. DJ e dialoghi in canale voci con sottotitoli.
Mixer musica / effetti / voci; attenuazione musica durante parlato, una sola traccia principale attiva, crossfade controllato, pausa e ripresa senza duplicazioni. Avvio audio su gesto dell’utente.
I master musicali e vocali del film non sono stati forniti in questa sessione: non risultano caricati. “In the City” e gli altri brani effettivi restano asset da acquisire dai materiali del progetto, non semplici nomi in un menu. Nessuna traccia di Primal spacciata per colonna sonora Warriors.

## 9. Requisiti degli asset
Manifest separato con ID, percorso, tipo, stato e capitoli. Stati: missing, source, processed, integrated, verified. Solo verified significa visto e provato nel gioco.
- Personaggi: modello di riferimento, palette, proporzioni, gilet e silhouette coerenti; atlas con ancoraggio ai piedi.
- Animazioni: idle, walk, run, punch chain, heavy, jump, air attack, dodge, grab, grab attack, throw, weapon attack, pickup, hurt, knockdown, rise, KO, victory, fury. Numero di frame deciso sulla leggibilità, non generazione casuale di pose.
- Nemici: set propri per gang e varianti di comportamento; niente ricolorazione dei mostri di Primal.
- Fondali: scorrimento continuo, pavimento coerente con il piano y, uscite visibili.
- Cinematiche: raduno, sparo/accusa, separazioni, arresto, trappola, ricongiungimento, bottiglie, disarmo, Riffs, epilogo.
- HUD: ritratti, salute, furia, arma/durabilità, soccorso; non mostrare risorse inesistenti.
Validare dimensioni atlas, rettangoli nei limiti, trasparenza, piedi fermi, inversione, proporzioni e montaggio in movimento.

## 10. Architettura proposta
Moduli separati: input, simulation, combat, ai, encounters, campaign, renderer, assets, audio, save, ui e successivamente network.
Contenuti in dati: personaggi, mosse, nemici, capitoli, incontri, dialoghi e manifest asset.
Un ciclo di simulazione a passo fisso; presentazione disaccoppiata; eventi di impatto unici. Il salto di una cinematica applica gli stessi flag del completamento normale.
La campaign machine mantiene roster e cronologia; lo stato temporaneo dell’arena non deve modificare direttamente il roster.
Non copiare interamente la reference: sim.js richiama stepExtra, stepII, stepTeam e stepMech, oltre a dati globali. Estrarre e adattare sistemi con contratti chiari, tracciando la provenienza.

## 11. Ordine di realizzazione e criteri
1. Fondazione: input, movimento x/y/z, camera, collider e debug visivo.
2. Vertical slice Furies: Swan/Ajax, un tratto di parco, due archetipi nemici, combo, arma, soccorso, uscita e audio; ripetibile da menu.
3. Campagna: prologo, C1–C8, eventi, checkpoint, selezione coerente e finale.
4. Asset definitivi: integrazione per capitolo con controlli tecnici e visivi; aggiornare lo stato a ogni consegna.
5. Cooperativa estesa, rete, touch ed extra dopo le verifiche del nucleo.

La vertical slice non è la campagna completa. Non avviare la produzione di tutte le tavole prima di validare scala e animazioni di Swan e di un Fury.

Verifiche di accettazione:
- Nessun colpo fuori profondità o danno duplicato dallo stesso swing.
- Prese, armi e uscite non si rubano involontariamente lo stesso input.
- Nessun personaggio incastrato dietro un oggetto; camera e ondate sempre sbloccabili.
- Un nemico fuori schermo non attacca immediatamente.
- KO, soccorso e sconfitta funzionano in singolo e in due.
- Salvataggio e ripresa conservano roster e flag; Ajax non ricompare in Storia dopo l’arresto.
- Skip delle scene identico al completamento per flag, roster e checkpoint.
- Nessun partecipante escluso da un’uscita narrativa.
- Pausa blocca danni e timer; ritorno al titolo interrompe l’audio della partita.
- Audio non duplicato; sottotitoli leggibili; asset mancanti segnalati.
- Incontri con obiettivo fuga non richiedono eliminazioni non previste.
- Ogni capitolo completabile dall’inizio all’uscita e campagna completabile fino all’epilogo.

## Stato reale di questa consegna
Analisi statica della reference e specifica di logica caricate. Nessun motore trasferito, nessuna build giocabile, nessuna musica o tavola definitiva caricata da questa consegna. Le funzionalità descritte sono lavoro pianificato, non implementato.
