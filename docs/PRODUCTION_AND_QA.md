# Realizzazione e verifica

Baseline 1.0. Questo documento pianifica la futura costruzione. In questa consegna si scrive il design completo, come richiesto; non viene avviato un motore parallelo o presentato un mockup come gioco.

## Confini tecnici

Runtime web statico, distribuibile con GitHub Pages. Nessun backend richiesto per la campagna locale. Sorgenti modulari: input, simulation, combat, ai, encounters, campaign, renderer, assets, audio, save, ui; network dopo il nucleo locale. Contenuti versionati separati dal codice. I JSON in design/ sono specifiche, non configurazioni già consumate da un'applicazione.

La simulazione a 60 Hz produce eventi con ID univoci e snapshot della vista; renderer e audio li consumano senza modificare la salute. Fisica, RNG e orologio sono controllati dall'host in rete. Eventi di scena contengono un completion token: skip e termine naturale non possono caricare due capitoli.

## Contratti dei contenuti

Area: id, tipo, gruppo, ambiente, bounds navigabili, ingressi, incontri, props, pickup, obiettivo, flag richiesti/prodotti, checkpoint, uscita, cue e scene. Uno script evento non deve dedurre l'obiettivo da una stringa tradotta.

Actor: id identità, slot/dispositivo separato, mosse, parametri, animazioni, inventario, stato KO. Roster narrativo e record delle risorse distinti dal personaggio temporaneo che appare in arena.

Asset: id, tipo, pacchetto, percorsi futuri, origine e stato; required IDs del contenuto risolti prima del caricamento. Source significa ricevuto, non pronto. Missing obbligatorio: errore di build/revisione chiaramente indicato, non rettangolo invisibile nel gioco finale.

Scene: timeline, cue voce, sottotitoli, shot, fine e skip deterministico. Props solidi sempre dichiarati; non ricavare collider dal colore dei pixel del fondale.

## Migrazione della reference

1. Fissare il commit studiato e annotare provenienza di ogni routine trasferita.
2. Isolare input/ciclo e geometria prima dei contenuti; rimuovere globali superflue senza ricolorare il gioco originale.
3. Adattare renderer e atlas con un attore di scala corretta, senza inventare un nome al Warrior generico ricevuto.
4. Portare mosse, contatto, prese e oggetti; provare la stessa arena con ogni personaggio.
5. Collegare encounters e campaign secondo le 35 aree; scena e roster non si modificano direttamente dal renderer.
6. Aggiungere save/UI/audio, poi locale a due; online e Arcade dopo la campagna stabile.

## Produzione per fasi

| Fase | Consegna concreta | Uscita verificabile |
|---|---|---|
| D — design | Documenti e cataloghi di questa baseline | Nove schede complete, roster coerente, requisiti tracciati |
| A — art test | Model sheet eroe/Fury, frame reali, montaggio parco | Proporzioni, piedi, bordi e contrasto verificati in movimento |
| B — nucleo | Movimento, camera, mosse, nemico e armi | Nessun colpo duplicato o collider errato, singolo e due |
| C — parco completo | Quattro aree C4 con scena e uscita | C4 completabile, retry e soccorso corretti |
| E — campagna | P0 e C1–C8, intermezzi e save | Run dall'inizio all'epilogo, sei superstiti corretti |
| F — finitura | Asset definitivi, musica, voci, accessibilità | Nessun requisito obbligatorio missing, audio e UI verificati |
| G — estensioni | Arcade, quattro giocatori, rete, touch | Test specifici per modalità; nessun pulsante fittizio |

Le lettere non indicano date né una stima di ore. Non costruire tutte le illustrazioni finali prima di verificare il contratto animazioni, ma il fabbisogno di ciascun livello è già definito.

## Piano delle verifiche del gioco

| ID | Caso | Risultato richiesto |
|---|---|---|
| Q01 | Stesso swing dura più frame | Un solo danno per bersaglio |
| Q02 | Nemico vicino in x ma lontano in y | Nessun colpo falso |
| Q03 | Caduta e rialzata contro muro | Protezione finisce correttamente; niente blocco infinito |
| Q04 | Interazione fra arma, KO e uscita | Prompt deterministico, nessuna raccolta involontaria |
| Q05 | Arma con uno swing su tre nemici | Un solo consumo durabilità |
| Q06 | Disarmo e retry | Una mazza soltanto, stato nemico coerente |
| Q07 | Nemico bloccato fuori campo | Recupero sicuro e incontro completabile |
| Q08 | CPU dietro panchina | Percorso alternativo, non morte da teletrasporto |
| Q09 | KO singolo/uno in due/entrambi | Retry o soccorso secondo regole, nessun softlock |
| Q10 | C1 saltato da giocatore Cleon | Accusa, separazione e cambio slot applicati una volta |
| Q11 | Fine C3 con Fox selezionato | Fox fuori, nuovo Warrior disponibile e punteggio conservato |
| Q12 | C4 e C5A con Ajax selezionato | Cambio gruppo corretto, arresto narrativo non costa vite |
| Q13 | C5 Lizzies non eliminate | Fuga finestra completa comunque il segmento |
| Q14 | C5C in singolo e in due | Swan/Mercy attraversano senza puzzle impossibile |
| Q15 | C6 ingresso leader | Supporti finiti, porta non intrappola attori |
| Q16 | C7 senza input | Nessun timer mortale; uscita raggiungibile e prompt visibile |
| Q17 | C8 skip disarmo ed epilogo | Finale identico, un solo campaign_complete |
| Q18 | Retry dopo aver raccolto kit | Ripristino snapshot senza duplicare risorse/punteggio |
| Q19 | Save corrotto o storage negato | Partita non persa silenziosamente, menu recuperabile |
| Q20 | Pausa/perdita focus/cambio controller | Danni e timer fermi, ripresa controllata |
| Q21 | Dialogo sopra musica e bark | Voce comprensibile, sottotitoli corretti, niente duplicazioni |
| Q22 | Safe area e font grande | HUD e scelte leggibili su risoluzioni previste |
| Q23 | Tutti i nove pacchetti eroe | Piedi fermi, frame nei limiti, arma intera e pivot coerenti |
| Q24 | Run completa senza guide | Obiettivi chiari, tutti i capitoli fino ai crediti |
| Q25 | Online host/client reti differenti | Sync, input, pause, disconnessioni e nessun save corrotto |
| Q26 | Quattro giocatori Arcade | Spawn leggibili, nessun cambio dei gruppi Storia |

Q01–Q24 obbligatori per campagna; Q25–Q26 solo prima di dichiarare le relative estensioni disponibili. Questi sono casi di accettazione progettati, non test già eseguiti.

## Dipendenze produttive e verifiche editoriali

- Identificare la reference esatta di ciascun volto e abito prima dei model sheet; associare correttamente la tavola Warrior ricevuta.
- Verificare cronologia puntuale e montaggio di Fox, Ajax e gruppi sul materiale filmico autorizzato. Non trarre dialoghi definitivi da una prima sceneggiatura non identica al montaggio distribuito.
- Fornire/produrre master musicali, voci e immagini mancanti; i documenti non acquisiscono automaticamente i file.
- Confermare sul test visivo scala, area calpestabile e layering, senza cambiare all'insaputa dell'autore stile o personaggi.
- Validare servizi reali di rete prima dell'online; nessuna garanzia ereditata da PeerJS o relay della reference.

Si tratta di input e controlli necessari alla produzione, non di buchi che impediscono di leggere o valutare il progetto completo.
