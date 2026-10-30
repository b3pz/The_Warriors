'use strict';
// Tracce musicali originali. Senza righe resta la musica sintetizzata.
//
// Come aggiungere una traccia:
// 1. salva il file in assets/music/ (mp3 o ogg; m4a funziona su Safari e Chrome);
// 2. aggiungi una riga qui sotto con la chiave del momento e il percorso:
//      menu: 'assets/music/tema_principale.mp3',
//    oppure con opzioni:
//      cine_cyrus: { src: 'assets/music/cyrus.mp3', loop: false, vol: 0.9, start: 2.5 },
//    loop: ripete (predefinito sì, tranne che per le scene); vol: 0–1 rispetto al volume musica;
//    start: secondi da cui partire; fade: secondi di dissolvenza (predefinito 1,5).
//
// Ordine di ricerca (vince la prima chiave trovata):
//   1. ID della scena in corso          es. cine_cyrus, radio_hunt (elenco in docs/MUSICHE.md)
//      cine_opening = l'apertura con la Wonder Wheel di notte (es. il brano «Wonder Wheel» della colonna sonora)
//   2. area + situazione                es. 'C4-02:fight', 'C3-04:chase', 'C5-02:explore'
//   3. area                             es. 'C4-02'
//   4. capitolo + situazione / capitolo es. 'C4:fight', 'C4'
//   5. situazione generica              explore, fight, chase, scene, radio, dawn, silence
//   6. schermate                        menu, gameover, credits
// La stessa traccia usata da due momenti di fila continua senza ripartire.
// 'silence' come valore (es. 'C6-02': 'silence') spegne la musica in quel momento.
window.W = window.W || {};
// I brani dell'album caricati in assets/incoming/musica/ vengono riconosciuti da tools/import_incoming.py
// e scritti in js/musiche_auto.js (W.MUSIC_AUTO). Qui sotto: quale brano suona in quale momento (provvisorio, da rivedere con l'autore).
// Dove è certo dal film: «Love Is a Fire» è la musica su cui ballano le Lizzies; la DJ alla radio manda «Nowhere to Run» come minaccia ai Warriors;
// «In the City» chiude il film; i primi secondi di «Last of an Ancient Breed» accompagnano la sfida dei Rogues. Il resto è scelto per carattere.
W.MUSIC_MOMENTS = {
  menu: 'theme', cine_opening: 'theme', credits: 'in_the_city',
  chase: 'youre_movin_too_slow', fight: 'the_fight',
  radio: 'nowhere_to_run', radio_hunt: 'nowhere_to_run', radio_96th: 'nowhere_to_run', radio_apology: 'nowhere_to_run',
  'C3:explore': 'in_havana',
  'C4-01': 'baseball_furies_chase', 'C4:fight': 'baseball_furies_chase', 'C4:chase': 'baseball_furies_chase',
  dlg_c5_welcome: 'love_is_a_fire', 'C5-02': 'love_is_a_fire', 'C5-03': 'love_is_a_fire', cine_lizzies_trap: 'love_is_a_fire',
  'C6:explore': 'echoes_in_my_mind', 'C6-02': 'silence',
  'C7': 'echoes_in_my_mind', 'C8-01': 'last_of_an_ancient_breed', cine_bottles: 'last_of_an_ancient_breed', 'C8-02': 'last_of_an_ancient_breed',
  'C8-04': 'in_the_city', cine_epilogue: 'in_the_city'
};
W.MUSIC = {
};
// solo i momenti il cui brano c'è davvero (niente file mancanti)
(function () { var A = W.MUSIC_AUTO || {}, M = W.MUSIC_MOMENTS; for (var k in M) { if (M[k] === 'silence') W.MUSIC[k] = 'silence'; else if (A[M[k]] && !W.MUSIC[k]) W.MUSIC[k] = A[M[k]]; } })();
