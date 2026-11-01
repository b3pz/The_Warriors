'use strict';
// Pilota automatico: la CPU gioca al posto tuo.
//  · Cinema: tutta la storia dall'inizio ai titoli di coda, con i dialoghi al ritmo di lettura. Non salva, non sblocca capitoli,
//    non conta le W di Rembrandt né i punteggi.
//  · Demo: se resti fermo sulla schermata iniziale, parte un pezzo di un livello a caso; un tasto qualsiasi la chiude.
window.W = window.W || {};
W.AutoPilot = (function () {
  var AP = { active: false, kind: null, t: 0 };

  function readTime(text) { return Math.max(1.8, 0.9 + (text || '').length * 0.04); }

  // guida il giocatore 1 come una CPU con obiettivi d'area (stessa logica del test automatico della campagna)
  function installBot(w) {
    var p0 = w.players[0]; if (!p0) return;
    w.players.forEach(function (p) { if (!p.cpu) { p.cpu = true; p.qaHuman = p.slot === 0; } });   // il giocatore 1 conta come umano (sconfitta, uscite)
    if (p0.__ap) return; p0.__ap = true;
    var orig = W.Player.prototype.thinkCpu;
    p0.thinkCpu = function (dt) {
      var enemiesUp = w.enemies.some(function (e) { return e.alive() && e.def.behavior !== 'spar' && e.onScreen(); });
      orig.call(this, dt);
      var c = this.cpuCtl, a = w.area; if (!a) return;
      if (a.kind === 'training' && !a.trainDone) return;
      if (enemiesUp && !(a.kind === 'escape' && !a.fighting && !a.def.busDrops)) return;
      var target = null, ints = a.interactions ? a.interactions() : [];
      var talk = ints.filter(function (i) { return !i.exit && /Parla/.test(i.label); })[0];
      var needNpc = a.def.needTalk && !a.talked[a.def.needTalk] && w.npcs.filter(function (n) { return n.id === a.def.needTalk; })[0];
      var other = ints.filter(function (i) { return /pannello|Aiuta|Sfonda|Spacca|Nasconditi/.test(i.label); })[0];
      // nel Cinema si vede tutto: anche i dialoghi facoltativi con i compagni e la W di Rembrandt sul muro
      var extraTalk = AP.kind === 'cinema' && ints.filter(function (i) { return i.who && !a.talked[i.who]; })[0];
      var tagInt = AP.kind === 'cinema' && !a._apTagged && ints.filter(function (i) { return /Lascia la W/.test(i.label); })[0];
      if (needNpc) target = { x: needNpc.x, y: needNpc.y };
      else if (a.def.needTalks && a.talkCount < a.def.needTalks && talk) target = talk;
      else if (extraTalk) target = extraTalk;
      else if (tagInt) { target = tagInt; if (Math.abs(tagInt.x - this.x) < 75 && Math.abs(tagInt.y - this.y) < 36) a._apTagged = true; }
      else if (other) target = other;
      else if (ints.filter(function (i) { return i.exit; })[0]) target = ints.filter(function (i) { return i.exit; })[0];
      else if (a.def.mark && !a.markReached) target = a.def.mark;
      else target = { x: a.width - 100, y: (a.floor[0] + a.floor[1]) / 2, zone: true };
      c.ax = 0; c.ay = 0;
      if (Math.abs(target.x - this.x) > 30) c.ax = Math.sign(target.x - this.x);
      if (Math.abs(target.y - this.y) > 16) c.ay = Math.sign(target.y - this.y);
      if (W.steerAround) W.steerAround(this, c);
      if (!target.zone && Math.abs(target.x - this.x) < 75 && Math.abs(target.y - this.y) < 36 && Math.random() < 0.1) a.tryInteract(this);
      if (c.ax) c.runIntent = true;
    };
    p0.buddy = function () { return w.players[1] || null; };
  }

  AP.start = function (kind) { AP.active = true; AP.kind = kind; AP.t = 0; };
  AP.stop = function () { AP.active = false; AP.kind = null; };
  AP.isDemo = function () { return AP.active && AP.kind === 'demo'; };

  // un passo del pilota: chiamato da main.js prima della simulazione
  AP.drive = function (game, onKey, dt) {
    if (!AP.active) return;
    AP.t += dt;
    var w = game.world;
    if (game.state === 'party') { onKey('Enter'); return; }
    if (game.state === 'fail' || (game.state === 'gameover' && (game.gameoverT || 0) > 1.3)) { onKey('Enter'); return; }
    if (game.state !== 'play' || !w || !w.area) return;
    var a = w.area, sc = a.scene;
    if (sc) {
      if (AP.kind === 'demo' && !sc.def.intro) { sc.skip(); return; }
      if (sc.choice) { sc.choiceT = (sc.choiceT || 0) + dt; if (sc.choiceT > 1.6) { sc.input('confirm'); sc.choiceT = 0; } return; }
      if (sc.line && sc.lineT > readTime(sc.line.text)) sc.input('confirm');
      return;
    }
    // l'allenamento è solo gioco: nel Cinema e nella demo si salta del tutto
    if (a.kind === 'training') { if (!a.finishing && a.t > 0.2) a.finish(); return; }
    installBot(w);
    // nel cinema e nella demo nessuno resta a terra: è un film, non una partita
    w.players.forEach(function (p) { if (!p.out && p.hp < p.maxhp * 0.35) p.hp = p.maxhp * 0.35; });
  };
  return AP;
})();
