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
    this.bus = def.bus ? { t: def.busDrops ? 1.2 : 4, phase: 'idle', x: 0, kind: 'bus' } : (def.train ? { t: 3, phase: 'idle', x: 0, kind: 'train' } : null);
    var duo = world.duo(), self = this;
    world.peace = !!def.peace || def.kind === 'stealth';
    world.props = (def.props || []).map(function (p) { var o = Object.assign({}, p); if (p.contents) o.contents = duo ? p.contents.duo : p.contents.solo; return o; });
    // ostacoli dei corridoi: [tipo, x, inizio, fine] con inizio/fine in frazione della profondità
    var fdepth = this.floor[1] - this.floor[0], f0 = this.floor[0];
    (def.obstacles || []).forEach(function (o) {
      var y0 = f0 + fdepth * (o[2] === undefined ? 0 : o[2]) - 6, y1 = f0 + fdepth * (o[3] === undefined ? 1 : o[3]) + 6;
      if (o[0] === 'low') world.props.push({ kind: 'low', style: def.lowStyle || 'barrier', x0: o[1], x1: o[1] + 24, y0: y0, y1: y1, solid: true, low: true });
      if (o[0] === 'crate') world.props.push({ kind: 'crate', x0: o[1], x1: o[1] + 62, y0: y0, y1: Math.min(y1, y0 + 34), solid: true, breakable: 3, drop: o[4] || null });
      if (o[0] === 'fire') world.props.push({ kind: 'fire', x0: o[1], x1: o[1] + 90, y0: y0, y1: y1, hazard: true, low: true });
    });
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
    if (def.present && (def.kind === 'traversal' || def.kind === 'training' || def.kind === 'stealth')) {
      def.present.filter(function (id) { return active.indexOf(id) < 0 && (opts.roster || []).indexOf(id) >= 0; }).forEach(function (id, k) {
        var n = new W.Npc(world, id, id, Math.max(40, 60 + (k % 4) * 70 - Math.floor(k / 4) * 50), self.floor[0] + 20 + ((k * 37) % 100) / 100 * (self.floor[1] - self.floor[0] - 30), 1); n.follow = lead; n.followOff = k + 1; n.keep = true;
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
    if (def.kind === 'stealth') this.setupStealth();
    if (def.stationed) {
      (duo ? def.stationed.duo : def.stationed.solo).forEach(function (s) { var e = new W.Enemy(world, s[0], s[1], s[2]); e.setState('approach'); e.guardX = s[1]; e.face = -1; world.enemies.push(e); });
    }
    if (def.pursuers) { var pc = duo ? def.pursuers.duo : def.pursuers.solo; this.pursuerType = Object.keys(pc)[0]; this.pursuersMax = pc[this.pursuerType]; this.pursuersLeft = this.pursuersMax * 2; }
    if (def.timer) this.timer = (opts.difficulty === 'facile' && def.timerEasy) ? def.timerEasy : def.timer;
    // coda scene d'ingresso
    if (def.chapterCard && W.CHAPTERS[def.ch]) {
      var parts = W.CHAPTERS[def.ch].split(' · '), card = ['title', parts[1] || parts[0], parts[0], 2.6];
      if (W.RADIO[def.ch]) this.sceneQueue.push({ cine: 'radio_' + def.ch, radio: true, mood: 'radio', letterbox: false, steps: W.RADIO[def.ch].map(function (l) { return ['say', 'dj', l]; }).concat([card]) });
      else this.sceneQueue.push({ cine: 'card_' + def.ch, steps: [card], letterbox: false });
    }
    if (def.enter) this.sceneQueue.push(W.SCENES[def.enter]);
    if (def.kind === 'scene' || def.kind === 'epilogue') (def.scenes || []).forEach(function (s) { self.sceneQueue.push(W.SCENES[s]); });
    if (def.kind === 'traversal' && !def.needTalks && !def.midScene) world.exitOpen = !def.exitInteract;
    if (def.kind === 'escape' && !def.waves) world.exitOpen = true;
    this.banner = { text: (W.CHAPTERS[def.ch] || '').split(' · ')[0] + ' · ' + def.name, t: def.chapterCard ? 99 : 0 };
  }
  W.AreaRun = AreaRun;

  AreaRun.prototype.playScene = function (s) { if (s) this.sceneQueue.push(s); };
  // presentazione delle bande: la prima volta che una banda entra in scena il gioco si ferma su di lei, con nome, territorio e logo
  W.GANGS = {
    turnbull: { name: "TURNBULL A.C.'s", where: 'Gun Hill Road · Bronx', col: '#d8a23a', sets: /^turnbull/, ch: 'C2', start: 'C2-01' },
    orphans:  { name: 'THE ORPHANS', where: 'Tremont · Bronx', col: '#9a8f7a', sets: /^(orphan|sully)/, ch: 'C3', start: 'C3-01' },
    furies:   { name: 'THE BASEBALL FURIES', where: 'Riverside Park · Manhattan', col: '#e9e4d6', sets: /^fury/, ch: 'C4' },
    lizzies:  { name: 'THE LIZZIES', where: 'Union Square · Manhattan', col: '#d84a8a', sets: /^lizzie/, ch: 'C5' },
    punks:    { name: 'THE PUNKS', where: 'Union Square · stazione della metro', col: '#5a8ed8', sets: /^punk/, ch: 'C6' },
    rogues:   { name: 'THE ROGUES', where: "Hell's Kitchen · Manhattan", col: '#7a7f8a', sets: /^rogue/, ch: 'C8', start: 'C8-01' }
  };
  function gangOf(set) { for (var g in W.GANGS) if (W.GANGS[g].sets.test(set || '')) return g; return null; }
  W.gangIntroScene = function (g, focus) {
    return { cine: 'intro_' + g, intro: g, focus: focus || null, letterbox: false, steps: [['sfx', 'horn'], ['shake', 6], ['wait', W.ART_AI && W.ART_AI.scene && W.ART_AI.scene['intro_' + g] ? 5 : 3.2]] };
  };
  AreaRun.prototype.checkGangIntro = function () {
    var w = this.world, def = this.def;
    // all'inizio dell'area: bande che si presentano con una scena (Turnbull sul bus, Orphans in strada, Rogues sul carro) o presentazione forzata (demo)
    if (!this._introStart) {
      this._introStart = true;
      var forced = w.flags.forceIntro; delete w.flags.forceIntro;
      for (var gs in W.GANGS) if ((forced === gs || W.GANGS[gs].start === def.id) && !w.flags['intro_' + gs]) { w.flags['intro_' + gs] = true; this.sceneQueue.unshift(W.gangIntroScene(gs)); }
    }
    if (this.scene || this.sceneQueue.length) return;
    for (var i = 0; i < w.enemies.length; i++) {
      var e = w.enemies[i]; if (!e.alive() || !e.onScreen() || e.x < w.cam.x + 160 || e.x > w.cam.x + C.VIEW_W - 160) continue;
      var g = gangOf(e.def.set); if (!g || w.flags['intro_' + g] || (W.GANGS[g].ch !== def.ch && !def.arcade)) continue;   // ogni banda si presenta nel suo capitolo
      w.flags['intro_' + g] = true;
      this.playScene(W.gangIntroScene(g, e));
      return;
    }
  };

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
      list.push({ x: n.x, y: n.y, who: tk.who, label: 'Parla con ' + (n.name || tk.who), fn: function () { self.talkCount += self.talked[tk.who] ? 0 : 1; self.talked[tk.who] = true; self.playScene(W.SCENES[tk.scene || ('talk_' + tk.who)] || { steps: [['caption', '…']] }); if (self.talkCount >= (def.needTalks || 0) && (!def.needTalk || self.talked[def.needTalk]) && !def.exitInteract) w.exitOpen = true; } });
    });
    var tg = this.tagSpot();
    if (tg && !tg.done && !this.tagAnim) list.push({ x: tg.x, y: tg.y, label: w.players.concat(w.npcs).some(function (q) { return (q.char ? q.char.id : q.id) === 'rembrandt' && !q.crowd; }) ? 'Lascia la W di Rembrandt' : 'Lascia la W (bomboletta di Rembrandt)', fn: function (p) { self.sprayTag(p); } });
    if (def.kind === 'stealth' && this.st && this.st.phase === 'hide') def.stalls.forEach(function (sx, i) {
      list.push({ x: sx, y: self.floor[0] + 24, label: 'Nasconditi qui', fn: function (p) { self.hideIn(p, i); } });
    });
        if (def.exitInteract && this.canExit()) list.push({ x: def.exitInteract.x, y: def.exitInteract.y, label: def.exitInteract.label, exit: true, fn: function () { self.tryExitInteract(); } });
    if (def.radioProp && !this.radioSmashed) list.push({ x: def.radioProp.x, y: def.radioProp.y, label: 'Spacca la radio con la sedia', fn: function (p) {
      self.radioSmashed = true; w.emit('break', { x: def.radioProp.x, y: def.radioProp.y }); w.emit('shakefx', { amt: 6 }); p.startAttack('heavy');
      // la musica si spegne, nella stanza è il caos: le tiratrici perdono la mira per qualche secondo
      w.enemies.forEach(function (e) { if (e.alive()) { if (e.att) { e.att = null; e.dropToken(); } e.setState('hurt'); e.st = -2.5; } });
      self.objective = 'Caos! Sfonda la porta e via';
    } });
    if (def.panel && !this.panelOpen) list.push({ x: def.panel.x, y: def.panel.y, label: 'Sfonda la porta (' + (def.panel.hits - this.panelHits) + ')', fn: function (p) {
      self.panelHits++; w.emit('hit', { x: def.panel.x, y: def.panel.y, z: 90, target: 'enemy', heavy: true }); p.startAttack('heavy');
      if (self.panelHits >= def.panel.hits) { self.panelOpen = true; w.exitOpen = true; self.objective = 'Porta aperta: fuori!'; w.emit('break', { x: def.panel.x, y: def.panel.y }); }
    } });
    if (this.reviveDummy && !this.reviveDummy.helped) list.push({ x: this.reviveDummy.x, y: this.reviveDummy.y, label: 'Aiuta ' + this.reviveDummy.name, fn: function () { self.reviveDummy.helped = true; self.reviveDummy.pose = null; w.stats.train.revive = 1; w.emit('revive', { x: self.reviveDummy.x, y: self.reviveDummy.y }); } });
    return list;
  };
  // punto graffito dell'area: solo in campagna, solo se Rembrandt è nel gruppo (giocatore o compagno)
  AreaRun.prototype.tagSpot = function () {
    var def = this.def, w = this.world;
    if (def.arcade || W.TAG_SPOTS === undefined || W.TAG_SPOTS[def.id] === undefined) return null;
    if (!this._tag) this._tag = { x: Math.round(def.width * W.TAG_SPOTS[def.id]), y: this.floor[0] + 16 };
    // Rembrandt deve essere nel gruppo di quest'area (anche se non è in campo: allora la bomboletta è la sua)
    var grp = def.thread && W.THREADS[def.thread] ? W.THREADS[def.thread].members : (def.party || []);
    var rem = grp.indexOf('rembrandt') >= 0 || w.players.some(function (p) { return p.char.id === 'rembrandt'; });
    if (!rem) return null;
    this._tag.done = W.Tags.has(def.id) && !this.tagAnim;
    this._tag.drawn = W.Tags.has(def.id);
    return this._tag;
  };
  AreaRun.prototype.sprayTag = function (p) {
    var w = this.world, tg = this._tag, self = this;
    var rem = w.players.filter(function (q) { return q.char.id === 'rembrandt' && !q.out; })[0] || w.npcs.filter(function (n) { return n.id === 'rembrandt' && !n.crowd; })[0];
    if (rem && rem.npc) { rem.move = { x0: rem.x, y0: rem.y, x1: tg.x - 50, y1: tg.y + 6, dur: 0.5, t: 0 }; }
    this.tagAnim = { t: 0 };
    w.emit('spray', { x: tg.x, y: tg.y });
    var isNew = W.Tags.add(this.def.id);
    if (W.AutoPilot && W.AutoPilot.active) { this.tagToast = { text: 'La W dei Warriors', t: 0 }; } else
    this.tagToast = { text: (isNew ? 'La W dei Warriors · ' : 'Già fatta · ') + W.Tags.count() + ' / ' + W.Tags.total + (isNew && W.Tags.count() === Math.ceil(W.Tags.total / 2) ? ' · Galleria sbloccata!' : '') + (isNew && W.Tags.count() === W.Tags.total ? ' · Mercy sbloccata nell\'Arcade!' : ''), t: 0 };
    setTimeout(function () { if (self.tagAnim) w.emit('spray', { x: tg.x, y: tg.y }); }, 600);
  };
  AreaRun.prototype.nearInteraction = function (p) {
    var list = this.interactions(), best = null, bd = 1e9;
    for (var i = 0; i < list.length; i++) {
      var it = list[i], dx = Math.abs(it.x - p.x), dy = Math.abs(it.y - p.y);
      // uscite: zona larga (tutta la fascia vicina al punto, piano intero); altri oggetti: zona stretta
      var rx = it.exit ? 190 : 90, ry = it.exit ? 999 : 50;
      if (dx < rx && dy < ry && dx < bd) { bd = dx; best = it; }
    }
    return best;
  };
  AreaRun.prototype.tryInteract = function (p) {
    if (this.scene) return false;
    var it = this.nearInteraction(p); if (it) { it.fn(p); return true; }
    // uscita a piedi: dentro la zona finale anche il tasto d'interazione porta avanti (stesso prompt «Uscita»)
    var w = this.world, def = this.def;
    if (w.exitOpen && !def.exitInteract && def.kind !== 'confront' && p.x > def.width - 260) {
      var others = w.players.filter(function (q) { return q !== p && !q.out && q.state !== 'ko'; });
      if (others.every(function (q) { return q.cpu || q.x > def.width - 360; })) { this.finish(); w.emit('exit', {}); return true; }
      this.objective = 'Aspetta il compagno all\'uscita';
      return true;
    }
    return false;
  };
  AreaRun.prototype.canExit = function () {
    if (this.kind === 'arena' || this.def.waves) return this.waveIdx >= (this.def.waves || []).length;
    if (this.def.needTalks && this.talkCount < this.def.needTalks) return false;
    if (this.def.needTalk && !this.talked[this.def.needTalk]) return false;
    if (this.def.midScene && !this.midDone) return false;
    return true;
  };
  AreaRun.prototype.tryExitInteract = function () {
    var def = this.def, w = this.world;
    if (def.busDrops) {
      // il cancello si apre solo quando il bus ha scaricato tutti i suoi skinhead e li hai messi giù tutti
      var dropped = this.busDropped || 0, tot2 = this.busTotal || 6, up = w.enemies.filter(function (e) { return e.busDrop && e.alive() && e.hp > 0; }).length;
      if (dropped < tot2 || up) { this.objective = 'Il bus dei Turnbull non molla: resisti e stendili tutti (' + (dropped - up) + ' / ' + tot2 + ')'; return; }
      var gx = def.exitInteract.x, near = w.enemies.filter(function (e) { return e.alive() && e.hp > 0 && Math.abs(e.x - gx) < 330; });
      if (near.length) { this.objective = 'Hai i Turnbull addosso: liberati di loro prima di spaccare la catena'; return; }
      // il cancello è chiuso con una catena: va spaccata a colpi, mentre il bus continua a girare
      if (this.t - (this.lockT || -9) < 0.32) return;
      this.lockT = this.t; this.lockHits = (this.lockHits || 0) + 1;
      w.emit('hit', { x: gx, y: def.exitInteract.y, z: 90, target: 'enemy', heavy: true, weapon: true });
      var need = def.busDrops.lockHits || 6;
      if (this.lockHits < need) { this.objective = 'Spacca la catena del cancello: ' + this.lockHits + ' / ' + need; return; }
      w.emit('clear', {});
    }
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
    if (this.tagAnim) { this.tagAnim.t += dt; if (this.tagAnim.t > 2.2) this.tagAnim = null; }
    if (this.tagToast) { this.tagToast.t += dt; if (this.tagToast.t > 4) this.tagToast = null; }
    if (W.TAG_AUTO && W.TAG_AUTO[this.def.id] && !this.def.arcade && this.world.flags[W.TAG_AUTO[this.def.id]] && W.Tags.add(this.def.id)) this.tagToast = { text: 'La W dei Warriors · ' + W.Tags.count() + ' / ' + W.Tags.total, t: 0 };
    var def = this.def, duo = w.duo(), self = this;
    this.checkGangIntro();
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
    if (def.kind === 'stealth') { this.stepStealth(w, dt); return 'play'; }
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
      var humans = all.filter(function (p) { return !p.cpu || p.qaHuman; });
      var zone = function (p) { return p.x > def.width - 200; };
      var inZone = all.length && all.every(zone);
      // i compagni CPU rimasti indietro non bloccano l'uscita: dopo 2,5 s con i giocatori nella zona si prosegue
      var humansIn = humans.length && humans.every(zone);
      if (inZone || humansIn) { this.exitT += dt; if (this.exitT >= (inZone ? C.EXIT_CONFIRM : 2.5)) { this.finish(); w.emit('exit', {}); } } else this.exitT = 0;
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
        if (wave.preScene && W.SCENES[wave.preScene] && (!wave.preIf || w.players.concat(w.npcs).some(function (q) { return (q.char ? q.char.id : q.id) === wave.preIf; }) || (wave.preIfRoster && W.Game.game.run && W.Game.game.run.roster.indexOf(wave.preIf) >= 0))) this.playScene(W.SCENES[wave.preScene]);
        if (wave.dropIf && w.flags[wave.dropIf]) this.queue.shift();
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
      // entrate diverse per banda: i Furies scavalcano la recinzione, i Turnbull saltano giù dall'alto, i Punks arrivano pattinando
      var set0 = e.def.set || '';
      if (/^fury/.test(set0)) { e.entry = 'vault'; e.x = s[1] === 'R' ? w.cam.x + C.VIEW_W - 140 - w.rng() * 90 : w.cam.x + 140 + w.rng() * 90; e.entryY = e.y; e.y = this.floor[0] - 4; }
      else if (/^turnbull/.test(set0) && this.kind !== 'escape') { e.entry = 'drop'; e.x = s[1] === 'R' ? w.cam.x + C.VIEW_W - 150 - w.rng() * 80 : w.cam.x + 150 + w.rng() * 80; e.z = 340; }
      else if (/^punk/.test(set0)) e.entry = 'skate';
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
    // il bus dei Turnbull è imprevedibile: a ogni passaggio sceglie a caso la corsia in alto o quella in basso
    var b = this.bus;
    if (this.def.busDrops && !this.finishing) {
      var up0 = w.enemies.filter(function (e) { return e.busDrop && e.alive() && e.hp > 0; }).length, dr0 = this.busDropped || 0, tt0 = this.busTotal || (typeof this.def.busDrops.total === 'object' ? this.def.busDrops.total.solo : this.def.busDrops.total);
      this.objective = dr0 >= tt0 && !up0 ? (this.lockHits ? 'Spacca la catena del cancello: ' + this.lockHits + ' / ' + (this.def.busDrops.lockHits || 6) : 'Via libera: corri al cancello e spacca la catena') : 'Il bus dei Turnbull non molla: stendi gli skinhead che scendono (' + (dr0 - up0) + ' / ' + tt0 + ')';
    }
    var lane = b.kind === 'train' ? [this.floor[1] - 46, this.floor[1]] : b.low ? [this.floor[1] - 60, this.floor[1]] : [this.floor[0], this.floor[0] + 60];
    b.lane = lane; b.t -= dt;
    if (b.phase === 'idle' && b.t <= 0) { if (b.kind !== 'train') { b.low = w.rng() < 0.5; lane = b.low ? [this.floor[1] - 60, this.floor[1]] : [this.floor[0], this.floor[0] + 60]; b.lane = lane; } b.phase = 'warn'; b.t = b.kind === 'train' ? 1.8 : 1.4; w.emit(b.kind === 'train' ? 'trainwarn' : 'horn', {}); }
    else if (b.phase === 'warn' && b.t <= 0) { b.phase = 'pass'; b.t = 1.3; b.x = w.cam.x - (b.kind === 'train' ? 900 : 800); b.hit = {}; if (b.kind === 'train') w.emit('train', {}); }
    else if (b.phase === 'pass') {
      b.x += (C.VIEW_W + (b.kind === 'train' ? 1800 : 1500)) / 1.3 * dt;
      w.players.forEach(function (p) {
        var len = b.kind === 'train' ? 900 : 780;
        if (!b.hit[p.uid] && p.hittable() && p.y >= lane[0] - 4 && p.y <= lane[1] && p.x > b.x && p.x < b.x + len) { b.hit[p.uid] = true; p.takeHit({ x: b.x, face: 1 }, { spec: { dmg: b.kind === 'train' ? 18 : 14, kd: true } }); }
      });
      // il bus travolge anche i Turnbull che ti stanno addosso: attirarli in corsia è una tattica
      if (b.kind === 'bus') w.enemies.forEach(function (e) {
        if (!b.hit['e' + e.uid] && e.alive() && e.hittable() && e.y >= lane[0] - 4 && e.y <= lane[1] && e.x > b.x && e.x < b.x + 780) {
          b.hit['e' + e.uid] = true; e.takeHit({ x: b.x, face: 1, isPlayer: false }, { spec: { dmg: 45, kd: true, heavy: true } }); w.emit('bushit', { x: e.x, y: e.y });
        }
      });
      if (b.t <= 0) {
        b.phase = 'idle'; b.t = (b.kind === 'train' ? 7 : 6) + w.rng() * 3;
        var bd = this.def.busDrops;
        if (bd && b.kind === 'bus') {
          // ritmo che cresce: più passa il tempo, più il bus torna in fretta
          var urg = this.timer !== null ? Math.max(0, Math.min(1, 1 - this.timer / (this.def.timer || 45))) : 0;
          b.t = bd.every[0] + w.rng() * bd.every[1] - urg * 1.5;
          // dal bus saltano giù gli skinhead, davanti e dietro di te
          var duo2 = w.players.filter(function (p) { return !p.cpu || p.qaHuman; }).length > 1;
          var alive = w.enemies.filter(function (e) { return e.alive() && e.busDrop; }).length;
          var tot = typeof bd.total === 'object' ? (duo2 ? bd.total.duo : bd.total.solo) : bd.total; this.busTotal = tot;
          var mA = typeof bd.maxAlive === 'object' ? (duo2 ? bd.maxAlive.duo : bd.maxAlive.solo) : bd.maxAlive;
          var n = Math.min((duo2 ? bd.duo : bd.solo), mA - alive, tot - (this.busDropped || 0));
          for (var k = 0; k < n; k++) {
            var side = (k + (this.busDropped || 0)) % 2 ? -1 : 1, fy = this.floor[0] + 30 + w.rng() * (this.floor[1] - this.floor[0] - 50);
            var e2 = new W.Enemy(w, (this.busDropped || 0) % 4 === 3 ? 'turnbull_heavy' : 'turnbull_rusher', Math.max(80, Math.min(this.def.width - 80, w.cam.x + C.VIEW_W / 2 + side * (260 + w.rng() * 180))), fy);
            e2.face = -side; e2.entry = 'drop'; e2.z = 340; e2.busDrop = true; e2.pursuer = true; w.enemies.push(e2);
            this.busDropped = (this.busDropped || 0) + 1;
          }
        }
      }
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

  // ------------------------------------------------------------------ minigioco del bagno (C6-02)
  // 1 nascondersi in un gabinetto; 2 silenzio mentre il pattinatore controlla le porte una a una;
  // 3 quando volta le spalle davanti alla tua porta, un attimo per colpire per primo (spruzzo in faccia).
  // Riuscito: il pattinatore è a terra e nella rissa successiva c'è un Punk in meno. Fallito: si combatte subito. Nessun blocco.
  AreaRun.prototype.setupStealth = function () {
    var w = this.world, f = this.floor;
    this.st = { phase: 'hide', t: 0, stall: -1, noise: 0, skX: -80, skDir: 1, target: 0, checking: 0, windowT: 0, result: null };
    var sk = new W.Npc(w, 'skater', 'punk', -80, f[0] + 60, 1); sk.name = 'Punk sui pattini'; sk.keep = true; sk.skates = true; sk.hidden = true; w.npcs.push(sk);
    this.skater = sk;
    // i compagni si nascondono da soli negli altri gabinetti
    w.npcs.forEach(function (n) { if (!n.crowd && n.id !== 'skater') { n.follow = null; } });
  };
  AreaRun.prototype.hideIn = function (p, i) {
    var st = this.st, w = this.world, def = this.def; if (st.phase !== 'hide') return;
    st.stall = i; p.hidden = true; p.x = def.stalls[i]; p.y = this.floor[0] + 24; p.setState('idle');
    w.players.forEach(function (q) { if (q !== p) { q.hidden = true; q.x = def.stalls[(i + 2) % def.stalls.length]; q.y = p.y; } });
    var others = def.stalls.map(function (x, k) { return k; }).filter(function (k) { return k !== i; });
    w.npcs.filter(function (n) { return !n.crowd && n.id !== 'skater'; }).forEach(function (n, k) { n.hidden = true; n.x = def.stalls[others[k % others.length]]; });
    st.phase = 'wait'; st.t = 0; this.objective = 'Silenzio. Non muoverti.';
    w.emit('open', { x: p.x, y: p.y });
  };
  AreaRun.prototype.stepStealth = function (w, dt) {
    var st = this.st, def = this.def, sk = this.skater, p = w.players.filter(function (q) { return !q.cpu; })[0] || w.players[0];
    var d = p.device || p.cpuCtl; st.t += dt;
    w.players.forEach(function (q) { if (q.hidden) { q.x = q.x; } });
    if (st.phase === 'hide') { if (st.t > 14) this.hideIn(p, 2); return; } // se il giocatore esita, si nasconde nel gabinetto centrale
    // rumore: muoversi o premere tasti nel gabinetto fa rumore
    if (st.phase === 'wait' || st.phase === 'patrol') {
      var moving = d && (d.axisX() || d.axisY());
      var press = d && (d.peek('light') || d.peek('heavy') || d.peek('jump') || d.peek('dodge'));
      if (press) { d.take('light'); d.take('heavy'); d.take('jump'); d.take('dodge'); }
      st.noise = Math.max(0, st.noise + (moving ? 0.9 * dt : 0) + (press ? 0.35 : 0) - 0.25 * dt);
      w.players.forEach(function (q) { q.x = def.stalls[st.stall]; if (q !== p) q.x = def.stalls[(st.stall + 2) % def.stalls.length]; });
      if (st.noise >= 1) return this.stealthResult(false, 'Ti ha sentito');
    }
    if (st.phase === 'wait' && st.t > 1.6) { st.phase = 'patrol'; sk.hidden = false; sk.x = -60; st.target = 0; st.checking = 0; w.emit('skate', {}); }
    if (st.phase === 'patrol') {
      var tx = def.stalls[st.target] + 70;
      if (st.checking > 0) {
        st.checking -= dt;
        sk.face = -1; // guarda la porta
        if (st.target === st.stall) {
          // davanti alla tua porta: si volta per controllare dietro di sé → attimo per colpire
          if (st.checking < 1.0 && st.checking > 0.1) { sk.face = 1; st.windowT += dt; this.objective = 'ORA! Premi {interact}'; if (d && d.take('interact')) return this.stealthResult(true); }
          if (st.checking <= 0.1) return this.stealthResult(false, 'Ha aperto la porta');
        } else if (d && d.take('interact')) return this.stealthResult(false, 'Troppo presto');
        if (st.checking <= 0) { w.emit('open', { x: def.stalls[st.target], y: sk.y }); st.target++; this.objective = 'Silenzio. Non muoverti.'; }
      } else {
        var dx = tx - sk.x; sk.face = dx > 0 ? 1 : -1;
        sk.x += Math.max(-260 * dt, Math.min(260 * dt, dx)); // scivola sui pattini
        if (Math.abs(dx) < 3) st.checking = st.target === st.stall ? 2.2 : 1.1;
        if (d && d.take('interact')) return this.stealthResult(false, 'Troppo presto');
      }
    }
    if (st.phase === 'done') { st.t2 = (st.t2 || 0) + dt; if (st.t2 > 1.4 && !this.finishing) this.finish(); }
  };
  AreaRun.prototype.stealthResult = function (ok, why) {
    var st = this.st, w = this.world, sk = this.skater, self = this;
    if (st.phase === 'done') return;
    st.phase = 'done'; st.t2 = 0; st.result = ok;
    w.players.forEach(function (q) { q.hidden = false; q.y = self.floor[0] + 60; });
    w.npcs.forEach(function (n) { if (!n.crowd) n.hidden = false; });
    // il colpo a sorpresa dipende dal Warrior che giochi; lo spruzzo resta sempre di Rembrandt, come nella storia
    var me = w.players.filter(function (q) { return !q.cpu; })[0] || w.players[0], myId = me.char.id;
    var MOVE = { swan: ['un diretto e un calcio che lo allontana', 'l3'], ajax: ['un gancio che lo mette giù', 'heavy'], snow: ['un calcio laterale', 'l3'],
      cowboy: ['un calcio basso e una spinta', 'l3'], cochise: ['un gancio in avanzamento', 'heavy'], vermin: ['una ginocchiata', 'heavy'], rembrandt: ['la bomboletta', null] };
    var rem = w.npcs.filter(function (n) { return n.id === 'rembrandt'; })[0];
    if (ok) {
      w.flags.skater_down = true; sk.pose = 'down';
      if (myId === 'rembrandt') {
        this.objective = 'Il Punk ti trascina fuori e ti blocca a terra: gli spruzzi la vernice negli occhi!';
        me.x = sk.x - 70; me.face = 1; me.startAttack('l1');
      } else {
        var mv = MOVE[myId] || ['un colpo secco', 'heavy'];
        me.x = sk.x - 70; me.y = sk.y; me.face = 1; me.startAttack(mv[1]);
        this.objective = (rem ? 'Il Punk blocca a terra Rembrandt, che gli spruzza la vernice negli occhi. ' : '') + me.char.name + ' esce con ' + mv[0] + '!';
        if (rem) { rem.x = sk.x + 80; rem.y = sk.y + 20; rem.face = -1; }
      }
      w.emit('hit', { x: sk.x, y: sk.y, z: 70, target: 'enemy', heavy: true });
      if (myId === 'rembrandt' || rem) { w.emit('spray', { x: sk.x, y: sk.y }); this.sprayFx = { x: sk.x, y: sk.y, t: 0 }; }
    } else {
      this.objective = (why || 'Scoperti') + '! Fuori tutti!'; w.emit('shakefx', { amt: 8 }); w.emit('horn', {});
    }
  };

  AreaRun.prototype.bossEnemy = function (w) {
    for (var i = 0; i < w.enemies.length; i++) if (w.enemies[i].def.elite && w.enemies[i].alive()) return w.enemies[i];
    return null;
  };
})();
