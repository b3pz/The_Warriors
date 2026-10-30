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
//   2. area + situazione                es. 'C4-02:fight', 'C3-04:chase', 'C5-02:explore'
//   3. area                             es. 'C4-02'
//   4. capitolo + situazione / capitolo es. 'C4:fight', 'C4'
//   5. situazione generica              explore, fight, chase, scene, radio, dawn, silence
//   6. schermate                        menu, gameover, credits
// La stessa traccia usata da due momenti di fila continua senza ripartire.
// 'silence' come valore (es. 'C6-02': 'silence') spegne la musica in quel momento.
window.W = window.W || {};
W.MUSIC = {
};
