# Regia, scene e dialoghi

Baseline 1.0. Testi sotto originali di adattamento, non trascrizioni o citazioni del doppiaggio. Sono una prima sceneggiatura breve completa delle funzioni narrative del gioco. Le battute definitive autorizzate e le voci effettive saranno lavorazioni editoriali successive; i file audio non esistono ancora nella repo.

## Regole di regia

Poche battute per beat, al massimo due righe a schermo. Nessun monologo ripetuto al retry. Le scene hanno un ID, protagonisti, cue, sottotitoli e azione di completamento. La transizione scatta al termine del cue o con skip, mai leggendo il testo del sottotitolo nel codice.

Lingua testo: italiano. Voci: pacchetto italiano se disponibile; eventuali master inglesi con sottotitoli italiani, scelta separata dal volume. Nessuna clonazione vocale necessaria al design. I cue di soccorso e pericolo non si sovrappongono a una battuta di storia: priorità pericolo → trama → commento. Niente scherzi casuali durante un arresto o un omicidio.

Il discorso e i richiami iconici possono usare materiale autorizzato in produzione. In questa sceneggiatura le funzioni sono scritte con parole nuove. L'arresto di Ajax è rappresentato con tensione e responsabilità: niente ricompensa per aggredire la donna, nessuna scelta erotica o minigioco di seduzione.

## P0 — appartenere al gruppo

### dlg_p0_welcome · P0-01
Camera sul ritrovo; ingresso controllato di Cleon.
- Cleon: «Stasera andiamo al raduno. Nove di noi, insieme dall'inizio alla fine.»
- Swan: «Facciamo il viaggio, ascoltiamo e torniamo a casa.»
- Ajax: «Speriamo che parlare basti.»

### dlg_p0_introductions · P0-01, interazioni facoltative
- Snow: «Guarda anche ai lati. Non è sempre davanti che arriva il problema.»
- Cowboy: «Se mi vedi rallentare, dammi una voce.»
- Cochise: «Restiamo vicini e nessuno ci chiude in un angolo.»
- Vermin: «Vorrei già essere sul treno del ritorno.»
- Rembrandt: «È davvero la prima volta che si ritrovano tutti?»
- Fox: «Per questo conviene ricordarsi da dove si entra. E da dove si esce.»

### dlg_p0_training · P0-02/03
Battute condizionali, una per lezione.
- Cleon: «Avvicinati. Prima controlla la distanza, poi colpisci.»
- Cleon: «Non restare fermo davanti al colpo. Spostati di lato.»
- Swan: «Quando un compagno va giù, aiutalo appena hai spazio.»
- Cleon: «Basta così. Prendiamo la metro.»

### dlg_p0_departure · cine_departure
Il gruppo attraversa l'accesso, dettaglio rotaie, titolo su nero. Nessuna battuta aggiuntiva, lasciare lavorare il suono.

## C1 — perdere la guida

### dlg_c1_arrival · C1-01
- Rembrandt: «Non pensavo ci fosse tutta questa gente.»
- Cleon: «Osservate. E ricordatevi perché siamo qui.»

### dlg_c1_cyrus · cine_cyrus
Scaletta di regia: campo largo delle delegazioni; Cyrus sul palco; reazioni dei Warriors; la tregua sembra possibile.
- Cyrus, adattamento provvisorio: «Ci dividono poche strade. Se smettiamo di consumarci gli uni contro gli altri, questa città dovrà ascoltarci.»
La scena lascia un breve spazio di risposta alla folla. Il master autorizzato può sostituire questo testo senza cambiare gli eventi del gioco.

### dlg_c1_accusation · cine_accusation
Sparo, folla che si piega, Luther che indica il gruppo. Nessun fermo immagine trionfale.
- Luther: «Sono stati loro! Fermate i Warriors!»
- Swan: «Via da qui! Non fermatevi!»

### dlg_c1_leadership · cine_swan_leads
- Cowboy: «Cleon non è con noi.»
- Ajax: «E adesso chi decide?»
- Swan: «Adesso torniamo a Coney Island. Tutti quelli che sono qui.»
Non certificare la sorte di Cleon con informazioni che il gruppo non possiede.

## C2 — arrivare al treno

### dlg_c2_bus · C2-01
- Fox: «Quel bus ci sta seguendo.»
- Snow: «La scala è dall'altra parte. Muoviamoci.»

### dlg_c2_run · C2-03/04
- Swan: «Lasciateli indietro. Alla metro!»
- Cowboy, solo se un compagno è distante: «Aspettate, ci siamo quasi!»
- Vermin, porte in vista: «Quel treno non lo perdiamo.»
Il richiamo non costituisce un timer supplementare nascosto.

## C3 — tregua fragile

### dlg_c3_orphans · C3-01
- Capo Orphans: «State attraversando il nostro territorio.»
- Swan, risposta calma: «Ci serve soltanto un passaggio.»
- Swan, risposta ferma alternativa: «Non siamo venuti a cercarvi. Lasciateci andare.»
- Mercy: «Sono loro quelli di cui si parla stanotte?»
- Ajax: «Se volevano discrezione, hanno scelto male la notte.»
Le due risposte cambiano una replica del capo, non aprono due campagne.

### dlg_c3_breakaway · C3-02/03
- Swan: «Abbiamo il varco. Via!»
- Mercy: «Vengo con voi.»
- Swan: «Allora tieni il passo.»

### dlg_c3_police · cine_police_split
Passi sulle scale, agenti, tagli rapidi e separazione. La sorte di Fox è trattata ellitticamente; lo stato del gioco lo segna uscito dalla storia. Non aggiungere una battuta esplicativa mentre gli altri non possono saperlo.
- Swan: «Al punto di ritrovo! Se ci dividiamo, andate là!»

## C4 — quando la fuga finisce

### dlg_c4_silence · cine_furies_appear
Primo piano trucco e mazza; nessuna battuta dei Furies.
- Cowboy, sottovoce: «Ci aspettavano.»
- Swan: «Nel parco. Restate insieme.»

### dlg_c4_stand · C4-02/03
- Ajax: «Adesso basta correre.»
- Snow: «Tieni d'occhio le mazze.»
Il gioco insegna con preparazioni e distanze, non con una pausa di dialogo a ogni nemico.

### dlg_c4_split · cine_ajax_stays
- Swan: «Dobbiamo ripartire.»
- Ajax: «Voi andate. Vi raggiungo.»
- Cowboy: «Non è il momento di restare soli.»
Segue la separazione; nessuna opzione salva Ajax mantenendo il finale fedele.

## C5 — tre percorsi

### dlg_c5_arrest · cine_ajax_arrest
Panchina, ignorati segnali di allontanamento, rivelazione del distintivo, agenti e manette. Regia breve, nessun controllo di Ajax durante l'episodio.
- Poliziotta: «Fermo. Sei in arresto.»
- Snow, nel raccordo dopo: «Non possiamo fermarci qui.»

### dlg_c5_welcome · C5-02
- Lizzie: «Qui potete riposarvi. Fuori vi stanno cercando tutti.»
- Vermin: «Finalmente una buona notizia.»
- Rembrandt, osservando la porta: «Perché l'hanno chiusa?»

### dlg_c5_trap · cine_lizzies_trap e C5-03
- Lizzie: «Sappiamo chi siete.»
- Rembrandt: «Alla finestra! Adesso!»
- Cochise: «Apriteci un passaggio!»
Rivelazione, musica cambia e comincia la fuga. La finestra è obiettivo visibile prima del primo sparo.

### dlg_c5_mercy · cine_swan_mercy / C5-04
- Mercy: «Quando arrivi a casa, finisce davvero?»
- Swan: «Prima ci dobbiamo arrivare.»
- Mercy: «Non hai risposto.»
- Swan, dopo un tratto in silenzio: «Lo so.»
Spazio ai passi e alle pause; niente raccolte o nemici per interrompere il momento.

### dlg_c5_rendezvous · cine_reunion_approach
- Cowboy: «Ajax l'hanno preso.»
- Swan: «Gli altri?»
- Snow: «Stanno andando alla stazione.»
La scena passa alle entrate degli altri tre; sei Warriors identificabili, più Mercy.

## C6 — ancora insieme

### dlg_c6_reunion · cine_reunion
- Vermin: «La prossima volta scegliete voi dove fermarci.»
- Rembrandt: «Siamo usciti per poco.»
- Swan: «Siete qui. Ora troviamo l'ultimo treno.»

### dlg_c6_punks · cine_punks_confrontation
Capo Punks osserva, sbarra il passaggio; niente lungo discorso da antagonista.
- Snow: «Anche questi vogliono fermarci.»
- Swan: «Allora facciamoci spazio.»

### dlg_c6_truth · cine_truth_reaches_riffs
- Testimone: «Ho visto chi ha sparato. Non era uno dei Warriors.»
- Masai: «Dimmi chi era.»
La verità arriva ai Riffs indipendentemente da punteggi e collezionabili; non richiede trovare un documento nascosto.

## C7 — il peso della notte

### dlg_c7_train · cine_train_dawn / C7-01
- Mercy: «È quasi giorno.»
- Swan: «Sì.»
- Mercy: «Non sembra la stessa città.»
Passeggeri eleganti si spostano; sguardi e silenzi. Non trasformare l'incontro in una provocazione giocabile.

### dlg_c7_home · cine_home_arrival
- Cowboy: «La prossima è casa.»
- Vermin: «Era ora.»
L'arrivo riprende il punto di vista della partenza con il cambio di luce.

## C8 — tornare a casa

### dlg_c8_bottles · cine_bottles
Tre bottiglie, ritmo e avvicinamento del veicolo. Richiamo di Luther dal materiale autorizzato, se disponibile; variante originale provvisoria:
- Luther: «Warriors! Siamo venuti fin qui per voi!»
- Swan: «Finisce sulla spiaggia.»

### dlg_c8_confrontation · cine_disarm
- Swan: «Sappiamo chi ha sparato.»
- Luther: «E pensi che cambierà qualcosa?»
Pistola, pausa, azione di disarmo. Nessuna scelta per sparare a Luther o cambiare finale.

### dlg_c8_riffs · cine_riffs_arrival
- Masai: «Sappiamo cos'è successo. Con voi abbiamo finito.»
I Riffs prendono il controllo della situazione; i Warriors si allontanano. Evitare uno scontro aggiuntivo dopo la risoluzione.

### dlg_c8_epilogue · cine_epilogue
Nessuna battuta obbligatoria. Mare, luce dell'alba, camminata di Swan/Mercy e degli altri. Musica finale e crediti. Chi lascia finire i titoli non riceve un vantaggio ludico rispetto a chi li salta.

## Bark contestuali, massimo uno ogni 8 secondi per gruppo

| ID | Contesto | Testo originale |
|---|---|---|
| bark_help | KO con soccorso possibile | «Datemi una mano!» |
| bark_revived | Soccorso riuscito | «Ci sono. Andiamo.» |
| bark_flank | Nemico sul fianco | «Alla tua sinistra!» / «Alla tua destra!» |
| bark_weapon | Prima arma caduta | «La mazza è a terra!» |
| bark_exit | Uscita raggiungibile | «Il passaggio è libero!» |
| bark_wait | Compagno distante | «Restiamo insieme.» |
| bark_reload | Primo intervallo di tiro Lizzies | «Ora! Muovetevi!» |

Silenziare bark casuali sotto le scene principali. Le indicazioni sinistra/destra sono riferite allo schermo e calcolate, non riprodotte a caso.

## Produzione delle scene

22 pacchetti cinematici, elencati automaticamente nel catalogo asset a partire da LEVELS.md. Ogni pacchetto include storyboard (3–6 inquadrature principali, non necessariamente immagini tutte nuove), fondali/pose riutilizzabili, timeline, cue e sottotitoli. Nessuna durata nascosta necessaria per attivare il flag: scena ha evento di conclusione esplicito.

La progettazione narrativa è completa come prima stesura; la registrazione, l'editing dei testi, la fedeltà visiva e l'integrazione sono lavorazioni produttive da verificare separatamente.
