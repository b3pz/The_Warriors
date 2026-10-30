// Flusso: titolo → menu → modalità → campagna (35 aree) → crediti → risultato.
// Ciclo a passo fisso 60 Hz con rendering separato.
'use strict';
var W = window.W;

(function () {
  var C = W.CFG, cv, ctx, R = W.Render;
  var game = { state: 'title', world: null, sel: null, menuIdx: 0, fails: 0, snap: null, result: null, msg: null, run: null, party: null, credits: 0 };
  var options = { shake: true, flash: true, sfx: 0.8, music: 0.5, scenery: true };
  var SAVE_KEY = 'warriors-story-v1', OPT_KEY = 'warriors-options-v1', UNLOCK_KEY = 'warriors-unlocks-v1';
  var ALL9 = W.ROSTER.map(function (c) { return c.id; });

  // ------------------------------------------------------------------ salvataggi (scrittura validata, backup)
  function storage() { try { var k = '__w'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; } catch (e) { return null; } }
  function validSave(d) { return d && d.version === 2 && W.areaIndex(d.area) >= 0 && d.roster && d.chars; }
  function loadSave() {
    var s = storage(); if (!s) return null;
    try {
      var d = JSON.parse(s.getItem(SAVE_KEY)); if (validSave(d)) return d;
      var b = JSON.parse(s.getItem(SAVE_KEY + '-backup')); if (validSave(b)) return b;
    } catch (e) {}
    return null;
  }
  function writeSave(data) {
    var s = storage(); if (!s) { game.msg = { text: 'Salvataggio non disponibile: la partita continua senza salvare', t: 4 }; return; }
    try {
      var json = JSON.stringify(data); JSON.parse(json);
      var old = s.getItem(SAVE_KEY); if (old) s.setItem(SAVE_KEY + '-backup', old);
      s.setItem(SAVE_KEY, json);
    } catch (e) { game.msg = { text: 'Salvataggio non riuscito', t: 4 }; }
  }
  function unlocks() { var s = storage(); try { return (s && JSON.parse(s.getItem(UNLOCK_KEY))) || ['P0']; } catch (e) { return ['P0']; } }
  function unlock(ch) { var u = unlocks(); if (u.indexOf(ch) < 0) { u.push(ch); var s = storage(); if (s) try { s.setItem(UNLOCK_KEY, JSON.stringify(u)); } catch (e) {} } }
  // ------------------------------------------------------------------ comandi rimappabili (warriors-keys-v1)
  var KEYS_KEY = 'warriors-keys-v1', DEFAULT_KEYS = JSON.parse(JSON.stringify(W.Input.LAYOUTS));
  var ACTION_NAMES = { up: 'Su', down: 'Giù', left: 'Sinistra', right: 'Destra', light: 'Colpo leggero', heavy: 'Colpo pesante', jump: 'Salto', dodge: 'Schivata', interact: 'Interazione · presa · parla', fury: 'Furia', throw: 'Lancia arma' };
  var ACTION_ORDER = ['up', 'down', 'left', 'right', 'light', 'heavy', 'jump', 'dodge', 'interact', 'fury', 'throw'];
  var LAYOUT_NAMES = { solo: 'Un giocatore', p1: 'Due giocatori · G1', p2: 'Due giocatori · G2' };
  function loadKeys() {
    var s = storage(); if (!s) return;
    try { var k = JSON.parse(s.getItem(KEYS_KEY)); if (k) for (var lay in k) for (var a in k[lay]) if (W.Input.LAYOUTS[lay] && W.Input.LAYOUTS[lay][a]) W.Input.LAYOUTS[lay][a] = k[lay][a]; } catch (e) {}
  }
  function saveKeys() { var s = storage(); if (s) try { s.setItem(KEYS_KEY, JSON.stringify(W.Input.LAYOUTS)); } catch (e) {} }
  function bindKey(lay, action, code) {
    var L = W.Input.LAYOUTS[lay], old = L[action].slice();
    // se il tasto era già usato da un'altra azione dello stesso schema, le due azioni si scambiano i tasti
    for (var a in L) if (a !== action && L[a].indexOf(code) >= 0) L[a] = old;
    L[action] = [code]; saveKeys();
  }
  function loadOptions() { var s = storage(); if (!s) return; try { var o = JSON.parse(s.getItem(OPT_KEY)); if (o) for (var k in options) if (k in o) options[k] = o[k]; } catch (e) {} applyOptions(); }
  function saveOptions() { var s = storage(); if (s) try { s.setItem(OPT_KEY, JSON.stringify(options)); } catch (e) {} applyOptions(); }
  function applyOptions() { R.opts.scenery = options.scenery; R.opts.shake = options.shake; R.opts.flash = options.flash; W.Audio.setVol('sfx', options.sfx); W.Audio.setVol('music', options.music); }

  // ------------------------------------------------------------------ etichette tasti
  var KEYNAME = { Space: 'Spazio', ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlRight: 'Ctrl dx', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
  function keyLabel(code) { if (KEYNAME[code]) return KEYNAME[code]; if (code.indexOf('Key') === 0) return code.slice(3); if (code.indexOf('Numpad') === 0) return 'Num' + code.slice(6); return code; }
  var TOUCH_NAMES = { light: 'COLPO', heavy: 'FORTE', jump: 'SALTO', dodge: 'SCHIVA', interact: 'AZIONE', fury: 'FURIA', throw: 'LANCIA' };
  var ui = {
    keyFor: function (p, a) { var d = p.device; if (W.Touch && W.Touch.active()) return TOUCH_NAMES[a] ? TOUCH_NAMES[a].slice(0, 2) : '•'; if (!d || !d.layout) return 'B'; return keyLabel(W.Input.LAYOUTS[d.layout][a][0]); },
    tutorialText: function (t) {
      var p = game.world.players[0], lay = p.device && p.device.layout ? W.Input.LAYOUTS[p.device.layout] : W.Input.LAYOUTS.solo;
      if (W.Touch && W.Touch.active()) return t.replace(/\{(\w+)\}/g, function (_, a) { return a === 'move' ? 'il joystick' : (TOUCH_NAMES[a] || a); });
      return t.replace(/\{(\w+)\}/g, function (_, a) {
        if (a === 'move') return lay.up[0] === 'KeyW' ? 'WASD' : 'frecce';
        return keyLabel(lay[a][0]);
      });
    }
  };

  // ------------------------------------------------------------------ campagna
  // run: modalità, difficoltà, personaggi degli slot, compagno CPU, roster disponibile, record per personaggio
  function newRun(sel, fromSave, startArea0) {
    var run = game.run = {
      mode: sel.mode, difficulty: sel.difficulty, chars: (fromSave && fromSave.chars) || [], cpuChar: fromSave ? fromSave.cpuChar : null,
      roster: (fromSave && fromSave.roster) || ALL9.slice(), records: (fromSave && fromSave.records) || {},
      areaIdx: fromSave ? W.areaIndex(fromSave.area) : (startArea0 || 0)
    };
    run.devices = sel.mode === 'duo2' ? [new W.Input.Device('p1', 0), new W.Input.Device('p2', 1)] : [new W.Input.Device('solo', 0)];
    var w = new W.World({ players: [], difficulty: sel.difficulty, seed: 1979 });
    game.world = w;
    if (fromSave) { w.score = fromSave.score.slice(); w.flags = fromSave.flags || {}; w.stats.retries = fromSave.retries || 0; w.stats.assisted = !!fromSave.assisted; w.stats.time = fromSave.time || 0; w.stats.kos = fromSave.kos || 0; }
    else if (startArea0) {
      // capitolo scelto: rimuovi chi è già uscito dalla storia prima di quel capitolo
      var ch = W.CAMPAIGN[startArea0].ch, order = ['P0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'];
      for (var k in W.OUT_AFTER) if (order.indexOf(k) < order.indexOf(ch)) run.roster = run.roster.filter(function (id) { return W.OUT_AFTER[k].indexOf(id) < 0; });
    }
    prepareArea();
  }

  function poolFor(def) {
    var r = game.run.roster;
    return def.party.filter(function (id) { return r.indexOf(id) >= 0; });
  }
  // decide gli slot; se un giocatore umano deve scegliere fra più Warriors, apre la selezione del gruppo
  // tentativi per capitolo: finiti, game over e si ricomincia dall'inizio del capitolo
  var TRIES = { facile: 5, normale: 3, difficile: 2 };
  function chapterCheckpoint() {
    var run = game.run, w = game.world, def = W.CAMPAIGN[run.areaIdx];
    if (run.chapterId === def.ch) return;
    run.chapterId = def.ch; run.triesLeft = TRIES[run.difficulty] || 3;
    run.chapterSave = JSON.stringify({ areaIdx: run.areaIdx, roster: run.roster, records: run.records, chars: run.chars, cpuChar: run.cpuChar, score: w.score, flags: w.flags, stats: w.stats });
  }
  function restartChapter() {
    var run = game.run, w = game.world, c = JSON.parse(run.chapterSave);
    run.areaIdx = c.areaIdx; run.roster = c.roster; run.records = c.records; run.chars = c.chars; run.cpuChar = c.cpuChar;
    w.score = c.score; w.flags = c.flags; var retries = w.stats.retries + 1; w.stats = c.stats; w.stats.retries = retries;
    run.chapterId = null; w.npcs = [];
    prepareArea();
  }
  function prepareArea() {
    chapterCheckpoint();
    var run = game.run, def = W.CAMPAIGN[run.areaIdx], pool = poolFor(def);
    if (!pool.length) pool = def.party.slice();
    var humans = run.mode === 'duo2' ? 2 : 1, picks = [], playable = ['scene', 'epilogue'].indexOf(def.kind) < 0;
    for (var s = 0; s < humans; s++) {
      if (s === 1 && def.mercy === 'player2') { run.chars[1] = 'mercy'; continue; }
      var cur = run.chars[s], others = run.chars.slice(0, s);
      var ok = cur && pool.indexOf(cur) >= 0 && others.indexOf(cur) < 0;
      if (!ok) {
        var opts = pool.filter(function (id) { return others.indexOf(id) < 0; });
        if (!opts.length) opts = pool.slice();
        run.chars[s] = opts[0];
        if (opts.length > 1 && playable) picks.push({ slot: s, opts: opts });
      } else if (def.chapterCard && playable && pool.length > 1 && !run.choseIn) {
        // inizio capitolo: si può cambiare Warrior
        var o2 = pool.filter(function (id) { return others.indexOf(id) < 0; });
        if (o2.length > 1) picks.push({ slot: s, opts: o2 });
      }
    }
    run.chars.length = humans;
    run.choseIn = null;
    if (picks.length) { game.party = { picks: picks, i: 0, cursor: Math.max(0, picks[0].opts.indexOf(run.chars[picks[0].slot])) }; game.state = 'party'; return; }
    startArea();
  }

  function saveRecords() {
    var w = game.world, run = game.run;
    w.players.forEach(function (p) {
      run.records[p.char.id] = { hp: p.state === 'ko' || p.out ? Math.round(p.maxhp * 0.3) : Math.round(p.hp), fury: p.fury, weapon: p.weapon ? { type: p.weapon.type, dur: p.weapon.dur } : null };
    });
  }
  function buildPlayers() {
    var w = game.world, run = game.run, def = W.CAMPAIGN[run.areaIdx];
    w.players = [];
    run.chars.forEach(function (id, s) { var p = new W.Player(w, { id: id, device: run.devices[s] }, s, false); w.players.push(p); });
    if (run.mode === 'cpu' && def.mercy !== 'player2') {
      var pool = poolFor(def).filter(function (id) { return run.chars.indexOf(id) < 0; });
      var cpu = pool.indexOf(run.cpuChar) >= 0 ? run.cpuChar : pool[0];
      if (cpu) { run.cpuChar = cpu; w.players.push(new W.Player(w, { id: cpu, device: null }, 1, true)); }
    }
    w.players.forEach(function (p) {
      var rec = run.records[p.char.id];
      if (rec) { p.hp = Math.max(1, Math.min(p.maxhp, rec.hp)); p.fury = rec.fury || 0; p.weapon = rec.weapon ? { type: rec.weapon.type, dur: rec.weapon.dur } : null; }
      // fiato tra un'area e l'altra: inizio capitolo a salute piena, altrimenti almeno una quota per difficoltà
      var dz = W.DIFFICULTY[run.difficulty] || W.DIFFICULTY.normale;
      p.hp = def.chapterCard ? p.maxhp : Math.max(p.hp, Math.round(p.maxhp * (dz.recover || 0.5)));
    });
  }
  function startArea() {
    var w = game.world, run = game.run, def = W.CAMPAIGN[run.areaIdx];
    buildPlayers();
    w.failed = false; w.failReason = null; w.enemies = []; w.projectiles = []; w.eproj = []; w.attackers = 0;
    w.area = new W.AreaRun(def, w, { roster: run.roster, difficulty: run.difficulty });
    game.snap = w.snapshot(); game.fails = 0;
    unlock(def.ch);
    writeSave({ version: 2, area: def.id, mode: run.mode, difficulty: run.difficulty, chars: run.chars, cpuChar: run.cpuChar, roster: run.roster, records: run.records,
      score: w.score.slice(), retries: w.stats.retries, assisted: w.stats.assisted, time: w.stats.time, kos: w.stats.kos, flags: w.flags });
    R.reset(); game.state = 'play';
  }
  function retry(assist) {
    var w = game.world; w.stats.retries++;
    if (assist) w.stats.assisted = true;
    w.restore(game.snap, assist);
    w.npcs = [];
    w.area = new W.AreaRun(game.run.arcade ? game.run.arcDef : W.CAMPAIGN[game.run.areaIdx], w, { roster: game.run.roster, difficulty: game.run.difficulty });
    // al retry le scene già viste non si ripetono: resta solo il cartello del capitolo saltato
    w.area.sceneQueue = []; w.players.forEach(function (p) { p.hidden = false; });
    if (w.area.kind === 'scene' || w.area.kind === 'epilogue') w.area.sceneQueue = (w.area.def.scenes || []).map(function (s) { return W.SCENES[s]; });
    R.reset(); game.state = 'play';
  }
  function areaFinished() {
    if (game.run.arcade) { arcadeFinished(); return; }
    var w = game.world, run = game.run, def = W.CAMPAIGN[run.areaIdx];
    saveRecords();
    var next = W.CAMPAIGN[run.areaIdx + 1];
    if (!next || next.ch !== def.ch) {
      (W.OUT_AFTER[def.ch] || []).forEach(function (id) { run.roster = run.roster.filter(function (r) { return r !== id; }); });
    }
    if (!next) { endCampaign(); return; }
    run.areaIdx++;
    startComic(next, function () { prepareArea(); });
  }
  // ------------------------------------------------------------------ transizione a fumetto
  // L'ultimo fotogramma dell'area diventa una vignetta inchiostrata con retino; la didascalia annuncia il luogo successivo.
  var COMIC_LEAD = { P0: 'Coney Island, quella sera.', C1: 'Pelham Bay Park, Bronx.', C2: 'Le strade del Bronx.', C3: 'Territorio degli Orphans.', C4: 'Riverside Park, Manhattan.', C5: 'La banda si divide.', C6: 'Union Square.', C7: 'L\'ultimo treno.', C8: 'Coney Island, all\'alba.' };
  // vignetta del luogo successivo: il fondale disegnato con il gruppo in posa
  function nextPanel(next) {
    var c = document.createElement('canvas'); c.width = C.VIEW_W; c.height = C.VIEW_H;
    var g = c.getContext('2d'), fake = { def: next, width: next.width || 1920, floor: [680 - (next.depth || 200), 680] };
    try { if (W.Scenery) { var save = ctx; ctx = g; W.Scenery.draw(g, fake, Math.max(0, (fake.width - C.VIEW_W) * 0.15)); ctx = save; } } catch (e) {}
    var who = game.run && game.run.arcade ? game.run.chars.slice() : next.thread ? W.THREADS[next.thread].members.slice() : poolFor(next).slice(0, 5);
    if (!(game.run && game.run.arcade) && !next.thread && next.mercy && who.indexOf('mercy') < 0) who.push('mercy');
    who = who.filter(function (id) { return !(id === 'ajax' && game.world.flags.ajax_arrested && !game.run.arcade); });
    var save2 = ctx; ctx = g;
    who.forEach(function (id, i) {
      var n = who.length, px = n === 1 ? 640 : 330 + i * (620 / (n - 1));
      drawPortrait(id, px, fake.floor[0] + (fake.floor[1] - fake.floor[0]) * (0.45 + 0.14 * (i % 2)), 1.7, true);
    });
    ctx = save2;
    return c;
  }
  // percorso della notte: dal Bronx a Coney Island
  var STOPS = [
    { ch: 'P0', name: 'Coney Island', x: 0.42, y: 0.9 }, { ch: 'C1', name: 'Bronx · il raduno', x: 0.62, y: 0.1 },
    { ch: 'C2', name: 'Gun Hill Road', x: 0.5, y: 0.2 }, { ch: 'C3', name: '96ª Strada', x: 0.38, y: 0.36 },
    { ch: 'C4', name: 'Riverside Park', x: 0.26, y: 0.46 }, { ch: 'C5', name: 'Divisi', x: 0.36, y: 0.56 },
    { ch: 'C6', name: 'Union Square', x: 0.44, y: 0.66 }, { ch: 'C7', name: 'Ultimo treno', x: 0.5, y: 0.78 }, { ch: 'C8', name: 'Coney Island', x: 0.42, y: 0.9 }];
  function drawMap(x, y, w, h, ch, k) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = '#d9cfb4'; ctx.fillRect(x, y, w, h);
    // acqua e isole stilizzate
    ctx.fillStyle = '#9fb3b8'; ctx.fillRect(x, y, w * 0.18, h); ctx.fillRect(x, y + h * 0.82, w, h * 0.18);
    ctx.fillStyle = '#c9bc9a'; ctx.beginPath(); ctx.moveTo(x + w * 0.22, y); ctx.lineTo(x + w * 0.5, y + h * 0.7); ctx.lineTo(x + w * 0.42, y + h * 0.82); ctx.lineTo(x + w * 0.2, y + h * 0.3); ctx.fill();
    var idx = 0; STOPS.forEach(function (s, i) { if (s.ch === ch) idx = i; });
    var P = function (i) { return [x + STOPS[i].x * w, y + STOPS[i].y * h]; };
    // andata (grigia) e ritorno (rosso) fin qui
    ctx.lineCap = 'round'; ctx.setLineDash([6, 6]); ctx.strokeStyle = '#6b6658'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo.apply(ctx, P(0)); ctx.lineTo.apply(ctx, P(1)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#d62828'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo.apply(ctx, P(1));
    var reach = Math.max(1, idx - 1 + k);
    for (var i = 2; i <= Math.min(STOPS.length - 1, Math.ceil(reach)); i++) {
      var a = P(i - 1), b = P(i), f = Math.min(1, reach - (i - 1)); ctx.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f);
    }
    if (idx >= 1) ctx.stroke();
    STOPS.forEach(function (s, i) {
      if (i === 0 && idx > 0) return;
      var p = P(i), on = i === idx, done = i < idx;
      ctx.fillStyle = on ? '#f2d23c' : done ? '#d62828' : '#efe6cc'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(p[0], p[1], on ? 9 : 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (on || i === 1 || i === STOPS.length - 1) { ctx.fillStyle = '#111'; ctx.font = (on ? '700 16px' : '500 13px') + ' "Oswald", sans-serif'; ctx.textAlign = 'left'; ctx.fillText(s.name.toUpperCase(), p[0] + 14, p[1] + 5); }
    });
    ctx.restore();
  }
  function startComic(next, then) {
    var snap = document.createElement('canvas'); snap.width = C.VIEW_W; snap.height = C.VIEW_H;
    try { if (game.world && game.world.area) R.frame(game.world, 0, { noHud: true }); snap.getContext('2d').drawImage(cv, 0, 0); } catch (e) {}
    var prev = W.CAMPAIGN[game.run.areaIdx - 1], newCh = next.ch !== (prev && prev.ch);
    var cap = newCh ? COMIC_LEAD[next.ch] : next.name + '.', sub = newCh ? W.CHAPTERS[next.ch] : '';
    if (next.thread) {
      var th = W.THREADS[next.thread];
      cap = (prev && prev.thread && prev.thread !== next.thread ? 'Intanto · ' : '') + (next.id === 'C5-05' ? 'Snow e Cowboy' : th.label);
      sub = next.where;
    }
    var nxt = null; try { nxt = nextPanel(next); } catch (e) {}
    game.comic = { img: snap, next: nxt, t: 0, cap: cap, sub: sub, then: then, tilt: (Math.random() - 0.5) * 0.05, thread: next.thread, ch: next.ch,
      layout: next.thread ? 'thread' : newCh ? 'chapter' : 'step', dur: next.thread ? 3.8 : newCh ? 4.4 : 2.4 };
    game.state = 'comic'; W.Audio.ui();
  }
  // tavola dei tre gruppi divisi: dove sono e come stanno; evidenzia il gruppo che si gioca
  function drawThreadBoard(c, a) {
    var f = game.world.flags, keys = ['swan', 'park', 'lizzies'], w0 = 340, x0 = C.VIEW_W / 2 - (w0 * 3 + 40) / 2, y0 = 470;
    ctx.save(); ctx.globalAlpha = a;
    keys.forEach(function (k, i) {
      var th = W.THREADS[k], x = x0 + i * (w0 + 20), cur = k === c.thread;
      ctx.fillStyle = '#111'; ctx.fillRect(x + 6, y0 + 6, w0, 190);
      ctx.fillStyle = cur ? '#f2d23c' : '#e8dcc0'; ctx.fillRect(x, y0, w0, 190); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(x, y0, w0, 190);
      th.members.forEach(function (id, j) {
        var gone = id === 'ajax' && f.ajax_arrested;
        ctx.globalAlpha = a * (gone ? 0.3 : 1);
        drawPortrait(id, x + 70 + j * 100 - (th.members.length === 2 ? -50 : 0), y0 + 132, 1.15, true);
        ctx.globalAlpha = a;
      });
      ctx.fillStyle = '#111'; ctx.font = '700 18px "Oswald", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(th.label.toUpperCase(), x + w0 / 2, y0 + 158);
      ctx.font = '500 15px "Oswald", sans-serif'; ctx.fillText(th.status(f), x + w0 / 2, y0 + 180);
    });
    ctx.restore();
  }
  var halftone = null;
  // inchiostro e retino su un'immagine dentro una vignetta
  function inkPanel(img, x, y, w, h, k, ink, tilt, fy) {
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(tilt || 0);
    ctx.fillStyle = '#111'; ctx.fillRect(-w / 2 + 7, -h / 2 + 7, w, h);                 // ombra
    ctx.fillStyle = '#111'; ctx.fillRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10);        // bordo
    ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip();
    if (img) { var sc = Math.max(w / img.width, h / img.height), iw = img.width * sc, ih = img.height * sc, oy = fy === undefined ? -ih / 2 : h / 2 - ih + (ih - h) * (1 - fy); ctx.drawImage(img, -iw / 2, oy, iw, ih); }
    ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,' + ink * 0.55 + ')'; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(232,180,120,' + ink * 0.35 + ')'; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.5 + ink * 0.5; ctx.fillStyle = ctx.createPattern(halftone, 'repeat'); ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
  function caption(text, x, y, size, bg, rot) {
    ctx.save(); ctx.font = '700 ' + size + 'px "Oswald", sans-serif';
    var tw = ctx.measureText(text).width + size * 1.4, hh = size * 1.85;
    ctx.translate(x, y); ctx.rotate(rot || -0.02);
    ctx.fillStyle = '#111'; ctx.fillRect(6, 6, tw, hh); ctx.fillStyle = bg || '#f2d23c'; ctx.fillRect(0, 0, tw, hh);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, tw, hh);
    ctx.fillStyle = '#111'; ctx.textAlign = 'left'; ctx.fillText(text, size * 0.7, hh * 0.7);
    ctx.restore();
  }
  // comparsa di una vignetta: scivola e si posa
  function pop(t, t0) { var k = Math.max(0, Math.min(1, (t - t0) / 0.3)); return 1 - Math.pow(1 - k, 3); }
  function drawComic(dt) {
    var c = game.comic; c.t += dt;
    if (!halftone) {
      halftone = document.createElement('canvas'); halftone.width = 12; halftone.height = 12;
      var h = halftone.getContext('2d'); h.fillStyle = 'rgba(0,0,0,0.35)'; h.beginPath(); h.arc(3, 3, 1.8, 0, Math.PI * 2); h.arc(9, 9, 1.8, 0, Math.PI * 2); h.fill();
    }
    ctx.fillStyle = '#e8dcc0'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);           // carta
    ctx.globalAlpha = 0.25; ctx.fillStyle = ctx.createPattern(halftone, 'repeat'); ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H); ctx.globalAlpha = 1;
    var t = c.t, k1 = pop(t, 0), k2, k3;
    if (c.layout === 'chapter') {
      // tavola a tre vignette: com'è finita · dove siamo sulla mappa · dove si va
      inkPanel(c.img, 40 - (1 - k1) * 300, 40, 620, 330, 1, 1, -0.015);
      k2 = pop(t, 0.45); if (k2 > 0) { ctx.save(); ctx.globalAlpha = k2; ctx.translate(0, (1 - k2) * -60);
        ctx.fillStyle = '#111'; ctx.fillRect(700 + 7, 40 + 7, 540, 330); ctx.fillRect(700 - 5, 40 - 5, 550, 340);
        drawMap(700, 40, 540, 330, c.ch, Math.min(1, Math.max(0, (t - 0.7) / 0.9))); ctx.restore(); }
      k3 = pop(t, 1.0); if (k3 > 0) { ctx.save(); ctx.globalAlpha = k3; inkPanel(c.next, 40 + (1 - k3) * 400, 410, 1200, 270, 0.25, 0, 0.008, 0.82); ctx.restore(); }
      if (t > 1.5) { ctx.save(); ctx.globalAlpha = Math.min(1, (t - 1.5) / 0.2); caption(c.sub.toUpperCase(), 70, 392, 30); caption(c.cap, 90, 628, 20, '#fff6d8', 0.01); ctx.restore(); }
    } else if (c.layout === 'thread') {
      inkPanel(c.next || c.img, 60 - (1 - k1) * 200, 30, 1160, 400, 1, 0.3, 0.01, 0.8);
      if (t > 0.3) { ctx.save(); ctx.globalAlpha = Math.min(1, (t - 0.3) / 0.2); caption(c.cap.toUpperCase(), 90, 52, 30); if (c.sub) caption(c.sub, 104, 120, 20, '#fff6d8', -0.01); ctx.restore(); }
      if (t > 0.5) drawThreadBoard(c, Math.min(1, (t - 0.5) / 0.3));
    } else {
      // due vignette: l'ultimo istante e il posto dove si arriva
      inkPanel(c.img, 50 - (1 - k1) * 200, 70, 640, 400, 1, 1, -0.02);
      k2 = pop(t, 0.5); if (k2 > 0) { ctx.save(); ctx.globalAlpha = k2; inkPanel(c.next, 600 + (1 - k2) * 300, 250, 630, 400, 1, 0.25, 0.015, 0.8); ctx.restore(); }
      if (t > 0.8) { ctx.save(); ctx.globalAlpha = Math.min(1, (t - 0.8) / 0.2); caption(c.cap.toUpperCase(), 640, 210, 28); ctx.restore(); }
    }
    if (t > 1) { ctx.globalAlpha = 0.6; txt('Invio o tocco per continuare', C.VIEW_W - 30, C.VIEW_H - 14, 13, '#111', 'right', 500); ctx.globalAlpha = 1; }
    if (c.t > c.dur) { game.comic = null; c.then(); }
  }
  function endCampaign() {
    var w = game.world, s = w.stats;
    game.result = { time: s.time, damageTaken: s.damageTaken, maxCombo: s.maxCombo, kos: s.kos, retries: s.retries, assisted: s.assisted, score: w.score[0] + w.score[1] };
    var st = storage(); if (st) try { st.removeItem(SAVE_KEY); } catch (e) {}
    game.state = 'credits'; game.credits = 0; game.menuIdx = 0;
  }


  // ------------------------------------------------------------------ arcade
  // Le risse della storia senza scene, da 1 a 4 giocatori (tastiera WASD, tastiera frecce, controller, CPU).
  var ARC_STAGES = ['C2-02', 'C3-02', 'C4-02', 'C4-03', 'C6-03', 'C8-02'];
  var ARC_DEV = [['off', '—'], ['kb1', 'Tastiera WASD'], ['kb2', 'Tastiera frecce'], ['pad0', 'Controller 1'], ['pad1', 'Controller 2'], ['pad2', 'Controller 3'], ['pad3', 'Controller 4'], ['cpu', 'CPU']];
  var ARC_KEY = 'warriors-arcade-v1';
  function arcState() {
    if (!game.arc) {
      var st = null; try { st = JSON.parse(storage().getItem(ARC_KEY)); } catch (e) {}
      game.arc = st || { slots: [{ dev: 'kb1', ch: 'swan' }, { dev: 'cpu', ch: 'ajax' }, { dev: 'off', ch: 'cochise' }, { dev: 'off', ch: 'snow' }], stage: 0, difficulty: 'normale' };
    }
    return game.arc;
  }
  function arcStages() { var u = unlocks(); return ARC_STAGES.filter(function (id) { return u.indexOf(W.CAMPAIGN[W.areaIndex(id)].ch) >= 0; }); }
  function arcItems() {
    var A = arcState(), avail = arcStages(), items = [];
    A.slots.forEach(function (sl, i) {
      items.push({ label: 'G' + (i + 1), val: function () { var d = ARC_DEV.filter(function (x) { return x[0] === sl.dev; })[0]; return d[1] + (sl.dev === 'off' ? '' : '  ·  ' + W.rosterById(sl.ch).name); },
        adj: function (d) { var k = ARC_DEV.findIndex(function (x) { return x[0] === sl.dev; }); sl.dev = ARC_DEV[(k + d + ARC_DEV.length) % ARC_DEV.length][0]; arcSave(); },
        act: function () { if (sl.dev === 'off') return; var k = ALL9.indexOf(sl.ch); sl.ch = ALL9[(k + 1) % ALL9.length]; arcSave(); } });
    });
    items.push({ label: 'Rissa', val: function () { return A.stage === 0 ? 'tutte di fila (' + avail.length + ')' : W.CAMPAIGN[W.areaIndex(avail[A.stage - 1])].name; },
      adj: function (d) { A.stage = (A.stage + d + avail.length + 1) % (avail.length + 1); arcSave(); } });
    items.push({ label: 'Difficoltà', val: function () { return W.DIFFICULTY[A.difficulty].name; }, adj: function (d) { A.difficulty = DIFFS[(DIFFS.indexOf(A.difficulty) + d + 3) % 3]; arcSave(); } });
    items.push({ label: 'Inizia', act: function () { startArcade(); } });
    items.push({ label: 'Indietro', act: function () { game.state = 'menu'; game.menuIdx = 0; } });
    return items;
  }
  function arcSave() { var st = storage(); if (st) try { st.setItem(ARC_KEY, JSON.stringify(game.arc)); } catch (e) {} }
  function startArcade() {
    var A = arcState(), avail = arcStages();
    var act = A.slots.filter(function (s) { return s.dev !== 'off'; });
    if (!act.some(function (s) { return s.dev !== 'cpu'; })) { game.msg = { text: 'Serve almeno un giocatore umano', t: 2 }; return; }
    var devs = act.map(function (s) { return s.dev; }).filter(function (d) { return d !== 'cpu'; });
    if (devs.some(function (d, i) { return devs.indexOf(d) !== i; })) { game.msg = { text: 'Due giocatori sullo stesso comando', t: 2 }; return; }
    var stages = A.stage === 0 ? avail.slice() : [avail[A.stage - 1]];
    game.run = { arcade: true, mode: 'arcade', difficulty: A.difficulty, chars: [], roster: ALL9.slice(), records: {}, stages: stages, stageI: 0,
      areaIdx: W.areaIndex(stages[0]), devices: [], triesLeft: 999 };
    var w = new W.World({ players: [], difficulty: A.difficulty, seed: (Date.now() % 100000) + 7 });
    game.world = w;
    arcadeArea();
  }
  // copia dell'arena senza scene né dialoghi; nemici in più per tre e quattro giocatori
  function arcadeDef(id, n) {
    var d = W.CAMPAIGN[W.areaIndex(id)], c = Object.assign({}, d);
    ['enter', 'exitScene', 'tutorial', 'needTalk', 'needTalks', 'midScene', 'scenes', 'mercy', 'thread', 'talks', 'present', 'seated', 'watcher', 'crowd'].forEach(function (k) { delete c[k]; });
    c.chapterCard = false;
    c.waves = (d.waves || []).map(function (wv) {
      var o = Object.assign({}, wv); delete o.preScene; delete o.preIf; delete o.dropIf; delete o.afterScene;
      var base = (n >= 2 ? wv.duo : wv.solo).slice();
      for (var k = 2; k < n; k++) wv.solo.slice(0, 2).forEach(function (e, j) { var e2 = e.slice(); e2[1] = (k + j) % 2 ? 'L' : 'R'; base.push(e2); });
      o.solo = base; o.duo = base; return o;
    });
    return c;
  }
  function arcadeArea() {
    var run = game.run, A = game.arc, w = game.world, id = run.stages[run.stageI];
    run.areaIdx = W.areaIndex(id);
    var act = A.slots.filter(function (s) { return s.dev !== 'off'; }), kb2 = act.some(function (s) { return s.dev === 'kb2'; });
    w.players = act.map(function (sl, k) {
      var dev = null;
      if (sl.dev === 'kb1') dev = new W.Input.Device(kb2 ? 'p1' : 'solo', act.some(function (q) { return /^pad/.test(q.dev); }) ? null : 0);
      else if (sl.dev === 'kb2') dev = new W.Input.Device('p2', null);
      else if (/^pad/.test(sl.dev)) dev = new W.Input.Device(null, +sl.dev.slice(3));
      return new W.Player(w, { id: sl.ch, device: dev }, k, sl.dev === 'cpu');
    });
    run.chars = w.players.map(function (p) { return p.char.id; });
    run.arcDef = arcadeDef(id, w.players.length);
    w.failed = false; w.failReason = null; w.enemies = []; w.projectiles = []; w.eproj = []; w.attackers = 0; w.npcs = []; w.flags = {};
    w.area = new W.AreaRun(run.arcDef, w, { roster: run.roster, difficulty: run.difficulty });
    w.area.sceneQueue = []; w.area.scene = null;
    game.snap = w.snapshot(); game.fails = 0;
    R.reset(); game.state = 'play';
  }
  function arcadeFinished() {
    var run = game.run, w = game.world;
    run.stageI++;
    if (run.stageI < run.stages.length) { var nx = W.CAMPAIGN[W.areaIndex(run.stages[run.stageI])]; startComic(nx, arcadeArea); return; }
    var s = w.stats;
    game.result = { title: run.stages.length > 1 ? 'TUTTE LE RISSE VINTE' : 'RISSA VINTA', time: s.time, damageTaken: s.damageTaken, maxCombo: s.maxCombo, kos: s.kos, retries: s.retries, assisted: s.assisted,
      score: w.score.slice(0, w.players.length).reduce(function (a, b) { return a + b; }, 0) };
    game.state = 'result'; game.menuIdx = 0;
  }
  // ------------------------------------------------------------------ menu
  function chapterStarts() { var out = []; W.CAMPAIGN.forEach(function (a, i) { if (!out.some(function (o) { return o.ch === a.ch; })) out.push({ ch: a.ch, idx: i }); }); return out; }
  function menuItems() {
    if (game.state === 'menu') {
      var it = [];
      var sv = loadSave();
      if (sv) it.push({ label: 'Continua · ' + sv.area + ' ' + (W.CAMPAIGN[W.areaIndex(sv.area)] || {}).name, act: function () { newRun({ mode: sv.mode, difficulty: sv.difficulty }, sv); } });
      it.push({ label: 'Nuova storia', act: function () { game.state = 'select'; game.sel = { step: 0, mode: 'solo', difficulty: 'normale', start: 0 }; } });
      if (unlocks().length > 1) it.push({ label: 'Capitoli', act: function () { game.state = 'chapters'; game.menuIdx = 0; } });
      if (arcStages().length) it.push({ label: 'Arcade · risse fino a 4', act: function () { game.state = 'arcade'; game.menuIdx = 0; } });
      it.push({ label: 'Come si gioca', act: function () { game.state = 'howto'; } });
      it.push({ label: 'Opzioni', act: function () { game.state = 'options'; game.menuIdx = 0; } });
      return it;
    }
    if (game.state === 'arcade') return arcItems();
    if (game.state === 'chapters') {
      var u = unlocks(), list = chapterStarts().filter(function (c) { return u.indexOf(c.ch) >= 0; }).map(function (c) {
        return { label: W.CHAPTERS[c.ch], act: function () { game.state = 'select'; game.sel = { step: 0, mode: 'solo', difficulty: 'normale', start: c.idx }; } };
      });
      list.push({ label: 'Indietro', act: function () { game.state = 'menu'; game.menuIdx = 0; } });
      return list;
    }
    if (game.state === 'pause') {
      var ar = game.world.area, items = [{ label: 'Riprendi', act: function () { game.state = 'play'; W.Audio.resume(); } }];
      if (ar && ar.scene) items.push({ label: 'Salta scena', act: function () { ar.scene.skip(); game.state = 'play'; } });
      if (ar && ar.kind === 'training' && !ar.trainDone) items.push({ label: 'Salta allenamento', act: function () { ar.stepIdx = ar.def.steps.length; game.state = 'play'; } });
      items.push({ label: 'Ricomincia dal checkpoint', act: function () { retry(false); } });
      items.push({ label: (game.world.debug ? 'Nascondi' : 'Mostra') + ' debug (F3)', act: function () { game.world.debug = !game.world.debug; } });
      items.push({ label: 'Menu principale', act: function () { game.state = 'menu'; game.menuIdx = 0; } });
      return items;
    }
    if (game.state === 'gameover') return [
      { label: 'Ricomincia il capitolo', act: function () { restartChapter(); } },
      { label: 'Menu principale', act: function () { game.state = 'menu'; game.menuIdx = 0; } }
    ];
    if (game.state === 'fail') {
      var f = [{ label: 'Riprova dal checkpoint', act: function () { retry(false); } }];
      if (game.fails >= 2) f.push({ label: 'Riprova con assistenza (salute piena)', act: function () { retry(true); } });
      f.push({ label: 'Menu principale', act: function () { game.state = 'menu'; game.menuIdx = 0; } });
      return f;
    }
    if (game.state === 'options') return [
      { label: 'Effetti', val: function () { return Math.round(options.sfx * 10); }, adj: function (d) { options.sfx = Math.max(0, Math.min(1, options.sfx + d * 0.1)); saveOptions(); } },
      { label: 'Musica e ambiente', val: function () { return Math.round(options.music * 10); }, adj: function (d) { options.music = Math.max(0, Math.min(1, options.music + d * 0.1)); saveOptions(); } },
      { label: 'Scossa schermo', val: function () { return options.shake ? 'sì' : 'no'; }, adj: function () { options.shake = !options.shake; saveOptions(); } },
      { label: 'Lampi', val: function () { return options.flash ? 'sì' : 'no'; }, adj: function () { options.flash = !options.flash; saveOptions(); } },
      { label: 'Fondali', val: function () { return options.scenery ? 'disegnati' : 'ritagli delle tavole'; }, adj: function () { options.scenery = !options.scenery; saveOptions(); } },
      { label: 'Comandi · un giocatore', act: function () { game.keyLayout = 'solo'; game.state = 'keys'; game.menuIdx = 0; } },
      { label: 'Comandi · due giocatori G1', act: function () { game.keyLayout = 'p1'; game.state = 'keys'; game.menuIdx = 0; } },
      { label: 'Comandi · due giocatori G2', act: function () { game.keyLayout = 'p2'; game.state = 'keys'; game.menuIdx = 0; } },
      { label: 'Indietro', act: function () { game.state = 'menu'; game.menuIdx = 0; } }
    ];
    if (game.state === 'keys') {
      var lay = game.keyLayout, L = W.Input.LAYOUTS[lay];
      var ks = ACTION_ORDER.map(function (a) { return { label: ACTION_NAMES[a], val: function () { return game.binding === a ? '…premi un tasto' : L[a].map(keyLabel).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).join(' / '); }, act: function () { game.binding = a; } }; });
      ks.push({ label: 'Ripristina predefiniti', act: function () { W.Input.LAYOUTS[lay] = JSON.parse(JSON.stringify(DEFAULT_KEYS[lay])); saveKeys(); game.msg = { text: 'Comandi ripristinati', t: 2 }; } });
      ks.push({ label: 'Indietro', act: function () { game.state = 'options'; game.menuIdx = 0; } });
      return ks;
    }
    if (game.state === 'result') return game.run && game.run.arcade ? [
      { label: 'Di nuovo', act: function () { startArcade(); } },
      { label: 'Arcade', act: function () { game.state = 'arcade'; game.menuIdx = 0; } },
      { label: 'Menu principale', act: function () { game.state = 'menu'; game.menuIdx = 0; } }] : [{ label: 'Menu principale', act: function () { game.state = 'menu'; game.menuIdx = 0; } }];
    return [];
  }

  var MODES = [{ id: 'solo', label: '1 giocatore' }, { id: 'cpu', label: '1 giocatore + compagno CPU' }, { id: 'duo2', label: '2 giocatori, stessa tastiera / due controller' }];
  var DIFFS = ['facile', 'normale', 'difficile'];

  function onKey(code) {
    W.Audio.unlock();
    // assegnazione di un tasto: il prossimo tasto premuto (tranne Esc) diventa quello dell'azione
    if (game.state === 'keys' && game.binding) {
      if (code !== 'Escape') { bindKey(game.keyLayout, game.binding, code); game.msg = { text: ACTION_NAMES[game.binding] + ': ' + keyLabel(code), t: 1.6 }; }
      game.binding = null; W.Audio.ui(); return;
    }
    var up = code === 'ArrowUp' || code === 'KeyW', down = code === 'ArrowDown' || code === 'KeyS';
    var left = code === 'ArrowLeft' || code === 'KeyA', right = code === 'ArrowRight' || code === 'KeyD';
    var ok = code === 'Enter' || code === 'NumpadEnter' || code === 'KeyJ' || code === 'Space' || code === 'KeyF';
    var back = code === 'Escape' || code === 'Backspace';
    if (code === 'F3' && game.world) { game.world.debug = !game.world.debug; return; }
    if (game.state === 'title') { if (ok) { game.state = 'menu'; game.menuIdx = 0; W.Audio.ui(); } return; }
    if (game.state === 'play') {
      var sc = game.world.area && game.world.area.scene;
      if (sc) {
        if (ok || code === 'KeyE' || code === 'KeyR' || code === 'Numpad3' || code === 'Numpad1') sc.input('confirm');
        else if (up || code === 'ArrowUp') sc.input('up');
        else if (down || code === 'ArrowDown') sc.input('down');
      }
      if (back) { game.state = 'pause'; game.menuIdx = 0; }
      return;
    }
    if (game.state === 'howto') { if (ok || back) game.state = 'menu'; return; }
    if (game.state === 'gameover' && game.gameoverT < 1.2) return;
    if (game.state === 'comic') { if (ok && game.comic && game.comic.t > 0.4) game.comic.t = 9; return; }
    if (game.state === 'credits') { if (ok || back) { game.state = 'result'; game.menuIdx = 0; } return; }
    if (game.state === 'select') { selectKey(up, down, left, right, ok, back); return; }
    if (game.state === 'party') { partyKey(up, down, left, right, ok); return; }
    var items = menuItems(); if (!items.length) return;
    if (up) { game.menuIdx = (game.menuIdx + items.length - 1) % items.length; W.Audio.ui(); }
    if (down) { game.menuIdx = (game.menuIdx + 1) % items.length; W.Audio.ui(); }
    var cur = items[Math.min(game.menuIdx, items.length - 1)];
    if ((left || right) && cur.adj) { cur.adj(left ? -1 : 1); W.Audio.ui(); }
    if (ok) { if (cur.act) { var prev = game.state; cur.act(); if (game.state !== prev) game.menuIdx = 0; } else if (cur.adj) cur.adj(1); W.Audio.ui(); }
    if (back) { if (game.state === 'pause') game.state = 'play'; else if (game.state === 'keys') { game.state = 'options'; game.menuIdx = 0; } else if (game.state === 'options' || game.state === 'chapters' || game.state === 'arcade') { game.state = 'menu'; game.menuIdx = 0; } }
  }

  function selectKey(up, down, left, right, ok, back) {
    var s = game.sel;
    if (back) { if (s.step === 0) { game.state = 'menu'; game.menuIdx = 0; } else s.step--; return; }
    if (s.step === 0) {
      var mi = MODES.findIndex(function (m) { return m.id === s.mode; });
      if (up) mi = (mi + 2) % 3; if (down) mi = (mi + 1) % 3; s.mode = MODES[mi].id;
      if (ok) s.step = 1;
    } else {
      var di = DIFFS.indexOf(s.difficulty);
      if (up || left) di = Math.max(0, di - 1); if (down || right) di = Math.min(2, di + 1); s.difficulty = DIFFS[di];
      if (ok) {
        var sv = loadSave();
        newRun(s, null, s.start || 0);
      }
    }
    W.Audio.ui();
  }
  function partyKey(up, down, left, right, ok) {
    var pt = game.party, pk = pt.picks[pt.i], n = pk.opts.length;
    if (left || up) pt.cursor = (pt.cursor + n - 1) % n;
    if (right || down) pt.cursor = (pt.cursor + 1) % n;
    if (ok) {
      game.run.chars[pk.slot] = pk.opts[pt.cursor];
      pt.i++;
      if (pt.i < pt.picks.length) {
        var nx = pt.picks[pt.i]; nx.opts = nx.opts.filter(function (id) { return game.run.chars.slice(0, nx.slot).indexOf(id) < 0; }); pt.cursor = 0;
        if (nx.opts.length < 2) { if (nx.opts[0]) game.run.chars[nx.slot] = nx.opts[0]; pt.i++; }
      }
      if (pt.i >= pt.picks.length) { game.party = null; startArea(); }
    }
    W.Audio.ui();
  }

  function txt(s, x, y, size, col, align, weight) { ctx.font = (weight || 600) + ' ' + size + 'px "Oswald", sans-serif'; ctx.fillStyle = col || R.COL.ink; ctx.textAlign = align || 'center'; ctx.fillText(s, x, y); }
  // copertina del menu fornita dall'autore (assets/menu/cover.jpg)
  var cover = new Image(); cover.ok = false;
  cover.onload = function () { cover.ok = true; };
  cover.src = (W.ASSET_DATA && W.ASSET_DATA['menu/cover.jpg']) || 'assets/menu/cover.jpg';
  function drawCover(x, alpha, zoom) {
    if (!cover.ok) return false;
    var h = C.VIEW_H * zoom, w = cover.width * h / cover.height;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.drawImage(cover, x - (w - C.VIEW_H * cover.width / cover.height) / 2, (C.VIEW_H - h) / 2, w, h);
    ctx.restore(); return true;
  }
  function backdrop(strength) {
    ctx.fillStyle = '#07060a'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    // copertina a destra, sfumata nel nero verso i testi
    var cw = C.VIEW_H * (cover.width || 800) / (cover.height || 803), cx = C.VIEW_W - cw;
    if (drawCover(cx, strength === undefined ? 0.28 : strength, 1)) {
      var g = ctx.createLinearGradient(cx, 0, cx + 260, 0); g.addColorStop(0, '#07060a'); g.addColorStop(1, 'rgba(7,6,10,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - 1, 0, 262, C.VIEW_H);
    }
  }
  function drawList(items, x, y, align) {
    for (var i = 0; i < items.length; i++) {
      var sel = i === game.menuIdx, it = items[i], left = align === 'left';
      if (sel) { ctx.fillStyle = 'rgba(214,40,40,0.22)'; ctx.fillRect(left ? x - 18 : x - 260, y + i * 52 - 32, left ? 470 : 520, 46); ctx.fillStyle = '#d62828'; if (left) ctx.fillRect(x - 18, y + i * 52 - 32, 5, 46); }
      txt((sel && !left ? '▶  ' : '') + it.label + (it.val ? ':  ' + it.val() : ''), x, y + i * 52, 26, sel ? '#ffffff' : R.COL.ink, align || 'center', sel ? 600 : 500);
    }
  }
  function drawTitle() {
    ctx.fillStyle = '#07060a'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    var t = performance.now() / 1000, cw = C.VIEW_H * (cover.width || 800) / (cover.height || 803);
    if (drawCover((C.VIEW_W - cw) / 2, 1, 1.02 + Math.sin(t * 0.2) * 0.01)) {
      var x0 = (C.VIEW_W - cw) / 2;
      var gl = ctx.createLinearGradient(x0, 0, x0 + 160, 0); gl.addColorStop(0, '#07060a'); gl.addColorStop(1, 'rgba(7,6,10,0)');
      ctx.fillStyle = gl; ctx.fillRect(x0 - 2, 0, 162, C.VIEW_H);
      var gr = ctx.createLinearGradient(x0 + cw, 0, x0 + cw - 160, 0); gr.addColorStop(0, '#07060a'); gr.addColorStop(1, 'rgba(7,6,10,0)');
      ctx.fillStyle = gr; ctx.fillRect(x0 + cw - 160, 0, 162, C.VIEW_H);
      ctx.fillStyle = '#07060a'; ctx.fillRect(0, 0, x0, C.VIEW_H); ctx.fillRect(x0 + cw, 0, C.VIEW_W, C.VIEW_H);
      var gb = ctx.createLinearGradient(0, 520, 0, C.VIEW_H); gb.addColorStop(0, 'rgba(7,6,10,0)'); gb.addColorStop(1, 'rgba(7,6,10,0.95)');
      ctx.fillStyle = gb; ctx.fillRect(0, 520, C.VIEW_W, 200);
    } else txt('THE WARRIORS', C.VIEW_W / 2, 250, 96, '#d62828', 'center', 700);
    txt('NIGHT RUN', C.VIEW_W / 2, 628, 40, '#ffffff', 'center', 700);
    if (Math.floor(performance.now() / 600) % 2) txt('PREMI INVIO', C.VIEW_W / 2, 676, 22, '#f2c14e', 'center', 600);
    txt('Versione 0.5 · campagna completa', 24, C.VIEW_H - 16, 14, R.COL.dim, 'left', 400);
  }
  function drawSelect() {
    backdrop(); var s = game.sel;
    txt(['MODALITÀ', 'DIFFICOLTÀ'][s.step], C.VIEW_W / 2, 110, 40, R.COL.p1, 'center', 700);
    if (s.start) txt(W.CHAPTERS[W.CAMPAIGN[s.start].ch], C.VIEW_W / 2, 150, 20, R.COL.dim, 'center', 400);
    if (s.step === 0) MODES.forEach(function (m, i) { var on = m.id === s.mode; if (on) { ctx.fillStyle = 'rgba(214,40,40,0.2)'; ctx.fillRect(340, 232 + i * 70, 600, 52); } txt(m.label, C.VIEW_W / 2, 268 + i * 70, 26, on ? '#fff' : R.COL.ink); });
    if (s.step === 0 && s.mode === 'duo2') txt('G1: WASD · F G Spazio Shift R T V      G2: frecce · Num1 Num2 Num0 CtrlDx Num3 Num4 Num5', C.VIEW_W / 2, 520, 16, R.COL.dim, 'center', 400);
    if (s.step === 0 && s.mode === 'cpu') txt('Il compagno CPU è un altro Warrior del gruppo del capitolo', C.VIEW_W / 2, 520, 16, R.COL.dim, 'center', 400);
    if (s.step === 1) DIFFS.forEach(function (d, i) {
      var on = d === s.difficulty, D = W.DIFFICULTY[d]; if (on) { ctx.fillStyle = 'rgba(214,40,40,0.2)'; ctx.fillRect(340, 232 + i * 70, 600, 52); }
      txt(D.name + '  ·  danni nemici ×' + D.edmg + '  ·  salute nemici ×' + D.ehp, C.VIEW_W / 2, 268 + i * 70, 24, on ? '#fff' : R.COL.ink);
    });
    txt('↑ ↓ scegli · Invio conferma · Esc indietro', C.VIEW_W / 2, 620, 18, R.COL.dim, 'center', 400);
  }
  function drawPortrait(id, x, y, scale, on) {
    var P = W.ATLAS_PX, set = P && P.sets[id], im = R.pxImage && R.pxImage(id);
    if (!set || !im || !im.ok) { ctx.fillStyle = '#555'; ctx.fillRect(x - 30, y - 150, 60, 150); return; }
    var fr = set.frames.idle[0];
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = on ? 1 : 0.55;
    ctx.drawImage(im, fr[0], fr[1], fr[2], fr[3], Math.round(x - fr[4] * scale), Math.round(y - fr[5] * scale), fr[2] * scale, fr[3] * scale);
    ctx.restore();
  }
  function drawParty() {
    backdrop(0.18);
    var pt = game.party, pk = pt.picks[pt.i], def = W.CAMPAIGN[game.run.areaIdx];
    txt(W.CHAPTERS[def.ch], C.VIEW_W / 2, 84, 22, R.COL.dim, 'center', 500);
    txt(pk.slot === 0 ? 'SCEGLI IL TUO WARRIOR' : 'GIOCATORE 2: SCEGLI IL WARRIOR', C.VIEW_W / 2, 130, 40, '#fff', 'center', 700);
    var n = pk.opts.length, cw = Math.min(150, 1100 / n), x0 = C.VIEW_W / 2 - (n * cw) / 2;
    pk.opts.forEach(function (id, i) {
      var c = W.rosterById(id), on = i === pt.cursor, x = x0 + i * cw + cw / 2;
      if (on) { ctx.fillStyle = 'rgba(214,40,40,0.22)'; ctx.fillRect(x - cw / 2 + 6, 170, cw - 12, 380); ctx.fillStyle = '#d62828'; ctx.fillRect(x - cw / 2 + 6, 546, cw - 12, 4); }
      drawPortrait(id, x, 470, 2.4, on);
      txt(c.name.toUpperCase(), x, 500, 22, on ? '#fff' : R.COL.ink, 'center', 700);
      var stats = 'POT ' + c.p + ' · VEL ' + c.s + ' · RES ' + c.r + ' · PRE ' + c.g; txt(stats, x, 530, 13, R.COL.dim, 'center', 400);
    });
    txt('← → scegli · Invio conferma', C.VIEW_W / 2, 640, 18, R.COL.dim, 'center', 400);
  }
  function drawHowto() {
    backdrop(); txt('COME SI GIOCA', C.VIEW_W / 2, 90, 40, R.COL.p1, 'center', 700);
    var L = W.Input.LAYOUTS.solo, k = function (x) { return keyLabel(L[x][0]); };
    var rows = [['Movimento · doppio tocco = corsa', k('up') + k('left') + k('down') + k('right')], ['Leggero (3 colpi in catena se vanno a segno)', k('light')], ['Pesante · apre la guardia, disarma sulla ripresa', k('heavy')], ['Salto · supera le transenne basse · leggero in discesa = calcio volante', k('jump')], ['Schivata · invulnerabile a metà', k('dodge')], ['Interazione · parla, raccogli, apri, presa, soccorso', k('interact')], ['In presa: leggero colpisce (max 2) · direzione+interazione lancia', k('interact') + ' / ' + k('light')], ['Furia a barra piena', k('fury')], ['Lancia l\'arma impugnata', k('throw')], ['Dialoghi: avanti', 'Invio'], ['Pausa · salta scena · comandi in Opzioni', 'Esc']];
    rows.forEach(function (r, i) { txt(r[0], 250, 160 + i * 42, 21, R.COL.ink, 'left', 400); txt(r[1], 1030, 160 + i * 42, 21, R.COL.p1, 'right', 600); });
    txt('Controller: X leggero · Y pesante · A salto · RB schivata · B interazione · LB furia · RT lancio · Start pausa', C.VIEW_W / 2, 650, 17, R.COL.dim, 'center', 400);
    txt('Invio per tornare', C.VIEW_W / 2, 690, 17, R.COL.dim, 'center', 400);
  }
  var CREDITS = ['THE WARRIORS · NIGHT RUN', '', 'Progetto e storia', 'Giuseppe (b3pz)', '', 'Grafica approvata', 'Raccolta grafica 04', '', 'Motore, livelli e scene', 'Claude', '', 'Dal ritrovo di Coney Island', 'al ritorno all\'alba', '', 'Grazie per aver giocato'];
  function drawCredits(dt) {
    ctx.fillStyle = '#05050a'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    game.credits += dt * 40;
    CREDITS.forEach(function (l, i) { var y = C.VIEW_H + 40 + i * 48 - game.credits; if (y > -40 && y < C.VIEW_H + 40) txt(l, C.VIEW_W / 2, y, i === 0 ? 44 : 26, i === 0 ? '#d62828' : (l === l.toUpperCase() ? '#fff' : R.COL.ink), 'center', i === 0 ? 700 : 500); });
    if (game.credits > CREDITS.length * 48 + C.VIEW_H + 80) { game.state = 'result'; game.menuIdx = 0; }
    txt('Invio per saltare', C.VIEW_W - 30, C.VIEW_H - 20, 14, R.COL.dim, 'right', 400);
  }
  function drawArcade() {
    backdrop(0.35); var A = arcState();
    txt('ARCADE', 82, 104, 48, '#fff', 'left', 700); ctx.fillStyle = '#d62828'; ctx.fillRect(84, 122, 60, 5);
    txt('Le risse della storia, senza scene. Fino a quattro giocatori.', 82, 156, 17, R.COL.dim, 'left', 400);
    drawList(menuItems(), 100, 220, 'left');
    var cols = [R.COL.p1, R.COL.p2, R.COL.p3, R.COL.p4];
    A.slots.forEach(function (sl, i) {
      var x = 800 + (i % 2) * 220, y = 330 + Math.floor(i / 2) * 250;
      ctx.fillStyle = 'rgba(8,10,16,0.6)'; ctx.fillRect(x - 95, y - 210, 190, 236);
      ctx.fillStyle = cols[i]; ctx.fillRect(x - 95, y - 210, 190, 4);
      txt('G' + (i + 1), x - 82, y - 184, 18, cols[i], 'left', 700);
      if (sl.dev === 'off') { txt('libero', x, y - 80, 18, R.COL.dim, 'center', 400); return; }
      drawPortrait(sl.ch, x, y - 6, 1.25, true);
      txt(W.rosterById(sl.ch).name.toUpperCase(), x, y + 18, 16, '#fff', 'center', 600);
    });
    txt('← → comando · Invio cambia Warrior · Esc indietro', 82, C.VIEW_H - 30, 15, R.COL.dim, 'left', 400);
  }
  function drawResult() {
    backdrop(); var r = game.result;
    txt(r.title || 'LA NOTTE È FINITA', C.VIEW_W / 2, 110, 46, '#d62828', 'center', 700);
    var rows = [['Tempo di gioco', fmt(r.time)], ['Danni subiti', Math.round(r.damageTaken)], ['Combo massima', r.maxCombo], ['Nemici a terra', r.kos], ['Riprove', r.retries], ['Assistenza', r.assisted ? 'sì' : 'no'], ['Punteggio', r.score]];
    rows.forEach(function (q, i) { txt(q[0], 330, 200 + i * 46, 24, R.COL.ink, 'left', 400); txt(String(q[1]), 750, 200 + i * 46, 24, R.COL.ink, 'right', 600); });
    drawList(menuItems(), C.VIEW_W / 2, 600);
  }
  function fmt(s) { var m = Math.floor(s / 60), x = Math.floor(s % 60); return m + ':' + (x < 10 ? '0' : '') + x; }
  // game over: la notte finisce qui, lo annuncia la radio
  var GO_LINES = ['Notizia dell\'ultima ora per chi è ancora sveglio.', 'I Warriors non torneranno a casa, stanotte.', 'La città ha vinto. Musica.'];
  function drawGameOver(dt) {
    game.gameoverT = (game.gameoverT || 0) + dt;
    var t = game.gameoverT, a = Math.min(1, t / 1.2);
    ctx.fillStyle = 'rgba(4,2,4,' + (0.6 + 0.35 * a) + ')'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    ctx.save(); ctx.globalAlpha = a;
    txt('GAME OVER', C.VIEW_W / 2, 220, 92, '#d62828', 'center', 700);
    var n = Math.min(GO_LINES.length, Math.floor(t / 1.1) + 1);
    for (var i = 0; i < n; i++) txt((i === 0 ? 'LA DJ · ' : '') + GO_LINES[i], C.VIEW_W / 2, 290 + i * 34, 22, i === 0 ? R.COL.p1 : R.COL.ink, 'center', 500);
    ctx.restore();
    if (t > 1.2) drawList(menuItems(), C.VIEW_W / 2, 470);
  }
  function overlay(title, items, sub) {
    ctx.fillStyle = 'rgba(4,5,10,0.78)'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    txt(title, C.VIEW_W / 2, 220, 56, '#d62828', 'center', 700);
    if (sub) txt(sub, C.VIEW_W / 2, 268, 18, R.COL.dim, 'center', 400);
    drawList(items, C.VIEW_W / 2, 340);
  }

  // ------------------------------------------------------------------ ciclo
  var last = 0, acc = 0, simTime = 0;
  function loop(ts) {
    requestAnimationFrame(loop);
    var dt = Math.min(C.MAX_ACCUM, (ts - last) / 1000 || 0); last = ts;
    tick(dt);
  }
  function tick(dt) {
    pollMenuPad();
    if (game.state !== 'play' || (game.world && game.world.area && game.world.area.scene && game.world.area.scene.choice)) W.Touch.navTick(simTime, onKey);
    if (game.state === 'play') {
      acc += dt;
      while (acc >= C.STEP) { simTime += C.STEP; W.Input.setTime(simTime); stepPlay(C.STEP); acc -= C.STEP; if (game.state !== 'play') { acc = 0; break; } }
    } else { acc = 0; simTime += dt; W.Input.setTime(simTime); }
    if (!W.QA_NODRAW) draw(dt);   // i test possono saltare il disegno (canvas lento senza GPU)
    if (game.msg) { game.msg.t -= dt; if (game.msg.t <= 0) game.msg = null; }
  }
  function stepPlay(dt) {
    var w = game.world;
    for (var i = 0; i < w.players.length; i++) { var d = w.players[i].device; if (d) { d.poll(); if (d.edge.pause) { game.state = 'pause'; game.menuIdx = 0; return; } } }
    w.step(dt);
    W.Audio.consume(w.events);
    mixFor(w);
    if (w.failed) {
      w.failReasonShown = w.failReason || null; w.failReason = null; game.fails++; w.failed = false; game.menuIdx = 0;
      game.run.triesLeft = (game.run.triesLeft || 1) - 1;
      game.state = game.run.triesLeft <= 0 ? 'gameover' : 'fail'; game.gameoverT = 0;
      if (game.state === 'gameover' && game.run.chapterSave) {
        var cs = JSON.parse(game.run.chapterSave), run0 = game.run;
        writeSave({ version: 2, area: W.CAMPAIGN[cs.areaIdx].id, mode: run0.mode, difficulty: run0.difficulty, chars: cs.chars, cpuChar: cs.cpuChar, roster: cs.roster, records: cs.records,
          score: cs.score, retries: w.stats.retries, assisted: w.stats.assisted, time: cs.stats.time, kos: cs.stats.kos, flags: cs.flags });
      }
      return;
    }
    if (w.area.done) areaFinished();
  }
  // musica e ambiente secondo l'area: fuga = pulsazione, rissa = basso e cassa, attraversamento = bordone, alba = luce
  var AMB_BY_BG = { park: 'park', park_b: 'park', metro: 'subway', metro_b: 'subway', interior: 'interior', alley: 'city', street: 'city', street_b: 'city', harbor: 'city', coney: 'city', coney_b: 'city', boardwalk: 'beach' };
  function mixFor(w) {
    var a = w.area; if (!a) return;
    var def = a.def, m;
    if (a.scene) m = a.scene.def.mood || def.mood || (def.kind === 'epilogue' ? 'dawn' : 'tension');
    else if (a.fighting) m = 'fight';
    else if (a.timer !== null || a.pursuerType) m = def.mood === 'silence' ? 'silence' : 'chase';
    else m = def.mood || (def.kind === 'training' ? 'silence' : 'tension');
    W.Audio.setMood(m);
    W.Audio.setAmbience(def.amb || AMB_BY_BG[def.bg] || 'city');
    W.Audio.radio(!!(a.scene && a.scene.def.radio));
    // tracce originali (js/musiche.js): scena → area:situazione → area → capitolo → situazione
    var sit = a.scene ? (a.scene.def.radio ? 'radio' : 'scene') : m === 'fight' || m === 'chase' || m === 'dawn' || m === 'silence' ? m : 'explore';
    if (W.Music) W.Music.update({ scene: a.scene ? a.scene.def.cine || null : null, area: def.id, sit: sit, screen: null });
  }
  var padPrev = {};
  function pollMenuPad() {
    if (!navigator.getGamepads) return;
    var gp = navigator.getGamepads()[0]; if (!gp) return;
    var playing = game.state === 'play';
    var map = playing ? { 0: 'Enter', 12: 'ArrowUp', 13: 'ArrowDown' } : { 12: 'ArrowUp', 13: 'ArrowDown', 14: 'ArrowLeft', 15: 'ArrowRight', 0: 'Enter', 1: 'Escape', 9: 'Escape' };
    if (playing && !(game.world.area && game.world.area.scene)) { padPrev = {}; return; }
    for (var b in map) { var p = gp.buttons[b] && gp.buttons[b].pressed; if (p && !padPrev[b]) onKey(map[b]); padPrev[b] = p; }
  }
  function draw(dt) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (['title', 'menu', 'select', 'chapters', 'howto', 'options', 'keys', 'arcade'].indexOf(game.state) >= 0) { W.Audio.setMood('tension'); W.Audio.setAmbience('city'); W.Audio.radio(false); if (W.Music) W.Music.update({ screen: 'menu' }); }
    if (game.state === 'gameover') { W.Audio.setMood('radio'); W.Audio.radio(true); if (W.Music) W.Music.update({ screen: 'gameover' }); }
    if (game.state === 'credits' || game.state === 'result') { W.Audio.setMood('dawn'); W.Audio.setAmbience('beach'); W.Audio.radio(false); if (W.Music) W.Music.update({ screen: 'credits' }); }
    if (game.state === 'title') drawTitle();
    else if (game.state === 'menu') {
      backdrop(1);
      txt('NIGHT RUN', 80, 200, 56, '#ffffff', 'left', 700);
      ctx.fillStyle = '#d62828'; ctx.fillRect(82, 226, 72, 5);
      drawList(menuItems(), 82, 320, 'left');
      txt('↑ ↓ scegli · Invio conferma', 82, C.VIEW_H - 40, 15, R.COL.dim, 'left', 400);
    }
    else if (game.state === 'arcade') drawArcade();
    else if (game.state === 'chapters') { backdrop(0.5); txt('CAPITOLI', 82, 140, 44, '#fff', 'left', 700); drawList(menuItems(), 82, 220, 'left'); }
    else if (game.state === 'select') drawSelect();
    else if (game.state === 'party') drawParty();
    else if (game.state === 'howto') drawHowto();
    else if (game.state === 'credits') drawCredits(dt);
    else if (game.state === 'keys') {
      backdrop(0.3); txt('COMANDI · ' + LAYOUT_NAMES[game.keyLayout].toUpperCase(), 82, 90, 36, '#fff', 'left', 700);
      var its = menuItems();
      for (var ki = 0; ki < its.length; ki++) {
        var sel = ki === game.menuIdx, y = 140 + ki * 40;
        if (sel) { ctx.fillStyle = 'rgba(214,40,40,0.22)'; ctx.fillRect(64, y - 28, 760, 38); ctx.fillStyle = '#d62828'; ctx.fillRect(64, y - 28, 5, 38); }
        txt(its[ki].label, 82, y, 21, sel ? '#fff' : R.COL.ink, 'left', sel ? 600 : 500);
        if (its[ki].val) txt(its[ki].val(), 800, y, 21, game.binding && sel ? '#f2d23c' : R.COL.p1, 'right', 600);
      }
      txt('Invio: cambia il tasto · Esc: indietro · se il tasto è già usato, le due azioni si scambiano', 82, C.VIEW_H - 24, 15, R.COL.dim, 'left', 400);
    }
    else if (game.state === 'options') { backdrop(); txt('OPZIONI', C.VIEW_W / 2, 140, 44, R.COL.p1, 'center', 700); drawList(menuItems(), C.VIEW_W / 2, 220); txt('← → regola · Invio apre', C.VIEW_W / 2, 696, 16, R.COL.dim, 'center', 400); }
    else if (game.state === 'result') drawResult();
    else if (game.state === 'comic') drawComic(dt);
    else if (game.world) {
      R.frame(game.world, game.state === 'play' ? dt : 0, ui);
      if (game.state === 'pause') overlay('PAUSA', menuItems());
      if (game.state === 'fail') {
        var left = game.run.triesLeft, tl = left === 1 ? 'Ultimo tentativo per questo capitolo' : 'Tentativi rimasti in questo capitolo: ' + left;
        overlay('A TERRA', menuItems(), (game.world.failReasonShown ? game.world.failReasonShown + ' · ' : '') + tl + (game.fails >= 2 ? ' · puoi riprovare con salute piena' : ''));
      }
      if (game.state === 'gameover') drawGameOver(dt);
    }
    W.Touch.draw(ctx, game.state === 'play' && !(game.world && game.world.area && game.world.area.scene), window.innerHeight > window.innerWidth);
    if (game.msg) { ctx.fillStyle = 'rgba(8,10,16,0.88)'; ctx.fillRect(C.VIEW_W / 2 - 330, 640, 660, 40); txt(game.msg.text, C.VIEW_W / 2, 667, 18, R.COL.ink, 'center', 400); }
  }

  function fit() {
    var s = Math.min(window.innerWidth / C.VIEW_W, window.innerHeight / C.VIEW_H);
    cv.style.width = Math.floor(C.VIEW_W * s) + 'px'; cv.style.height = Math.floor(C.VIEW_H * s) + 'px';
  }

  function boot() {
    cv = document.getElementById('game'); cv.width = C.VIEW_W; cv.height = C.VIEW_H; ctx = cv.getContext('2d');
    R.init(cv); loadKeys(); loadOptions(); fit();
    window.addEventListener('resize', fit);
    W.Input.onKey(onKey);
    W.Touch.attach(cv);
    // tasti touch fuori dal gioco e nelle scene: OK = Invio, AZIONE = indietro, pausa = Esc
    W.Touch.onButton = function (a) {
      var sceneOn = game.state === 'play' && game.world && game.world.area && game.world.area.scene;
      if (a === 'pause') { onKey('Escape'); return; }
      if (game.state !== 'play' || sceneOn) { if (a === 'light') onKey('Enter'); else if (a === 'interact' && game.state !== 'play') onKey('Escape'); else if (a === 'interact' && sceneOn) onKey('Enter'); }
    };
    cv.addEventListener('pointerdown', function () { W.Audio.unlock(); if (game.state === 'title') onKey('Enter'); });
    // pausa su perdita di visibilità: danni e timer fermi
    document.addEventListener('visibilitychange', function () { if (document.hidden) { if (game.state === 'play') { game.state = 'pause'; game.menuIdx = 0; } W.Audio.suspend(); } });
    window.addEventListener('gamepaddisconnected', function () { if (game.state === 'play') { game.state = 'pause'; game.menuIdx = 0; game.msg = { text: 'Controller scollegato', t: 3 }; } });
    requestAnimationFrame(loop);
  }
  W.Game = { boot: boot, game: game, tick: tick, newRun: newRun, onKey: onKey, comic: function (id) { startComic(W.CAMPAIGN[W.areaIndex(id)], function () { game.state = 'play'; }); }, startAt: function (idx, mode) { newRun({ mode: mode || 'cpu', difficulty: 'normale' }, null, idx); } };
  window.addEventListener('load', boot);
})();
