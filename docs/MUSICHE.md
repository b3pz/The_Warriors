# Musiche originali

Il gioco è pronto per le tracce vere. Finché non ce ne sono suona la musica sintetizzata; appena una traccia è assegnata a un momento, il synth tace lì e restano ambienti, effetti e la radio.

## Il modo più semplice: l'album del film

Carica i file dell'album «The Warriors – Original Motion Picture Soundtrack» (1979) in `assets/incoming/musica/`, con qualsiasi nome purché contenga il titolo del brano (es. `02 Nowhere to Run.mp3`). L'automazione del repository li riconosce, li copia in `assets/music/` e il gioco li usa nei momenti scritti in `W.MUSIC_MOMENTS` (`js/musiche.js`):

| Brano | Dove suona (provvisorio) |
|---|---|
| Theme from «The Warriors» | menu, apertura sulla Wonder Wheel |
| You're Movin' Too Slow | tutte le fughe |
| The Fight | tutte le risse |
| In Havana | territorio degli Orphans |
| Baseball Furies Chase | Riverside Park, i Furies |
| Nowhere to Run | le Lizzies |
| Echoes in My Mind | Union Square |
| Love Is a Fire | l'ultimo treno all'alba |
| Last of an Ancient Breed | l'arrivo a Coney Island, sotto il molo |
| In the City | la spiaggia all'alba e i titoli di coda |

Il bagno dei Punks resta in silenzio. I brani mancanti non danno errori: in quei momenti resta la musica sintetizzata.

## Come si aggiunge una traccia

1. Metti il file in `assets/music/` (mp3 consigliato, 192–320 kbps; vanno anche ogg e m4a).
2. Apri `js/musiche.js` e aggiungi una riga: `'C4-02:fight': 'assets/music/furies_rissa.mp3',`
3. Opzioni per riga: `{ src: '…', loop: true, vol: 0.8, start: 3.2, fade: 2 }`. Le scene di default non ripetono la traccia, le aree sì.

Se un file manca o non si apre, il gioco passa alla chiave seguente senza bloccarsi. Il volume è quello di Opzioni → «Musica e ambiente».

## Ordine di ricerca

Per ogni momento vince la prima chiave trovata:

1. ID della scena (`cine_cyrus`, `radio_hunt`…)
2. area + situazione (`C4-02:fight`)
3. area (`C4-02`)
4. capitolo + situazione (`C4:fight`), poi capitolo (`C4`)
5. situazione generica: `explore`, `fight`, `chase`, `scene`, `radio`, `dawn`, `silence`
6. schermate: `menu`, `gameover`, `credits`

Con poche tracce basta la riga 5 (una per situazione); con la colonna sonora completa si scende fino alle singole scene. La stessa traccia su due momenti di fila continua senza ripartire. Il valore `'silence'` spegne la musica in quel punto.

## Situazioni

| Chiave | Quando |
|---|---|
| `explore` | camminata, dialoghi liberi, allenamento |
| `fight` | durante un'ondata di nemici |
| `chase` | fughe a tempo e inseguitori |
| `scene` | scene con gli sprite (se la scena non ha una sua chiave) |
| `radio` | interventi della DJ |
| `dawn` | aree all'alba (C7, C8) |
| `silence` | aree dove il film tace (C4-01, bagni C6-02) |

## Aree

| Area | Tipo | Titolo | Situazioni possibili |
|---|---|---|---|
| `P0-01` | esplorazione | None | explore |
| `P0-02` | allenamento | None | explore |
| `P0-03` | allenamento | None | explore |
| `P0-04` | scena | None | scene |
| `C1-01` | esplorazione | None | explore |
| `C1-02` | scena | None | scene |
| `C1-03` | fuga | None | chase, fight |
| `C1-04` | esplorazione | None | explore |
| `C2-01` | esplorazione | None | explore |
| `C2-02` | rissa | None | explore, fight |
| `C2-03` | fuga | None | chase, fight |
| `C2-04` | fuga | None | chase, fight |
| `C3-01` | scena | None | scene |
| `C3-02` | rissa | None | explore, fight |
| `C3-03` | fuga | None | chase, fight |
| `C3-04` | fuga | None | chase, fight |
| `C4-01` | fuga | None | chase, fight |
| `C4-02` | rissa | None | explore, fight |
| `C4-03` | rissa | None | explore, fight |
| `C4-04` | scena | None | scene |
| `C5-01` | scena | None | scene |
| `C5-02` | esplorazione | None | explore |
| `C5-03` | fuga | None | chase, fight |
| `C5-04` | esplorazione | None | explore |
| `C5-05` | esplorazione | None | explore |
| `C6-01` | esplorazione | None | explore |
| `C6-02` | furtività | None | silence |
| `C6-03` | rissa | None | explore, fight |
| `C6-04` | esplorazione | None | explore |
| `C7-01` | esplorazione | None | explore |
| `C7-02` | scena | None | scene |
| `C8-01` | esplorazione | None | explore |
| `C8-02` | rissa | None | explore, fight |
| `C8-03` | confronto finale | None | explore, fight |
| `C8-04` | epilogo | None | scene, dawn |

## Scene

Gli ID sono gli stessi dei video (`docs/SCENE_E_VIDEO.md`); quelli che iniziano con `radio_` sono la DJ.

`cine_accusation`, `cine_ajax_arrest`, `cine_ajax_stays`, `cine_bathroom_chaos`, `cine_bottles`, `cine_cyrus`, `cine_departure`, `cine_disarm`, `cine_epilogue`, `cine_furies_appear`, `cine_home_arrival`, `cine_lizzies_trap`, `cine_mercy_joins`, `cine_police_split`, `cine_reunion`, `cine_reunion_approach`, `cine_riffs_arrival`, `cine_swan_leads`, `cine_swan_mercy`, `cine_train_dawn`, `cine_train_escape`, `cine_truth_reaches_riffs`, `dlg_c1_arrival`, `dlg_c2_bus`, `dlg_c2_run`, `dlg_c3_fire`, `dlg_c3_orphans`, `dlg_c4_ajax`, `dlg_c4_stand`, `dlg_c5_welcome`, `dlg_c6_bathroom`, `dlg_p0_introductions`, `dlg_p0_welcome`, `radio_96th`, `radio_apology`, `radio_hunt`, `talk_c7_couple`

## Momenti dove una traccia vera conta di più

- `cine_opening` — l'apertura con la Wonder Wheel di notte, prima del ritrovo: è il posto del brano «Wonder Wheel» di Barry De Vorzon.
- `menu` — tema principale sulla copertina.
- `cine_cyrus` — il discorso al raduno (consigliato `loop: false`).
- `C1-03` / `chase` — la fuga dal parco dopo lo sparo.
- `radio` — la DJ: un pezzo d'epoca soul/funk filtrato.
- `C4:fight` — i Furies nel parco.
- `cine_lizzies_trap` — la trappola, musica lenta e sensuale che si spezza.
- `C7-01` / `dawn` — il treno all'alba verso Coney Island.
- `credits` — il ritorno a casa, titoli di coda.
- `gameover` — breve, si sente sotto la voce della DJ.

Le canzoni del film sono protette da diritti separati da quelli del film: usale solo se la licenza le copre.
