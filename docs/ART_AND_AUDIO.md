# Direzione visiva, interfaccia e audio

Baseline 1.0. Stile di lavoro proposto: personaggi 2D illustrati e ritagliati con volumi leggibili, coerenti con le tavole ricevute; ambienti notturni pittorici dettagliati. Non chiamarlo pixel art 16-bit se i materiali hanno questo trattamento. Evitare mischiare sprite miniaturizzati, fondali realistici e HUD da supereroi.

## Personaggi e animazione

Model sheet per ognuno dei nove Warriors e per ogni famiglia nemica. Palette: pelle/capelli/abiti dalle reference del personaggio, gilet e stemma fedeli e coerenti fra vista frontale e posteriore. Accessori caratterizzanti come cappello e acconciature rimangono coerenti fra pose. Il modello viene confrontato con reference autorizzate prima della produzione delle tavole; la tavola generica ricevuta non stabilisce da sola il volto di Swan o Ajax.

Altezza apparente media in viewport: circa 170–200 unità da piedi a testa per personaggio eretto; differenze naturali entro 15%. Tavole sorgenti ad alta risoluzione, riduzione coerente nel renderer. Ancoraggio piedi e asse bacino definiti per frame; niente stretch per far entrare una posa nella cella. Orientamento opposto: mirror ammesso per prototipo, ma stemmi/testi/accessori asimmetrici richiedono controllo e, se necessario, pose dedicate.

Pacchetto eroe base: **100 frame per personaggio** prima delle estensioni per armi. Ripartizione:

| Azione | Frame |
|---|---:|
| Guardia | 5 |
| Cammino | 6 |
| Corsa | 6 |
| Tre leggeri, 4 ciascuno | 12 |
| Pesante | 6 |
| Stacco / aria / atterraggio | 6 |
| Calcio volante | 4 |
| Schivata | 5 |
| Ingresso presa | 3 |
| Colpo in presa | 4 |
| Lancio | 6 |
| Raccolta | 3 |
| Colpito | 3 |
| Caduta / KO | 5 |
| Rialzata | 4 |
| Soccorso | 4 |
| Vittoria | 3 |
| Furia | 8 |
| Attacco in corsa | 4 |
| Rilascio presa | 3 |

Totale base 100. Armi per eroe: bat, pipe, board = 12 frame ciascuna (guardia 2, movimento 4, leggero 3, pesante 3); lancio comune oggetto 4. Totale **140 frame/eroe**, 1.260 per nove, prima di eventuali versioni asimmetriche e rifiniture. Bottiglia usa raccolta e lancio, non un moveset aggiuntivo. Sono frame di produzione pianificati, non un numero promesso di immagini già generate.

Nemico base: 36 frame (guardia4, cammino6, preparazione3, attacco4, recupero3, colpito3, caduta4, rialzata3, KO2, ingresso4). Estensioni: armi, disarmo, presa, tiro e leader secondo catalogo. Non tutti i 15 archetipi richiedono quindici corpi diversi: quattro famiglie possono condividere rig e struttura, conservando identità visiva e animazioni degli attacchi.

## Ambienti

35 pacchetti area. Ogni pacchetto contiene back.png, ground.png, front.png, layout.json e thumbnail.jpg. Tre livelli artistici non significano cinque illustrazioni completamente nuove: le aree condividono moduli e geometria del luogo, ma ogni pacchetto ha un montaggio verificabile.

Famiglie ambiente: Coney sera/alba; raduno Bronx; strade Bronx; Orphans; metro/accessi; parco; appartamento; tunnel; Union Square/bagni; vagone; spiaggia. Cambi luce non devono cambiare posizione di porte e scale. La fotografia del parco ricevuta è reference di scala/atmosfera, non una mappa collisioni pronta. Il lungofiume non impone da solo una denominazione topografica canonica.

Fondale sopra l'orizzonte, terreno separato e pulito, primo piano con maschera. Props interattivi staccati dal fondo: se panchina/cestino dipinti vengono anche duplicati come oggetti, rimuovere o coprire l'originale nel montaggio approvato. Nessun segnale d'uscita nascosto da un personaggio alto.

## Props e FX

Props: panchina, cestino, cassa, cartoni, porta normale, porta cabina, lavabo, transenna bassa, cancello, finestra, riparo solido appartamento, seduta treno, tornello aperto, corrimano, staccionata. Stati richiesti: integro e rotto dove applicabile; collider dichiarato e ancoraggio terreno.

Veicoli: bus Turnbull, treno/vagone porte, veicolo Rogues. Coltello di Swan, pistola Luther, manette e bottiglie di Luther sono oggetti narrativi, separati dal sistema pickup. Nessun attore trova casualmente il coltello finale nell'inventario.

FX: impatto mano, impatto legno, polvere, legno rotto, vetro, porcellana, scintilla breve non magica, sparo, fumo incendio, onda visiva disarmo, soccorso, punto d'uscita. Sottotitoli e telegraph restano leggibili anche con flash ridotti.

## Interfaccia e schermate

Logo titolo, titolo/menu, mappa del viaggio con nove tappe, scheda personaggio, HUD 1P/2P, pausa, opzioni, tutorial, caricamento, cambio gruppo, retry, risultato capitolo, risultato campagna e crediti. Le icone di input sono vettoriali o atlas nitido; prompt cambiano con binding e dispositivo.

Palette UI: bruno scuro/nero, avorio e accento ambra; rosso per danno e minaccia, non per ogni decorazione. Font locale leggibile per dialoghi, display più marcato solo titoli. Safe area mobile e overscan del 5%; non costruire l'interfaccia definitiva prima di provarla sul viewport scelto.

## Musica

16 cue progettati: mus_title, mus_p0, mus_c1_discourse, mus_c1_escape, mus_c2, mus_c3, mus_c4_chase, mus_c4_fight, mus_c5_welcome, mus_c5_escape, mus_c5_quiet, mus_c6, mus_c7, mus_c8, mus_finale, mus_results.

File di master autorizzati oppure composizioni nuove con atmosfera urbana rock/funk/tensione. Il materiale effettivo va fornito o prodotto: nessun file musicale è stato consegnato. Il brano finale del film è previsto come destinazione editoriale; non scaricare una registrazione casuale o dichiarare che sia già presente.

Cue con loop start/end dichiarati; titolo e risultati separati. Una sola musica principale attiva, due soltanto nel crossfade massimo 1,5 s. Parlato riduce la musica di circa 8 dB, poi risalita 500 ms. Pausa conserva posizione; ritorno titolo arresta tutti gli eventi della partita. Intro del brano riparte solo quando la regia lo richiede.

## Ambience ed effetti

12 loop ambiente: quartiere sera, quartiere alba, raduno, strada, metro, parco, appartamento, tunnel, bagno, treno in moto, mare, vento spiaggia. Gli ambienti simili condividono layer senza suonare come lo stesso livello.

Set effetti: pugno leggero/pesante, calcio, impatto legno/metallo/corpo, quattro famiglie passi, caduta/rialzata, respiro, raccolta, rottura arma, lancio, disarmo, soccorso, porta, cancello, vetro, porcellana, transenna, bus/clacson, treno/porte/freni, sirena, folla, sparo, manette, bottiglie, mare di raccordo e otto suoni UI. Variazioni alternate per evitare mitragliamento dello stesso sample.

Master WAV 48 kHz, esportazioni compatibili browser (MP3 per musica/voci, OGG facoltativo; effetti brevi WAV/MP3 secondo memoria). Picco finale sotto -1 dBTP e loudness controllata fra cue; nessuna normalizzazione automatica che renda una battuta più forte di un allarme. Non caricare tutti i master non compressi prima del titolo.

## Voci e sottotitoli

Un pacchetto per parlante del copione e un pack bark con varianti per Warriors. Associare line ID, speaker, testo italiano, file audio, durata e pause; se l'audio manca la timeline usa il testo ma lo stato resta missing, non doppiato. Nessun parlato sintetico di Primal ereditato per errore.

## Asset ricevuti

Tre sorgenti esterni osservati: tavola Warrior non identificato (otto pose), tavola Fury giallo/nero (otto pose), fondale parco notturno. Nessun ritaglio, nuovo frame, correzione o upload binario eseguito in questa fase di progettazione. File registrati come source con in_repository=false nel catalogo. Le richieste di revisione delle immagini si faranno con gli strumenti di immagine nella fase produttiva, non trasformando una descrizione in un asset inesistente.
