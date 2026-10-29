# Riprendere The Warriors · Night Run

Checkpoint aggiornato il 29 ottobre 2026 (sera), dopo «puoi sviluppare questo?» e la consegna delle tavole in chat. Questo file serve a continuare da qualsiasi chat o assistente senza ricostruire le decisioni.

## Stato verificato

- Progettazione baseline 1.0: invariata (docs/, design/campaign.json).
- **Nucleo giocabile 0.4** (fase B del piano + inizio fase C): `index.html` + `js/`. Aree C4-02 e C4-03 complete con ondate, veterano con barra élite e fasi, uscita con conferma 0,6 s, schermata risultato. C4-01 (fuga) e C4-04 (scena di Ajax) **non implementate**; nessun altro capitolo implementato.
- Moduli: `config.js` (valori di COMBAT_AND_SYSTEMS/CAST), `input.js`, `sim.js` (attori, colpi con ID e insieme bersagli, prese, armi, coordinatore, CPU, KO/soccorso, snapshot), `areas.js` (dati C4-02/C4-03), `render.js`, `audio.js`, `main.js` (flusso, menu, save `warriors-story-v1`, opzioni `warriors-options-v1`), `atlas_data.js` (generato).
- Codice scritto da zero seguendo i documenti; nessuna routine copiata da Primal Sentinels II.

## Asset (assets/source/inventory.json con sha256)

| File | Stato | Uso |
|---|---|---|
| warrior_a_8pose.png | integrated | 8 pose ritagliate in assets/sprites/warrior_a_*.png, usate per **tutti** i Warriors della prova. Identità (Swan?) non confermata dall'autore |
| fury_8pose.png | integrated | 8 pose in fury_*.png; varianti senza mazza fury_nobat_* ricavate in automatico (buchi sui pantaloni nel cammino, mano tagliata a terra): **ripiego da sostituire** |
| park_night.png | integrated | fondale 720 px ripetuto a specchio per aree di due schermate |
| pixel_sheet_c4_cast_props_bg.png | source | tavola pixel art etichettata (Swan, Ajax, Furies, Orphans, Turnbull, Polizia, oggetti, FX, HUD, fondali a livelli). Stile diverso dalle tavole illustrate: **decidere quale stile è definitivo** prima di ritagliarla |

Non è stato possibile verificare che questi file coincidano con gli allegati de893e/ff5f23/65bc58 citati in precedenza (ricevuti di nuovo senza nome).

## Pose mancanti per completare C4 (rilevate in integrazione)

Warrior: a terra/KO, rialzata, swing orizzontale con mazza, camminata con mazza, presa, lancio, schivata, calcio volante. Fury: pose a mani nude (idle, cammino, spinta), rialzata, lanciato. Props in primo piano nello stile del fondale: panchina e cestino separati (ora disegnati a codice). Ogni Warrior della campagna ha bisogno del proprio set.

## Verifiche eseguite (`node tools/qa.js`)

PASS: Q01, Q02, Q05, Q06, Q09 (singolo, finestra soccorso, soccorso CPU), Q18, coordinatore max 1 attaccante in singolo. Percorso completo C4-02→C4-03→risultato con due CPU, senza errori JS, ripetuto su più semi. Correzioni emerse dai test: CPU incastrata dietro una panchina (aggiramento aggiunto, Q08), CPU che restava sola quando la finestra di soccorso dell'umano scadeva (ora retry).

Non eseguito: playtest umano reale, controller fisici, due tastiere (rollover), Safari/Firefox, bilanciamento.

## Prossime azioni

1. Playtest umano della prova C4; regolare tempi e danni.
2. Decidere lo stile definitivo (illustrato vs pixel) e produrre le pose mancanti elencate sopra.
3. C4-01 (fuga) e C4-04 (scena), poi P0 e C1 secondo LEVELS.md.
4. Musica/voci reali al posto dei suoni sintetizzati.

## Regole di continuità

Salvare ogni lotto su GitHub e aggiornare questo checkpoint. Distinguere source, processed, integrated e verified. Non ricominciare la progettazione. Non spacciare ripieghi per asset finali.
