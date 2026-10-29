# Combattimento e sistemi comuni

Baseline 1.0. Numeri iniziali di progetto da bilanciare in playtest; nessun sistema è ancora implementato.

## Esperienza, modalità e risorse

Storia lineare in nove capitoli compreso il prologo, 1–2 giocatori. Primo obiettivo desktop Mac/Windows, tastiera e controller. Arcade separato fino a quattro giocatori, successivamente anche online; non cambia la cronologia della Storia. Storia online a due conserva gli stessi gruppi della locale. Touch in orizzontale è estensione successiva.

In singolo si sceglie un Warrior fra quelli del segmento e si può attivare un compagno CPU ammesso. Nessun cambio istantaneo di personaggio durante un attacco: cambio nei punti sicuri/di capitolo. Risorse visibili: salute, furia, arma/durabilità. Niente pistola del protagonista, mana, negozio, albero di abilità o monete. Cibo, bevande e pronto soccorso sono recuperi espliciti; non compaiono casualmente dai corpi.

## Geometria e tempo

Viewport logico 1280×720, contenitore ridimensionato mantenendo proporzioni; pavimento nominale y=450–680, ridefinibile per zona. Unità logiche, non pixel dell'immagine originale. x=avanzamento, y=profondità, z=salto. Velocità standard x=230 unità/s, y=150, normalizzata in diagonale. Corsa 340/190. Salto dura circa 0,65 s, apice 100 unità.

Simulazione a passo fisso 60 Hz e rendering separato; accumulatore limitato e pausa su perdita di visibilità. Un ingresso premuto in un frame breve non viene perso fra due passi. Attacco e schivata hanno buffer di 100 ms, non una coda illimitata.

Ogni colpo confronta direzione, fascia di profondità, quota e finestra attiva. Ogni attacco possiede ID e insieme dei bersagli già colpiti. Pavimento e oggetti mantengono collider separati dagli sprite. Gli attori non salgono su panchine o automobili in questa baseline: oggetti solidi aggirabili, salto per attacchi e ostacoli esplicitamente bassi. Evitare platforming aggiunto senza asset e regole.

## Mosse standard

Tempi in ms: preparazione / attivo / recupero. Danno base riferito a potenza 3; moltiplicatori personaggio circa 0,85–1,20, velocità animazioni entro ±10%. Mai accelerare una telegraph nemica sotto il minimo leggibile per compensare la difficoltà.

| Mossa | Tempi | Danno | Portata / tolleranza y | Esito |
|---|---|---|---|---|
| Leggero 1 | 90 / 70 / 150 | 8 | 82 / 26 | Interruzione breve |
| Leggero 2 | 110 / 70 / 170 | 10 | 90 / 28 | Piccola spinta |
| Finale combo | 160 / 90 / 250 | 16 | 106 / 30 | Atterra il nemico comune |
| Pesante | 230 / 100 / 320 | 22 | 112 / 32 | Spinta forte; apre la guardia |
| Attacco in corsa | 130 / 100 / 320 | 16 | 105 / 30 | Avanzamento limitato e atterramento |
| Calcio volante | Attivo nella discesa, max 160 | 14 | 100 / 30 | Un contatto per bersaglio |
| Colpo in presa | 120 / 60 / 220 | 8 | Bersaglio vincolato | Massimo due, poi rilascio |
| Lancio | 160 / 100 / 280 | 12 | Traiettoria fino a 200 | Il corpo può urtare un altro nemico una volta |
| Furia | 150 / sequenza fino a 900 / 350 | Fino a 36 | 120 / 38 | Colpi locali; consuma 100 furia all'avvio |

La catena si apre col contatto del leggero; finestra per il colpo successivo negli ultimi 140 ms e per 180 ms dopo il recupero. Un colpo a vuoto conclude la progressione. Il pesante non richiede premere più tasti. Non si può annullare liberamente il recupero in schivata: controllo forte, impegni leggibili.

Schivata: 300 ms di movimento, invulnerabilità soltanto fra 80 e 180 ms, recupero 300 ms e riuso non prima di 850 ms dall'avvio. Direzione dal movimento, altrimenti indietro. Non attraversa muri o uscite chiuse.

## Prese, interazione e priorità

Interazione seleziona un candidato entro 64 unità x e 26 y; per presa entro 48/22, faccia rivolta al bersaglio vulnerabile. Icona stabile prima della pressione. Una pressione avvia la presa; leggero infligge massimo due colpi; direzione+interazione lancia; interazione senza direzione rilascia. Durata massima 1,4 s. Boss: presa solo in recuperi definiti e per un colpo. Nessuna presa infinita contro un muro.

Priorità: soccorso disponibile → uscita pronta → arma ai piedi → oggetto contestuale → nemico vulnerabile. Un prompt fuori portata non intercetta l'input. Portare una mazza non impedisce il soccorso: viene riposta e recuperata solo se l'aiuto riesce e rimane disponibile.

Le uscite richiedono gruppo nella zona e 0,6 s di conferma. In cooperativa una breve richiesta raccoglie entrambi; nessun trascinamento del compagno sotto attacco. Un secondo giocatore non consenziente ferma la transizione. I segmenti escape non usano il contatore nemici di un'arena.

## Armi e oggetti

| ID | Oggetto | Danno leggero/pesante | Durabilità | Regola |
|---|---|---|---|---|
| bat | Mazza | 14 / 26 | 10 contatti | Lenta, lunga; raccolta dopo disarmo |
| pipe | Tubo | 13 / 24 | 8 contatti | Più corto, più rapido |
| board | Asse | 12 / 23 | 6 contatti | Si spezza con FX e suono |
| bottle | Bottiglia da lancio | 12 a contatto | Un uso | Solo lancio, poi vetro decorativo non persistente |

La durabilità cala una volta per swing con almeno un contatto valido, non per frame e non per ogni nemico. Nessun danno consuma un'arma su un bersaglio già KO. Un colpo pesante ricevuto può farla cadere; oggetto protetto contro rimbalzi o duplicazioni. Lanciare bat/pipe/board consuma 2 durabilità; cade raccoglibile se ne resta. Bottiglia rotta mai nuovamente raccoglibile. Massimo sei pickup arma presenti per area, con pulizia dei più vecchi fuori vista.

Props: cestino apribile (risorsa preassegnata, niente salute da spazzatura), cassa distruttibile, cartone fragile, porta, cabina, lavabo, transenna, panchina e corrimano. Panchina/corrimano solidi; lavabo e porta danneggiabili soltanto dove dichiarato. Nessuna rottura automatica di ogni oggetto del fondale. Calcio contro cabina: può respingere un nemico adiacente una volta, senza esplosione ad area.

Pickup recupero: snack +15 HP, bevanda +10 HP, kit +35 HP, sempre fino al massimo. Raccolta con interazione, prompt con valore; non consumare se salute piena. In due appare un indicatore del compagno più ferito, ma si può scegliere chi prende. Posizioni fisse definite nei livelli, niente drop casuali. Furia +3 per colpo valido e +6 per KO, cap 100; nessun guadagno da props, civili o training.

## Nemici e coordinamento

HP iniziali: rapido 42, comune 55, armato 65, robusto 90; Fury veterano 145; capo Punks 240. Danni standard 7–14, colpo armato pesante 18. Gli aggettivi indicano statistiche, non una seconda lista di archetipi.

Massimo simultaneo: 4 nemici in singolo, 6 in due; coda di ingressi per gli altri. Attaccanti in avvio/attivo contemporaneamente: 1 in singolo, 2 in due. Dopo 90 ms dalla fine di un attacco può partire un altro assegnatario, con la propria preparazione completa. Da dietro servono avvicinamento visibile e cue; da fuori schermo nessun attacco immediato.

Il coordinatore assegna slot di fianco/fronte, rilasciati se il bersaglio cade. Evitare blocchi da corpo su porte: collider morbidi attore/attore, solidi contro muro. Dopo 3 s senza avvicinamento utile tentare un percorso alternativo; dopo 8 s nemico bloccato fuori vista viene riposizionato in ingresso sicuro, non dentro il giocatore. Debug registra il caso.

Fasi boss/élite da salute residua: 100–60% apprendimento, 60–25% combinazione, meno del 25% pressione. Cambiano sequenze e intervalli, mai la leggibilità minima. Una caduta spezza la combo subita; alzata protetta 700 ms. Non generare supporti senza limite.

## Salute, KO, difficoltà

Salute standard 100, modificatore roster ±15%. Protezione dopo danno 450 ms; dopo rialzata 700 ms. Due colpi subiti consecutivi in 1 s forzano una breve caduta protetta per evitare blocco permanente. Ogni contatto di danno emette un unico evento visivo/sonoro.

KO con compagno disponibile: finestra 10 s; soccorso tenendo interazione per 2 s entro 60/28; danno interrompe e riduce il progresso, massimo 0,8 s conservato. Ritorno al 30% HP e protezione 1,2 s. Se la finestra scade, il compagno rimane fuori dall'incontro e rientra al checkpoint successivo se chi è in piedi completa; nessuna resurrezione automatica sotto i nemici. Se tutti sono KO, retry. Singolo senza CPU: KO → retry immediato. Non esiste morte definitiva di un Warrior per errore ludico.

| Difficoltà | Danno nemico | HP nemici | Retry Storia | Aiuti |
|---|---|---|---|---|
| Facile | ×0,65 | ×0,85 | Illimitati | Prompt più lunghi, finestra soccorso 14 s |
| Normale | ×1 | ×1 | Illimitati | Regole standard |
| Difficile | ×1,20 | ×1,10 | Illimitati | Meno risorse opzionali, stesse telegraph |

Checkpoint ripristina snapshot di entrata: salute, armi, pickup e punteggio coerenti. Dopo due fallimenti si può scegliere l'assistenza (salute piena all'ingresso), senza attivarla di nascosto; risultato segnato assistito. Risorse non farmabili riavviando. Arcade: tre vite, due crediti condivisi, niente ripresa Storia; solo dopo il nucleo campagna.

Punti: contatti e KO una sola volta, moltiplicatore combo fino a ×3; bonus completamento e soccorsi. Nessun punteggio per pestare un civile, per dialoghi saltati o per il fermo di Ajax. Risultato capitolo: tempo giocabile, danni subiti, combo massima, aiuti e retry; scene e C7 senza classifica di velocità.

## Fughe e minacce armate

Escapes: bersaglio è raggiungere la zona sicura. Il timer della pressione riparte dal checkpoint. Veicolo dei Turnbull su corsia superiore separata dal piano: lampeggi, clacson, transenne e finestra per muoversi; nessuna collisione invisibile del bus col gruppo. Gli agenti spingono a proseguire, non si richiede eliminarli tutti.

Lizzies: tiro per corsie anticipate almeno 900 ms, mai un istantaneo hitscan non segnalato. Il giocatore può uscire dalla fascia o ripararsi; cartoni distruttibili non equivalgono a riparo solido. Proiettili simulati veloci ma leggibili, collisione con ripari. Sparatrici presidiano postazioni e si spostano quando serve liberare l'uscita; la loro sconfitta non è requisito. Niente raccolta delle loro pistole.

## Compagni, camera e gruppi

CPU: segue a distanza 90–180, evita il pericolo, entra in un proprio slot, soccorre quando sicuro; non apre porte di capitolo e non consuma kit senza criterio. Se bloccata, recupero su punto navigabile fuori dal combattimento; mai teletrasporto attraverso una minaccia attiva.

Camera condivisa, margine orizzontale 160, niente zoom dinamico che rimpicciolisce tutto. I due non possono separarsi oltre circa 850 unità; indicatore bordo e camera si fermano prima del muro fisico. Aree strette hanno piano y ridotto per entrambi, non hitbox più larghe. Primo piano massimo 20% opacità se copre un attore.

Storia: due slot umani stabili; a cambio gruppo si assegnano due personaggi distinti consentiti, mostrando la scelta per 10 s; poi default leggibile. Lo slot di Ajax/Fox/Cleon mantiene dispositivo e opzioni. In C5C e C7 secondo ruolo Mercy contestuale; nessuna attesa obbligatoria in una schermata mentre l'altro gioca. In singolo CPU sul secondo ruolo. La furia e le armi non si trasferiscono fra due identità: punteggio appartiene allo slot, inventario al personaggio.

## Salvataggi e flusso

Un autosave Storia, checkpoint di segmento sicuro e inizio capitolo. Chiavi warriors-story-v1, warriors-options-v1, warriors-unlocks-v1. Schema: versione, capitolo, checkpoint, incontri conclusi, flag narrativi, roster, record dei personaggi, slot, difficoltà, assistenza, contatori. Nessuna dipendenza da salvataggi primal-*.

Scrittura atomica a snapshot completato, validazione prima di sostituire il vecchio salvataggio, copia di backup. Se storage negato: avviso breve e partita continuabile. Nuova partita richiede conferma perché sostituisce il save. Il checkpoint non salva una pallottola in volo o una presa a metà.

Stati: titolo → menu → selezione → caricamento → scena/traversal/arena/escape → risultato → capitolo. Pausa ammessa in ogni fase attiva; disabilitata soltanto durante il brevissimo commit di transizione. Skip scena: in due voto di entrambi o host con accordo iniziale; applica una sola volta gli stessi flag del termine normale. Zero danni durante caricamento/dialogo/cinematica.

## Input

| Azione | Tastiera 1P | Controller |
|---|---|---|
| Movimento | WASD o frecce | Stick/croce |
| Leggero | J | X |
| Pesante | K | Y |
| Salto | Spazio | A |
| Schivata | Shift | RB |
| Interazione/presa/soccorso | E | B |
| Furia | L | LB |
| Lancia arma | Q | RT |
| Pausa | Esc | Start |

Due tastiere: 1P WASD/F/G/Spazio/Shift sinistro/R/T/V; 2P frecce/Num1/Num2/Num0/Ctrl destro/Num3/Num4/Num5, nell'ordine leggero/pesante/salto/schiva/interazione/furia/lancio. Tutto rimappabile; segnalare rollover hardware, proporre controller, non scartare input silenziosamente. Binding sempre visibili nel tutorial. Controller perso → pausa locale.

## Presentazione e accessibilità

HUD: ritratto/nome, salute, furia, arma/durabilità, prompt attuale; obiettivo breve centrale; barra boss soltanto in C4 e C6. Nessuna minimappa durante le risse; mappa viaggio negli intermezzi. Due HUD allineati, slot con forma oltre al colore.

Sottotitoli italiani attivi di default, dimensione regolabile, etichetta parlante e suoni utili ([treno], [sirena]); indicazioni anche visive per tiro e inseguimento. Volumi musica/effetti/voci separati, shake e flash riducibili, pausa su cambio scheda, tutorial rivedibile. Il gioco non impone rapidità di lettura.

Menu: Gioca/Continua, Capitoli sbloccati, Come si gioca, Opzioni, Crediti. Arcade/Galleria e Online visibili soltanto quando disponibili; nessun pulsante che finga una funzione pronta. Galleria sblocca cinematiche viste e personaggi, senza anticipare l'epilogo.
