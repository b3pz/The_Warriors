// Esecuzione di un'area della campagna (dati in js/campaign.js).
// Contratto: ingresso, scene, incontri, interazioni, obiettivo, uscita, flag; nessun obiettivo dedotto dal testo.
'use strict';
var W = window.W;

(function () {
  var C = W.CFG;
  function sign(v) { return v < 0 ? -1 : 1; }

  function AreaRun(def, world, opts) {
    opts = opts || {};
    this.def = def; this.id = def.id; this.kind = def.kind; this.world = world;
    this.width = def.width; this.floor = [680 - (def.depth || 200), 680];
    this.t = 0; this.done = false; this.exitT = 0; this.waveIdx = 0; this.fighting = false; this.queue = [];
    this.objective = def.objective || ''; this.banner = { text: '', t: 99 };
    this.sceneQueue = []; this.scene = null; this.talked = {}; this.talkCount = 0; this.stepIdx = 0; this.timer = null;
    this.pursuersLeft = 0; this.spawnT = 2; this.panelHits = 0; this.panelOpen = !def.panel; this.markReached = false;
    this.bus = def.bus ? { t: 4, phase: 'idle', x: 0 } : null;
    var duo = world.duo(), self = this;
    world.peace = !!def.peace;
    world.props = (def.props || []).map(function (p) { var o = Object.assign({}, p); if (p.contents) o.contents = duo ? p.contents.duo : p.contents.solo; return o; });
    (def.barriers || []).forEach(function (bx, i) {
      var y0 = self.floor[0] + 20 + ((i % 2) ? (self.floor[1] - self.floor[0]) * 0.45 : 0);
      world.props.push({ kind: 'barrier', x0: bx, x1: bx + 26, y0: y0, y1: y0 + (self.floor[1] - self.floor[0]) * 0.42, solid: true, low: true });
    });
    world.items = (def.items || []).map(function (i) {
      if (i.kind === 'weapon') return { uid: Math.random(), kind: 'weapon', w: { type: i.w, dur: W.WEAPONS[i.w].dur }, x: i.x, y: i.y, t: 0 };
      return { uid: Math.random(), kind: i.kind, x: i.x, y: i.y, t: 0 };
    });
    world.enemies = []; world.projectiles = []; world.eproj = []; world.attackers = 0;
    world.exitOpen = false; world.cam.x = 0; world.cam.lockMax = null; world.cam.lockMin = null;
    world.npcs = world.npcs.filter(function (n) { return false; });
    var f = this.floor, mid = (f[0] + f[1]) / 2;
    for (var i = 0; i < world.players.length; i++) {
      var p = world.players[i]; p.x = 150 + i * 70; p.y = mid + (i ? 40 : 0); p.face = 1; p.hidden = false; p.z = 0;
    }
    // compagni al seguito (solo dove il design li mostra), Mercy come PNG, comparse
    var active = world.players.map(function (p) { return p.char.id; });
    var lead = world.players[0];
    if (def.present && (def.kind === 'traversal' || def.kind === 'training')) {
      def.present.filter(function (id) { return active.indexOf(id) < 0 && (opts.roster || []).indexOf(id) >= 0; }).forEach(function (id, k) {
        var n = new W.Npc(world, id, id, 60 - k * 40, mid + ((k % 3) - 1) * 34, 1); n.follow = lead; n.followOff = k + 1; n.keep = true;
        if (def.talks && def.talks.some(function (t) { return t.who === id; })) { var tk = def.talks.filter(function (t) { return t.who === id; })[0]; n.follow = null; n.x = tk.x; n.y = tk.y; n.face = -1; }
        if (def.seated) { n.follow = null; n.x = 300 + k * 260; n.y = f[0] + 10; }
        world.npcs.push(n);
      });
    }
    if (def.talks) def.talks.forEach(function (tk) {
      if (!world.npcs.some(function (n) { return n.id === tk.who; }) && active.indexOf(tk.who) < 0) { var n = new W.Npc(world, tk.who, tk.set || tk.who, tk.x, tk.y, -1); n.keep = true; if (tk.who === 'couple') n.name = 'Passeggeri'; world.npcs.push(n); }
    });
    if (def.mercy === 'npc' || (def.mercy === 'player2' && !world.players.some(function (p) { return p.char.id === 'mercy'; }))) {
      var m = new W.Npc(world, 'mercy', 'mercy', 80, mid + 50, 1); m.follow = lead; m.followOff = 0; m.keep = true; this.mercyNpc = m; world.npcs.push(m);
    }
    if (def.crowd) for (var c = 0; c < 14; c++) { var cn = new W.Npc(world, 'cw' + c, def.crowd[c % def.crowd.length], 500 + c * 95, f[0] + 6 + (c % 3) * 12, c % 2 ? 1 : -1); cn.name = ''; cn.crowd = true; cn.keep = true; world.npcs.push(cn); }
    if (def.watcher) { var wt = new W.Npc(world, 'watch', def.watcher, def.width - 260, f[0] + 20, -1); wt.name = 'Capo Punks'; wt.keep = true; world.npcs.push(wt); }
    if (def.kind === 'training') this.setupTraining();
    if (def.stationed) {
      (duo ? def.stationed.duo : def.stationed.solo).forEach(function (s) { var e = new W.Enemy(world, s[0], s[1], s[2]); e.setState('approach'); e.guardX = s[1]; e.face = -1; world.enemies.push(e); });
    }
    if (def.pursuers) { var pc = duo ? def.pursuers.duo : def.pursuers.solo; this.pursuerType = Object.keys(pc)[0]; this.pursuersMax = pc[this.pursuerType]; this.pursuersLeft = this.pursuersMax * 2; }
    if (def.timer) this.timer = (opts.difficulty === 'facile' && def.timerEasy) ? def.timerEasy : def.timer;
    // coda scene d'ingresso
    if (def.chapterCard && W.CHAPTERS[def.ch]) this.sceneQueue.push({ cine: 'card_' + def.ch, steps: [['title', W.CHAPTERS[def.ch].split(' · ')[1] || W.CHAPTERS[def.ch], W.CHAPTERS[def.ch].split(' · ')[0], 2.6]], letterbox: false });
    if (def.enter) this.sceneQueue.push(W.SCENES[def.enter]);
    if (def.kind === 'scene' || def.kind === 'epilogue') (def.scenes || []).forEach(function (s) { self.sceneQueue.push(W.SCENES[s]); });
    if (def.kind === 'traversal' && !def.needTalks && !def.midScene) world.exitOpen = !def.exitInteract;
    if (def.kind === 'escape' && !def.waves) world.exitOpen = true;
    this.banner = { text: (W.CHAPTERS[def.ch] || '').split(' · ')[0] + ' · ' + def.name, t: def.chapterCard ? 99 : 0 };
  }
  W.AreaRun = AreaRun;

  AreaRun.prototype.playScene = function (s) { if (s) this.sceneQueue.push(s); };

  AreaRun.prototype.setupTraining = function () {
    var w = this.world, partner = new W.Enemy(w, 'sparring', 460, 580);
    var other = w.players[0].char.id === 'cleon' ? 'swan' : 'cleon';
    if (w.players.length > 1) other = 'snow';
    partner.sparSet = other; partner.setState('approach'); partner.face = -1; w.enemies.push(partner);
    this.sparring = partner;
    w.stats.train = {};
  };

  // interazioni d'area (prioritarie dopo il soccorso): parlare, uscita a interazione, pannello, aiuto simulato
  AreaRun.prototype.interactions = function () {
    var def = this.def, w = this.world, self = this, list = [];
    if (def.talks) def.talks.forEach(function (tk) {
      var n = w.npcs.filter(function (q) { return q.id === tk.who; })[0]; if (!n) return;
      list.push({ x: n.x, y: n.y, label: 'Parla con ' + (n.name || tk.who), fn: function () { self.talkCount += self.talked[tk.who] ? 0 : 1; self.talked[tk.who] = true; self.playScene(W.SCENES[tk.scene || ('talk_' + tk.who)] || { steps: [['caption', '…']] }); if (self.talkCount >= (def.needTalks || 0) && !def.exitInteract) w.exitOpen = true; } });
    });
    if (def.exitInteract && this.canExit()) list.push({ x: def.exitInteract.x, y: def.exitInteract.y, label: def.exitInteract.label, exit: true, fn: function () { self.tryExitInteract(); } });
    if (def.panel && !this.panelOpen) list.push({ x: def.panel.x, y: def.panel.y, label: 'Sfonda il pannello (' + (def.panel.hits - this.panelHits) + ')', fn: function (p) {
      self.panelHits++; w.emit('hit', { x: def.panel.x, y: def.panel.y, z: 90, target: 'enemy', heavy: true }); p.startAttack('heavy');
      if (self.panelHits >= def.panel.hits) { self.panelOpen = true; w.exitOpen = true; self.objective = 'Alla finestra!'; w.emit('break', { x: def.panel.x, y: def.panel.y }); }
    } });
    if (this.reviveDummy && !this.reviveDummy.helped) list.push({ x: this.reviveDummy.x, y: this.reviveDummy.y, label: 'Aiuta ' + this.reviveDummy.name, fn: function () { self.reviveDummy.helped = true; self.reviveDummy.pose = null; w.stats.train.revive = 1; w.emit('revive', { x: self.reviveDummy.x, y: self.reviveDummy.y }); } });
    return list;
  };
  AreaRun.prototype.nearInteraction = function (p) {
    var list = this.interactions(), best = null, bd = 1e9;
    for (var i = 0; i < list.length; i++) { var it = list[i], dx = Math.abs(it.x - p.x), dy = Math.abs(it.y - p.y); if (dx < 80 && dy < 46 && dx < bd) { bd = dx; best = it; } }
    return best;
  };
  AreaRun.prototype.tryInteract = function (p) { if (this.scene) return false; var it = this.nearInteraction(p); if (it) { it.fn(p); return true; } return false; };
  AreaRun.prototype.canExit = function () {
    if (this.kind === 'arena' || this.def.waves) return this.waveIdx >= (this.def.waves || []).length;
    if (this.def.needTalks && this.talkCount < this.def.needTalks) return false;
    if (this.def.midScene && !this.midDone) return false;
    return true;
  };
  AreaRun.prototype.tryExitInteract = function () {
    var def = this.def, w = this.world;
    if (def.exitInteract.both) {
      var mx = this.mercyNpc ? this.mercyNpc.x : (w.players.filter(function (p) { return p.char.id === 'mercy'; })[0] || {}).x;
      var sx = (w.players.filter(function (p) { return p.char.id !== 'mercy'; })[0] || {}).x;
      if (Math.abs(mx - def.exitInteract.x) > 260 || Math.abs(sx - def.exitInteract.x) > 260) { this.objective = 'Aspetta che arrivino entrambi alla porta'; return; }
    }
    this.finish();
  };
  AreaRun.prototype.finish = function () {
    if (this.finishing) return; this.finishing = true;
    if (this.def.exitScene) this.playScene(W.SCENES[this.def.exitScene]);
    this.afterScenes = true;
  };

  AreaRun.prototype.step = function (w, dt) {
    this.t += dt; this.banner.t += dt;
    var def = this.def, duo = w.duo(), self = this;
    // scene: la simulazione di gioco si ferma (zero danni durante dialoghi e cinematiche)
    if (!this.scene && this.sceneQueue.length) { this.scene = new W.Scene(w, this.sceneQueue.shift(), {}); }
    if (this.scene) {
      this.scene.step(dt);
      if (this.scene.done) { this.scene = null; w.players.forEach(function (p) { p.hidden = false; }); if (this.def.kind === 'scene' || this.def.kind === 'epilogue') w.cam.x = 0; }
      return 'scene';
    }
    if (this.afterScenes) { this.done = true; return 'done'; }
    if ((def.kind === 'scene' || def.kind === 'epilogue') && !this.sceneQueue.length) { this.done = true; return 'done'; }
    if (this.banner.t > 98 && this.t > 0.1) this.banner.t = 0;

    // allenamento
    if (def.kind === 'training') this.stepTraining(w);
    // incontri a ondate (arena e micro-arena di fuga)
    this.stepWaves(w, dt, duo);
    // fuga: timer, inseguitori, bus
    if (this.timer !== null && !this.finishing) {
      this.timer -= dt;
      if (this.timer <= 0) { this.timer = 0; w.failed = true; w.failReason = 'Tempo scaduto'; }
    }
    if (this.pursuerType) this.stepPursuers(w, dt);
    if (this.bus) this.stepBus(w, dt);
    if (def.midScene && !this.midDone && w.players[0].x > def.midScene.x) { this.midDone = true; this.playScene(W.SCENES[def.midScene.scene]); if (!def.exitInteract) w.exitOpen = true; }
    if (def.kind === 'confront') {
      var p0 = w.players[0], mk = def.mark;
      if (!this.markReached && Math.abs(p0.x - mk.x) < 50 && Math.abs(p0.y - mk.y) < 40) { this.markReached = true; def.scenes.forEach(function (s) { self.playScene(W.SCENES[s]); }); this.afterScenes = true; }
    }
    // uscita: tutto il gruppo nella zona e 0,6 s di conferma
    if (w.exitOpen && !def.exitInteract && !this.finishing && def.kind !== 'confront') {
      var all = w.players.filter(function (p) { return !p.out && p.state !== 'ko'; });
      var inZone = all.length && all.every(function (p) { return p.x > def.width - 200; });
      if (inZone) { this.exitT += dt; if (this.exitT >= C.EXIT_CONFIRM) { this.finish(); w.emit('exit', {}); } } else this.exitT = 0;
    }
    if (def.exitInteract && this.canExit() && !w.exitOpen && this.kind !== 'traversal') { w.exitOpen = true; this.objective = def.exitInteract.label; }
    if (def.exitInteract && this.canExit() && this.kind === 'traversal') w.exitOpen = true;
    return 'play';
  };

  AreaRun.prototype.stepWaves = function (w, dt, duo) {
    var def = this.def; if (!def.waves) return;
    if (!this.fighting && this.waveIdx < def.waves.length) {
      var wave = def.waves[this.waveIdx];
      var lead = Math.max.apply(null, w.players.map(function (p) { return p.out ? 0 : p.x; }));
      if (lead >= wave.trigger) {
        this.fighting = true; this.objective = wave.objective; this.boss = !!wave.boss;
        this.queue = (duo ? wave.duo : wave.solo).slice();
        w.cam.lockMin = w.cam.x; w.cam.lockMax = w.cam.x;
        w.emit('wave', { idx: this.waveIdx });
      }
    }
    if (!this.fighting) return;
    var req = w.enemies.filter(function (e) { return e.alive() && !e.pursuer && !e.stationed; });
    var onField = w.enemies.filter(function (e) { return e.alive(); }).length;
    var max = C.MAX_ON_FIELD[duo ? 1 : 0];
    while (this.queue.length && onField < max) {
      var s = this.queue.shift();
      var x = s[1] === 'R' ? w.cam.x + C.VIEW_W + 60 : w.cam.x - 60;
      var e = new W.Enemy(w, s[0], x, Math.max(this.floor[0] + 10, Math.min(this.floor[1] - 6, s[2]))); e.face = s[1] === 'R' ? -1 : 1;
      w.enemies.push(e); onField++; req.push(e);
      if (e.weapon && !w.flags.firstBat) w.flags.firstBat = this.t;
    }
    if (!this.queue.length && req.length === 0) {
      var wv = def.waves[this.waveIdx];
      if (wv.onClear) {
        var drops = duo ? wv.onClear.duo : wv.onClear.solo;
        for (var i = 0; i < drops.length; i++) w.items.push({ uid: Math.random(), kind: drops[i][0], x: w.cam.x + C.VIEW_W / 2 + drops[i][1] * 160, y: drops[i][2], t: 0 });
      }
      if (wv.afterScene) this.playScene(W.SCENES[wv.afterScene]);
      this.fighting = false; this.waveIdx++;
      w.cam.lockMin = null; w.cam.lockMax = null;
      w.score[0] += 500;
      if (this.waveIdx >= def.waves.length) {
        if (!def.exitInteract) w.exitOpen = true;
        this.objective = def.exitInteract ? def.exitInteract.label : (this.kind === 'escape' ? def.objective : 'Prosegui →');
        w.emit('clear', {});
      } else this.objective = 'Prosegui →';
    }
  };

  AreaRun.prototype.stepPursuers = function (w, dt) {
    // inseguitori a coda finita: entrano da dietro, non sono obiettivo di KO
    var alive = w.enemies.filter(function (e) { return e.pursuer && e.alive(); }).length;
    this.spawnT -= dt;
    if (this.spawnT <= 0 && this.pursuersLeft > 0 && alive < this.pursuersMax && !this.finishing) {
      var e = new W.Enemy(w, this.pursuerType, w.cam.x - 70, this.floor[0] + 30 + w.rng() * (this.floor[1] - this.floor[0] - 60));
      e.pursuer = true; e.face = 1; w.enemies.push(e); this.pursuersLeft--; this.spawnT = 3.5 + w.rng() * 2;
    }
  };

  AreaRun.prototype.stepBus = function (w, dt) {
    // pericolo di percorso: corsia superiore, lampeggi e clacson prima del passaggio
    var b = this.bus, lane = [this.floor[0], this.floor[0] + 60];
    b.lane = lane; b.t -= dt;
    if (b.phase === 'idle' && b.t <= 0) { b.phase = 'warn'; b.t = 1.4; w.emit('horn', {}); }
    else if (b.phase === 'warn' && b.t <= 0) { b.phase = 'pass'; b.t = 1.3; b.x = w.cam.x - 420; b.hit = {}; }
    else if (b.phase === 'pass') {
      b.x += (C.VIEW_W + 900) / 1.3 * dt;
      w.players.forEach(function (p) {
        if (!b.hit[p.uid] && p.hittable() && p.y >= lane[0] - 4 && p.y <= lane[1] && p.x > b.x && p.x < b.x + 380) { b.hit[p.uid] = true; p.takeHit({ x: b.x, face: 1 }, { spec: { dmg: 14, kd: true } }); }
      });
      if (b.t <= 0) { b.phase = 'idle'; b.t = 6 + w.rng() * 3; }
    }
  };

  AreaRun.prototype.stepTraining = function (w) {
    var def = this.def, tr = w.stats.train || (w.stats.train = {});
    if (this.stepIdx >= def.steps.length) {
      if (!this.trainDone) { this.trainDone = true; w.exitOpen = true; this.objective = 'Raggiungi l\'uscita →'; if (def.done) this.playScene({ letterbox: false, steps: [['say', def.done[0], def.done[1]]] }); if (this.sparring) { this.sparring.hp = 0; this.sparring.setState('dead'); this.sparring.fade = 1; } }
      return;
    }
    var st = def.steps[this.stepIdx];
    if (!st.started) { st.started = true; this.objective = st.text; if (st.say) this.playScene({ letterbox: false, steps: [['say', st.say[0], st.say[1]]] });
      if (st.check === 'revive') { var n = new W.Npc(w, 'helpme', this.sparring ? this.sparring.sparSet : 'snow', 980, 600, -1); n.pose = 'down'; n.keep = true; w.npcs.push(n); this.reviveDummy = n; } }
    if ((tr[st.check] || 0) > 0) { this.stepIdx++; w.emit('clear', {}); }
  };

  AreaRun.prototype.bossEnemy = function (w) {
    for (var i = 0; i < w.enemies.length; i++) if (w.enemies[i].def.elite && w.enemies[i].alive()) return w.enemies[i];
    return null;
  };
})();
