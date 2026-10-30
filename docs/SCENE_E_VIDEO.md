# Scene e video

Ogni transizione del gioco è una scena con un ID. Oggi tutte sono fatte con gli sprite (personaggi che si muovono, sottotitoli, dissolvenze, titoli). Ognuna si può sostituire con un video senza toccare il resto: alla fine del video il gioco applica gli stessi passaggi di trama della scena.

## Come sostituire una scena con un video

1. Salvare il file in `assets/video/` con il nome dell'ID, per esempio `assets/video/cine_cyrus.mp4` (H.264, 1280×720 o 1920×1080, audio AAC).
2. Aggiungere una riga in `js/videos.js`: `cine_cyrus: 'assets/video/cine_cyrus.mp4',`
3. Se il video non parte o manca, il gioco usa la scena con gli sprite.

Il video si salta con Esc → Salta scena, come le altre scene.

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
| C1-04 | traversal | Sottopasso | `metro_b` |
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
