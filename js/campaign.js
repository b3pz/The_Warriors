// Campagna completa: prologo + otto capitoli, 35 aree (design/campaign.json, docs/LEVELS.md)
// e scene con le battute di docs/NARRATIVE.md. Ogni scena ha l'ID del pacchetto cinematico:
// un video con lo stesso ID in js/videos.js la sostituisce.
'use strict';
var W = window.W;

(function () {
  var ALL9 = ['cleon', 'swan', 'ajax', 'snow', 'cowboy', 'cochise', 'vermin', 'rembrandt', 'fox'];
  var AFTER_C1 = ['swan', 'ajax', 'snow', 'cowboy', 'cochise', 'vermin', 'rembrandt', 'fox'];
  var C4G = ['swan', 'ajax', 'snow', 'cowboy'];
  var FINAL6 = ['swan', 'snow', 'cowboy', 'cochise', 'vermin', 'rembrandt'];
  var Y = 580;

  // fila di personaggi per le scene: [['npc', id, set, x, y, face], ...]
  function line(ids, x0, dx, y, face, dy) {
    return ids.map(function (id, i) { return ['npc', id, id, x0 + i * dx, y + (dy ? ((i % 2) ? dy : -dy) : 0), face || 1]; });
  }
  function seq() { var out = []; for (var i = 0; i < arguments.length; i++) out = out.concat(arguments[i]); return out; }

  // ------------------------------------------------------------------ scene
  var S = W.SCENES = {};

  // P0
  S.dlg_p0_welcome = { cine: 'dlg_p0_welcome', letterbox: false, steps: [
    ['say', 'cleon', 'Cyrus vuole nove per banda, disarmati. Siamo nove. Nessuno resta a casa.'],
    ['say', 'swan', 'Facciamo il viaggio, ascoltiamo e torniamo a casa.'],
    ['say', 'ajax', 'Disarmati nel Bronx. Bella idea.'] ] };
  var intro = { snow: 'Guarda anche ai lati. Non è sempre davanti che arriva il problema.', cowboy: 'Il cappello resta in testa. Qualunque cosa succeda.',
    cochise: 'Restiamo vicini e nessuno ci chiude in un angolo.', vermin: 'Vorrei già essere sul treno del ritorno.',
    rembrandt: 'Mi porto le bombolette. Non si sa mai.', fox: 'Io guardo le uscite. Sempre.',
    ajax: 'Se qualcuno mi guarda storto, non aspetto il permesso di Cleon.' };
  Object.keys(intro).forEach(function (k) { S['talk_' + k] = { cine: 'dlg_p0_introductions', letterbox: false, steps: [['say', k, intro[k]]] }; });
  S.cine_departure = { cine: 'cine_departure', steps: seq(
    [['players', 'hide']], line(ALL9, 260, 90, Y, 1, 22),
    [['wait', 0.6], ['moveAll', 900, 4.2], ['wait', 2.4], ['fade', 'out', 1.2], ['clearNpcs'], ['sfx', 'train'], ['title', 'THE WARRIORS', 'Night Run', 3.2], ['flag', 'departed_coney']]) };

  // C1
  S.dlg_c1_arrival = { cine: 'dlg_c1_arrival', letterbox: false, steps: [
    ['say', 'rembrandt', 'Non pensavo ci fosse tutta questa gente.'],
    ['say', 'cleon', 'Osservate. E ricordatevi perché siamo qui.'] ] };
  S.cine_cyrus = { cine: 'cine_cyrus', steps: seq(
    [['players', 'hide'], ['crowd', 'cr', ['orphan', 'punk', 'turnbull', 'rogue', 'lizzie', 'police', 'masai', 'fury_hood', 'turnbull_b', 'lizzie_b'], 120, 1160, 600, 690, 22, 1]],
    line(ALL9, 140, 46, 640, 1),
    [['npc', 'cyrus', 'cyrus', 760, 470, -1], ['npc', 'luther', 'luther', 1010, 540, -1], ['npc', 'masai', 'masai', 860, 492, -1],
     ['caption', 'Van Cortlandt Park, nel Bronx. Cento bande, nove delegati disarmati per ognuna, ascoltano Cyrus dei Gramercy Riffs. Per una notte, nessuno combatte.'],
     ['say', 'cyrus', 'Ci dividono poche strade. Se smettiamo di consumarci gli uni contro gli altri, questa città dovrà ascoltarci.'],
     ['say', 'cyrus', 'Siamo più di loro. Ci state?'], ['shake', 4], ['caption', 'La folla risponde con un boato.'],
     ['wait', 0.6]]) };
  S.cine_accusation = { cine: 'cine_accusation', steps: [
    ['sfx', 'shot'], ['flash'], ['shake', 10], ['pose', 'cyrus', 'down'], ['wait', 0.8],
    ['caption', 'Fox ha visto chi ha sparato: Luther dei Rogues. Luther se ne accorge, prova a colpire anche lui e lo manca.'], ['sfx', 'shot'],
    ['say', 'luther', 'Sono stati loro! Fermate i Warriors!'],
    ['caption', 'Cleon prova a dire che non sono stati loro. I Riffs lo circondano: non ne esce vivo.'], ['flag', 'cleon_killed'],
    ['moveAll', -380, 1.6, 'crowd'], ['sfx', 'siren'],
    ['npc', 'pol1', 'police', 1300, 600, -1], ['npc', 'pol2', 'police', 1340, 650, -1], ['move', 'pol1', 1050, null, 1.2], ['move', 'pol2', 1080, null, 1.2],
    ['say', 'swan', 'Via da qui! Non fermatevi!'],
    ['fade', 'out', 0.8], ['clearNpcs'], ['flag', 'cyrus_shot'], ['flag', 'warriors_accused']] };
  S.cine_swan_leads = { cine: 'cine_swan_leads', letterbox: false, steps: [
    ['caption', 'Il cimitero di Woodlawn. I Warriors si nascondono tra le tombe e riprendono fiato.'],
    ['say', 'cowboy', 'Cleon non è con noi.'],
    ['say', 'ajax', 'E adesso chi comanda? Io dico che tocca a me.'],
    ['say', 'swan', 'Cleon mi ha lasciato il comando. Torniamo a Coney Island, tutti.'],
    ['flag', 'cleon_lost'], ['flag', 'swan_leads']] };

  // C2
  S.dlg_c2_bus = { cine: 'dlg_c2_bus', letterbox: false, steps: [
    ['say', 'fox', 'Turnbull AC\'s. Sul bus. Ci hanno visti.'], ['say', 'snow', 'La scala è dall\'altra parte. Muoviamoci.']] };
  S.dlg_c2_run = { cine: 'dlg_c2_run', letterbox: false, steps: [['say', 'swan', 'Lasciateli indietro. Alla metro!']] };
  S.cine_train_escape = { cine: 'cine_train_escape', steps: seq(
    [['players', 'hide']], line(AFTER_C1, 380, 70, Y, 1, 18),
    [['say', 'vermin', 'Quel treno non lo perdiamo.'], ['moveAll', 700, 2.2], ['wait', 1.6], ['sfx', 'train'], ['fade', 'out', 1], ['clearNpcs'], ['flag', 'train_boarded']]) };

  // C3
  S.dlg_c3_orphans = { cine: 'dlg_c3_orphans', steps: seq(
    [['players', 'hide'], ['caption', 'Un incendio sui binari ferma il treno. Da qui si va a piedi, nel cuore del Bronx.']], line(AFTER_C1, 160, 62, Y, 1, 20),
    [['npc', 'orphan', 'orphan', 860, Y, -1, 'Sully'], ['npc', 'or2', 'orphan', 950, 540, -1], ['npc', 'or3', 'orphan', 980, 630, -1],
     ['say', 'orphan', 'State attraversando il nostro territorio.'],
     ['say', 'orphan', 'Al raduno noi non ci hanno nemmeno invitati. Ma qui comandiamo noi.'],
     ['choice', 'swan', ['Ci serve soltanto un passaggio.', 'Non siamo venuti a cercarvi. Lasciateci andare.']],
     ['sayIf', 0, 'orphan', 'Un passaggio? Nessuno passa di qui senza chiedere a noi.'],
     ['sayIf', 1, 'orphan', 'Non siete voi a decidere dove si va, qui.'],
     ['say', 'orphan', 'Volete passare? Lasciate qui i gilet.'],
     ['say', 'swan', 'I gilet non si toccano.'],
     ['npc', 'mercy', 'mercy', 1180, 560, -1], ['move', 'mercy', 1060, null, 1],
     ['say', 'mercy', 'Sono loro quelli di cui si parla stanotte?'],
     ['say', 'mercy', 'E tu li lasci passare così, Sully? Davanti a tutti?'],
     ['say', 'orphan', 'Nessuno passa. Avete sentito?'],
     ['say', 'swan', 'Togliti di mezzo, Sully.'],
     ['caption', 'Swan non alza le mani. Lo guarda e basta, finché Sully abbassa gli occhi davanti alla sua gente.'],
     ['say', 'mercy', 'Tutto qui? Lo lasci andare così?'],
     ['say', 'ajax', 'Questi non sono una banda. Sono un circolo di quartiere.'],
     ['fade', 'out', 0.6], ['clearNpcs'], ['flag', 'orphans_confrontation']]) };
  S.dlg_c3_fire = { cine: 'dlg_c3_fire', letterbox: false, steps: [
    ['caption', 'Swan accende la bottiglia e la lancia nell\'auto degli Orphans: il fuoco apre un varco.'], ['flash'], ['sfx', 'fire']] };
  S.cine_mercy_joins = { cine: 'cine_mercy_joins', letterbox: false, steps: [
    ['say', 'swan', 'Abbiamo il varco. Via!'], ['say', 'mercy', 'Aspettate. Vengo con voi. Qui non mi tiene niente.'], ['say', 'swan', 'Non ti aspettiamo.'], ['flag', 'mercy_joined']] };
  S.cine_police_split = { cine: 'cine_police_split', steps: seq(
    [['players', 'hide']], line(['swan', 'mercy', 'ajax', 'snow', 'cowboy', 'fox', 'cochise', 'vermin', 'rembrandt'], 300, 70, Y, 1, 20),
    [['npc', 'pol1', 'police', -60, 600, 1], ['npc', 'pol2', 'police', -120, 540, 1], ['move', 'pol1', 240, null, 1.2], ['move', 'pol2', 200, null, 1.4],
     ['sfx', 'siren'], ['say', 'swan', 'Se ci separiamo, ci vediamo a Union Square!'],
     ['move', 'fox', 160, 660, 1], ['move', 'mercy', 280, 650, 1], ['moveAll', 900, 1.6], ['wait', 1.2],
     ['caption', 'Nella lotta sulla banchina un agente spinge Fox sui binari. Il treno arriva in quel momento.'], ['flag', 'fox_killed'],
     ['fade', 'out', 0.8], ['clearNpcs'], ['flag', 'fox_lost'], ['flag', 'party_split']]) };

  // C4
  S.cine_furies_appear = { cine: 'cine_furies_appear', steps: seq(
    [['players', 'hide']], line(C4G, 240, 80, Y, 1, 22),
    [['npc', 'f1', 'fury', 980, 520, -1], ['npc', 'f2', 'fury', 1060, 590, -1], ['npc', 'f3', 'fury_hood', 1120, 650, -1], ['npc', 'f4', 'fury', 900, 640, -1],
     ['wait', 1.4], ['say', 'cowboy', 'Guardate quelli. Truccati come per una partita.'], ['say', 'swan', 'Correte. Nel parco li perdiamo.'], ['clearNpcs'], ['flag', 'furies_seen']]) };
  S.dlg_c4_stand = { cine: 'dlg_c4_stand', letterbox: false, steps: [['say', 'ajax', 'Io non corro più. Non da quattro pagliacci con le mazze.'], ['say', 'snow', 'Tieni d\'occhio le mazze.']] };
  S.dlg_c4_ajax = { cine: 'dlg_c4_ajax', letterbox: false, mood: 'fight', steps: [
    ['caption', 'Il capo dei Furies si fa avanti, la mazza sulla spalla. Ajax scoppia a ridere.'],
    ['caption', 'Si toglie il gilet, lo butta da parte e va incontro alle mazze a mani nude.'], ['flag', 'ajax_novest'],
    ['say', 'ajax', 'Quella mazza te la faccio rimangiare.']] };
  S.cine_ajax_stays = { cine: 'cine_ajax_stays', steps: seq(
    [['players', 'hide']], line(C4G, 360, 90, Y, 1, 18),
    [['say', 'swan', 'Dobbiamo ripartire.'], ['npc', 'ajax', 'ajax', 360, Y, -1], ['say', 'ajax', 'Andate avanti. Io qui ho trovato compagnia.'], ['say', 'cowboy', 'Non è il momento di restare soli.'],
     ['move', 'swan', 1200, null, 2.4], ['move', 'snow', 1250, null, 2.6], ['move', 'cowboy', 1300, null, 2.8], ['wait', 2.2], ['fade', 'out', 1], ['clearNpcs'], ['flag', 'ajax_separated']]) };

  // C5
  S.cine_ajax_arrest = { cine: 'cine_ajax_arrest', steps: [
    ['players', 'hide'], ['npc', 'officer', 'civilian', 620, 560, -1, 'Poliziotta'], ['npc', 'ajax', 'ajax', 360, 580, 1],
    ['caption', 'Ajax resta nel parco. Su una panchina, una donna sola.'], ['move', 'ajax', 540, null, 2.4], ['wait', 1.2],
    ['say', 'officer', 'Fermo. Sei in arresto.'], ['sfx', 'siren'],
    ['npc', 'pol1', 'police', 1340, 560, -1], ['npc', 'pol2', 'police', 1380, 620, -1], ['move', 'pol1', 640, null, 1.6], ['move', 'pol2', 600, null, 1.8], ['wait', 1.4],
    ['caption', 'Ajax viene messo a terra e ammanettato. Resta indietro.'], ['fade', 'out', 1], ['clearNpcs'], ['caption', 'Snow e Cowboy, poco lontano, vedono le luci delle volanti.'], ['say', 'snow', 'Per lui non possiamo fare niente. Union Square.'], ['flag', 'ajax_arrested']] };
  S.dlg_c5_welcome = { cine: 'dlg_c5_welcome', steps: seq(
    [['players', 'hide']], line(['vermin', 'cochise', 'rembrandt'], 260, 80, Y, 1, 18),
    [['npc', 'lz1', 'lizzie', 760, 560, -1], ['npc', 'lz2', 'lizzie_b', 860, 620, -1], ['npc', 'lz3', 'lizzie', 960, 540, -1],
     ['say', 'lz1', 'Qui potete riposarvi. Fuori vi stanno cercando tutti.'], ['say', 'vermin', 'Finalmente una festa, stanotte.'],
     ['face', 'rembrandt', -1], ['say', 'rembrandt', 'Cochise… hanno chiuso la porta.'], ['clearNpcs']]) };
  S.cine_lizzies_trap = { cine: 'cine_lizzies_trap', letterbox: false, steps: [
    ['say', 'lizzie', 'Sappiamo chi siete. Lo sa tutta la città, ormai.'], ['say', 'cochise', 'Ci cercano tutti. Tutti quanti.'],
    ['caption', 'Una delle Lizzies chiude la porta a chiave. Spunta un coltello, poi una pistola: spara male, ma spara.'], ['say', 'rembrandt', 'Attenti! Hanno le pistole!'],
    ['caption', 'L\'unica via è la porta: sfondala.'], ['flag', 'lizzies_trap']] };
  S.cine_swan_mercy = { cine: 'cine_swan_mercy', letterbox: false, steps: [
    ['caption', 'Swan torna da solo alla 96ª Strada a cercare gli altri. Sulla banchina c\'è Mercy.'],
    ['caption', 'Mercy ora porta una giacca di jeans scura, troppo grande per lei.'], ['flag', 'mercy_jacket'],
    ['say', 'swan', 'E quella?'], ['say', 'mercy', 'L\'ho rubata. La polizia cerca una con la maglietta rosa.'],
    ['caption', 'Mercy gli si avvicina. Swan si scosta.'],
    ['say', 'mercy', 'Quando arrivi a casa, finisce davvero?'], ['say', 'swan', 'Prima ci dobbiamo arrivare.'],
    ['say', 'mercy', 'Non hai risposto.'], ['wait', 1.2], ['say', 'swan', 'Lo so.'], ['flag', 'swan_mercy_bond']] };
  S.cine_reunion_approach = { cine: 'cine_reunion_approach', steps: seq(
    [['players', 'hide']], [['npc', 'snow', 'snow', 520, 560, 1], ['npc', 'cowboy', 'cowboy', 440, 620, 1], ['npc', 'swan', 'swan', 860, 580, -1], ['npc', 'mercy', 'mercy', 940, 620, -1]],
    [['say', 'cowboy', 'Ajax l\'hanno preso.'], ['say', 'swan', 'Gli altri?'], ['say', 'snow', 'Vermin, Cochise e Rembrandt sono già sotto. Ci aspettano.'],
     ['npc', 'vermin', 'vermin', -80, 560, 1], ['npc', 'cochise', 'cochise', -140, 620, 1], ['npc', 'rembrandt', 'rembrandt', -200, 590, 1],
     ['move', 'vermin', 300, null, 1.8], ['move', 'cochise', 240, null, 1.9], ['move', 'rembrandt', 180, null, 2], ['wait', 1.8], ['clearNpcs'], ['flag', 'regroup_target']]) };

  // C6
  S.cine_reunion = { cine: 'cine_reunion', letterbox: false, steps: [
    ['say', 'vermin', 'La prossima volta scegliete voi dove fermarci.'], ['say', 'rembrandt', 'Ne siamo usciti per un pelo. Le Lizzies.'],
    ['say', 'swan', 'Siete qui. Ora troviamo l\'ultimo treno.'], ['flag', 'reunited']] };
  S.cine_truth_reaches_riffs = { cine: 'cine_truth_reaches_riffs', steps: [
    ['players', 'hide'], ['caption', 'Intanto, nel Bronx.'],
    ['crowd', 'rf', ['masai', 'cyrus', 'masai'], 760, 1100, 540, 660, 6, -1], ['npc', 'masai', 'masai', 720, 580, -1], ['npc', 'witness', 'civilian', 420, 600, 1, 'Testimone'],
    ['say', 'witness', 'Ho visto tutto. Ha sparato Luther. Quello dei Rogues.'], ['say', 'masai', 'Allora i Warriors non c\'entrano.'],
    ['fade', 'out', 1], ['clearNpcs'], ['flag', 'riffs_know_truth']] };

  S.dlg_c6_bathroom = { cine: 'dlg_c6_bathroom', letterbox: false, mood: 'silence', steps: [
    ['say', 'snow', 'Quelli sui pattini. Ci stanno seguendo.'], ['say', 'swan', 'Nei gabinetti. Nessuno fiata.'], ['flag', 'bathroom_hide']] };
  S.cine_bathroom_chaos = { cine: 'cine_bathroom_chaos', mood: 'fight', steps: [
    ['caption', 'Le porte si spalancano tutte insieme. Nel bagno non c\'è più silenzio.'], ['shake', 10], ['sfx', 'hit'],
    ['npc', 'punk', 'punk', 1000, 580, -1, 'Capo Punks'], ['npc', 'pk2', 'punk', 1080, 640, -1], ['wait', 0.6],
    ['say', 'swan', 'Adesso!'], ['caption', 'Mercy non scappa: resta e fa la sua parte nella rissa.'], ['clearNpcs']] };

  // C7
  S.cine_train_dawn = { cine: 'cine_train_dawn', letterbox: false, steps: [
    ['say', 'mercy', 'È quasi giorno.'], ['say', 'swan', 'Sì.'], ['say', 'mercy', 'Non sembra la stessa città.']] };
  S.talk_c7_couple = { cine: 'cine_train_dawn', letterbox: false, steps: [
    ['caption', 'Alla fermata sale una coppia di ragazzi ben vestiti, di ritorno da una festa. Si siedono di fronte.'], ['wait', 0.4],
    ['caption', 'Mercy si accorge dei suoi capelli, della giacca sporca. Prova a sistemarsi.'],
    ['caption', 'Swan le prende la mano e la ferma. Piano. Non c\'è niente da sistemare.'], ['flag', 'mercy_dignity']] };
  S.cine_home_arrival = { cine: 'cine_home_arrival', steps: seq(
    [['players', 'hide']], line(FINAL6.concat(['mercy']), 300, 70, Y, 1, 18),
    [['sfx', 'train'], ['say', 'cowboy', 'Stillwell Avenue. Coney Island.'], ['say', 'vermin', 'Era ora.'], ['moveAll', 600, 2.4], ['wait', 1.8], ['fade', 'out', 1], ['clearNpcs'], ['flag', 'home_reached']]) };

  // C8
  S.cine_bottles = { cine: 'cine_bottles', steps: [
    ['sfx', 'bottle'], ['wait', 0.5], ['sfx', 'bottle'], ['wait', 0.5], ['sfx', 'bottle'],
    ['npc', 'hearse', 'hearse', 1600, 600, -1], ['move', 'hearse', 1080, null, 1.6], ['wait', 1.7],
    ['npc', 'luther', 'luther', 960, 598, -1], ['raise', 'luther', 30], ['npc', 'rg1', 'rogue', 1250, 640, -1],
    ['caption', 'Il carro funebre dei Rogues, coperto di graffiti, si ferma. Luther si sporge dal finestrino, tre bottiglie vuote infilate tra le dita.'],
    ['say', 'luther', 'Warriors... venite fuori a giocare!'], ['sfx', 'bottle'], ['wait', 0.4], ['sfx', 'bottle'], ['say', 'swan', 'Finisce sulla spiaggia.'],
    ['clearNpcs'], ['npc', 'hearse', 'hearse', 1080, 600, -1], ['move', 'hearse', 1700, null, 1.4], ['wait', 1.3], ['clearNpcs'], ['flag', 'rogues_arrived']] };
  S.cine_disarm = { cine: 'cine_disarm', steps: seq(
    [['players', 'hide']], line(['snow', 'cowboy', 'cochise', 'vermin', 'rembrandt'], 160, 60, Y, 1, 20),
    [['npc', 'mercy', 'mercy', 120, 650, 1], ['npc', 'swan', 'swan', 560, Y, 1], ['npc', 'luther', 'luther', 900, Y, -1], ['npc', 'rg1', 'rogue', 1000, 540, -1], ['npc', 'rg2', 'rogue', 1040, 640, -1],
     ['say', 'swan', 'Sappiamo chi ha sparato. Perché l\'hai fatto?'], ['say', 'luther', 'Nessun motivo. Mi piacciono queste cose.'],
     ['say', 'swan', 'Niente pistole. Tu e io, con i coltelli.'],
     ['caption', 'Luther accetta. Poi, all\'ultimo, tira fuori la pistola e la punta.'], ['wait', 0.5],
     ['caption', 'Prima che possa sparare, Swan fa scattare il coltello e lo lancia.'], ['sfx', 'swing'], ['move', 'swan', 680, null, 0.2], ['sfx', 'hit'], ['flash'], ['shake', 8],
     ['caption', 'La lama si pianta nel braccio di Luther. Il colpo parte verso la sabbia.'], ['sfx', 'shot'], ['pose', 'luther', 'down'],
     ['caption', 'La pistola cade nella sabbia. Luther è disarmato.'], ['flag', 'luther_disarmed']]) };
  S.cine_riffs_arrival = { cine: 'cine_riffs_arrival', steps: [
    ['crowd', 'rf', ['masai', 'cyrus', 'masai', 'cyrus'], 1150, 1260, 520, 660, 8, -1], ['npc', 'masai', 'masai', 1300, 580, -1], ['move', 'masai', 1000, null, 2],
    ['moveAll', -180, 2, 'crowd'], ['wait', 1.8],
    ['say', 'masai', 'Sappiamo cos\'è successo. Avete attraversato tutta la città stanotte.'], ['say', 'masai', 'Non è da tutti. Andate: di loro ci occupiamo noi.'],
    ['moveAll', 220, 1.6, 'crowd'],
    ['move', 'swan', 300, null, 2.4], ['wait', 2], ['fade', 'out', 1.2], ['clearNpcs'], ['flag', 'innocence_recognized']] };
  S.cine_epilogue = { cine: 'cine_epilogue', steps: seq(
    [['players', 'hide']], line(FINAL6, 120, 90, Y, 1, 22), [['npc', 'mercy', 'mercy', 210, 640, 1]],
    [['moveAll', 1100, 12], ['wait', 1.5], ['caption', 'Trenta miglia di città nemica. Ora, davanti a loro, c\'è il mare.'], ['wait', 1.2], ['say', 'swan', 'Tutta la notte per tornare qui. A questo.'], ['wait', 0.8],
     ['caption', 'Swan e Mercy camminano mano nella mano. Gli altri, poco dietro. Sono a casa.'], ['wait', 4], ['fade', 'out', 2], ['clearNpcs'], ['flag', 'campaign_complete']]) };

  // ------------------------------------------------------------------ la radio durante la notte
  // Tono della DJ: calmo, caldo, quasi ironico; non prende posizione. Dediche in codice che dicono alle bande dove sono i Warriors.
  function radioScene(id, lines) { S[id] = { cine: id, radio: true, mood: 'radio', letterbox: false, steps: lines.map(function (l) { return ['say', 'dj', l]; }) }; }
  radioScene('radio_hunt', ['Interrompiamo la musica per una notizia dal Bronx. Cyrus è morto.', 'Masai dei Riffs fa sapere a tutte le bande che vuole i Warriors. Vivi o morti.', 'A tutte le bande in ascolto: si dice che siano stati i Warriors. Il gilet, li conoscete.', 'Occhi aperti, ragazzi. La caccia è aperta. E questa notte la vince chi arriva primo.']);
  radioScene('radio_96th', ['Una dedica speciale per chi aspetta alla 96ª Strada: arriva gente dal Bronx.', 'Non fateli aspettare.']);
  radioScene('radio_apology', ['Una correzione per tutti quelli che ci ascoltano: con la morte di Cyrus i Warriors non c\'entrano.', 'A quanto pare abbiamo dato la notizia sbagliata. Ai ragazzi di Coney Island, le nostre scuse.', 'E l\'ultima canzone di stanotte la dedichiamo a loro.']);

  // ------------------------------------------------------------------ aree
  // kind: traversal | training | arena | escape | scene | confront | epilogue
  // depth → floor [680-depth, 680]; party = pool di campaign.json; present = compagni visibili come PNG al seguito.
  var A = W.CAMPAIGN = [
    { id: 'P0-01', ch: 'P0', kind: 'traversal', name: 'Il ritrovo', bg: 'coney_b', width: 1280, depth: 170, party: ['cleon', 'swan'], present: ['ajax', 'snow', 'cowboy', 'cochise', 'vermin', 'rembrandt', 'fox'], peace: true,
      enter: 'dlg_p0_welcome', chapterCard: true, objective: 'Parla con almeno un compagno, poi raggiungi l\'uscita',
      talks: [{ who: 'snow', x: 520, y: 560 }, { who: 'cowboy', x: 640, y: 620 }, { who: 'cochise', x: 760, y: 540 }, { who: 'vermin', x: 860, y: 600 }, { who: 'rembrandt', x: 960, y: 560 }, { who: 'fox', x: 1060, y: 630 }, { who: 'ajax', x: 420, y: 620 }],
      needTalks: 1 },
    { id: 'P0-02', ch: 'P0', kind: 'training', name: 'Allenamento', bg: 'coney_b', width: 1280, depth: 210, party: ['cleon', 'swan'],
      objective: 'Allenamento con Cleon',
      steps: [
        { check: 'hit_l1', text: 'Colpo leggero sul compagno: {light}', say: ['cleon', 'Avvicinati. Prima controlla la distanza, poi colpisci.'] },
        { check: 'hit_l3', text: 'Catena di tre leggeri: {light} {light} {light}' },
        { check: 'hit_heavy', text: 'Colpo pesante: {heavy}' },
        { check: 'jump', text: 'Salto: {jump}, poi leggero in discesa per il calcio volante' },
        { check: 'dodge', text: 'Schivata: {dodge}', say: ['cleon', 'Non restare fermo davanti al colpo. Spostati di lato.'] } ] },
    { id: 'P0-03', ch: 'P0', kind: 'training', name: 'Verso l\'uscita', bg: 'coney', width: 1280, depth: 200, party: ['cleon', 'swan'],
      objective: 'Ultime lezioni',
      items: [{ kind: 'weapon', w: 'pipe', x: 700, y: 600 }],
      steps: [
        { check: 'grab', text: 'Presa sul compagno: avvicinati e premi {interact}' },
        { check: 'pickup', text: 'Raccogli il tubo con {interact}' },
        { check: 'revive', text: 'Aiuta il compagno a terra: avvicinati e premi {interact}', say: ['swan', 'Quando un compagno va giù, aiutalo appena hai spazio.'] } ],
      done: ['cleon', 'Basta così. Prendiamo la metro.'] },
    { id: 'P0-04', ch: 'P0', kind: 'scene', name: 'Partenza', bg: 'metro_b', width: 1280, depth: 200, party: ALL9, scenes: ['cine_departure'] },

    { id: 'C1-01', ch: 'C1', kind: 'traversal', name: 'Il raduno', bg: 'park_b', width: 1920, depth: 180, party: ALL9, present: ALL9, peace: true, chapterCard: true,
      enter: 'dlg_c1_arrival', objective: 'Raggiungi il vostro posto fra le delegazioni', crowd: ['orphan', 'punk', 'turnbull', 'rogue', 'lizzie', 'masai', 'fury_hood'] },
    { id: 'C1-02', ch: 'C1', kind: 'scene', name: 'Il discorso', bg: 'park', width: 1280, depth: 200, party: ALL9, scenes: ['cine_cyrus', 'cine_accusation', 'radio_hunt'] },
    { id: 'C1-03', ch: 'C1', kind: 'escape', name: 'Fuga dal parco', bg: 'park', width: 2560, depth: 190, party: AFTER_C1, objective: 'Scappa: supera la strettoia',
      waves: [{ trigger: 900, objective: 'Supera gli Orphans nella strettoia', solo: [['orphan_brawler', 'R', 560], ['orphan_brawler', 'R', 620]], duo: [['orphan_brawler', 'R', 560], ['orphan_brawler', 'R', 620], ['orphan_brawler', 'L', 600]] }],
      pursuers: { solo: { police_pursuer: 2 }, duo: { police_pursuer: 3 } }, barriers: [1500, 1900] },
    { id: 'C1-04', ch: 'C1', kind: 'traversal', name: 'Il cimitero di Woodlawn', bg: 'park', amb: 'park', width: 1280, depth: 180, party: AFTER_C1, present: AFTER_C1, peace: true, mood: 'silence',
      enter: 'cine_swan_leads', objective: 'Scavalca il cancello: la metro è di là', exitInteract: { x: 1150, y: 560, label: 'Scavalca il cancello' } },

    { id: 'C2-01', ch: 'C2', kind: 'traversal', name: 'Isolato del Bronx', bg: 'street', width: 2560, depth: 220, party: AFTER_C1, present: AFTER_C1, chapterCard: true,
      enter: 'dlg_c2_bus', objective: 'Trova l\'accesso alla metro', busBg: true },
    { id: 'C2-02', ch: 'C2', kind: 'arena', name: 'Vicolo con cancello', bg: 'alley', width: 1920, depth: 190, party: AFTER_C1, objective: 'I Turnbull bloccano il vicolo',
      waves: [{ trigger: 300, objective: 'Respingi i Turnbull', solo: [['turnbull_rusher', 'R', 560], ['turnbull_rusher', 'R', 620], ['turnbull_heavy', 'R', 590], ['turnbull_rusher', 'L', 600]],
        duo: [['turnbull_rusher', 'R', 560], ['turnbull_rusher', 'R', 620], ['turnbull_heavy', 'R', 590], ['turnbull_rusher', 'L', 600], ['turnbull_rusher', 'L', 650], ['turnbull_heavy', 'R', 540]] }],
      exitLabel: 'Apri il cancello', exitInteract: { x: 1820, y: 580, label: 'Apri il cancello' } },
    { id: 'C2-03', ch: 'C2', kind: 'escape', name: 'Corsa alle scale', bg: 'street_b', width: 3840, depth: 230, party: AFTER_C1, objective: 'Raggiungi le scale della metro',
      enter: 'dlg_c2_run', timer: 70, timerEasy: 85, pursuers: { solo: { turnbull_rusher: 2 }, duo: { turnbull_rusher: 3 } }, bus: true, barriers: [900, 1700, 2500, 3200] },
    { id: 'C2-04', ch: 'C2', kind: 'escape', name: 'Stazione di Gun Hill Road', bg: 'metro', width: 1920, depth: 200, party: AFTER_C1, objective: 'Sali sul treno', timer: 25, exitScene: 'cine_train_escape' },

    { id: 'C3-01', ch: 'C3', kind: 'scene', name: 'Strada degli Orphans', bg: 'street', width: 1280, depth: 200, party: AFTER_C1, chapterCard: true, scenes: ['dlg_c3_orphans'] },
    { id: 'C3-02', ch: 'C3', kind: 'arena', name: 'Cortile', bg: 'harbor', width: 2560, depth: 190, party: AFTER_C1, objective: 'Gli Orphans attaccano',
      waves: [
        { trigger: 300, objective: 'Prima ondata', solo: [['orphan_brawler', 'R', 560], ['orphan_brawler', 'R', 620], ['orphan_board', 'L', 600]], duo: [['orphan_brawler', 'R', 560], ['orphan_brawler', 'R', 620], ['orphan_board', 'L', 600], ['orphan_brawler', 'L', 640]], afterScene: 'dlg_c3_fire' },
        { trigger: 1400, objective: 'Seconda ondata', solo: [['orphan_brawler', 'R', 600]], duo: [['orphan_brawler', 'R', 600], ['orphan_brawler', 'R', 540], ['orphan_board', 'L', 620]] }],
      items: [{ kind: 'weapon', w: 'board', x: 820, y: 640 }, { kind: 'snack', x: 1260, y: 520 }] },
    { id: 'C3-03', ch: 'C3', kind: 'escape', name: 'Strada laterale', bg: 'street_b', width: 2560, depth: 220, party: AFTER_C1, objective: 'Verso la metro', mercy: 'npc',
      enter: 'cine_mercy_joins', items: [{ kind: 'drink', x: 1300, y: 640 }] },
    { id: 'C3-04', ch: 'C3', kind: 'escape', name: 'Stazione della 96ª Strada', bg: 'metro_b', width: 1920, depth: 170, party: AFTER_C1, objective: 'Sfuggi alla polizia', mercy: 'npc', enter: 'radio_96th',
      pursuers: { solo: { police_pursuer: 2 }, duo: { police_pursuer: 3 } }, exitScene: 'cine_police_split' },

    { id: 'C4-01', ch: 'C4', kind: 'escape', name: 'Ingresso del parco', bg: 'park_b', width: 1920, depth: 200, party: C4G, chapterCard: true, objective: 'Raggiungi il sentiero',
      enter: 'cine_furies_appear', timer: 45, timerEasy: 60, pursuers: { solo: { fury_flanker: 2 }, duo: { fury_flanker: 3 } } },
    { id: 'C4-02', ch: 'C4', kind: 'arena', name: 'Sentiero con panchine', bg: 'park', width: 2560, depth: 230, party: C4G, objective: 'Attraversa il sentiero', enter: 'dlg_c4_stand',
      tutorial: [{ flag: 'firstBat', until: 9, text: 'Disarmo: pesante ({heavy}) mentre il Fury si riprende dallo swing, oppure presa ({interact}); poi {interact} raccoglie la mazza' }],
      props: [{ kind: 'bench', x0: 640, x1: 790, y0: 466, y1: 488, solid: true, cover: true }, { kind: 'bench', x0: 1500, x1: 1650, y0: 640, y1: 662, solid: true, cover: true },
        { kind: 'bin', x0: 1120, x1: 1160, y0: 468, y1: 492, solid: true, use: true, label: 'Apri il cestino', contents: { solo: ['drink'], duo: ['drink', 'drink'] } }],
      waves: [{ trigger: 520, objective: 'Respingi i Furies', solo: [['fury_batter', 'R', 520], ['fury_flanker', 'R', 610], ['fury_batter', 'L', 600]], duo: [['fury_batter', 'R', 520], ['fury_flanker', 'R', 610], ['fury_batter', 'L', 600], ['fury_batter', 'R', 660], ['fury_flanker', 'L', 480]] }] },
    { id: 'C4-03', ch: 'C4', kind: 'arena', name: 'Radura', bg: 'park_b', width: 2560, depth: 240, party: C4G, objective: 'Raggiungi la radura',
      props: [{ kind: 'bench', x0: 900, x1: 1050, y0: 456, y1: 478, solid: true, cover: true }, { kind: 'bench', x0: 1900, x1: 2050, y0: 456, y1: 478, solid: true, cover: true }],
      items: [{ kind: 'kit', x: 1560, y: 672 }],
      waves: [
        { trigger: 380, objective: 'Ondata A', solo: [['fury_batter', 'R', 520], ['fury_batter', 'L', 620], ['fury_flanker', 'R', 600]], duo: [['fury_batter', 'R', 520], ['fury_batter', 'L', 620], ['fury_flanker', 'R', 600], ['fury_batter', 'R', 660], ['fury_flanker', 'L', 500]],
          onClear: { solo: [['snack', 1, 560]], duo: [['snack', -1, 560], ['snack', 1, 600]] } },
        { trigger: 1500, objective: 'Il capo dei Furies', boss: true, preScene: 'dlg_c4_ajax', preIf: 'ajax', preIfRoster: true, solo: [['fury_veteran', 'R', 560], ['fury_batter', 'L', 600]], duo: [['fury_veteran', 'R', 560], ['fury_batter', 'L', 600], ['fury_batter', 'R', 640]] }] },
    { id: 'C4-04', ch: 'C4', kind: 'scene', name: 'Il bivio', bg: 'park', width: 1280, depth: 200, party: C4G, scenes: ['cine_ajax_stays'] },

    { id: 'C5-01', ch: 'C5', kind: 'scene', name: 'La panchina', bg: 'park_b', width: 1280, depth: 200, party: ['snow', 'cowboy'], chapterCard: true, scenes: ['cine_ajax_arrest'] },
    { id: 'C5-02', ch: 'C5', kind: 'traversal', name: 'L\'appartamento', bg: 'interior', width: 1280, depth: 170, party: ['vermin', 'cochise', 'rembrandt'], present: ['vermin', 'cochise', 'rembrandt'], peace: true,
      enter: 'dlg_c5_welcome', objective: 'Entra nella stanza', exitInteract: { x: 1100, y: 560, label: 'Entra nella stanza' } },
    { id: 'C5-03', ch: 'C5', kind: 'escape', name: 'La trappola', bg: 'interior', width: 1920, depth: 170, party: ['vermin', 'cochise', 'rembrandt'], objective: 'Sfonda la porta chiusa a chiave',
      enter: 'cine_lizzies_trap', timer: 55, timerEasy: 70, panel: { x: 1700, y: 560, hits: 3 }, radioProp: { x: 420, y: 520 },
      props: [{ kind: 'crate', x0: 700, x1: 760, y0: 540, y1: 566, solid: true, cover: true }, { kind: 'crate', x0: 1180, x1: 1240, y0: 610, y1: 636, solid: true, cover: true }],
      stationed: { solo: [['lizzie_blocker', 1500, 600], ['lizzie_shooter', 1300, 530]], duo: [['lizzie_blocker', 1500, 600], ['lizzie_blocker', 1600, 540], ['lizzie_shooter', 1300, 530], ['lizzie_shooter', 1100, 650]] } },
    { id: 'C5-04', ch: 'C5', kind: 'traversal', name: 'Sotterraneo', bg: 'metro_b', width: 1920, depth: 170, party: ['swan'], mercy: 'player2', peace: true,
      objective: 'Attraversa il sotterraneo con Mercy', midScene: { x: 900, scene: 'cine_swan_mercy' }, exitInteract: { x: 1800, y: 580, label: 'Apri la porta', both: true } },
    { id: 'C5-05', ch: 'C5', kind: 'traversal', name: 'Verso Union Square', bg: 'street', width: 1920, depth: 200, party: ['snow', 'cowboy'], present: ['snow', 'cowboy'], peace: true,
      objective: 'Raggiungi Union Square', exitScene: 'cine_reunion_approach' },

    { id: 'C6-01', ch: 'C6', kind: 'traversal', name: 'Union Square', bg: 'metro_b', width: 1920, depth: 180, party: FINAL6, present: FINAL6, mercy: 'npc', peace: true, chapterCard: true,
      enter: 'cine_reunion', objective: 'Raggiungi i bagni', watcher: 'punk' },
    { id: 'C6-02', ch: 'C6', kind: 'stealth', name: 'I bagni', bg: 'interior', width: 1280, depth: 150, party: FINAL6, present: FINAL6, amb: 'interior', mood: 'silence',
      objective: 'Nasconditi in un gabinetto: avvicinati a una porta e premi {interact}', stalls: [300, 470, 640, 810, 980], enter: 'dlg_c6_bathroom' },
    { id: 'C6-03', ch: 'C6', kind: 'arena', name: 'Il bagno', bg: 'interior', width: 1920, depth: 170, party: FINAL6, objective: 'Il capo dei Punks', enter: 'cine_bathroom_chaos',
      waves: [
        { trigger: 260, objective: 'Escono tutti dai bagni', dropIf: 'skater_down', solo: [['punk_brawler', 'R', 600], ['punk_brawler', 'L', 620], ['punk_grappler', 'R', 580]], duo: [['punk_brawler', 'R', 600], ['punk_brawler', 'L', 620], ['punk_grappler', 'R', 580], ['punk_brawler', 'R', 650], ['punk_grappler', 'L', 600]], onClear: { solo: [['snack', 1, 600]], duo: [['snack', 1, 600], ['drink', -1, 620]] } },
        { trigger: 1000, objective: 'Capo Punks', boss: true, solo: [['punk_leader', 'R', 600], ['punk_brawler', 'L', 620]], duo: [['punk_leader', 'R', 600], ['punk_brawler', 'L', 620], ['punk_brawler', 'R', 560]] }] },
    { id: 'C6-04', ch: 'C6', kind: 'traversal', name: 'Banchina', bg: 'metro', width: 1280, depth: 180, party: FINAL6, present: FINAL6, mercy: 'npc', peace: true,
      objective: 'Sali sul treno', exitScene: 'cine_truth_reaches_riffs' },

    { id: 'C7-01', ch: 'C7', kind: 'traversal', name: 'L\'ultimo treno', bg: 'metro', width: 1920, depth: 110, party: ['swan'], mercy: 'player2', present: ['snow', 'cowboy', 'cochise', 'vermin', 'rembrandt'], peace: true, chapterCard: true, seated: true,
      enter: 'cine_train_dawn', objective: 'Il treno corre verso casa', talks: [{ who: 'couple', set: 'civilian', x: 1100, y: 600, scene: 'talk_c7_couple' }, { who: 'cowboy', x: 700, y: 620 }], needTalks: 1, needTalk: 'couple' },
    { id: 'C7-02', ch: 'C7', kind: 'scene', name: 'Casa', bg: 'metro_b', width: 1280, depth: 200, party: ['swan'], scenes: ['cine_home_arrival'] },

    { id: 'C8-01', ch: 'C8', kind: 'traversal', name: 'Strada di casa', bg: 'coney_b', width: 1920, depth: 200, party: FINAL6, present: FINAL6, mercy: 'npc', chapterCard: true, peace: true,
      enter: 'cine_bottles', objective: 'Verso il lungomare' },
    { id: 'C8-02', ch: 'C8', kind: 'arena', name: 'Il varco', bg: 'coney', width: 1920, depth: 220, party: FINAL6, objective: 'I Rogues coprono il passaggio',
      waves: [{ trigger: 300, objective: 'Apri il varco', solo: [['rogue_brawler', 'R', 560], ['rogue_brawler', 'L', 620], ['rogue_bottle', 'R', 600]], duo: [['rogue_brawler', 'R', 560], ['rogue_brawler', 'L', 620], ['rogue_bottle', 'R', 600], ['rogue_brawler', 'R', 650], ['rogue_bottle', 'L', 540]] }] },
    { id: 'C8-03', ch: 'C8', kind: 'confront', name: 'La spiaggia', bg: 'boardwalk', width: 1280, depth: 230, party: FINAL6, objective: 'Avanza verso Luther', mark: { x: 760, y: 580 }, scenes: ['cine_disarm', 'cine_riffs_arrival'] },
    { id: 'C8-04', ch: 'C8', kind: 'epilogue', name: 'Alba', bg: 'boardwalk', width: 1280, depth: 230, party: FINAL6, scenes: ['radio_apology', 'cine_epilogue'] }
  ];

  W.CHAPTERS = {
    P0: 'Prologo · Coney Island', C1: 'Capitolo 1 · Il raduno', C2: 'Capitolo 2 · Braccati', C3: 'Capitolo 3 · Territorio nemico', C4: 'Capitolo 4 · Baseball Furies',
    C5: 'Capitolo 5 · La banda divisa', C6: 'Capitolo 6 · Union Square', C7: 'Capitolo 7 · L\'ultimo treno', C8: 'Capitolo 8 · Coney Island'
  };
  // ostacoli dei corridoi: pochi, credibili per il luogo; si saltano, si aggirano o si sfondano
  var OBST = {
    'C1-03': { lowStyle: 'hedge', obstacles: [['low', 620, 0, 0.55], ['low', 1150, 0.45, 1], ['low', 2150, 0, 1]] },
    'C1-04': { lowStyle: 'grave', obstacles: [['low', 520, 0, 0.45], ['low', 820, 0.5, 1]] },
    'C2-01': { lowStyle: 'barrier', obstacles: [['crate', 760, 0.05, 0.4], ['low', 1300, 0, 0.6], ['crate', 1850, 0.6, 1, 'snack'], ['low', 2200, 0.35, 1]] },
    'C2-03': { lowStyle: 'barrier', obstacles: [['low', 2100, 0, 1], ['crate', 2850, 0.3, 0.7, 'drink']] },
    'C2-04': { lowStyle: 'turnstile', train: true, obstacles: [['low', 560, 0, 0.75]] },
    'C3-03': { lowStyle: 'barrier', obstacles: [['fire', 880, 0.25, 1], ['low', 1650, 0, 0.75], ['crate', 2100, 0, 0.35, 'snack']] },
    'C3-04': { lowStyle: 'turnstile', train: true, obstacles: [['low', 520, 0, 0.75], ['fire', 1200, 0, 0.45]] },
    'C4-01': { lowStyle: 'hedge', obstacles: [['low', 600, 0, 0.55], ['low', 1080, 0.45, 1], ['low', 1500, 0, 1]] },
    'C5-04': { lowStyle: 'barrier', train: true, obstacles: [['low', 560, 0, 0.75], ['crate', 1300, 0, 0.4], ['low', 1500, 0.3, 0.75]] },
    'C5-05': { lowStyle: 'barrier', obstacles: [['crate', 700, 0.55, 1, 'drink'], ['low', 1250, 0, 0.6]] },
    'C6-01': { lowStyle: 'turnstile', obstacles: [['low', 820, 0, 1]] },
    'C6-04': { lowStyle: 'turnstile', train: true, obstacles: [] },
    'C8-01': { lowStyle: 'barrier', obstacles: [['low', 900, 0, 1], ['crate', 1400, 0.5, 0.9, 'snack']] }
  };
  A.forEach(function (a) { var o = OBST[a.id]; if (o) for (var k in o) a[k] = o[k]; });

  // luce e musica per area: sera al prologo, notte, alba sul treno e a Coney Island
  A.forEach(function (a) {
    if (a.ch === 'P0') a.light = 'dusk';
    if (a.ch === 'C7' || a.ch === 'C8') { a.light = 'dawn'; if (a.kind !== 'arena') a.mood = 'dawn'; }
  });
  A.filter(function (a) { return a.id === 'C4-01'; })[0].mood = 'silence';

  // ------------------------------------------------------------------ eventi in contemporanea
  // Nel capitolo 5 la banda è divisa in tre gruppi: ogni area dice a quale gruppo appartiene.
  // La vignetta di passaggio mostra «Intanto…», il luogo e lo stato degli altri gruppi.
  W.THREADS = {
    swan:   { label: 'Swan e Mercy', members: ['swan', 'mercy'],
      status: function (f) { return f.swan_mercy_bond ? 'Verso Union Square' : (f.party_split ? 'Nei tunnel della metro' : 'Insieme agli altri'); } },
    park:   { label: 'Ajax, Snow e Cowboy', members: ['ajax', 'snow', 'cowboy'],
      status: function (f) { return f.regroup_target ? 'Snow e Cowboy verso Union Square' : (f.ajax_arrested ? 'Ajax arrestato · Snow e Cowboy in fuga' : 'Riverside Park'); } },
    lizzies:{ label: 'Vermin, Cochise e Rembrandt', members: ['vermin', 'cochise', 'rembrandt'],
      status: function (f) { return f.lizzies_trap ? 'Scappati dalle Lizzies' : (f.party_split ? 'Ospiti delle Lizzies' : 'Insieme agli altri'); } }
  };
  [['C5-01', 'park', 'Riverside Park'], ['C5-02', 'lizzies', 'Un appartamento sconosciuto'], ['C5-03', 'lizzies', 'La stanza delle Lizzies'],
   ['C5-04', 'swan', 'Dalla 96ª Strada, a piedi lungo i binari'], ['C5-05', 'park', 'Snow e Cowboy, verso Union Square']].forEach(function (t) {
    var a = A.filter(function (x) { return x.id === t[0]; })[0]; a.thread = t[1]; a.where = t[2];
  });
  W.OUT_AFTER = { C1: ['cleon'], C3: ['fox'], C4: ['ajax'] };

  // ------------------------------------------------------------------ la DJ
  // Intermezzi radio all'inizio dei capitoli: battute originali dell'adattamento, non citazioni del film.
  W.RADIO = {
    C1: ['Buonasera, città. Stanotte nel Bronx c\'è una riunione che non si è mai vista: tutte le bande, nello stesso posto.', 'Si dice che qualcuno voglia cambiare le regole. Restate sintonizzati.'],
    C2: ['Aggiornamento dal Bronx: i Warriors sono a piedi, e lontani da casa.', 'Un saluto ai ragazzi di Coney Island. La strada per il mare è lunga, stanotte.'],
    C3: ['La metro va a singhiozzo, stanotte. Un incendio sui binari, treni fermi a metà strada.', 'E chi scende dove non dovrebbe, scende in casa d\'altri.'],
    C4: ['Ancora nessuna notizia dei ragazzi con il gilet. Qualcuno dice che sono vicini al fiume.', 'Il parco di notte è un brutto posto per fermarsi. Musica.'],
    C5: ['Aggiornamento per chi tiene il conto: i Warriors non sono più tutti insieme.', 'Divisi, stanchi, ancora lontani da casa. Questa la dedico a chi si è perso.'],
    C6: ['Sono ancora in piedi. Non so come, ma sono ancora in piedi.', 'Si dice che stiano passando da Union Square. Chi è da quelle parti, faccia gli onori di casa.'],
    C7: ['Sta arrivando la luce. La notte più lunga della città sta finendo.', 'E un treno corre verso il mare.'],
    C8: ['Buongiorno, città. Da Coney Island ci dicono che i ragazzi sono arrivati.', 'Ma non sono gli unici, laggiù. Qualcuno li stava aspettando.']
  };
  W.NPC_NAMES.dj = 'La DJ';

  W.areaIndex = function (id) { for (var i = 0; i < A.length; i++) if (A[i].id === id) return i; return -1; };
})();
