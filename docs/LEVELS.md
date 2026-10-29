# Campagna — schede di tutti i livelli

Baseline 1.0 · 29 ottobre 2026. Prologo + otto capitoli secondo la scaletta dell'autore. Percorsi, durate, quantità e dialoghi sono proposte di adattamento complete per una prima implementazione, non una ricostruzione delle strade al metro. Scene del film e raccordi inventati sono distinti.

## Convenzioni comuni

- Gli ID P0/C1–C8 e quelli delle aree sono stabili. Ogni area ha un asset environment dedicato con lo stesso ID minuscolo, es. env_c4_03.
- I numeri dei nemici indicano il totale dell'incontro: **singolo / due giocatori**. Ingresso da coda secondo i limiti di COMBAT_AND_SYSTEMS, non tutti insieme. Difficoltà cambia parametri, non la composizione narrativa.
- CP = checkpoint sicuro scritto prima dell'attivazione dell'incontro. Retry ripristina salute, risorse e punteggio di entrata. Dialoghi completati non si ripetono al retry, ma restano rivedibili dal menu pausa.
- Chiusura arena: tutti i nemici obbligatori KO o ritirati con evento dichiarato. Chiusura fuga: raggiungere l'uscita con i due attori e nessun compagno in soccorso; non richiede zero nemici.
- Le risorse elencate sono fisse, una per posizione; i duplicati per due giocatori sono dichiarati. Niente loot casuale per allungare il livello.
- Ogni area usa musica del capitolo, ambience del luogo, passi e cue comuni; le eccezioni sono indicate. Tutti gli asset indicati sono requisiti, non file già presenti.
- Lunghezze in schermate da 1280 unità, profondità in unità logiche del pavimento. I fondali scorrevoli richiedono raccordi artistici, non stiramento dell'immagine ricevuta.

## P0 — Coney Island: prima della notte

**Durata obiettivo:** 5–7 minuti, tutorial saltabile se già completato. **Tono:** casa, appartenenza, sera. **Gruppo:** tutti e nove presenti. Controllo iniziale Cleon; 2P Swan. Gli altri partecipano alle presentazioni; selezione della coppia prima della partenza.

**Apertura:** panorama di Coney Island e ritrovo. Cleon spiega che si parte in nove per il raduno. Nessuna rissa con una gang inventata nel quartiere. Le esercitazioni sono adattamento ludico esplicito.

| Area / tipo | Location e spazio | Cosa succede e cosa fa il giocatore | Materiali specifici |
|---|---|---|---|
| P0-01 / traversal | Ritrovo della banda, 1 schermata, profondità 170 | Muoversi, interagire con due compagni; tutte le presentazioni facoltative restano consultabili. Uscita dopo movimento e una conversazione | Ritrovo, nove Warriors in attesa, sedute, ritratto Cleon, cue ambientale quartiere |
| P0-02 / training | Spazio libero del ritrovo, 1 schermata, profondità 210 | Cleon/Swan provano leggero, pesante, salto e schivata; un compagno sparring restituisce la guardia. Nessun KO o danno permanente | Sagoma bersaglio, compagno in guardia, indicatori attacco e schiva |
| P0-03 / training | Passaggio verso l'uscita, 1 schermata | Presa e rilascio su sparring, pickup di un tubo d'allenamento, soccorso simulato. In singolo CPU dimostra l'azione se richiesta; tutti i passi saltabili dal menu | Tubo, materassino o area dichiarata training, prompt soccorso, cancello |
| P0-04 / cinematic | Accesso metro, 1 schermata | Raccogliersi e partire. La selezione assegna due Warriors ammessi a C1. Breve viaggio e titolo del gioco | Accesso metro di casa, vagone, title card, scena gruppo in partenza |

**Progressione:** tutorial_started → tutorial_complete (o tutorial_skipped) → departed_coney. Il completamento/salto tutorial non assegna furia, punteggio o salute extra. **CP:** ingresso P0-01 e prima P0-04. **Fallimento:** nessuno nel training, tasto riprova. **Risorse:** nessuna trasferibile; tubo restituito prima della partenza. **Fine:** carica C1-01.

**Dialoghi richiesti:** presentazione Cleon, brevi risposte degli otto, istruzioni contestuali, richiamo alla partenza. **Audio:** mus_title in menu, mus_p0 nel ritrovo, amb_coney_evening, amb_subway, partenza treno. **Cinematiche:** cine_departure. **Verifica:** si può finire anche saltando ogni lezione; 2P non rimane vincolato a Swan al capitolo successivo.

## C1 — Il raduno

**Durata:** 7–9 minuti, almeno metà dell'apertura dedicata all'atmosfera. **Tono:** grandezza, speranza, shock, disorientamento. **Gruppo:** nove all'arrivo; otto nel percorso di fuga, Cleon separato. Personaggio scelto nel prologo; chi aveva Cleon passa a Swan o altro libero.

| Area / tipo | Location e spazio | Evento, obiettivo e incontro | Materiali specifici |
|---|---|---|---|
| C1-01 / traversal | Accesso al raduno nel Bronx, 1,5 schermate, profondità 180 | Camminare con la banda fra delegazioni. Combattimento disabilitato per tregua. Raggiungere il punto assegnato | Folla modulare e silhouette di gang, accesso parco, cartelli senza linee inventate |
| C1-02 / cinematic | Radura e palco, composizione larga | Discorso di Cyrus; sparo, accusatore, irruzione della polizia. Nessuna mira o scelta capace di salvare Cyrus | Palco, Cyrus, Luther, Riffs, lampi e folla in fuga; cine_cyrus e cine_accusation |
| C1-03 / escape + micro-arena | Sentiero fra transenne, 2 schermate, profondità 160–210 | Raggiungere gli altri; due orphan_brawler / tre, delegati riconoscibili che ostacolano, in una breve strettoia. Dopo il varco riparte la fuga. Due police_pursuer / tre inseguono ma non sono obiettivo KO | Transenne, uscita laterale, foliage, folla con percorsi non solidi |
| C1-04 / traversal | Sottopasso sicuro, 1 schermata | Ricontare il gruppo; Cleon non torna. Swan assume la guida. Interazione sulla scala chiude il capitolo | Sottopasso, scala verso strada, otto pose stanche; cine_swan_leads |

**Trigger e flag:** cyrus_speech_started → cyrus_killed → warriors_accused → cleon_missing, applicati una volta dalla scena; c1_escape_clear → swan_leader al ritrovo. Se si salta, stessi eventi. **CP:** C1-01, ingresso C1-03, ingresso C1-04. **Sconfitta:** KO del gruppo; nel caos niente morte da folla decorativa. **Risorse:** C1-03 una bevanda presso un accesso laterale sicuro, due in coop. **Armi:** nessuna portata al raduno; tutti disarmati alla fine della scena.

**Ritmo:** non chiudere il percorso in un lungo torneo di gang. **Audio:** mus_c1_discourse, mus_c1_escape (due cue del capitolo), amb_rally, sirene e radio. **Dialoghi:** discorso da materiale autorizzato o testo adattato identificato, accusa di Luther, richiamo di Swan, conteggio compagni. **Fine:** mappa mostra Bronx → collegamento metro; parte C2. **Verifica:** Cleon fuori dal roster in save e selezione, slot umano conservato.

## C2 — Braccati

**Durata:** 8–10 minuti. **Tono:** caccia e corsa contro la chiusura delle porte. **Gruppo:** Swan, Ajax, Snow, Cowboy, Cochise, Vermin, Rembrandt, Fox; due attivi selezionabili.

| Area / tipo | Location e spazio | Evento, obiettivo e incontro | Materiali specifici |
|---|---|---|---|
| C2-01 / traversal | Isolato del Bronx, 2 schermate, profondità 220 | Trovare l'accesso alla metro; il bus dei Turnbull compare sullo sfondo e i compagni segnalano la minaccia | Facciate, bus, fermata, auto parcheggiate, freccia obiettivo contestuale |
| C2-02 / arena | Vicolo con cancello, 1,5 schermate, profondità 190 | 3 turnbull_rusher + 1 turnbull_heavy / 4 + 2. Aprire il cancello dopo l'incontro, non distruggere il bus | Cancello, cassa, tubo e cartoni; uscite sempre visibili |
| C2-03 / escape | Strada verso le scale, 3 schermate, profondità 180–230 | 2 turnbull_rusher / 3 inseguono con coda finita; transenne basse e deviazioni. Bus nella corsia superiore segnala la pressione. 70 s per raggiungere le scale, 85 in Facile | Strada continua, tre moduli ostacolo, bus animato, lampioni, clacson |
| C2-04 / escape + cinematic | Scale e banchina, 1,5 schermate | Ultimo tratto di 25 s senza nuovo combattimento obbligatorio. Entrare nel treno; porte aspettano la condizione di gruppo, non chiudono su 2P già arrivato. Scena di partenza | Scale, tornello aperto, banchina, porte/vagone e cine_train_escape |

**Flag:** turnbull_spotted → alley_clear → metro_reached → train_boarded. Un fallimento timer mostra l'inseguimento che raggiunge il gruppo, poi retry, senza cambiare il destino della storia. **CP:** C2-01, C2-02, C2-03, C2-04. **Risorse:** C2-02 snack uno/due dentro cassa dichiarata, tubo uno; C2-03 bevanda una/due prima della corsa, fuori dal timer. Tutte le armi lasciate prima di salire per chiudere l'incontro coerentemente.

**Audio:** mus_c2, amb_street, amb_subway, bus warning, train doors. **Dialoghi:** osservazione Fox, richiesta di corsa, richiamo del compagno vicino alle scale. **Fine:** guasto/interruzione del percorso raccontato nel raccordo; discesa nel quartiere degli Orphans. È un raccordo di adattamento senza indicazione fittizia di linea ferroviaria. **Verifica:** completabile senza eliminare inseguitori di C2-03 e C2-04.

## C3 — Territorio nemico

**Durata:** 9–11 minuti. **Tono:** tregua fragile, provocazione e nuova fuga. **Gruppo:** otto Warriors all'inizio; Mercy entra. Fox esce nella sequenza conclusiva di fuga dalla polizia. Il dettaglio del passaggio è concentrato qui come raccordo di adattamento fra Orphans e Furies.

| Area / tipo | Location e spazio | Evento, obiettivo e incontro | Materiali specifici |
|---|---|---|---|
| C3-01 / dialogue | Strada degli Orphans, 1,5 schermate, profondità 200 | Capo Orphans impedisce il passaggio. Si può chiedere passaggio o invitare alla calma; entrambe le risposte conducono al confronto con tono diverso. Mercy interviene | Facciate, insegna quartiere, Orphans in guardia, ritratti capo/Mercy |
| C3-02 / arena | Cortile e strettoia, 2 schermate, profondità 190 | 3 orphan_brawler + 1 orphan_board / 5 + 2, due ondate. Boss non necessario. Una breve scena introduce la distrazione incendiaria, senza minigioco di fabbricazione | Cortile, asse, cassa, barriera scenica fuoco e FX sicurezza |
| C3-03 / escape | Strada laterale verso metro, 2 schermate, profondità 220 | Uscire mentre gli Orphans si ritirano; nessuna nuova ondata obbligatoria. Mercy segue, non ha HP da scorta | Strada di raccordo, uscita, insegna stazione, cine_mercy_joins |
| C3-04 / escape + cinematic | Banchina/accessi, 1,5 schermate, profondità 170 | 2 police_pursuer / 3, obiettivo fuga. La separazione di Fox e Mercy è raccontata con tagli ellittici; Fox non rientra. Le vie dividono i superstiti | Banchina, bordo protetto, passaggio, agente, ombre treno; cine_police_split |

**Flag:** orphans_confrontation → mercy_joined → orphans_escape → fox_lost → party_split. Fox non muore per errore su una hitbox del binario: scena fissata, nessun gore necessario. **CP:** C3-01, C3-02, C3-03, C3-04. Se Fox era umano, dopo la scena selezione fra Swan/Ajax/Snow/Cowboy prima di C4, conservando slot e punteggio.

**Risorse:** C3-02 asse uno, snack uno/due; C3-03 bevanda una/due nel punto sicuro. **Dialoghi:** trattativa, intervento Mercy, dissenso Ajax, decisione di scappare, richiamo nella separazione. **Audio:** mus_c3, amb_street, fuoco, sirena, amb_subway. **Fine:** fronte parco con gruppo Furies; gli altri percorsi verranno ripresi in C5. **Verifica:** Mercy non si blocca dietro il fuoco e il retry non ripete fox_lost due volte.

## C4 — Baseball Furies

**Durata:** 10–12 minuti. **Tono:** silenzio minaccioso, corsa, scontro fisico. **Gruppo:** Swan, Ajax, Snow, Cowboy. Due attivi, gli altri raccordi e supporto scenico. Mercy non è nel piano di combattimento.

| Area / tipo | Location e spazio | Evento, obiettivo e incontro | Materiali specifici |
|---|---|---|---|
| C4-01 / traversal → escape | Uscita e ingresso del parco, 1,5 schermate, profondità 200 | Prima apparizione silenziosa dei Furies; per 45 s raggiungere il sentiero. 2 fury_flanker / 3 minacciano, non requisito KO | Accesso, sagome Furies, alberi e luci; cine_furies_appear |
| C4-02 / arena | Sentiero con panchine, 2 schermate, profondità 230 | 2 fury_batter + 1 fury_flanker / 3 + 2. Prima spiegazione del disarmo: pesante sulla ripresa, poi interazione | Panchine solide, cestino separato, mazza, icona disarmo |
| C4-03 / arena principale | Radura/passeggiata, 2 schermate, profondità 240 | Ondata A: 2 fury_batter + 1 fury_flanker / 3 + 2. Ondata B: 1 fury_veteran + 1 fury_batter / 1 + 2. Veterano resta umano e disarmabile. Barra élite solo nell'ultima ondata | Parco raccordato al fondale ricevuto, terreno, mazza caduta, FX impatto |
| C4-04 / traversal + cinematic | Sentiero di uscita e bivio, 1 schermata | Recupero, richiamo alla metro. Ajax resta indietro mentre il gruppo si separa. Nessun combattimento aggiuntivo che svuoti il climax | Bivio, panchina distante come anticipazione, pose affaticate; cine_ajax_stays |

**Disarmo:** bersaglio in recover, impatto pesante o presa valida; la mazza cade una volta e cambia moveset del nemico a mani nude. Tutorial non congela un avversario in posa eterna: prompt pausa facoltativo.

**Flag:** furies_seen → furies_path_clear → furies_defeated → ajax_separated. **CP:** C4-01, C4-02, C4-03, C4-04. **Risorse:** C4-02 bevanda una/due presso cestino con sportello; C4-03 snack uno/due prima dell'ondata B, kit uno in deviazione visibile; due mazze iniziali come drop deterministici dai primi nemici disarmati, non pickup duplicati.

**Audio:** mus_c4_chase e mus_c4_fight; passi, colpi legno, vento; nessuna battuta casuale dei Furies. **Dialoghi:** avvistamento, respiro di Cowboy, richiamo Swan, risposta Ajax. **Fine:** C5A; Ajax non è selezionabile nel combattimento successivo. **Verifica:** armi non tagliate e piedi stabili su tutte le pose; nessuna chiusura arena causata da Fury fuori campo irraggiungibile.

## C5 — La banda divisa

**Durata:** 10–13 minuti complessivi. **Tono:** pericoli diversi, perdita, ricongiungimento desiderato. Montaggio alternato, senza giocare tre volte lo stesso corridoio. Ogni sottosezione conserva salute e inventario dei propri personaggi; i pickup non passano magicamente da un gruppo all'altro.

| Area / tipo | Gruppo e location | Evento e azione | Materiali specifici |
|---|---|---|---|
| C5-01 / cinematic | Ajax; Snow/Cowboy nei raccordi, panchina nel parco | Scelta imprudente e rivelazione della poliziotta; arresto. Nessun obiettivo di seduzione, molestia o pestaggio. Tutti gli input di danno bloccati | Panchina separata dal fondale, poliziotta, manette e agenti; cine_ajax_arrest |
| C5-02 / dialogue | Vermin, Cochise, Rembrandt; appartamento Lizzies | Accoglienza e apparente sicurezza; breve movimento verso la stanza, segnali inquietanti notati da Rembrandt. Nessuna scelta erotica o romance a punteggio | Appartamento integro, Lizzies in attesa, porta, radio, ritratti |
| C5-03 / escape | Stesso gruppo; stanza e finestra, 1,5 schermate, profondità 170 | Trappola rivelata. 1 lizzie_blocker + 1 lizzie_shooter / 2 + 2. 55 s per aprire il varco e raggiungere la finestra. Sparatrici presidiano postazioni, non sono KO obbligatori; finestra si attiva dopo un pannello fragile aperto | Ripari solidi, vetro, porta chiusa, finestra e piattaforma di uscita; cine_lizzies_trap |
| C5-04 / traversal | Swan e Mercy; collegamento sotterraneo, 1,5 schermate | Secondo ruolo Mercy in coop: entrambi attraversano, si aspettano e interagiscono con una porta; nessun combattimento. Pausa dialogata e avvicinamento emotivo. Nessun puzzle a due impossibile in singolo | Tunnel sicuro, porta azionabile da uno, due pose di pausa, luce lontana; cine_swan_mercy |
| C5-05 / traversal + dialogue | Snow/Cowboy e poi tutti i superstiti; accesso Union Square, 1 schermata | Raccordo di uscita dal parco e arrivo di Vermin/Cochise/Rembrandt. Resoconto dell'arresto e obiettivo ritrovo. Selezione della coppia C6 | Accesso stazione, sei Warriors e Mercy in scene di raccordo; cine_reunion_approach |

**Composizione:** C5-02/03 umani scelgono due fra Vermin/Cochise/Rembrandt, default 1P Rembrandt e 2P Vermin; terzo presente nelle scene e nella fuga sicura. C5-04 default Swan/Mercy, P2 informato che il ruolo ha movimento e interazioni narrative. Non trasformare Mercy in una combattente inventata per mantenere i pulsanti.

**Flag:** ajax_arrested → lizzies_entered → lizzies_revealed → lizzies_escaped → swan_mercy_link → rendezvous_reached. Gli intermezzi possono montare eventi paralleli, ma lo stato del salvataggio segue questa sequenza deterministica. **CP:** prima di ogni area; C5-01 una sola volta per run, skip riapplica ajax_arrested senza animazione. **Sconfitta:** soltanto nella fuga C5-03; retry riparte dalla rivelazione, non dall'accoglienza.

**Risorse:** bevanda una/due prima di C5-03; nessuna pistola raccolta; nessuna risorsa in C5-04. **Audio:** mus_c5_welcome → mus_c5_escape → mus_c5_quiet, amb_apartment/amb_tunnel, colpi anticipati, vetro. **Fine:** sei Warriors (Swan, Snow, Cowboy, Cochise, Vermin, Rembrandt), più Mercy. Il ricongiungimento verifica esattamente queste sei identità, non un generico numero di superstiti. **Verifica:** sei identità, mai duplicati; inventario Ajax non trasferito a Rembrandt.

## C6 — Union Square

**Durata:** 9–11 minuti. **Tono:** il gruppo torna a essere unito e deve guadagnarsi l'ultima partenza. **Roster:** Swan, Snow, Cowboy, Cochise, Vermin, Rembrandt. Mercy accompagna fuori dall'arena.

| Area / tipo | Location e spazio | Evento, obiettivo e incontro | Materiali specifici |
|---|---|---|---|
| C6-01 / traversal + dialogue | Atrio e corridoio, 1,5 schermate, profondità 180 | Ricongiungimento visibile; il capo Punks osserva e si avvicina. Scegliere l'accesso al bagno, nessun bivio di trama | Atrio, insegne, Punks riconoscibili, ritrovo; cine_reunion |
| C6-02 / arena | Antibagno, 1 schermata, profondità 140 | 2 punk_brawler + 1 punk_grappler / 3 + 2. Spazio ristretto, porte e profondità obbligano al posizionamento | Porta battente, corrimano, cestino e icona presa nemica |
| C6-03 / arena principale | Bagno, 1,5 schermate, profondità 150–190 | Ondata A 2 punk_brawler + 1 punk_grappler / 3 + 2; poi 1 punk_leader + 1 punk_brawler / 1 + 2. Leader unico, supporti finiti. Lavabo e cabine reagiscono ai colpi definiti | Cabine, due stati porte, lavabi integri/rotti, specchio con crepe; cine_punks_confrontation |
| C6-04 / traversal + intermezzo | Uscita bagno e banchina, 1 schermata | Ricomporsi e salire. Intermezzo: il testimone informa i Riffs, senza scelta del giocatore che cambi la verità | Uscita, vagone, stanza dei Riffs; cine_truth_reaches_riffs |

**Flag:** reunited → punks_defeated → riffs_informed → last_train_boarded. **CP:** C6-01, C6-02, C6-03, C6-04. **Risorse:** C6-02 kit uno a parete, due in Facile coop; C6-03 tubo uno da evento lavabo, snack uno/due prima del leader. I sanitari non generano ripetutamente tubi a ogni retry.

**Dialoghi:** aggiornamento su Ajax, riconoscimento reciproco, minaccia Punks, decisione treno. **Audio:** mus_c6, amb_subway e amb_bathroom, porcellana, porte, passi e colpi riverberati. **Fine:** C7 vagone. **Verifica:** KO non intrappolati fra porta e lavabo; un supporto fuori dalla porta non blocca il boss clear.

## C7 — L'ultimo treno

**Durata:** 4–6 minuti. **Tono:** tregua, stanchezza, ritorno della luce. **Gruppo:** sei Warriors e Mercy. P1 Swan, P2 Mercy in movimento narrativo; gli altri occupano il vagone e parlano. Nessun nemico o combattimento obbligatorio.

| Area / tipo | Location e spazio | Evento e azione | Materiali specifici |
|---|---|---|---|
| C7-01 / narrative traversal | Vagone, 1,5 schermate, profondità 110 | Camminare brevemente e interagire con due punti; dialogo Swan/Mercy, compagni affaticati e contrasto con passeggeri eleganti. Si può restare ad ascoltare, mai timer | Interno treno, sedute, finestrini con loop urbano, passeggeri, pose sedute; cine_train_dawn |
| C7-02 / cinematic + traversal | Banchina di casa, 1 schermata | Il treno arriva, il gruppo scende. Riconoscere l'accesso visto nel prologo. Interazione dell'uscita conduce alla strada | Banchina alba, scala corrispondente al prologo, cambio luce; cine_home_arrival |

**Flag:** train_conversation_seen → home_arrived. **CP:** C7-01 e C7-02. **Sconfitta:** nessuna, pavimento sicuro. **Risorse:** ripristino al 70% HP minimo alla fine del viaggio, come recupero di capitolo dichiarato; furia conservata, armi assenti dopo viaggio. Nessun punteggio per disturbare passeggeri o finire più velocemente.

**Dialoghi:** ripercussioni della notte, rapporto Swan/Mercy, presenza dei compagni. **Audio:** mus_c7 contenuta, amb_train_motion, ruote e porte. Nessuna sovrapposizione di brani. **Fine:** alba a Coney Island. **Verifica:** capitolo saltabile dopo prima visione con gli stessi flag e recupero salute.

## C8 — Coney Island

**Durata:** 7–9 minuti. **Tono:** sollievo interrotto, minaccia, risoluzione. **Gruppo:** sei Warriors e Mercy; Riffs arrivano solo nella chiusura.

| Area / tipo | Location e spazio | Evento, obiettivo e incontro | Materiali specifici |
|---|---|---|---|
| C8-01 / traversal + cinematic | Strada di casa, 1,5 schermate | Ripresa degli scorci del prologo all'alba; carro dei Rogues, bottiglie e richiamo Luther. Non riempire la strada di gang di altri capitoli | Facciate riutilizzate con luce alba, veicolo, bottiglie animate; cine_bottles |
| C8-02 / arena di varco | Passaggio verso lungomare, 1,5 schermate, profondità 220 | 2 rogue_brawler + 1 rogue_bottle / 3 + 2. Breve raccordo ludico aggiunto rispetto alla scena conclusiva. Aprire il varco, non sconfiggere Luther qui | Passaggio, staccionata, bottiglie e uscita spiaggia |
| C8-03 / confrontation + cinematic | Spiaggia, 1 schermata larga, profondità 230 | Swan avanza al segno di confronto; altri mantengono posizione. Luther mostra la pistola. Da quel momento scena diretta: coltello, disarmo, arrivo Riffs e riconoscimento dell'innocenza. Nessun QTE capace di creare un finale diverso | Sabbia, mare, coltello narrativo, pistola Luther, ferita al braccio; cine_disarm e cine_riffs_arrival |
| C8-04 / epilogue | Battigia all'alba, scorrimento 1,5 schermate | Camminata finale del gruppo, Mercy con Swan, musica e crediti. Movimento facoltativo controllato o automatico dopo attesa; nessuna minaccia residua | Battigia, cielo alba, pose cammino stanco, titoli; cine_epilogue |

**Flag:** rogues_arrived → beach_path_clear → luther_disarmed → warriors_cleared → campaign_complete. **CP:** C8-01, C8-02, C8-03; epilogo rivedibile. Chi controllava un altro Warrior prima di C8-03 non perde lo slot: può accompagnare fino al trigger, poi la regia assegna Swan alla scena. Il suo inventario non cambia il coltello narrativo.

**Risorse:** C8-02 snack uno/due e bottiglia da lancio una in deviazione; nessuna arma raccolta durante il disarmo. **Sconfitta:** KO soltanto nell'arena; ripresa della spiaggia non richiede rifare il capitolo. **Audio:** mus_c8, amb_coney_dawn/amb_sea, bottiglie, pausa tesa prima del disarmo, mus_finale. Brano effettivo del film previsto solo con master fornito. **Fine:** crediti, risultato campagna, sblocchi e ritorno al menu. **Verifica:** campaign_complete e sblocchi scritti una volta, anche con skip del finale.

## Check finale della struttura

35 aree: P0=4, C1=4, C2=4, C3=4, C4=4, C5=5, C6=4, C7=2, C8=4. Ogni area ha ambiente, obiettivo, transizione e pacchetto di risorse/scene. Gli scontri hanno numeri di base; le fughe hanno obiettivi distinti. I tempi sono budget di regia indicativi: circa 69–88 minuti, da misurare senza aspettare artificialmente i timer.

Non aggiungere altre aree o boss per raggiungere la durata. Piuttosto rendere più interessanti posizionamento, animazioni, dialoghi e identità delle gang.
