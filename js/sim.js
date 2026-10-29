// Simulazione a passo fisso: attori, colpi, prese, armi, oggetti, coordinatore nemici, KO e soccorso.
// Il renderer legge lo stato e consuma world.events; non modifica mai la salute.
'use strict';
var W = window.W;

(function () {
  var C = W.CFG;
  var nextId = 1;
  function uid() { return nextId++; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sign(v) { return v < 0 ? -1 : 1; }

  // ------------------------------------------------------------------ mondo
  function World(opts) {
    this.mode = opts.players.length > 1 || opts.cpu ? 'duo' : 'solo';
    this.humans = opts.players.length;
    this.diff = W.DIFFICULTY[opts.difficulty || 'normale'];
    this.time = 0;
    this.players = [];
    this.enemies = [];
    this.items = [];     // armi e recuperi a terra
    this.props = [];
    this.projectiles = [];
    this.events = [];
    this.attackers = 0; this.lastAttackEnd = -9;
    this.stats = { damageTaken: 0, maxCombo: 0, retries: 0, assisted: false, time: 0, kos: 0 };
    this.score = [0, 0];
    this.flags = {};
    this.cam = { x: 0, lockMax: null };
    this.prompt = null;
    this.debug = false;
    this.rng = mulberry(opts.seed || 7);
    for (var i = 0; i < opts.players.length; i++) this.players.push(new Player(this, opts.players[i], i, false));
    if (opts.cpu) this.players.push(new Player(this, { id: opts.cpu, device: null }, 1, true));
  }
  W.World = World;

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  World.prototype.emit = function (type, data) { data = data || {}; data.type = type; data.eid = uid(); data.t = this.time; this.events.push(data); };
  World.prototype.duo = function () { return this.players.length > 1; };
  World.prototype.alivePlayers = function () { return this.players.filter(function (p) { return p.state !== 'ko' && !p.out; }); };
  World.prototype.floor = function () { return this.area ? this.area.floor : [C.FLOOR_Y0, C.FLOOR_Y1]; };
  World.prototype.bounds = function () { return this.area ? [0, this.area.width] : [0, 2560]; };

  // collisione con props solidi: AABB su (x, y) del piano
  World.prototype.collide = function (a) {
    var f = this.floor(); a.y = clamp(a.y, f[0], f[1]);
    var b = this.bounds();
    var minX = b[0] + 30, maxX = b[1] - 30;
    if (a.isPlayer) { minX = Math.max(minX, this.cam.x + 30); maxX = Math.min(maxX, this.cam.x + C.VIEW_W - 30); }
    a.x = clamp(a.x, minX, maxX);
    if (a.z > 30) return; // in salto si passa sopra agli ostacoli bassi
    for (var i = 0; i < this.props.length; i++) {
      var p = this.props[i]; if (!p.solid) continue;
      var r = 18; // raggio piedi
      if (a.x > p.x0 - r && a.x < p.x1 + r && a.y > p.y0 - 6 && a.y < p.y1 + 6) {
        var dl = a.x - (p.x0 - r), dr = (p.x1 + r) - a.x, du = a.y - (p.y0 - 6), dd = (p.y1 + 6) - a.y;
        var m = Math.min(dl, dr, du, dd);
        if (m === dl) a.x = p.x0 - r; else if (m === dr) a.x = p.x1 + r; else if (m === du) a.y = p.y0 - 6; else a.y = p.y1 + 6;
      }
    }
  };

  // ------------------------------------------------------------------ colpi
  // Attacco: un ID e l'insieme dei bersagli già colpiti (Q01). Controllo di direzione, profondità e quota (Q02).
  function Attack(owner, moveId, spec) {
    this.id = uid(); this.owner = owner; this.move = moveId; this.spec = spec;
    this.phase = spec.prep > 0 ? 'prep' : 'act'; this.t = 0; this.hit = {}; this.contact = false; this.tick = 0;
  }
  W.Attack = Attack;

  function inReach(att, a, t, reach, ty) {
    var dx = (t.x - a.x) * a.face;
    if (dx < -14 || dx > reach) return false;
    if (Math.abs(t.y - a.y) > ty) return false;
    if (Math.abs((t.z || 0) - (a.z || 0)) > 70) return false;
    return true;
  }
  W.inReach = inReach;

  World.prototype.resolveAttack = function (a, att, targets) {
    var sp = att.spec, hits = 0;
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i];
      if (att.hit[t.uid] || !t.hittable()) continue;
      if (!inReach(att, a, t, sp.reach + (sp.weaponReach || 0), sp.ty)) continue;
      att.hit[t.uid] = true; hits++;
      t.takeHit(a, att);
    }
    if (hits > 0 && !att.contact) {
      att.contact = true;
      // durabilità: una sola volta per swing con almeno un contatto valido (Q05)
      if (att.weaponSwing && a.weapon) { a.weapon.dur -= 1; if (a.weapon.dur <= 0) { this.emit('break', { x: a.x, y: a.y, w: a.weapon.type }); a.weapon = null; } }
    }
    return hits;
  };

  // ------------------------------------------------------------------ attore base
  function Actor(world) {
    this.world = world; this.uid = uid();
    this.x = 0; this.y = 560; this.z = 0; this.vx = 0; this.vy = 0; this.vz = 0; this.face = 1;
    this.state = 'idle'; this.st = 0; this.protect = 0; this.recentHits = [];
    this.weapon = null; this.att = null; this.anim = 0;
  }
  Actor.prototype.setState = function (s) { this.state = s; this.st = 0; };
  Actor.prototype.hittable = function () { return this.protect <= 0 && ['down', 'getup', 'ko', 'dead', 'thrown', 'enter_hold'].indexOf(this.state) < 0 && !this.invuln(); };
  Actor.prototype.invuln = function () { return false; };

  // ------------------------------------------------------------------ giocatore
  function Player(world, spec, slot, cpu) {
    Actor.call(this, world);
    this.isPlayer = true; this.slot = slot; this.cpu = cpu; this.device = spec.device || null;
    this.setChar(spec.id);
    this.fury = 0; this.chainIdx = 0; this.chainOpen = -9; this.combo = 0; this.comboT = 0;
    this.dodgeStart = -9; this.grabbed = null; this.grabHits = 0; this.reviveT = 0; this.koT = 0; this.reviveProg = 0;
    this.exitHold = 0; this.out = false; this.ai = { t: 0, target: null };
  }
  Player.prototype = Object.create(Actor.prototype);
  W.Player = Player;

  Player.prototype.setChar = function (id) {
    this.char = W.rosterById(id); this.mods = W.statMods(this.char);
    this.maxhp = this.mods.hp; this.hp = this.maxhp;
  };
  Player.prototype.invuln = function () {
    if (this.state === 'dodge') return this.st >= C.DODGE.inv0 && this.st <= C.DODGE.inv1;
    return this.state === 'fury_sq' && this.att && this.att.phase === 'act';
  };
  Player.prototype.hittable = function () {
    if (this.state === 'grab' || this.state === 'grabhit') return this.protect <= 0;
    return Actor.prototype.hittable.call(this);
  };
  Player.prototype.canAct = function () { return ['idle', 'walk', 'run'].indexOf(this.state) >= 0; };

  Player.prototype.ctl = function () {
    if (this.cpu) return this.cpuCtl;
    return this.device;
  };

  Player.prototype.update = function (dt) {
    var w = this.world, d = this.ctl();
    this.st += dt; this.anim += dt; if (this.protect > 0) this.protect -= dt;
    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.combo = 0; }
    this.reviving = false;
    if (this.cpu) { this.thinkCpu(dt); d = this.cpuCtl; }
    if (!d) return;
    var ax = d.axisX(), ay = d.axisY();
    var spd = this.mods.spd;

    switch (this.state) {
      case 'idle': case 'walk': case 'run': {
        var running = d.runIntent && ax !== 0;
        var vx = ax * (running ? C.RUN.x : C.WALK.x) * spd, vy = ay * (running ? C.RUN.y : C.WALK.y) * spd;
        if (ax && ay) { vx *= 0.7071; vy *= 0.7071; }
        this.x += vx * dt; this.y += vy * dt;
        if (ax) this.face = ax;
        this.state = (ax || ay) ? (running ? 'run' : 'walk') : 'idle';
        this.handleActions(d, ax, ay, running);
        break;
      }
      case 'atk': case 'fury_sq': case 'grabhit': this.stepAttack(dt, d); break;
      case 'jump': this.stepJump(dt, d, ax, ay); break;
      case 'dodge': {
        if (this.st < C.DODGE.dur) { this.x += this.dvx * dt; this.y += this.dvy * dt; }
        else if (this.st >= C.DODGE.dur + C.DODGE.rec) this.setState('idle');
        break;
      }
      case 'grab': this.stepGrab(dt, d, ax, ay); break;
      case 'hurt': if (this.st > 0.25) this.setState('idle'); break;
      case 'down':
        if (this.st < 0.35) { this.x += this.vx * dt; this.vx *= 0.9; }
        if (this.st > 0.9) { this.setState('getup'); }
        break;
      case 'getup': if (this.st > 0.4) { this.setState('idle'); this.protect = C.GETUP_PROTECT; } break;
      case 'ko': this.koT += dt; break;
      case 'throwobj': if (this.st > 0.3) this.setState('idle'); break;
    }
    w.collide(this);
  };

  Player.prototype.handleActions = function (d, ax, ay, running) {
    var w = this.world;
    // soccorso: tenere premuto interazione vicino al compagno KO
    var buddy = this.buddy();
    if (buddy && buddy.state === 'ko' && !buddy.out && Math.abs(buddy.x - this.x) <= C.REVIVE.x && Math.abs(buddy.y - this.y) <= C.REVIVE.y) {
      if (d.isDown('interact')) {
        d.take('interact');
        buddy.reviveProg += 1 / 60; this.state = 'idle'; this.reviving = true;
        if (buddy.reviveProg >= C.REVIVE.hold) buddy.revive();
        return;
      }
    }
    this.reviving = false;
    if (d.take('fury') && this.fury >= 100) { this.fury = 0; this.startAttack('fury'); w.emit('fury', { x: this.x, y: this.y }); return; }
    if (d.take('jump')) { this.setState('jump'); this.jvx = ax * C.WALK.x * this.mods.spd * (running ? 1.3 : 1); this.jvy = ay * C.WALK.y * 0.6; this.z = 0; return; }
    if (d.take('dodge') && w.time - this.dodgeStart >= C.DODGE.cd) {
      this.dodgeStart = w.time; this.setState('dodge');
      var dx = ax, dy = ay; if (!dx && !dy) dx = -this.face;
      var n = Math.hypot(dx, dy); this.dvx = dx / n * C.DODGE.speed; this.dvy = dy / n * C.DODGE.speed * 0.6; return;
    }
    if (d.take('throw') && this.weapon) { this.throwWeapon(); return; }
    if (d.take('interact')) { this.interact(ax, ay); return; }
    if (d.take('heavy')) { this.startAttack('heavy'); return; }
    if (d.take('light')) {
      if (running) { this.startAttack('run'); return; }
      if (this.weapon && W.WEAPONS[this.weapon.type].throwOnly) { this.throwWeapon(); return; }
      var idx = (w.time <= this.chainOpen) ? this.chainIdx : 0;
      this.startAttack(['l1', 'l2', 'l3'][idx]); return;
    }
  };

  Player.prototype.buddy = function () { var ps = this.world.players; for (var i = 0; i < ps.length; i++) if (ps[i] !== this) return ps[i]; return null; };

  Player.prototype.startAttack = function (m) {
    var base = W.MOVES[m], sp = {}; for (var k in base) sp[k] = base[k];
    var a = this.mods.anim;
    if (m !== 'fury') { sp.prep *= a; sp.rec *= a; }
    var wpn = this.weapon && !W.WEAPONS[this.weapon.type].throwOnly ? W.WEAPONS[this.weapon.type] : null;
    sp.dmg = sp.dmg * this.mods.dmg;
    if (wpn && (m === 'l1' || m === 'l2' || m === 'l3' || m === 'heavy' || m === 'run')) {
      sp.dmg = (m === 'heavy' ? wpn.heavy : wpn.light) * this.mods.dmg * (m === 'l3' ? 1.15 : 1);
      sp.weaponReach = wpn.reach; sp.prep *= wpn.slow; sp.rec *= wpn.slow;
    }
    this.att = new Attack(this, m, sp);
    this.att.weaponSwing = !!wpn && m !== 'fury';
    if (m === 'l1') this.chainIdx = 0;
    this.curMove = m;
    this.setState(m === 'fury' ? 'fury_sq' : m === 'grabhit' ? 'grabhit' : 'atk');
  };

  Player.prototype.stepAttack = function (dt, d) {
    var att = this.att, sp = att.spec, w = this.world;
    att.t += dt;
    if (att.phase === 'prep' && att.t >= sp.prep) { att.phase = 'act'; att.t -= sp.prep; w.emit('swing', { x: this.x, y: this.y, heavy: !!sp.heavy || this.curMove === 'l3', weapon: att.weaponSwing }); }
    if (att.phase === 'act') {
      if (this.curMove === 'run') this.x += this.face * sp.lunge * dt / sp.act;
      if (this.curMove === 'fury') {
        // sequenza locale di tre colpi: un insieme di bersagli per ogni battuta
        var tick = Math.min(sp.ticks - 1, Math.floor(att.t / (sp.act / sp.ticks)));
        if (tick !== att.tick) { att.tick = tick; att.hit = {}; }
        var tsp = Object.assign({}, sp, { dmg: sp.dmg / sp.ticks, kd: tick === sp.ticks - 1 });
        var save = att.spec; att.spec = tsp; w.resolveAttack(this, att, w.enemies); att.spec = save;
        var ax = d.axisX(); if (ax) this.face = ax;
        this.x += this.face * 60 * dt;
      } else if (this.curMove === 'grabhit') {
        if (this.grabbed && !att.contact && this.grabbed.state === 'grabbed') {
          att.contact = true; this.grabbed.takeHit(this, att, true);
        }
      } else {
        w.resolveAttack(this, att, w.enemies);
      }
      if (att.t >= sp.act) { att.phase = 'rec'; att.t -= sp.act; }
    }
    if (att.phase === 'rec') {
      var left = sp.rec - att.t;
      var chainable = (this.curMove === 'l1' || this.curMove === 'l2') && att.contact;
      if (chainable && left <= C.CHAIN_LATE && d.peek('light')) {
        d.take('light'); this.startAttack(this.curMove === 'l1' ? 'l2' : 'l3'); this.chainIdx = this.curMove === 'l2' ? 1 : 2; return;
      }
      if (att.t >= sp.rec) {
        if (this.curMove === 'grabhit') {
          this.grabHits++;
          if (this.grabbed && this.grabbed.state === 'grabbed' && this.grabHits < 2) { this.setState('grab'); this.st = this.grabSt; }
          else { this.releaseGrab(); this.setState('idle'); }
          return;
        }
        if (chainable) { this.chainIdx = this.curMove === 'l1' ? 1 : 2; this.chainOpen = w.time + C.CHAIN_AFTER; }
        else { this.chainIdx = 0; this.chainOpen = -9; } // un colpo a vuoto conclude la progressione
        this.att = null; this.setState('idle');
      }
    }
  };

  Player.prototype.stepJump = function (dt, d, ax, ay) {
    var T = C.JUMP_T, t = this.st;
    this.z = Math.max(0, 4 * C.JUMP_APEX * (t / T) * (1 - t / T));
    this.x += this.jvx * dt; this.y += this.jvy * dt;
    if (ax) this.face = ax;
    if (!this.att && t > T * 0.45 && (d.take('light') || d.take('heavy'))) {
      var sp = Object.assign({}, W.MOVES.air); sp.dmg *= this.mods.dmg;
      this.att = new Attack(this, 'air', sp); this.curMove = 'air';
    }
    if (this.att) {
      this.att.t += dt;
      if (this.att.t <= this.att.spec.act) this.world.resolveAttack(this, this.att, this.world.enemies);
    }
    if (t >= T) { this.z = 0; this.att = null; this.setState('idle'); this.st = 0; this.landLag = 0.08; }
  };

  // priorità: soccorso → uscita → arma ai piedi → oggetto → nemico vulnerabile
  Player.prototype.interact = function (ax, ay) {
    var w = this.world;
    var it = w.nearestItem(this);
    if (it) { if (w.pickup(this, it)) return; }
    var pr = w.nearestProp(this);
    if (pr) { w.useProp(this, pr); return; }
    var e = w.grabCandidate(this);
    if (e) { this.startGrab(e); return; }
  };

  Player.prototype.startGrab = function (e) {
    this.grabbed = e; this.grabHits = 0; this.grabSt = 0; e.setState('grabbed'); e.grabber = this;
    if (e.att) { e.dropToken(); e.att = null; }
    this.face = sign(e.x - this.x); e.face = -this.face;
    e.x = this.x + this.face * 40; e.y = this.y;
    this.setState('grab');
    // presa valida disarma
    if (e.weapon) e.disarm();
  };
  Player.prototype.stepGrab = function (dt, d, ax) {
    this.grabSt = this.st;
    var e = this.grabbed;
    if (!e || e.state !== 'grabbed') { this.releaseGrab(); this.setState('idle'); return; }
    e.x = this.x + this.face * 40; e.y = this.y;
    if (this.st > C.GRAB_MAX * this.mods.grip) { this.releaseGrab(); this.setState('idle'); return; }
    if (d.take('light') && this.grabHits < 2) { this.startAttack('grabhit'); return; }
    if (d.take('interact') || d.take('heavy')) {
      if (ax) { this.face = ax; this.throwEnemy(e); } else { this.releaseGrab(); this.setState('idle'); }
    }
  };
  Player.prototype.releaseGrab = function () {
    var e = this.grabbed; this.grabbed = null;
    if (e && e.state === 'grabbed') { e.setState('hurt'); e.grabber = null; e.x += this.face * 20; }
  };
  Player.prototype.throwEnemy = function (e) {
    this.grabbed = null; e.grabber = null;
    var dmg = W.MOVES.throw.dmg * this.mods.dmg;
    e.thrownBy = this; e.thrownHit = {}; e.setState('thrown'); e.vx = this.face * 520; e.vz = 260; e.z = 10; e.face = -this.face;
    e.damage(dmg, this, true);
    this.world.emit('throw', { x: e.x, y: e.y });
    this.setState('throwobj');
  };
  Player.prototype.throwWeapon = function () {
    var wpn = this.weapon; this.weapon = null;
    var def = W.WEAPONS[wpn.type];
    wpn.dur -= def.throwOnly ? 1 : 2;
    this.world.projectiles.push({ uid: uid(), kind: 'weapon', w: wpn, x: this.x + this.face * 30, y: this.y, z: 60, vx: this.face * 640, owner: this, hit: {}, t: 0, dmg: (def.throwOnly ? def.light : 12) * this.mods.dmg });
    this.world.emit('toss', { x: this.x, y: this.y });
    this.setState('throwobj');
  };

  Player.prototype.takeHit = function (from, att) {
    var w = this.world, sp = att.spec;
    var dmg = sp.dmg * w.diff.edmg;
    this.hp = Math.max(0, this.hp - dmg); w.stats.damageTaken += dmg;
    w.emit('hit', { x: this.x, y: this.y, z: 70, target: 'player', heavy: !!sp.heavy, weapon: !!sp.weapon });
    if (this.grabbed) this.releaseGrab();
    this.att = null; this.combo = 0;
    if (this.hp <= 0) { this.knockOut(from); return; }
    if (sp.heavy && this.weapon && !W.WEAPONS[this.weapon.type].throwOnly) { w.dropWeapon(this.weapon, this.x - from.face * -30, this.y); this.weapon = null; }
    this.recentHits = this.recentHits.filter(function (t) { return w.time - t < C.DOUBLE_HIT_WINDOW; });
    this.recentHits.push(w.time);
    this.face = sign(from.x - this.x);
    if (sp.kd || this.recentHits.length >= 2) { this.recentHits = []; this.setState('down'); this.vx = -this.face * 160; this.z = 0; }
    else { this.setState('hurt'); this.x -= this.face * 14; this.protect = C.HURT_PROTECT; }
  };
  Player.prototype.knockOut = function () {
    var w = this.world; this.setState('ko'); this.koT = 0; this.reviveProg = 0; this.z = 0; this.att = null;
    if (this.weapon) { w.dropWeapon(this.weapon, this.x, this.y); this.weapon = null; }
    w.emit('ko', { x: this.x, y: this.y, player: this.slot });
  };
  Player.prototype.revive = function () {
    this.hp = Math.round(this.maxhp * C.REVIVE.hp); this.setState('getup'); this.protect = C.REVIVE.protect + 0.4; this.reviveProg = 0;
    this.world.score[this.buddy().cpu ? 0 : this.buddy().slot] += 150;
    this.world.emit('revive', { x: this.x, y: this.y });
  };
  Player.prototype.gainHit = function (pts) {
    this.fury = Math.min(100, this.fury + C.FURY_GAIN_HIT);
    this.combo++; this.comboT = 1.2;
    var w = this.world; if (this.combo > w.stats.maxCombo) w.stats.maxCombo = this.combo;
    var mult = Math.min(3, 1 + Math.floor(this.combo / 5) * 0.5);
    w.score[this.cpu ? 0 : this.slot] += Math.round(pts * mult);
  };

  // ------------------------------------------------------------------ CPU compagno
  // Segue a 90–180, entra in un proprio slot, soccorre quando sicuro. Non usa porte e non spreca kit.
  function CpuCtl() { this.ax = 0; this.ay = 0; this.buf = {}; this.runIntent = false; this.downK = {}; }
  CpuCtl.prototype.axisX = function () { return this.ax; };
  CpuCtl.prototype.axisY = function () { return this.ay; };
  CpuCtl.prototype.take = function (a) { if (this.buf[a]) { this.buf[a] = false; return true; } return false; };
  CpuCtl.prototype.peek = function (a) { return !!this.buf[a]; };
  CpuCtl.prototype.isDown = function (a) { return !!this.downK[a]; };
  CpuCtl.prototype.press = function (a) { this.buf[a] = true; };
  CpuCtl.prototype.clear = function () { this.buf = {}; };

  Player.prototype.thinkCpu = function (dt) {
    var c = this.cpuCtl || (this.cpuCtl = new CpuCtl()), w = this.world, ai = this.ai;
    c.ax = 0; c.ay = 0; c.downK = {};
    if (this.state === 'ko') return;
    ai.t -= dt;
    var lead = this.buddy();
    // soccorso se il leader è KO e nessun nemico in attacco vicino
    if (lead && lead.state === 'ko' && !lead.out) {
      var danger = w.enemies.some(function (e) { return e.att && e.att.phase !== 'rec' && Math.abs(e.x - lead.x) < 140; });
      if (!danger) { this.moveToward(c, lead.x - 30 * sign(lead.x - this.x || 1), lead.y, 6); if (Math.abs(lead.x - this.x) < 55 && Math.abs(lead.y - this.y) < 24) c.downK.interact = true; return; }
    }
    if (this.grabbed) { if (ai.t <= 0) { c.press('light'); ai.t = 0.3; } return; }
    var foe = null, best = 1e9;
    for (var i = 0; i < w.enemies.length; i++) {
      var e = w.enemies[i]; if (!e.alive() || !e.onScreen()) continue;
      var dd = Math.abs(e.x - this.x) + Math.abs(e.y - this.y) * 2;
      if (dd < best) { best = dd; foe = e; }
    }
    if (foe && best < 520) {
      // evita il pericolo: se il nemico telegrafa davanti, si sposta in profondità
      if (foe.att && foe.att.phase === 'prep' && Math.abs(foe.y - this.y) < 30 && Math.abs(foe.x - this.x) < 140) {
        c.ay = this.y < 560 ? 1 : -1; if (ai.t <= 0 && this.world.rng() < 0.3) { c.press('dodge'); ai.t = 0.6; } return;
      }
      var side = sign(this.x - foe.x || 1);
      var tx = foe.x + side * 70, ty = foe.y;
      if (Math.abs(this.x - tx) > 14 || Math.abs(this.y - ty) > 10) this.moveToward(c, tx, ty, 8);
      else this.face = -side;
      if (Math.abs(this.x - foe.x) < 95 && Math.abs(this.y - foe.y) < 22 && ai.t <= 0 && this.canAct()) {
        this.face = sign(foe.x - this.x);
        if (this.fury >= 100 && w.rng() < 0.5) c.press('fury');
        else c.press(w.rng() < 0.2 ? 'heavy' : 'light');
        ai.t = 0.22 + w.rng() * 0.15;
      } else if (this.state === 'atk' && this.att && this.att.contact) c.press('light');
      return;
    }
    // uscita aperta e leader nella zona: la CPU raggiunge il gruppo (non apre porte da sola)
    if (lead && w.exitOpen && lead.x > w.area.width - 200) { this.moveToward(c, w.area.width - 110, lead.y + 30, 10); return; }
    if (lead) {
      var dx = lead.x - this.x;
      if (Math.abs(dx) > 180 || Math.abs(lead.y - this.y) > 60) this.moveToward(c, lead.x - sign(dx) * 110, lead.y + 30, 12);
    }
  };
  Player.prototype.moveToward = function (c, tx, ty, tol) {
    if (Math.abs(tx - this.x) > tol) c.ax = sign(tx - this.x);
    if (Math.abs(ty - this.y) > tol) c.ay = sign(ty - this.y);
    steerAround(this, c);
  };
  // aggira un oggetto solido sulla traiettoria scegliendo il lato libero più vicino (Q08)
  function steerAround(a, c) {
    if (!c.ax) return;
    var ps = a.world.props;
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i]; if (!p.solid) continue;
      var ahead = c.ax > 0 ? p.x0 - a.x : a.x - p.x1;
      if (ahead < -20 || ahead > 70 || a.y < p.y0 - 30 || a.y > p.y1 + 30) continue;
      var f = a.world.floor();
      var upRoom = p.y0 - f[0], downRoom = f[1] - p.y1;
      var goUp = (a.y - p.y0 < p.y1 - a.y && upRoom > 40) || downRoom <= 40;
      c.ay = goUp ? -1 : 1;
      if (ahead < 25) c.ax = 0;
      return;
    }
  }
  W.steerAround = steerAround;

  // ------------------------------------------------------------------ nemico
  function Enemy(world, type, x, y) {
    Actor.call(this, world);
    this.type = type; this.def = W.ENEMIES[type];
    this.maxhp = Math.round(this.def.hp * world.diff.ehp); this.hp = this.maxhp;
    this.x = x; this.y = y; this.face = -1;
    this.weapon = this.def.weapon ? { type: this.def.weapon, dur: 99 } : null;
    this.disarmed = false; this.slot = null; this.target = null; this.think = 0.3 + world.rng() * 0.4;
    this.progressT = 0; this.lastDist = 1e9; this.offT = 0; this.altSlot = 0; this.hasToken = false; this.combo2 = false;
    this.setState('enter');
  }
  Enemy.prototype = Object.create(Actor.prototype);
  W.Enemy = Enemy;
  Enemy.prototype.alive = function () { return this.state !== 'dead'; };
  Enemy.prototype.onScreen = function () { var c = this.world.cam.x; return this.x > c + 20 && this.x < c + C.VIEW_W - 20; };
  Enemy.prototype.phase = function () { var r = this.hp / this.maxhp; return r > 0.6 ? 0 : r > 0.25 ? 1 : 2; };

  Enemy.prototype.update = function (dt) {
    var w = this.world;
    this.st += dt; this.anim += dt; if (this.protect > 0) this.protect -= dt;
    switch (this.state) {
      case 'enter': {
        // entrata visibile: cammina dentro lo schermo prima di poter attaccare
        var c = w.cam.x, inX = clamp(this.x, c + 90, c + C.VIEW_W - 90);
        this.x += sign(inX - this.x) * Math.min(Math.abs(inX - this.x), 200 * dt);
        this.face = sign(inX - this.x || -this.face);
        if (Math.abs(inX - this.x) < 2 || this.st > 3) this.setState('approach');
        break;
      }
      case 'approach': this.stepApproach(dt); break;
      case 'atk': this.stepAttack(dt); break;
      case 'hurt': if (this.st > 0.32) this.setState('approach'); break;
      case 'grabbed': if (!this.grabber || this.grabber.state === 'ko') this.setState('hurt'); break;
      case 'thrown': {
        this.x += this.vx * dt; this.vz -= 900 * dt; this.z = Math.max(0, this.z + this.vz * dt);
        // il corpo lanciato urta un altro nemico una sola volta
        for (var i = 0; i < w.enemies.length; i++) {
          var o = w.enemies[i];
          if (o === this || !o.alive() || this.thrownHit[o.uid] || !o.hittable()) continue;
          if (Math.abs(o.x - this.x) < 50 && Math.abs(o.y - this.y) < 30) {
            this.thrownHit[o.uid] = true;
            o.takeHit(this.thrownBy, { spec: { dmg: W.MOVES.throw.dmg, kd: true, push: 120 }, id: uid() }, false, this);
          }
        }
        var b = w.bounds();
        if (this.x < b[0] + 30 || this.x > b[1] - 30) { this.vx = -this.vx * 0.3; this.x = clamp(this.x, b[0] + 30, b[1] - 30); }
        if (this.z <= 0 && this.st > 0.1) { this.setState(this.hp <= 0 ? 'dead' : 'down'); this.vx = 0; if (this.hp <= 0) this.onDeath(); }
        break;
      }
      case 'down':
        if (this.st < 0.35) { this.x += this.vx * dt; this.vx *= 0.88; }
        if (this.st > 1.0) { if (this.hp <= 0) { this.setState('dead'); this.onDeath(); } else this.setState('getup'); }
        break;
      case 'getup': if (this.st > 0.45) { this.setState('approach'); this.protect = C.GETUP_PROTECT; } break;
      case 'dead': this.fade = (this.fade || 0) + dt; break;
    }
    if (this.state !== 'thrown' && this.state !== 'dead') w.collide(this);
  };

  Enemy.prototype.pickTarget = function () {
    var ps = this.world.alivePlayers(), best = null, bd = 1e9;
    for (var i = 0; i < ps.length; i++) { var d = Math.abs(ps[i].x - this.x) + Math.abs(ps[i].y - this.y); if (d < bd) { bd = d; best = ps[i]; } }
    return best;
  };

  Enemy.prototype.stepApproach = function (dt) {
    var w = this.world;
    this.think -= dt;
    if (!this.target || this.target.state === 'ko' || this.think <= 0) { this.target = this.pickTarget(); this.think = 0.8 + w.rng() * 0.6; }
    var t = this.target; if (!t) return;
    var atk = this.atkSpec();
    // slot di fianco/fronte rispetto al bersaglio
    var side = this.slotSide || (this.slotSide = (this.x < t.x ? -1 : 1));
    var wantsToken = w.requestToken(this, false);
    var dist = wantsToken ? atk.reach * 0.75 : 190 + (this.uid % 3) * 25;
    var yOff = wantsToken ? 0 : ((this.uid % 3) - 1) * 40 + this.altSlot * 50;
    var tx = t.x + side * dist, ty = t.y + yOff;
    var dx = tx - this.x, dy = ty - this.y;
    var sp = this.def.speed * (this.disarmed ? 1.05 : 1);
    var mvx = Math.abs(dx) > 8 ? sign(dx) * 170 * sp : 0, mvy = Math.abs(dy) > 6 ? sign(dy) * 115 * sp : 0;
    this.x += mvx * dt; this.y += mvy * dt;
    // separazione morbida fra nemici (collider morbidi attore/attore)
    for (var i = 0; i < w.enemies.length; i++) {
      var o = w.enemies[i]; if (o === this || !o.alive()) continue;
      var ox = this.x - o.x, oy = this.y - o.y;
      if (Math.abs(ox) < 50 && Math.abs(oy) < 20) { this.x += (ox === 0 ? 1 : sign(ox)) * 60 * dt; this.y += (oy === 0 ? 1 : sign(oy)) * 40 * dt; }
    }
    this.face = sign(t.x - this.x);
    if (side === 1 && t.x > this.x + 10) this.slotSide = -1; // aggirato: cambia lato
    if (side === -1 && t.x < this.x - 10) this.slotSide = 1;
    // blocco: dopo 3 s senza avvicinamento tenta un percorso alternativo, dopo 8 s fuori vista rientra
    var d = Math.abs(dx) + Math.abs(dy);
    if (d < this.lastDist - 4) { this.progressT = 0; this.lastDist = d; } else this.progressT += dt;
    if (this.progressT > C.STUCK_REPATH) { this.altSlot = this.altSlot ? -this.altSlot : (w.rng() < 0.5 ? -1 : 1); this.progressT = 0; this.lastDist = 1e9; if (w.debug) console.log('[ai] repath', this.uid); }
    if (!this.onScreen()) this.offT += dt; else this.offT = 0;
    if (this.offT > C.STUCK_RESPAWN) { this.respawnSafe(); }
    // attacco solo se in portata, visibile e con il permesso del coordinatore
    if (wantsToken && Math.abs(t.x - this.x) <= atk.reach * 0.9 && Math.abs(t.y - this.y) <= atk.ty * 0.8 && this.onScreen() && t.state !== 'ko') {
      if (w.requestToken(this, true)) this.startAttack();
    }
  };
  Enemy.prototype.respawnSafe = function () {
    var w = this.world, c = w.cam.x, f = w.floor();
    var left = w.players[0] && w.players[0].x > c + C.VIEW_W / 2;
    this.x = left ? c + 40 : c + C.VIEW_W - 40; this.y = (f[0] + f[1]) / 2; this.offT = 0; this.progressT = 0;
    this.setState('enter');
    if (w.debug) console.log('[ai] respawn', this.uid);
  };

  Enemy.prototype.atkSpec = function () {
    if (this.disarmed || !this.weapon) return W.ENEMIES.fury_flanker.atk;
    return this.def.atk;
  };
  Enemy.prototype.startAttack = function () {
    var a = this.atkSpec(), w = this.world;
    var heavy = !!this.weapon && (this.def.elite ? (this.phase() >= 1 && w.rng() < 0.5) : w.rng() < 0.3);
    var sp = { prep: a.prep * (heavy ? 1.2 : 1), act: a.act, rec: a.rec, reach: a.reach, ty: a.ty, dmg: heavy ? this.def.heavyDmg : (this.weapon ? this.def.dmg + 2 : (this.def.weapon ? 8 : this.def.dmg)), heavy: heavy, kd: heavy, weapon: !!this.weapon, push: heavy ? 160 : 40 };
    this.att = new Attack(this, heavy ? 'eheavy' : 'elight', sp);
    // fase combinazione dell'élite: secondo colpo legato
    this.combo2 = this.def.elite && this.phase() >= 1 && !heavy;
    this.face = sign(this.target.x - this.x);
    this.setState('atk');
  };
  Enemy.prototype.stepAttack = function (dt) {
    var att = this.att, sp = att.spec, w = this.world;
    att.t += dt;
    if (att.phase === 'prep' && att.t >= sp.prep) { att.phase = 'act'; att.t -= sp.prep; w.emit('swing', { x: this.x, y: this.y, heavy: sp.heavy, weapon: sp.weapon, enemy: true }); }
    if (att.phase === 'act') { w.resolveAttack(this, att, w.players); if (att.t >= sp.act) { att.phase = 'rec'; att.t -= sp.act; } }
    if (att.phase === 'rec' && att.t >= sp.rec) {
      if (this.combo2) { this.combo2 = false; var s2 = Object.assign({}, sp, { prep: 0.32, dmg: sp.dmg }); this.att = new Attack(this, 'elight2', s2); return; }
      this.att = null; this.dropToken(); this.setState('approach');
      // pressione: nella fase finale l'attesa fra gli attacchi si accorcia, le telegraph no
      this.think = this.def.elite && this.phase() === 2 ? 0.1 : 0.4;
    }
  };
  Enemy.prototype.dropToken = function () { if (this.hasToken) { this.hasToken = false; this.world.attackers--; this.world.lastAttackEnd = this.world.time; } };

  Enemy.prototype.takeHit = function (from, att, fromGrab, body) {
    var w = this.world, sp = att.spec;
    var wasRecover = this.state === 'atk' && this.att && this.att.phase === 'rec';
    var dmg = sp.dmg;
    // l'élite non viene presa e resta disarmabile solo nei recuperi
    this.damage(dmg, from, false);
    w.emit('hit', { x: this.x, y: this.y, z: 70, target: 'enemy', heavy: !!sp.heavy || !!sp.kd, weapon: !!att.weaponSwing });
    if (from && from.gainHit) from.gainHit(sp.dmg * 4);
    if (this.att) { this.att = null; this.dropToken(); }
    // disarmo: pesante sulla ripresa (o presa valida) fa cadere la mazza una sola volta
    if (this.weapon && (sp.heavy && wasRecover)) this.disarm();
    if (fromGrab) { if (this.hp <= 0) { this.grabber && this.grabber.releaseGrab(); this.setState('down'); } return; }
    if (from) this.face = sign(from.x - this.x);
    var kd = sp.kd || this.hp <= 0;
    var push = sp.push || 40;
    if (kd) { this.setState('down'); this.vx = -this.face * push * 1.4; this.z = 0; }
    else { this.setState('hurt'); this.x -= this.face * push * 0.25; }
  };
  Enemy.prototype.damage = function (dmg, from, quiet) {
    var was = this.hp; this.hp = Math.max(0, this.hp - dmg);
    if (was > 0 && this.hp <= 0 && from && from.isPlayer) {
      from.fury = Math.min(100, from.fury + C.FURY_GAIN_KO);
      this.world.score[from.cpu ? 0 : from.slot] += this.def.elite ? 1500 : 300;
      this.world.stats.kos++;
    }
  };
  Enemy.prototype.disarm = function () {
    if (!this.weapon || this.disarmed) return;
    var w = this.world;
    w.dropWeapon({ type: this.weapon.type, dur: W.WEAPONS[this.weapon.type].dur }, this.x + this.face * 40, this.y + 8);
    this.weapon = null; this.disarmed = true;
    w.flags.disarmed = (w.flags.disarmed || 0) + 1;
    w.emit('disarm', { x: this.x, y: this.y });
  };
  Enemy.prototype.onDeath = function () { this.dropToken(); this.world.emit('defeat', { x: this.x, y: this.y }); };
  Enemy.prototype.hittable = function () {
    if (this.state === 'enter' && !this.onScreen()) return false;
    return Actor.prototype.hittable.call(this) && this.hp > 0;
  };

  // ------------------------------------------------------------------ coordinatore
  World.prototype.requestToken = function (e, commit) {
    if (e.hasToken) return true;
    var max = C.MAX_ATTACKERS[this.duo() ? 1 : 0];
    if (this.attackers >= max) return false;
    if (this.time - this.lastAttackEnd < C.ATTACK_GAP) return false;
    // il permesso va al nemico più vicino al suo bersaglio
    var mine = Math.abs(e.x - (e.target ? e.target.x : e.x));
    for (var i = 0; i < this.enemies.length; i++) {
      var o = this.enemies[i]; if (o === e || o.state !== 'approach' || o.hasToken || !o.target) continue;
      if (Math.abs(o.x - o.target.x) + 0.5 < mine - 40) return false;
    }
    if (commit) { e.hasToken = true; this.attackers++; }
    return true;
  };

  // ------------------------------------------------------------------ oggetti
  World.prototype.dropWeapon = function (wpn, x, y) {
    var ws = this.items.filter(function (i) { return i.kind === 'weapon'; });
    if (ws.length >= C.MAX_WEAPON_PICKUPS) {
      // pulizia del più vecchio fuori vista
      var c = this.cam.x, old = ws.filter(function (i) { return i.x < c || i.x > c + C.VIEW_W; })[0] || ws[0];
      this.items.splice(this.items.indexOf(old), 1);
    }
    var f = this.floor();
    this.items.push({ uid: uid(), kind: 'weapon', w: wpn, x: x, y: clamp(y, f[0], f[1]), t: 0 });
  };
  World.prototype.nearestItem = function (p) {
    var best = null, bd = 1e9;
    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i];
      if (Math.abs(it.x - p.x) > C.INTERACT.x || Math.abs(it.y - p.y) > C.INTERACT.y) continue;
      var d = Math.abs(it.x - p.x);
      if (it.kind === 'weapon') d -= 1000; // l'arma ai piedi ha priorità sugli altri oggetti
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  };
  World.prototype.pickup = function (p, it) {
    if (it.kind === 'weapon') {
      if (p.weapon) this.dropWeapon(p.weapon, p.x - p.face * 20, p.y);
      p.weapon = it.w; this.items.splice(this.items.indexOf(it), 1);
      this.emit('pickup', { x: p.x, y: p.y, what: W.WEAPONS[it.w.type].name }); return true;
    }
    var def = W.PICKUPS[it.kind];
    if (p.hp >= p.maxhp) { this.emit('full', { x: p.x, y: p.y }); return false; }
    p.hp = Math.min(p.maxhp, p.hp + def.hp);
    this.items.splice(this.items.indexOf(it), 1);
    this.emit('heal', { x: p.x, y: p.y, amt: def.hp });
    return true;
  };
  World.prototype.nearestProp = function (p) {
    for (var i = 0; i < this.props.length; i++) {
      var pr = this.props[i]; if (!pr.use || pr.used) continue;
      var cx = (pr.x0 + pr.x1) / 2;
      if (Math.abs(cx - p.x) <= C.INTERACT.x && p.y - pr.y1 <= C.INTERACT.y + 10 && p.y >= pr.y0 - 10) return pr;
    }
    return null;
  };
  World.prototype.useProp = function (p, pr) {
    pr.used = true;
    var cx = (pr.x0 + pr.x1) / 2;
    for (var i = 0; i < pr.contents.length; i++) this.items.push({ uid: uid(), kind: pr.contents[i], x: cx + (i - (pr.contents.length - 1) / 2) * 34, y: pr.y1 + 16, t: 0 });
    this.emit('open', { x: cx, y: pr.y1 });
  };
  World.prototype.grabCandidate = function (p) {
    for (var i = 0; i < this.enemies.length; i++) {
      var e = this.enemies[i];
      if (!e.alive() || e.def.elite || ['approach', 'hurt', 'atk'].indexOf(e.state) < 0) continue;
      if (e.state === 'atk' && e.att && e.att.phase !== 'rec') continue; // vulnerabile: non mentre colpisce
      if (Math.abs(e.x - p.x) > C.GRAB.x || Math.abs(e.y - p.y) > C.GRAB.y) continue;
      if (sign(e.x - p.x) !== p.face) continue;
      return e;
    }
    return null;
  };
  // prompt stabile mostrato prima della pressione
  World.prototype.promptFor = function (p) {
    var b = p.buddy && p.buddy();
    if (b && b.state === 'ko' && Math.abs(b.x - p.x) <= C.REVIVE.x && Math.abs(b.y - p.y) <= C.REVIVE.y) return 'Tieni premuto: soccorri ' + b.char.name;
    if (this.exitOpen && p.x > this.area.width - 260) return 'Uscita';
    var it = this.nearestItem(p);
    if (it) return it.kind === 'weapon' ? 'Raccogli ' + W.WEAPONS[it.w.type].name : (p.hp >= p.maxhp ? W.PICKUPS[it.kind].name + ' (salute piena)' : W.PICKUPS[it.kind].name + ' +' + W.PICKUPS[it.kind].hp);
    var pr = this.nearestProp(p); if (pr) return pr.label;
    if (p.state === 'grab') return 'Leggero: colpo · Direzione+presa: lancia · Presa: rilascia';
    if (this.grabCandidate(p)) return 'Presa';
    return null;
  };

  // ------------------------------------------------------------------ proiettili (armi lanciate)
  World.prototype.stepProjectiles = function (dt) {
    for (var i = this.projectiles.length - 1; i >= 0; i--) {
      var pr = this.projectiles[i]; pr.t += dt; pr.x += pr.vx * dt; pr.z = Math.max(0, 60 - pr.t * pr.t * 140);
      var done = false;
      for (var j = 0; j < this.enemies.length; j++) {
        var e = this.enemies[j];
        if (pr.hit[e.uid] || !e.hittable()) continue;
        if (Math.abs(e.x - pr.x) < 40 && Math.abs(e.y - pr.y) < 30) {
          pr.hit[e.uid] = true;
          e.takeHit(pr.owner, { spec: { dmg: pr.dmg, kd: true, push: 120 }, id: uid() });
          done = true; break;
        }
      }
      var b = this.bounds();
      if (done || pr.t > 0.55 || pr.x < b[0] || pr.x > b[1]) {
        this.projectiles.splice(i, 1);
        var def = W.WEAPONS[pr.w.type];
        if (def.throwOnly || pr.w.dur <= 0) this.emit('break', { x: pr.x, y: pr.y, w: pr.w.type });
        else this.dropWeapon(pr.w, clamp(pr.x, b[0] + 40, b[1] - 40), pr.y);
      }
    }
  };

  // ------------------------------------------------------------------ passo
  World.prototype.step = function (dt) {
    this.time += dt; this.stats.time += dt;
    var i;
    for (i = 0; i < this.players.length; i++) this.players[i].update(dt);
    for (i = 0; i < this.enemies.length; i++) this.enemies[i].update(dt);
    this.stepProjectiles(dt);
    for (i = 0; i < this.items.length; i++) this.items[i].t += dt;
    this.enemies = this.enemies.filter(function (e) { return !(e.state === 'dead' && e.fade > 1.2); });
    this.stepKO(dt);
    if (this.area) this.area.step(this, dt);
    this.stepCamera(dt);
  };

  World.prototype.stepKO = function (dt) {
    var ps = this.players, up = ps.filter(function (p) { return p.state !== 'ko' && !p.out; });
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i]; if (p.state !== 'ko' || p.out) continue;
      // il danno subito interrompe il soccorso conservando al massimo 0,8 s
      var helper = p.buddy();
      if (!helper || !helper.reviving) p.reviveProg = Math.max(0, Math.min(p.reviveProg, C.REVIVE.keep) - dt * 0.5);
      if (p.koT > this.diff.revive && up.length > 0) { p.out = true; this.emit('out', { player: p.slot }); }
    }
    // nessun umano in piedi o in attesa di soccorso: la CPU non prosegue da sola → retry
    var humanAlive = ps.some(function (p) { return (!p.cpu || p.qaHuman) && !p.out; });
    if (up.length === 0 || !humanAlive) this.failed = true;
  };

  World.prototype.stepCamera = function (dt) {
    var ps = this.players.filter(function (p) { return !p.out; });
    if (!ps.length) return;
    var minX = 1e9, maxX = -1e9;
    for (var i = 0; i < ps.length; i++) { minX = Math.min(minX, ps[i].x); maxX = Math.max(maxX, ps[i].x); }
    var c = this.cam, target = c.x;
    if (maxX > c.x + C.VIEW_W - C.CAM_MARGIN - 200) target = maxX - (C.VIEW_W - C.CAM_MARGIN - 200);
    if (minX < c.x + C.CAM_MARGIN) target = Math.min(target, minX - C.CAM_MARGIN);
    var b = this.bounds(), hi = Math.min(b[1] - C.VIEW_W, c.lockMax === null ? 1e9 : c.lockMax);
    var lo = c.lockMin === undefined || c.lockMin === null ? b[0] : c.lockMin;
    target = clamp(target, lo, Math.max(lo, hi));
    c.x += (target - c.x) * Math.min(1, dt * 6);
  };

  // istantanea di ingresso area: salute, armi, furia e punteggio coerenti (Q18)
  World.prototype.snapshot = function () {
    return {
      players: this.players.map(function (p) { return { hp: p.hp, fury: p.fury, weapon: p.weapon ? { type: p.weapon.type, dur: p.weapon.dur } : null }; }),
      score: this.score.slice()
    };
  };
  World.prototype.restore = function (s, assist) {
    for (var i = 0; i < this.players.length; i++) {
      var p = this.players[i], r = s.players[i];
      p.hp = assist ? p.maxhp : Math.max(r.hp, Math.round(p.maxhp * 0.5)); p.fury = r.fury; p.weapon = r.weapon ? { type: r.weapon.type, dur: r.weapon.dur } : null;
      p.out = false; p.koT = 0; p.reviveProg = 0; p.att = null; p.grabbed = null; p.setState('idle'); p.protect = 1; p.z = 0;
    }
    this.score = s.score.slice();
    this.enemies = []; this.items = []; this.projectiles = []; this.attackers = 0; this.failed = false;
  };
})();
