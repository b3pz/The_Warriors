// Personaggi non giocanti, scene con sottotitoli e video sostituibili.
// Una scena è una lista di comandi; ogni scena ha un ID (cine_*/dlg_*) e, se in W.VIDEOS esiste
// un file per quell'ID, il video sostituisce la scena con gli sprite (stessi flag alla fine).
'use strict';
var W = window.W;

(function () {
  var C = W.CFG;
  function sign(v) { return v < 0 ? -1 : 1; }

  // ------------------------------------------------------------------ PNG: comparse, compagni al seguito, attori di scena
  function Npc(world, id, set, x, y, face) {
    this.world = world; this.id = id; this.set = set || id; this.x = x; this.y = y; this.z = 0; this.face = face || 1;
    this.state = 'idle'; this.st = 0; this.anim = Math.random() * 3; this.uid = 'npc_' + id;
    this.move = null; this.follow = null; this.followOff = 0; this.hidden = false; this.npc = true; this.pose = null;
    var ch = W.rosterById(id); this.name = ch ? ch.name : (W.NPC_NAMES[id] || id);
    if (this.set === 'hearse') { this.vehicle = true; this.name = ''; }
    if (this.set === 'tagstone') { this.vehicle = true; this.name = ''; }   // la lapide con il logo di Rembrandt   // il carro funebre dei Rogues
  }
  W.Npc = Npc;
  Npc.prototype.update = function (dt) {
    this.st += dt; this.anim += dt;
    var moving = false;
    if (this.move) {
      var m = this.move; m.t += dt;
      var k = Math.min(1, m.t / m.dur);
      this.x = m.x0 + (m.x1 - m.x0) * k; this.y = m.y0 + (m.y1 - m.y0) * k;
      if (Math.abs(m.x1 - m.x0) > 2) this.face = sign(m.x1 - m.x0);
      moving = k < 1;
      if (k >= 1) this.move = null;
    } else if (this.follow) {
      // compagni al seguito in formazione: ognuno ha un posto suo (fila e corsia) dietro a chi guida, senza ammucchiarsi.
      // Chi va avanti (Fox) sta davanti; quando il capo si ferma, il gruppo si ferma sparso; nessuno si sovrappone agli altri.
      var f = this.follow, w = this.world, fl = (w.area && w.area.floor) || [470, 680], P = FOLLOW_STYLE[this.id] || FOLLOW_STYLE._;
      var depth = fl[1] - fl[0], lanes = [0.18, 0.52, 0.86], k = this.followOff || 0;
      var lane = lanes[(k + 1) % 3], col = Math.floor(k / 3);
      var back = 120 + col * 135 + ((k + 1) % 3 === 1 ? 65 : 0);
      if (P.lead) back = -P.lead;                       // lo scout sta davanti
      if (this.id === 'mercy') { back = 70; lane = 0.7; } // Mercy vicino a chi guida
      if (!this.faceRef || (f.state === 'walk' || f.state === 'run')) this.faceRef = f.face || 1;
      var tx = f.x - back * this.faceRef, ty = fl[0] + 10 + lane * (depth - 20);
      if (w.area) tx = Math.max(40, Math.min(w.area.width - 40, tx));
      // separazione morbida da chiunque sia troppo vicino (compagni e giocatori): si scansa di lato, in profondità
      var others = w.npcs.concat(w.players);
      for (var i = 0; i < others.length; i++) {
        var o = others[i]; if (o === this || o.hidden || o.crowd || (o.npc && !o.follow)) continue;
        var ox = this.x - o.x, oy = this.y - o.y;
        if (Math.abs(ox) < 54 && Math.abs(oy) < 24) { var dirY = oy === 0 ? (this.followOff % 2 ? 1 : -1) : Math.sign(oy); ty += dirY * 26; tx += (ox === 0 ? 1 : Math.sign(ox)) * 18; }
      }
      ty = Math.max(fl[0] + 6, Math.min(fl[1] - 6, ty));
      var dx = tx - this.x, dy = ty - this.y, far = Math.abs(dx) > 420;
      // zona morta ampia: niente passetti avanti e indietro quando è quasi al suo posto
      this.settled = this.settled ? (Math.abs(dx) < 70 && Math.abs(dy) < 34) : (Math.abs(dx) < 24 && Math.abs(dy) < 14);
      if (!this.settled) {
        var sp = far ? 380 : Math.min(P.speed * 1.35, 90 + Math.abs(dx) * 2.2);
        var mx = Math.max(-sp * dt, Math.min(sp * dt, dx)), my = Math.max(-110 * dt, Math.min(110 * dt, dy));
        this.x += mx; this.y += my;
        if (Math.abs(dx) > 8) this.face = sign(dx);
        moving = Math.abs(mx) > 0.4 || Math.abs(my) > 0.4;
      } else {
        this.lookT = (this.lookT || 0) - dt;
        if (this.lookT <= 0) { this.face = Math.random() < 0.7 ? (f.face || 1) : -(f.face || 1); this.lookT = 1.8 + Math.random() * 3; }
      }
      this.y = Math.max(fl[0], Math.min(fl[1], this.y));
    }
    var hop = 0, ps = this.world.props || [];
    for (var hi = 0; hi < ps.length; hi++) { var q = ps[hi]; if (!q.low) continue; var mx = (q.x0 + q.x1) / 2, half = (q.x1 - q.x0) / 2 + 40; if (Math.abs(this.x - mx) < half && this.y > q.y0 - 10 && this.y < q.y1 + 10) hop = Math.max(hop, Math.cos((this.x - mx) / half * Math.PI / 2) * 46); }
    this.z = hop;
    this.state = moving ? 'walk' : 'idle';
  };

  // carattere di ognuno nel gruppo: dove sta rispetto a chi guidi (pixel, positivo = davanti) e passo
  var FOLLOW_STYLE = {
    fox:       { ahead: [120, 320], speed: 250, lead: 150 },   // lo scout va avanti
    cowboy:    { ahead: [-320, -140], speed: 205 },  // resta un po' indietro
    vermin:    { ahead: [-260, -80], speed: 185 },   // si trascina
    snow:      { ahead: [-160, 120], speed: 225 },
    cochise:   { ahead: [-120, 200], speed: 235 },
    ajax:      { ahead: [-60, 220], speed: 225 },
    rembrandt: { ahead: [-220, -40], speed: 215 },
    cleon:     { ahead: [40, 220], speed: 220 },
    swan:      { ahead: [-80, 160], speed: 225 },
    mercy:     { ahead: [-110, -50], speed: 220 },   // vicino a chi guida
    _:         { ahead: [-220, 160], speed: 215 }
  };
  W.NPC_NAMES = { mercy: 'Mercy', cyrus: 'Cyrus', luther: 'Luther', masai: 'Masai', orphan: 'Sully', police: 'Agente',
    lizzie: 'Lizzie', lizzie_b: 'Lizzie', punk: 'Capo Punks', civilian: 'Testimone', officer: 'Poliziotta', riff: 'Riff', rogue: 'Rogue', turnbull: 'Turnbull', fury: 'Fury', crowd: '' };

  // ------------------------------------------------------------------ scena
  function Scene(world, def, opts) {
    this.world = world; this.def = def; this.i = 0; this.wait = 0; this.line = null; this.done = false; this.vars = opts && opts.vars || {};
    this.fade = (opts && opts.fadeIn) ? 1 : 0; this.fadeTo = this.fade; this.fadeSpeed = 1; this.title = null; this.letterbox = def.letterbox !== false;
    this.choice = null; this.cam = null; this.video = null; this.skipped = false; this.clip = null; this.lights = false;
    var vid = W.VIDEOS && def.cine && W.VIDEOS[def.cine];
    if (vid) this.video = { src: vid, started: false };
  }
  W.Scene = Scene;

  Scene.prototype.npc = function (id) {
    var ns = this.world.npcs; for (var i = 0; i < ns.length; i++) if (ns[i].id === id) return ns[i];
    return null;
  };
  Scene.prototype.actor = function (id) {
    return this.npc(id) || this.world.players.filter(function (p) { return p.char.id === id; })[0] || null;
  };

  // input: confirm = avanza la battuta; up/down = scelta
  Scene.prototype.input = function (k) {
    if (this.choice) {
      if (k === 'up') this.choice.sel = (this.choice.sel + this.choice.opts.length - 1) % this.choice.opts.length;
      if (k === 'down') this.choice.sel = (this.choice.sel + 1) % this.choice.opts.length;
      if (k === 'confirm') { this.vars.choice = this.choice.sel; this.line = { who: this.choice.who, text: this.choice.opts[this.choice.sel] }; this.choice = null; this.lineT = 0; }
      return;
    }
    if (k === 'confirm' && this.def.intro && (this.age || 0) > 0.7) { this.wait = 0; return; }   // presentazione della banda: Invio la chiude
    if (k === 'confirm' && this.clip && this.clip.t > 0.4) { this.endClip(); return; }
    if (k === 'confirm' && this.line && this.lineT > 0.25) { this.line = null; }
  };
  // inserto video dentro la scena (W.VIDEOS[id]): la scena si ferma finché la clip finisce, poi riprende. Senza file non succede niente.
  Scene.prototype.startClip = function (id, cap) {
    var src = W.VIDEOS && W.VIDEOS[id]; if (!src) return false;
    if (typeof src === 'object') src = src.src;
    this.clip = { id: id, cap: cap || '', t: 0, el: W.ClipPlayer.open(src) }; return true;
  };
  Scene.prototype.endClip = function () { if (this.clip) { this.clip.el.close(); this.clip = null; } };

  Scene.prototype.skip = function () {
    // applica gli stessi effetti del termine naturale una volta sola
    var w = this.world, st = this.def.steps;
    for (; this.i < st.length; this.i++) {
      var c = st[this.i];
      if (c[0] === 'flag') w.flags[c[1]] = true;
      if (c[0] === 'npc') this.exec(c);
      if (c[0] === 'remove') this.exec(c);
    }
    this.npcEndPositions();
    this.line = null; this.choice = null; this.done = true; this.skipped = true; this.fade = 0;
    if (this.video && this.video.el) this.video.el.stop();
    this.endClip(); this.lights = false;
  };
  Scene.prototype.npcEndPositions = function () { this.world.npcs.forEach(function (n) { if (n.move) { n.x = n.move.x1; n.y = n.move.y1; n.move = null; } }); };

  Scene.prototype.step = function (dt) {
    if (this.done) return;
    this.age = (this.age || 0) + dt;
    if (this.fade !== this.fadeTo) { var d = this.fadeTo - this.fade; this.fade += sign(d) * Math.min(Math.abs(d), dt * this.fadeSpeed); }
    if (this.title) { this.title.t += dt; if (this.title.t > this.title.dur) this.title = null; }
    if (this.wheel) { this.wheel.t += dt; if (this.wheel.t > this.wheel.dur) this.wheel = null; }
    if (this.cam) { var cm = this.cam; cm.t += dt; var kk = Math.min(1, cm.t / cm.dur); this.world.cam.x = cm.x0 + (cm.x1 - cm.x0) * (kk * kk * (3 - 2 * kk)); if (kk >= 1) this.cam = null; }
    if (this.video) {
      if (!this.video.started) { this.video.started = true; this.video.el = W.VideoPlayer.play(this.video.src); }
      if (this.video.el.ended()) { this.skip(); }
      return;
    }
    if (this.clip) { var cp = this.clip; cp.t += dt; if (cp.el.ended() || (cp.t > 6 && !cp.el.ready()) || cp.t > 40) this.endClip(); return; }
    if (this.line) { this.lineT += dt; return; }
    if (this.choice) return;
    if (this.wait > 0) { this.wait -= dt; return; }
    var st = this.def.steps;
    while (this.i < st.length && !this.line && !this.choice && this.wait <= 0) this.exec(st[this.i++]);
    if (this.i >= st.length && !this.line && !this.choice && this.wait <= 0 && !this.title && Math.abs(this.fade - this.fadeTo) < 0.01) this.done = true;
  };

  Scene.prototype.exec = function (c) {
    var w = this.world, n;
    switch (c[0]) {
      case 'say': this.line = { who: c[1], text: c[2] }; this.lineT = 0; w.emit('line', { who: c[1] }); break;
      case 'sayIf': if (this.vars.choice === c[1]) { this.line = { who: c[2], text: c[3] }; this.lineT = 0; } break;
      case 'caption': this.line = { who: '', text: c[1] }; this.lineT = 0; break;
      case 'choice': this.choice = { who: c[1], opts: c[2], sel: 0 }; break;
      case 'wait': this.wait = c[1]; break;
      case 'npc':
        n = this.npc(c[1]);
        if (!n) { n = new Npc(w, c[1], c[2], c[3], c[4], c[5]); w.npcs.push(n); }
        else { n.set = c[2] || n.set; n.x = c[3]; n.y = c[4]; n.face = c[5] || n.face; n.hidden = false; n.follow = null; n.move = null; }
        if (c[6]) n.name = c[6];
        break;
      case 'crowd':
        // comparse: [crowd, prefisso, set[], x0, x1, y0, y1, n, face]
        for (var i = 0; i < c[7]; i++) {
          var sets = c[2], id = c[1] + i;
          if (!this.npc(id)) { var cn = new Npc(w, id, sets[i % sets.length], c[3] + (c[4] - c[3]) * ((i * 37) % c[7]) / c[7], c[5] + (c[6] - c[5]) * ((i * 53) % c[7]) / c[7], c[8] || 1); cn.name = ''; cn.crowd = true; w.npcs.push(cn); }
        }
        break;
      case 'move': n = this.actor(c[1]); if (n) { if (n.npc) n.move = { x0: n.x, y0: n.y, x1: c[2], y1: c[3] === null ? n.y : c[3], dur: c[4] || 1, t: 0 }; else { n.x = c[2]; if (c[3] !== null) n.y = c[3]; } } break;
      case 'moveAll': w.npcs.forEach(function (q) { if (!q.hidden && (!c[3] || q.crowd === (c[3] === 'crowd'))) q.move = { x0: q.x, y0: q.y, x1: q.x + c[1], y1: q.y, dur: c[2], t: 0 }; }); break;
      case 'face': n = this.actor(c[1]); if (n) n.face = c[2]; break;
      case 'pose': n = this.npc(c[1]); if (n) n.pose = c[2]; break;
      case 'remove': w.npcs = w.npcs.filter(function (q) { return q.id !== c[1] && !(c[1] === 'crowd' && q.crowd); }); break;
      case 'raise': n = this.actor(c[1]); if (n) n.z = c[2]; break;   // es. chi si sporge da un finestrino
      case 'clearNpcs': w.npcs = w.npcs.filter(function (q) { return q.keep; }); break;
      case 'cam': this.cam = { x0: w.cam.x, x1: c[1], dur: c[2] || 1, t: 0 }; break;
      case 'fade': this.fadeTo = c[1] === 'out' ? 1 : 0; this.fadeSpeed = 1 / (c[2] || 0.6); if (c[3] !== false) this.wait = c[2] || 0.6; break;
      case 'clip': this.startClip(c[1], c[2]); break;   // [clip, id video, didascalia facoltativa]
      case 'lights': this.lights = !!c[1]; break;          // lampeggianti della polizia ai bordi dell'inquadratura
      case 'wheel': if (this.startClip('v_wonder_wheel', c[2])) break; this.wheel = { t: 0, dur: c[1] || 4, cap: c[2] || '' }; this.wait = c[1] || 4; break;   // inquadratura d'apertura: la Wonder Wheel di notte
      case 'title': this.title = { text: c[1], sub: c[2] || '', dur: c[3] || 2.5, t: 0 }; this.wait = c[3] || 2.5; break;
      case 'flash': w.emit('flashfx', {}); break;
      // cambia l'illustrazione a metà scena (se l'immagine non c'è ancora resta quella di prima): [art, id]
      case 'art': this.artId = c[1]; this.__artT = 0; break;
      // un treno vero (il vagone disegnato) che attraversa la scena sui binari in primo piano: [train, y, durata]
      case 'train': w.sceneTrain = { t: 0, y: c[1] || 700, dur: c[2] || 1.8 }; w.emit('train', {}); break;
      // fiamme vere a terra in un punto della scena: [fire, x, y]
      case 'fire': w.props.push({ kind: 'fire', x0: c[1], x1: c[1] + 24, y0: c[2] - 30, y1: c[2], solid: false, sceneFire: true }); w.emit('fire', {}); break;
      case 'shake': w.emit('shakefx', { amt: c[1] || 8 }); break;
      case 'sfx': w.emit(c[1], { x: w.cam.x + 640, y: 560 }); break;
      case 'flag': w.flags[c[1]] = true; break;
      case 'players': w.players.forEach(function (p) { p.hidden = c[1] === 'hide'; }); break;
      case 'letterbox': this.letterbox = c[1]; break;
    }
  };

  // ------------------------------------------------------------------ video sostituibili
  // Elenco dei video disponibili: js/videos.js (W.VIDEOS = { cine_cyrus: 'assets/video/cine_cyrus.mp4', ... }).
  // clip disegnate dentro il canvas (sopra la scena, sotto didascalie e bande nere), senza audio: la musica del gioco continua
  W.ClipPlayer = {
    open: function (src, loop) {
      var v = document.createElement('video'), ended = false;
      v.muted = true; v.playsInline = true; v.loop = !!loop; v.preload = 'auto'; v.src = src;
      v.onended = function () { ended = true; }; v.onerror = function () { ended = true; };
      var p = v.play(); if (p && p.catch) p.catch(function () {});
      return { v: v, ended: function () { return ended; }, ready: function () { return v.readyState >= 2; }, close: function () { ended = true; try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {} } };
    },
    // video in ciclo riusato (es. la DJ alla radio): uno per ID, si mette in pausa quando non serve
    loops: {},
    loop: function (id) {
      var src = W.VIDEOS && W.VIDEOS[id]; if (!src) return null; if (typeof src === 'object') src = src.src;
      var L = this.loops[id] || (this.loops[id] = this.open(src, true));
      if (L.v.paused && !L.ended()) { var p = L.v.play(); if (p && p.catch) p.catch(function () {}); }
      L.seen = performance.now(); return L.ended() ? null : L;
    },
    idle: function () { for (var k in this.loops) { var L = this.loops[k]; if (performance.now() - (L.seen || 0) > 500 && !L.v.paused) L.v.pause(); } }
  };
  W.VideoPlayer = {
    play: function (src) {
      var v = document.createElement('video'), ended = false;
      v.src = src; v.playsInline = true; v.autoplay = true;
      v.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;object-fit:contain;background:#000;z-index:20';
      v.onended = function () { ended = true; v.remove(); };
      v.onerror = function () { ended = true; v.remove(); };
      document.body.appendChild(v);
      var p = v.play(); if (p && p.catch) p.catch(function () { ended = true; v.remove(); });
      return { ended: function () { return ended; }, stop: function () { ended = true; v.pause(); v.remove(); } };
    }
  };
})();
