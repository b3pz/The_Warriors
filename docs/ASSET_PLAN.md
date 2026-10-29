# Piano asset — The Warriors · Night Run
29 ottobre 2026. Tutte le voci sotto sono **mancanti in questa repo** alla redazione. Non è un inventario di file già prodotti.

## Priorità 1: provare il combattimento nel parco
| Famiglia | Consegna | Uso |
|---|---|---|
| Swan | Reference del personaggio, spritesheet di combattimento, ritratto, metadati animazioni | Primo protagonista |
| Ajax | Stesso pacchetto, con silhouette e mosse proprie | Secondo protagonista |
| Baseball Furies | Due archetipi (pressione e mazza), pose, ferite/KO, metadati | Prima arena |
| Parco | Fondale scorrevole, terreno, primo piano separato, uscita | Scala e profondità |
| Armi | Mazza e tubo a terra, impugnati e in lancio; durabilità e icone | Raccolta e combattimento |
| Props | Panchina, cestino e oggetto distruttibile con stati | Collisioni |
| FX | Impatto, polvere, rottura e indicatore di soccorso | Leggibilità |
| HUD | Due ritratti, salute, furia, arma, prompt controller/tastiera | Singolo e due giocatori |
| Suoni | Pugni, calci, mazza, passi, caduta, raccolta, rottura | Feedback sincronizzato |
| Musica | Brano Furies e loop ambientale del parco | Mixer e transizioni |

Animazioni di ogni personaggio: vedere GAME_DESIGN.md. Nessun frame deve tagliare mani, arma o piedi. Prima approvare scala e ancoraggi in movimento, poi estendere il roster.

## Priorità 2: campagna
| Blocco | Consegne |
|---|---|
| Warriors | Snow, Cochise, Vermin, Rembrandt, Cowboy; Cleon e Fox narrativi inizialmente |
| Personaggi di storia | Mercy, Cyrus, Luther, rappresentanti Riffs, poliziotta, DJ |
| Gang | Turnbull ACs, Orphans, altre varianti Furies, Lizzies, Punks, Rogues |
| Polizia e folla | Agenti, folla del raduno, passeggeri e comparse di raccordo |
| Bronx | Raduno, accessi e percorso verso la metro |
| Strade / Orphans | Strada, edifici e raccordi verso la stazione |
| Metro | Banchina, accessi, corridoi e interno del treno |
| Lizzies | Appartamento, porta, finestra e punto sicuro di arrivo |
| Union Square | Stazione e bagno pubblico con cabine, porte, lavabi |
| Coney Island | Strada all’alba, lungomare, spiaggia, veicolo dei Rogues |
| Oggetti | Bottiglie, assi, armi aggiuntive, risorse e oggetti di scena |
| Cinematiche | Raduno, omicidio/accusa, separazioni, arresto Ajax, trappola, ricongiungimento, bottiglie, disarmo, Riffs, camminata finale |
| Interfaccia | Titolo, selezione, mappa del viaggio, checkpoint, pausa, opzioni, sconfitta e conclusione |

I raccordi visivi devono rispettare anno, abiti e cambiamenti di luce. La mappa racconta il viaggio; non è una promessa di mondo aperto.

## Audio effettivo
Scaletta prevista: titolo, raduno, fuga, strade, Furies, Lizzies, Punks, ultimo viaggio, Rogues e finale.
Separare musica, effetti e voci. Per “In the City” e qualsiasi altro master del film occorrono i file effettivi: non sono presenti nella repo e non sono stati recuperati in questa consegna.
Battute e annunci: asset audio con sottotitoli sincronizzati; se la registrazione manca, sottotitoli e stato mancante esplicito. Non dichiarare un doppiaggio completo.

## Contratto tecnico e avanzamento
Per ogni asset registrare: ID stabile, percorso relativo, tipo, autore/provenienza, versione, capitoli, dimensioni/durata, metadati e stato.
Stati:
1. missing — previsto, nessun file;
2. source — sorgente disponibile;
3. processed — esportato e controllato tecnicamente;
4. integrated — referenziato e caricato dal gioco;
5. verified — osservato nel gioco nel caso d’uso previsto.

Un’immagine esistente in un altro progetto non è automaticamente un asset di questa repo. Nessuno stato verified senza verifica in esecuzione.

Sprite: rettangoli atlas nei limiti dell’immagine, ancoraggio ai piedi, pivot e durata per frame, PNG trasparente.
Fondali: dimensioni e livelli di profondità espliciti; terreno allineato al piano di gioco.
Audio: formato supportato dai browser scelti, volume coerente, loop e durata dichiarati.
Percorsi: minuscolo, senza spazi, locali al progetto; niente dipendenze da link temporanei.

## Definition of done per capitolo
File presenti → manifest corretto → caricamento riuscito → integrazione visiva/sonora → percorso completo verificato.
Un elenco di nomi o una tavola non ancora montata non costituiscono un capitolo completo.
