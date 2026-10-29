# Inventario di produzione

Baseline 1.0 · 29 ottobre 2026. Inventario dettagliato in [asset_catalog.json](../design/asset_catalog.json), articolazione per capitolo in [LEVELS.md](LEVELS.md), standard in [ART_AND_AUDIO.md](ART_AND_AUDIO.md).

## Conteggi di questa baseline

| Famiglia | Pacchetti | Contenuto |
|---|---:|---|
| Warriors giocabili | 9 | Model, ritratto, corpo, armi, atlas e animazioni |
| Archetipi nemici | 15 | Model, sheet, atlas e animazioni |
| Personaggi narrativi | 8 | Mercy, Cyrus, Luther, Masai, DJ, testimone, poliziotta e capo Orphans |
| Folla e comparse | 6 | Raduno, Riffs, passeggeri, Rogues, agenti e coppia nel treno |
| Aree ambiente | 35 | Fondo, terreno, primo piano, layout e miniatura |
| Cinematiche | 22 | Storyboard, pose e timeline |
| Props | 15 | Oggetti separati con stati e metadati |
| Veicoli | 3 | Bus, treno, veicolo Rogues |
| Oggetti narrativi | 4 | Coltello, pistola Luther, manette, bottiglie Luther |
| Oggetti raccoglibili | 7 | Quattro armi, tre recuperi salute |
| Effetti visivi | 12 | Impatti, rotture e segnali funzionali |
| Interfaccia | 15 | Logo, schermate e input icons |
| Font | 2 | Titoli e testo, file e licenza |
| Musica | 16 | Cue distinti, master/loop da produrre o fornire |
| Ambience | 12 | Loop dei luoghi |
| Effetti sonori | 44 | Unità di suono base, varianti in produzione |
| Dialoghi | 30 | Scene testuali con cue audio e tempi per battuta |
| Bark Warriors | 9 | Un pacchetto contestuale per ciascun Warrior |
| Reference ricevute | 3 | Due tavole e un fondale, esterni alla repo |
| **Totale** | **267** | **264 mancanti e 3 sorgenti ricevuti** |

Il catalogo elenca **684 percorsi di file futuri**, incluse immagini, metadati e audio. Non sono 684 immagini, non sono altrettante generazioni, non sono file già presenti. La condivisione di moduli ambiente e rig riduce il lavoro artistico, ma non elimina i controlli di ogni montaggio.

Animazioni pianificate: nove eroi × 140 frame = 1.260; 15 nemici × 36 frame base = 540, più 108 estensioni definite nel catalogo. Restano pose narrative/cinematiche e varianti da produrre nei rispettivi pacchetti; non sommarle come se fossero già note nel dettaglio di un montaggio finale.

## Materiali ricevuti

| ID | Sorgente | Stato attuale |
|---|---|---|
| source_warrior | de893e_Ji78XOeZR7qVOtHvm4h-Aw_image.png | Tavola Warrior non identificato, otto pose, osservata |
| source_fury | ff5f23_u-HyQjCyQ2SlXXmuL7RWHw_image.png | Tavola Fury, otto pose, osservata |
| source_park | 65bc58_MCatdEcrTfWSAvto3TAplg_image.png | Fondale parco notturno, osservato |

Non ancora importati nel repository, ritagliati, corretti o animati. Il catalogo registra status=source e in_repository=false. I percorsi assets/source/ sono destinazioni future, non dichiarazioni di upload.

## Stati e consegna

missing → source → processed → integrated → verified. Source significa che il materiale esiste come sorgente disponibile; processed richiede esportazione e controlli; integrated richiede caricamento nel gioco; verified richiede osservazione nel caso d'uso. Nessun salto da una descrizione testuale a verified.

Ogni record ha ID stabile e planned_files. Il runtime futuro richiederà file presenti e ID risolti. Per file musicali annotare origine, autore, durata e loop. L'autore dichiara la licenza; i master effettivi, incluso quello del finale, non sono stati forniti in questa sessione.

## Ordine produttivo dopo la progettazione

1. Reference e model sheet Swan/Ajax/Fury; attribuire correttamente o sostituire la tavola Warrior generica.
2. Scala/animazioni/ambiente parco con props realmente separati.
3. Resto dei Warriors e famiglie nemiche, poi pacchetti ambiente secondo ordine campagna.
4. Cinematiche e UI a partire dal copione, riutilizzando asset approvati.
5. Musica, effetti e voci, integrati insieme al relativo capitolo e verificati sul mixer.

Questo ordine non cambia la richiesta dell'autore di avere prima tutte le schede di design. La fase produttiva inizia dopo questa baseline, senza presentare materiale ancora mancante come già consegnato.
