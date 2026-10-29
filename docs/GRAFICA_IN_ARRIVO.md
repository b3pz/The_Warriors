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
