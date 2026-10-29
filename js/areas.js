// Aree giocabili del nucleo: C4-02 e C4-03 secondo docs/LEVELS.md.
// Contratto area: id, tipo, ambiente, bounds, incontri, props, pickup, obiettivo, checkpoint, uscita, flag.
'use strict';
var W = window.W;

W.AREAS = {
  'C4-02': {
    id: 'C4-02', chapter: 'C4', name: 'Sentiero con panchine', type: 'arena', env: 'park_path',
    width: 2560, floor: [450, 680], next: 'C4-03', flagOnClear: 'furies_path_clear',
    objective: 'Attraversa il sentiero',
    tutorial: [
      { at: 0.5, until: 7, text: 'Muoviti {move} · Leggero {light} · Pesante {heavy} · Salto {jump} · Schivata {dodge} · Presa/raccogli {interact} · Corsa: doppio tocco' },
      { flag: 'firstBat', until: 9, text: 'Disarmo: pesante ({heavy}) mentre il nemico si riprende dallo swing, oppure presa ({interact}); poi {interact} raccoglie la mazza' }
    ],
    props: [
      { kind: 'bench', x0: 640, x1: 790, y0: 466, y1: 488, solid: true },
      { kind: 'bench', x0: 1500, x1: 1650, y0: 640, y1: 662, solid: true },
      { kind: 'bin', x0: 1120, x1: 1160, y0: 468, y1: 492, solid: true, use: true, label: 'Apri il cestino', contents: { solo: ['drink'], duo: ['drink', 'drink'] } },
      { kind: 'lamp', x: 380, y: 455 }, { kind: 'lamp', x: 1280, y: 455 }, { kind: 'lamp', x: 2180, y: 455 }
    ],
    waves: [
      { trigger: 520, objective: 'Respingi gli inseguitori',
        solo: [['fury_batter', 'R', 520], ['fury_flanker', 'R', 610], ['fury_batter', 'L', 600]],
        duo: [['fury_batter', 'R', 520], ['fury_flanker', 'R', 610], ['fury_batter', 'L', 600], ['fury_batter', 'R', 660], ['fury_flanker', 'L', 480]] }
    ]
  },
  'C4-03': {
    id: 'C4-03', chapter: 'C4', name: 'Radura', type: 'arena', env: 'park_glade',
    width: 2560, floor: [440, 680], next: null, flagOnClear: 'furies_defeated',
    objective: 'Raggiungi la radura',
    tutorial: [],
    props: [
      { kind: 'bench', x0: 900, x1: 1050, y0: 456, y1: 478, solid: true },
      { kind: 'bench', x0: 1900, x1: 2050, y0: 456, y1: 478, solid: true },
      { kind: 'lamp', x: 600, y: 445 }, { kind: 'lamp', x: 1500, y: 445 }, { kind: 'lamp', x: 2300, y: 445 }
    ],
    // kit in deviazione visibile: angolo in basso, lontano dal percorso principale
    items: [{ kind: 'kit', x: 1560, y: 672 }],
    waves: [
      { trigger: 380, objective: 'Ondata A',
        solo: [['fury_batter', 'R', 520], ['fury_batter', 'L', 620], ['fury_flanker', 'R', 600]],
        duo: [['fury_batter', 'R', 520], ['fury_batter', 'L', 620], ['fury_flanker', 'R', 600], ['fury_batter', 'R', 660], ['fury_flanker', 'L', 500]],
        onClear: { solo: [['snack', 1, 560]], duo: [['snack', -1, 560], ['snack', 1, 600]] } },
      { trigger: 1500, objective: 'Il veterano', boss: true,
        solo: [['fury_veteran', 'R', 560], ['fury_batter', 'L', 600]],
        duo: [['fury_veteran', 'R', 560], ['fury_batter', 'L', 600], ['fury_batter', 'R', 640]] }
    ]
  }
};
W.AREA_ORDER = ['C4-02', 'C4-03'];

W.AreaRun = function (def, world) {
  this.def = def; this.id = def.id; this.width = def.width; this.floor = def.floor;
  this.waveIdx = 0; this.fighting = false; this.queue = []; this.done = false; this.exitT = 0; this.t = 0;
  this.objective = def.objective; this.banner = { text: def.chapter + ' · ' + def.name, t: 0 };
  var duo = world.duo();
  world.props = def.props.map(function (p) {
    var o = Object.assign({}, p);
    if (p.contents) o.contents = duo ? p.contents.duo : p.contents.solo;
    return o;
  });
  world.items = (def.items || []).map(function (i) { return { uid: Math.random(), kind: i.kind, x: i.x, y: i.y, t: 0 }; });
  world.exitOpen = false; world.cam.x = 0; world.cam.lockMax = null; world.cam.lockMin = null;
  var f = def.floor;
  for (var i = 0; i < world.players.length; i++) {
    var p = world.players[i]; p.x = 140 + i * 70; p.y = (f[0] + f[1]) / 2 + (i ? 50 : 0); p.face = 1;
  }
};

W.AreaRun.prototype.step = function (w, dt) {
  this.t += dt; this.banner.t += dt;
  var def = this.def, duo = w.duo(), C = W.CFG;
  if (!this.fighting && this.waveIdx < def.waves.length) {
    var wave = def.waves[this.waveIdx];
    var lead = Math.max.apply(null, w.players.map(function (p) { return p.out ? 0 : p.x; }));
    if (lead >= wave.trigger) {
      this.fighting = true; this.objective = wave.objective; this.boss = !!wave.boss;
      this.queue = (duo ? wave.duo : wave.solo).slice();
      // la camera si ferma: arena chiusa finché l'ondata non è conclusa
      w.cam.lockMin = w.cam.x; w.cam.lockMax = w.cam.x;
      w.emit('wave', { idx: this.waveIdx });
    }
  }
  if (this.fighting) {
    var onField = w.enemies.filter(function (e) { return e.alive(); }).length;
    var max = C.MAX_ON_FIELD[duo ? 1 : 0];
    while (this.queue.length && onField < max) {
      var s = this.queue.shift();
      var x = s[1] === 'R' ? w.cam.x + C.VIEW_W + 60 : w.cam.x - 60;
      var e = new W.Enemy(w, s[0], x, s[2]); e.face = s[1] === 'R' ? -1 : 1;
      w.enemies.push(e); onField++;
      if (e.weapon && !w.flags.firstBat) w.flags.firstBat = this.t;
    }
    if (!this.queue.length && onField === 0) {
      var wv = def.waves[this.waveIdx];
      if (wv.onClear) {
        var drops = duo ? wv.onClear.duo : wv.onClear.solo;
        for (var i = 0; i < drops.length; i++) w.items.push({ uid: Math.random(), kind: drops[i][0], x: w.cam.x + C.VIEW_W / 2 + drops[i][1] * 160, y: drops[i][2], t: 0 });
      }
      this.fighting = false; this.waveIdx++;
      w.cam.lockMin = null; w.cam.lockMax = null;
      w.score[0] += 500;
      if (this.waveIdx >= def.waves.length) { w.exitOpen = true; this.objective = 'Prosegui →'; w.flags[def.flagOnClear] = true; w.emit('clear', {}); }
      else this.objective = 'Prosegui →';
    }
  }
  // uscita: tutto il gruppo nella zona e 0,6 s di conferma
  if (w.exitOpen && !this.done) {
    var all = w.players.filter(function (p) { return !p.out; });
    var inZone = all.length && all.every(function (p) { return p.x > def.width - 200 && p.state !== 'ko'; });
    if (inZone) { this.exitT += dt; if (this.exitT >= C.EXIT_CONFIRM) { this.done = true; w.emit('exit', {}); } }
    else this.exitT = 0;
  }
};

W.AreaRun.prototype.bossEnemy = function (w) {
  for (var i = 0; i < w.enemies.length; i++) if (w.enemies[i].def.elite && w.enemies[i].alive()) return w.enemies[i];
  return null;
};
