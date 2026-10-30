# Come aggiungere o sostituire la grafica

La grafica attuale viene dalla Raccolta 04 approvata ed è **provvisoria rispetto al lotto completo** (circa 2.000 immagini in arrivo, 29 ottobre 2026). Il gioco legge solo i file generati dagli strumenti qui sotto: sostituire o aggiungere immagini non richiede di cambiare il codice di gioco.

## Dove finisce ogni cosa

| Cosa | Sorgente | Strumento | Risultato usato dal gioco |
|---|---|---|---|
| Personaggi e nemici | tavole in `assets/source/…` | `tools/build_pixel_sprites.py` + `tools/pixel_frames.json` | `assets/sprites_px/<set>.png`, `js/atlas_px.js` |
| Fondali | ritagli in `assets/source/…/Fondali` | `tools/build_backgrounds.py` | `assets/backgrounds_px/<id>.png`, `js/backgrounds_px.js` |
| Menu | `assets/menu/cover.jpg` | — | schermata del titolo e menu |
| Video delle scene | `assets/video/<id>.mp4` | `js/videos.js` | vedi `docs/SCENE_E_VIDEO.md` |

## Formato più comodo per le immagini nuove

Funziona tutto, anche le tavole miste. Questi accorgimenti fanno risparmiare il ritaglio a mano:

- **Una cartella per personaggio** con il nome del set: `swan`, `ajax`, `snow`, `cowboy`, `cochise`, `vermin`, `rembrandt`, `fox`, `cleon`, `mercy`, `luther`, `cyrus`, `masai`, `fury`, `fury_hood`, `turnbull`, `orphan`, `punk`, `lizzie`, `rogue`, `police`, `civilian`.
- **Un PNG per posa con sfondo trasparente**, nome `posa_numero.png`: `idle_1`, `walk_1…walk_4`, `punch_1`, `kick_1`, `heavy_1`, `jump_1`, `hurt_1`, `down_1`, e per i Furies anche `windup_1`, `swing_1`.
- Pose che oggi mancano e sono le più utili: rialzata, presa, lancio, schivata, Warriors con la mazza, Furies e Punks a mani nude che colpiscono, Lizzie che spara, Rogue che lancia la bottiglia, Luther con la pistola.
- Personaggi sempre rivolti **verso destra**, piedi sulla stessa riga, stessa scala fra tutte le tavole.
- **Fondali**: un file per ambiente, largo (anche 3–4 schermate), con il pavimento nella parte bassa. Se arrivano a livelli separati (cielo, palazzi, pavimento, primo piano), meglio: si aggiunge la parallasse.
- Ambienti usati dalla campagna: parco, metro/banchina, vicolo, strada, porto, interno (appartamento Lizzies, bagno di Union Square), vagone del treno, Coney Island, spiaggia all'alba. Oggi vagone, bagno, appartamento e spiaggia usano ripieghi.

## Associazione figura → personaggio

È in `tools/pixel_frames.json` ed è **provvisoria**: è stata dedotta da abiti e capelli delle tavole, non confermata dall'autore. Correggerla lì e rilanciare `python3 tools/build_pixel_sprites.py`. La tavola `assets/sprites_px/_controllo.png` mostra tutte le pose di tutti i set con la linea dei piedi.

## Aspetto dei personaggi (descrizioni dell'autore, 30 ottobre 2026)

Le figure delle tavole attuali sono state associate a queste descrizioni. **Sicuri**: Swan, Fox, Snow, Cochise, Rembrandt, Cowboy, Mercy. **Senza una figura adatta, da disegnare**: Cleon, Ajax, Vermin.

| Personaggio | Aspetto da rispettare |
|---|---|
| Cleon | afroamericano, robusto, alto e imponente; bandana leopardata, capelli rasati ai lati; sguardo severo |
| Swan | bianco, statura media, asciutto e atletico; capelli castano chiaro lisci, media lunghezza, all'indietro; gilet aperto sul petto nudo |
| Ajax | bianco, alto, massiccio; capelli castano scuro corti; guanti di pelle senza dita; espressione provocatoria |
| Fox | bianco, esile e slanciato; capelli biondo-castani ricci e folti; aria da ragazzo dei quartieri alti |
| Cowboy | bianco, statura media; viso giovanile; cappello Stetson chiaro, sempre |
| Rembrandt | ispanico, il più giovane e minuto; ricci neri folti; borsa a tracolla con le bombolette spray |
| Snow | afroamericano, alto, braccia lunghe; afro altissimo e geometrico; espressione calma |
| Cochise | afroamericano, medio-alto, agile; treccine/afro, collana di perline, pantaloni a zampa |
| Vermin | bianco, tarchiato e robusto; capelli castani corti e spettinati; faccia stanca o scocciata |
| Mercy | giovane, magra e minuta; capelli castano scuro ricci e vaporosi; giacca di lana grigio-marrone logora, maglietta scollata, minigonna viola, stivali alti |

Pose che servono di più per ogni Warrior: riposo, camminata (4), pugno, calcio, pesante, salto, colpito, a terra, rialzata; per Rembrandt anche lo spruzzo con la bomboletta; per Swan il lancio del coltello; per Mercy camminata, attesa e la mano nella mano con Swan.
