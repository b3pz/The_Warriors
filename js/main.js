// Flusso: titolo → menu → selezione → area → risultato. Ciclo a passo fisso 60 Hz con rendering separato.
'use strict';
var W = window.W;

(function () {
  var C = W.CFG, cv, ctx, R = W.Render;
  var game = { state: 'title', world: null, sel: null, menuIdx: 0, fails: 0, snap: null, areaIdx: 0, result: null, msg: null };
  var options = { shake: true, flash: true, sfx: 0.8, music: 0.5 };
  var SAVE_KEY = 'warriors-story-v1', OPT_KEY = 'warriors-options-v1';
  var C4_GROUP = ['swan', 'ajax', 'snow', 'cowboy'];
  var menuDev;

  // ------------------------------------------------------------------ salvataggi (scrittura validata, backup)
  function storage() { try { var k = '__w'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; } catch (e) { return null; } }
  function loadSave() {
    var s = storage(); if (!s) return null;
    try {
      var d = JSON.parse(s.getItem(SAVE_KEY));
      if (d && d.version === 1 && W.AREAS[d.checkpoint]) return d;
      var b = JSON.parse(s.getItem(SAVE_KEY + '-backup'));
      if (b && b.version === 1 && W.AREAS[b.checkpoint]) return b;
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
  function loadOptions() { var s = storage(); if (!s) return; try { var o = JSON.parse(s.getItem(OPT_KEY)); if (o) for (var k in options) if (k in o) options[k] = o[k]; } catch (e) {} applyOptions(); }
  function saveOptions() { var s = storage(); if (s) try { s.setItem(OPT_KEY, JSON.stringify(options)); } catch (e) {} applyOptions(); }
  function applyOptions() { R.opts.shake = options.shake; R.opts.flash = options.flash; W.Audio.setVol('sfx', options.sfx); W.Audio.setVol('music', options.music); }

  // ------------------------------------------------------------------ etichette tasti
  var KEYNAME = { Space: 'Spazio', ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlRight: 'Ctrl dx', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
  function keyLabel(code) { if (KEYNAME[code]) return KEYNAME[code]; if (code.indexOf('Key') === 0) return code.slice(3); if (code.indexOf('Numpad') === 0) return 'Num' + code.slice(6); return code; }
  var ui = {
    keyFor: function (p, a) { var d = p.device; if (!d || !d.layout) return 'B'; return keyLabel(W.Input.LAYOUTS[d.layout][a][0]); },
    tutorialText: function (t) {
      var p = game.world.players[0], lay = p.device && p.device.layout ? W.Input.LAYOUTS[p.device.layout] : W.Input.LAYOUTS.solo;
      return t.replace(/\{(\w+)\}/g, function (_, a) {
        if (a === 'move') return lay.up[0] === 'KeyW' ? 'WASD' : 'frecce';
        return keyLabel(lay[a][0]);
      });
    }
  };

  // ------------------------------------------------------------------ partita
  function newRun(sel, fromSave) {
    var devs = [];
    if (sel.mode === 'duo2') devs = [new W.Input.Device('p1', 0), new W.Input.Device('p2', 1)];
    else devs = [new W.Input.Device('solo', 0)];
    var players = [{ id: sel.chars[0], device: devs[0] }];
    if (sel.mode === 'duo2') players.push({ id: sel.chars[1], device: devs[1] });
    var w = new W.World({ players: players, cpu: sel.mode === 'cpu' ? sel.chars[1] : null, difficulty: sel.difficulty, seed: 1979 });
    game.world = w; game.sel = sel; game.fails = 0; game.assist = false;
    game.areaIdx = fromSave ? Math.max(0, W.AREA_ORDER.indexOf(fromSave.checkpoint)) : 0;
    if (fromSave) { w.score = fromSave.score.slice(); w.stats.retries = fromSave.retries || 0; w.stats.assisted = !!fromSave.assisted; w.stats.time = fromSave.time || 0; }
    startArea();
  }
  function startArea() {
    var w = game.world, id = W.AREA_ORDER[game.areaIdx];
    w.area = new W.AreaRun(W.AREAS[id], w);
    w.enemies = []; w.projectiles = []; w.attackers = 0; w.failed = false;
    for (var i = 0; i < w.players.length; i++) { var p = w.players[i]; p.out = false; if (p.state === 'ko') { p.hp = Math.round(p.maxhp * 0.5); } p.setState('idle'); p.att = null; p.grabbed = null; }
    game.snap = w.snapshot(); game.fails = 0;
    writeSave({ version: 1, chapter: 'C4', checkpoint: id, mode: game.sel.mode, chars: game.sel.chars, difficulty: game.sel.difficulty, score: w.score.slice(), retries: w.stats.retries, assisted: w.stats.assisted, time: w.stats.time, flags: w.flags });
    R.reset(); game.state = 'play';
  }
  function retry(assist) {
    var w = game.world; w.stats.retries++;
    if (assist) { w.stats.assisted = true; }
    var id = W.AREA_ORDER[game.areaIdx];
    w.restore(game.snap, assist);
    w.area = new W.AreaRun(W.AREAS[id], w);
    R.reset(); game.state = 'play';
  }

  // ------------------------------------------------------------------ menu
  function menuItems() {
    if (game.state === 'menu') {
      var it = [];
      var sv = loadSave();
      if (sv) it.push({ label: 'Continua · ' + sv.checkpoint, act: function () { newRun({ mode: sv.mode, chars: sv.chars, difficulty: sv.difficulty }, sv); } });
      it.push({ label: 'Prova C4 · Baseball Furies', act: function () { game.state = 'select'; game.sel = { step: 0, mode: 'solo', difficulty: 'normale', chars: ['swan', 'snow'], cursor: 0 }; } });
      it.push({ label: 'Come si gioca', act: function () { game.state = 'howto'; } });
      it.push({ label: 'Opzioni', act: function () { game.state = 'options'; game.menuIdx = 0; } });
      return it;
    }
    if (game.state === 'pause') return [
      { label: 'Riprendi', act: function () { game.state = 'play'; W.Audio.resume(); } },
      { label: 'Ricomincia dal checkpoint', act: function () { retry(false); } },
      { label: (game.world.debug ? 'Nascondi' : 'Mostra') + ' debug (F3)', act: function () { game.world.debug = !game.world.debug; } },
      { label: 'Grafica: tavole / manichini', act: function () { R.toggleSprites(); } },
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
      { label: 'Ambiente', val: function () { return Math.round(options.music * 10); }, adj: function (d) { options.music = Math.max(0, Math.min(1, options.music + d * 0.1)); saveOptions(); } },
      { label: 'Scossa schermo', val: function () { return options.shake ? 'sì' : 'no'; }, adj: function () { options.shake = !options.shake; saveOptions(); } },
      { label: 'Lampi', val: function () { return options.flash ? 'sì' : 'no'; }, adj: function () { options.flash = !options.flash; saveOptions(); } },
      { label: 'Indietro', act: function () { game.state = 'menu'; game.menuIdx = 0; } }
    ];
    if (game.state === 'result') return [{ label: 'Menu principale', act: function () { game.state = 'menu'; game.menuIdx = 0; } }];
    return [];
  }

  var MODES = [{ id: 'solo', label: '1 giocatore' }, { id: 'cpu', label: '1 giocatore + compagno CPU' }, { id: 'duo2', label: '2 giocatori, stessa tastiera / due controller' }];
  var DIFFS = ['facile', 'normale', 'difficile'];

  function onKey(code) {
    W.Audio.unlock();
    var up = code === 'ArrowUp' || code === 'KeyW', down = code === 'ArrowDown' || code === 'KeyS';
    var left = code === 'ArrowLeft' || code === 'KeyA', right = code === 'ArrowRight' || code === 'KeyD';
    var ok = code === 'Enter' || code === 'NumpadEnter' || code === 'KeyJ' || code === 'Space' || code === 'KeyF';
    var back = code === 'Escape' || code === 'Backspace';
    if (code === 'F3' && game.world) { game.world.debug = !game.world.debug; return; }
    if (code === 'KeyG' && game.state === 'pause') { R.toggleSprites(); return; }
    if (game.state === 'title') { if (ok) { game.state = 'menu'; game.menuIdx = 0; W.Audio.ui(); } return; }
    if (game.state === 'play') { if (back) { game.state = 'pause'; game.menuIdx = 0; } return; }
    if (game.state === 'howto') { if (ok || back) game.state = 'menu'; return; }
    if (game.state === 'select') { selectKey(up, down, left, right, ok, back); return; }
    var items = menuItems(); if (!items.length) return;
    if (up) { game.menuIdx = (game.menuIdx + items.length - 1) % items.length; W.Audio.ui(); }
    if (down) { game.menuIdx = (game.menuIdx + 1) % items.length; W.Audio.ui(); }
    var cur = items[Math.min(game.menuIdx, items.length - 1)];
    if ((left || right) && cur.adj) { cur.adj(left ? -1 : 1); W.Audio.ui(); }
    if (ok) { if (cur.act) { var prev = game.state; cur.act(); if (game.state !== prev) game.menuIdx = 0; } else if (cur.adj) cur.adj(1); W.Audio.ui(); }
    if (back) { if (game.state === 'pause') game.state = 'play'; else if (game.state === 'options') game.state = 'menu'; }
  }

  function selectKey(up, down, left, right, ok, back) {
    var s = game.sel;
    if (back) { if (s.step === 0) { game.state = 'menu'; game.menuIdx = 0; } else s.step--; return; }
    if (s.step === 0) {
      var mi = MODES.findIndex(function (m) { return m.id === s.mode; });
      if (up) mi = (mi + 2) % 3; if (down) mi = (mi + 1) % 3; s.mode = MODES[mi].id;
      if (ok) { s.step = 1; }
    } else if (s.step === 1) {
      var di = DIFFS.indexOf(s.difficulty);
      if (up || left) di = Math.max(0, di - 1); if (down || right) di = Math.min(2, di + 1); s.difficulty = DIFFS[di];
      if (ok) { s.step = 2; s.cursor = C4_GROUP.indexOf(s.chars[0]); }
    } else {
      var who = s.step - 2;
      var cur = s.cursor;
      if (left || up) cur = (cur + C4_GROUP.length - 1) % C4_GROUP.length;
      if (right || down) cur = (cur + 1) % C4_GROUP.length;
      s.cursor = cur;
      if (ok) {
        var id = C4_GROUP[cur];
        if (who === 1 && id === s.chars[0]) { game.msg = { text: 'Scegli un Warrior diverso dal giocatore 1', t: 2 }; return; }
        s.chars[who] = id;
        if (who === 0 && s.mode !== 'solo') { s.step = 3; s.cursor = (cur + 1) % C4_GROUP.length; }
        else { if (s.mode === 'solo') s.chars = [s.chars[0]]; newRun(s, null); }
      }
    }
    W.Audio.ui();
  }

  // ------------------------------------------------------------------ disegno schermate
  function txt(s, x, y, size, col, align, weight) { ctx.font = (weight || 600) + ' ' + size + 'px "Oswald", sans-serif'; ctx.fillStyle = col || R.COL.ink; ctx.textAlign = align || 'center'; ctx.fillText(s, x, y); }
  function backdrop() {
    var g = ctx.createLinearGradient(0, 0, 0, C.VIEW_H); g.addColorStop(0, '#06080f'); g.addColorStop(1, '#1b1420');
    ctx.fillStyle = g; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    ctx.strokeStyle = 'rgba(242,193,78,0.08)'; ctx.lineWidth = 1;
    for (var i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(0, 520 + i * 16); ctx.lineTo(C.VIEW_W, 520 + i * 16); ctx.stroke(); }
  }
  function drawList(items, x, y) {
    for (var i = 0; i < items.length; i++) {
      var sel = i === game.menuIdx, it = items[i];
      if (sel) { ctx.fillStyle = 'rgba(242,193,78,0.14)'; ctx.fillRect(x - 260, y + i * 52 - 32, 520, 46); }
      txt((sel ? '▶  ' : '') + it.label + (it.val ? ':  ' + it.val() : ''), x, y + i * 52, 26, sel ? R.COL.p1 : R.COL.ink);
    }
  }
  function drawTitle() {
    backdrop();
    txt('THE WARRIORS', C.VIEW_W / 2, 250, 96, '#e9e4d6', 'center', 700);
    txt('NIGHT RUN', C.VIEW_W / 2, 318, 44, R.COL.p1, 'center', 500);
    txt('Nucleo giocabile 0.4 · prova capitolo C4', C.VIEW_W / 2, 380, 20, R.COL.dim, 'center', 400);
    if (Math.floor(performance.now() / 600) % 2) txt('Premi Invio', C.VIEW_W / 2, 520, 26, R.COL.ink);
    txt('Tavole di prova dell\'autore · audio segnaposto', C.VIEW_W / 2, 690, 15, R.COL.dim, 'center', 400);
  }
  function drawSelect() {
    backdrop(); var s = game.sel;
    var steps = ['MODALITÀ', 'DIFFICOLTÀ', 'GIOCATORE 1', s.mode === 'cpu' ? 'COMPAGNO CPU' : 'GIOCATORE 2'];
    txt(steps[s.step], C.VIEW_W / 2, 110, 40, R.COL.p1, 'center', 700);
    if (s.step === 0) MODES.forEach(function (m, i) { var on = m.id === s.mode; if (on) { ctx.fillStyle = 'rgba(242,193,78,0.14)'; ctx.fillRect(340, 232 + i * 70, 600, 52); } txt(m.label, C.VIEW_W / 2, 268 + i * 70, 26, on ? R.COL.p1 : R.COL.ink); });
    if (s.step === 0 && s.mode === 'duo2') txt('G1: WASD · F G Spazio Shift R T V      G2: frecce · Num1 Num2 Num0 CtrlDx Num3 Num4 Num5', C.VIEW_W / 2, 520, 16, R.COL.dim, 'center', 400);
    if (s.step === 1) DIFFS.forEach(function (d, i) {
      var on = d === s.difficulty, D = W.DIFFICULTY[d]; if (on) { ctx.fillStyle = 'rgba(242,193,78,0.14)'; ctx.fillRect(340, 232 + i * 70, 600, 52); }
      txt(D.name + '  ·  danni nemici ×' + D.edmg + '  ·  salute nemici ×' + D.ehp, C.VIEW_W / 2, 268 + i * 70, 24, on ? R.COL.p1 : R.COL.ink);
    });
    if (s.step >= 2) {
      // nove Warriors: in C4 sono disponibili Swan, Ajax, Snow, Cowboy
      var cw = 128, x0 = C.VIEW_W / 2 - (9 * cw) / 2;
      W.ROSTER.forEach(function (c, i) {
        var avail = C4_GROUP.indexOf(c.id) >= 0, on = avail && C4_GROUP[s.cursor] === c.id, taken = s.step === 3 && s.chars[0] === c.id;
        var x = x0 + i * cw;
        ctx.fillStyle = on ? 'rgba(242,193,78,0.25)' : avail ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)';
        ctx.fillRect(x + 6, 170, cw - 12, 300);
        if (on) { ctx.strokeStyle = s.step === 2 ? R.COL.p1 : R.COL.p2; ctx.lineWidth = 3; ctx.strokeRect(x + 6, 170, cw - 12, 300); }
        // sagoma neutra: ritratto segnaposto
        ctx.fillStyle = avail ? '#b9b2a3' : '#3a3833'; ctx.beginPath(); ctx.arc(x + cw / 2, 232, 28, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(x + cw / 2 - 26, 266, 52, 70);
        txt(c.name.toUpperCase(), x + cw / 2, 372, 20, avail ? (taken ? R.COL.dim : R.COL.ink) : '#55524a');
        var st = [['POT', c.p], ['VEL', c.s], ['RES', c.r], ['PRE', c.g]];
        st.forEach(function (q, k) { txt(q[0], x + 22, 400 + k * 17, 12, avail ? R.COL.dim : '#444', 'left', 400); for (var b = 0; b < 5; b++) { ctx.fillStyle = b < q[1] ? (avail ? R.COL.p1 : '#444') : '#2a2a2a'; ctx.fillRect(x + 54 + b * 11, 391 + k * 17, 9, 9); } });
        if (!avail) txt('non in C4', x + cw / 2, 490, 13, '#55524a', 'center', 400);
        if (taken) txt('G1', x + cw / 2, 490, 14, R.COL.p1, 'center', 600);
      });
      txt('← → scegli · Invio conferma · Esc indietro', C.VIEW_W / 2, 560, 18, R.COL.dim, 'center', 400);
    } else txt('↑ ↓ scegli · Invio conferma · Esc indietro', C.VIEW_W / 2, 620, 18, R.COL.dim, 'center', 400);
  }
  function drawHowto() {
    backdrop(); txt('COME SI GIOCA', C.VIEW_W / 2, 90, 40, R.COL.p1, 'center', 700);
    var rows = [['Movimento', 'WASD / frecce · doppio tocco = corsa'], ['Leggero (3 colpi in catena se vanno a segno)', 'J'], ['Pesante · apre la guardia, disarma sulla ripresa', 'K'], ['Salto · leggero in discesa = calcio volante', 'Spazio'], ['Schivata · invulnerabile a metà', 'Shift'], ['Interazione · raccogli, apri, presa, soccorso (tieni premuto)', 'E'], ['In presa: leggero colpisce (max 2) · direzione+E lancia', 'E / J'], ['Furia a barra piena', 'L'], ['Lancia l\'arma impugnata', 'Q'], ['Pausa', 'Esc'], ['Debug collisioni', 'F3']];
    rows.forEach(function (r, i) { txt(r[0], 250, 160 + i * 42, 21, R.COL.ink, 'left', 400); txt(r[1], 1030, 160 + i * 42, 21, R.COL.p1, 'right', 600); });
    txt('Controller: X leggero · Y pesante · A salto · RB schivata · B interazione · LB furia · RT lancio · Start pausa', C.VIEW_W / 2, 650, 17, R.COL.dim, 'center', 400);
    txt('Invio per tornare', C.VIEW_W / 2, 690, 17, R.COL.dim, 'center', 400);
  }
  function drawResult() {
    backdrop(); var r = game.result;
    txt('C4 · PROVA COMPLETATA', C.VIEW_W / 2, 110, 46, R.COL.p1, 'center', 700);
    var rows = [['Tempo di gioco', fmt(r.time)], ['Danni subiti', Math.round(r.damageTaken)], ['Combo massima', r.maxCombo], ['Nemici a terra', r.kos], ['Riprove', r.retries], ['Assistenza', r.assisted ? 'sì' : 'no'], ['Punteggio', r.score]];
    rows.forEach(function (q, i) { txt(q[0], 430, 200 + i * 46, 24, R.COL.ink, 'left', 400); txt(String(q[1]), 850, 200 + i * 46, 24, R.COL.ink, 'right', 600); });
    txt('C4-04 (sentiero di uscita e scena di Ajax) e i capitoli successivi non sono ancora implementati.', C.VIEW_W / 2, 560, 18, R.COL.dim, 'center', 400);
    drawList(menuItems(), C.VIEW_W / 2, 630);
  }
  function fmt(s) { var m = Math.floor(s / 60), x = Math.floor(s % 60); return m + ':' + (x < 10 ? '0' : '') + x; }
  function overlay(title, items, sub) {
    ctx.fillStyle = 'rgba(4,5,10,0.78)'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    txt(title, C.VIEW_W / 2, 220, 56, R.COL.p1, 'center', 700);
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
    if (game.state === 'play') {
      acc += dt;
      while (acc >= C.STEP) { simTime += C.STEP; W.Input.setTime(simTime); stepPlay(C.STEP); acc -= C.STEP; if (game.state !== 'play') { acc = 0; break; } }
    } else { acc = 0; simTime += dt; W.Input.setTime(simTime); }
    draw(dt);
    if (game.msg) { game.msg.t -= dt; if (game.msg.t <= 0) game.msg = null; }
  }
  function stepPlay(dt) {
    var w = game.world;
    for (var i = 0; i < w.players.length; i++) { var d = w.players[i].device; if (d) { d.poll(); if (d.edge.pause) { game.state = 'pause'; game.menuIdx = 0; return; } } }
    w.step(dt);
    W.Audio.consume(w.events);
    if (w.failed) { game.fails++; game.state = 'fail'; game.menuIdx = 0; w.failed = false; return; }
    if (w.area.done) {
      if (game.areaIdx + 1 < W.AREA_ORDER.length) { game.areaIdx++; startArea(); }
      else {
        var s = w.stats; game.result = { time: s.time, damageTaken: s.damageTaken, maxCombo: s.maxCombo, kos: s.kos, retries: s.retries, assisted: s.assisted, score: w.score[0] + w.score[1] };
        var st = storage(); if (st) try { st.removeItem(SAVE_KEY); } catch (e) {}
        game.state = 'result'; game.menuIdx = 0;
      }
    }
  }
  var padPrev = {};
  function pollMenuPad() {
    if (game.state === 'play' || !navigator.getGamepads) return;
    var gp = navigator.getGamepads()[0]; if (!gp) return;
    var map = { 12: 'ArrowUp', 13: 'ArrowDown', 14: 'ArrowLeft', 15: 'ArrowRight', 0: 'Enter', 1: 'Escape', 9: 'Escape' };
    for (var b in map) { var p = gp.buttons[b] && gp.buttons[b].pressed; if (p && !padPrev[b]) onKey(map[b]); padPrev[b] = p; }
  }
  function draw(dt) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (game.state === 'title') drawTitle();
    else if (game.state === 'menu') { backdrop(); txt('THE WARRIORS', C.VIEW_W / 2, 150, 64, R.COL.ink, 'center', 700); txt('NIGHT RUN', C.VIEW_W / 2, 196, 28, R.COL.p1, 'center', 500); drawList(menuItems(), C.VIEW_W / 2, 320); }
    else if (game.state === 'select') drawSelect();
    else if (game.state === 'howto') drawHowto();
    else if (game.state === 'options') { backdrop(); txt('OPZIONI', C.VIEW_W / 2, 140, 44, R.COL.p1, 'center', 700); drawList(menuItems(), C.VIEW_W / 2, 260); txt('← → regola', C.VIEW_W / 2, 640, 18, R.COL.dim, 'center', 400); }
    else if (game.state === 'result') drawResult();
    else if (game.world) {
      R.frame(game.world, game.state === 'play' ? dt : 0, ui);
      if (game.state === 'pause') overlay('PAUSA', menuItems());
      if (game.state === 'fail') overlay('A TERRA', menuItems(), game.fails >= 2 ? 'Puoi riprovare con salute piena: il risultato sarà segnato come assistito' : 'Si riparte dall\'ingresso dell\'area');
    }
    if (game.msg) { ctx.fillStyle = 'rgba(8,10,16,0.88)'; ctx.fillRect(C.VIEW_W / 2 - 330, 640, 660, 40); txt(game.msg.text, C.VIEW_W / 2, 667, 18, R.COL.ink, 'center', 400); }
  }

  function fit() {
    var s = Math.min(window.innerWidth / C.VIEW_W, window.innerHeight / C.VIEW_H);
    cv.style.width = Math.floor(C.VIEW_W * s) + 'px'; cv.style.height = Math.floor(C.VIEW_H * s) + 'px';
  }

  function boot() {
    cv = document.getElementById('game'); cv.width = C.VIEW_W; cv.height = C.VIEW_H; ctx = cv.getContext('2d');
    R.init(cv); loadOptions(); fit();
    window.addEventListener('resize', fit);
    W.Input.onKey(onKey);
    cv.addEventListener('pointerdown', function () { W.Audio.unlock(); if (game.state === 'title') onKey('Enter'); });
    // pausa su perdita di visibilità: danni e timer fermi
    document.addEventListener('visibilitychange', function () { if (document.hidden) { if (game.state === 'play') { game.state = 'pause'; game.menuIdx = 0; } W.Audio.suspend(); } });
    window.addEventListener('gamepaddisconnected', function () { if (game.state === 'play') { game.state = 'pause'; game.menuIdx = 0; game.msg = { text: 'Controller scollegato', t: 3 }; } });
    requestAnimationFrame(loop);
  }
  W.Game = { boot: boot, game: game, tick: tick, newRun: newRun, onKey: onKey };
  window.addEventListener('load', boot);
})();
