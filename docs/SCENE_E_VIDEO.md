# Scene e video

Ogni transizione del gioco è una scena con un ID. Oggi tutte sono fatte con gli sprite (personaggi che si muovono, sottotitoli, dissolvenze, titoli). Ognuna si può sostituire con un video senza toccare il resto: alla fine del video il gioco applica gli stessi passaggi di trama della scena.

## Come sostituire una scena con un video

1. Salvare il file in `assets/video/` con il nome dell'ID, per esempio `assets/video/cine_cyrus.mp4` (H.264, 1280×720 o 1920×1080, audio AAC).
2. Aggiungere una riga in `js/videos.js`: `cine_cyrus: 'assets/video/cine_cyrus.mp4',`
3. Se il video non parte o manca, il gioco usa la scena con gli sprite.

Il video si salta con Esc → Salta scena, come le altre scene.

## Inserti video (clip brevi dentro le scene)

Oltre a sostituire una scena intera, una scena può contenere un **inserto**: il passo `['clip', 'v_nome']` ferma la scena, mostra la clip a tutto schermo (disegnata nel canvas, senza audio, sotto didascalie e bande nere) e poi la scena riprende. Si salta con Invio. Se il file manca, il passo non fa niente.

- Elenco, prompt e priorità per l'AI: [`VIDEO_PER_AI.md`](../VIDEO_PER_AI.md) (18 clip).
- Caricamento: `assets/incoming/video/v_nome.mp4` → l'Action li comprime (H.264 720p, senza audio) in `assets/video/` e li scrive in `js/videos_auto.js`.
- `v_radio_dj` è speciale: video in ciclo usato come sfondo di tutte le scene della radio, con le frasi della DJ scritte sopra.
- `v_wonder_wheel` sostituisce l'inquadratura disegnata della ruota all'inizio di `dlg_p0_welcome`.

| Video | Scena |
|---|---|
| `v_radio_dj` | tutte le scene radio (sfondo in ciclo) |
| `v_wonder_wheel` | dlg_p0_welcome (apertura) |
| `v_train_night` | cine_departure |
| `v_conclave` | cine_cyrus (inizio) |
| `v_cyrus_shot` | cine_accusation (inizio) |
| `v_riffs_order` | radio_hunt (prima della radio) |
| `v_rembrandt_tag` | cine_cemetery_tag |
| `v_turnbull_bus` | dlg_c2_bus |
| `v_car_fire` | dlg_c3_fire |
| `v_furies_bats` | cine_furies_appear |
| `v_ajax_cuffs` | cine_ajax_arrest |
| `v_lizzies_lock` | cine_lizzies_trap |
| `v_punks_skates` | dlg_c6_bathroom |
| `v_train_dawn` | cine_train_dawn |
| `v_luther_bottles` | cine_bottles |
| `v_duel` | cine_disarm |
| `v_riffs_beach` | cine_riffs_arrival |
| `v_beach_dawn` | cine_epilogue |

Altri passi di scena: `['lights', true]` accende i lampeggianti della polizia ai bordi; `['pose', id, 'speech']` dà una posa a un personaggio di scena (`null` la toglie).

## Elenco degli ID

| ID | Dove |
|---|---|
| `cine_accusation` | cine_accusation |
| `cine_ajax_arrest` | cine_ajax_arrest |
| `cine_ajax_stays` | cine_ajax_stays |
| `cine_bathroom_chaos` | cine_bathroom_chaos |
| `cine_bottles` | cine_bottles |
| `cine_cyrus` | cine_cyrus |
| `cine_departure` | cine_departure |
| `cine_disarm` | cine_disarm |
| `cine_epilogue` | cine_epilogue |
| `cine_furies_appear` | cine_furies_appear |
| `cine_home_arrival` | cine_home_arrival |
| `cine_lizzies_trap` | cine_lizzies_trap |
| `cine_mercy_joins` | cine_mercy_joins |
| `cine_police_split` | cine_police_split |
| `cine_reunion` | cine_reunion |
| `cine_reunion_approach` | cine_reunion_approach |
| `cine_riffs_arrival` | cine_riffs_arrival |
| `cine_swan_leads` | cine_swan_leads |
| `cine_swan_mercy` | cine_swan_mercy |
| `cine_train_dawn` | cine_train_dawn, talk_c7_couple |
| `cine_train_escape` | cine_train_escape |
| `cine_truth_reaches_riffs` | cine_truth_reaches_riffs |
| `dlg_c1_arrival` | dlg_c1_arrival |
| `dlg_c2_bus` | dlg_c2_bus |
| `dlg_c2_run` | dlg_c2_run |
| `dlg_c3_fire` | dlg_c3_fire |
| `dlg_c3_orphans` | dlg_c3_orphans |
| `dlg_c4_stand` | dlg_c4_stand |
| `dlg_c5_welcome` | dlg_c5_welcome |
| `dlg_c6_bathroom` | dlg_c6_bathroom |
| `dlg_p0_introductions` |  |
| `dlg_p0_welcome` | dlg_p0_welcome |
| `radio_96th` | radio della DJ |
| `radio_apology` | radio della DJ |
| `radio_hunt` | radio della DJ |

Gli intermezzi della DJ a inizio capitolo hanno ID `radio_C1`…`radio_C8`; anche questi si possono sostituire con un video.

## Aree e fondali usati

| Area | Tipo | Nome | Fondale |
|---|---|---|---|
| P0-01 | traversal | Il ritrovo | `coney_b` |
| P0-02 | training | Allenamento | `coney_b` |
| P0-03 | training | Verso l'uscita | `coney` |
| P0-04 | scene | Partenza | `metro_b` |
| C1-01 | traversal | Il raduno | `park_b` |
| C1-02 | scene | Il discorso | `park` |
| C1-03 | escape | Fuga dal parco | `park` |
| C1-04 | traversal | Il cimitero di Woodlawn | `park` |
| C2-01 | traversal | Isolato del Bronx | `street` |
| C2-02 | arena | Vicolo con cancello | `alley` |
| C2-03 | escape | Corsa alle scale | `street_b` |
| C2-04 | escape | Banchina | `metro` |
| C3-01 | scene | Strada degli Orphans | `street` |
| C3-02 | arena | Cortile | `harbor` |
| C3-03 | escape | Strada laterale | `street_b` |
| C3-04 | escape | Stazione della 96ª Strada | `metro_b` |
| C4-01 | escape | Ingresso del parco | `park_b` |
| C4-02 | arena | Sentiero con panchine | `park` |
| C4-03 | arena | Radura | `park_b` |
| C4-04 | scene | Il bivio | `park` |
| C5-01 | scene | La panchina | `park_b` |
| C5-02 | traversal | L'appartamento | `interior` |
| C5-03 | escape | La trappola | `interior` |
| C5-04 | traversal | Sotterraneo | `metro_b` |
| C5-05 | traversal | Verso Union Square | `street` |
| C6-01 | traversal | Union Square | `metro_b` |
| C6-02 | stealth | I bagni | `interior` |
| C6-03 | arena | Il bagno | `interior` |
| C6-04 | traversal | Banchina | `metro` |
| C7-01 | traversal | L'ultimo treno | `metro` |
| C7-02 | scene | Casa | `metro_b` |
| C8-01 | traversal | Strada di casa | `coney_b` |
| C8-02 | arena | Il varco | `coney` |
| C8-03 | confront | La spiaggia | `boardwalk` |
| C8-04 | epilogue | Alba | `boardwalk` |
