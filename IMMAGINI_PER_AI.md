# ISTRUZIONI PER UN'AI: CREARE LE IMMAGINI DEL GIOCO

Questo file è scritto per un assistente AI con generazione di immagini e accesso in scrittura a questo repository (b3pz/The_Warriors). Se sei quell'assistente: leggilo tutto, poi lavora da solo seguendo l'elenco, senza chiedere conferma per ogni immagine.

## Il gioco

The Warriors · Night Run è un beat 'em up a scorrimento laterale nel browser. New York, una sola notte del 1979: la banda dei Warriors viene accusata di un omicidio che non ha commesso e deve attraversare la città dal Bronx a Coney Island, inseguita da tutte le altre bande. L'autore del gioco detiene la licenza. Grafica approvata: pixel art 16-bit (vedi `assets/source/raccolta_04/` per lo stile di riferimento, se riesci ad aprire le immagini).

## Cosa devi fare

1. Prendi dall'**elenco di lavoro** (sotto) le immagini nell'ordine dato.
2. **Salta** ogni file che esiste già nel repository (controlla il percorso prima di generare).
3. Genera ogni immagine rispettando lo **stile** e le **regole tecniche**.
4. Carica i file nel percorso indicato, **solo dentro `assets/incoming/`**. Raggruppa 5–20 immagini per commit, messaggio `Immagini in arrivo: <cosa>`. Se non puoi scrivere su `main`, apri una pull request con lo stesso titolo.
5. Quando finisci la sessione, scrivi all'utente l'elenco dei file caricati e il punto dell'elenco a cui sei arrivato.

Divieti:
- NON modificare, spostare o cancellare nessun file fuori da `assets/incoming/` (codice, documenti, grafica già in uso). Un altro assistente (Claude) integra le immagini nel gioco e lavora su quei file.
- Niente testo, scritte, loghi, marchi, firme o filigrane nelle immagini.
- I personaggi devono essere **fedeli ai personaggi del film**: costume, capelli, corporatura, colori, oggetti e atteggiamento. La fedeltà si ottiene partendo dalle **immagini di riferimento** e dal **modello approvato** di ciascuno (fase 0), non inventando.

## Stile (vale per tutte le immagini)

- Pixel art 16-bit da sala giochi anni '90: contorni scuri netti, ombreggiatura a bande, nessuna sfumatura morbida, nessun effetto pittorico o fotografico.
- Palette notturna e cupa: blu petrolio, viola, marroni; luce gialla dei lampioni e rossa dei neon. All'alba: rosa e arancio pallido.
- Atmosfera da film di strada anni '70: sporco, graffiti, vapore dai tombini, metropolitana.
- Vista laterale, come in un picchiaduro a scorrimento.

## Regole tecniche

- **Personaggi, oggetti, ritratti**: un solo soggetto per immagine, figura intera dalla testa ai piedi, **sfondo piatto magenta puro #FF00FF** (niente ombre a terra, niente pavimento), rivolto verso **destra**, centrato, piedi a circa il 90% dell'altezza, **1024×1024**. Un uomo adulto alto circa l'80% dell'immagine, sempre la stessa scala.
- **Coerenza**: lo stesso personaggio deve essere identico in tutte le pose (capelli, vestiti, colori, corporatura). Ogni posa si genera allegando il modello approvato `assets/incoming/modelli/<set>.png` e chiedendo «lo stesso personaggio di questa immagine, nella posa: …». Se una posa non somiglia al modello, rigenerala prima di caricarla.
- **Fondali e scene**: orizzontali **1536×1024**, nessun personaggio nei fondali. Nei fondali il pavimento calpestabile (marciapiede, banchina, sentiero) occupa la fascia bassa, dal 65% dell'altezza fino al fondo, piatto e libero. I pezzi `_b`, `_c` di un fondale continuano verso destra il pezzo precedente: stessa luce, stessa linea del pavimento.
- Formato PNG. Nome del file esattamente come nell'elenco.

## Materiale di riferimento fornito dall'autore

Aprilo prima di disegnare: è il modo per restare fedeli al film.

- `assets/incoming/riferimenti/gruppo_warriors_coney.png`: **la foto di riferimento principale.** I Warriors e Mercy a Coney Island: gilet di pelle marrone-rossiccio con bordo scuro, petto nudo, pantaloni rossicci o neri, cinture con fibbia, scarpe da ginnastica o stivali. Da sinistra: Cowboy (cappello scuro, mazza), Rembrandt (afro, borsa a tracolla), Cochise (collane di perline, fascia, stivali con frange), Vermin (ricci, dietro), Swan (al centro), Snow (afro), Mercy (giacca di jeans scura sopra il top rosa e la gonna a fiori: aspetto dai tunnel in poi).
- `assets/incoming/riferimenti/<set>_1.png`, `_2`, `_3`: fotogrammi del film per swan, ajax, snow, fox, cleon, cochise, vermin, cowboy, rembrandt, mercy, luther, cyrus, fury, punk. Usali per capelli, costume, colori ed espressione. Alcuni `_2` sono personaggi di un altro videogioco sul film: vanno bene per il costume intero, non per lo stile.
- `assets/incoming/riferimenti/mappe/bande_collage_*.png`: le bande del film insieme (Rogues, Furies, Lizzies, Punks, Boppers, Hi-Hats, Electric Eliminators e altre).
- `assets/incoming/riferimenti/<set>.png` (sfondo magenta): le figure già approvate nel gioco, da usare per proporzioni e stile pixel.
- `assets/incoming/riferimenti/luoghi/`: i luoghi del film. `raduno_*` (il raduno nel nord del Bronx: anfiteatro con arcate di pietra, folla sugli spalti, Cyrus sul palco con la veste), `union_square_scale` (scala piastrellata bianca della stazione), `strada_notte` e `strada_orphans` (strade bagnate di notte, palazzi di mattoni, scale antincendio), `spiaggia_riffs` (la spiaggia all'alba), `coney_lungomare` e `coney_wonder_wheel` (Coney Island: ruota panoramica, chioschi, lungomare).
- `assets/incoming/riferimenti/mappe/`: dove sta ogni banda (Furies a Riverside, Lizzies a Union Square, Punks al Bowery, Orphans a Tremont, Turnbull a Gun Hill, Riffs a Gramercy, Rogues a Hell's Kitchen) e i loro loghi: utili per colori e stile delle bande.

## Personaggi

Tutti i Warriors portano un gilet di pelle marrone senza maniche, senza scritte.

| Set | Descrizione |
|---|---|
| `idle_1` | in guardia, fermo, pugni alzati, peso sulle gambe |
| `punch_1` | pugno diretto a braccio teso |
| `kick_1` | calcio frontale alto |
| `heavy_1` | gancio potente con tutto il corpo |
| `jump_1` | in salto, ginocchia raccolte |
| `jumpkick_1` | calcio volante |
| `hurt_1` | colpito, testa all'indietro, smorfia |
| `down_1` | a terra, sdraiato sulla schiena (la figura è orizzontale) |
| `getup_1` | si rialza, un ginocchio a terra |
| `grab_1` | afferra qualcuno davanti a sé per il bavero |
| `throw_1` | scaraventa via qualcuno |
| `dodge_1` | schivata, piegato all'indietro |
| `pipe_swing_1` | colpo con un tubo di ferro |
| `revive_1` | inginocchiato che aiuta un compagno a terra |
| `sit_1` | seduto su un sedile della metro |
| `swan` | uomo bianco sui vent'anni, statura media, asciutto e atletico; capelli castano chiaro lisci di media lunghezza pettinati all'indietro; gilet di pelle marrone aperto sul petto nudo, jeans, stivali |
| `ajax` | uomo bianco, alto e massiccio; capelli castano scuro corti; guanti di pelle senza dita; espressione provocatoria; gilet di pelle marrone sul petto nudo, jeans |
| `snow` | uomo afroamericano, alto, braccia lunghe; capigliatura afro altissima e squadrata; espressione calma; gilet di pelle marrone, pantaloni scuri |
| `cowboy` | uomo bianco giovane, statura media, viso da ragazzo, capelli castani lisci fino al collo; cappello scuro a tesa larga sempre in testa; maglietta marrone sotto il gilet di pelle, pantaloni marroni, scarpe da ginnastica |
| `cochise` | uomo afroamericano, medio-alto e agile; treccine e afro, fascia sulla fronte, collana di perline; gilet di pelle marrone sul petto nudo, pantaloni a zampa |
| `vermin` | uomo bianco tarchiato e robusto; capelli castani corti e spettinati; faccia stanca e scocciata; gilet di pelle marrone, maglietta, jeans |
| `rembrandt` | ragazzo ispanico, il più giovane e minuto del gruppo; grande afro castano scuro; collarino rosso al collo; gilet di pelle sul petto nudo, pantaloni rossicci a zampa; borsa a tracolla con le bombolette spray |
| `fox` | uomo bianco esile e slanciato; capelli biondo-castani ricci e folti; aria da ragazzo di buona famiglia; gilet di pelle marrone, camicia aperta |
| `mercy_giacca` | Mercy dai tunnel della metro in poi: stessa ragazza, stesso top rosa e gonna a fiori, con sopra una giacca di jeans blu scuro troppo grande; vedi la foto di gruppo |
| `cleon` | uomo afroamericano alto, robusto e imponente; bandana leopardata in testa, capelli rasati ai lati; sguardo severo da capo; gilet di pelle marrone |
| `mercy` | ragazza giovane, magra e minuta; capelli castano scuro mossi e vaporosi fino alle spalle; top rosa a canottiera con collana sottile, gonna a fiori rosso scuro al ginocchio con spacco, sandali col tacco (aspetto della notte) |
| `fury` | membro di una banda vestita da squadra di baseball: divisa a righe sottili bianca, berretto nero, maglia nera a maniche lunghe sotto, calzettoni neri; il viso dipinto come una maschera di un solo colore (giallo, rosso, bianco, blu o nero con bordi bianchi); mazza da baseball |
| `fury_boss` | come sopra, il capo: più grosso, trucco a due colori più vistoso |
| `turnbull` | skinhead calvo e grosso, canotta di jeans senza maniche, catene |
| `turnbull_fast` | skinhead calvo magro e veloce |
| `orphan` | ragazzo di strada povero, maglietta sdrucita, nessun colore di banda |
| `sully` | capo degli Orphans, maglietta e giubbotto di jeans, aria spavalda |
| `lizzie` | ragazza di una banda femminile anni '70: capelli ricci e voluminosi, top colorati e giacche anni '70, aria seducente e pericolosa |
| `lizzie_boss` | la capa delle Lizzies: capelli lunghi ricci, giacca scura, aria sicura |
| `punk` | punk di strada: salopette di jeans sopra una maglia a righe orizzontali, capelli lunghi, **pattini a rotelle** ai piedi |
| `punk_boss` | capo dei Punks: più grosso, salopette di jeans e maglia a righe, pattini |
| `rogue` | membro dei Rogues: gilet o giubbotto di pelle nera, maglietta scura, berretto, aria folle |
| `luther` | capo dei Rogues: magro, capelli castani ricci lunghi fino alle spalle, fascia intrecciata sulla fronte, gilet di pelle nera sopra una maglietta grigia, catenine, pantaloni neri; sorriso folle |
| `police` | poliziotto di New York anni '70, divisa blu, berretto |
| `police_woman` | poliziotta in borghese seduta su una panchina, aria innocua |
| `cyrus` | carismatico capo dei Riffs e della banda più grande della città: capelli neri pettinati all'indietro, lunga veste a quadri marrone e rame aperta su una camicia nera, pantaloni neri; braccia aperte mentre parla dal palco |
| `riff` | membro di una banda disciplinata in tenuta da arti marziali |
| `masai` | luogotenente dei Riffs, tenuta da arti marziali scura, sguardo duro |

## Fase 0: il modello di ogni personaggio (prima di tutto il resto)

Nessuna posa si genera prima che l'autore abbia approvato il modello del personaggio.

1. Per ogni set dell'elenco di lavoro, crea **un foglio modello**: lo stesso personaggio tre volte affiancato (di fronte, di profilo verso destra, di spalle), figura intera, fedele alle foto di riferimento, sfondo magenta #FF00FF, 1536×1024, pixel art 16-bit. Salvalo in `assets/incoming/modelli/<set>.png`.
2. Se esiste `assets/incoming/riferimenti/<set>.png`, aprilo e **usalo come base**: sono le figure già approvate dall'autore nel gioco. Il modello deve essere lo stesso personaggio (stessi capelli, vestiti, colori, proporzioni), solo più pulito e completo. Se l'autore ha caricato altro materiale di riferimento in `assets/incoming/riferimenti/` (es. `<set>_1.jpg`), usalo insieme alla descrizione.
3. Dopo i modelli fermati e scrivi all'utente: «Modelli pronti per: …». L'autore li guarda e scrive i set approvati in `assets/incoming/modelli/APPROVATI.md`.
4. Genera le pose di un set **solo se compare in `APPROVATI.md`**, e allega sempre il suo modello come riferimento a ogni immagine di quel set. Se un modello viene rifiutato o modificato dall'autore, rifallo prima di andare avanti.

Lo stesso vale per i fondali: prima un'immagine `assets/incoming/modelli/fondale_<area>.png` per tre aree campione (C2-01 strada, C4-02 parco, C6-01 banchina), poi gli altri solo quando `APPROVATI.md` contiene la riga `fondali`.

## Elenco di lavoro (in ordine di priorità)

Ogni riga: percorso del file → cosa disegnare. Il prompt per un personaggio è: *«[descrizione del set] — posa: [posa]. Stesso personaggio delle immagini precedenti. Sfondo magenta piatto #FF00FF, rivolto a destra, figura intera, 1024×1024, pixel art 16-bit.»*


### 1. I Warriors che oggi non hanno nessuna figura (Ajax, Vermin, Cleon)

1. `assets/incoming/personaggi/ajax/idle_1.png` → ajax, in guardia, fermo, pugni alzati
2. `assets/incoming/personaggi/ajax/walk_1.png` → ajax, camminata, fotogramma 1 di 4: gamba destra avanti
3. `assets/incoming/personaggi/ajax/walk_2.png` → ajax, camminata, fotogramma 2 di 4: gambe vicine, passaggio
4. `assets/incoming/personaggi/ajax/walk_3.png` → ajax, camminata, fotogramma 3 di 4: gamba sinistra avanti
5. `assets/incoming/personaggi/ajax/walk_4.png` → ajax, camminata, fotogramma 4 di 4: passaggio
6. `assets/incoming/personaggi/ajax/punch_1.png` → ajax, pugno diretto a braccio teso
7. `assets/incoming/personaggi/ajax/kick_1.png` → ajax, calcio frontale alto
8. `assets/incoming/personaggi/ajax/heavy_1.png` → ajax, gancio potente con tutto il corpo
9. `assets/incoming/personaggi/ajax/jump_1.png` → ajax, in salto, ginocchia raccolte
10. `assets/incoming/personaggi/ajax/hurt_1.png` → ajax, colpito, testa all'indietro, smorfia
11. `assets/incoming/personaggi/ajax/down_1.png` → ajax, a terra, sdraiato sulla schiena (figura orizzontale)
12. `assets/incoming/personaggi/ajax/getup_1.png` → ajax, si rialza, un ginocchio a terra
13. `assets/incoming/personaggi/ajax/novest_idle_1.png` → ajax, senza gilet, a petto nudo, in guardia
14. `assets/incoming/personaggi/ajax/novest_punch_1.png` → ajax, senza gilet, a petto nudo, pugno
15. `assets/incoming/personaggi/ajax/arrest_1.png` → ajax, a terra, ammanettato
16. `assets/incoming/personaggi/vermin/idle_1.png` → vermin, in guardia, fermo, pugni alzati
17. `assets/incoming/personaggi/vermin/walk_1.png` → vermin, camminata, fotogramma 1 di 4: gamba destra avanti
18. `assets/incoming/personaggi/vermin/walk_2.png` → vermin, camminata, fotogramma 2 di 4: gambe vicine, passaggio
19. `assets/incoming/personaggi/vermin/walk_3.png` → vermin, camminata, fotogramma 3 di 4: gamba sinistra avanti
20. `assets/incoming/personaggi/vermin/walk_4.png` → vermin, camminata, fotogramma 4 di 4: passaggio
21. `assets/incoming/personaggi/vermin/punch_1.png` → vermin, pugno diretto a braccio teso
22. `assets/incoming/personaggi/vermin/kick_1.png` → vermin, calcio frontale alto
23. `assets/incoming/personaggi/vermin/heavy_1.png` → vermin, gancio potente con tutto il corpo
24. `assets/incoming/personaggi/vermin/jump_1.png` → vermin, in salto, ginocchia raccolte
25. `assets/incoming/personaggi/vermin/hurt_1.png` → vermin, colpito, testa all'indietro, smorfia
26. `assets/incoming/personaggi/vermin/down_1.png` → vermin, a terra, sdraiato sulla schiena (figura orizzontale)
27. `assets/incoming/personaggi/vermin/getup_1.png` → vermin, si rialza, un ginocchio a terra
28. `assets/incoming/personaggi/vermin/turnstile_1.png` → vermin, scavalca un tornello della metro con un salto
29. `assets/incoming/personaggi/cleon/idle_1.png` → cleon, in guardia, fermo, pugni alzati
30. `assets/incoming/personaggi/cleon/walk_1.png` → cleon, camminata, fotogramma 1 di 4: gamba destra avanti
31. `assets/incoming/personaggi/cleon/walk_2.png` → cleon, camminata, fotogramma 2 di 4: gambe vicine, passaggio
32. `assets/incoming/personaggi/cleon/walk_3.png` → cleon, camminata, fotogramma 3 di 4: gamba sinistra avanti
33. `assets/incoming/personaggi/cleon/walk_4.png` → cleon, camminata, fotogramma 4 di 4: passaggio
34. `assets/incoming/personaggi/cleon/punch_1.png` → cleon, pugno diretto a braccio teso
35. `assets/incoming/personaggi/cleon/kick_1.png` → cleon, calcio frontale alto
36. `assets/incoming/personaggi/cleon/heavy_1.png` → cleon, gancio potente con tutto il corpo
37. `assets/incoming/personaggi/cleon/jump_1.png` → cleon, in salto, ginocchia raccolte
38. `assets/incoming/personaggi/cleon/hurt_1.png` → cleon, colpito, testa all'indietro, smorfia
39. `assets/incoming/personaggi/cleon/down_1.png` → cleon, a terra, sdraiato sulla schiena (figura orizzontale)
40. `assets/incoming/personaggi/cleon/getup_1.png` → cleon, si rialza, un ginocchio a terra

### 2. Mercy

41. `assets/incoming/personaggi/mercy/idle_1.png` → mercy, in guardia, fermo, pugni alzati
42. `assets/incoming/personaggi/mercy/walk_1.png` → mercy, camminata, fotogramma 1 di 4: gamba destra avanti
43. `assets/incoming/personaggi/mercy/walk_2.png` → mercy, camminata, fotogramma 2 di 4: gambe vicine, passaggio
44. `assets/incoming/personaggi/mercy/walk_3.png` → mercy, camminata, fotogramma 3 di 4: gamba sinistra avanti
45. `assets/incoming/personaggi/mercy/walk_4.png` → mercy, camminata, fotogramma 4 di 4: passaggio
46. `assets/incoming/personaggi/mercy/run_1.png` → mercy, corsa, busto in avanti, gamba destra avanti
47. `assets/incoming/personaggi/mercy/jump_1.png` → mercy, in salto, ginocchia raccolte
48. `assets/incoming/personaggi/mercy/hair_1.png` → mercy, seduta, si sistema i capelli con una mano
49. `assets/incoming/personaggi/mercy/hand_1.png` → mercy, cammina tenendo per mano qualcuno accanto a sé
50. `assets/incoming/personaggi/mercy/sit_1.png` → mercy, seduto su un sedile della metro
51. `assets/incoming/personaggi/mercy/cover_1.png` → mercy, si ripara, braccia davanti al viso
52. `assets/incoming/personaggi/mercy_giacca/idle_1.png` → mercy_giacca, in attesa, braccia lungo i fianchi
53. `assets/incoming/personaggi/mercy_giacca/walk_1.png` → mercy_giacca, camminata, fotogramma 1 di 4: gamba destra avanti
54. `assets/incoming/personaggi/mercy_giacca/walk_2.png` → mercy_giacca, camminata, fotogramma 2 di 4: passaggio
55. `assets/incoming/personaggi/mercy_giacca/walk_3.png` → mercy_giacca, camminata, fotogramma 3 di 4: gamba sinistra avanti
56. `assets/incoming/personaggi/mercy_giacca/walk_4.png` → mercy_giacca, camminata, fotogramma 4 di 4: passaggio
57. `assets/incoming/personaggi/mercy_giacca/run_1.png` → mercy_giacca, corsa
58. `assets/incoming/personaggi/mercy_giacca/hair_1.png` → mercy_giacca, seduta, si sistema i capelli con una mano
59. `assets/incoming/personaggi/mercy_giacca/hand_1.png` → mercy_giacca, cammina tenendo per mano qualcuno alla sua sinistra
60. `assets/incoming/personaggi/mercy_giacca/sit_1.png` → mercy_giacca, seduta su un sedile della metro

### 3. Fondali delle aree

61. `assets/incoming/fondali/P0-01_a.png` → Coney Island la sera: lungomare, montagne russe e ruota panoramica spente sullo sfondo, insegne al neon, marciapiede; luce: sera; riferimento: `riferimenti/luoghi/` coney_lungomare, coney_wonder_wheel
62. `assets/incoming/fondali/P0-02_a.png` → Coney Island la sera: lungomare, montagne russe e ruota panoramica spente sullo sfondo, insegne al neon, marciapiede; luce: sera; riferimento: `riferimenti/luoghi/` coney_lungomare, coney_wonder_wheel
63. `assets/incoming/fondali/P0-03_a.png` → Coney Island la sera: lungomare, montagne russe e ruota panoramica spente sullo sfondo, insegne al neon, marciapiede; luce: sera; riferimento: `riferimenti/luoghi/` coney_lungomare, coney_wonder_wheel
64. `assets/incoming/fondali/P0-04_a.png` → banchina della metropolitana sopraelevata di Coney Island, sera; luce: sera; riferimento: `riferimenti/luoghi/` coney_lungomare, coney_wonder_wheel
65. `assets/incoming/fondali/C1-01_a.png` → un grande parco del Bronx di notte, migliaia di ragazzi delle bande ammassati sullo sfondo davanti a un palco illuminato da fari; luce: notte; pezzo 1 di 2, il lato sinistro del luogo; riferimento: `riferimenti/luoghi/` raduno_arcate, raduno_folla, raduno_cyrus
66. `assets/incoming/fondali/C1-01_b.png` → un grande parco del Bronx di notte, migliaia di ragazzi delle bande ammassati sullo sfondo davanti a un palco illuminato da fari; luce: notte; pezzo 2 di 2, continua verso destra il pezzo a; riferimento: `riferimenti/luoghi/` raduno_arcate, raduno_folla, raduno_cyrus
67. `assets/incoming/fondali/C1-02_a.png` → un grande parco del Bronx di notte, migliaia di ragazzi delle bande ammassati sullo sfondo davanti a un palco illuminato da fari; luce: notte; riferimento: `riferimenti/luoghi/` raduno_arcate, raduno_folla, raduno_cyrus
68. `assets/incoming/fondali/C1-03_a.png` → parco di notte, alberi, siepi, prato calpestato, fuga; luce: notte; pezzo 1 di 3, il lato sinistro del luogo
69. `assets/incoming/fondali/C1-03_b.png` → parco di notte, alberi, siepi, prato calpestato, fuga; luce: notte; pezzo 2 di 3, continua verso destra il pezzo a
70. `assets/incoming/fondali/C1-03_c.png` → parco di notte, alberi, siepi, prato calpestato, fuga; luce: notte; pezzo 3 di 3, continua verso destra il pezzo b
71. `assets/incoming/fondali/C1-04_a.png` → sottopasso di cemento con scala che sale, luci al neon rotte; luce: notte
72. `assets/incoming/fondali/C2-01_a.png` → strada del Bronx di notte, palazzi di mattoni, scale antincendio, negozi chiusi con saracinesche, cassonetti; luce: notte; pezzo 1 di 3, il lato sinistro del luogo; riferimento: `riferimenti/luoghi/` strada_notte
73. `assets/incoming/fondali/C2-01_b.png` → strada del Bronx di notte, palazzi di mattoni, scale antincendio, negozi chiusi con saracinesche, cassonetti; luce: notte; pezzo 2 di 3, continua verso destra il pezzo a; riferimento: `riferimenti/luoghi/` strada_notte
74. `assets/incoming/fondali/C2-01_c.png` → strada del Bronx di notte, palazzi di mattoni, scale antincendio, negozi chiusi con saracinesche, cassonetti; luce: notte; pezzo 3 di 3, continua verso destra il pezzo b; riferimento: `riferimenti/luoghi/` strada_notte
75. `assets/incoming/fondali/C2-03_a.png` → strada del Bronx di notte, palazzi di mattoni, scale antincendio, negozi chiusi con saracinesche, cassonetti; luce: notte; pezzo 1 di 3, il lato sinistro del luogo; riferimento: `riferimenti/luoghi/` strada_notte
76. `assets/incoming/fondali/C2-03_b.png` → strada del Bronx di notte, palazzi di mattoni, scale antincendio, negozi chiusi con saracinesche, cassonetti; luce: notte; pezzo 2 di 3, continua verso destra il pezzo a; riferimento: `riferimenti/luoghi/` strada_notte
77. `assets/incoming/fondali/C2-03_c.png` → strada del Bronx di notte, palazzi di mattoni, scale antincendio, negozi chiusi con saracinesche, cassonetti; luce: notte; pezzo 3 di 3, continua verso destra il pezzo b; riferimento: `riferimenti/luoghi/` strada_notte
78. `assets/incoming/fondali/C2-02_a.png` → vicolo stretto tra palazzi di mattoni, cancello di rete in fondo, bidoni; luce: notte; pezzo 1 di 2, il lato sinistro del luogo; riferimento: `riferimenti/luoghi/` strada_notte
79. `assets/incoming/fondali/C2-02_b.png` → vicolo stretto tra palazzi di mattoni, cancello di rete in fondo, bidoni; luce: notte; pezzo 2 di 2, continua verso destra il pezzo a; riferimento: `riferimenti/luoghi/` strada_notte
80. `assets/incoming/fondali/C2-04_a.png` → banchina della metropolitana sotterranea anni '70, piastrelle sporche, colonne, graffiti, binari in basso; luce: notte; pezzo 1 di 2, il lato sinistro del luogo; riferimento: `riferimenti/luoghi/` union_square_scale (stile delle stazioni)
81. `assets/incoming/fondali/C2-04_b.png` → banchina della metropolitana sotterranea anni '70, piastrelle sporche, colonne, graffiti, binari in basso; luce: notte; pezzo 2 di 2, continua verso destra il pezzo a; riferimento: `riferimenti/luoghi/` union_square_scale (stile delle stazioni)
82. `assets/incoming/fondali/C3-04_a.png` → banchina della metropolitana sotterranea anni '70, piastrelle sporche, colonne, graffiti, binari in basso; luce: notte; pezzo 1 di 2, il lato sinistro del luogo; riferimento: `riferimenti/luoghi/` union_square_scale (stile delle stazioni)
83. `assets/incoming/fondali/C3-04_b.png` → banchina della metropolitana sotterranea anni '70, piastrelle sporche, colonne, graffiti, binari in basso; luce: notte; pezzo 2 di 2, continua verso destra il pezzo a; riferimento: `riferimenti/luoghi/` union_square_scale (stile delle stazioni)
84. `assets/incoming/fondali/C6-01_a.png` → banchina della metropolitana sotterranea anni '70, piastrelle sporche, colonne, graffiti, binari in basso; luce: notte; pezzo 1 di 2, il lato sinistro del luogo; riferimento: `riferimenti/luoghi/` union_square_scale
85. `assets/incoming/fondali/C6-01_b.png` → banchina della metropolitana sotterranea anni '70, piastrelle sporche, colonne, graffiti, binari in basso; luce: notte; pezzo 2 di 2, continua verso destra il pezzo a; riferimento: `riferimenti/luoghi/` union_square_scale
86. `assets/incoming/fondali/C6-04_a.png` → banchina della metropolitana sotterranea anni '70, piastrelle sporche, colonne, graffiti, binari in basso; luce: notte; riferimento: `riferimenti/luoghi/` union_square_scale
87. `assets/incoming/fondali/C3-01_a.png` → quartiere povero del Bronx, palazzi semidistrutti, auto abbandonate, bidoni con il fuoco; luce: notte; riferimento: `riferimenti/luoghi/` strada_orphans
88. `assets/incoming/fondali/C3-03_a.png` → quartiere povero del Bronx, palazzi semidistrutti, auto abbandonate, bidoni con il fuoco; luce: notte; pezzo 1 di 3, il lato sinistro del luogo; riferimento: `riferimenti/luoghi/` strada_orphans
89. `assets/incoming/fondali/C3-03_b.png` → quartiere povero del Bronx, palazzi semidistrutti, auto abbandonate, bidoni con il fuoco; luce: notte; pezzo 2 di 3, continua verso destra il pezzo a; riferimento: `riferimenti/luoghi/` strada_orphans
90. `assets/incoming/fondali/C3-03_c.png` → quartiere povero del Bronx, palazzi semidistrutti, auto abbandonate, bidoni con il fuoco; luce: notte; pezzo 3 di 3, continua verso destra il pezzo b; riferimento: `riferimenti/luoghi/` strada_orphans
91. `assets/incoming/fondali/C3-02_a.png` → cortile interno tra case popolari, fili da stendere, muri scrostati; luce: notte; pezzo 1 di 3, il lato sinistro del luogo
92. `assets/incoming/fondali/C3-02_b.png` → cortile interno tra case popolari, fili da stendere, muri scrostati; luce: notte; pezzo 2 di 3, continua verso destra il pezzo a
93. `assets/incoming/fondali/C3-02_c.png` → cortile interno tra case popolari, fili da stendere, muri scrostati; luce: notte; pezzo 3 di 3, continua verso destra il pezzo b
94. `assets/incoming/fondali/C4-01_a.png` → parco lungo il fiume a Manhattan di notte, lampioni, panchine, alberi, il fiume scuro sullo sfondo; luce: notte; pezzo 1 di 2, il lato sinistro del luogo
95. `assets/incoming/fondali/C4-01_b.png` → parco lungo il fiume a Manhattan di notte, lampioni, panchine, alberi, il fiume scuro sullo sfondo; luce: notte; pezzo 2 di 2, continua verso destra il pezzo a
96. `assets/incoming/fondali/C4-02_a.png` → parco lungo il fiume a Manhattan di notte, lampioni, panchine, alberi, il fiume scuro sullo sfondo; luce: notte; pezzo 1 di 3, il lato sinistro del luogo
97. `assets/incoming/fondali/C4-02_b.png` → parco lungo il fiume a Manhattan di notte, lampioni, panchine, alberi, il fiume scuro sullo sfondo; luce: notte; pezzo 2 di 3, continua verso destra il pezzo a
98. `assets/incoming/fondali/C4-02_c.png` → parco lungo il fiume a Manhattan di notte, lampioni, panchine, alberi, il fiume scuro sullo sfondo; luce: notte; pezzo 3 di 3, continua verso destra il pezzo b
99. `assets/incoming/fondali/C4-03_a.png` → parco lungo il fiume a Manhattan di notte, lampioni, panchine, alberi, il fiume scuro sullo sfondo; luce: notte; pezzo 1 di 3, il lato sinistro del luogo
100. `assets/incoming/fondali/C4-03_b.png` → parco lungo il fiume a Manhattan di notte, lampioni, panchine, alberi, il fiume scuro sullo sfondo; luce: notte; pezzo 2 di 3, continua verso destra il pezzo a
101. `assets/incoming/fondali/C4-03_c.png` → parco lungo il fiume a Manhattan di notte, lampioni, panchine, alberi, il fiume scuro sullo sfondo; luce: notte; pezzo 3 di 3, continua verso destra il pezzo b
102. `assets/incoming/fondali/C4-04_a.png` → parco lungo il fiume a Manhattan di notte, lampioni, panchine, alberi, il fiume scuro sullo sfondo; luce: notte
103. `assets/incoming/fondali/C5-01_a.png` → parco lungo il fiume a Manhattan di notte, lampioni, panchine, alberi, il fiume scuro sullo sfondo; luce: notte
104. `assets/incoming/fondali/C5-02_a.png` → appartamento anni '70: divani, tende, luci soffuse viola, giradischi, porta d'ingresso; luce: notte
105. `assets/incoming/fondali/C5-03_a.png` → appartamento anni '70: divani, tende, luci soffuse viola, giradischi, porta d'ingresso; luce: notte; pezzo 1 di 2, il lato sinistro del luogo
106. `assets/incoming/fondali/C5-03_b.png` → appartamento anni '70: divani, tende, luci soffuse viola, giradischi, porta d'ingresso; luce: notte; pezzo 2 di 2, continua verso destra il pezzo a
107. `assets/incoming/fondali/C5-04_a.png` → tunnel di servizio della metropolitana, tubi, luci di emergenza, binari; luce: notte; pezzo 1 di 2, il lato sinistro del luogo
108. `assets/incoming/fondali/C5-04_b.png` → tunnel di servizio della metropolitana, tubi, luci di emergenza, binari; luce: notte; pezzo 2 di 2, continua verso destra il pezzo a
109. `assets/incoming/fondali/C5-05_a.png` → strada di Manhattan di notte verso una grande piazza, vapore dai tombini; luce: notte; pezzo 1 di 2, il lato sinistro del luogo
110. `assets/incoming/fondali/C5-05_b.png` → strada di Manhattan di notte verso una grande piazza, vapore dai tombini; luce: notte; pezzo 2 di 2, continua verso destra il pezzo a
111. `assets/incoming/fondali/C6-02_a.png` → bagno pubblico sotterraneo della metropolitana: fila di gabinetti con porte, lavandini, specchi crepati, piastrelle; luce: notte
112. `assets/incoming/fondali/C6-03_a.png` → bagno pubblico sotterraneo della metropolitana: fila di gabinetti con porte, lavandini, specchi crepati, piastrelle; luce: notte; pezzo 1 di 2, il lato sinistro del luogo
113. `assets/incoming/fondali/C6-03_b.png` → bagno pubblico sotterraneo della metropolitana: fila di gabinetti con porte, lavandini, specchi crepati, piastrelle; luce: notte; pezzo 2 di 2, continua verso destra il pezzo a
114. `assets/incoming/fondali/C7-01_a.png` → interno di un vagone della metropolitana anni '70 coperto di graffiti, sedili lungo i lati, finestrini con l'alba che passa; luce: alba; pezzo 1 di 2, il lato sinistro del luogo
115. `assets/incoming/fondali/C7-01_b.png` → interno di un vagone della metropolitana anni '70 coperto di graffiti, sedili lungo i lati, finestrini con l'alba che passa; luce: alba; pezzo 2 di 2, continua verso destra il pezzo a
116. `assets/incoming/fondali/C7-02_a.png` → stazione sopraelevata di Coney Island all'alba; luce: alba; riferimento: `riferimenti/luoghi/` coney_wonder_wheel
117. `assets/incoming/fondali/C8-01_a.png` → Coney Island all'alba, lungomare deserto, giostre ferme, insegne spente; luce: alba; pezzo 1 di 2, il lato sinistro del luogo; riferimento: `riferimenti/luoghi/` coney_lungomare, coney_wonder_wheel
118. `assets/incoming/fondali/C8-01_b.png` → Coney Island all'alba, lungomare deserto, giostre ferme, insegne spente; luce: alba; pezzo 2 di 2, continua verso destra il pezzo a; riferimento: `riferimenti/luoghi/` coney_lungomare, coney_wonder_wheel
119. `assets/incoming/fondali/C8-02_a.png` → Coney Island all'alba, lungomare deserto, giostre ferme, insegne spente; luce: alba; pezzo 1 di 2, il lato sinistro del luogo; riferimento: `riferimenti/luoghi/` coney_lungomare, coney_wonder_wheel
120. `assets/incoming/fondali/C8-02_b.png` → Coney Island all'alba, lungomare deserto, giostre ferme, insegne spente; luce: alba; pezzo 2 di 2, continua verso destra il pezzo a; riferimento: `riferimenti/luoghi/` coney_lungomare, coney_wonder_wheel
121. `assets/incoming/fondali/C8-03_a.png` → spiaggia di Coney Island all'alba, sabbia, mare calmo, il molo sullo sfondo; luce: alba; riferimento: `riferimenti/luoghi/` spiaggia_riffs
122. `assets/incoming/fondali/C8-04_a.png` → spiaggia di Coney Island all'alba, sabbia, mare calmo, il molo sullo sfondo; luce: alba; riferimento: `riferimenti/luoghi/` spiaggia_riffs

### 4. Gli altri Warriors: pose che mancano e pose speciali

123. `assets/incoming/personaggi/swan/idle_1.png` → swan, in guardia, fermo, pugni alzati
124. `assets/incoming/personaggi/swan/walk_1.png` → swan, camminata, fotogramma 1 di 4: gamba destra avanti
125. `assets/incoming/personaggi/swan/walk_2.png` → swan, camminata, fotogramma 2 di 4: gambe vicine, passaggio
126. `assets/incoming/personaggi/swan/walk_3.png` → swan, camminata, fotogramma 3 di 4: gamba sinistra avanti
127. `assets/incoming/personaggi/swan/walk_4.png` → swan, camminata, fotogramma 4 di 4: passaggio
128. `assets/incoming/personaggi/swan/punch_1.png` → swan, pugno diretto a braccio teso
129. `assets/incoming/personaggi/swan/kick_1.png` → swan, calcio frontale alto
130. `assets/incoming/personaggi/swan/heavy_1.png` → swan, gancio potente con tutto il corpo
131. `assets/incoming/personaggi/swan/jump_1.png` → swan, in salto, ginocchia raccolte
132. `assets/incoming/personaggi/swan/hurt_1.png` → swan, colpito, testa all'indietro, smorfia
133. `assets/incoming/personaggi/swan/down_1.png` → swan, a terra, sdraiato sulla schiena (figura orizzontale)
134. `assets/incoming/personaggi/swan/getup_1.png` → swan, si rialza, un ginocchio a terra
135. `assets/incoming/personaggi/swan/knife_1.png` → swan, coltello a scatto aperto in mano
136. `assets/incoming/personaggi/swan/knifethrow_1.png` → swan, lancia un coltello in avanti
137. `assets/incoming/personaggi/swan/hand_1.png` → swan, cammina tenendo per mano qualcuno accanto a sé
138. `assets/incoming/personaggi/snow/idle_1.png` → snow, in guardia, fermo, pugni alzati
139. `assets/incoming/personaggi/snow/walk_1.png` → snow, camminata, fotogramma 1 di 4: gamba destra avanti
140. `assets/incoming/personaggi/snow/walk_2.png` → snow, camminata, fotogramma 2 di 4: gambe vicine, passaggio
141. `assets/incoming/personaggi/snow/walk_3.png` → snow, camminata, fotogramma 3 di 4: gamba sinistra avanti
142. `assets/incoming/personaggi/snow/walk_4.png` → snow, camminata, fotogramma 4 di 4: passaggio
143. `assets/incoming/personaggi/snow/punch_1.png` → snow, pugno diretto a braccio teso
144. `assets/incoming/personaggi/snow/kick_1.png` → snow, calcio frontale alto
145. `assets/incoming/personaggi/snow/heavy_1.png` → snow, gancio potente con tutto il corpo
146. `assets/incoming/personaggi/snow/jump_1.png` → snow, in salto, ginocchia raccolte
147. `assets/incoming/personaggi/snow/hurt_1.png` → snow, colpito, testa all'indietro, smorfia
148. `assets/incoming/personaggi/snow/down_1.png` → snow, a terra, sdraiato sulla schiena (figura orizzontale)
149. `assets/incoming/personaggi/snow/getup_1.png` → snow, si rialza, un ginocchio a terra
150. `assets/incoming/personaggi/cowboy/idle_1.png` → cowboy, in guardia, fermo, pugni alzati
151. `assets/incoming/personaggi/cowboy/walk_1.png` → cowboy, camminata, fotogramma 1 di 4: gamba destra avanti
152. `assets/incoming/personaggi/cowboy/walk_2.png` → cowboy, camminata, fotogramma 2 di 4: gambe vicine, passaggio
153. `assets/incoming/personaggi/cowboy/walk_3.png` → cowboy, camminata, fotogramma 3 di 4: gamba sinistra avanti
154. `assets/incoming/personaggi/cowboy/walk_4.png` → cowboy, camminata, fotogramma 4 di 4: passaggio
155. `assets/incoming/personaggi/cowboy/punch_1.png` → cowboy, pugno diretto a braccio teso
156. `assets/incoming/personaggi/cowboy/kick_1.png` → cowboy, calcio frontale alto
157. `assets/incoming/personaggi/cowboy/heavy_1.png` → cowboy, gancio potente con tutto il corpo
158. `assets/incoming/personaggi/cowboy/jump_1.png` → cowboy, in salto, ginocchia raccolte
159. `assets/incoming/personaggi/cowboy/hurt_1.png` → cowboy, colpito, testa all'indietro, smorfia
160. `assets/incoming/personaggi/cowboy/down_1.png` → cowboy, a terra, sdraiato sulla schiena (figura orizzontale)
161. `assets/incoming/personaggi/cowboy/getup_1.png` → cowboy, si rialza, un ginocchio a terra
162. `assets/incoming/personaggi/cochise/idle_1.png` → cochise, in guardia, fermo, pugni alzati
163. `assets/incoming/personaggi/cochise/walk_1.png` → cochise, camminata, fotogramma 1 di 4: gamba destra avanti
164. `assets/incoming/personaggi/cochise/walk_2.png` → cochise, camminata, fotogramma 2 di 4: gambe vicine, passaggio
165. `assets/incoming/personaggi/cochise/walk_3.png` → cochise, camminata, fotogramma 3 di 4: gamba sinistra avanti
166. `assets/incoming/personaggi/cochise/walk_4.png` → cochise, camminata, fotogramma 4 di 4: passaggio
167. `assets/incoming/personaggi/cochise/punch_1.png` → cochise, pugno diretto a braccio teso
168. `assets/incoming/personaggi/cochise/kick_1.png` → cochise, calcio frontale alto
169. `assets/incoming/personaggi/cochise/heavy_1.png` → cochise, gancio potente con tutto il corpo
170. `assets/incoming/personaggi/cochise/jump_1.png` → cochise, in salto, ginocchia raccolte
171. `assets/incoming/personaggi/cochise/hurt_1.png` → cochise, colpito, testa all'indietro, smorfia
172. `assets/incoming/personaggi/cochise/down_1.png` → cochise, a terra, sdraiato sulla schiena (figura orizzontale)
173. `assets/incoming/personaggi/cochise/getup_1.png` → cochise, si rialza, un ginocchio a terra
174. `assets/incoming/personaggi/cochise/turnstile_1.png` → cochise, scavalca un tornello della metro con un salto
175. `assets/incoming/personaggi/rembrandt/idle_1.png` → rembrandt, in guardia, fermo, pugni alzati
176. `assets/incoming/personaggi/rembrandt/walk_1.png` → rembrandt, camminata, fotogramma 1 di 4: gamba destra avanti
177. `assets/incoming/personaggi/rembrandt/walk_2.png` → rembrandt, camminata, fotogramma 2 di 4: gambe vicine, passaggio
178. `assets/incoming/personaggi/rembrandt/walk_3.png` → rembrandt, camminata, fotogramma 3 di 4: gamba sinistra avanti
179. `assets/incoming/personaggi/rembrandt/walk_4.png` → rembrandt, camminata, fotogramma 4 di 4: passaggio
180. `assets/incoming/personaggi/rembrandt/punch_1.png` → rembrandt, pugno diretto a braccio teso
181. `assets/incoming/personaggi/rembrandt/kick_1.png` → rembrandt, calcio frontale alto
182. `assets/incoming/personaggi/rembrandt/heavy_1.png` → rembrandt, gancio potente con tutto il corpo
183. `assets/incoming/personaggi/rembrandt/jump_1.png` → rembrandt, in salto, ginocchia raccolte
184. `assets/incoming/personaggi/rembrandt/hurt_1.png` → rembrandt, colpito, testa all'indietro, smorfia
185. `assets/incoming/personaggi/rembrandt/down_1.png` → rembrandt, a terra, sdraiato sulla schiena (figura orizzontale)
186. `assets/incoming/personaggi/rembrandt/getup_1.png` → rembrandt, si rialza, un ginocchio a terra
187. `assets/incoming/personaggi/rembrandt/spray_1.png` → rembrandt, spruzza vernice con una bomboletta spray
188. `assets/incoming/personaggi/rembrandt/pinned_spray_1.png` → rembrandt, a terra sulla schiena, spruzza la bomboletta verso l'alto
189. `assets/incoming/personaggi/fox/idle_1.png` → fox, in guardia, fermo, pugni alzati
190. `assets/incoming/personaggi/fox/walk_1.png` → fox, camminata, fotogramma 1 di 4: gamba destra avanti
191. `assets/incoming/personaggi/fox/walk_2.png` → fox, camminata, fotogramma 2 di 4: gambe vicine, passaggio
192. `assets/incoming/personaggi/fox/walk_3.png` → fox, camminata, fotogramma 3 di 4: gamba sinistra avanti
193. `assets/incoming/personaggi/fox/walk_4.png` → fox, camminata, fotogramma 4 di 4: passaggio
194. `assets/incoming/personaggi/fox/punch_1.png` → fox, pugno diretto a braccio teso
195. `assets/incoming/personaggi/fox/kick_1.png` → fox, calcio frontale alto
196. `assets/incoming/personaggi/fox/heavy_1.png` → fox, gancio potente con tutto il corpo
197. `assets/incoming/personaggi/fox/jump_1.png` → fox, in salto, ginocchia raccolte
198. `assets/incoming/personaggi/fox/hurt_1.png` → fox, colpito, testa all'indietro, smorfia
199. `assets/incoming/personaggi/fox/down_1.png` → fox, a terra, sdraiato sulla schiena (figura orizzontale)
200. `assets/incoming/personaggi/fox/getup_1.png` → fox, si rialza, un ginocchio a terra

### 5. Bande e personaggi della storia

201. `assets/incoming/personaggi/fury/idle_1.png` → fury, in guardia, fermo, pugni alzati
202. `assets/incoming/personaggi/fury/walk_1.png` → fury, camminata, fotogramma 1 di 4: gamba destra avanti
203. `assets/incoming/personaggi/fury/walk_2.png` → fury, camminata, fotogramma 2 di 4: gambe vicine, passaggio
204. `assets/incoming/personaggi/fury/walk_3.png` → fury, camminata, fotogramma 3 di 4: gamba sinistra avanti
205. `assets/incoming/personaggi/fury/walk_4.png` → fury, camminata, fotogramma 4 di 4: passaggio
206. `assets/incoming/personaggi/fury/punch_1.png` → fury, pugno diretto a braccio teso
207. `assets/incoming/personaggi/fury/hurt_1.png` → fury, colpito, testa all'indietro, smorfia
208. `assets/incoming/personaggi/fury/down_1.png` → fury, a terra, sdraiato sulla schiena (figura orizzontale)
209. `assets/incoming/personaggi/fury/windup_1.png` → fury, carica lo swing
210. `assets/incoming/personaggi/fury/swing_1.png` → fury, swing
211. `assets/incoming/personaggi/fury/nobat_punch_1.png` → fury, disarmato
212. `assets/incoming/personaggi/fury_boss/idle_1.png` → fury_boss, in guardia, fermo, pugni alzati
213. `assets/incoming/personaggi/fury_boss/walk_1.png` → fury_boss, camminata, fotogramma 1 di 4: gamba destra avanti
214. `assets/incoming/personaggi/fury_boss/walk_2.png` → fury_boss, camminata, fotogramma 2 di 4: gambe vicine, passaggio
215. `assets/incoming/personaggi/fury_boss/walk_3.png` → fury_boss, camminata, fotogramma 3 di 4: gamba sinistra avanti
216. `assets/incoming/personaggi/fury_boss/walk_4.png` → fury_boss, camminata, fotogramma 4 di 4: passaggio
217. `assets/incoming/personaggi/fury_boss/punch_1.png` → fury_boss, pugno diretto a braccio teso
218. `assets/incoming/personaggi/fury_boss/hurt_1.png` → fury_boss, colpito, testa all'indietro, smorfia
219. `assets/incoming/personaggi/fury_boss/down_1.png` → fury_boss, a terra, sdraiato sulla schiena (figura orizzontale)
220. `assets/incoming/personaggi/fury_boss/windup_1.png` → fury_boss, windup
221. `assets/incoming/personaggi/fury_boss/swing_1.png` → fury_boss, swing
222. `assets/incoming/personaggi/turnbull/idle_1.png` → turnbull, in guardia, fermo, pugni alzati
223. `assets/incoming/personaggi/turnbull/walk_1.png` → turnbull, camminata, fotogramma 1 di 4: gamba destra avanti
224. `assets/incoming/personaggi/turnbull/walk_2.png` → turnbull, camminata, fotogramma 2 di 4: gambe vicine, passaggio
225. `assets/incoming/personaggi/turnbull/walk_3.png` → turnbull, camminata, fotogramma 3 di 4: gamba sinistra avanti
226. `assets/incoming/personaggi/turnbull/walk_4.png` → turnbull, camminata, fotogramma 4 di 4: passaggio
227. `assets/incoming/personaggi/turnbull/punch_1.png` → turnbull, pugno diretto a braccio teso
228. `assets/incoming/personaggi/turnbull/hurt_1.png` → turnbull, colpito, testa all'indietro, smorfia
229. `assets/incoming/personaggi/turnbull/down_1.png` → turnbull, a terra, sdraiato sulla schiena (figura orizzontale)
230. `assets/incoming/personaggi/turnbull/charge_1.png` → turnbull, carica a testa bassa
231. `assets/incoming/personaggi/turnbull_fast/idle_1.png` → turnbull_fast, in guardia, fermo, pugni alzati
232. `assets/incoming/personaggi/turnbull_fast/walk_1.png` → turnbull_fast, camminata, fotogramma 1 di 4: gamba destra avanti
233. `assets/incoming/personaggi/turnbull_fast/walk_2.png` → turnbull_fast, camminata, fotogramma 2 di 4: gambe vicine, passaggio
234. `assets/incoming/personaggi/turnbull_fast/walk_3.png` → turnbull_fast, camminata, fotogramma 3 di 4: gamba sinistra avanti
235. `assets/incoming/personaggi/turnbull_fast/walk_4.png` → turnbull_fast, camminata, fotogramma 4 di 4: passaggio
236. `assets/incoming/personaggi/turnbull_fast/punch_1.png` → turnbull_fast, pugno diretto a braccio teso
237. `assets/incoming/personaggi/turnbull_fast/hurt_1.png` → turnbull_fast, colpito, testa all'indietro, smorfia
238. `assets/incoming/personaggi/turnbull_fast/down_1.png` → turnbull_fast, a terra, sdraiato sulla schiena (figura orizzontale)
239. `assets/incoming/personaggi/turnbull_fast/charge_1.png` → turnbull_fast, charge
240. `assets/incoming/personaggi/orphan/idle_1.png` → orphan, in guardia, fermo, pugni alzati
241. `assets/incoming/personaggi/orphan/walk_1.png` → orphan, camminata, fotogramma 1 di 4: gamba destra avanti
242. `assets/incoming/personaggi/orphan/walk_2.png` → orphan, camminata, fotogramma 2 di 4: gambe vicine, passaggio
243. `assets/incoming/personaggi/orphan/walk_3.png` → orphan, camminata, fotogramma 3 di 4: gamba sinistra avanti
244. `assets/incoming/personaggi/orphan/walk_4.png` → orphan, camminata, fotogramma 4 di 4: passaggio
245. `assets/incoming/personaggi/orphan/punch_1.png` → orphan, pugno diretto a braccio teso
246. `assets/incoming/personaggi/orphan/hurt_1.png` → orphan, colpito, testa all'indietro, smorfia
247. `assets/incoming/personaggi/orphan/down_1.png` → orphan, a terra, sdraiato sulla schiena (figura orizzontale)
248. `assets/incoming/personaggi/orphan/board_swing_1.png` → orphan, colpo con un'asse
249. `assets/incoming/personaggi/sully/idle_1.png` → sully, in guardia, fermo, pugni alzati
250. `assets/incoming/personaggi/sully/walk_1.png` → sully, camminata, fotogramma 1 di 4: gamba destra avanti
251. `assets/incoming/personaggi/sully/walk_2.png` → sully, camminata, fotogramma 2 di 4: gambe vicine, passaggio
252. `assets/incoming/personaggi/sully/walk_3.png` → sully, camminata, fotogramma 3 di 4: gamba sinistra avanti
253. `assets/incoming/personaggi/sully/walk_4.png` → sully, camminata, fotogramma 4 di 4: passaggio
254. `assets/incoming/personaggi/sully/punch_1.png` → sully, pugno diretto a braccio teso
255. `assets/incoming/personaggi/sully/hurt_1.png` → sully, colpito, testa all'indietro, smorfia
256. `assets/incoming/personaggi/sully/down_1.png` → sully, a terra, sdraiato sulla schiena (figura orizzontale)
257. `assets/incoming/personaggi/lizzie/idle_1.png` → lizzie, in guardia, fermo, pugni alzati
258. `assets/incoming/personaggi/lizzie/walk_1.png` → lizzie, camminata, fotogramma 1 di 4: gamba destra avanti
259. `assets/incoming/personaggi/lizzie/walk_2.png` → lizzie, camminata, fotogramma 2 di 4: gambe vicine, passaggio
260. `assets/incoming/personaggi/lizzie/walk_3.png` → lizzie, camminata, fotogramma 3 di 4: gamba sinistra avanti
261. `assets/incoming/personaggi/lizzie/walk_4.png` → lizzie, camminata, fotogramma 4 di 4: passaggio
262. `assets/incoming/personaggi/lizzie/punch_1.png` → lizzie, pugno diretto a braccio teso
263. `assets/incoming/personaggi/lizzie/hurt_1.png` → lizzie, colpito, testa all'indietro, smorfia
264. `assets/incoming/personaggi/lizzie/down_1.png` → lizzie, a terra, sdraiato sulla schiena (figura orizzontale)
265. `assets/incoming/personaggi/lizzie/gun_aim_1.png` → lizzie, gun_aim
266. `assets/incoming/personaggi/lizzie/gun_shoot_1.png` → lizzie, pistola
267. `assets/incoming/personaggi/lizzie/push_1.png` → lizzie, push
268. `assets/incoming/personaggi/lizzie_boss/idle_1.png` → lizzie_boss, in guardia, fermo, pugni alzati
269. `assets/incoming/personaggi/lizzie_boss/walk_1.png` → lizzie_boss, camminata, fotogramma 1 di 4: gamba destra avanti
270. `assets/incoming/personaggi/lizzie_boss/walk_2.png` → lizzie_boss, camminata, fotogramma 2 di 4: gambe vicine, passaggio
271. `assets/incoming/personaggi/lizzie_boss/walk_3.png` → lizzie_boss, camminata, fotogramma 3 di 4: gamba sinistra avanti
272. `assets/incoming/personaggi/lizzie_boss/walk_4.png` → lizzie_boss, camminata, fotogramma 4 di 4: passaggio
273. `assets/incoming/personaggi/lizzie_boss/punch_1.png` → lizzie_boss, pugno diretto a braccio teso
274. `assets/incoming/personaggi/lizzie_boss/hurt_1.png` → lizzie_boss, colpito, testa all'indietro, smorfia
275. `assets/incoming/personaggi/lizzie_boss/down_1.png` → lizzie_boss, a terra, sdraiato sulla schiena (figura orizzontale)
276. `assets/incoming/personaggi/lizzie_boss/gun_aim_1.png` → lizzie_boss, gun_aim
277. `assets/incoming/personaggi/punk/idle_1.png` → punk, in guardia, fermo, pugni alzati
278. `assets/incoming/personaggi/punk/walk_1.png` → punk, camminata, fotogramma 1 di 4: gamba destra avanti
279. `assets/incoming/personaggi/punk/walk_2.png` → punk, camminata, fotogramma 2 di 4: gambe vicine, passaggio
280. `assets/incoming/personaggi/punk/walk_3.png` → punk, camminata, fotogramma 3 di 4: gamba sinistra avanti
281. `assets/incoming/personaggi/punk/walk_4.png` → punk, camminata, fotogramma 4 di 4: passaggio
282. `assets/incoming/personaggi/punk/punch_1.png` → punk, pugno diretto a braccio teso
283. `assets/incoming/personaggi/punk/hurt_1.png` → punk, colpito, testa all'indietro, smorfia
284. `assets/incoming/personaggi/punk/down_1.png` → punk, a terra, sdraiato sulla schiena (figura orizzontale)
285. `assets/incoming/personaggi/punk/skate_1.png` → punk, skate
286. `assets/incoming/personaggi/punk/skate_2.png` → punk, pattina
287. `assets/incoming/personaggi/punk/grab_1.png` → punk, presa
288. `assets/incoming/personaggi/punk_boss/idle_1.png` → punk_boss, in guardia, fermo, pugni alzati
289. `assets/incoming/personaggi/punk_boss/walk_1.png` → punk_boss, camminata, fotogramma 1 di 4: gamba destra avanti
290. `assets/incoming/personaggi/punk_boss/walk_2.png` → punk_boss, camminata, fotogramma 2 di 4: gambe vicine, passaggio
291. `assets/incoming/personaggi/punk_boss/walk_3.png` → punk_boss, camminata, fotogramma 3 di 4: gamba sinistra avanti
292. `assets/incoming/personaggi/punk_boss/walk_4.png` → punk_boss, camminata, fotogramma 4 di 4: passaggio
293. `assets/incoming/personaggi/punk_boss/punch_1.png` → punk_boss, pugno diretto a braccio teso
294. `assets/incoming/personaggi/punk_boss/hurt_1.png` → punk_boss, colpito, testa all'indietro, smorfia
295. `assets/incoming/personaggi/punk_boss/down_1.png` → punk_boss, a terra, sdraiato sulla schiena (figura orizzontale)
296. `assets/incoming/personaggi/punk_boss/skate_1.png` → punk_boss, skate
297. `assets/incoming/personaggi/punk_boss/grab_1.png` → punk_boss, afferra qualcuno davanti a sé per il bavero
298. `assets/incoming/personaggi/rogue/idle_1.png` → rogue, in guardia, fermo, pugni alzati
299. `assets/incoming/personaggi/rogue/walk_1.png` → rogue, camminata, fotogramma 1 di 4: gamba destra avanti
300. `assets/incoming/personaggi/rogue/walk_2.png` → rogue, camminata, fotogramma 2 di 4: gambe vicine, passaggio
301. `assets/incoming/personaggi/rogue/walk_3.png` → rogue, camminata, fotogramma 3 di 4: gamba sinistra avanti
302. `assets/incoming/personaggi/rogue/walk_4.png` → rogue, camminata, fotogramma 4 di 4: passaggio
303. `assets/incoming/personaggi/rogue/punch_1.png` → rogue, pugno diretto a braccio teso
304. `assets/incoming/personaggi/rogue/hurt_1.png` → rogue, colpito, testa all'indietro, smorfia
305. `assets/incoming/personaggi/rogue/down_1.png` → rogue, a terra, sdraiato sulla schiena (figura orizzontale)
306. `assets/incoming/personaggi/rogue/bottle_throw_1.png` → rogue, bottle_throw
307. `assets/incoming/personaggi/luther/idle_1.png` → luther, in guardia, fermo, pugni alzati
308. `assets/incoming/personaggi/luther/walk_1.png` → luther, camminata, fotogramma 1 di 4: gamba destra avanti
309. `assets/incoming/personaggi/luther/walk_2.png` → luther, camminata, fotogramma 2 di 4: gambe vicine, passaggio
310. `assets/incoming/personaggi/luther/walk_3.png` → luther, camminata, fotogramma 3 di 4: gamba sinistra avanti
311. `assets/incoming/personaggi/luther/walk_4.png` → luther, camminata, fotogramma 4 di 4: passaggio
312. `assets/incoming/personaggi/luther/punch_1.png` → luther, pugno diretto a braccio teso
313. `assets/incoming/personaggi/luther/hurt_1.png` → luther, colpito, testa all'indietro, smorfia
314. `assets/incoming/personaggi/luther/down_1.png` → luther, a terra, sdraiato sulla schiena (figura orizzontale)
315. `assets/incoming/personaggi/luther/gun_aim_1.png` → luther, gun_aim
316. `assets/incoming/personaggi/luther/bottles_1.png` → luther, tre bottiglie vuote infilate tra le dita
317. `assets/incoming/personaggi/luther/knifehit_1.png` → luther, coltello piantato nel braccio
318. `assets/incoming/personaggi/luther/down_1.png` → luther, a terra, sdraiato sulla schiena (figura orizzontale)
319. `assets/incoming/personaggi/police/idle_1.png` → police, in guardia, fermo, pugni alzati
320. `assets/incoming/personaggi/police/walk_1.png` → police, camminata, fotogramma 1 di 4: gamba destra avanti
321. `assets/incoming/personaggi/police/walk_2.png` → police, camminata, fotogramma 2 di 4: gambe vicine, passaggio
322. `assets/incoming/personaggi/police/walk_3.png` → police, camminata, fotogramma 3 di 4: gamba sinistra avanti
323. `assets/incoming/personaggi/police/walk_4.png` → police, camminata, fotogramma 4 di 4: passaggio
324. `assets/incoming/personaggi/police/punch_1.png` → police, pugno diretto a braccio teso
325. `assets/incoming/personaggi/police/hurt_1.png` → police, colpito, testa all'indietro, smorfia
326. `assets/incoming/personaggi/police/down_1.png` → police, a terra, sdraiato sulla schiena (figura orizzontale)
327. `assets/incoming/personaggi/police/baton_swing_1.png` → police, manganello
328. `assets/incoming/personaggi/police/charge_1.png` → police, charge
329. `assets/incoming/personaggi/police_woman/idle_1.png` → police_woman, in guardia, fermo, pugni alzati
330. `assets/incoming/personaggi/police_woman/sit_1.png` → police_woman, seduto su un sedile della metro
331. `assets/incoming/personaggi/police_woman/arrest_1.png` → police_woman, a terra, ammanettato
332. `assets/incoming/personaggi/cyrus/idle_1.png` → cyrus, in guardia, fermo, pugni alzati
333. `assets/incoming/personaggi/cyrus/speech_1.png` → cyrus, speech
334. `assets/incoming/personaggi/cyrus/shot_1.png` → cyrus, colpito
335. `assets/incoming/personaggi/riff/idle_1.png` → riff, in guardia, fermo, pugni alzati
336. `assets/incoming/personaggi/riff/idle_1.png` → riff, in guardia, fermo, pugni alzati
337. `assets/incoming/personaggi/masai/idle_1.png` → masai, in guardia, fermo, pugni alzati
338. `assets/incoming/personaggi/masai/idle_1.png` → masai, in guardia, fermo, pugni alzati

### 6. Scene (illustrazioni per le transizioni, 1536×1024)

339. `assets/incoming/scene/cine_cyrus.png` → Cyrus sul palco a braccia aperte davanti a una folla immensa di bande, di notte, fari
340. `assets/incoming/scene/cine_accusation.png` → lo sparo al raduno: Cyrus cade, la folla si scatena, polizia che arriva
341. `assets/incoming/scene/cine_furies_appear.png` → i Furies con le mazze sotto i lampioni del parco, i Warriors di fronte
342. `assets/incoming/scene/cine_ajax_arrest.png` → Ajax ammanettato a terra vicino a una panchina, luci blu delle volanti
343. `assets/incoming/scene/cine_lizzies_trap.png` → le Lizzies con le pistole davanti a una porta chiusa, tre Warriors in trappola
344. `assets/incoming/scene/cine_swan_mercy.png` → Swan e Mercy che camminano in un tunnel della metro
345. `assets/incoming/scene/talk_c7_couple.png` → sul treno all'alba Mercy si sistema i capelli e Swan le ferma la mano; di fronte una coppia elegante
346. `assets/incoming/scene/cine_bottles.png` → Luther sporto dal finestrino di un'auto con tre bottiglie vuote tra le dita
347. `assets/incoming/scene/cine_disarm.png` → sulla spiaggia all'alba il coltello di Swan colpisce il braccio di Luther, la pistola cade
348. `assets/incoming/scene/cine_epilogue.png` → i Warriors e Mercy camminano sulla spiaggia di Coney Island all'alba

### 7. Ritratti (mezzo busto, tre quarti verso destra, sfondo magenta)

349. `assets/incoming/ritratti/idle_1.png` → ritratto di idle_1
350. `assets/incoming/ritratti/punch_1.png` → ritratto di punch_1
351. `assets/incoming/ritratti/kick_1.png` → ritratto di kick_1
352. `assets/incoming/ritratti/heavy_1.png` → ritratto di heavy_1
353. `assets/incoming/ritratti/jump_1.png` → ritratto di jump_1
354. `assets/incoming/ritratti/jumpkick_1.png` → ritratto di jumpkick_1
355. `assets/incoming/ritratti/hurt_1.png` → ritratto di hurt_1
356. `assets/incoming/ritratti/down_1.png` → ritratto di down_1
357. `assets/incoming/ritratti/getup_1.png` → ritratto di getup_1
358. `assets/incoming/ritratti/grab_1.png` → ritratto di grab_1
359. `assets/incoming/ritratti/throw_1.png` → ritratto di throw_1
360. `assets/incoming/ritratti/dodge_1.png` → ritratto di dodge_1
361. `assets/incoming/ritratti/pipe_swing_1.png` → ritratto di pipe_swing_1
362. `assets/incoming/ritratti/revive_1.png` → ritratto di revive_1
363. `assets/incoming/ritratti/sit_1.png` → ritratto di sit_1
364. `assets/incoming/ritratti/swan.png` → ritratto di swan
365. `assets/incoming/ritratti/ajax.png` → ritratto di ajax
366. `assets/incoming/ritratti/snow.png` → ritratto di snow
367. `assets/incoming/ritratti/cowboy.png` → ritratto di cowboy
368. `assets/incoming/ritratti/cochise.png` → ritratto di cochise
369. `assets/incoming/ritratti/vermin.png` → ritratto di vermin
370. `assets/incoming/ritratti/rembrandt.png` → ritratto di rembrandt
371. `assets/incoming/ritratti/fox.png` → ritratto di fox
372. `assets/incoming/ritratti/cleon.png` → ritratto di cleon
373. `assets/incoming/ritratti/mercy.png` → ritratto di mercy

### 8. Oggetti ed effetti (sfondo magenta, vista laterale)

374. `assets/incoming/oggetti/bus_turnbull.png` → bus_turnbull (bus scolastico verde dipinto)
375. `assets/incoming/oggetti/treno_esterno.png` → treno_esterno (vagone della metro anni '70 con graffiti, di lato)
376. `assets/incoming/oggetti/auto_rogues.png` → auto_rogues (berlina scura anni '70)
377. `assets/incoming/oggetti/auto_orphans_fuoco.png` → auto_orphans_fuoco (auto in fiamme)
378. `assets/incoming/oggetti/tornello.png` → tornello
379. `assets/incoming/oggetti/transenna.png` → transenna
380. `assets/incoming/oggetti/panchina.png` → panchina
381. `assets/incoming/oggetti/cestino.png` → cestino
382. `assets/incoming/oggetti/cassa.png` → cassa
383. `assets/incoming/oggetti/bidone.png` → bidone
384. `assets/incoming/oggetti/porta_gabinetto.png` → porta_gabinetto
385. `assets/incoming/oggetti/lavandino.png` → lavandino
386. `assets/incoming/oggetti/giradischi.png` → giradischi
387. `assets/incoming/oggetti/sedia.png` → sedia
388. `assets/incoming/oggetti/bomboletta.png` → bomboletta
389. `assets/incoming/oggetti/coltello.png` → coltello
390. `assets/incoming/oggetti/pistola.png` → pistola
391. `assets/incoming/oggetti/bottiglia.png` → bottiglia
392. `assets/incoming/oggetti/mazza.png` → mazza
393. `assets/incoming/oggetti/tubo.png` → tubo
394. `assets/incoming/oggetti/asse.png` → asse
395. `assets/incoming/oggetti/manganello.png` → manganello
396. `assets/incoming/oggetti/fx_spruzzo.png` → fx_spruzzo
397. `assets/incoming/oggetti/fx_scintille.png` → fx_scintille
398. `assets/incoming/oggetti/fx_polvere.png` → fx_polvere
399. `assets/incoming/oggetti/fx_fuoco.png` → fx_fuoco
400. `assets/incoming/oggetti/fx_vetro.png` → fx_vetro
401. `assets/incoming/oggetti/fx_sparo.png` → fx_sparo

## Fine

In tutto 401 immagini. Non devi farle tutte in una volta: ogni sessione riparte dal primo file dell'elenco che non esiste ancora. Claude integra nel gioco quello che trova in `assets/incoming/` (ritaglio, scala, allineamento, palette) e aggiorna le cartelle definitive.

