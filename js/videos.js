'use strict';
// Video delle transizioni. Per sostituire una scena fatta con gli sprite con un video:
// 1. salva il file in assets/video/ (mp4 H.264, 1280×720 o 1920×1080);
// 2. aggiungi qui una riga con l'ID della scena, per esempio:
//    cine_cyrus: 'assets/video/cine_cyrus.mp4',
// Gli ID delle scene sono elencati in docs/SCENE_E_VIDEO.md. Senza riga resta la scena con gli sprite.
window.W = window.W || {};
W.VIDEOS = {
};
// video generati e caricati in assets/incoming/video/ (tools/import_incoming.py → js/videos_auto.js); le righe scritte qui sopra hanno la precedenza
(function () { var A = W.VIDEOS_AUTO || {}; for (var k in A) if (!W.VIDEOS[k]) W.VIDEOS[k] = A[k]; })();
