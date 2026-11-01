# ISTRUZIONI PER UN'AI: CREARE I VIDEO DEL GIOCO

Questo file è per un assistente AI che genera video (per esempio Sora dentro ChatGPT) e ha accesso in scrittura al repository b3pz/The_Warriors. Leggilo tutto, poi lavora da solo seguendo l'elenco. Per il gioco, lo stile e i riferimenti vale tutto quello che c'è in [`IMMAGINI_PER_AI.md`](IMMAGINI_PER_AI.md).

## A cosa servono

Sono brevi inserti dentro le scene del gioco: la scena si ferma, parte la clip, poi la scena riprende. Il gioco li disegna a tutto schermo, **senza audio** (sotto continua la musica del gioco). Se un video manca, la scena va avanti senza: puoi farne anche solo alcuni, nell'ordine dato.

## Regole

- **Fedeltà al film**: ogni clip è un momento del film *The Warriors* (1979). Usa le foto in `assets/incoming/riferimenti/` (luoghi, personaggi, la DJ) come riferimento di luce, colori, costumi e luoghi.
- **Niente volti riconoscibili dei personaggi principali** (Warriors, Cyrus, Luther, Mercy, Masai): si vedono in controluce, di spalle, in silhouette o solo nei dettagli (mani, oggetti). Non riprodurre la faccia di attori reali.
- **Stile**: pixel art 16-bit animata, come una cinematica di un picchiaduro da sala giochi anni '90, con la palette del gioco (notte blu-viola, luci gialle e rosse; all'alba rosa e arancio). Movimento lento e leggibile, macchina quasi ferma, nessun taglio di montaggio dentro la clip. Se lo strumento non riesce a tenere la pixel art stabile (sfarfallio), usa uno stile cinematografico anni '70 con grana di pellicola, ma lo stesso per tutte le clip.
- **Niente testo**, scritte, sottotitoli, loghi, filigrane. **Unica eccezione:** l'insegna «WONDER WHEEL» al centro della ruota.
- **Formato**: MP4, 16:9, 1280×720 o 1920×1080, 24–30 fps. **Durata: quella indicata** (3–8 secondi). L'audio non serve (viene tolto).
- **Il video della DJ deve fare un ciclo perfetto**: l'ultimo fotogramma uguale al primo, perché il gioco lo ripete in continuazione.

## Dove caricarli

Solo in `assets/incoming/video/`, con il nome esatto dell'elenco (per esempio `assets/incoming/video/v_radio_dj.mp4`). Un video per commit, messaggio `Video in arrivo: <nome>`. Se non puoi scrivere su `main`, apri una pull request con lo stesso titolo: viene unita e integrata da sola. Salta i video che esistono già. L'integrazione nel gioco è automatica: il video viene compresso e collegato alla scena giusta; l'esito è in `assets/incoming/RAPPORTO.md`.

Divieti: come per le immagini, non toccare niente fuori da `assets/incoming/`.

## Elenco di lavoro (in ordine di priorità)

1. `v_radio_dj.mp4` · **6 s, ciclo perfetto** · La DJ della radio come nel film: primissimo piano di profilo verso destra della parte bassa del viso, labbra lucide con rossetto rosso scuro che parlano piano davanti a un microfono nero da studio radio anni '70; fondo rosso acceso, controluce, ombre profonde. Si vede solo la bocca, mai gli occhi. Riferimento: `riferimenti/dj_1.png`, `dj_2`, `dj_3`.
2. `v_wonder_wheel.mp4` · **6 s** · Apertura del film: la Wonder Wheel di Coney Island di notte, ripresa dal basso, che gira lentamente; raggi al neon rosa, luci bianche che si accendono in sequenza, insegna «WONDER WHEEL» al centro; cielo blu notte, sotto il lungomare buio. Riferimento: `riferimenti/luoghi/wonder_wheel_notte.png`, `coney_wonder_wheel.png`.
3. `v_beach_dawn.mp4` · **8 s** · Il finale: la spiaggia di Coney Island all'alba, vuota; onde lente sulla sabbia, cielo rosa e arancio pallido, in lontananza la sagoma della Wonder Wheel e del molo. Nessuna persona. Riferimento: `riferimenti/luoghi/spiaggia_riffs.png`, `coney_lungomare.png`.
4. `v_cyrus_shot.mp4` · **7 s** · Lo sparo al raduno, di notte: un uomo con una lunga veste in silhouette sotto un faro bianco su un palco, a braccia aperte, visto da dietro la folla; tra le teste in primo piano una mano guantata tira fuori una pistola dalla giacca; lampo dello sparo; l'uomo sul palco cade all'indietro; la folla scatta. Nessun volto visibile. Riferimento: `riferimenti/luoghi/raduno_cyrus.png`, `raduno_folla.png`.
5. `v_luther_bottles.mp4` · **5 s** · Primo piano laterale del finestrino di un vecchio carro funebre nero coperto di graffiti, di notte sotto un lampione; una mano esce dal finestrino con tre bottiglie di vetro vuote infilate tra le dita e le fa tintinnare tra loro, a ritmo. Si vedono solo mano e bottiglie. Riferimento: `riferimenti/luoghi/auto_rogues.png`, `auto_rogues_coney.png`.
6. `v_furies_bats.mp4` · **5 s** · I Baseball Furies sotto un lampione in un parco di notte: inquadratura dalla vita in giù e sulle mani, divise da baseball a righe sottili, mazze di legno battute piano sul palmo; alla fine uno gira la testa di lato, faccia dipinta a un solo colore, in ombra. Riferimento: `riferimenti/fury_1.png`, `fury_2`.
7. `v_conclave.mp4` · **7 s** · Il raduno visto da lontano: un parco del Bronx di notte, un anfiteatro con arcate di pietra, centinaia di ragazzi delle bande in silhouette sugli spalti, bandiere, fari bianchi puntati sul palco vuoto. Lenta carrellata laterale. Riferimento: `riferimenti/luoghi/raduno_arcate.png`, `raduno_folla.png`.
8. `v_train_night.mp4` · **6 s** · Un vagone della metropolitana di New York anni '70 completamente coperto di graffiti che corre nella notte su un viadotto, visto da fuori, luci dei finestrini che scorrono, scintille sui binari. Riferimento: `riferimenti/luoghi/treno_graffiti.png`.
9. `v_duel.mp4` · **6 s** · La spiaggia all'alba, due figure in controluce una di fronte all'altra sulla sabbia; quella di destra alza una pistola; quella di sinistra scatta e lancia un coltello che brilla nella luce; il braccio con la pistola si abbassa di colpo, il colpo parte verso la sabbia (piccolo sbuffo). Solo silhouette.
10. `v_riffs_order.mp4` · **5 s** · La sala dei Gramercy Riffs: grande stanza buia, file di ragazzi in tuniche in silhouette, in ginocchio, controluce da finestre alte; al centro una figura in piedi. Lentissima avanzata della macchina. Nessun volto.
11. `v_turnbull_bus.mp4` · **5 s** · Una strada del Bronx di notte, deserta: da dietro l'angolo spuntano i fari del vecchio bus dei Turnbull coperto di graffiti (com'è nel riferimento), con sagome di skinhead sul tetto e aggrappate ai finestrini; il bus avanza lento verso la camera. Riferimento: `riferimenti/luoghi/bus_turnbull.png`.
12. `v_car_fire.mp4` · **4 s** · Una vecchia auto americana anni '70 avvolta dalle fiamme in mezzo a una strada di notte, tra palazzi di mattoni; fiamme alte, fumo nero, riflessi arancio sull'asfalto bagnato. Nessuna persona. Riferimento: `riferimenti/luoghi/strada_orphans.png`.
13. `v_ajax_cuffs.mp4` · **3 s** · Primo piano di notte in un parco: una manetta d'acciaio si chiude con uno scatto attorno al polso di un uomo (braccio nudo muscoloso) e l'altra attorno al bracciolo di ferro di una panchina di legno; luce di lampione.
14. `v_lizzies_lock.mp4` · **4 s** · Interno di un appartamento anni '70 in penombra, luci soffuse rosa e viola: primo piano di una mano femminile con le unghie laccate che gira la chiave nella serratura di una porta; poi la stessa mano sfila una pistola da sotto un cuscino del divano.
15. `v_punks_skates.mp4` · **4 s** · Il bagno della stazione di Union Square: pavimento di piastrelle bianche sporche, luci al neon fredde; inquadratura bassa sulle ruote di pattini a rotelle che entrano scivolando e si fermano, gambe in salopette di jeans. Riferimento: `riferimenti/luoghi/bagno_union_square.png`.
16. `v_rembrandt_tag.mp4` · **4 s** · Primo piano di notte in un cimitero: una mano con una bomboletta spray rossa disegna una grande W sopra una lapide di pietra già coperta di scritte di altre bande; la vernice cola. Riferimento: `riferimenti/luoghi/cimitero_rembrandt.png`.
17. `v_train_dawn.mp4` · **6 s** · Una metropolitana sopraelevata che corre nella prima luce del mattino verso Coney Island, cielo rosa e arancio pallido, palazzi bassi, il sole che sorge dietro. Riferimento: `riferimenti/luoghi/treno_graffiti.png`.
18. `v_riffs_beach.mp4` · **6 s** · La spiaggia all'alba: una lunga fila di figure in tuniche avanza lentamente in controluce verso la riva, sagome nere sul cielo rosa. Nessun volto.

## Facoltativo: la presentazione della schermata iniziale

19. `v_attract.mp4` · **20–60 s** · Come nei giochi da sala degli anni '90: se nessuno tocca niente sul menu parte una presentazione. Oggi il gioco la monta da solo con le illustrazioni delle scene; se c'è questo video, usa il video. Montaggio dei momenti del film nell'ordine: il raduno di notte, lo sparo in silhouette, la DJ al microfono, i Furies con le mazze, il treno che corre, la spiaggia all'alba. Stesse regole delle altre clip (niente volti dei protagonisti, niente scritte). Si può comporre unendo più clip da 5–10 secondi.

## Fine

In tutto 18 video. Ogni sessione riparte dal primo video dell'elenco che non esiste ancora.
