# Prompt per ChatGPT: immagini del gioco

**Modo automatico.** Se il tuo ChatGPT ha accesso in scrittura al repository, basta dirgli: «Leggi il file IMMAGINI_PER_AI.md nel repository b3pz/The_Warriors e segui le istruzioni». Il file contiene lo stile, le 392 immagini da creare in ordine e dove caricarle; ogni sessione riparte da dove si era fermato.

**Modo manuale** (chat senza accesso al repository):

1. Apri **una sola chat** di ChatGPT per tutto il lotto e incolla per primo il **prompt di stile** (sotto): così le immagini restano coerenti fra loro.
2. Per ogni immagine usa il modello del tipo giusto (personaggio, fondale, scena, oggetto, ritratto), cambiando solo le parti tra `[parentesi]`.
3. Scarica il PNG e rinominalo come indicato.
4. Caricalo su GitHub nella cartella giusta: repository → `assets/incoming/<tipo>/` → **Add file → Upload files** (si possono trascinare molti file insieme) → **Commit changes**.
5. Scrivi a Claude «ho caricato le immagini»: ritaglio, scala, allineamento dei piedi, colori e inserimento nel gioco li fa lui.

Se un'immagine viene male, rigenerala nella stessa chat dicendo cosa correggere («stessa posa, ma i piedi interi», «il cappello è sparito»).

---

## 1. Prompt di stile (da incollare una volta all'inizio)

```
Stai lavorando con me alla grafica di un videogioco beat 'em up a scorrimento laterale ambientato a New York in una sola notte del 1979: una banda di strada, i Warriors, deve attraversare la città dal Bronx fino a Coney Island inseguita da tutte le altre bande.

Stile, per TUTTE le immagini che ti chiederò:
- pixel art 16-bit da sala giochi anni '90, contorni scuri netti, ombreggiatura a bande, nessuna sfumatura morbida, nessun effetto pittorico;
- palette notturna e cupa: blu petrolio, viola, marroni, luce gialla dei lampioni e rossa dei neon; all'alba rosa e arancio pallido;
- atmosfera da film di strada anni '70: sporco, graffiti, vapore dai tombini, metropolitana;
- vista laterale, come in un picchiaduro a scorrimento;
- niente testo, niente scritte leggibili, niente loghi, niente cornici, niente firme;
- i personaggi devono essere fedeli ai personaggi del film (costume, capelli, corporatura, colori): ti darò le immagini di riferimento e le descrizioni.

Regole tecniche:
- personaggi e oggetti: UN solo soggetto per immagine, figura intera dalla testa ai piedi, su SFONDO PIATTO MAGENTA PURO #FF00FF (nessuna ombra sul fondo, nessun pavimento disegnato), rivolto verso DESTRA, centrato, i piedi appoggiati a circa il 90% dell'altezza dell'immagine, formato quadrato 1024×1024;
- tutti i personaggi alla stessa scala: un uomo adulto alto circa l'80% dell'immagine;
- fondali e scene: formato orizzontale 1536×1024.

Rispondi solo con l'immagine, senza commenti, finché non ti dico altro.
```

---

## 2. Personaggi (cartella `assets/incoming/personaggi/<set>/`)

Un'immagine per posa. Nome del file: `<posa>_<numero>.png`, per esempio `walk_1.png`, `walk_2.png`, `punch_1.png`.

```
Personaggio: [NOME] — [DESCRIZIONE].
Posa: [POSA].
Stesso personaggio, stessi vestiti e stessi colori delle immagini precedenti di [NOME]. Sfondo magenta piatto #FF00FF, rivolto a destra, figura intera.
```

Per la camminata chiedi i quattro fotogrammi uno alla volta: «camminata, fotogramma 1 di 4: gamba destra avanti», poi «fotogramma 2 di 4: gambe vicine, passaggio», «3 di 4: gamba sinistra avanti», «4 di 4: passaggio».

### Pose da chiedere (nome file → descrizione da mettere nel prompt)

| File | Posa |
|---|---|
| `idle_1` | in guardia, fermo, pugni alzati, peso sulle gambe |
| `walk_1` … `walk_4` | camminata, i quattro fotogrammi sopra |
| `run_1` … `run_2` | corsa, busto in avanti |
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
| `bat_walk_1`, `bat_swing_1` | con una mazza da baseball in mano: camminata; colpo |
| `pipe_swing_1` | colpo con un tubo di ferro |
| `revive_1` | inginocchiato che aiuta un compagno a terra |
| `sit_1` | seduto su un sedile della metro |

### I Warriors (giubbotto/gilet di pelle marrone senza maniche, senza scritte)

| Set | Descrizione da incollare |
|---|---|
| `swan` | uomo bianco sui vent'anni, statura media, asciutto e atletico; capelli castano chiaro lisci di media lunghezza pettinati all'indietro; gilet di pelle marrone aperto sul petto nudo, jeans, stivali |
| `ajax` | uomo bianco, alto e massiccio; capelli castano scuro corti; guanti di pelle senza dita; espressione provocatoria; gilet di pelle marrone sul petto nudo, jeans |
| `snow` | uomo afroamericano, alto, braccia lunghe; capigliatura afro altissima e squadrata; espressione calma; gilet di pelle marrone, pantaloni scuri |
| `cowboy` | uomo bianco giovane, statura media, viso da ragazzo; cappello da cowboy chiaro sempre in testa; gilet di pelle marrone, jeans |
| `cochise` | uomo afroamericano, medio-alto e agile; treccine e afro, fascia sulla fronte, collana di perline; gilet di pelle marrone sul petto nudo, pantaloni a zampa |
| `vermin` | uomo bianco tarchiato e robusto; capelli castani corti e spettinati; faccia stanca e scocciata; gilet di pelle marrone, maglietta, jeans |
| `rembrandt` | ragazzo ispanico, il più giovane e minuto del gruppo; ricci neri folti; borsa a tracolla con bombolette spray; gilet di pelle marrone, jeans |
| `fox` | uomo bianco esile e slanciato; capelli biondo-castani ricci e folti; aria da ragazzo di buona famiglia; gilet di pelle marrone, camicia aperta |
| `cleon` | uomo afroamericano alto, robusto e imponente; bandana leopardata in testa, capelli rasati ai lati; sguardo severo da capo; gilet di pelle marrone |
| `mercy` | ragazza giovane, magra e minuta; capelli castano scuro ricci e vaporosi; giacca di lana grigio-marrone logora, maglietta scollata, minigonna viola, stivali alti |

Pose speciali da aggiungere:
- `swan`: `knife_1` (coltello a scatto in mano), `knifethrow_1` (lancia il coltello), `hand_1` (mano nella mano verso destra, per stare accanto a Mercy).
- `ajax`: `novest_idle_1`, `novest_punch_1` (senza gilet, a petto nudo), `arrest_1` (a terra ammanettato).
- `rembrandt`: `spray_1` (spruzza con la bomboletta), `pinned_spray_1` (a terra, spruzza verso l'alto).
- `cochise`, `vermin`: `turnstile_1` (scavalca un tornello con un salto).
- `mercy`: `idle_1`, `walk_1`…`walk_4`, `run_1`, `hair_1` (si sistema i capelli, seduta), `hand_1` (mano nella mano verso sinistra), `sit_1`, `cover_1` (si ripara).

### Bande e altri personaggi

Pose base: `idle_1`, `walk_1`…`walk_4`, `punch_1`, `hurt_1`, `down_1`, più le pose speciali indicate.

| Set | Descrizione | Pose speciali |
|---|---|---|
| `fury` | membro di una banda vestita da squadra di baseball: divisa gessata, berretto, viso dipinto a colori come una maschera; mazza da baseball | `windup_1` (carica lo swing), `swing_1`, `nobat_punch_1` (disarmato) |
| `fury_boss` | come sopra, il capo: trucco diverso e più vistoso, più grosso | `windup_1`, `swing_1` |
| `turnbull` | skinhead calvo e grosso, canotta di jeans senza maniche, catene | `charge_1` (carica a testa bassa) |
| `turnbull_fast` | skinhead calvo magro e veloce | `charge_1` |
| `orphan` | ragazzo di strada povero, maglietta sdrucita, nessun colore di banda | `board_swing_1` (colpo con un'asse) |
| `sully` | capo degli Orphans, maglietta e giubbotto di jeans, aria spavalda | — |
| `lizzie` | ragazza di una banda femminile anni '70, abiti eleganti da festa | `gun_aim_1`, `gun_shoot_1` (pistola), `push_1` |
| `lizzie_boss` | la capa delle Lizzies, più sicura, abito scuro | `gun_aim_1` |
| `punk` | punk di strada con salopette e maglia a righe, **pattini a rotelle** ai piedi | `skate_1`, `skate_2` (pattina), `grab_1` (presa) |
| `punk_boss` | capo dei Punks, più grosso, salopette di jeans, pattini | `skate_1`, `grab_1` |
| `rogue` | membro di una banda sguaiata, giacca di pelle nera, aria folle | `bottle_throw_1` |
| `luther` | capo dei Rogues: magro, capelli scuri unti, sorriso folle, giacca scura | `gun_aim_1`, `bottles_1` (tre bottiglie vuote infilate tra le dita), `knifehit_1` (coltello piantato nel braccio), `down_1` |
| `police` | poliziotto di New York anni '70, divisa blu, berretto | `baton_swing_1` (manganello), `charge_1` |
| `police_woman` | poliziotta in borghese seduta su una panchina, aria innocua | `sit_1`, `arrest_1` |
| `cyrus` | carismatico capo della banda più grande della città, in piedi su un palco, braccia aperte mentre parla | `speech_1`, `shot_1` (colpito) |
| `riff` | membro di una banda disciplinata in tenuta da arti marziali | `idle_1` |
| `masai` | luogotenente dei Riffs, tenuta da arti marziali scura, sguardo duro | `idle_1` |

---

## 3. Fondali (cartella `assets/incoming/fondali/`)

Uno per area, anche in più pezzi da affiancare. Nome: `<area>_a.png`, `<area>_b.png`, `<area>_c.png` (da sinistra a destra). Quanti pezzi: 1 per le aree larghe 1280, 2 per 1920, 2 o 3 per 2560 e oltre (tabella in `docs/SPRITE_MANCANTI.md`).

```
Fondale per picchiaduro a scorrimento laterale, area [AREA]: [DESCRIZIONE DEL LUOGO]. Luce: [notte / alba / sera].
Vista laterale piatta, nessun personaggio. Il pavimento dove si cammina (marciapiede, asfalto, banchina, sentiero) occupa la fascia in basso, dal 65% dell'altezza fino al fondo, piatto e libero da ostacoli; sopra, muri, palazzi, alberi o cielo.
[Se è un pezzo successivo:] È la continuazione verso destra del pezzo precedente: stessa luce, stessa linea del pavimento, stessi materiali.
Formato 1536×1024.
```

| Area | Luogo da descrivere |
|---|---|
| `P0-01`, `P0-02`, `P0-03` | Coney Island la sera: lungomare, montagne russe e ruota panoramica spente sullo sfondo, insegne al neon, marciapiede |
| `P0-04` | banchina della metropolitana sopraelevata di Coney Island, sera |
| `C1-01`, `C1-02` | un grande parco del Bronx di notte, migliaia di ragazzi delle bande ammassati sullo sfondo davanti a un palco illuminato da fari |
| `C1-03` | parco di notte, alberi, siepi, prato calpestato, fuga |
| `C1-04` | sottopasso di cemento con scala che sale, luci al neon rotte |
| `C2-01`, `C2-03` | strada del Bronx di notte, palazzi di mattoni, scale antincendio, negozi chiusi con saracinesche, cassonetti |
| `C2-02` | vicolo stretto tra palazzi di mattoni, cancello di rete in fondo, bidoni |
| `C2-04`, `C3-04`, `C6-01`, `C6-04` | banchina della metropolitana sotterranea anni '70, piastrelle sporche, colonne, graffiti, binari in basso |
| `C3-01`, `C3-03` | quartiere povero del Bronx, palazzi semidistrutti, auto abbandonate, bidoni con il fuoco |
| `C3-02` | cortile interno tra case popolari, fili da stendere, muri scrostati |
| `C4-01` … `C5-01` | parco lungo il fiume a Manhattan di notte, lampioni, panchine, alberi, il fiume scuro sullo sfondo |
| `C5-02`, `C5-03` | appartamento anni '70: divani, tende, luci soffuse viola, giradischi, porta d'ingresso |
| `C5-04` | tunnel di servizio della metropolitana, tubi, luci di emergenza, binari |
| `C5-05` | strada di Manhattan di notte verso una grande piazza, vapore dai tombini |
| `C6-02`, `C6-03` | bagno pubblico sotterraneo della metropolitana: fila di gabinetti con porte, lavandini, specchi crepati, piastrelle |
| `C7-01` | interno di un vagone della metropolitana anni '70 coperto di graffiti, sedili lungo i lati, finestrini con l'alba che passa |
| `C7-02` | stazione sopraelevata di Coney Island all'alba |
| `C8-01`, `C8-02` | Coney Island all'alba, lungomare deserto, giostre ferme, insegne spente |
| `C8-03`, `C8-04` | spiaggia di Coney Island all'alba, sabbia, mare calmo, il molo sullo sfondo |

---

## 4. Scene (cartella `assets/incoming/scene/`)

Illustrazioni per le scene e le transizioni a fumetto. Nome: l'ID della scena, per esempio `cine_cyrus.png` (elenco in `docs/SCENE_E_VIDEO.md`).

```
Illustrazione per una scena del gioco, inquadratura cinematografica, stesso stile pixel art, formato 1536×1024, nessun testo.
Scena: [DESCRIZIONE: chi c'è, cosa succede, dove, che luce].
Personaggi: [incolla le descrizioni dei personaggi presenti].
```

Esempi da cui partire: Cyrus sul palco davanti alla folla (`cine_cyrus`); lo sparo e il caos al raduno (`cine_accusation`); i Furies che compaiono sotto i lampioni del parco (`cine_furies_appear`); Ajax ammanettato sulla panchina (`cine_ajax_arrest`); le Lizzies con le pistole davanti alla porta chiusa (`cine_lizzies_trap`); Swan e Mercy nei tunnel (`cine_swan_mercy`); Mercy che si sistema i capelli e Swan che le ferma la mano sul treno all'alba (`talk_c7_couple`); Luther al finestrino con le tre bottiglie (`cine_bottles`); il coltello di Swan che colpisce il braccio di Luther sulla spiaggia (`cine_disarm`); i Warriors sulla spiaggia all'alba (`cine_epilogue`).

---

## 5. Oggetti, veicoli ed effetti (cartella `assets/incoming/oggetti/`)

```
Oggetto per il gioco: [OGGETTO], vista laterale, sfondo magenta piatto #FF00FF, nessun testo, formato quadrato 1024×1024.
```

Nome file = nome dell'oggetto: `bus_turnbull` (bus scolastico verde dipinto), `treno_esterno`, `auto_rogues`, `auto_orphans_fuoco`, `tornello`, `transenna`, `panchina`, `cestino`, `cassa`, `bidone`, `porta_gabinetto`, `lavandino`, `giradischi`, `sedia`, `bomboletta`, `coltello`, `pistola`, `bottiglia`, `mazza`, `tubo`, `asse`, `manganello`, `fx_spruzzo`, `fx_scintille`, `fx_polvere`, `fx_fuoco`, `fx_vetro`, `fx_sparo`.

---

## 6. Ritratti (cartella `assets/incoming/ritratti/`)

```
Ritratto a mezzo busto di [NOME] — [DESCRIZIONE], di tre quarti verso destra, stesso stile pixel art, sfondo magenta piatto #FF00FF, formato quadrato 1024×1024.
```

Nome file = set del personaggio (`swan.png`, `mercy.png`…). Servono per la selezione del Warrior e per l'HUD.

---

## Note

- **Magenta invece di trasparente**: ChatGPT a volte disegna una finta scacchiera al posto della trasparenza; il magenta piatto si toglie senza errori. Se però il PNG esce davvero trasparente, va bene uguale.
- **Pixel art vera**: le immagini di ChatGPT non hanno una griglia di pixel esatta; al momento dell'inserimento vengono ridotte e ripulite nella palette per somigliare alle tavole della Raccolta 04.
- **Coerenza**: rigenera finché lo stesso personaggio è riconoscibile da una posa all'altra (stessi capelli, stesso gilet, stessi colori). Una posa sbagliata nel gioco si nota più di una posa mancante.
- Le immagini della Raccolta 04 restano finché non arrivano quelle nuove: si possono sostituire anche una alla volta.
