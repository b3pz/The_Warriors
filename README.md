# The Warriors · Night Run

Beat ’em up 2D: una notte attraverso New York, dal ritrovo dei Warriors al ritorno a Coney Island all'alba.

> **Sei un assistente AI incaricato di creare le immagini del gioco?** Leggi [`IMMAGINI_PER_AI.md`](IMMAGINI_PER_AI.md): stile, elenco completo dei file da creare in ordine di priorità e dove caricarli (solo in `assets/incoming/`). Per i **video** (inserti nelle scene): [`VIDEO_PER_AI.md`](VIDEO_PER_AI.md).

## Giocare online

Con GitHub Pages attivo (Settings → Pages → Deploy from a branch → `main`, cartella `/ (root)`) il gioco è su https://b3pz.github.io/The_Warriors/

## Stato

**Versione 0.5: tutta la storia è giocabile**, dal prologo a Coney Island ai crediti: 35 aree, 15 tipi di nemici, 31 scene con dialoghi. Grafica pixel art della Raccolta 04 approvata (lotto completo in arrivo, vedi `docs/GRAFICA_IN_ARRIVO.md`); audio sintetizzato provvisorio, pronto per le tracce originali (`docs/MUSICHE.md`). Ogni scena può diventare un video: `docs/SCENE_E_VIDEO.md`. Modalità Arcade: le risse della storia da 1 a 4 giocatori.

Aprire `index.html` in un browser (o `dist/night-run.html`, un unico file con le immagini incluse). Si gioca anche da telefono in orizzontale, con comandi touch. Verifiche: `node tools/qa.js`, `qa_campaign.js`, `qa_exits.js`, `qa_stealth.js`, `qa_mobile.js` (Playwright). Sprite e fondali mancanti: `docs/SPRITE_MANCANTI.md`. Stato dettagliato in [CONTINUE_HERE.md](CONTINUE_HERE.md).

Partire da [GAME_DESIGN.md](docs/GAME_DESIGN.md), indice della baseline 1.0.

- [Cast e gang](docs/CAST.md)
- [Combattimento e sistemi](docs/COMBAT_AND_SYSTEMS.md)
- [Tutti i livelli, area per area](docs/LEVELS.md)
- [Regia e dialoghi](docs/NARRATIVE.md)
- [Grafica e audio](docs/ART_AND_AUDIO.md)
- [Musiche originali: dove metterle](docs/MUSICHE.md)
- [Prompt per ChatGPT: le immagini e dove caricarle](docs/PROMPT_CHATGPT.md)
- [Inventario asset](docs/ASSET_PLAN.md)
- [Piano produttivo e verifiche](docs/PRODUCTION_AND_QA.md)
- [Memoria delle decisioni](docs/PROJECT_MEMORY.md)
- [Campagna strutturata](design/campaign.json) e [catalogo asset](design/asset_catalog.json)

Reference tecnica scelta dall'autore: [Primal Sentinels II](https://github.com/b3pz/Primal_sentinel_II), analisi statica del commit 7817d4c2cf121dd43ded6d72532f47b3ed7a154f.

La richiesta è definire prima tutto il gioco e poi costruirlo. Tre immagini sono state ricevute come reference esterne; nessuna nuova tavola, musica o motore è stata importata in questa consegna. I percorsi nei cataloghi sono destinazioni di produzione, non file già esistenti.
