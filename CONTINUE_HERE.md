# Riprendere The Warriors · Night Run

Checkpoint aggiornato il 29 ottobre 2026 (sera). **Decisione dell'autore: le tavole della Raccolta 04 sono la grafica giusta e approvata; lo stile del gioco è la loro pixel art.** Questo file serve a continuare da qualsiasi chat o assistente senza ricostruire le decisioni.

## Stato verificato

- Progettazione baseline 1.0: invariata (docs/, design/campaign.json).
- **Nucleo giocabile 0.4** (fase B del piano + inizio fase C): `index.html` + `js/`. Aree C4-02 e C4-03 complete con ondate, veterano con barra élite e fasi, uscita con conferma 0,6 s, schermata risultato. C4-01 (fuga) e C4-04 (scena di Ajax) **non implementate**; nessun altro capitolo implementato.
- Moduli: `config.js` (valori di COMBAT_AND_SYSTEMS/CAST), `input.js`, `sim.js` (attori, colpi con ID e insieme bersagli, prese, armi, coordinatore, CPU, KO/soccorso, snapshot), `areas.js` (dati C4-02/C4-03), `render.js`, `audio.js`, `main.js` (flusso, menu, save `warriors-story-v1`, opzioni `warriors-options-v1`), `atlas_data.js` (generato).
- Codice scritto da zero seguendo i documenti; nessuna routine copiata da Primal Sentinels II.

## Grafica approvata

**Raccolta 04** (`assets/source/raccolta_04`), approvata dall'autore il 29 ottobre 2026: quattro tavole pixel art in `Sorgenti/Nuove_tavole/` (Warriors con camminata, attacchi, calci, colpiti e pose a terra; Baseball Furies anche incappucciati; Orphans, Punks, Lizzies, Rogues, polizia, civili; armi, props, effetti; fondali parco, metro, vicolo, porto, Coney Island) e 15 ritagli di fondali. Hash in `assets/source/inventory.json`.

Lavoro tecnico per l'integrazione: scontornare il fondo nero (atlante_03_02, personaggi_nemici_fondali_04 e 7 ritagli senza alpha), ritagliare i frame, pivot ai piedi, sequenze, separare props e livelli dei fondali, registrare l'associazione figura → personaggio.

## Grafica provvisoria ancora nel gioco

La prova C4 attuale usa ancora le tavole illustrate de893e (warrior_a_8pose), ff5f23 (fury_8pose) e il parco illustrato, ora **superate** dalla Raccolta 04. Vanno sostituite. Restano in `assets/source` come storico, insieme alla tavola pixel etichettata e all'Asset Pack 02 (`assets/source/pack_02`), che contiene atlanti precedenti dello stesso stile.

## Verifiche eseguite (`node tools/qa.js`)

PASS: Q01, Q02, Q05, Q06, Q09 (singolo, finestra soccorso, soccorso CPU), Q18, coordinatore max 1 attaccante in singolo. Percorso completo C4-02→C4-03→risultato con due CPU, senza errori JS, ripetuto su più semi. Correzioni emerse dai test: CPU incastrata dietro una panchina (aggiramento aggiunto, Q08), CPU che restava sola quando la finestra di soccorso dell'umano scadeva (ora retry).

Non eseguito: playtest umano reale, controller fisici, due tastiere (rollover), Safari/Firefox, bilanciamento.

## Prossime azioni

1. Playtest umano della prova C4; regolare tempi e danni.
2. Ritagliare le tavole approvate della Raccolta 04 e sostituire nella prova C4 Warrior, Furies, fondale, oggetti ed effetti; registrare figura → personaggio.
3. C4-01 (fuga) e C4-04 (scena), poi P0 e C1 secondo LEVELS.md.
4. Musica/voci reali al posto dei suoni sintetizzati.

## Regole di continuità

Salvare ogni lotto su GitHub e aggiornare questo checkpoint. Distinguere source, processed, integrated e verified. Non ricominciare la progettazione. Non spacciare ripieghi per asset finali.
