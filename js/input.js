// Input astratto: tastiera (layout singolo o due giocatori) e controller.
// Ogni pressione viene registrata con l'istante; le azioni restano nel buffer per W.CFG.BUFFER.
'use strict';
var W = window.W;

W.Input = (function () {
  var ACTIONS = ['light', 'heavy', 'jump', 'dodge', 'interact', 'fury', 'throw'];
  var LAYOUTS = {
    solo: {
      up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
      light: ['KeyJ'], heavy: ['KeyK'], jump: ['Space'], dodge: ['ShiftLeft', 'ShiftRight'], interact: ['KeyE'], fury: ['KeyL'], throw: ['KeyQ']
    },
    p1: {
      up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'],
      light: ['KeyF'], heavy: ['KeyG'], jump: ['Space'], dodge: ['ShiftLeft'], interact: ['KeyR'], fury: ['KeyT'], throw: ['KeyV']
    },
    p2: {
      up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
      light: ['Numpad1'], heavy: ['Numpad2'], jump: ['Numpad0'], dodge: ['ControlRight'], interact: ['Numpad3'], fury: ['Numpad4'], throw: ['Numpad5']
    }
  };
  // Controller standard: X=2 Y=3 A=0 B=1 LB=4 RB=5 RT=7 Start=9
  var PAD = { light: 2, heavy: 3, jump: 0, dodge: 5, interact: 1, fury: 4, throw: 7 };

  var down = {};            // code -> true
  var pressedAt = {};       // code -> time of last keydown
  var now = 0;
  var listeners = [];

  function Device(layoutName, padIndex) {
    this.layout = layoutName; this.pad = padIndex; // pad: null o indice gamepad
    this.buf = {}; this.lastDirTap = { dir: 0, t: -9 }; this.runIntent = false;
    this.prevPad = {}; this.prevDirX = 0;
    this.held = {}; this.edge = {};
    // ignora le pressioni avvenute prima della creazione (es. Invio/J del menu)
    for (var i = 0; i < ACTIONS.length; i++) this.buf['_seen_' + ACTIONS[i]] = now;
  }
  Device.prototype.keys = function (a) { return this.layout ? LAYOUTS[this.layout][a] : []; };
  Device.prototype.isDown = function (a) {
    var ks = this.keys(a);
    for (var i = 0; i < ks.length; i++) if (down[ks[i]]) return true;
    if ((this.layout === 'solo' || this.layout === 'p1') && W.Touch && W.Touch.held[a]) return true;
    return !!this.held[a];
  };
  Device.prototype.poll = function () {
    // controller
    this.held = {}; this.edge = {};
    var ax = 0, ay = 0;
    if (this.pad !== null && navigator.getGamepads) {
      var gp = navigator.getGamepads()[this.pad];
      if (gp) {
        ax = gp.axes[0] || 0; ay = gp.axes[1] || 0;
        if (gp.buttons[14] && gp.buttons[14].pressed) ax = -1;
        if (gp.buttons[15] && gp.buttons[15].pressed) ax = 1;
        if (gp.buttons[12] && gp.buttons[12].pressed) ay = -1;
        if (gp.buttons[13] && gp.buttons[13].pressed) ay = 1;
        for (var a in PAD) {
          var b = gp.buttons[PAD[a]]; var p = !!(b && (b.pressed || b.value > 0.5));
          this.held[a] = p;
          if (p && !this.prevPad[a]) this.buf[a] = now;
          this.prevPad[a] = p;
        }
        var st = gp.buttons[9] && gp.buttons[9].pressed;
        if (st && !this.prevPad.start) this.edge.pause = true;
        this.prevPad.start = st;
      }
    }
    if (Math.abs(ax) > 0.35) this.held[ax < 0 ? 'left' : 'right'] = true;
    if (Math.abs(ay) > 0.35) this.held[ay < 0 ? 'up' : 'down'] = true;
    // keyboard action edges
    for (var i = 0; i < ACTIONS.length; i++) {
      var act = ACTIONS[i], ks = this.keys(act);
      for (var k = 0; k < ks.length; k++) {
        if (pressedAt[ks[k]] !== undefined && pressedAt[ks[k]] > (this.buf['_seen_' + act] || -1)) {
          this.buf[act] = pressedAt[ks[k]]; this.buf['_seen_' + act] = pressedAt[ks[k]];
        }
      }
    }
    // tasti touch: ogni pressione entra nel buffer come un tasto della tastiera
    if ((this.layout === 'solo' || this.layout === 'p1') && W.Touch) {
      for (var ti = 0; ti < ACTIONS.length; ti++) { var ta = ACTIONS[ti], tp = W.Touch.pressed[ta]; if (tp !== undefined && tp > (this.buf['_seen_t_' + ta] || -1)) { this.buf[ta] = tp; this.buf['_seen_t_' + ta] = tp; } }
    }
    // doppio tocco orizzontale = corsa
    var dx = this.axisX();
    if (dx !== 0 && this.prevDirX === 0) {
      if (this.lastDirTap.dir === dx && now - this.lastDirTap.t < 0.25) this.runIntent = true;
      this.lastDirTap = { dir: dx, t: now };
    }
    if (this.prevDirX !== 0 && dx !== this.prevDirX) this.runIntent = false;
    if ((this.layout === 'solo' || this.layout === 'p1') && W.Touch && W.Touch.run()) this.runIntent = true;
    this.prevDirX = dx;
  };
  Device.prototype.axisX = function () { return (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0); };
  Device.prototype.axisY = function () { return (this.isDown('down') ? 1 : 0) - (this.isDown('up') ? 1 : 0); };
  // consuma un'azione se premuta negli ultimi BUFFER secondi
  Device.prototype.take = function (a) {
    var t = this.buf[a];
    if (t !== undefined && t !== null && now - t <= W.CFG.BUFFER) { this.buf[a] = null; return true; }
    return false;
  };
  Device.prototype.peek = function (a) { var t = this.buf[a]; return t !== undefined && t !== null && now - t <= W.CFG.BUFFER; };
  Device.prototype.clear = function () { for (var i = 0; i < ACTIONS.length; i++) this.buf[ACTIONS[i]] = null; };

  window.addEventListener('keydown', function (e) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].indexOf(e.code) >= 0) e.preventDefault();
    if (!down[e.code]) pressedAt[e.code] = now;
    down[e.code] = true;
    for (var i = 0; i < listeners.length; i++) listeners[i](e.code);
  });
  window.addEventListener('keyup', function (e) { down[e.code] = false; });
  window.addEventListener('blur', function () { down = {}; });

  return {
    Device: Device,
    LAYOUTS: LAYOUTS,
    setTime: function (t) { now = t; },
    time: function () { return now; },
    onKey: function (fn) { listeners.push(fn); },
    isDown: function (code) { return !!down[code]; },
    // per i test automatici
    _press: function (code) { if (!down[code]) pressedAt[code] = now; down[code] = true; for (var i = 0; i < listeners.length; i++) listeners[i](code); },
    _release: function (code) { down[code] = false; }
  };
})();

// ------------------------------------------------------------------ comandi touch (telefono e tablet)
// Pochi tasti: joystick mobile a sinistra (compare dove appoggi il pollice), tre tasti fissi a destra
// (COLPO, SALTO, SCHIVA; COLPO tenuto premuto = colpo forte) e tasti che compaiono solo quando servono
// (AZIONE con il nome di ciò che fa, FURIA quando la barra è piena, LANCIA quando hai un'arma). Coordinate logiche 1280×720.
W.Touch = (function () {
  var active = false, held = {}, pressed = {}, stick = null, canvas = null, run = false, lastNav = 0, navDir = 0;
  var HOLD_HEAVY = 0.32, lightHold = null;
  var BTN = [
    { a: 'light', x: 1140, y: 598, r: 72, label: 'COLPO', fixed: true },
    { a: 'jump', x: 1218, y: 452, r: 50, label: 'SALTO', fixed: true },
    { a: 'dodge', x: 1000, y: 660, r: 46, label: 'SCHIVA', fixed: true },
    { a: 'interact', x: 990, y: 520, r: 48, label: 'AZIONE', ctx: 'action' },
    { a: 'fury', x: 1100, y: 430, r: 42, label: 'FURIA', ctx: 'fury' },
    { a: 'throw', x: 1222, y: 330, r: 38, label: 'LANCIA', ctx: 'weapon' },
    { a: 'pause', x: 1232, y: 44, r: 30, label: '❚❚', fixed: true }
  ];
  var HOME = { x: 190, y: 560 }, STICK = { x: 190, y: 560, r: 96 };
  var pointers = {}, info = {}, playingNow = false;
  function toLogical(e) { var r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 1280, y: (e.clientY - r.top) / r.height * 720 }; }
  function visible(b) {
    if (b.fixed) return playingNow || b.a === 'light' || b.a === 'pause';
    if (!playingNow) return b.a === 'interact';            // nei menu: AZIONE = indietro
    return !!info[b.ctx];
  }
  function hit(p) { for (var i = 0; i < BTN.length; i++) { var b = BTN[i]; if (visible(b) && Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.2) return b; } return null; }
  function setStick(p) {
    var dx = p.x - STICK.x, dy = p.y - STICK.y, m = Math.hypot(dx, dy), k = m > STICK.r ? STICK.r / m : 1;
    stick = { dx: dx * k, dy: dy * k };
    var nx = stick.dx / STICK.r, ny = stick.dy / STICK.r;
    held.left = nx < -0.35; held.right = nx > 0.35; held.up = ny < -0.35; held.down = ny > 0.35;
    run = Math.abs(nx) > 0.92;
  }
  function clearStick() { stick = null; held.left = held.right = held.up = held.down = false; run = false; STICK.x = HOME.x; STICK.y = HOME.y; }
  function down(e) {
    if (e.pointerType === 'mouse') return;
    active = true; e.preventDefault();
    try { if (!document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {}); } catch (x) {}
    var p = toLogical(e), b = hit(p);
    if (b) {
      pointers[e.pointerId] = { btn: b }; held[b.a] = true; pressed[b.a] = W.Input.time(); W.Touch.onButton && W.Touch.onButton(b.a);
      if (b.a === 'light' && playingNow) lightHold = { t0: W.Input.time(), fired: false, id: e.pointerId };
    } else if (p.x < 620) {
      // joystick mobile: il centro è dove appoggi il pollice
      STICK.x = Math.max(110, Math.min(520, p.x)); STICK.y = Math.max(300, Math.min(640, p.y));
      pointers[e.pointerId] = { stick: true }; setStick(p);
    }
  }
  function move(e) { var pt = pointers[e.pointerId]; if (pt && pt.stick) { e.preventDefault(); setStick(toLogical(e)); } }
  function up(e) {
    var pt = pointers[e.pointerId]; if (!pt) return;
    if (pt.btn) { held[pt.btn.a] = false; if (pt.btn.a === 'light') { lightHold = null; held.heavy = false; } }
    if (pt.stick) clearStick(); delete pointers[e.pointerId];
  }
  function label(b) {
    if (!playingNow) return b.a === 'light' ? 'OK' : b.a === 'interact' ? 'INDIETRO' : b.label;
    if (b.a === 'interact' && info.action) return info.action;
    return b.label;
  }
  return {
    attach: function (cv) {
      canvas = cv; cv.style.touchAction = 'none';
      cv.addEventListener('pointerdown', down, { passive: false }); window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
      if ('ontouchstart' in window || (window.matchMedia && matchMedia('(pointer: coarse)').matches)) active = true;
    },
    active: function () { return active; },
    held: held, pressed: pressed, run: function () { return run; },
    // a ogni fotogramma: COLPO tenuto premuto diventa un colpo forte
    update: function (now) {
      if (lightHold && !lightHold.fired && now - lightHold.t0 >= HOLD_HEAVY) { lightHold.fired = true; pressed.heavy = now; held.heavy = true; }
    },
    // stato del giocatore per i tasti che compaiono solo quando servono
    setInfo: function (o) { info = o || {}; },
    // navigazione dei menu con il joystick: una mossa ogni 0,28 s
    navTick: function (now, onKey) {
      if (!active || !stick) { navDir = 0; return; }
      var dir = held.up ? -1 : held.down ? 1 : 0, h = held.left ? -1 : held.right ? 1 : 0;
      if ((dir || h) && (now - lastNav > 0.28 || (dir * 10 + h) !== navDir)) { lastNav = now; navDir = dir * 10 + h; onKey(dir < 0 ? 'ArrowUp' : dir > 0 ? 'ArrowDown' : h < 0 ? 'ArrowLeft' : 'ArrowRight'); }
      if (!dir && !h) navDir = 0;
    },
    draw: function (ctx, playing, portrait) {
      playingNow = !!playing;
      if (!active) return;
      ctx.save();
      if (portrait) {
        ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(0, 0, 1280, 720); ctx.fillStyle = '#fff'; ctx.font = '700 48px "Oswald", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Ruota il telefono in orizzontale', 640, 360); ctx.restore(); return;
      }
      // joystick: appena accennato a riposo, pieno quando lo usi
      ctx.globalAlpha = stick ? 0.55 : 0.22;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(STICK.x, STICK.y, STICK.r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(STICK.x + (stick ? stick.dx : 0), STICK.y + (stick ? stick.dy : 0), 40, 0, Math.PI * 2); ctx.fill();
      var now = W.Input.time();
      BTN.forEach(function (b) {
        if (!visible(b)) return;
        var ctxBtn = !b.fixed, pulse = ctxBtn ? 0.08 * Math.sin(now * 6) : 0;
        ctx.globalAlpha = (b.fixed ? 0.5 : 0.75) + pulse;
        ctx.fillStyle = held[b.a] ? 'rgba(214,40,40,0.8)' : b.a === 'fury' ? 'rgba(200,140,30,0.7)' : ctxBtn ? 'rgba(40,90,140,0.7)' : 'rgba(20,20,26,0.55)';
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 3; ctx.stroke();
        // anello di carica del colpo forte
        if (b.a === 'light' && lightHold) { var k = Math.min(1, (now - lightHold.t0) / HOLD_HEAVY); ctx.strokeStyle = k >= 1 ? '#ffd36a' : 'rgba(255,211,106,0.8)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 7, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke(); }
        var t = label(b); ctx.fillStyle = '#fff'; ctx.font = '700 ' + Math.max(13, Math.round(b.r * (t.length > 7 ? 0.26 : 0.34))) + 'px "Oswald", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(t, b.x, b.y + 6);
        if (b.a === 'light' && playing) { ctx.font = '500 13px "Oswald", sans-serif'; ctx.globalAlpha = 0.6; ctx.fillText('tieni = forte', b.x, b.y + 26); }
      });
      ctx.restore();
    }
  };
})();
